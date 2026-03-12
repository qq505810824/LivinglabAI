import { supabaseAdmin } from '@/lib/supabase';
import type { ApiResponse } from '@/types/meeting';
import { NextRequest, NextResponse } from 'next/server';

interface StatsResponse {
    activeCases: number;
    totalSubmissions: number;
    pendingReviews: number;
    opportunitiesPosted: number;
}

// GET /api/admin/submissions/stats?ownerId=...&isSuperAdmin=...
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const ownerId = searchParams.get('ownerId');
    const isSuperAdmin = searchParams.get('isSuperAdmin') === 'true';

    try {
        // Active cases (status active) for this owner
        let casesQuery = supabaseAdmin.from('cases').select('id', { count: 'exact', head: true });
        if (!isSuperAdmin && ownerId) {
            casesQuery = casesQuery.eq('user_id', ownerId);
        }
        casesQuery = casesQuery.eq('status', 'active');
        const { count: activeCases = 0 } = await casesQuery;

        // Opportunities posted
        let oppQuery = supabaseAdmin
            .from('opportunities')
            .select('id', { count: 'exact', head: true });
        if (!isSuperAdmin && ownerId) {
            oppQuery = oppQuery.eq('user_id', ownerId);
        }
        const { count: opportunitiesPosted = 0 } = await oppQuery;

        // Total submissions for this owner
        let subsQuery = supabaseAdmin
            .from('submissions')
            .select('id', { count: 'exact', head: true });
        if (!isSuperAdmin && ownerId) {
            subsQuery = subsQuery.eq('owner_id', ownerId);
        }
        const { count: totalSubmissions = 0 } = await subsQuery;

        // Pending reviews: submissions with status submitted or under_review
        let pendingQuery = supabaseAdmin
            .from('submissions')
            .select('id', { count: 'exact', head: true })
            .in('status', ['submitted', 'under_review']);
        if (!isSuperAdmin && ownerId) {
            pendingQuery = pendingQuery.eq('owner_id', ownerId);
        }
        const { count: pendingReviews = 0 } = await pendingQuery;

        const stats: StatsResponse = {
            activeCases: activeCases ?? 0,
            totalSubmissions: totalSubmissions ?? 0,
            pendingReviews: pendingReviews ?? 0,
            opportunitiesPosted: opportunitiesPosted ?? 0,
        };

        return NextResponse.json(
            {
                success: true,
                data: stats,
            } satisfies ApiResponse<StatsResponse>,
            { status: 200 },
        );
    } catch (error) {
        console.error('Error in GET /api/admin/submissions/stats:', error);
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

