import { NextRequest, NextResponse } from 'next/server';
import { mockUsers, generateId, delay } from '@/lib/mock-data';
import type { User, ApiResponse, IdentifyUserRequest, PlatformInfo } from '@/types/meeting';

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

    // 查找现有用户（在meta.platform中查找匹配的平台信息）
    let user = mockUsers.find(u => {
      return u.meta?.platform?.platform === platform && u.meta?.platform?.platform_user_id === platformUserId;
    });

    let isNewUser = false;
    const now = new Date().toISOString();

    if (!user) {
      // 创建新用户
      isNewUser = true;
      const newPlatformInfo: PlatformInfo = {
        platform,
        platform_user_id: platformUserId,
        platform_username: platformUsername || null,
        platform_display_name: platformDisplayName || null,
        created_at: now,
      };

      user = {
        id: generateId(),
        email: null,
        name: platformDisplayName || platformUsername || '用户',
        role: 'user',
        avatar_url: null,
        meta: {
          platform: newPlatformInfo,
        },
        created_at: now,
        updated_at: now,
      };
    } else {
      // 更新现有平台信息（如果有新信息）
      if (platformUsername && user.meta.platform.platform_username !== platformUsername) {
        user.meta.platform.platform_username = platformUsername;
      }
      if (platformDisplayName && user.meta.platform.platform_display_name !== platformDisplayName) {
        user.meta.platform.platform_display_name = platformDisplayName;
      }

      // 更新用户名称（如果提供了新的显示名称）
      if (platformDisplayName && !user.name) {
        user.name = platformDisplayName;
      }

      user.updated_at = now;
    }

    const response: ApiResponse<{
      id: string;
      name: string | null;
      meta: {
        platform: PlatformInfo;
      };
      isNewUser: boolean;
    }> = {
      success: true,
      data: {
        id: user.id,
        name: user.name,
        meta: user.meta,
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
