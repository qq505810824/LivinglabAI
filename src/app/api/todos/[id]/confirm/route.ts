import { NextRequest, NextResponse } from 'next/server';
import { mockTodos, delay } from '@/lib/mock-data';
import type { ApiResponse } from '@/types/meeting';

// POST /api/todos/[id]/confirm - 确认任务
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    await delay(300);

    // 处理 Next.js 15+ 的异步 params
    const resolvedParams = await Promise.resolve(params);
    const id = resolvedParams.id;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          message: 'Todo ID is required',
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { reminderTime } = body;

    const todoIndex = mockTodos.findIndex(t => t.id === id);

    if (todoIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not found',
          message: 'Todo not found',
        },
        { status: 404 }
      );
    }

    if (todoIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not found',
          message: 'Todo not found',
        },
        { status: 404 }
      );
    }

    // 更新任务状态（在真实环境中会更新数据库）
    const updatedTodo = {
      ...mockTodos[todoIndex],
      status: 'confirmed' as const,
      reminder_time: reminderTime || mockTodos[todoIndex].reminder_time,
      updated_at: new Date().toISOString(),
    };

    const response: ApiResponse<{
      id: string;
      status: string;
      reminderTime: string | null;
    }> = {
      success: true,
      data: {
        id: updatedTodo.id,
        status: updatedTodo.status,
        reminderTime: updatedTodo.reminder_time,
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
