import { supabaseAdmin } from '@/lib/supabase';
import type { ApiResponse } from '@/types/meeting';
import { NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: {
    id: string;
  };
}

interface ApplicationData {
  user_id: string;
  full_name: string;
  email: string;
  university?: string;
  year?: string;
  major?: string;
  statement: string;
  resume_url?: string;
  portfolio_url?: string;
}

// POST /api/programs/[id]/apply - apply to a program and increment applicants_count
export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id: programId } = params;

  try {
    const body = (await request.json()) as ApplicationData;

    const { data, error } = await supabaseAdmin
      .from('program_applications')
      .insert({
        program_id: programId,
        ...body,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Increment applicants_count
    const { data: program, error: programError } = await supabaseAdmin
      .from('programs')
      .select('applicants_count')
      .eq('id', programId)
      .single();

    if (!programError && program) {
      await supabaseAdmin
        .from('programs')
        .update({ applicants_count: (program.applicants_count ?? 0) + 1 })
        .eq('id', programId);
    }

    const response: ApiResponse<any> = {
      success: true,
      data,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error(`Error in POST /api/programs/${programId}/apply:`, error);
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

