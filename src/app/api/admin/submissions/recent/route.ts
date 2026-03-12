import { supabaseAdmin } from '@/lib/supabase';
import type { ApiResponse } from '@/types/meeting';
import type { Submission } from '@/types/submission';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/admin/submissions/recent?ownerId=...&limit=5&isSuperAdmin=...
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ownerId = searchParams.get('ownerId');
  const isSuperAdmin = searchParams.get('isSuperAdmin') === 'true';
  const limit = Number(searchParams.get('limit') || '5');

  try {
    let query = supabaseAdmin
      .from('submissions')
      .select('*')
      .order('submitted_at', { ascending: false })
      .limit(limit);

    if (!isSuperAdmin && ownerId) {
      query = query.eq('owner_id', ownerId);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    const items = (data || []) as Submission[];

    return NextResponse.json(
      {
        success: true,
        data: items,
      } satisfies ApiResponse<Submission[]>,
      { status: 200 },
    );
  } catch (error) {
    console.error('Error in GET /api/admin/submissions/recent:', error);
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

