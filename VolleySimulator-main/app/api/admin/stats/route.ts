import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceRoleClient } from '../../../utils/supabase-server';
import { isAdmin } from '../../../utils/admin';

export async function GET(request: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user || !isAdmin(user.email)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const adminSupabase = createServiceRoleClient();

        // Fetch stats in parallel
        const [usersCount, predictionsCount, resultsCount] = await Promise.all([
            adminSupabase.from('user_profiles').select('*', { count: 'exact', head: true }),
            adminSupabase.from('predictions').select('*', { count: 'exact', head: true }),
            adminSupabase.from('match_results').select('*', { count: 'exact', head: true })
        ]);

        return NextResponse.json({
            users: usersCount.count || 0,
            predictions: predictionsCount.count || 0,
            results: resultsCount.count || 0
        });
    } catch (error) {
        console.error('Admin stats error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
