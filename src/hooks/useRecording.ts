import { useState, useCallback } from 'react';
import type { ApiResponse } from '@/types/meeting';

export const useRecording = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        setAudioChunks([audioBlob]);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setAudioChunks([]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start recording';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  }, [mediaRecorder, isRecording]);

  const transcribeAudio = useCallback(async (file: File, meetId: string, userId: string) => {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('meetId', meetId);
      formData.append('userId', userId);

      const response = await fetch('/api/recordings/transcribe', {
        method: 'POST',
        body: formData,
      });

      const data: ApiResponse<{
        recordingId: string;
        transcriptionId: string;
        text: string;
        language: string;
        duration: number;
      }> = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to transcribe audio');
      }

      return data.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getAudioBlob = useCallback(() => {
    if (audioChunks.length > 0) {
      return new Blob(audioChunks, { type: 'audio/webm' });
    }
    return null;
  }, [audioChunks]);

  return {
    loading,
    error,
    isRecording,
    startRecording,
    stopRecording,
    transcribeAudio,
    getAudioBlob,
  };
};
