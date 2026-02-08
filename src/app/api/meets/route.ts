import { NextRequest, NextResponse } from 'next/server';
import { mockMeets, mockUsers, generateId, delay } from '@/lib/mock-data';
import type { Meet, ApiResponse, CreateMeetRequest } from '@/types/meeting';

// GET /api/meets - 获取会议列表
export async function GET(request: NextRequest) {
  try {
    await delay(300); // 模拟网络延迟

    const searchParams = request.nextUrl.searchParams;
    const hostId = searchParams.get('hostId');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    let filteredMeets = [...mockMeets];

    // 筛选
    if (hostId) {
      filteredMeets = filteredMeets.filter(m => m.host_id === hostId);
    }
    if (status) {
      filteredMeets = filteredMeets.filter(m => m.status === status);
    }

    // 分页
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedMeets = filteredMeets.slice(start, end);

    const response: ApiResponse<{
      meets: Meet[];
      total: number;
      page: number;
      limit: number;
    }> = {
      success: true,
      data: {
        meets: paginatedMeets,
        total: filteredMeets.length,
        page,
        limit,
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

// POST /api/meets - 创建会议
export async function POST(request: NextRequest) {
  try {
    await delay(500);

    const body: CreateMeetRequest = await request.json();
    const { title, description, startTime, duration, hostId } = body;

    // 验证
    if (!title || !hostId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          message: 'Title and hostId are required',
        },
        { status: 400 }
      );
    }

    // 生成会议号和链接
    const meetingCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const joinUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://example.com'}/meet/${meetingCode}`;

    const newMeet: Meet = {
      id: generateId(),
      meeting_code: meetingCode,
      title,
      description: description || null,
      host_id: hostId,
      start_time: startTime || null,
      duration: duration || null,
      status: 'pending',
      join_url: joinUrl,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ended_at: null,
    };

    const response: ApiResponse<Meet> = {
      success: true,
      data: newMeet,
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
