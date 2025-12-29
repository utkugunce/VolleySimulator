import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../utils/supabase-server';

// GET - Fetch user profile
export async function GET() {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get profile
        const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        // Get leaderboard entry
        const { data: leaderboardEntry } = await supabase
            .from('leaderboard')
            .select('*')
            .eq('user_id', user.id)
            .single();

        // Get user's rank
        let rank = null;
        if (leaderboardEntry) {
            const { data: higherRanked } = await supabase
                .from('leaderboard')
                .select('user_id', { count: 'exact' })
                .gt('total_points', leaderboardEntry.total_points);

            rank = (higherRanked?.length || 0) + 1;
        }

        // Get recent predictions
        const { data: recentPredictions } = await supabase
            .from('predictions')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(10);

        return NextResponse.json({
            profile: profile || {
                id: user.id,
                display_name: user.user_metadata?.name || user.email?.split('@')[0],
                level: 1,
                xp: 0
            },
            stats: leaderboardEntry || {
                total_points: 0,
                correct_predictions: 0,
                total_predictions: 0,
                current_streak: 0,
                best_streak: 0
            },
            rank,
            recentPredictions: recentPredictions || []
        });
    } catch (error) {
        console.error('Profile GET error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PUT - Update user profile
export async function PUT(request: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const allowedFields = ['display_name', 'avatar_url', 'favorite_team'];

        const updates: Record<string, any> = {};
        for (const field of allowedFields) {
            if (body[field] !== undefined) {
                updates[field] = body[field];
            }
        }

        if (Object.keys(updates).length === 0) {
            return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('user_profiles')
            .upsert({
                id: user.id,
                ...updates,
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) {
            console.error('Error updating profile:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Also update display_name in leaderboard
        if (updates.display_name) {
            await supabase
                .from('leaderboard')
                .update({ display_name: updates.display_name })
                .eq('user_id', user.id);
        }

        return NextResponse.json({ success: true, profile: data });
    } catch (error) {
        console.error('Profile PUT error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
