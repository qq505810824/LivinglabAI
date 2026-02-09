import { delay, mockSummaries, mockTodos } from '@/lib/mock-data';
import { supabaseAdmin } from '@/lib/supabase';
import type { ApiResponse, MeetSummary, Todo } from '@/types/meeting';
import { NextRequest, NextResponse } from 'next/server';

// POST /api/todos/generate - 生成会议总结和任务
export async function POST(request: NextRequest) {
    try {
        await delay(2000); // 模拟LLM处理时间

        const body = await request.json();
        const { meetId, userId } = body;

        if (!meetId) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Validation error',
                    message: 'meetId is required',
                },
                { status: 400 }
            );
        }

        // 从 Supabase 获取该会议的所有对话
        const { data: conversations, error: convError } = await supabaseAdmin
            .from('conversations')
            .select('*')
            .eq('meet_id', meetId)
            .order('created_at', { ascending: true });

        if (convError) {
            console.warn('Failed to fetch conversations:', convError.message);
        }

        const conversationCount = conversations?.length || 0;

        // 从 mock 数据中随机选择一个 summary 模板（后续会对接真实的 LLM API）
        const randomSummaryIndex = Math.floor(Math.random() * mockSummaries.length);
        const mockSummaryTemplate = mockSummaries[randomSummaryIndex];

        // 生成会议总结（基于对话数量调整）
        const summaryText = `本次会议进行了${conversationCount}轮对话。${mockSummaryTemplate.summary}`;

        // 从 mock todos 中随机选择 2-4 个作为模板（后续会对接真实的 LLM API）
        const todoCount = Math.min(2 + Math.floor(Math.random() * 3), mockTodos.length);
        const shuffledTodos = [...mockTodos].sort(() => Math.random() - 0.5);
        const selectedTodoTemplates = shuffledTodos.slice(0, todoCount);

        const now = new Date().toISOString();

        // 生成 todos（基于模板）
        // 注意：不生成临时 ID，让数据库自动生成 UUID
        const todoDataToInsert = selectedTodoTemplates.map((template, index) => ({
            meet_id: meetId,
            title: template.title,
            description: template.description,
            assignee_id: userId || null,
            status: 'draft' as const,
            priority: template.priority,
            due_date: new Date(Date.now() + (30 + index * 15) * 24 * 60 * 60 * 1000).toISOString(),
            reminder_time: null,
            source: 'ai_generated' as const,
            created_at: now,
            updated_at: now,
            completed_at: null,
        }));

        // 保存 todos 到 Supabase
        // 注意：不传递 id 字段，让 Supabase 自动生成 UUID
        let savedTodos: Todo[] = [];
        if (todoDataToInsert.length > 0) {
            const { data: insertedTodos, error: todoError } = await supabaseAdmin
                .from('todos')
                .insert(todoDataToInsert)
                .select();

            if (todoError) {
                console.error('Failed to save todos:', todoError);
                throw new Error(`Failed to save todos: ${todoError.message}`);
            }

            // 使用数据库返回的 UUID
            savedTodos = (insertedTodos || []) as Todo[];
        }

        // 保存 summary 到 Supabase
        // 注意：不传递 id 字段，让 Supabase 自动生成 UUID
        // 使用 upsert，如果已存在则更新，不存在则插入
        const { data: savedSummary, error: summaryError } = await supabaseAdmin
            .from('meet_summaries')
            .upsert(
                {
                    // 不传递 id，让数据库自动生成 UUID（如果是新记录）
                    meet_id: meetId,
                    summary: summaryText,
                    key_points: mockSummaryTemplate.key_points,
                    participants: [],
                    generated_at: now,
                },
                { onConflict: 'meet_id' }
            )
            .select()
            .single();

        if (summaryError) {
            console.error('Failed to save summary:', summaryError);
            throw new Error(`Failed to save summary: ${summaryError.message}`);
        }

        const response: ApiResponse<{
            todos: Todo[];
            summary: MeetSummary;
        }> = {
            success: true,
            data: {
                todos: savedTodos, // 使用数据库返回的 UUID
                summary: savedSummary as MeetSummary, // 使用数据库返回的 UUID
            },
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error in POST /api/todos/generate:', error);
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
