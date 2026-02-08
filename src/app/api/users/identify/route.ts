import { NextRequest, NextResponse } from 'next/server';
import { mockUsers, generateId, delay } from '@/lib/mock-data';
import type { User, ApiResponse, IdentifyUserRequest } from '@/types/meeting';

// POST /api/users/identify - 识别或创建用户
export async function POST(request: NextRequest) {
  try {
    await delay(300);

    const body: IdentifyUserRequest = await request.json();
    const { platform, platformUserId, platformUsername, platformDisplayName } = body;

    if (!platform || !platformUserId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          message: 'Platform and platformUserId are required',
        },
        { status: 400 }
      );
    }

    // 查找现有用户
    let user = mockUsers.find(
      u => u.platform === platform && u.platform_user_id === platformUserId
    );

    let isNewUser = false;

    if (!user) {
      // 创建新用户
      isNewUser = true;
      user = {
        id: generateId(),
        email: null,
        name: platformDisplayName || platformUsername || '用户',
        role: 'user',
        platform,
        platform_user_id: platformUserId,
        platform_username: platformUsername || null,
        platform_display_name: platformDisplayName || null,
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    } else {
      // 更新用户信息（如果有新信息）
      if (platformUsername && user.platform_username !== platformUsername) {
        user.platform_username = platformUsername;
      }
      if (platformDisplayName && user.platform_display_name !== platformDisplayName) {
        user.platform_display_name = platformDisplayName;
      }
      user.updated_at = new Date().toISOString();
    }

    const response: ApiResponse<{
      id: string;
      platform: string;
      platformUserId: string;
      name: string | null;
      isNewUser: boolean;
    }> = {
      success: true,
      data: {
        id: user.id,
        platform: user.platform,
        platformUserId: user.platform_user_id,
        name: user.name,
        isNewUser,
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
