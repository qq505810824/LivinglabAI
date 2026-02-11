import { useCallback, useEffect, useRef, useState } from 'react';

interface ASRToken {
    token: string;
    expireTime: number;
    appKey: string;
    region: string;
}

interface UseAliyunASROptions {
    language?: string; // 语言代码，如 'zh'、'en'
    sampleRate?: number; // 采样率，如 16000
    format?: string; // 音频格式，如 'pcm'
    onPartialResult?: (text: string) => void; // 部分识别结果回调
    onFinalResult?: (text: string) => void; // 最终识别结果回调
    onError?: (error: Error) => void; // 错误回调
}

// 生成 message_id（阿里云要求：32位十六进制字符串，不带连字符）
function generateMessageId(): string {
    // 生成 32 位十六进制字符串（类似 UUID 但无连字符）
    const chars = '0123456789abcdef';
    let result = '';
    for (let i = 0; i < 32; i++) {
        result += chars[Math.floor(Math.random() * 16)];
    }
    return result;
}

export const useAliyunASR = (options: UseAliyunASROptions = {}) => {
    const {
        language = 'zh',
        sampleRate = 16000,
        format = 'pcm',
        onPartialResult,
        onFinalResult,
        onError,
    } = options;

    const [isConnected, setIsConnected] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [error, setError] = useState<string | null>(null);

    const wsRef = useRef<WebSocket | null>(null);
    const tokenRef = useRef<ASRToken | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const processorRef = useRef<ScriptProcessorNode | null>(null);
    const isStartSentRef = useRef<boolean>(false); // 标记是否已发送 StartTranscription
    const taskIdRef = useRef<string | null>(null);
    const stopTimeoutRef = useRef<NodeJS.Timeout | null>(null); // 用于超时关闭连接

    // 获取 Token
    const fetchToken = useCallback(async (): Promise<ASRToken> => {
        try {
            const response = await fetch('/api/asr/token');
            const data = await response.json();

            if (!data.success) {
                throw new Error(data.message || 'Failed to fetch token');
            }

            return data.data;
        } catch (err) {
            throw new Error(`Failed to fetch ASR token: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
    }, []);

    // 初始化 WebSocket 连接
    const connect = useCallback(async () => {
        try {
            // 获取 Token
            const tokenData = await fetchToken();
            console.log('tokenData', tokenData);
            tokenRef.current = tokenData;

            // 构建 WebSocket URL
            const wsUrl = `wss://nls-gateway.${tokenData.region}.aliyuncs.com/ws/v1?token=${tokenData.token}`;

            const ws = new WebSocket(wsUrl);
            wsRef.current = ws;

            ws.onopen = () => {
                console.log('Aliyun ASR WebSocket connected');
                setIsConnected(true);
                setError(null);
                isStartSentRef.current = false; // 重置标记
                taskIdRef.current = generateMessageId();
                // 延迟一小段时间确保连接完全建立，然后发送 StartTranscription
                setTimeout(() => {
                    if (ws.readyState === WebSocket.OPEN && !isStartSentRef.current) {
                        const startParams = {
                            header: {
                                appkey: tokenData.appKey,
                                message_id: generateMessageId(), // 使用 32 位十六进制字符串
                                task_id: taskIdRef.current, // 使用 32 位十六进制字符串
                                namespace: 'SpeechTranscriber',
                                name: 'StartTranscription',
                                status: 3, // 3 表示请求
                            },
                            payload: {
                                appkey: tokenData.appKey,
                                format: format,
                                sample_rate: sampleRate,
                                enable_intermediate_result: true, // 启用中间结果
                                enable_punctuation_prediction: true, // 启用标点预测
                                enable_inverse_text_normalization: true, // 启用ITN
                            },
                        };

                        console.log('Sending StartTranscription:', JSON.stringify(startParams, null, 2));
                        ws.send(JSON.stringify(startParams));
                        isStartSentRef.current = true;
                    }
                }, 100); // 延迟 100ms
            };

            ws.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    const { header, payload } = message || {};

                    // 安全检查：确保 header 存在
                    if (!header || !header.name) {
                        console.warn('Received message without header:', message);
                        return;
                    }

                    // 处理 StartTranscription 的响应
                    if (header.name === 'StartTranscription') {
                        console.log('StartTranscription response received:', message);
                        if (header.status !== 20000000) {
                            // StartTranscription 失败
                            const errorMsg =
                                header.status_text ||
                                payload?.message ||
                                `StartTranscription failed with status: ${header.status || 'unknown'}`;
                            const error = new Error(errorMsg);
                            setError(errorMsg);
                            onError?.(error);
                            console.error('StartTranscription failed:', {
                                status: header.status,
                                status_text: header.status_text,
                                payload,
                            });
                        } else {
                            console.log('StartTranscription successful, ready to receive audio');
                        }
                        return;
                    }

                    if (header.name === 'TranscriptionResultChanged') {
                        // 中间结果（部分识别）
                        const text = payload?.result || '';
                        setTranscript(text);
                        onPartialResult?.(text);
                    } else if (header.name === 'TranscriptionCompleted') {
                        // 最终结果
                        console.log('TranscriptionCompleted received:', message);
                        const text = payload?.result || '';
                        setTranscript(text);
                        onFinalResult?.(text);
                    } else if (header.name === 'StopTranscription') {
                        // StopTranscription 响应
                        console.log('StopTranscription response received:', message);
                        // 清除超时定时器
                        if (stopTimeoutRef.current) {
                            clearTimeout(stopTimeoutRef.current);
                            stopTimeoutRef.current = null;
                        }
                        // 收到响应后关闭 WebSocket 连接
                        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                            console.log('Closing WebSocket after StopTranscription response');
                            wsRef.current.close();
                        }
                        return;
                    } else if (header.name === 'TaskFailed') {
                        // 任务失败
                        // 错误信息可能在 header.status_text、payload.message 或 header.message 中
                        const errorMsg =
                            header.status_text ||
                            payload?.message ||
                            payload?.error ||
                            header.message ||
                            `Task failed with status: ${header.status || 'unknown'}`;
                        const error = new Error(errorMsg);
                        setError(errorMsg);
                        onError?.(error);
                        console.error('TaskFailed:', {
                            status: header.status,
                            status_text: header.status_text,
                            message: header.message,
                            payload,
                        });
                    } else if (header.name === 'SentenceBegin') {
                        // 句子开始
                        console.log('Sentence begin', payload);
                    } else if (header.name === 'SentenceEnd') {
                        // 句子结束
                        console.log('Sentence end', payload);
                        const text = payload?.result || '';
                        setTranscript(text);
                        onFinalResult?.(text);
                    } else {
                        // 其他消息类型，记录日志以便调试
                        console.log('Received message:', header.name, payload);
                    }
                } catch (err) {
                    console.error('Error parsing WebSocket message:', err);
                    console.error('Raw message data:', event.data);
                }
            };

            ws.onerror = (event) => {
                console.error('WebSocket error:', event);
                const error = new Error('WebSocket connection error');
                setError(error.message);
                onError?.(error);
            };

            ws.onclose = () => {
                console.log('Aliyun ASR WebSocket closed');
                setIsConnected(false);
                isStartSentRef.current = false; // 重置标记
                taskIdRef.current = null; // 重置 task_id
                // 清除超时定时器
                if (stopTimeoutRef.current) {
                    clearTimeout(stopTimeoutRef.current);
                    stopTimeoutRef.current = null;
                }
            };
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Unknown error');
            setError(error.message);
            onError?.(error);
        }
    }, [fetchToken, format, sampleRate, onPartialResult, onFinalResult, onError]);

    // 开始录音并发送音频流
    const startRecording = useCallback(async () => {
        try {
            if (!isConnected || !wsRef.current) {
                await connect();
                // 等待连接建立
                await new Promise((resolve) => setTimeout(resolve, 500));
            }

            // 获取麦克风权限
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    sampleRate: sampleRate,
                    channelCount: 1,
                    echoCancellation: true,
                    noiseSuppression: true,
                },
            });

            mediaStreamRef.current = stream;

            // 创建 AudioContext
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
                sampleRate: sampleRate,
            });
            audioContextRef.current = audioContext;

            // 创建音频源
            const source = audioContext.createMediaStreamSource(stream);

            // 创建 ScriptProcessorNode（用于处理音频数据）
            const processor = audioContext.createScriptProcessor(4096, 1, 1);
            processorRef.current = processor;

            processor.onaudioprocess = (event) => {
                // 注意：这里不能使用 isRecording 状态，因为闭包问题
                // 直接检查 WebSocket 状态即可
                if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
                    return;
                }

                const inputData = event.inputBuffer.getChannelData(0);

                // 转换为 Int16 PCM
                const pcmData = new Int16Array(inputData.length);
                for (let i = 0; i < inputData.length; i++) {
                    // 将 Float32 (-1.0 到 1.0) 转换为 Int16 (-32768 到 32767)
                    const s = Math.max(-1, Math.min(1, inputData[i]));
                    pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
                }

                // 发送音频数据到阿里云
                if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                    wsRef.current.send(pcmData.buffer);
                }
            };

            source.connect(processor);
            processor.connect(audioContext.destination);

            setIsRecording(true);
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Failed to start recording');
            setError(error.message);
            onError?.(error);
        }
    }, [isConnected, connect, sampleRate, onError]);

    // 停止录音
    const stopRecording = useCallback(() => {
        setIsRecording(false);

        // 停止音频流
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach((track) => track.stop());
            mediaStreamRef.current = null;
        }

        // 断开音频处理
        if (processorRef.current) {
            processorRef.current.disconnect();
            processorRef.current = null;
        }

        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }

        // 发送停止命令
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            const stopParams = {
                header: {
                    appkey: tokenRef.current?.appKey,
                    message_id: generateMessageId(), // 使用 32 位十六进制字符串
                    task_id: taskIdRef.current, // 使用 32 位十六进制字符串
                    namespace: 'SpeechTranscriber',
                    name: 'StopTranscription',
                    status: 3, // 3 表示请求
                },
            };
            console.log('Sending StopTranscription:', JSON.stringify(stopParams, null, 2));
            wsRef.current.send(JSON.stringify(stopParams));

            // 设置超时：如果 3 秒内没有收到 StopTranscription 响应，强制关闭连接
            stopTimeoutRef.current = setTimeout(() => {
                console.warn('StopTranscription response timeout, closing WebSocket');
                if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                    wsRef.current.close();
                }
                stopTimeoutRef.current = null;
            }, 3000); // 3 秒超时
        }
    }, []);

    // 断开连接
    const disconnect = useCallback(() => {
        stopRecording();

        // 清除超时定时器
        if (stopTimeoutRef.current) {
            clearTimeout(stopTimeoutRef.current);
            stopTimeoutRef.current = null;
        }

        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }

        setIsConnected(false);
        isStartSentRef.current = false; // 重置标记
        taskIdRef.current = null; // 重置 task_id
    }, [stopRecording]);

    // 清理资源
    useEffect(() => {
        return () => {
            disconnect();
        };
    }, [disconnect]);

    return {
        isConnected,
        isRecording,
        transcript,
        error,
        connect,
        startRecording,
        stopRecording,
        disconnect,
    };
};
