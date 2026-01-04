import { createClient } from '@/app/lib/supabase/supabase-server';
import { NextResponse } from 'next/server';
import { isValidLeagueId } from '@/lib/config/leagues';
import type { Database } from '@/types/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 60; // 1 dakika cache

export async function GET(
  request: Request,
  { params }: { params: Promise<{ leagueId: string }> }
) {
  try {
    const { leagueId } = await params;

    // Validate league ID
    if (!isValidLeagueId(leagueId)) {
      return NextResponse.json(
        { error: 'Invalid league ID' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Paralel sorgular - tüm verileri aynı anda çek
    const [teamsResult, standingsResult, matchesResult, leagueResult] = await Promise.all([
      // Takımlar
      supabase
        .from('teams')
        .select('*')
        .eq('league_id', leagueId)
        .order('name'),

      // Puan durumu (standings view kullan)
      supabase
        .from('standings')
        .select(`
          *,
          team:teams(id, name, short_name, slug, logo_url, group_name)
        `)
        .eq('league_id', leagueId)
        .order('group_name')
        .order('rank'),

      // Maçlar
      supabase
        .from('matches')
        .select('*')
        .eq('league_id', leagueId)
        .order('week')
        .order('match_date'),

      // Lig bilgisi
      supabase
        .from('leagues')
        .select('*')
        .eq('id', leagueId)
        .single()
    ]);

    // Hata kontrolü
    if (teamsResult.error) {
      console.error('Teams fetch error:', teamsResult.error);
    }
    if (standingsResult.error) {
      console.error('Standings fetch error:', standingsResult.error);
    }
    if (matchesResult.error) {
      console.error('Matches fetch error:', matchesResult.error);
    }

    // Standings'i frontend formatına dönüştür
    const formattedStandings = (standingsResult.data || []).map((s: any) => ({
      name: s.team?.name || '',
      groupName: s.group_name || s.team?.group_name || '',
      played: s.matches_played,
      wins: s.wins,
      losses: s.losses,
      points: s.points,
      setsWon: s.sets_won,
      setsLost: s.sets_lost,
      setRatio: s.set_ratio,
      form: s.form || [],
      rank: s.rank,
      // Ek bilgiler
      teamId: s.team_id,
      teamSlug: s.team?.slug,
      logoUrl: s.team?.logo_url
    }));

    // Maçları frontend formatına dönüştür
    const formattedMatches = (matchesResult.data || []).map((m: any) => ({
      homeTeam: m.home_team_name,
      awayTeam: m.away_team_name,
      groupName: m.group_name,
      week: m.week,
      matchDate: m.match_date,
      score: m.is_played ? `${m.home_score}-${m.away_score}` : null,
      isPlayed: m.is_played,
      status: m.status,
      // Ek bilgiler
      id: m.id,
      homeTeamId: m.home_team_id,
      awayTeamId: m.away_team_id,
      homeSets: m.home_sets,
      awaySets: m.away_sets
    }));

    // Grupları çıkar
    const groups = [...new Set(formattedStandings.map((t: any) => t.groupName).filter(Boolean))].sort();

    return NextResponse.json({
      league: leagueResult.data,
      teams: formattedStandings,
      fixture: formattedMatches,
      groups,
      stats: {
        totalTeams: formattedStandings.length,
        totalMatches: formattedMatches.length,
        playedMatches: formattedMatches.filter((m: any) => m.isPlayed).length,
        upcomingMatches: formattedMatches.filter((m: any) => !m.isPlayed).length
      },
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('League data API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
