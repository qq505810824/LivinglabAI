import { supabaseAdmin } from '@/lib/supabase';
import type { Program } from '@/types/program';
import type { ApiResponse } from '@/types/meeting';
import { NextResponse } from 'next/server';

// GET /api/programs - list active programs
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('programs')
      .select('*')
      .eq('status', 'active')
      .order('deadline', { ascending: true });

    if (error) {
      throw error;
    }

    const items = (data || []) as Program[];

    const response: ApiResponse<Program[]> = {
      success: true,
      data: items,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in GET /api/programs:', error);
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

