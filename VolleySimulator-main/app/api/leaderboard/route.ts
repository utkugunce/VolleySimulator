import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../utils/supabase-server';

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
            // Find user in the full leaderboard
            const { data: allData } = await supabase
                .from('leaderboard')
                .select('user_id')
                .order(orderColumn, { ascending: false });

            if (allData) {
                const userIndex = allData.findIndex(e => e.user_id === user.id);
                if (userIndex !== -1) {
                    userRank = userIndex + 1;
                    userEntry = rankedData?.find(e => e.user_id === user.id) || null;

                    // If user not in top results, fetch their entry
                    if (!userEntry) {
                        const { data: userData } = await supabase
                            .from('leaderboard')
                            .select('*')
                            .eq('user_id', user.id)
                            .single();

                        if (userData) {
                            userEntry = { ...userData, rank: userRank };
                        }
                    }
                }
            }
        }

        return NextResponse.json({
            leaderboard: rankedData,
            userEntry,
            userRank,
            type
        });
    } catch (error) {
        console.error('Leaderboard GET error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
