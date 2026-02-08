import { delay, mockConversations, mockMeets, mockTodos } from '@/lib/mock-data';
import type { ApiResponse, Meet } from '@/types/meeting';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/meets/[id] - 获取会议详情
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
                    message: 'Meeting ID is required',
                },
                { status: 400 }
            );
        }

        const meet = mockMeets.find(m => m.id === id);

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

        // 获取相关对话和任务
        const conversations = mockConversations.filter(c => c.meet_id === params.id);
        const todos = mockTodos.filter(t => t.meet_id === params.id);

        const response: ApiResponse<Meet & { conversations?: any[]; todos?: any[] }> = {
            success: true,
            data: {
                ...meet,
                conversations,
                todos,
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
