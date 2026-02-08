import { NextRequest, NextResponse } from 'next/server';
import { mockConversations, generateId, delay } from '@/lib/mock-data';
import type { Conversation, ApiResponse, SendMessageRequest } from '@/types/meeting';

// POST /api/conversations/message - 发送语音消息
export async function POST(request: NextRequest) {
  try {
    await delay(2000); // 模拟LLM处理时间

    const body: SendMessageRequest = await request.json();
    const { meetId, userId, audioUrl, transcriptionText, audioDuration } = body;

    // 验证
    if (!meetId || !userId || !audioUrl || !transcriptionText) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          message: 'Missing required fields',
        },
        { status: 400 }
      );
    }

    // 模拟LLM回复（实际应该调用OpenAI API）
    const mockAIResponses = [
      '好的，我记录了您的需求。关于Q1新版本发布，您希望包含哪些主要功能？',
      '明白了。我已经记录下三个主要功能：1. 用户认证 2. 数据分析 3. 报表生成。这些功能的优先级如何安排？',
      '好的，我已经记录下优先级顺序。用户认证作为最高优先级，数据分析次之，报表生成最后。还有其他需要讨论的内容吗？',
      '感谢您的分享。我会将这些信息整理到会议记录中。',
      '明白了，我会帮您跟进这个事项。',
    ];
    const randomResponse = mockAIResponses[Math.floor(Math.random() * mockAIResponses.length)];

    // 模拟生成AI语音URL（实际应该调用TTS API）
    const aiAudioUrl = `https://storage.example.com/audio-responses/ai-resp-${generateId()}.mp3`;
    const aiAudioDuration = Math.ceil(randomResponse.length / 10); // 粗略估算

    const now = new Date();
    const conversation: Conversation = {
      id: generateId(),
      meet_id: meetId,
      user_id: userId,
      user_audio_url: audioUrl,
      user_message_text: transcriptionText,
      user_audio_duration: audioDuration,
      ai_response_text: randomResponse,
      ai_audio_url: aiAudioUrl,
      ai_audio_duration: aiAudioDuration,
      user_sent_at: now.toISOString(),
      ai_responded_at: new Date(now.getTime() + 2000).toISOString(), // 2秒后回复
      created_at: now.toISOString(),
    };

    const response: ApiResponse<{
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
