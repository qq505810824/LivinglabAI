import { NextRequest, NextResponse } from 'next/server';
import { mockTodos, mockConversations, generateId, delay } from '@/lib/mock-data';
import type { ApiResponse } from '@/types/meeting';

// POST /api/todos/generate - 生成任务
export async function POST(request: NextRequest) {
  try {
    await delay(3000); // 模拟LLM处理时间

    const body = await request.json();
    const { meetId } = body;

    if (!meetId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          message: 'meetId is required',
        },
        { status: 400 }
      );
    }

    // 获取该会议的所有对话
    const conversations = mockConversations.filter(c => c.meet_id === meetId);

    // 模拟LLM生成任务（实际应该调用OpenAI API）
    const generatedTodos = [
      {
        id: generateId(),
        meet_id: meetId,
        title: '完成用户认证功能开发',
        description: '实现用户登录、注册、密码重置等功能',
        assignee_id: null,
        status: 'draft' as const,
        priority: 'high' as const,
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        reminder_time: null,
        source: 'ai_generated' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        completed_at: null,
      },
      {
        id: generateId(),
        meet_id: meetId,
        title: '设计数据分析模块',
        description: '设计数据采集、处理和可视化方案',
        assignee_id: null,
        status: 'draft' as const,
        priority: 'medium' as const,
        due_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
        reminder_time: null,
        source: 'ai_generated' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        completed_at: null,
      },
    ];

    const summary = `本次会议讨论了${conversations.length}个话题，生成了${generatedTodos.length}个待办任务。`;

    const response: ApiResponse<{
      todos: typeof generatedTodos;
      summary: string;
    }> = {
      success: true,
      data: {
        todos: generatedTodos,
        summary,
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
