import { NextRequest, NextResponse } from 'next/server';
import { mockMeets, delay } from '@/lib/mock-data';
import type { ApiResponse } from '@/types/meeting';

// GET /api/meets/code/[code] - 通过会议号查找会议
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> | { code: string } }
) {
  try {
    await delay(300);

    // 处理 Next.js 15+ 的异步 params
    const resolvedParams = await Promise.resolve(params);
    const code = resolvedParams.code;

    if (!code) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          message: 'Meeting code is required',
        },
        { status: 400 }
      );
    }

    const meet = mockMeets.find(m => 
      m.meeting_code && code && 
      m.meeting_code.toUpperCase() === code.toUpperCase()
    );

    if (!meet) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not found',
          message: 'Meeting not found',
        },
        { status: 404 }
      );
    }

    const response: ApiResponse<{
      id: string;
      meetingCode: string;
      title: string;
      status: string;
      joinUrl: string;
    }> = {
      success: true,
      data: {
        id: meet.id,
        meetingCode: meet.meeting_code,
        title: meet.title,
        status: meet.status,
        joinUrl: meet.join_url,
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
