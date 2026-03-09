import { supabaseAdmin } from '@/lib/supabase';
import type { Opportunity } from '@/types/opportunity';
import type { ApiResponse } from '@/types/meeting';
import { NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/opportunities/[id]
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = params;

  try {
    const { data, error } = await supabaseAdmin
      .from('opportunities')
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
          message: 'Opportunity not found',
        } satisfies ApiResponse<never>,
        { status: 404 },
      );
    }

    const item = data as Opportunity;

    const response: ApiResponse<Opportunity> = {
      success: true,
      data: item,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error(`Error in GET /api/opportunities/${id}:`, error);
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

// PATCH /api/opportunities/[id]
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = params;

  try {
    const updates = (await request.json()) as Partial<Opportunity>;

    const { error } = await supabaseAdmin
      .from('opportunities')
      .update(updates)
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
    console.error(`Error in PATCH /api/opportunities/${id}:`, error);
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

// DELETE /api/opportunities/[id]
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { id } = params;

  try {
    const { error } = await supabaseAdmin
      .from('opportunities')
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
    console.error(`Error in DELETE /api/opportunities/${id}:`, error);
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

