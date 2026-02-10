import { transcribeAudioWithDify } from '@/lib/difyTranscription';
import type { Conversation, Meet } from '@/types/meeting';
import { useCallback, useState } from 'react';
import { useConversations } from './useConversations';
import { useRecording } from './useRecording';
import { useTTS } from './useTTS';

export const useVoiceConversation = (meet: Meet, userId: string) => {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [status, setStatus] = useState<'idle' | 'recording' | 'transcribing' | 'processing' | 'speaking'>('idle');
    // Dify conversation_id - 用于维护对话上下文，从第一次对话开始到会议结束
    const [difyConversationId, setDifyConversationId] = useState<string>('');

    const { startRecording, stopRecording, getAudioBlob, isRecording } = useRecording();
    const { sendMessage } = useConversations();
    const { playAudio, text_to_audio } = useTTS();

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
            // 2. 使用 Dify 转写音频（上传 + 转文字 封装在一起）
            const mimeType = mp3Blob.type.includes('wav') ? 'audio/wav' : 'audio/mp3';
            const transcriptionText = await transcribeAudioWithDify(mp3Blob, userId, mimeType);
            // const transcriptionText = 'Hello, how are you?';
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
                meetId: meet.id,
                userId,
                audioUrl: ``,
                title: meet.title || '',
                topic: meet.description || '',
                hints: meet.description || '',
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

            // 创建对话记录（使用从 API 返回的数据）
            const newConversation: Conversation = {
                id: response?.conversationId || `conv-${Date.now()}`,
                meet_id: meet.id,
                user_id: userId,
                user_audio_url: ``,
                user_message_text: transcriptionText,
                user_audio_duration: audioDuration,
                ai_response_text: response?.aiResponseText || '',
                user_sent_at: response?.userSentAt || new Date().toISOString(),
                ai_responded_at: response?.aiRespondedAt || new Date().toISOString(),
                created_at: new Date().toISOString(),
            };

            setConversations(prev => [...prev, newConversation]);


            // 播放音频
            try {
                const audioUrl = await text_to_audio(response?.aiResponseText ?? '');
                await playAudio(audioUrl);
            } catch (error) {
                console.error('Failed to play audio:', error);
            }

            setStatus('idle');
        } catch (error) {
            console.error('Failed to process recording:', error);
            setStatus('idle');
        }
    }, [stopRecording, meet.id, userId, sendMessage, playAudio, difyConversationId]);

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
    }, [meet.id]);

    return {
        conversations,
        status,
        isRecording,
        difyConversationId, // 暴露 conversation_id，方便调试
        handleStartRecording,
        handleStopRecording,
        loadConversations,
        resetConversation, // 重置对话上下文（会议结束时调用）
    };
};
