import { NextRequest, NextResponse } from 'next/server';
import { mockMeets, delay } from '@/lib/mock-data';
import type { ApiResponse } from '@/types/meeting';

// PATCH /api/meets/[id]/status - 更新会议状态
export async function PATCH(
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
          message: 'Meeting ID is required',
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status } = body;

    if (!status || !['ongoing', 'ended', 'cancelled'].includes(status)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          message: 'Invalid status',
        },
        { status: 400 }
      );
    }

    const meetIndex = mockMeets.findIndex(m => m.id === id);
    if (meetIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not found',
          message: 'Meeting not found',
        },
        { status: 404 }
      );
    }

    // 更新状态（在真实环境中会更新数据库）
    const updatedMeet = {
      ...mockMeets[meetIndex],
      status,
      updated_at: new Date().toISOString(),
      ended_at: status === 'ended' ? new Date().toISOString() : mockMeets[meetIndex].ended_at,
    };

    const response: ApiResponse<{
      id: string;
      status: string;
      updatedAt: string;
    }> = {
      success: true,
      data: {
        id: updatedMeet.id,
        status: updatedMeet.status,
        updatedAt: updatedMeet.updated_at,
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
