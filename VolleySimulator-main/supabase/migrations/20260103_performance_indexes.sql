-- Performance Indexes for VolleySimulator
-- Run this migration to optimize database queries

-- ============================================================================
-- PREDICTIONS TABLE INDEXES
-- ============================================================================

-- Index for user predictions lookup (most common query)
CREATE INDEX IF NOT EXISTS idx_predictions_user_id ON public.predictions(user_id);

-- Composite index for user + league queries
CREATE INDEX IF NOT EXISTS idx_predictions_user_league ON public.predictions(user_id, league);

-- Index for match lookups
CREATE INDEX IF NOT EXISTS idx_predictions_match_id ON public.predictions(match_id);

-- Index for unscored predictions (for scoring batch jobs)
CREATE INDEX IF NOT EXISTS idx_predictions_unscored ON public.predictions(is_scored) WHERE is_scored = FALSE;

-- Index for date range queries
CREATE INDEX IF NOT EXISTS idx_predictions_match_date ON public.predictions(match_date);

-- ============================================================================
-- MATCH RESULTS TABLE INDEXES
-- ============================================================================

-- Index for league filtering
CREATE INDEX IF NOT EXISTS idx_match_results_league ON public.match_results(league);

-- Index for date queries
CREATE INDEX IF NOT EXISTS idx_match_results_date ON public.match_results(match_date);

-- Composite index for league + date queries
CREATE INDEX IF NOT EXISTS idx_match_results_league_date ON public.match_results(league, match_date);

-- ============================================================================
-- LEADERBOARD TABLE INDEXES
-- ============================================================================

-- Index for ranking queries (sorted by points descending)
CREATE INDEX IF NOT EXISTS idx_leaderboard_points ON public.leaderboard(total_points DESC);

-- Index for league-specific leaderboards
CREATE INDEX IF NOT EXISTS idx_leaderboard_vsl_points ON public.leaderboard(vsl_points DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_leaderboard_1lig_points ON public.leaderboard(lig1_points DESC NULLS LAST);

-- ============================================================================
-- USER PROFILES TABLE INDEXES
-- ============================================================================

-- Index for XP ranking
CREATE INDEX IF NOT EXISTS idx_user_profiles_xp ON public.user_profiles(xp DESC);

-- Index for level queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_level ON public.user_profiles(level);

-- ============================================================================
-- PUSH SUBSCRIPTIONS TABLE INDEXES
-- ============================================================================

-- Index for user lookups
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user ON public.push_subscriptions(user_id);

-- ============================================================================
-- STATISTICS / ANALYTICS
-- ============================================================================

-- Comment on indexes for documentation
COMMENT ON INDEX idx_predictions_user_id IS 'Primary index for user prediction lookups';
COMMENT ON INDEX idx_leaderboard_points IS 'Index for leaderboard ranking queries';
COMMENT ON INDEX idx_match_results_league_date IS 'Composite index for filtering matches by league and date';

-- ============================================================================
-- VACUUM AND ANALYZE (run periodically)
-- ============================================================================

-- Analyze tables to update statistics for query planner
ANALYZE public.predictions;
ANALYZE public.match_results;
ANALYZE public.leaderboard;
ANALYZE public.user_profiles;
