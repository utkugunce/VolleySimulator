import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../utils/supabase-server';

// Revalidate every 2 minutes for leaderboard
export const revalidate = 120;

// GET - Fetch leaderboard
export async function GET(request: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient();
        const { searchParams } = new URL(request.url);

        const type = searchParams.get('type') || 'total'; // total, weekly, monthly
        const limit = parseInt(searchParams.get('limit') || '50');

        let orderColumn = 'total_points';
        if (type === 'weekly') orderColumn = 'weekly_points';
        if (type === 'monthly') orderColumn = 'monthly_points';

        // Fetch Top N
        const { data, error } = await supabase
            .from('leaderboard')
            .select('*')
            .order(orderColumn, { ascending: false })
            .limit(limit);

        if (error) {
            console.error('Error fetching leaderboard:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Add rank to each entry
        const rankedData = data?.map((entry, index) => ({
            ...entry,
            rank: index + 1
        }));

        // Get current user's position if authenticated
        const { data: { user } } = await supabase.auth.getUser();
        let userEntry = null;
        let userRank = null;

        if (user) {
            // Check if user is already in top N
            const inTopKeys = rankedData?.findIndex(e => e.user_id === user.id);

            if (inTopKeys !== undefined && inTopKeys !== -1) {
                userRank = inTopKeys + 1;
                userEntry = rankedData![inTopKeys];
            } else {
                // If not in top results, fetch their entry specifically
                const { data: userData } = await supabase
                    .from('leaderboard')
                    .select('*')
                    .eq('user_id', user.id)
                    .single();

                if (userData) {
                    // Calculate rank efficiently: Count how many have more points
                    const { count, error: rankError } = await supabase
                        .from('leaderboard')
                        .select('*', { count: 'exact', head: true })
                        .gt(orderColumn, userData[orderColumn]);

                    if (!rankError) {
                        userRank = (count || 0) + 1;
                        userEntry = { ...userData, rank: userRank };
                    }
                }
            }
        }

        return NextResponse.json({
            leaderboard: rankedData,
            userEntry,
            userRank,
            type
        }, {
            headers: {
                'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300',
            }
        });
    } catch (error) {
        console.error('Leaderboard GET error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
