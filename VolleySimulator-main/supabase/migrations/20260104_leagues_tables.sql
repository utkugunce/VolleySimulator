-- Phase 2: Dynamic League Architecture - Database Schema
-- Migration: 20260104_leagues_tables.sql
-- Run in Supabase SQL Editor

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- LEAGUES TABLE (Merkezi lig konfigürasyonu)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.leagues (
    id TEXT PRIMARY KEY, -- 'vsl', '1lig', '2lig', 'cev-cl', 'cev-cup', 'cev-challenge'
    name TEXT NOT NULL,
    short_name TEXT NOT NULL,
    subtitle TEXT,
    season TEXT DEFAULT '2025-2026',
    country TEXT DEFAULT 'TR' CHECK (country IN ('TR', 'EU')),
    theme TEXT DEFAULT 'red' CHECK (theme IN ('red', 'amber', 'emerald', 'blue', 'rose', 'purple')),
    icon TEXT DEFAULT '🏆',
    has_groups BOOLEAN DEFAULT FALSE,
    has_rounds BOOLEAN DEFAULT FALSE,
    has_playoffs BOOLEAN DEFAULT TRUE,
    playoff_spots INTEGER DEFAULT 4,
    secondary_playoff_spots INTEGER DEFAULT 0,
    relegation_spots INTEGER DEFAULT 2,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TEAMS TABLE (Takımlar)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.teams (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    league_id TEXT NOT NULL REFERENCES public.leagues(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    short_name TEXT,
    slug TEXT NOT NULL,
    group_name TEXT, -- Grup ligleri için (A. Grup, B. Grup vb.)
    logo_url TEXT,
    primary_color TEXT,
    secondary_color TEXT,
    arena TEXT,
    city TEXT,
    strength_rating INTEGER DEFAULT 1000,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(league_id, slug)
);

-- ============================================================================
-- MATCHES TABLE (Maçlar/Fikstür)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.matches (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    league_id TEXT NOT NULL REFERENCES public.leagues(id) ON DELETE CASCADE,
    home_team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
    away_team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
    -- Denormalized team names for faster queries
    home_team_name TEXT NOT NULL,
    away_team_name TEXT NOT NULL,
    group_name TEXT,
    week INTEGER,
    round TEXT, -- CEV turnuvaları için (16th Round, Quarter Final vb.)
    match_date TIMESTAMPTZ,
    match_time TEXT, -- Saat bilgisi (14:00, 17:00 vb.)
    venue TEXT,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'finished', 'postponed', 'cancelled')),
    home_score INTEGER DEFAULT 0,
    away_score INTEGER DEFAULT 0,
    home_sets JSONB DEFAULT '[]'::jsonb, -- [25, 23, 25]
    away_sets JSONB DEFAULT '[]'::jsonb, -- [20, 25, 18]
    is_played BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- STANDINGS TABLE (Puan Durumu - Cache)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.standings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    league_id TEXT NOT NULL REFERENCES public.leagues(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    group_name TEXT,
    matches_played INTEGER DEFAULT 0,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    sets_won INTEGER DEFAULT 0,
    sets_lost INTEGER DEFAULT 0,
    points_scored INTEGER DEFAULT 0,
    points_conceded INTEGER DEFAULT 0,
    points INTEGER DEFAULT 0,
    set_ratio NUMERIC(5,3) DEFAULT 0,
    point_ratio NUMERIC(5,3) DEFAULT 0,
    rank INTEGER,
    form JSONB DEFAULT '[]'::jsonb, -- Son 5 maç: ['W', 'W', 'L', 'W', 'L']
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(league_id, team_id)
);

-- ============================================================================
-- PLAYOFF MATCHES TABLE (Playoff Maçları)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.playoff_matches (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    league_id TEXT NOT NULL REFERENCES public.leagues(id) ON DELETE CASCADE,
    stage TEXT NOT NULL, -- 'quarter', 'semi', 'final', '3rd_place', '5-8_semi', etc.
    match_number INTEGER DEFAULT 1, -- Seri içindeki maç numarası (1, 2, 3...)
    home_team_id UUID REFERENCES public.teams(id),
    away_team_id UUID REFERENCES public.teams(id),
    home_team_name TEXT,
    away_team_name TEXT,
    home_score INTEGER DEFAULT 0,
    away_score INTEGER DEFAULT 0,
    home_sets JSONB DEFAULT '[]'::jsonb,
    away_sets JSONB DEFAULT '[]'::jsonb,
    match_date TIMESTAMPTZ,
    status TEXT DEFAULT 'scheduled',
    series_home_wins INTEGER DEFAULT 0,
    series_away_wins INTEGER DEFAULT 0,
    series_completed BOOLEAN DEFAULT FALSE,
    winner_id UUID REFERENCES public.teams(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES (Performans için)
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_teams_league ON public.teams(league_id);
CREATE INDEX IF NOT EXISTS idx_teams_slug ON public.teams(slug);
CREATE INDEX IF NOT EXISTS idx_matches_league ON public.matches(league_id);
CREATE INDEX IF NOT EXISTS idx_matches_status ON public.matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_date ON public.matches(match_date);
CREATE INDEX IF NOT EXISTS idx_matches_week ON public.matches(week);
CREATE INDEX IF NOT EXISTS idx_standings_league ON public.standings(league_id);
CREATE INDEX IF NOT EXISTS idx_standings_rank ON public.standings(rank);
CREATE INDEX IF NOT EXISTS idx_playoff_matches_league ON public.playoff_matches(league_id);
CREATE INDEX IF NOT EXISTS idx_playoff_matches_stage ON public.playoff_matches(stage);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE public.leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.standings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playoff_matches ENABLE ROW LEVEL SECURITY;

-- Public read access policies
CREATE POLICY "Public read leagues" ON public.leagues FOR SELECT USING (true);
CREATE POLICY "Public read teams" ON public.teams FOR SELECT USING (true);
CREATE POLICY "Public read matches" ON public.matches FOR SELECT USING (true);
CREATE POLICY "Public read standings" ON public.standings FOR SELECT USING (true);
CREATE POLICY "Public read playoff_matches" ON public.playoff_matches FOR SELECT USING (true);

-- Service role write policies
CREATE POLICY "Service write leagues" ON public.leagues FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service write teams" ON public.teams FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service write matches" ON public.matches FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service write standings" ON public.standings FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service write playoff_matches" ON public.playoff_matches FOR ALL USING (auth.role() = 'service_role');

-- ============================================================================
-- TRIGGERS (Otomatik güncelleme)
-- ============================================================================

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
CREATE TRIGGER update_leagues_updated_at BEFORE UPDATE ON public.leagues
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON public.teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON public.matches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_standings_updated_at BEFORE UPDATE ON public.standings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_playoff_matches_updated_at BEFORE UPDATE ON public.playoff_matches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SEED DATA: Initial Leagues
-- ============================================================================
INSERT INTO public.leagues (id, name, short_name, subtitle, country, theme, icon, has_groups, has_playoffs, playoff_spots, secondary_playoff_spots, relegation_spots) VALUES
    ('vsl', 'Vodafone Sultanlar Ligi', 'VSL', 'Kadınlar • 2025-2026', 'TR', 'red', '🏆', false, true, 4, 4, 2),
    ('1lig', 'Arabica Coffee House 1. Lig', '1. Lig', 'Kadınlar • 2025-2026', 'TR', 'amber', '🥈', true, true, 2, 0, 2),
    ('2lig', 'Kadınlar 2. Lig', '2. Lig', 'Kadınlar • 2025-2026', 'TR', 'emerald', '🥉', true, true, 2, 0, 2),
    ('cev-cl', 'CEV Şampiyonlar Ligi', 'CEV CL', 'Kadınlar • 2025-2026', 'EU', 'blue', '⭐', true, true, 4, 0, 0),
    ('cev-cup', 'CEV Cup', 'CEV Cup', 'Kadınlar • 2025-2026', 'EU', 'amber', '🏅', false, true, 4, 0, 0),
    ('cev-challenge', 'CEV Challenge Cup', 'Challenge', 'Kadınlar • 2025-2026', 'EU', 'emerald', '🎯', false, true, 4, 0, 0)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    short_name = EXCLUDED.short_name,
    subtitle = EXCLUDED.subtitle,
    updated_at = NOW();

-- ============================================================================
-- VIEWS (Kolaylık için)
-- ============================================================================

-- League standings with team info
CREATE OR REPLACE VIEW public.league_standings_view AS
SELECT 
    s.*,
    t.name as team_name,
    t.short_name as team_short_name,
    t.logo_url as team_logo,
    t.slug as team_slug,
    l.name as league_name,
    l.short_name as league_short_name
FROM public.standings s
JOIN public.teams t ON s.team_id = t.id
JOIN public.leagues l ON s.league_id = l.id
ORDER BY s.league_id, s.group_name, s.rank;

-- Upcoming matches view
CREATE OR REPLACE VIEW public.upcoming_matches_view AS
SELECT 
    m.*,
    ht.name as home_team_display,
    ht.logo_url as home_team_logo,
    at.name as away_team_display,
    at.logo_url as away_team_logo,
    l.name as league_name
FROM public.matches m
LEFT JOIN public.teams ht ON m.home_team_id = ht.id
LEFT JOIN public.teams at ON m.away_team_id = at.id
JOIN public.leagues l ON m.league_id = l.id
WHERE m.status = 'scheduled' AND m.match_date >= NOW()
ORDER BY m.match_date;

COMMENT ON TABLE public.leagues IS 'Merkezi lig konfigürasyonu - lib/config/leagues.ts ile senkronize';
COMMENT ON TABLE public.teams IS 'Tüm liglerdeki takımlar';
COMMENT ON TABLE public.matches IS 'Fikstür ve maç sonuçları';
COMMENT ON TABLE public.standings IS 'Cache edilmiş puan durumu';
COMMENT ON TABLE public.playoff_matches IS 'Playoff serisi maçları';
