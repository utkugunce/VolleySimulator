import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceRoleClient } from '../../../utils/supabase-server';
import { isAdmin } from '../../../utils/admin';

import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
    try {
        let user = null;

        // 1. Try Cookie Auth
        const supabase = await createServerSupabaseClient();
        const { data: { user: cookieUser } } = await supabase.auth.getUser();
        user = cookieUser;

        // 2. Try Header Auth (Fallback)
        if (!user) {
            const authHeader = request.headers.get('Authorization');
            if (authHeader) {
                const token = authHeader.replace('Bearer ', '');
                const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
                const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
                const jwtClient = createClient(supabaseUrl, supabaseAnonKey);
                const { data: { user: headerUser } } = await jwtClient.auth.getUser(token);
                user = headerUser;
            }
        }

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
