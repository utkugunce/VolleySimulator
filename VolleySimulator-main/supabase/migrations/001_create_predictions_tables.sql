-- Supabase Migration: Create predictions and user_stats tables
-- Run this in your Supabase SQL Editor

-- ============================================
-- PREDICTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    league VARCHAR(20) NOT NULL CHECK (league IN ('vsl', '1lig', '2lig', 'cev-cl')),
    group_name VARCHAR(20),
    match_id VARCHAR(255) NOT NULL,
    score VARCHAR(5) NOT NULL CHECK (score ~ '^[0-3]-[0-3]$'),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure one prediction per match per user
    UNIQUE(user_id, league, match_id)
);

-- Enable RLS
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;

-- Users can only access their own predictions
CREATE POLICY "Users can view own predictions" ON predictions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own predictions" ON predictions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own predictions" ON predictions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own predictions" ON predictions
    FOR DELETE USING (auth.uid() = user_id);

-- Index for fast lookups
CREATE INDEX idx_predictions_user_league ON predictions(user_id, league);
CREATE INDEX idx_predictions_user_league_group ON predictions(user_id, league, group_name);

-- ============================================
-- USER STATS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_stats (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    xp INTEGER DEFAULT 0 CHECK (xp >= 0),
    level INTEGER DEFAULT 1 CHECK (level >= 1),
    favorite_team VARCHAR(100),
    achievements JSONB DEFAULT '[]'::jsonb,
    stats JSONB DEFAULT '{
        "totalPredictions": 0,
        "correctPredictions": 0,
        "currentStreak": 0,
        "bestStreak": 0,
        "predictedChampions": []
    }'::jsonb,
    sound_enabled BOOLEAN DEFAULT true,
    last_active_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- Users can only access their own stats
CREATE POLICY "Users can view own stats" ON user_stats
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stats" ON user_stats
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stats" ON user_stats
    FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- TRIGGERS FOR updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_predictions_updated_at
    BEFORE UPDATE ON predictions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_stats_updated_at
    BEFORE UPDATE ON user_stats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
