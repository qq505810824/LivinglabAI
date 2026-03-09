import { supabaseAdmin } from '@/lib/supabase';
import type { Program } from '@/types/program';
import type { ApiResponse } from '@/types/meeting';
import { NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/programs/[id]
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = params;

  try {
    const { data, error } = await supabaseAdmin
      .from('programs')
      .select('*')
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
          message: 'Program not found',
        } satisfies ApiResponse<never>,
        { status: 404 },
      );
    }

    const item = data as Program;

    const response: ApiResponse<Program> = {
      success: true,
      data: item,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error(`Error in GET /api/programs/${id}:`, error);
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

