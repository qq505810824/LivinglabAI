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
      email: string | null;
      role: string;
      avatar_url: string | null;
      meta: {
        platform: {
          platform: string;
          platform_user_id: string;
          platform_username: string | null;
          platform_display_name: string | null;
          created_at: string;
        };
      };
      createdAt: string;
      updatedAt: string;
    }> = {
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar_url: user.avatar_url,
        meta: user.meta,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
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
