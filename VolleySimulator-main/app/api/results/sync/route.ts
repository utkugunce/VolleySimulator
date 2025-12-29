import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '../../../utils/supabase-server';

// Scoring constants
const SCORE_EXACT_MATCH = 15;      // Exact score prediction
const SCORE_WINNER_CORRECT = 8;    // Right winner, wrong score
const BONUS_STREAK_3 = 5;
const BONUS_STREAK_5 = 10;
const BONUS_STREAK_10 = 25;

function getWinner(score: string): 'home' | 'away' | 'draw' {
    const [home, away] = score.split('-').map(Number);
    if (home > away) return 'home';
    if (away > home) return 'away';
    return 'draw';
}

function calculatePoints(predicted: string, actual: string): number {
    if (predicted === actual) return SCORE_EXACT_MATCH;
    if (getWinner(predicted) === getWinner(actual)) return SCORE_WINNER_CORRECT;
    return 0;
}

// POST - Sync match results and score predictions
export async function POST(request: NextRequest) {
    try {
        // This endpoint should be called by a cron job or admin
        const authHeader = request.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET;

        // Simple auth check (you can enhance this)
        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = createServiceRoleClient();
        const body = await request.json();

        // Expect: { results: [{ matchId, resultScore, league, groupName, homeTeam, awayTeam, matchDate }] }
        const results = body.results || [];

        if (results.length === 0) {
            return NextResponse.json({ error: 'No results provided' }, { status: 400 });
        }

        let savedResults = 0;
        let scoredPredictions = 0;
        const userPointsMap = new Map<string, { points: number, correct: number, partial: number }>();

        for (const result of results) {
            // 1. Save/update match result
            const { error: resultError } = await supabase
                .from('match_results')
                .upsert({
                    match_id: result.matchId,
                    league: result.league,
                    group_name: result.groupName,
                    home_team: result.homeTeam,
                    away_team: result.awayTeam,
                    match_date: result.matchDate,
                    result_score: result.resultScore,
                    is_verified: true
                }, { onConflict: 'match_id' });

            if (!resultError) savedResults++;

            // 2. Find unscored predictions for this match
            const { data: predictions } = await supabase
                .from('predictions')
                .select('*')
                .eq('match_id', result.matchId)
                .eq('is_scored', false);

            if (predictions && predictions.length > 0) {
                for (const pred of predictions) {
                    const points = calculatePoints(pred.predicted_score, result.resultScore);
                    const isExact = pred.predicted_score === result.resultScore;
                    const isPartial = points === SCORE_WINNER_CORRECT;

                    // Update prediction with points
                    await supabase
                        .from('predictions')
                        .update({
                            points_earned: points,
                            is_scored: true
                        })
                        .eq('id', pred.id);

                    scoredPredictions++;

                    // Accumulate user points
                    const userId = pred.user_id;
                    const existing = userPointsMap.get(userId) || { points: 0, correct: 0, partial: 0 };
                    userPointsMap.set(userId, {
                        points: existing.points + points,
                        correct: existing.correct + (isExact ? 1 : 0),
                        partial: existing.partial + (isPartial ? 1 : 0)
                    });
                }
            }
        }

        // 3. Update leaderboard for all affected users
        for (const [userId, stats] of userPointsMap) {
            const { data: current } = await supabase
                .from('leaderboard')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (current) {
                const newStreak = stats.correct > 0
                    ? current.current_streak + stats.correct
                    : 0;

                // Calculate streak bonus
                let streakBonus = 0;
                if (newStreak >= 10) streakBonus = BONUS_STREAK_10;
                else if (newStreak >= 5) streakBonus = BONUS_STREAK_5;
                else if (newStreak >= 3) streakBonus = BONUS_STREAK_3;

                await supabase
                    .from('leaderboard')
                    .update({
                        total_points: current.total_points + stats.points + streakBonus,
                        weekly_points: current.weekly_points + stats.points + streakBonus,
                        monthly_points: current.monthly_points + stats.points + streakBonus,
                        correct_predictions: current.correct_predictions + stats.correct,
                        partial_predictions: current.partial_predictions + stats.partial,
                        total_predictions: current.total_predictions + stats.correct + stats.partial,
                        current_streak: newStreak,
                        best_streak: Math.max(current.best_streak, newStreak)
                    })
                    .eq('user_id', userId);
            }
        }

        return NextResponse.json({
            success: true,
            savedResults,
            scoredPredictions,
            usersUpdated: userPointsMap.size
        });
    } catch (error) {
        console.error('Results sync error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
