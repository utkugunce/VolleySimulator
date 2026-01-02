import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceRoleClient } from '../../../../utils/supabase-server';
import { isAdmin } from '../../../../utils/admin';

import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
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

        const body = await request.json();
        const { matchId, league, homeTeam, awayTeam, matchDate, resultScore } = body;

        if (!matchId || !resultScore) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const adminSupabase = createServiceRoleClient();

        // 1. Update match results table
        const { error: resultError } = await adminSupabase
            .from('match_results')
            .upsert({
                match_id: matchId,
                league: league,
                home_team: homeTeam,
                away_team: awayTeam,
                match_date: matchDate,
                result_score: resultScore,
                is_verified: true,
                updated_at: new Date().toISOString()
            }, { onConflict: 'match_id' });

        if (resultError) {
            console.error('Error updating match result:', resultError);
            return NextResponse.json({ error: resultError.message }, { status: 500 });
        }

        // 2. Trigger score calculation for predictions
        // In a real app, this could be a background job or a call to the sync endpoint
        // For simplicity, we can call the internal sync logic or wait for the next cron

        // Let's try to call the sync endpoint internally via a local fetch if possible, 
        // or just let the user know it's updated and will be processed.

        return NextResponse.json({
            success: true,
            message: 'Maç sonucu güncellendi. Puanlar kısa süre içinde hesaplanacaktır.'
        });
    } catch (error) {
        console.error('Admin match update error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
