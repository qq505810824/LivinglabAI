import { NextRequest, NextResponse } from 'next/server';
import { mockTodos, generateId, delay } from '@/lib/mock-data';
import type { Todo, ApiResponse } from '@/types/meeting';

// GET /api/todos - 获取任务列表
export async function GET(request: NextRequest) {
  try {
    await delay(300);

    const searchParams = request.nextUrl.searchParams;
    const meetId = searchParams.get('meetId');
    const status = searchParams.get('status');
    const assigneeId = searchParams.get('assigneeId');

    let filteredTodos = [...mockTodos];

    if (meetId) {
      filteredTodos = filteredTodos.filter(t => t.meet_id === meetId);
    }
    if (status) {
      filteredTodos = filteredTodos.filter(t => t.status === status);
    }
    if (assigneeId) {
      filteredTodos = filteredTodos.filter(t => t.assignee_id === assigneeId);
    }

    const response: ApiResponse<{
      todos: Todo[];
      total: number;
    }> = {
      success: true,
      data: {
        todos: filteredTodos,
        total: filteredTodos.length,
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

// POST /api/todos - 创建任务
export async function POST(request: NextRequest) {
  try {
    await delay(300);

    const body = await request.json();
    const { meetId, title, description, assigneeId, dueDate, reminderTime, priority } = body;

    if (!meetId || !title) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          message: 'meetId and title are required',
        },
        { status: 400 }
      );
    }

    const newTodo: Todo = {
      id: generateId(),
      meet_id: meetId,
      title,
      description: description || null,
      assignee_id: assigneeId || null,
      status: 'draft',
      priority: priority || 'medium',
      due_date: dueDate || null,
      reminder_time: reminderTime || null,
      source: 'manual',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      completed_at: null,
    };

    const response: ApiResponse<Todo> = {
      success: true,
      data: newTodo,
    };

    return NextResponse.json(response, { status: 201 });
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
