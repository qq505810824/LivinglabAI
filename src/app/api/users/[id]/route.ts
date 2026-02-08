import { NextRequest, NextResponse } from 'next/server';
import { mockUsers, delay } from '@/lib/mock-data';
import type { ApiResponse } from '@/types/meeting';

// GET /api/users/[id] - 获取用户信息
export async function GET(
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
          message: 'User ID is required',
        },
        { status: 400 }
      );
    }

    const user = mockUsers.find(u => u.id === id);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not found',
          message: 'User not found',
        },
        { status: 404 }
      );
    }

    const response: ApiResponse<{
      id: string;
      name: string | null;
      platform: string;
      platformUserId: string;
      platformUsername: string | null;
      createdAt: string;
    }> = {
      success: true,
      data: {
        id: user.id,
        name: user.name,
        platform: user.platform,
        platformUserId: user.platform_user_id,
        platformUsername: user.platform_username,
        createdAt: user.created_at,
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
