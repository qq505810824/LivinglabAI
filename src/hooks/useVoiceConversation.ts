import type { Conversation } from '@/types/meeting';
import { useCallback, useState } from 'react';
import { useConversations } from './useConversations';
import { useRecording } from './useRecording';
import { useTTS } from './useTTS';

// Dify配置（可以从环境变量读取）
const DIFY_SERVER = process.env.NEXT_PUBLIC_DIFY_SERVER || 'https://aienglish-dify.docai.net/v1';
const DIFY_API_KEY = process.env.NEXT_PUBLIC_DIFY_API_KEY || 'app-FsPlEb8aHgrWxVa57HDoa5SB';

export const useVoiceConversation = (meetId: string, userId: string) => {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [status, setStatus] = useState<'idle' | 'recording' | 'transcribing' | 'processing' | 'speaking'>('idle');
    const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);
    // Dify conversation_id - 用于维护对话上下文，从第一次对话开始到会议结束
    const [difyConversationId, setDifyConversationId] = useState<string>('');

    const { startRecording, stopRecording, getAudioBlob, isRecording } = useRecording();
    const { sendMessage } = useConversations();
    const { playAudio } = useTTS();

    // 上传音频到Dify并获取file_id
    const uploadToDify = useCallback(async (audioBlob: Blob, mimeType: string = 'audio/mp3'): Promise<string> => {
        // 根据blob类型确定文件扩展名
        const extension = mimeType.includes('wav') ? 'wav' : 'mp3';
        const file = new File([audioBlob], `recording.${extension}`, { type: mimeType });
        const formData = new FormData();
        formData.append('file', file);
        formData.append('user', userId);

        const response = await fetch(`${DIFY_SERVER}/files/upload`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${DIFY_API_KEY}`,
            },
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to upload to Dify: ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();
        return data.id as string; // upload_file_id
    }, [userId]);

    // 调用Dify workflow转文字
    const transcribeWithDify = useCallback(async (fileId: string): Promise<string> => {
        const response = await fetch(`${DIFY_SERVER}/workflows/run`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${DIFY_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user: userId,
                inputs: {
                    audio: {
                        transfer_method: 'local_file',
                        upload_file_id: fileId,
                        type: 'audio',
                    },
                },
                response_mode: 'blocking',
            }),
        });

        if (!response.ok) {
            throw new Error(`Failed to transcribe with Dify: ${response.statusText}`);
        }

        const data = await response.json();
        return data?.data?.outputs?.text || '';
    }, [userId]);


    const handleStartRecording = useCallback(async () => {
        try {
            await startRecording();
            setStatus('recording');
        } catch (error) {
            console.error('Failed to start recording:', error);
        }
    }, [startRecording]);

    const handleStopRecording = useCallback(async () => {
        try {
            setStatus('transcribing');

            //1. 停止录音并等待获取blob
            const mp3Blob = await stopRecording();

            if (!mp3Blob) {
                console.error('Failed to get audio blob after stopping recording');
                setStatus('idle');
                return;
            }
            // // 2. 上传到Dify并获取file_id
            // const mimeType = mp3Blob.type.includes('wav') ? 'audio/wav' : 'audio/mp3';
            // const fileId = await uploadToDify(mp3Blob, mimeType);

            // 3. 调用Dify workflow转文字
            // const transcriptionText = await transcribeWithDify(fileId);
            const transcriptionText = 'Hello';
            if (!transcriptionText) {
                throw new Error('Failed to get transcription text');
            }

            // 计算音频时长（从AudioBuffer获取准确时长）
            let audioDuration = 0;
            try {
                const audioContext = new AudioContext();
                const arrayBuffer = await mp3Blob.arrayBuffer();
                const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
                audioDuration = Math.ceil(audioBuffer.duration);
            } catch (error) {
                console.warn('Failed to calculate audio duration, using estimate:', error);
                // 如果计算失败，使用粗略估算
                audioDuration = Math.ceil(mp3Blob.size / 16000);
            }

            // 发送消息并获取AI回复（SSE 处理已在 API 中完成）
            setStatus('processing');
            const response = await sendMessage({
                meetId,
                userId,
                audioUrl: ``,
                transcriptionText,
                conversation_id: difyConversationId, // 使用全局保存的 conversation_id
                audioDuration,
            });

            // 如果 API 返回了新的 conversation_id，更新全局状态
            // 第一次对话时，API 会返回新的 conversation_id，后续对话使用同一个 ID
            if (response?.conversation_id && response.conversation_id !== difyConversationId) {
                setDifyConversationId(response.conversation_id);
            }

            // 播放AI回复
            setStatus('speaking');
            setCurrentAudioUrl(response?.aiAudioUrl ?? '');

            // 创建对话记录（使用从 API 返回的数据）
            const newConversation: Conversation = {
                id: response?.conversationId || `conv-${Date.now()}`,
                meet_id: meetId,
                user_id: userId,
                user_audio_url: ``,
                user_message_text: transcriptionText,
                user_audio_duration: audioDuration,
                ai_response_text: response?.aiResponseText || '',
                ai_audio_url: response?.aiAudioUrl ?? '',
                ai_audio_duration: response?.aiAudioDuration ?? 0,
                user_sent_at: response?.userSentAt || new Date().toISOString(),
                ai_responded_at: response?.aiRespondedAt || new Date().toISOString(),
                created_at: new Date().toISOString(),
            };

            setConversations(prev => [...prev, newConversation]);

            // 播放音频
            // try {
            //     await playAudio(response?.aiAudioUrl ?? '');
            // } catch (error) {
            //     console.error('Failed to play audio:', error);
            // }

            setStatus('idle');
            setCurrentAudioUrl(null);
        } catch (error) {
            console.error('Failed to process recording:', error);
            setStatus('idle');
        }
    }, [stopRecording, uploadToDify, transcribeWithDify, meetId, userId, sendMessage, playAudio, difyConversationId]);

    // 重置 conversation_id（会议结束时调用）
    const resetConversation = useCallback(() => {
        setDifyConversationId('');
        setConversations([]);
    }, []);

    const loadConversations = useCallback(async () => {
        // 可以从API加载历史对话
        // const { getConversations } = useConversations();
        // const data = await getConversations({ meetId });
        // if (data) {
        //   setConversations(data.conversations);
        // }
    }, [meetId]);

    return {
        conversations,
        status,
        isRecording,
        currentAudioUrl,
        difyConversationId, // 暴露 conversation_id，方便调试
        handleStartRecording,
        handleStopRecording,
        loadConversations,
        resetConversation, // 重置对话上下文（会议结束时调用）
    };
};
