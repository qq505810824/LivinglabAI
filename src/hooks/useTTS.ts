import type { ApiResponse, TTSGenerateRequest } from '@/types/meeting';
import { useCallback, useState } from 'react';

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

    const text_to_audio = useCallback(async (text: string): Promise<string> => {
        setLoading(true);
        setError(null);

        try {
            const speechKey =
                process.env.NEXT_PUBLIC_AZURE_SPEECH_KEY || '5c6abcbff83643d1900b89bb8ec14243';
            const speechRegion = process.env.NEXT_PUBLIC_AZURE_SPEECH_REGION || 'eastus';
            const ttsUrl = `https://${speechRegion}.tts.speech.microsoft.com/cognitiveservices/v1`;

            // SSML 格式，不包含速率设置
            const ssml = `<speak version='1.0' xml:lang='en-US'>
                <voice xml:lang='en-US' xml:gender='Female' name='en-US-AriaNeural'>
                    ${text}
                </voice>
            </speak>`;

            const response = await fetch(ttsUrl, {
                method: 'POST',
                headers: {
                    'Ocp-Apim-Subscription-Key': speechKey,
                    'Content-Type': 'application/ssml+xml',
                    'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
                    'User-Agent': 'curl',
                },
                body: ssml,
            });

            if (!response.ok) {
                throw new Error(`Azure TTS API error: ${response.statusText}`);
            }

            const data = await response.arrayBuffer();
            const blob = new Blob([data], { type: 'audio/mp3' });
            const url = URL.createObjectURL(blob);

            return url;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        error,
        generateSpeech,
        playAudio,
        text_to_audio
    };
};
