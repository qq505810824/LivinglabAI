import { supabaseAdmin } from '@/lib/supabase';
import type { ApiResponse, CreateMeetRequest, Meet } from '@/types/meeting';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/meets - 获取会议列表
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const hostId = searchParams.get('hostId');
        const status = searchParams.get('status');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');

        let query = supabaseAdmin.from('meets').select('*', { count: 'exact' });

        // 筛选
        if (hostId) {
            query = query.eq('host_id', hostId);
        }
        if (status) {
            query = query.eq('status', status);
        }

        // 分页
        const from = (page - 1) * limit;
        const to = from + limit - 1;
        query = query.range(from, to);

        // 排序：按创建时间倒序
        query = query.order('created_at', { ascending: false });

        const { data: meets, error, count } = await query;

        if (error) {
            throw new Error(`Failed to fetch meets: ${error.message}`);
        }

        const response: ApiResponse<{
            meets: Meet[];
            total: number;
            page: number;
            limit: number;
        }> = {
            success: true,
            data: {
                meets: (meets || []) as Meet[],
                total: count || 0,
                page,
                limit,
            },
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error in GET /api/meets:', error);
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

        // 生成唯一的会议号（6位大写字母数字组合）
        let meetingCode: string = '';
        let isUnique = false;
        let attempts = 0;
        const maxAttempts = 10;

        while (!isUnique && attempts < maxAttempts) {
            meetingCode = Math.random().toString(36).substring(2, 8).toUpperCase();

            // 检查会议号是否已存在
            const { data: existingMeet } = await supabaseAdmin
                .from('meets')
                .select('id')
                .eq('meeting_code', meetingCode)
                .limit(1);

            if (!existingMeet || existingMeet.length === 0) {
                isUnique = true;
            } else {
                attempts++;
            }
        }

        if (!isUnique || !meetingCode) {
            throw new Error('Failed to generate unique meeting code');
        }

        const joinUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://example.com'}/meet/${meetingCode}`;
        const now = new Date().toISOString();

        const { data: newMeet, error } = await supabaseAdmin
            .from('meets')
            .insert({
                meeting_code: meetingCode,
                title,
                description: description || null,
                host_id: '3c4ed3b4-16e3-4809-8633-9df8df7fd433',// hostId,
                start_time: startTime || null,
                duration: duration || null,
                status: 'pending',
                join_url: joinUrl,
                created_at: now,
                updated_at: now,
                ended_at: null,
            })
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to create meet: ${error.message}`);
        }

        const response: ApiResponse<Meet> = {
            success: true,
            data: newMeet as Meet,
        };

        return NextResponse.json(response, { status: 201 });
    } catch (error) {
        console.error('Error in POST /api/meets:', error);
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
