import { generateId } from '@/lib/mock-data';
import type { ApiResponse, Conversation, SendMessageRequest } from '@/types/meeting';
import { NextRequest, NextResponse } from 'next/server';

const DIFY_SERVER = process.env.NEXT_PUBLIC_DIFY_SERVER || 'https://aienglish-dify.docai.net/v1';
const DIFY_API_KEY = process.env.NEXT_PUBLIC_DIFY_API_KEY || 'app-9d0QgfzhD6Xc0GEGZySmF8wx';

/**
 * 处理 SSE 流式响应
 */
async function handleSSEStream(
    response: Response
): Promise<{ aiResponseText: string; conversationId?: string; messageId?: string }> {
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }

    const reader = response.body?.getReader();
    if (!reader) {
        throw new Error('Response body is not readable');
    }

    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    let bufferObj: Record<string, any>;
    let isFirstMessage = true;
    let aiResponseText = '';
    let conversationId: string | undefined;
    let messageId: string | undefined;

    return new Promise((resolve, reject) => {
        function read() {
            if (!reader) {
                reject(new Error('Reader is not available'));
                return;
            }

            reader.read()
                .then((result) => {
                    if (result.done) {
                        resolve({ aiResponseText, conversationId, messageId });
                        return;
                    }

                    buffer += decoder.decode(result.value, { stream: true });
                    const lines = buffer.split('\n');

                    try {
                        lines.forEach((message) => {
                            if (message.startsWith('data: ')) {
                                try {
                                    bufferObj = JSON.parse(message.substring(6)) as Record<string, any>;
                                } catch (e) {
                                    // 处理消息截断，跳过
                                    return;
                                }

                                // 处理错误
                                if (bufferObj.status === 400 || !bufferObj.event) {
                                    reject(new Error(bufferObj?.message || 'Dify API error'));
                                    return;
                                }

                                // 处理消息事件
                                if (bufferObj.event === 'message' || bufferObj.event === 'agent_message') {
                                    const answer = bufferObj.answer || '';
                                    aiResponseText += answer;

                                    if (isFirstMessage && bufferObj.conversation_id) {
                                        conversationId = bufferObj.conversation_id;
                                    }
                                    if (bufferObj.id) {
                                        messageId = bufferObj.id;
                                    }
                                    isFirstMessage = false;
                                } else if (bufferObj.event === 'message_end') {
                                    // 消息结束，可以在这里处理最终数据
                                    console.log('Message ended:', bufferObj);
                                }
                            }
                        });

                        // 保留最后一行（可能不完整）
                        buffer = lines[lines.length - 1];
                    } catch (e) {
                        reject(new Error(`Failed to parse SSE stream: ${e}`));
                        return;
                    }

                    read();
                })
                .catch((error) => {
                    reject(new Error(error.message || String(error)));
                });
        }

        read();
    });
}

// POST /api/conversations/message - 发送语音消息
export async function POST(request: NextRequest) {
    try {
        const body: SendMessageRequest = await request.json();
        const { meetId, userId, audioUrl, transcriptionText, audioDuration, conversation_id } = body;

        // conversation_id 是可选的，第一次对话时为空，后续对话时传入以保持上下文

        // 验证
        if (!meetId || !userId || !transcriptionText) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Validation error',
                    message: 'Missing required fields',
                },
                { status: 400 }
            );
        }

        // 使用 SSE 方式调用 Dify API
        const difyResponse = await fetch(`${DIFY_SERVER}/chat-messages`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${DIFY_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user: userId,
                inputs: {
                    title: 'title',
                    topic: 'topic',
                    hints: '',
                },
                ...(conversation_id && { conversation_id }), // 只有在存在时才添加 conversation_id
                query: transcriptionText,
                response_mode: 'streaming',
            }),
        });

        // 处理 SSE 流式响应
        const { aiResponseText, conversationId, messageId } = await handleSSEStream(difyResponse);

        if (!aiResponseText) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Empty response',
                    message: 'Failed to get AI response from Dify',
                },
                { status: 500 }
            );
        }

        // 模拟生成AI语音URL（实际应该调用TTS API）
        const aiAudioUrl = `https://storage.example.com/audio-responses/ai-resp-${generateId()}.mp3`;
        const aiAudioDuration = Math.ceil(aiResponseText.length / 10); // 粗略估算

        const now = new Date();
        const conversation: Conversation = {
            id: messageId || generateId(),
            meet_id: meetId,
            user_id: userId,
            user_audio_url: audioUrl,
            user_message_text: transcriptionText,
            user_audio_duration: audioDuration,
            ai_response_text: aiResponseText,
            ai_audio_url: aiAudioUrl,
            ai_audio_duration: aiAudioDuration,
            user_sent_at: now.toISOString(),
            ai_responded_at: new Date(now.getTime()).toISOString(), // 2秒后回复
            created_at: now.toISOString(),
        };

        const response: ApiResponse<{
            conversation_id: string;//dify conversation_id
            conversationId: string;
            userMessage: string;
            aiResponseText: string;
            aiAudioUrl: string;
            aiAudioDuration: number;
            userSentAt: string;
            aiRespondedAt: string;
        }> = {
            success: true,
            data: {
                conversation_id: conversationId || '',
                conversationId: conversation.id,
                userMessage: conversation.user_message_text,
                aiResponseText: conversation.ai_response_text,
                aiAudioUrl: conversation.ai_audio_url,
                aiAudioDuration: conversation.ai_audio_duration || 0,
                userSentAt: conversation.user_sent_at,
                aiRespondedAt: conversation.ai_responded_at,
            },
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error in POST /api/conversations/message:', error);
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
