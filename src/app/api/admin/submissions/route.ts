import { supabaseAdmin } from '@/lib/supabase';
import type { ApiResponse } from '@/types/meeting';
import type { Submission, SubmissionResourceType } from '@/types/submission';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/admin/submissions?resourceType=...&resourceId=...&ownerId=...&status=...
// Admin/organization endpoint for listing submissions for a given resource
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const resourceType = searchParams.get('resourceType') as SubmissionResourceType | null;
  const resourceId = searchParams.get('resourceId');
  const ownerId = searchParams.get('ownerId');
  const status = searchParams.get('status');

  try {
    let query = supabaseAdmin
      .from('submissions')
      .select('*')
      .order('submitted_at', { ascending: false });

    if (resourceType) {
      query = query.eq('resource_type', resourceType);
    }
    if (resourceId) {
      query = query.eq('resource_id', resourceId);
    }

    // For org users we expect ownerId to be passed; super_admin can omit it to see all.
    if (ownerId) {
      query = query.eq('owner_id', ownerId);
    }

    if (status) {
      query = query.eq('status', status);
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
    console.error('Error in GET /api/admin/submissions:', error);
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

