import { supabaseAdmin } from '@/lib/supabase';
import type { Case, CreateCaseInput } from '@/types/case';
import type { ApiResponse } from '@/types/meeting';
import { NextRequest, NextResponse } from 'next/server';

interface RouteParams {
    params: Promise<{
        id: string;
    }>;
}

// GET /api/cases/[id] - get single case with organization info
export async function GET(_request: NextRequest, context: RouteParams) {
    const { id } = await context.params;
    if (!id || id === 'undefined') {
        return NextResponse.json(
            {
                success: false,
                error: 'Validation error',
                message: 'Case id is required',
            } satisfies ApiResponse<never>,
            { status: 400 },
        );
    }

    try {
        const { data, error } = await supabaseAdmin
            .from('cases')
            .select(
                `
                    *,
                    users (
                    name,
                    avatar_url
                    )
                `,
            )
            .eq('id', id)
            .single();

        if (error) {
            throw error;
        }

        if (!data) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Not found',
                    message: 'Case not found',
                } satisfies ApiResponse<never>,
                { status: 404 },
            );
        }

        const item: Case = {
            id: data.id,
            title: data.title,
            organization_id: data.user_id,
            department: data.department,
            category: data.category,
            difficulty: data.difficulty,
            scenario: data.scenario,
            problem: data.problem,
            existing_solution: data.existing_solution ?? undefined,
            deliverable: data.deliverable,
            public_data: data.public_data ?? undefined,
            estimated_hours: data.estimated_hours,
            skills: data.skills ?? [],
            submissions_count: data.submissions_count,
            status: data.status,
            ai_generated_brief: data.ai_generated_brief ?? undefined,
            views_count: data.views_count,
            saves_count: data.saves_count,
            created_at: data.created_at,
            updated_at: data.updated_at,
            organization_name: data.users?.name ?? undefined,
            organization_logo: data.users?.avatar_url ?? undefined,
        };

        const response: ApiResponse<Case> = {
            success: true,
            data: item,
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error(`Error in GET /api/cases/${id}:`, error);
        return NextResponse.json(
            {
                success: false,
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error',
            } satisfies ApiResponse<never>,
            { status: 500 },
        );
    }
}

// PATCH /api/cases/[id] - update a case
export async function PATCH(request: NextRequest, context: RouteParams) {
    const { id } = await context.params;

    if (!id || id === 'undefined') {
        return NextResponse.json(
            {
                success: false,
                error: 'Validation error',
                message: 'Case id is required',
            } satisfies ApiResponse<never>,
            { status: 400 },
        );
    }

    try {
        const updates = (await request.json()) as Partial<CreateCaseInput>;

        const { error } = await supabaseAdmin
            .from('cases')
            .update({
                title: updates.title,
                department: updates.department,
                category: updates.category,
                difficulty: updates.difficulty,
                scenario: updates.scenario,
                problem: updates.problem,
                existing_solution: updates.existing_solution,
                deliverable: updates.deliverable,
                public_data: updates.public_data,
                estimated_hours: updates.estimated_hours,
                skills: updates.skills,
            })
            .eq('id', id);

        if (error) {
            throw error;
        }

        const response: ApiResponse<null> = {
            success: true,
            data: null,
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error(`Error in PATCH /api/cases/${id}:`, error);
        return NextResponse.json(
            {
                success: false,
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error',
            } satisfies ApiResponse<never>,
            { status: 500 },
        );
    }
}

// DELETE /api/cases/[id] - delete a case
export async function DELETE(_request: NextRequest, context: RouteParams) {
    const { id } = await context.params;

    try {
        const { error } = await supabaseAdmin
            .from('cases')
            .delete()
            .eq('id', id);

        if (error) {
            throw error;
        }

        const response: ApiResponse<null> = {
            success: true,
            data: null,
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error(`Error in DELETE /api/cases/${id}:`, error);
        return NextResponse.json(
            {
                success: false,
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error',
            } satisfies ApiResponse<never>,
            { status: 500 },
        );
    }
}

