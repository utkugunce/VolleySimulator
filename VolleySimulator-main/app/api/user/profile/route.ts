import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../utils/supabase-server';
import { withAuth } from '@/lib/api-middleware';
import { z } from 'zod';

const ProfileUpdateSchema = z.object({
    display_name: z.string().min(2).max(50).optional(),
    avatar_url: z.string().url().optional().or(z.literal('')),
    favorite_team: z.string().optional()
});

// GET - Fetch user profile
export async function GET(request: NextRequest) {
    return withAuth(request, async (req, { user }) => {
        const supabase = await createServerSupabaseClient();

        // Get profile
        const { data: profile } = await supabase
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
    });
}

// PUT - Update user profile
export async function PUT(request: NextRequest) {
    return withAuth(request, async (req, { user }) => {
        const supabase = await createServerSupabaseClient();
        const body = await req.json();

        // Validate input with Zod
        let validatedData;
        try {
            validatedData = ProfileUpdateSchema.parse(body);
        } catch (error) {
            if (error instanceof z.ZodError) {
                return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 });
            }
            throw error;
        }

        if (Object.keys(validatedData).length === 0) {
            return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('user_profiles')
            .upsert({
                id: user.id,
                ...validatedData,
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) {
            console.error('Error updating profile:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Also update display_name in leaderboard
        if (validatedData.display_name) {
            await supabase
                .from('leaderboard')
                .update({ display_name: validatedData.display_name })
                .eq('user_id', user.id);
        }

        return NextResponse.json({ success: true, profile: data });
    });
}
