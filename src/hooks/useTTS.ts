import { useState, useCallback } from 'react';
import type { ApiResponse, TTSGenerateRequest } from '@/types/meeting';

export const useTTS = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateSpeech = useCallback(async (text: string, voice?: string, language?: string) => {
    setLoading(true);
    setError(null);

    try {
      const request: TTSGenerateRequest = { text, voice, language };
      const response = await fetch('/api/tts/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const data: ApiResponse<{
        audioUrl: string;
        duration: number;
        provider: string;
      }> = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to generate speech');
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

  const playAudio = useCallback(async (audioUrl: string) => {
    return new Promise<void>((resolve, reject) => {
      const audio = new Audio(audioUrl);
      audio.onended = () => resolve();
      audio.onerror = (err) => reject(err);
      audio.play().catch(reject);
    });
  }, []);

  return {
    loading,
    error,
    generateSpeech,
    playAudio,
  };
};
