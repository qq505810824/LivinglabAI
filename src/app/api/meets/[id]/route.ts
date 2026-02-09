import { supabaseAdmin } from '@/lib/supabase';
import type { ApiResponse, Meet } from '@/types/meeting';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/meets/[id] - 获取会议详情
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> | { id: string } }
) {
    try {
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

        // 查询会议
        const { data: meet, error: meetError } = await supabaseAdmin
            .from('meets')
            .select('*')
            .eq('id', id)
            .single();

        if (meetError) {
            if (meetError.code === 'PGRST116' || meetError.message.includes('Results contain 0 rows')) {
                return NextResponse.json(
                    {
                        success: false,
                        error: 'Not found',
                        message: 'Meeting not found',
                    },
                    { status: 404 }
                );
            }
            throw new Error(`Failed to fetch meet: ${meetError.message}`);
        }

        // 获取相关对话、任务和总结
        const [
            { data: conversations, error: convError },
            { data: todos, error: todoError },
            { data: summary, error: summaryError },
        ] = await Promise.all([
            supabaseAdmin.from('conversations').select('*').eq('meet_id', id).order('created_at', { ascending: true }),
            supabaseAdmin.from('todos').select('*').eq('meet_id', id).order('created_at', { ascending: false }),
            supabaseAdmin.from('meet_summaries').select('*').eq('meet_id', id).maybeSingle(),
        ]);

        if (convError) {
            console.warn('Failed to fetch conversations for meet:', id, convError.message);
        }
        if (todoError) {
            console.warn('Failed to fetch todos for meet:', id, todoError.message);
        }
        if (summaryError) {
            console.warn('Failed to fetch summary for meet:', id, summaryError.message);
        }

        const response: ApiResponse<
            Meet & {
                conversations?: any[];
                todos?: any[];
                summary?: any;
            }
        > = {
            success: true,
            data: {
                ...(meet as Meet),
                conversations: conversations || [],
                todos: todos || [],
                summary: summary || null,
            },
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error in GET /api/meets/[id]:', error);
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
