import { supabaseAdmin } from '@/lib/supabase';
import type { Case, CreateCaseInput } from '@/types/case';
import type { ApiResponse } from '@/types/meeting';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/cases - list active cases with organization info
export async function GET() {
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
            .eq('status', 'active')
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        const items: Case[] =
            (data || []).map((item: any) => ({
                id: item.id,
                title: item.title,
                organization_id: item.user_id,
                department: item.department,
                category: item.category,
                difficulty: item.difficulty,
                scenario: item.scenario,
                problem: item.problem,
                existing_solution: item.existing_solution ?? undefined,
                deliverable: item.deliverable,
                public_data: item.public_data ?? undefined,
                estimated_hours: item.estimated_hours,
                skills: item.skills ?? [],
                submissions_count: item.submissions_count,
                status: item.status,
                ai_generated_brief: item.ai_generated_brief ?? undefined,
                views_count: item.views_count,
                saves_count: item.saves_count,
                created_at: item.created_at,
                updated_at: item.updated_at,
                organization_name: item.company_name ?? undefined,
                industry: item.industry ?? undefined,
                company_size: item.company_size ?? undefined,
                deliverable_type: item.deliverable_type ?? undefined,
                // organization_name: item.users?.name ?? undefined,
                // organization_logo: item.users?.avatar_url ?? undefined,
            })) ?? [];

        const response: ApiResponse<Case[]> = {
            success: true,
            data: items,
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error in GET /api/cases:', error);
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

// POST /api/cases - create a new case
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { input, organizationId } = body as {
            input: CreateCaseInput;
            organizationId: string;
        };

        if (!organizationId || !input) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Validation error',
                    message: 'organizationId and input are required',
                } satisfies ApiResponse<never>,
                { status: 400 },
            );
        }

        const { company_name, industry, company_size, deliverable_type, ...dbPayload } = input;
        const { data, error } = await supabaseAdmin
            .from('cases')
            .insert({
                ...dbPayload,
                company_name, industry, company_size, deliverable_type,
                user_id: organizationId,
                status: 'active',
            })
            .select()
            .single();

        if (error) {
            throw error;
        }

        const created: Case = {
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
            company_name: data.company_name ?? undefined,
            industry: data.industry ?? undefined,
            company_size: data.company_size ?? undefined,
            deliverable_type: data.deliverable_type ?? undefined,
        };

        const response: ApiResponse<Case> = {
            success: true,
            data: created,
        };

        return NextResponse.json(response, { status: 201 });
    } catch (error) {
        console.error('Error in POST /api/cases:', error);
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

