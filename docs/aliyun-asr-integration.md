# 阿里云实时语音识别（Streaming ASR）对接指南

> 本文档详细说明如何在 Next.js + Vercel 架构下对接阿里云实时语音识别服务，实现 Streaming ASR 功能。

---

## 一、服务开通与准备

### 1.1 开通阿里云智能语音交互服务

1. **登录阿里云控制台**
   - 访问：https://ecs.console.aliyun.com/
   - 使用阿里云账号登录

2. **开通智能语音交互服务**
   - 进入「产品与服务」→ 搜索「智能语音交互」
   - 或直接访问：https://ai.aliyun.com/voicedialog
   - 点击「立即开通」，选择「实时语音识别」功能

3. **创建应用**
   - 在智能语音交互控制台创建新应用
   - 记录应用名称和 AppKey（后续会用到）

### 1.2 获取认证信息

需要获取以下信息：

- **AccessKey ID**：在「AccessKey 管理」中创建或查看
- **AccessKey Secret**：与 AccessKey ID 配对
- **AppKey**：在应用管理页面获取
- **服务区域**：选择离用户最近的区域（如 `cn-shanghai`、`cn-beijing`）

> **安全提示**：AccessKey Secret 是敏感信息，**绝对不能**暴露在前端代码中，必须通过后端 API 进行鉴权。

---

## 二、阿里云实时语音识别 API 概览

### 2.1 服务特点

- **协议**：WebSocket（长连接）
- **音频格式**：PCM、WAV、OPUS 等
- **采样率**：支持 8kHz、16kHz、48kHz
- **实时性**：支持流式识别，延迟低（通常 < 500ms）
- **语言支持**：中文、英文等多语言

### 2.2 API 端点

- **WebSocket 地址**：
  ```
  wss://nls-gateway.cn-shanghai.aliyuncs.com/ws/v1
  ```
  （根据选择的区域调整域名）

- **Token 获取地址**（用于鉴权）：
  ```
  https://nls-meta.cn-shanghai.aliyuncs.com/
  ```

---

## 三、后端 API 实现（Next.js API Routes）

### 3.1 安装依赖

```bash
npm install @alicloud/nls-sdk
# 或
npm install crypto-js  # 用于签名计算
```

### 3.2 创建 Token 生成 API

**文件**：`src/app/api/asr/token/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import CryptoJS from 'crypto-js';

// 从环境变量获取配置
const ACCESS_KEY_ID = process.env.ALIYUN_ACCESS_KEY_ID || '';
const ACCESS_KEY_SECRET = process.env.ALIYUN_ACCESS_KEY_SECRET || '';
const APP_KEY = process.env.ALIYUN_ASR_APP_KEY || '';
const REGION = process.env.ALIYUN_REGION || 'cn-shanghai';

// 生成阿里云 NLS Token
async function generateNLSToken() {
    const timestamp = Date.now();
    const nonce = Math.random().toString(36).substring(2, 15);
    
    // 构建签名字符串
    const signString = `GET\n/\nAccessKeyId=${ACCESS_KEY_ID}&Action=CreateToken&Format=JSON&RegionId=${REGION}&SignatureMethod=HMAC-SHA1&SignatureNonce=${nonce}&SignatureVersion=1.0&Timestamp=${encodeURIComponent(new Date(timestamp).toISOString())}&Version=2019-02-28`;
    
    // 计算签名
    const signature = CryptoJS.HmacSHA1(signString, ACCESS_KEY_SECRET + '&').toString(CryptoJS.enc.Base64);
    
    // 构建请求 URL
    const url = `https://nls-meta.${REGION}.aliyuncs.com/?AccessKeyId=${ACCESS_KEY_ID}&Action=CreateToken&Format=JSON&RegionId=${REGION}&SignatureMethod=HMAC-SHA1&SignatureNonce=${nonce}&SignatureVersion=1.0&Timestamp=${encodeURIComponent(new Date(timestamp).toISOString())}&Version=2019-02-28&Signature=${encodeURIComponent(signature)}`;
    
    try {
        const response = await fetch(url, {
            method: 'GET',
        });
        
        const data = await response.json();
        
        if (data.Token) {
            return {
                token: data.Token.Id,
                expireTime: data.Token.ExpireTime,
            };
        }
        
        throw new Error('Failed to generate token');
    } catch (error) {
        console.error('Error generating NLS token:', error);
        throw error;
    }
}

// GET /api/asr/token - 获取阿里云 ASR Token
export async function GET(request: NextRequest) {
    try {
        // 验证环境变量
        if (!ACCESS_KEY_ID || !ACCESS_KEY_SECRET || !APP_KEY) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Configuration error',
                    message: 'Aliyun ASR credentials not configured',
                },
                { status: 500 }
            );
        }

        const tokenData = await generateNLSToken();

        return NextResponse.json({
            success: true,
            data: {
                token: tokenData.token,
                expireTime: tokenData.expireTime,
                appKey: APP_KEY,
                region: REGION,
            },
        });
    } catch (error) {
        console.error('Error in GET /api/asr/token:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}
```

### 3.3 环境变量配置

在 `.env.local` 中添加：

```bash
# 阿里云 ASR 配置
ALIYUN_ACCESS_KEY_ID=your_access_key_id
ALIYUN_ACCESS_KEY_SECRET=your_access_key_secret
ALIYUN_ASR_APP_KEY=your_app_key
ALIYUN_REGION=cn-shanghai
```

---

## 四、前端实现（React Hook）

### 4.1 创建 useAliyunASR Hook

**文件**：`src/hooks/useAliyunASR.ts`

```typescript
import { useState, useCallback, useRef, useEffect } from 'react';

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
            tokenRef.current = tokenData;

            // 构建 WebSocket URL
            const wsUrl = `wss://nls-gateway.${tokenData.region}.aliyuncs.com/ws/v1?token=${tokenData.token}`;
            
            const ws = new WebSocket(wsUrl);
            wsRef.current = ws;

            ws.onopen = () => {
                console.log('Aliyun ASR WebSocket connected');
                setIsConnected(true);
                setError(null);

                // 发送启动参数
                const startParams = {
                    header: {
                        message_id: `start_${Date.now()}`,
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

                ws.send(JSON.stringify(startParams));
            };

            ws.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    const { header, payload } = message;

                    if (header.name === 'TranscriptionResultChanged') {
                        // 中间结果（部分识别）
                        const text = payload.result;
                        setTranscript(text);
                        onPartialResult?.(text);
                    } else if (header.name === 'TranscriptionCompleted') {
                        // 最终结果
                        const text = payload.result;
                        setTranscript(text);
                        onFinalResult?.(text);
                    } else if (header.name === 'TaskFailed') {
                        // 任务失败
                        const errorMsg = payload.message || 'Transcription failed';
                        const error = new Error(errorMsg);
                        setError(errorMsg);
                        onError?.(error);
                    }
                } catch (err) {
                    console.error('Error parsing WebSocket message:', err);
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
                if (!isRecording || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
                    return;
                }

                const inputData = event.inputBuffer.getChannelData(0);
                
                // 转换为 Int16 PCM
                const pcmData = new Int16Array(inputData.length);
                for (let i = 0; i < inputData.length; i++) {
                    // 将 Float32 (-1.0 到 1.0) 转换为 Int16 (-32768 到 32767)
                    const s = Math.max(-1, Math.min(1, inputData[i]));
                    pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
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
                    message_id: `stop_${Date.now()}`,
                    namespace: 'SpeechTranscriber',
                    name: 'StopTranscription',
                    status: 3,
                },
            };
            wsRef.current.send(JSON.stringify(stopParams));
        }
    }, []);

    // 断开连接
    const disconnect = useCallback(() => {
        stopRecording();

        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }

        setIsConnected(false);
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
```

### 4.2 使用示例

**文件**：`src/components/meeting/AliyunASRView.tsx`

```typescript
'use client';

import { useAliyunASR } from '@/hooks/useAliyunASR';
import { Mic, MicOff } from 'lucide-react';
import { useState } from 'react';

export const AliyunASRView = () => {
    const [finalText, setFinalText] = useState('');

    const {
        isConnected,
        isRecording,
        transcript,
        error,
        connect,
        startRecording,
        stopRecording,
        disconnect,
    } = useAliyunASR({
        language: 'zh',
        sampleRate: 16000,
        format: 'pcm',
        onPartialResult: (text) => {
            console.log('Partial result:', text);
        },
        onFinalResult: (text) => {
            console.log('Final result:', text);
            setFinalText(text);
            // 这里可以将最终文本发送到 Dify / LLM
        },
        onError: (error) => {
            console.error('ASR error:', error);
        },
    });

    const handleToggleRecording = async () => {
        if (isRecording) {
            stopRecording();
        } else {
            if (!isConnected) {
                await connect();
            }
            await startRecording();
        }
    };

    return (
        <div className="flex flex-col items-center gap-4 p-6">
            {/* 连接状态 */}
            <div className="text-sm text-gray-600">
                状态: {isConnected ? '已连接' : '未连接'}
            </div>

            {/* 错误提示 */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded">
                    {error}
                </div>
            )}

            {/* 实时识别文本 */}
            <div className="w-full max-w-2xl bg-gray-50 rounded-lg p-4 min-h-[100px]">
                <div className="text-sm text-gray-500 mb-2">实时识别：</div>
                <div className="text-lg text-gray-900">{transcript || '等待说话...'}</div>
            </div>

            {/* 最终识别文本 */}
            {finalText && (
                <div className="w-full max-w-2xl bg-green-50 rounded-lg p-4">
                    <div className="text-sm text-gray-500 mb-2">最终结果：</div>
                    <div className="text-lg text-gray-900">{finalText}</div>
                </div>
            )}

            {/* 控制按钮 */}
            <div className="flex gap-4">
                <button
                    onClick={handleToggleRecording}
                    disabled={!isConnected && !isRecording}
                    className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                        isRecording
                            ? 'bg-red-500 text-white hover:bg-red-600'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50'
                    }`}
                >
                    {isRecording ? (
                        <>
                            <MicOff className="w-5 h-5 inline mr-2" />
                            停止录音
                        </>
                    ) : (
                        <>
                            <Mic className="w-5 h-5 inline mr-2" />
                            开始录音
                        </>
                    )}
                </button>

                <button
                    onClick={disconnect}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                    断开连接
                </button>
            </div>
        </div>
    );
};
```

---

## 五、与现有系统集成

### 5.1 替换 Dify 转录逻辑

在 `useVoiceConversation.ts` 中，可以将 Dify 转录替换为阿里云 ASR：

```typescript
import { useAliyunASR } from '@/hooks/useAliyunASR';

// 在组件中使用
const {
    transcript,
    startRecording,
    stopRecording,
    onFinalResult,
} = useAliyunASR({
    onFinalResult: async (text) => {
        // 最终识别结果 → 发送到 Dify / LLM
        await sendMessage({
            transcriptionText: text,
            // ... 其他参数
        });
    },
});
```

### 5.2 环境变量配置

在 Vercel 项目设置中添加环境变量：

1. 进入 Vercel 项目设置
2. 选择「Environment Variables」
3. 添加以下变量：
   - `ALIYUN_ACCESS_KEY_ID`
   - `ALIYUN_ACCESS_KEY_SECRET`
   - `ALIYUN_ASR_APP_KEY`
   - `ALIYUN_REGION`

---

## 六、注意事项与最佳实践

### 6.1 安全建议

1. **Token 管理**
   - Token 有时效性（通常 24 小时），需要定期刷新
   - 建议在 Token 过期前重新获取

2. **AccessKey 保护**
   - 绝对不要在前端代码中暴露 AccessKey
   - 使用环境变量存储敏感信息
   - 定期轮换 AccessKey

### 6.2 性能优化

1. **音频格式选择**
   - 推荐使用 PCM 格式，延迟最低
   - 采样率 16kHz 适合中文识别，平衡质量和延迟

2. **连接管理**
   - 复用 WebSocket 连接，避免频繁建立/断开
   - 实现连接池（如需要多路并发）

3. **错误处理**
   - 实现自动重连机制
   - 处理网络波动和 Token 过期

### 6.3 成本控制

1. **用量监控**
   - 在阿里云控制台设置用量告警
   - 定期检查账单，避免意外费用

2. **优化策略**
   - 合理设置识别时长限制
   - 对于非实时场景，考虑使用批量识别 API

---

## 七、常见问题

### Q1: WebSocket 连接失败？

**可能原因**：
- Token 过期或无效
- 网络问题（防火墙、代理）
- 区域配置错误

**解决方案**：
- 检查 Token 是否有效
- 验证网络连接
- 确认区域配置正确

### Q2: 识别结果不准确？

**可能原因**：
- 音频质量差（噪音、采样率不匹配）
- 语言模型选择不当

**解决方案**：
- 启用降噪和回声消除
- 使用合适的采样率（16kHz 推荐）
- 考虑使用自定义语言模型

### Q3: 延迟较高？

**可能原因**：
- 网络延迟
- 音频处理延迟
- 服务器负载

**解决方案**：
- 选择离用户最近的区域
- 优化音频处理流程
- 使用 CDN 加速（如适用）

---

## 八、参考资源

- [阿里云智能语音交互官方文档](https://help.aliyun.com/product/84430.html)
- [实时语音识别 API 参考](https://help.aliyun.com/document_detail/84428.html)
- [WebSocket 协议说明](https://help.aliyun.com/document_detail/84430.html)
- [SDK 下载与示例](https://help.aliyun.com/document_detail/84430.html)

---

## 九、总结

通过以上步骤，可以在 Next.js + Vercel 架构下成功对接阿里云实时语音识别服务。主要优势：

1. **国内访问速度快**：适合中国大陆用户
2. **集成相对简单**：WebSocket 协议，前端直接连接
3. **成本可控**：按量计费，适合中小规模应用
4. **稳定性高**：阿里云 SLA 保障

建议在项目早期使用此方案快速上线，后续可根据业务需求考虑优化或迁移。
