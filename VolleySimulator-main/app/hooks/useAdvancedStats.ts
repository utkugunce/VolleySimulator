"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { 
  TeamDetailedStats, 
  UserPredictionStats, 
  HeadToHeadStats,
  TeamForm
} from "../types";

interface TeamStatsInput {
  name: string;
  played: number;
  wins: number;
  points: number;
  setsWon: number;
  setsLost: number;
}

interface MatchResult {
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  date?: string;
}

export function useAdvancedStats(teams: TeamStatsInput[], matches: MatchResult[]) {
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Calculate detailed stats for all teams
  const teamStats = useMemo((): Map<string, TeamDetailedStats> => {
    const stats = new Map<string, TeamDetailedStats>();
    
    teams.forEach(team => {
      const teamMatches = matches.filter(
        m => m.homeTeam === team.name || m.awayTeam === team.name
      );
      
      const homeMatches = teamMatches.filter(m => m.homeTeam === team.name);
      const awayMatches = teamMatches.filter(m => m.awayTeam === team.name);
      
      const homeWins = homeMatches.filter(m => m.homeScore > m.awayScore).length;
      const awayWins = awayMatches.filter(m => m.awayScore > m.homeScore).length;
      
      // Calculate score-specific wins/losses
      const threeZeroWins = teamMatches.filter(m => 
        (m.homeTeam === team.name && m.homeScore === 3 && m.awayScore === 0) ||
        (m.awayTeam === team.name && m.awayScore === 3 && m.homeScore === 0)
      ).length;
      
      const threeOneWins = teamMatches.filter(m => 
        (m.homeTeam === team.name && m.homeScore === 3 && m.awayScore === 1) ||
        (m.awayTeam === team.name && m.awayScore === 3 && m.homeScore === 1)
      ).length;
      
      const threeTwoWins = teamMatches.filter(m => 
        (m.homeTeam === team.name && m.homeScore === 3 && m.awayScore === 2) ||
        (m.awayTeam === team.name && m.awayScore === 3 && m.homeScore === 2)
      ).length;
      
      const threeZeroLosses = teamMatches.filter(m => 
        (m.homeTeam === team.name && m.homeScore === 0 && m.awayScore === 3) ||
        (m.awayTeam === team.name && m.awayScore === 0 && m.homeScore === 3)
      ).length;
      
      const threeOneLosses = teamMatches.filter(m => 
        (m.homeTeam === team.name && m.homeScore === 1 && m.awayScore === 3) ||
        (m.awayTeam === team.name && m.awayScore === 1 && m.homeScore === 3)
      ).length;
      
      const threeTwoLosses = teamMatches.filter(m => 
        (m.homeTeam === team.name && m.homeScore === 2 && m.awayScore === 3) ||
        (m.awayTeam === team.name && m.awayScore === 2 && m.homeScore === 3)
      ).length;
      
      // Calculate last 10 results
      const sortedMatches = [...teamMatches].sort((a, b) => 
        new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()
      );
      
      const last10: ('W' | 'L')[] = sortedMatches.slice(0, 10).map(m => {
        const isHome = m.homeTeam === team.name;
        const won = isHome ? m.homeScore > m.awayScore : m.awayScore > m.homeScore;
        return won ? 'W' : 'L';
      });
      
      // Calculate current streak
      let currentStreak = 0;
      let streakType: 'W' | 'L' = 'W';
      
      for (const result of last10) {
        if (currentStreak === 0) {
          streakType = result;
          currentStreak = 1;
        } else if (result === streakType) {
          currentStreak++;
        } else {
          break;
        }
      }
      
      // ELO rating calculation (simplified)
      const eloRating = 1500 + (team.wins * 30) - ((team.played - team.wins) * 20) + 
        (team.setsWon - team.setsLost) * 2;
      
      stats.set(team.name, {
        teamName: team.name,
        league: '',
        season: '',
        played: team.played,
        wins: team.wins,
        losses: team.played - team.wins,
        points: team.points,
        setsWon: team.setsWon,
        setsLost: team.setsLost,
        setRatio: team.setsLost > 0 ? team.setsWon / team.setsLost : team.setsWon,
        avgPointsPerSet: team.setsWon > 0 ? (team.points / team.setsWon) * 25 : 0,
        avgPointsConcededPerSet: team.setsLost > 0 ? (team.points / team.setsLost) * 20 : 0,
        homeRecord: { wins: homeWins, losses: homeMatches.length - homeWins },
        awayRecord: { wins: awayWins, losses: awayMatches.length - awayWins },
        threeZeroWins,
        threeOneWins,
        threeTwoWins,
        threeZeroLosses,
        threeOneLosses,
        threeTwoLosses,
        currentStreak,
        streakType,
        last10,
        eloRating,
        strengthRank: 0, // Will be calculated after
      });
    });
    
    // Calculate strength rank
    const sortedByElo = [...stats.entries()]
      .sort((a, b) => b[1].eloRating - a[1].eloRating);
    
    sortedByElo.forEach(([name, teamStat], index) => {
      teamStat.strengthRank = index + 1;
      stats.set(name, teamStat);
    });
    
    return stats;
  }, [teams, matches]);

  // Get head-to-head stats between two teams
  const getHeadToHead = useCallback((team1: string, team2: string): HeadToHeadStats => {
    const h2hMatches = matches.filter(
      m => (m.homeTeam === team1 && m.awayTeam === team2) ||
           (m.homeTeam === team2 && m.awayTeam === team1)
    );
    
    let team1Wins = 0;
    let team2Wins = 0;
    let team1Sets = 0;
    let team2Sets = 0;
    
    h2hMatches.forEach(m => {
      const isTeam1Home = m.homeTeam === team1;
      if (isTeam1Home) {
        if (m.homeScore > m.awayScore) team1Wins++;
        else team2Wins++;
        team1Sets += m.homeScore;
        team2Sets += m.awayScore;
      } else {
        if (m.awayScore > m.homeScore) team1Wins++;
        else team2Wins++;
        team1Sets += m.awayScore;
        team2Sets += m.homeScore;
      }
    });
    
    return {
      totalMatches: h2hMatches.length,
      homeWins: team1Wins,
      awayWins: team2Wins,
      homeSetWins: team1Sets,
      awaySetWins: team2Sets,
      lastMeetings: h2hMatches.slice(0, 5).map(m => ({
        date: m.date || '',
        homeTeam: m.homeTeam,
        awayTeam: m.awayTeam,
        score: `${m.homeScore}-${m.awayScore}`,
        venue: '',
        competition: '',
      })),
      averageHomeScore: h2hMatches.length > 0 ? team1Sets / h2hMatches.length : 0,
      averageAwayScore: h2hMatches.length > 0 ? team2Sets / h2hMatches.length : 0,
    };
  }, [matches]);

  // Get team form
  const getTeamForm = useCallback((teamName: string): TeamForm => {
    const teamData = teamStats.get(teamName);
    
    if (!teamData) {
      return {
        teamName,
        last5Results: [],
        last5Scores: [],
        winRate: 0,
        avgPointsScored: 0,
        avgPointsConceded: 0,
        trend: 'stable',
        strengthRating: 0,
      };
    }
    
    const last5 = teamData.last10.slice(0, 5) as ('W' | 'L')[];
    const recentWins = last5.filter(r => r === 'W').length;
    const previousWins = teamData.last10.slice(5, 10).filter(r => r === 'W').length;
    
    let trend: 'improving' | 'declining' | 'stable' = 'stable';
    if (recentWins > previousWins + 1) trend = 'improving';
    else if (recentWins < previousWins - 1) trend = 'declining';
    
    return {
      teamName,
      last5Results: last5,
      last5Scores: [],
      winRate: teamData.played > 0 ? (teamData.wins / teamData.played) * 100 : 0,
      avgPointsScored: teamData.avgPointsPerSet,
      avgPointsConceded: teamData.avgPointsConcededPerSet,
      trend,
      strengthRating: teamData.eloRating,
    };
  }, [teamStats]);

  // Get top performers in various categories
  const getTopPerformers = useCallback((category: keyof TeamDetailedStats, count: number = 5) => {
    return [...teamStats.values()]
      .sort((a, b) => {
        const aVal = a[category];
        const bVal = b[category];
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return bVal - aVal;
        }
        return 0;
      })
      .slice(0, count);
  }, [teamStats]);

  // Get comparison between teams
  const compareTeams = useCallback((team1: string, team2: string) => {
    const stats1 = teamStats.get(team1);
    const stats2 = teamStats.get(team2);
    
    if (!stats1 || !stats2) return null;
    
    const h2h = getHeadToHead(team1, team2);
    
    return {
      team1: stats1,
      team2: stats2,
      headToHead: h2h,
      comparison: {
        winRate: {
          team1: stats1.played > 0 ? (stats1.wins / stats1.played) * 100 : 0,
          team2: stats2.played > 0 ? (stats2.wins / stats2.played) * 100 : 0,
        },
        setRatio: {
          team1: stats1.setRatio,
          team2: stats2.setRatio,
        },
        elo: {
          team1: stats1.eloRating,
          team2: stats2.eloRating,
        },
        form: {
          team1: stats1.last10.slice(0, 5).filter(r => r === 'W').length,
          team2: stats2.last10.slice(0, 5).filter(r => r === 'W').length,
        },
      },
    };
  }, [teamStats, getHeadToHead]);

  return {
    teamStats,
    selectedTeam,
    setSelectedTeam,
    getHeadToHead,
    getTeamForm,
    getTopPerformers,
    compareTeams,
    isLoading,
    getTeamDetails: (name: string) => teamStats.get(name),
  };
}

// Hook for user prediction stats
export function useUserPredictionStats(userId: string) {
  const [stats, setStats] = useState<UserPredictionStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!userId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/users/${userId}/prediction-stats`);
      
      if (!response.ok) throw new Error('Failed to fetch prediction stats');
      
      const data = await response.json();
      setStats(data.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    isLoading,
    error,
    refetch: fetchStats,
  };
}
