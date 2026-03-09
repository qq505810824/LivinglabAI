import { supabaseAdmin } from '@/lib/supabase';
import type { CreateOpportunityInput, Opportunity } from '@/types/opportunity';
import type { ApiResponse } from '@/types/meeting';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/opportunities?organizationId=... - list opportunities
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const organizationId = searchParams.get('organizationId');

  try {
    let query = supabaseAdmin
      .from('opportunities')
      .select('*')
      .order('created_at', { ascending: false });

    if (organizationId) {
      query = query.eq('user_id', organizationId);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    const items: Opportunity[] = (data || []) as Opportunity[];

    const response: ApiResponse<Opportunity[]> = {
      success: true,
      data: items,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in GET /api/opportunities:', error);
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

// POST /api/opportunities - create a new opportunity
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { input, organizationId } = body as {
      input: CreateOpportunityInput;
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

    const { data, error } = await supabaseAdmin
      .from('opportunities')
      .insert({
        ...input,
        user_id: organizationId,
        status: (input as any).status || 'active',
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    const created = data as Opportunity;

    const response: ApiResponse<Opportunity> = {
      success: true,
      data: created,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/opportunities:', error);
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

