import { NextRequest, NextResponse } from 'next/server';
import { mockTodos, delay } from '@/lib/mock-data';
import type { Todo, ApiResponse } from '@/types/meeting';

// PUT /api/todos/[id] - 更新任务
export async function PUT(
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

    // 更新任务（在真实环境中会更新数据库）
    const updatedTodo: Todo = {
      ...mockTodos[todoIndex],
      ...body,
      updated_at: new Date().toISOString(),
    };

    const response: ApiResponse<Todo> = {
      success: true,
      data: updatedTodo,
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
