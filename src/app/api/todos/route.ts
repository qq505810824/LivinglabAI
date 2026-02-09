import { NextRequest, NextResponse } from 'next/server';
import { mockTodos, mockUsers, delay } from '@/lib/mock-data';
import type { Todo, ApiResponse, PlatformInfo } from '@/types/meeting';

// GET /api/todos - 获取任务列表
export async function GET(request: NextRequest) {
  try {
    await delay(300);

    const searchParams = request.nextUrl.searchParams;
    const meetId = searchParams.get('meetId');
    const status = searchParams.get('status');
    const assigneeId = searchParams.get('assigneeId'); // 系统用户ID
    const platform = searchParams.get('platform'); // 平台类型
    const platformUserId = searchParams.get('platformUserId'); // 平台用户ID
    const sortBy = searchParams.get('sortBy') || 'created_at'; // 排序字段
    const order = searchParams.get('order') || 'desc'; // 排序顺序

    let filteredTodos = [...mockTodos];

    // 按会议ID筛选
    if (meetId) {
      filteredTodos = filteredTodos.filter(t => t.meet_id === meetId);
    }

    // 按状态筛选
    if (status) {
      filteredTodos = filteredTodos.filter(t => t.status === status);
    }

    // 按系统用户ID筛选
    if (assigneeId) {
      filteredTodos = filteredTodos.filter(t => t.assignee_id === assigneeId);
    }

    // 按平台信息筛选（通过平台ID查找系统用户ID）
    if (platform && platformUserId) {
      // 查找匹配的用户
      const matchedUser = mockUsers.find(u => {
        return u.meta?.platform?.platform === platform && u.meta?.platform?.platform_user_id === platformUserId;
      });

      if (matchedUser) {
        // 筛选该用户的任务
        filteredTodos = filteredTodos.filter(t => t.assignee_id === matchedUser.id);
      } else {
        // 如果找不到用户，返回空列表
        filteredTodos = [];
      }
    }

    // 排序
    filteredTodos.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case 'due_date':
          aValue = a.due_date ? new Date(a.due_date).getTime() : 0;
          bValue = b.due_date ? new Date(b.due_date).getTime() : 0;
          break;
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          aValue = priorityOrder[a.priority] || 0;
          bValue = priorityOrder[b.priority] || 0;
          break;
        case 'created_at':
        default:
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
      }

      if (order === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });

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
