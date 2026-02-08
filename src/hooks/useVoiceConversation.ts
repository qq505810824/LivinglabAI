import { useState, useCallback } from 'react';
import { useRecording } from './useRecording';
import { useConversations } from './useConversations';
import { useTTS } from './useTTS';
import type { Conversation } from '@/types/meeting';

export const useVoiceConversation = (meetId: string, userId: string) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [status, setStatus] = useState<'idle' | 'recording' | 'transcribing' | 'processing' | 'speaking'>('idle');
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);

  const { startRecording, stopRecording, transcribeAudio, getAudioBlob, isRecording } = useRecording();
  const { sendMessage } = useConversations();
  const { playAudio } = useTTS();

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
      stopRecording();
      setStatus('transcribing');

      // 等待录音完成
      await new Promise(resolve => setTimeout(resolve, 500));

      const audioBlob = getAudioBlob();
      if (!audioBlob) {
        setStatus('idle');
        return;
      }

      // 转文字
      const audioFile = new File([audioBlob], 'recording.webm', { type: 'audio/webm' });
      const transcription = await transcribeAudio(audioFile, meetId, userId);

      // 发送消息并获取AI回复
      setStatus('processing');
      const response = await sendMessage({
        meetId,
        userId,
        audioUrl: `https://storage.example.com/recordings/${transcription.recordingId}.mp3`,
        transcriptionText: transcription.text,
        audioDuration: transcription.duration,
      });

      // 播放AI回复
      setStatus('speaking');
      setCurrentAudioUrl(response.aiAudioUrl);

      // 创建对话记录
      const newConversation: Conversation = {
        id: response.conversationId,
        meet_id: meetId,
        user_id: userId,
        user_audio_url: `https://storage.example.com/recordings/${transcription.recordingId}.mp3`,
        user_message_text: response.userMessage,
        user_audio_duration: transcription.duration,
        ai_response_text: response.aiResponseText,
        ai_audio_url: response.aiAudioUrl,
        ai_audio_duration: response.aiAudioDuration,
        user_sent_at: response.userSentAt,
        ai_responded_at: response.aiRespondedAt,
        created_at: new Date().toISOString(),
      };

      setConversations(prev => [...prev, newConversation]);

      // 播放音频
      try {
        await playAudio(response.aiAudioUrl);
      } catch (error) {
        console.error('Failed to play audio:', error);
      }

      setStatus('idle');
      setCurrentAudioUrl(null);
    } catch (error) {
      console.error('Failed to process recording:', error);
      setStatus('idle');
    }
  }, [stopRecording, getAudioBlob, transcribeAudio, meetId, userId, sendMessage, playAudio]);

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
    handleStartRecording,
    handleStopRecording,
    loadConversations,
  };
};
