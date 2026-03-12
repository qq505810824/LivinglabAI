import { supabaseAdmin } from '@/lib/supabase';
import type { ApiResponse } from '@/types/meeting';
import type { Submission, SubmissionResourceType, SubmissionStatus } from '@/types/submission';
import { NextRequest, NextResponse } from 'next/server';

interface CreateSubmissionBody {
  userId: string;
  resourceType: SubmissionResourceType;
  resourceId: string;
  status?: SubmissionStatus;
  submitterName?: string;
  submitterEmail?: string;
  payload: Record<string, unknown>;
}

// POST /api/submissions - create a new submission (used by all three forms)
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateSubmissionBody;
    const { userId, resourceType, resourceId, status, submitterName, submitterEmail, payload } =
      body;

    if (!userId || !resourceType || !resourceId || !payload) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          message: 'userId, resourceType, resourceId and payload are required',
        } satisfies ApiResponse<never>,
        { status: 400 },
      );
    }

    let ownerId: string | null = null;
    let title: string | undefined;
    let organizationName: string | undefined;

    if (resourceType === 'case_project') {
      const { data: caseRow, error: caseError } = await supabaseAdmin
        .from('cases')
        .select('id, title, user_id, company_name')
        .eq('id', resourceId)
        .single();

      if (caseError || !caseRow) {
        throw caseError || new Error('Case not found');
      }

      ownerId = caseRow.user_id as string;
      title = caseRow.title as string;
      organizationName = (caseRow.company_name as string | null) ?? undefined;

      // increment submissions_count
      const { error: updateCaseError } = await supabaseAdmin.rpc('increment_case_submissions', {
        case_id: resourceId,
      });
      if (updateCaseError) {
        // fallback: direct update if RPC is not defined
        await supabaseAdmin
          .from('cases')
          .update({ submissions_count: (caseRow as any).submissions_count + 1 })
          .eq('id', resourceId);
      }
    } else {
      // internships / programs share opportunities table
      const { data: oppRow, error: oppError } = await supabaseAdmin
        .from('opportunities')
        .select('id, title, user_id, organization_name, applicants_count')
        .eq('id', resourceId)
        .single();

      if (oppError || !oppRow) {
        throw oppError || new Error('Opportunity not found');
      }

      ownerId = oppRow.user_id as string;
      title = oppRow.title as string;
      organizationName = (oppRow.organization_name as string | null) ?? undefined;

      // increment applicants_count
      const { error: updateOppError } = await supabaseAdmin.rpc('increment_opportunity_applicants', {
        opportunity_id: resourceId,
      });
      if (updateOppError) {
        await supabaseAdmin
          .from('opportunities')
          .update({ applicants_count: (oppRow as any).applicants_count + 1 })
          .eq('id', resourceId);
      }
    }

    if (!ownerId) {
      throw new Error('Owner id could not be determined for this resource');
    }

    const { data, error } = await supabaseAdmin
      .from('submissions')
      .insert({
        user_id: userId,
        owner_id: ownerId,
        resource_type: resourceType,
        resource_id: resourceId,
        status: status ?? 'submitted',
        title,
        organization_name: organizationName,
        submitter_name: submitterName,
        submitter_email: submitterEmail,
        payload,
        submitted_at: new Date().toISOString(),
      })
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    const created = data as Submission;

    return NextResponse.json(
      {
        success: true,
        data: created,
      } satisfies ApiResponse<Submission>,
      { status: 201 },
    );
  } catch (error) {
    console.error('Error in POST /api/submissions:', error);
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

// GET /api/submissions?userId=...&type=...
// Returns submissions for a single user (used for "My Projects")
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const type = searchParams.get('type') as SubmissionResourceType | null;

  if (!userId) {
    return NextResponse.json(
      {
        success: false,
        error: 'Validation error',
        message: 'userId is required',
      } satisfies ApiResponse<never>,
      { status: 400 },
    );
  }

  try {
    let query = supabaseAdmin
      .from('submissions')
      .select('*')
      .eq('user_id', userId)
      .order('submitted_at', { ascending: false });

    if (type) {
      query = query.eq('resource_type', type);
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
    );
  } catch (error) {
    console.error('Error in GET /api/submissions:', error);
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

