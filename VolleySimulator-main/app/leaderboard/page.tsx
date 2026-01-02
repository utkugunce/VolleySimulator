import { createServerSupabaseClient } from "../utils/supabase-server";
import LeaderboardClient from "./LeaderboardClient";

export const metadata = {
    title: "Sıralama Tablosu | VolleySimulator",
    description: "VolleySimulator sıralama tablosu ile en iyi tahmincileri görün.",
};

export default async function LeaderboardPage() {
    const supabase = await createServerSupabaseClient();

    // Fetch initial total leaderboard
    const { data: leaderboardData, error } = await supabase
        .from('leaderboard')
        .select('*')
        .order('total_points', { ascending: false })
        .limit(50);

    const rankedData = leaderboardData?.map((entry, index) => ({
        ...entry,
        rank: index + 1
    })) || [];

    // Get current user details
    const { data: { user } } = await supabase.auth.getUser();
    let userEntry = null;
    let userRank = null;

    if (user) {
        // Find user rank
        const { data: allData } = await supabase
            .from('leaderboard')
            .select('user_id')
            .order('total_points', { ascending: false });

        if (allData) {
            const userIndex = allData.findIndex(e => e.user_id === user.id);
            if (userIndex !== -1) {
                userRank = userIndex + 1;
                userEntry = rankedData.find(e => e.user_id === user.id) || null;

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

    return (
        <LeaderboardClient
            initialLeaderboard={rankedData}
            initialUserEntry={userEntry}
            initialUserRank={userRank}
        />
    );
}
