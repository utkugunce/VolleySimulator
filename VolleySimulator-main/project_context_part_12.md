# Project Application Context - Part 12

## File: app\hooks\useAdvancedStats.ts
```
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

```

## File: app\hooks\useAIPredictions.ts
```
"use client";

import { useState, useCallback } from "react";
import { 
  AIPrediction, 
  AIMatchAnalysis, 
  HeadToHeadStats, 
  TeamForm 
} from "../types";

interface UseAIPredictionsOptions {
  cacheTime?: number; // ms
}

interface UseAIPredictionsReturn {
  isLoading: boolean;
  error: string | null;
  getPrediction: (homeTeam: string, awayTeam: string, league: string) => Promise<AIPrediction | null>;
  getMatchAnalysis: (homeTeam: string, awayTeam: string, league: string) => Promise<AIMatchAnalysis | null>;
  getHeadToHead: (team1: string, team2: string) => Promise<HeadToHeadStats | null>;
  getTeamForm: (teamName: string, league: string) => Promise<TeamForm | null>;
  getBulkPredictions: (matches: { homeTeam: string; awayTeam: string }[], league: string) => Promise<AIPrediction[]>;
}

// Simple in-memory cache
const predictionCache = new Map<string, { data: AIPrediction; timestamp: number }>();
const analysisCache = new Map<string, { data: AIMatchAnalysis; timestamp: number }>();

export function useAIPredictions(options: UseAIPredictionsOptions = {}): UseAIPredictionsReturn {
  const { cacheTime = 5 * 60 * 1000 } = options; // 5 minutes default
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get AI prediction for a match
  const getPrediction = useCallback(async (
    homeTeam: string, 
    awayTeam: string, 
    league: string
  ): Promise<AIPrediction | null> => {
    const cacheKey = `${league}-${homeTeam}-${awayTeam}`;
    
    // Check cache
    const cached = predictionCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < cacheTime) {
      return cached.data;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/ai/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ homeTeam, awayTeam, league }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get AI prediction');
      }
      
      const data = await response.json();
      const prediction = data.prediction as AIPrediction;
      
      // Cache result
      predictionCache.set(cacheKey, { data: prediction, timestamp: Date.now() });
      
      return prediction;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [cacheTime]);

  // Get detailed match analysis
  const getMatchAnalysis = useCallback(async (
    homeTeam: string, 
    awayTeam: string, 
    league: string
  ): Promise<AIMatchAnalysis | null> => {
    const cacheKey = `analysis-${league}-${homeTeam}-${awayTeam}`;
    
    // Check cache
    const cached = analysisCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < cacheTime) {
      return cached.data;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ homeTeam, awayTeam, league }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get match analysis');
      }
      
      const data = await response.json();
      const analysis = data.analysis as AIMatchAnalysis;
      
      // Cache result
      analysisCache.set(cacheKey, { data: analysis, timestamp: Date.now() });
      
      return analysis;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [cacheTime]);

  // Get head-to-head stats
  const getHeadToHead = useCallback(async (
    team1: string, 
    team2: string
  ): Promise<HeadToHeadStats | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/stats/h2h?team1=${encodeURIComponent(team1)}&team2=${encodeURIComponent(team2)}`);
      
      if (!response.ok) {
        throw new Error('Failed to get head-to-head stats');
      }
      
      const data = await response.json();
      return data.stats as HeadToHeadStats;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get team form
  const getTeamForm = useCallback(async (
    teamName: string, 
    league: string
  ): Promise<TeamForm | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/stats/form?team=${encodeURIComponent(teamName)}&league=${encodeURIComponent(league)}`);
      
      if (!response.ok) {
        throw new Error('Failed to get team form');
      }
      
      const data = await response.json();
      return data.form as TeamForm;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get bulk predictions for multiple matches
  const getBulkPredictions = useCallback(async (
    matches: { homeTeam: string; awayTeam: string }[],
    league: string
  ): Promise<AIPrediction[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/ai/predict/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ matches, league }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get bulk predictions');
      }
      
      const data = await response.json();
      return data.predictions as AIPrediction[];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    getPrediction,
    getMatchAnalysis,
    getHeadToHead,
    getTeamForm,
    getBulkPredictions,
  };
}

// Utility function to generate simple AI prediction locally (fallback)
export function generateLocalPrediction(
  homeTeam: string,
  awayTeam: string,
  homeStats: { wins: number; played: number; setsWon: number; setsLost: number },
  awayStats: { wins: number; played: number; setsWon: number; setsLost: number }
): AIPrediction {
  // Calculate win rates
  const homeWinRate = homeStats.played > 0 ? homeStats.wins / homeStats.played : 0.5;
  const awayWinRate = awayStats.played > 0 ? awayStats.wins / awayStats.played : 0.5;
  
  // Calculate set ratios
  const homeSetRatio = homeStats.setsLost > 0 ? homeStats.setsWon / homeStats.setsLost : homeStats.setsWon || 1;
  const awaySetRatio = awayStats.setsLost > 0 ? awayStats.setsWon / awayStats.setsLost : awayStats.setsWon || 1;
  
  // Home advantage factor
  const homeAdvantage = 0.05;
  
  // Calculate probabilities
  let homeWinProb = (homeWinRate + homeAdvantage + (1 - awayWinRate)) / 2;
  let awayWinProb = 1 - homeWinProb;
  
  // Adjust based on set ratio
  const setRatioFactor = homeSetRatio / (homeSetRatio + awaySetRatio);
  homeWinProb = (homeWinProb + setRatioFactor) / 2;
  awayWinProb = 1 - homeWinProb;
  
  // Normalize to percentages
  homeWinProb = Math.round(homeWinProb * 100);
  awayWinProb = Math.round(awayWinProb * 100);
  
  // Determine predicted score
  let predictedScore: string;
  if (homeWinProb > 65) {
    predictedScore = '3-0';
  } else if (homeWinProb > 55) {
    predictedScore = '3-1';
  } else if (homeWinProb > 45) {
    predictedScore = homeWinProb > 50 ? '3-2' : '2-3';
  } else if (awayWinProb > 55) {
    predictedScore = '1-3';
  } else {
    predictedScore = '0-3';
  }
  
  // Calculate confidence
  const confidence = Math.max(homeWinProb, awayWinProb);
  
  return {
    matchId: `${homeTeam}-${awayTeam}`,
    homeTeam,
    awayTeam,
    predictedScore,
    confidence,
    homeWinProbability: homeWinProb,
    awayWinProbability: awayWinProb,
    analysis: generateAnalysisText(homeTeam, awayTeam, homeWinProb, awayWinProb),
    factors: [
      {
        name: 'Galibiyet Oranı',
        description: `${homeTeam}: ${Math.round(homeWinRate * 100)}%, ${awayTeam}: ${Math.round(awayWinRate * 100)}%`,
        impact: homeWinRate > awayWinRate ? 'positive' : 'negative',
        weight: 0.4,
        team: homeWinRate > awayWinRate ? 'home' : 'away',
      },
      {
        name: 'Set Oranı',
        description: `${homeTeam}: ${homeSetRatio.toFixed(2)}, ${awayTeam}: ${awaySetRatio.toFixed(2)}`,
        impact: homeSetRatio > awaySetRatio ? 'positive' : 'negative',
        weight: 0.3,
        team: homeSetRatio > awaySetRatio ? 'home' : 'away',
      },
      {
        name: 'Ev Sahibi Avantajı',
        description: `${homeTeam} ev sahibi olarak oynuyor`,
        impact: 'positive',
        weight: 0.15,
        team: 'home',
      },
    ],
    lastUpdated: new Date().toISOString(),
  };
}

function generateAnalysisText(
  homeTeam: string, 
  awayTeam: string, 
  homeWinProb: number, 
  awayWinProb: number
): string {
  if (homeWinProb > 70) {
    return `${homeTeam} bu maçta açık favori. Ev sahibi avantajı ve form durumu göz önüne alındığında rahat bir galibiyet bekleniyor.`;
  } else if (homeWinProb > 55) {
    return `${homeTeam} hafif favori görünüyor. Ancak ${awayTeam} sürpriz yapabilecek kapasitede. Çekişmeli bir maç olması bekleniyor.`;
  } else if (awayWinProb > 55) {
    return `${awayTeam} deplasmana rağmen favorisi. ${homeTeam} ev sahibi avantajını kullanmakta zorlanabilir.`;
  } else {
    return `İki takım arasında dengeli bir mücadele bekleniyor. Her iki taraf da galibiyete yakın, maç son setlere gidebilir.`;
  }
}

```

## File: app\hooks\useLeagueQuery.ts
```
"use client";

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { TeamStats, Match } from '../types';

interface RoundData {
    name?: string;
    matches?: Match[];
}

interface PoolData {
    name?: string;
    teams?: TeamStats[];
}

interface LeagueData {
    teams: TeamStats[];
    fixture: Match[];
    groups?: string[];
    rounds?: RoundData[];
    pools?: PoolData[];
}

interface LeagueConfig {
    hasGroups: boolean;
    apiEndpoint: string;
    name: string;
}

export function useLeagueQuery(
    leagueId: string,
    config: LeagueConfig,
    options?: {
        enabled?: boolean;
    }
) {
    return useQuery({
        queryKey: ['league', leagueId],
        queryFn: async () => {
            const res = await fetch(config.apiEndpoint);
            if (!res.ok) throw new Error(`Failed to fetch ${leagueId} data`);

            const json = await res.json();

            // Normalize data structure
            const normalizedData: LeagueData = {
                teams: json.teams || [],
                fixture: json.fixture || json.matches || [],
                groups: json.groups || (config.hasGroups ? extractGroups(json.teams) : undefined),
                rounds: json.rounds || undefined,
                pools: json.pools || undefined
            };

            return normalizedData;
        },
        staleTime: 1000 * 60 * 10, // 10 minutes
        gcTime: 1000 * 60 * 30, // 30 minutes
        retry: 2,
        enabled: options?.enabled !== false,
    });
}

export function useLeagueData(leagueId: string, config: LeagueConfig) {
    return useQuery({
        queryKey: ['league', leagueId, 'data'],
        queryFn: async () => {
            const res = await fetch(config.apiEndpoint);
            if (!res.ok) throw new Error(`Failed to fetch ${leagueId} data`);
            return res.json();
        },
        staleTime: 1000 * 60 * 10,
        gcTime: 1000 * 60 * 30,
        retry: 2,
    });
}

export function useInvalidateLeague(leagueId: string) {
    const queryClient = useQueryClient();
    
    return {
        invalidate: () => {
            queryClient.invalidateQueries({
                queryKey: ['league', leagueId]
            });
        },
        refetch: () => {
            queryClient.refetchQueries({
                queryKey: ['league', leagueId]
            });
        }
    };
}

// Helper to extract unique groups from teams
function extractGroups(teams: TeamStats[]): string[] {
    const groups = [...new Set(teams.map(t => t.groupName))].filter(Boolean);
    return groups.sort((a, b) => {
        const numA = parseInt(a.match(/\d+/)?.[0] || '0');
        const numB = parseInt(b.match(/\d+/)?.[0] || '0');
        return numA - numB;
    });
}

```

## File: app\hooks\useLocalStorage.ts
```
"use client";

import { useState, useEffect, useCallback } from 'react';

/**
 * Type-safe localStorage hook with SSR support
 */
export function useLocalStorage<T>(
    key: string,
    initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
    // State to store our value
    const [storedValue, setStoredValue] = useState<T>(initialValue);
    const [isHydrated, setIsHydrated] = useState(false);

    // Hydrate from localStorage after mount
    useEffect(() => {
        const value = (() => {
            try {
                const item = window.localStorage.getItem(key);
                return item ? JSON.parse(item) : initialValue;
            } catch (error) {
                console.warn(`Error reading localStorage key "${key}":`, error);
                return initialValue;
            }
        })();

        // Defer state updates to avoid "cascading renders" warning 
        // and ensure the initial render matches the server output.
        Promise.resolve().then(() => {
            setStoredValue(value);
            setIsHydrated(true);
        });
    }, [key, initialValue]);

    // Return a wrapped version of useState's setter function
    const setValue = useCallback((value: T | ((prev: T) => T)) => {
        try {
            // Allow value to be a function for same API as useState
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);

            if (typeof window !== 'undefined') {
                window.localStorage.setItem(key, JSON.stringify(valueToStore));
            }
        } catch (error) {
            console.warn(`Error setting localStorage key "${key}":`, error);
        }
    }, [key, storedValue]);

    // Remove from localStorage
    const removeValue = useCallback(() => {
        try {
            setStoredValue(initialValue);
            if (typeof window !== 'undefined') {
                window.localStorage.removeItem(key);
            }
        } catch (error) {
            console.warn(`Error removing localStorage key "${key}":`, error);
        }
    }, [key, initialValue]);

    return [storedValue, setValue, removeValue];
}

export default useLocalStorage;

```

## File: app\hooks\useMatchSimulation.ts
```
"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  MatchSimulation,
  SimulatedSet,
  SimulatedPoint,
  SimulationMoment
} from "../types";

interface UseMatchSimulationOptions {
  speed?: number; // Animation speed multiplier
  autoPlay?: boolean;
}

interface UseMatchSimulationReturn {
  simulation: MatchSimulation | null;
  isSimulating: boolean;
  isPlaying: boolean;
  currentSet: number;
  currentPoint: number;
  progress: number; // 0-100
  // Actions
  startSimulation: (homeTeam: string, awayTeam: string) => Promise<void>;
  play: () => void;
  pause: () => void;
  reset: () => void;
  skipToEnd: () => void;
  setSpeed: (speed: number) => void;
}

// Simulate a single set
const simulateSet = (
  setNumber: number,
  endScore: number,
  homeTeam: string,
  awayTeam: string
): SimulatedSet => {
  const points: SimulatedPoint[] = [];
  let homeScore = 0;
  let awayScore = 0;
  let pointNumber = 0;

  // Randomly determine which team is slightly favored
  const homeBias = 0.48 + Math.random() * 0.08; // 48-56% for home

  while (true) {
    pointNumber++;

    // Determine point type
    const types: Array<'attack' | 'block' | 'ace' | 'error'> = ['attack', 'attack', 'attack', 'block', 'ace', 'error'];
    const type = types[Math.floor(Math.random() * types.length)];

    // Determine scorer
    const scorer = Math.random() < homeBias ? 'home' : 'away';

    if (scorer === 'home') {
      homeScore++;
    } else {
      awayScore++;
    }

    points.push({
      pointNumber,
      homeScore,
      awayScore,
      scorer,
      type,
    });

    // Check if set is over
    const maxScore = Math.max(homeScore, awayScore);
    const minScore = Math.min(homeScore, awayScore);

    if (maxScore >= endScore && maxScore - minScore >= 2) {
      break;
    }

    // Safety limit
    if (pointNumber > 100) break;
  }

  return {
    setNumber,
    homePoints: homeScore,
    awayPoints: awayScore,
    winner: homeScore > awayScore ? 'home' : 'away',
    pointByPoint: points,
  };
};

export function useMatchSimulation(
  options: UseMatchSimulationOptions = {}
): UseMatchSimulationReturn {
  const { speed: initialSpeed = 1, autoPlay = true } = options;

  const [simulation, setSimulation] = useState<MatchSimulation | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSet, setCurrentSet] = useState(0);
  const [currentPoint, setCurrentPoint] = useState(0);
  const [speed, setSpeedState] = useState(initialSpeed);

  const animationRef = useRef<NodeJS.Timeout | null>(null);
  const progressRef = useRef(0);
  const [progressState, setProgressState] = useState(0);

  // Generate a simulated match
  const generateSimulation = useCallback((
    homeTeam: string,
    awayTeam: string
  ): MatchSimulation => {
    const sets: SimulatedSet[] = [];
    let homeSetsWon = 0;
    let awaySetsWon = 0;
    let setNumber = 0;
    const moments: SimulationMoment[] = [];
    let totalDuration = 0;

    // Simulate sets until one team wins 3
    while (homeSetsWon < 3 && awaySetsWon < 3) {
      setNumber++;
      const isDecidingSet = homeSetsWon === 2 && awaySetsWon === 2;
      const setEndScore = isDecidingSet ? 15 : 25;

      const set = simulateSet(setNumber, setEndScore, homeTeam, awayTeam);
      sets.push(set);

      if (set.winner === 'home') {
        homeSetsWon++;
      } else {
        awaySetsWon++;
      }

      // Add set end moment
      moments.push({
        time: totalDuration + set.pointByPoint.length * 2,
        type: 'set_point',
        description: `${set.winner === 'home' ? homeTeam : awayTeam} ${setNumber}. seti kazandı (${set.homePoints}-${set.awayPoints})`,
      });

      totalDuration += set.pointByPoint.length * 2;
    }

    const winner = homeSetsWon === 3 ? homeTeam : awayTeam;

    // Add match end moment
    moments.push({
      time: totalDuration,
      type: 'match_point',
      description: `${winner} maçı kazandı! (${homeSetsWon}-${awaySetsWon})`,
    });

    return {
      matchId: `sim-${Date.now()}`,
      homeTeam,
      awayTeam,
      simulatedSets: sets,
      finalScore: `${homeSetsWon}-${awaySetsWon}`,
      winner,
      keyMoments: moments,
      duration: totalDuration,
    };
  }, []);

  // Calculate progress - use state to avoid accessing ref during render
  const progress = simulation
    ? (progressState / simulation.duration) * 100
    : 0;

  // Start simulation
  const startSimulation = useCallback(async (
    homeTeam: string,
    awayTeam: string
  ) => {
    setIsSimulating(true);
    setCurrentSet(0);
    setCurrentPoint(0);
    progressRef.current = 0;
    setProgressState(0);

    // Generate simulation
    const sim = generateSimulation(homeTeam, awayTeam);
    setSimulation(sim);
    setIsSimulating(false);

    if (autoPlay) {
      setIsPlaying(true);
    }
  }, [generateSimulation, autoPlay]);

  // Play animation
  const play = useCallback(() => {
    if (!simulation) return;
    setIsPlaying(true);
  }, [simulation]);

  // Pause animation
  const pause = useCallback(() => {
    setIsPlaying(false);
    if (animationRef.current) {
      clearTimeout(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  // Reset simulation
  const reset = useCallback(() => {
    pause();
    setCurrentSet(0);
    setCurrentPoint(0);
    progressRef.current = 0;
    setProgressState(0);
  }, [pause]);

  // Skip to end
  const skipToEnd = useCallback(() => {
    if (!simulation) return;

    pause();
    setCurrentSet(simulation.simulatedSets.length - 1);
    const lastSet = simulation.simulatedSets[simulation.simulatedSets.length - 1];
    setCurrentPoint(lastSet.pointByPoint.length - 1);
    progressRef.current = simulation.duration;
    setProgressState(simulation.duration);
  }, [simulation, pause]);

  // Set speed
  const setSpeed = useCallback((newSpeed: number) => {
    setSpeedState(Math.max(0.25, Math.min(4, newSpeed)));
  }, []);

  // Animation loop
  useEffect(() => {
    if (!isPlaying || !simulation) return;

    const animate = () => {
      progressRef.current += 2 * speed;
      setProgressState(progressRef.current);

      // Find current set and point based on progress
      let elapsed = 0;
      let foundSet = 0;
      let foundPoint = 0;

      for (let s = 0; s < simulation.simulatedSets.length; s++) {
        const set = simulation.simulatedSets[s];
        for (let p = 0; p < set.pointByPoint.length; p++) {
          elapsed += 2;
          if (elapsed >= progressRef.current) {
            foundSet = s;
            foundPoint = p;
            break;
          }
        }
        if (elapsed >= progressRef.current) break;
      }

      setCurrentSet(foundSet);
      setCurrentPoint(foundPoint);

      // Check if animation is complete
      if (progressRef.current >= simulation.duration) {
        setIsPlaying(false);
        return;
      }

      animationRef.current = setTimeout(animate, 50 / speed);
    };

    animationRef.current = setTimeout(animate, 50 / speed);

    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, [isPlaying, simulation, speed]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, []);

  return {
    simulation,
    isSimulating,
    isPlaying,
    currentSet,
    currentPoint,
    progress,
    startSimulation,
    play,
    pause,
    reset,
    skipToEnd,
    setSpeed,
  };
}

// Utility to get current state of simulation
export function getSimulationState(
  simulation: MatchSimulation,
  setIndex: number,
  pointIndex: number
) {
  const currentSetData = simulation.simulatedSets[setIndex];
  const currentPointData = currentSetData?.pointByPoint[pointIndex];

  let homeSetsWon = 0;
  let awaySetsWon = 0;

  for (let i = 0; i < setIndex; i++) {
    if (simulation.simulatedSets[i].winner === 'home') {
      homeSetsWon++;
    } else {
      awaySetsWon++;
    }
  }

  return {
    setScore: { home: homeSetsWon, away: awaySetsWon },
    currentSetScore: currentPointData
      ? { home: currentPointData.homeScore, away: currentPointData.awayScore }
      : { home: 0, away: 0 },
    lastPoint: currentPointData,
    isComplete: setIndex >= simulation.simulatedSets.length - 1 &&
      pointIndex >= currentSetData.pointByPoint.length - 1,
  };
}

```

## File: app\hooks\useModal.ts
```
'use client';

import { useEffect, useCallback, useRef } from 'react';

interface UseModalOptions {
  isOpen: boolean;
  onClose: () => void;
  closeOnEscape?: boolean;
  closeOnBackdrop?: boolean;
  trapFocus?: boolean;
}

/**
 * Hook for accessible modal behavior
 * - Escape key to close
 * - Focus trap within modal
 * - Click outside to close
 * - Prevents body scroll when open
 */
export function useModal({
  isOpen,
  onClose,
  closeOnEscape = true,
  closeOnBackdrop = true,
  trapFocus = true,
}: UseModalOptions) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Handle escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (closeOnEscape && e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }

      // Focus trap
      if (trapFocus && e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    },
    [closeOnEscape, trapFocus, onClose]
  );

  // Handle backdrop click
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (closeOnBackdrop && e.target === e.currentTarget) {
        onClose();
      }
    },
    [closeOnBackdrop, onClose]
  );

  useEffect(() => {
    if (isOpen) {
      // Store current active element
      previousActiveElement.current = document.activeElement as HTMLElement;
      
      // Add event listener
      document.addEventListener('keydown', handleKeyDown);
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
      
      // Focus first focusable element in modal
      if (trapFocus && modalRef.current) {
        const firstFocusable = modalRef.current.querySelector<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        firstFocusable?.focus();
      }
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      
      // Restore focus to previous element
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [isOpen, handleKeyDown, trapFocus]);

  return {
    modalRef,
    handleBackdropClick,
  };
}

```

## File: app\hooks\usePerformance.ts
```
"use client";

import { useEffect } from 'react';

declare global {
    interface Window {
        gtag?: (...args: unknown[]) => void;
    }
}

// Extended PerformanceEntry types for Web Vitals
interface LCPEntry extends PerformanceEntry {
    renderTime?: number;
    loadTime?: number;
}

interface LayoutShiftEntry extends PerformanceEntry {
    hadRecentInput?: boolean;
    value: number;
}

interface InteractionEntry extends PerformanceEntry {
    processingDuration?: number;
}

interface WebVitals {
    name: string;
    value: number;
    rating?: 'good' | 'needs-improvement' | 'poor';
}

/**
 * Track Web Vitals (LCP, FID, CLS)
 * Useful for performance monitoring and optimization
 */
export function useWebVitals() {
    useEffect(() => {
        // Largest Contentful Paint
        if ('PerformanceObserver' in window) {
            try {
                const lcpObserver = new PerformanceObserver((entryList) => {
                    const entries = entryList.getEntries();
                    const lastEntry = entries[entries.length - 1] as LCPEntry;
                    if (lastEntry) {
                        const vital: WebVitals = {
                            name: 'LCP',
                            value: lastEntry.renderTime || lastEntry.loadTime || lastEntry.startTime || 0,
                        };
                        // LCP > 2.5s is poor
                        if (vital.value > 2500) {
                            vital.rating = 'poor';
                        } else if (vital.value > 1200) {
                            vital.rating = 'needs-improvement';
                        } else {
                            vital.rating = 'good';
                        }
                        sendAnalytics(vital);
                    }
                });
                lcpObserver.observe({ entryTypes: ['largest-contentful-paint'], buffered: true });
            } catch {
                console.warn('LCP observer not supported');
            }

            // Cumulative Layout Shift
            try {
                const clsObserver = new PerformanceObserver((entryList) => {
                    let clsValue = 0;
                    for (const entry of entryList.getEntries()) {
                        const shiftEntry = entry as LayoutShiftEntry;
                        if (shiftEntry.hadRecentInput) continue;
                        clsValue += shiftEntry.value;
                    }
                    const vital: WebVitals = {
                        name: 'CLS',
                        value: clsValue,
                    };
                    // CLS > 0.25 is poor
                    if (vital.value > 0.25) {
                        vital.rating = 'poor';
                    } else if (vital.value > 0.1) {
                        vital.rating = 'needs-improvement';
                    } else {
                        vital.rating = 'good';
                    }
                    sendAnalytics(vital);
                });
                clsObserver.observe({ type: 'layout-shift', buffered: true });
            } catch {
                console.warn('CLS observer not supported');
            }

            // First Input Delay / Interaction to Next Paint
            try {
                const ttpObserver = new PerformanceObserver((entryList) => {
                    const entries = entryList.getEntries();
                    if (entries.length > 0) {
                        const entry = entries[0] as InteractionEntry;
                        const vital: WebVitals = {
                            name: 'INP',
                            value: entry.processingDuration || 0,
                        };
                        // INP > 500ms is poor
                        if (vital.value > 500) {
                            vital.rating = 'poor';
                        } else if (vital.value > 200) {
                            vital.rating = 'needs-improvement';
                        } else {
                            vital.rating = 'good';
                        }
                        sendAnalytics(vital);
                    }
                });
                ttpObserver.observe({ entryTypes: ['first-input', 'interaction'], buffered: true });
            } catch {
                console.warn('INP observer not supported');
            }
        }
    }, []);
}

function sendAnalytics(vital: WebVitals) {
    // Send to Google Analytics if available
    if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', vital.name, {
            value: Math.round(vital.value),
            event_category: 'Web Vitals',
            event_label: vital.name,
            non_interaction: true,
        });
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
        console.log(`[${vital.name}] ${vital.value}ms - ${vital.rating}`);
    }
}

/**
 * Track Navigation Timing
 */
export function useNavigationTiming() {
    useEffect(() => {
        const logNavigationMetrics = () => {
            if (typeof window !== 'undefined' && 'performance' in window) {
                const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
                
                if (perfData) {
                    const metrics = {
                        'DNS Lookup': perfData.domainLookupEnd - perfData.domainLookupStart,
                        'TCP Connection': perfData.connectEnd - perfData.connectStart,
                        'Request Time': perfData.responseStart - perfData.requestStart,
                        'Response Time': perfData.responseEnd - perfData.responseStart,
                        'DOM Processing': perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
                        'Page Load Time': perfData.loadEventEnd - perfData.loadEventStart,
                        'Total Time to Interactive': perfData.loadEventEnd - perfData.fetchStart,
                    };

                    if (process.env.NODE_ENV === 'development') {
                        console.group('Navigation Timing Metrics');
                        Object.entries(metrics).forEach(([key, value]) => {
                            console.log(`${key}: ${Math.round(value)}ms`);
                        });
                        console.groupEnd();
                    }
                }
            }
        };

        // Wait for page to fully load
        window.addEventListener('load', logNavigationMetrics);
        return () => window.removeEventListener('load', logNavigationMetrics);
    }, []);
}

```

## File: app\hooks\usePredictions.ts
```
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "../utils/supabase";
import { useAuth } from "../context/AuthContext";

// Types
export interface Prediction {
    id?: string;
    user_id: string;
    league: "vsl" | "1lig" | "2lig" | "cev-cl";
    group_name?: string;
    match_id: string;
    score: string;
    created_at?: string;
    updated_at?: string;
}

export type PredictionOverrides = Record<string, string>;

// ============================================
// FETCH PREDICTIONS
// ============================================
async function fetchPredictions(
    userId: string,
    league: string,
    groupName?: string
): Promise<PredictionOverrides> {
    const supabase = createClient();
    if (!supabase) {
        // Fallback to localStorage if Supabase is not configured
        const storageKey = getStorageKey(league);
        const saved = localStorage.getItem(storageKey);
        if (saved) {
            const parsed = JSON.parse(saved);
            if (groupName && parsed[groupName]) {
                return parsed[groupName];
            }
            return parsed;
        }
        return {};
    }

    let query = supabase
        .from("predictions")
        .select("match_id, score")
        .eq("user_id", userId)
        .eq("league", league);

    if (groupName) {
        query = query.eq("group_name", groupName);
    }

    const { data, error } = await query;

    if (error) {
        console.error("Error fetching predictions:", error);
        return {};
    }

    // Convert array to Record<matchId, score>
    const overrides: PredictionOverrides = {};
    data?.forEach((p) => {
        overrides[p.match_id] = p.score;
    });

    return overrides;
}

// ============================================
// SAVE PREDICTION
// ============================================
async function savePrediction(
    userId: string,
    league: string,
    matchId: string,
    score: string,
    groupName?: string
): Promise<void> {
    const supabase = createClient();
    if (!supabase) {
        // Fallback to localStorage
        const storageKey = getStorageKey(league);
        const saved = localStorage.getItem(storageKey);
        const existing = saved ? JSON.parse(saved) : {};

        if (groupName) {
            if (!existing[groupName]) existing[groupName] = {};
            if (score) {
                existing[groupName][matchId] = score;
            } else {
                delete existing[groupName][matchId];
            }
        } else {
            if (score) {
                existing[matchId] = score;
            } else {
                delete existing[matchId];
            }
        }

        localStorage.setItem(storageKey, JSON.stringify(existing));
        return;
    }

    if (!score) {
        // Delete prediction
        await supabase
            .from("predictions")
            .delete()
            .eq("user_id", userId)
            .eq("league", league)
            .eq("match_id", matchId);
    } else {
        // Upsert prediction
        await supabase.from("predictions").upsert(
            {
                user_id: userId,
                league,
                group_name: groupName || null,
                match_id: matchId,
                score,
            },
            { onConflict: "user_id,league,match_id" }
        );
    }
}

// ============================================
// BULK SAVE PREDICTIONS
// ============================================
async function bulkSavePredictions(
    userId: string,
    league: string,
    overrides: PredictionOverrides,
    groupName?: string
): Promise<void> {
    const supabase = createClient();
    if (!supabase) {
        // Fallback to localStorage
        const storageKey = getStorageKey(league);
        const saved = localStorage.getItem(storageKey);
        const existing = saved ? JSON.parse(saved) : {};

        if (groupName) {
            existing[groupName] = overrides;
        } else {
            Object.assign(existing, overrides);
        }

        localStorage.setItem(storageKey, JSON.stringify(existing));
        return;
    }

    // Convert overrides to array of predictions
    const predictions = Object.entries(overrides).map(([matchId, score]) => ({
        user_id: userId,
        league,
        group_name: groupName || null,
        match_id: matchId,
        score,
    }));

    if (predictions.length > 0) {
        await supabase
            .from("predictions")
            .upsert(predictions, { onConflict: "user_id,league,match_id" });
    }
}

// ============================================
// CLEAR PREDICTIONS
// ============================================
async function clearPredictions(
    userId: string,
    league: string,
    groupName?: string
): Promise<void> {
    const supabase = createClient();
    if (!supabase) {
        const storageKey = getStorageKey(league);
        if (groupName) {
            const saved = localStorage.getItem(storageKey);
            const existing = saved ? JSON.parse(saved) : {};
            delete existing[groupName];
            localStorage.setItem(storageKey, JSON.stringify(existing));
        } else {
            localStorage.removeItem(storageKey);
        }
        return;
    }

    let query = supabase
        .from("predictions")
        .delete()
        .eq("user_id", userId)
        .eq("league", league);

    if (groupName) {
        query = query.eq("group_name", groupName);
    }

    await query;
}

// ============================================
// STORAGE KEY HELPER
// ============================================
function getStorageKey(league: string): string {
    switch (league) {
        case "1lig":
            return "1ligGroupScenarios";
        case "2lig":
            return "groupScenarios";
        case "cev-cl":
            return "cevclGroupScenarios";
        case "vsl":
            return "vslGroupScenarios";
        default:
            return `${league}Scenarios`;
    }
}

// ============================================
// REACT QUERY HOOKS
// ============================================

/**
 * Hook to fetch and manage predictions for a specific league
 */
export function usePredictions(league: string, groupName?: string) {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const userId = user?.id || "anonymous";

    const query = useQuery({
        queryKey: ["predictions", league, groupName, userId],
        queryFn: () => fetchPredictions(userId, league, groupName),
        enabled: true, // Always enabled, will use localStorage fallback
    });

    const saveMutation = useMutation({
        mutationFn: ({
            matchId,
            score,
        }: {
            matchId: string;
            score: string;
        }) => savePrediction(userId, league, matchId, score, groupName),
        onMutate: async ({ matchId, score }) => {
            // Optimistic update
            await queryClient.cancelQueries({
                queryKey: ["predictions", league, groupName, userId],
            });
            const previousData = queryClient.getQueryData<PredictionOverrides>([
                "predictions",
                league,
                groupName,
                userId,
            ]);

            queryClient.setQueryData<PredictionOverrides>(
                ["predictions", league, groupName, userId],
                (old = {}) => {
                    const newData = { ...old };
                    if (score) {
                        newData[matchId] = score;
                    } else {
                        delete newData[matchId];
                    }
                    return newData;
                }
            );

            return { previousData };
        },
        onError: (err, variables, context) => {
            if (context?.previousData) {
                queryClient.setQueryData(
                    ["predictions", league, groupName, userId],
                    context.previousData
                );
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({
                queryKey: ["predictions", league, groupName, userId],
            });
        },
    });

    const bulkSaveMutation = useMutation({
        mutationFn: (overrides: PredictionOverrides) =>
            bulkSavePredictions(userId, league, overrides, groupName),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["predictions", league, groupName, userId],
            });
        },
    });

    const clearMutation = useMutation({
        mutationFn: () => clearPredictions(userId, league, groupName),
        onSuccess: () => {
            queryClient.setQueryData(
                ["predictions", league, groupName, userId],
                {}
            );
        },
    });

    return {
        overrides: query.data || {},
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        // Actions
        setPrediction: (matchId: string, score: string) =>
            saveMutation.mutate({ matchId, score }),
        bulkSave: (overrides: PredictionOverrides) =>
            bulkSaveMutation.mutate(overrides),
        clear: () => clearMutation.mutate(),
        // Mutation states
        isSaving: saveMutation.isPending,
        isClearing: clearMutation.isPending,
    };
}

```

## File: app\hooks\usePushNotifications.ts
```
'use client';

import { useState, useEffect, useCallback } from 'react';

interface PushSubscriptionState {
  isSupported: boolean;
  isSubscribed: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook for managing push notification subscriptions
 */
export function usePushNotifications() {
  const [state, setState] = useState<PushSubscriptionState>({
    isSupported: false,
    isSubscribed: false,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    // Check if push notifications are supported
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setState(prev => ({ ...prev, isSupported: false, isLoading: false }));
      return;
    }

    setState(prev => ({ ...prev, isSupported: true }));

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      setState(prev => ({
        ...prev,
        isSubscribed: !!subscription,
        isLoading: false,
      }));
    } catch {
      setState(prev => ({
        ...prev,
        error: 'Bildirim durumu kontrol edilemedi',
        isLoading: false,
      }));
    }
  };

  const subscribe = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Request notification permission
      const permission = await Notification.requestPermission();
      
      if (permission !== 'granted') {
        setState(prev => ({
          ...prev,
          error: 'Bildirim izni reddedildi',
          isLoading: false,
        }));
        return false;
      }

      const registration = await navigator.serviceWorker.ready;
      
      // Get VAPID public key from environment
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      
      if (!vapidPublicKey) {
        setState(prev => ({
          ...prev,
          error: 'VAPID key bulunamadı',
          isLoading: false,
        }));
        return false;
      }

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      // Send subscription to server
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription),
      });

      if (!response.ok) {
        throw new Error('Sunucu aboneliği kaydedemedi');
      }

      setState(prev => ({
        ...prev,
        isSubscribed: true,
        isLoading: false,
      }));

      return true;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Abonelik başarısız',
        isLoading: false,
      }));
      return false;
    }
  }, []);

  const unsubscribe = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
        
        // Notify server
        await fetch('/api/push/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });
      }

      setState(prev => ({
        ...prev,
        isSubscribed: false,
        isLoading: false,
      }));

      return true;
    } catch {
      setState(prev => ({
        ...prev,
        error: 'Abonelik iptal edilemedi',
        isLoading: false,
      }));
      return false;
    }
  }, []);

  return {
    ...state,
    subscribe,
    unsubscribe,
  };
}

/**
 * Convert VAPID public key from base64 to Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray.buffer;
}

```

## File: app\hooks\useSimulationEngine.ts
```
"use client";

import { useMemo, useCallback } from "react";
import { Match, TeamStats } from "../types";
import { calculateLiveStandings, getOutcomeFromScore, SCORES } from "../utils/calculatorUtils";
import { calculateElo } from "../utils/eloCalculator";

// Types
export type SimulationMode = "smart" | "random";

export interface SimulationResult {
    standings: TeamStats[];
    eloRatings: Map<string, number>;
    completedMatches: number;
    totalMatches: number;
    progress: number;
}

export interface UseSimulationEngineOptions {
    teams: TeamStats[];
    matches: Match[];
    overrides: Record<string, string>;
}

export interface UseSimulationEngineReturn {
    // Computed data
    standings: TeamStats[];
    eloRatings: Map<string, number>;
    teamRanks: Map<string, number>;
    progress: { completed: number; total: number; percentage: number };

    // Actions
    simulateMatch: (matchId: string, score: string) => Record<string, string>;
    autoSimulate: (mode: SimulationMode, unplayedMatches: Match[]) => Record<string, string>;
    clearPredictions: () => Record<string, string>;

    // Utilities
    getTeamElo: (teamName: string) => number;
    predictMatchScore: (homeTeam: string, awayTeam: string) => string;
    getRandomScore: () => string;
}

/**
 * useSimulationEngine - Encapsulates all simulation business logic
 * 
 * This hook separates the calculation/simulation logic from UI concerns,
 * making it testable and reusable across different prediction pages.
 */
export function useSimulationEngine({
    teams,
    matches,
    overrides,
}: UseSimulationEngineOptions): UseSimulationEngineReturn {

    // ============================================
    // COMPUTED VALUES (Memoized)
    // ============================================

    /**
     * Calculate live standings based on current overrides
     */
    const standings = useMemo(() => {
        return calculateLiveStandings(teams, matches, overrides);
    }, [teams, matches, overrides]);

    /**
     * Calculate ELO ratings from played matches
     */
    const eloRatings = useMemo(() => {
        return calculateElo(teams, matches);
    }, [teams, matches]);

    /**
     * Map team names to their current rank
     */
    const teamRanks = useMemo(() => {
        const ranks = new Map<string, number>();
        standings.forEach((team, index) => {
            ranks.set(team.name, index + 1);
        });
        return ranks;
    }, [standings]);

    /**
     * Calculate match completion progress
     */
    const progress = useMemo(() => {
        const unplayedMatches = matches.filter(m => !m.isPlayed);
        const predictedCount = unplayedMatches.filter(m => {
            const matchId = `${m.homeTeam}-${m.awayTeam}`;
            return overrides[matchId] !== undefined;
        }).length;

        return {
            completed: predictedCount,
            total: unplayedMatches.length,
            percentage: unplayedMatches.length > 0
                ? Math.round((predictedCount / unplayedMatches.length) * 100)
                : 100,
        };
    }, [matches, overrides]);

    // ============================================
    // UTILITY FUNCTIONS
    // ============================================

    /**
     * Get ELO rating for a team
     */
    const getTeamElo = useCallback((teamName: string): number => {
        return eloRatings.get(teamName) || 1200;
    }, [eloRatings]);

    /**
     * Predict match score based on ELO difference
     */
    const predictMatchScore = useCallback((homeTeam: string, awayTeam: string): string => {
        const homeElo = getTeamElo(homeTeam);
        const awayElo = getTeamElo(awayTeam);
        const eloDiff = homeElo - awayElo;

        // Calculate win probability using ELO formula
        const homeWinProb = 1 / (1 + Math.pow(10, -eloDiff / 400));

        // Determine score based on probability
        const rand = Math.random();

        if (homeWinProb > 0.65) {
            // Strong home favorite
            return rand < 0.5 ? "3-0" : "3-1";
        } else if (homeWinProb > 0.55) {
            // Slight home favorite
            return rand < 0.4 ? "3-1" : rand < 0.7 ? "3-2" : "3-0";
        } else if (homeWinProb > 0.45) {
            // Toss-up
            return rand < 0.5
                ? (rand < 0.25 ? "3-2" : "3-1")
                : (rand < 0.75 ? "2-3" : "1-3");
        } else if (homeWinProb > 0.35) {
            // Slight away favorite
            return rand < 0.4 ? "1-3" : rand < 0.7 ? "2-3" : "0-3";
        } else {
            // Strong away favorite
            return rand < 0.5 ? "0-3" : "1-3";
        }
    }, [getTeamElo]);

    /**
     * Get a random valid score
     */
    const getRandomScore = useCallback((): string => {
        return SCORES[Math.floor(Math.random() * SCORES.length)];
    }, []);

    // ============================================
    // SIMULATION ACTIONS
    // ============================================

    /**
     * Simulate a single match with a given score
     * Returns new overrides object (immutable)
     */
    const simulateMatch = useCallback((matchId: string, score: string): Record<string, string> => {
        if (!score) {
            // Remove prediction
            const newOverrides = { ...overrides };
            delete newOverrides[matchId];
            return newOverrides;
        }

        // Validate score
        const outcome = getOutcomeFromScore(score);
        if (!outcome) {
            console.warn(`Invalid score: ${score}`);
            return overrides;
        }

        return { ...overrides, [matchId]: score };
    }, [overrides]);

    /**
     * Auto-simulate all unplayed matches
     */
    const autoSimulate = useCallback((
        mode: SimulationMode,
        unplayedMatches: Match[]
    ): Record<string, string> => {
        const newOverrides = { ...overrides };

        unplayedMatches.forEach(match => {
            const matchId = `${match.homeTeam}-${match.awayTeam}`;

            if (mode === "smart") {
                newOverrides[matchId] = predictMatchScore(match.homeTeam, match.awayTeam);
            } else {
                newOverrides[matchId] = getRandomScore();
            }
        });

        return newOverrides;
    }, [overrides, predictMatchScore, getRandomScore]);

    /**
     * Clear all predictions
     */
    const clearPredictions = useCallback((): Record<string, string> => {
        return {};
    }, []);

    // ============================================
    // RETURN
    // ============================================

    return {
        // Computed data
        standings,
        eloRatings,
        teamRanks,
        progress,

        // Actions
        simulateMatch,
        autoSimulate,
        clearPredictions,

        // Utilities
        getTeamElo,
        predictMatchScore,
        getRandomScore,
    };
}

// ============================================
// PURE FUNCTIONS (For Unit Testing)
// ============================================

/**
 * Pure function to calculate win probability from ELO ratings
 */
export function calculateWinProbability(homeElo: number, awayElo: number): number {
    return 1 / (1 + Math.pow(10, -(homeElo - awayElo) / 400));
}

/**
 * Pure function to determine score based on win probability
 */
export function scoreFromProbability(winProb: number, randomValue: number): string {
    if (winProb > 0.65) {
        return randomValue < 0.5 ? "3-0" : "3-1";
    } else if (winProb > 0.55) {
        return randomValue < 0.4 ? "3-1" : randomValue < 0.7 ? "3-2" : "3-0";
    } else if (winProb > 0.45) {
        return randomValue < 0.5
            ? (randomValue < 0.25 ? "3-2" : "3-1")
            : (randomValue < 0.75 ? "2-3" : "1-3");
    } else if (winProb > 0.35) {
        return randomValue < 0.4 ? "1-3" : randomValue < 0.7 ? "2-3" : "0-3";
    } else {
        return randomValue < 0.5 ? "0-3" : "1-3";
    }
}

```

## File: app\hooks\useUndoableAction.ts
```
"use client";

import { useState, useCallback, useRef } from 'react';
import { useToast } from '../components/Toast';

interface UseUndoableActionOptions<T> {
    /** Message to show in the toast */
    message: string;
    /** Duration in ms before undo expires (default: 5000) */
    duration?: number;
    /** Callback when the action is executed */
    onExecute: () => T;
    /** Callback to restore previous state (receives the stored state) */
    onUndo: (previousState: T) => void;
}

/**
 * Hook for creating undoable actions
 * 
 * Usage:
 * ```tsx
 * const { execute } = useUndoableAction({
 *   message: 'Tahminler temizlendi',
 *   onExecute: () => {
 *     const prev = predictions;
 *     setPredictions({});
 *     return prev; // Return state to restore
 *   },
 *   onUndo: (prev) => setPredictions(prev)
 * });
 * 
 * // In button:
 * <button onClick={execute}>Sıfırla</button>
 * ```
 */
export function useUndoableAction<T>({
    message,
    duration = 5000,
    onExecute,
    onUndo,
}: UseUndoableActionOptions<T>) {
    const { showUndoToast } = useToast();
    const previousStateRef = useRef<T | null>(null);
    const [isUndoable, setIsUndoable] = useState(false);

    const execute = useCallback(() => {
        // Store previous state
        const previousState = onExecute();
        previousStateRef.current = previousState;
        setIsUndoable(true);

        // Show undo toast
        showUndoToast(message, () => {
            if (previousStateRef.current !== null) {
                onUndo(previousStateRef.current);
                previousStateRef.current = null;
            }
            setIsUndoable(false);
        }, duration);

        // Clear undo ability after duration
        setTimeout(() => {
            previousStateRef.current = null;
            setIsUndoable(false);
        }, duration);
    }, [message, duration, onExecute, onUndo, showUndoToast]);

    const undo = useCallback(() => {
        if (previousStateRef.current !== null) {
            onUndo(previousStateRef.current);
            previousStateRef.current = null;
            setIsUndoable(false);
        }
    }, [onUndo]);

    return {
        execute,
        undo,
        isUndoable,
    };
}

```

## File: app\hooks\useUserStats.ts
```
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "../utils/supabase";
import { useAuth } from "../context/AuthContext";
import { GameState, AchievementId, LEVEL_THRESHOLDS } from "../types";
import { ACHIEVEMENTS, calculateLevel, getXPForNextLevel, getLevelTitle } from "../utils/gameState";

// Types
interface UserStats {
    user_id: string;
    xp: number;
    level: number;
    favorite_team: string | null;
    achievements: string[];
    stats: {
        totalPredictions: number;
        correctPredictions: number;
        currentStreak: number;
        bestStreak: number;
        predictedChampions: string[];
    };
    sound_enabled: boolean;
    last_active_date: string;
}

const STORAGE_KEY = "volleySimGameState";

// ============================================
// FETCH USER STATS
// ============================================
async function fetchUserStats(userId: string): Promise<GameState> {
    const supabase = createClient();

    // Default state
    const defaultState: GameState = {
        xp: 0,
        level: 1,
        favoriteTeam: null,
        achievements: [],
        quests: [],
        stats: {
            totalPredictions: 0,
            correctPredictions: 0,
            currentStreak: 0,
            bestStreak: 0,
            predictedChampions: [],
        },
        soundEnabled: true,
        lastActiveDate: new Date().toISOString().split("T")[0],
    };

    if (!supabase || userId === "anonymous") {
        // Fallback to localStorage
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            return { ...defaultState, ...JSON.parse(saved) };
        }
        return defaultState;
    }

    const { data, error } = await supabase
        .from("user_stats")
        .select("*")
        .eq("user_id", userId)
        .single();

    if (error || !data) {
        // Try localStorage as fallback
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            return { ...defaultState, ...JSON.parse(saved) };
        }
        return defaultState;
    }

    // Map database fields to GameState
    return {
        xp: data.xp,
        level: data.level,
        favoriteTeam: data.favorite_team,
        achievements: data.achievements.map((id: string) => {
            const def = ACHIEVEMENTS[id as AchievementId];
            return def ? { ...def, unlockedAt: new Date().toISOString() } : null;
        }).filter(Boolean),
        quests: [],
        stats: data.stats,
        soundEnabled: data.sound_enabled,
        lastActiveDate: data.last_active_date,
    };
}

// ============================================
// SAVE USER STATS
// ============================================
async function saveUserStats(userId: string, state: Partial<GameState>): Promise<void> {
    const supabase = createClient();

    if (!supabase || userId === "anonymous") {
        // Fallback to localStorage
        const saved = localStorage.getItem(STORAGE_KEY);
        const existing = saved ? JSON.parse(saved) : {};
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...existing, ...state }));
        return;
    }

    const updateData: Partial<UserStats> = {};

    if (state.xp !== undefined) updateData.xp = state.xp;
    if (state.level !== undefined) updateData.level = state.level;
    if (state.favoriteTeam !== undefined) updateData.favorite_team = state.favoriteTeam;
    if (state.achievements !== undefined) {
        updateData.achievements = state.achievements.map(a => a.id);
    }
    if (state.stats !== undefined) updateData.stats = state.stats;
    if (state.soundEnabled !== undefined) updateData.sound_enabled = state.soundEnabled;

    await supabase
        .from("user_stats")
        .upsert({ user_id: userId, ...updateData }, { onConflict: "user_id" });
}

// ============================================
// REACT QUERY HOOK
// ============================================
export function useUserStats() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const userId = user?.id || "anonymous";

    const query = useQuery({
        queryKey: ["userStats", userId],
        queryFn: () => fetchUserStats(userId),
    });

    const updateMutation = useMutation({
        mutationFn: (updates: Partial<GameState>) => saveUserStats(userId, updates),
        onMutate: async (updates) => {
            await queryClient.cancelQueries({ queryKey: ["userStats", userId] });
            const previous = queryClient.getQueryData<GameState>(["userStats", userId]);

            queryClient.setQueryData<GameState>(["userStats", userId], (old) => ({
                ...old!,
                ...updates,
            }));

            return { previous };
        },
        onError: (err, variables, context) => {
            if (context?.previous) {
                queryClient.setQueryData(["userStats", userId], context.previous);
            }
        },
    });

    const gameState = query.data;

    // Add XP
    const addXP = (amount: number) => {
        if (!gameState) return;
        const newXP = gameState.xp + amount;
        const newLevel = calculateLevel(newXP);
        updateMutation.mutate({ xp: newXP, level: newLevel });
    };

    // Record prediction
    const recordPrediction = (isCorrect: boolean) => {
        if (!gameState) return;
        const newStats = { ...gameState.stats };
        newStats.totalPredictions++;

        if (isCorrect) {
            newStats.correctPredictions++;
            newStats.currentStreak++;
            if (newStats.currentStreak > newStats.bestStreak) {
                newStats.bestStreak = newStats.currentStreak;
            }
        } else {
            newStats.currentStreak = 0;
        }

        updateMutation.mutate({ stats: newStats });
    };

    // Unlock achievement
    const unlockAchievement = (id: AchievementId): boolean => {
        if (!gameState) return false;
        if (gameState.achievements.some(a => a.id === id)) return false;

        const def = ACHIEVEMENTS[id];
        if (!def) return false;

        const newAchievement = { ...def, unlockedAt: new Date().toISOString() };
        const newXP = gameState.xp + def.xpReward;

        updateMutation.mutate({
            xp: newXP,
            level: calculateLevel(newXP),
            achievements: [...gameState.achievements, newAchievement],
        });

        return true;
    };

    // Set favorite team
    const setFavoriteTeam = (teamName: string | null) => {
        updateMutation.mutate({ favoriteTeam: teamName });
    };

    // Toggle sound
    const toggleSound = () => {
        if (!gameState) return;
        updateMutation.mutate({ soundEnabled: !gameState.soundEnabled });
    };

    return {
        gameState: gameState || {
            xp: 0,
            level: 1,
            favoriteTeam: null,
            achievements: [],
            quests: [],
            stats: { totalPredictions: 0, correctPredictions: 0, currentStreak: 0, bestStreak: 0, predictedChampions: [] },
            soundEnabled: true,
            lastActiveDate: new Date().toISOString().split("T")[0],
        },
        isLoaded: !query.isLoading,
        isLoading: query.isLoading,
        addXP,
        recordPrediction,
        unlockAchievement,
        setFavoriteTeam,
        toggleSound,
        hasAchievement: (id: AchievementId) => gameState?.achievements.some(a => a.id === id) || false,
        getLevelTitle: () => getLevelTitle(gameState?.level || 1),
        getXPProgress: () => {
            const level = gameState?.level || 1;
            const xp = gameState?.xp || 0;
            const currentLevelXP = LEVEL_THRESHOLDS[level - 1] || 0;
            const nextLevelXP = getXPForNextLevel(level);
            const progress = xp - currentLevelXP;
            const required = nextLevelXP - currentLevelXP;
            return { progress, required, percentage: (progress / required) * 100 };
        },
    };
}

```

## File: app\leaderboard\LeaderboardClient.tsx
```
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Skeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { Trophy, TrendingUp, Calendar, Zap, Info, Award } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeaderboardEntry {
    rank: number;
    user_id: string;
    display_name: string;
    total_points: number;
    correct_predictions: number;
    total_predictions: number;
    current_streak: number;
    best_streak: number;
    weekly_points: number;
    monthly_points: number;
}

type LeaderboardType = 'total' | 'weekly' | 'monthly';

interface LeaderboardClientProps {
    initialLeaderboard: LeaderboardEntry[];
    initialUserEntry: LeaderboardEntry | null;
    initialUserRank: number | null;
}

export default function LeaderboardClient({
    initialLeaderboard,
    initialUserEntry,
    initialUserRank
}: LeaderboardClientProps) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(initialLeaderboard);
    const [userEntry, setUserEntry] = useState<LeaderboardEntry | null>(initialUserEntry);
    const [userRank, setUserRank] = useState<number | null>(initialUserRank);
    const [type, setType] = useState<LeaderboardType>('total');

    useEffect(() => {
        if (type !== 'total' || leaderboard !== initialLeaderboard) {
            fetchLeaderboard();
        }
    }, [type]);

    async function fetchLeaderboard() {
        try {
            setLoading(true);
            const res = await fetch(`/api/leaderboard?type=${type}&limit=50`);
            if (res.ok) {
                const data = await res.json();
                setLeaderboard(data.leaderboard || []);
                setUserEntry(data.userEntry);
                setUserRank(data.userRank);
            }
        } catch (err) {
            console.error("Leaderboard fetch error:", err);
        } finally {
            setLoading(false);
        }
    }

    const typeLabels: Record<LeaderboardType, string> = {
        total: 'Tüm Zamanlar',
        weekly: 'Bu Hafta',
        monthly: 'Bu Ay'
    };

    return (
        <main className="min-h-screen bg-background text-text-primary p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border-subtle pb-6">
                    <div className="space-y-1">
                        <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5 mb-2">
                            PREMIUM ANALİTİK
                        </Badge>
                        <h1 className="text-4xl font-black tracking-tighter text-text-primary uppercase italic">
                            Sıralama <span className="text-primary shadow-glow-primary">Tablosu</span>
                        </h1>
                        <p className="text-text-secondary font-medium">En iyi voleybol tahmin uzmanları arasında yerini al.</p>
                    </div>

                    {/* Filter Tabs */}
                    <div className="inline-flex p-1 bg-surface-secondary/50 backdrop-blur-sm rounded-xl border border-border-main">
                        {(['total', 'weekly', 'monthly'] as LeaderboardType[]).map((t) => (
                            <Button
                                key={t}
                                variant={type === t ? 'primary' : 'ghost'}
                                size="sm"
                                onClick={() => setType(t)}
                                className={cn(
                                    "rounded-lg text-xs font-black transition-all px-4 h-9 uppercase",
                                    type === t && "shadow-glow-primary"
                                )}
                            >
                                {typeLabels[t]}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Top 3 Podium (Visual) - Only on Desktop and if data exists */}
                {leaderboard.length >= 3 && !loading && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                        {[leaderboard[1], leaderboard[0], leaderboard[2]].map((entry, i) => {
                            const isFirst = entry.rank === 1;
                            return (
                                <Card
                                    key={entry.user_id}
                                    className={cn(
                                        "relative border-none overflow-hidden",
                                        isFirst ? "bg-gradient-to-br from-amber-400/20 via-amber-600/10 to-transparent ring-2 ring-amber-500/50 scale-105 z-10 sm:-translate-y-2" : "bg-surface-secondary/30",
                                        user?.id === entry.user_id && "ring-2 ring-primary/50"
                                    )}
                                >
                                    <div className="p-6 flex flex-col items-center">
                                        <div className={cn(
                                            "w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-4 relative",
                                            entry.rank === 1 ? "bg-amber-500 shadow-glow-accent" : "bg-surface-dark border border-border-main"
                                        )}>
                                            {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉'}
                                            {user?.id === entry.user_id && (
                                                <div className="absolute -bottom-1 -right-1">
                                                    <Badge variant="success" className="p-0.5 rounded-full"><TrendingUp className="w-3 h-3" /></Badge>
                                                </div>
                                            )}
                                        </div>
                                        <h3 className="font-black text-lg truncate w-full px-2">{entry.display_name || 'Anonim'}</h3>
                                        <div className="text-2xl font-black text-text-primary mt-2">
                                            {type === 'weekly' ? entry.weekly_points :
                                                type === 'monthly' ? entry.monthly_points :
                                                    entry.total_points}
                                            <span className="text-[10px] text-text-muted ml-0.5 uppercase tracking-tighter">Puan</span>
                                        </div>
                                        <Badge variant="secondary" className="mt-4 text-[10px] font-black tracking-widest uppercase">
                                            {entry.correct_predictions} Doğru
                                        </Badge>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                )}

                {/* User's Current Status Banner */}
                {userEntry && userRank && userRank > 3 && (
                    <Card className="bg-primary/5 border-primary/20 overflow-hidden relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent group-hover:from-primary/20 transition-all duration-700" />
                        <CardContent className="p-4 sm:p-6 relative z-10">
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center font-black text-primary text-xl shadow-glow-primary">
                                        #{userRank}
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Senin Mevcut Sıran</div>
                                        <div className="font-black text-xl text-text-primary tracking-tight">{userEntry.display_name || 'Kullanıcı'}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-black text-primary tabular-nums">
                                        {type === 'weekly' ? userEntry.weekly_points :
                                            type === 'monthly' ? userEntry.monthly_points :
                                                userEntry.total_points}
                                        <span className="text-xs ml-1 font-medium text-text-muted uppercase">Puan</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Main List */}
                <Card className="bg-surface-primary/50 backdrop-blur-sm border-border-main/50 overflow-hidden">
                    <CardHeader className="bg-surface-secondary/30 p-4 border-b border-border-main">
                        <CardTitle className="text-sm font-black flex items-center gap-2 tracking-widest uppercase">
                            <TrendingUp className="w-4 h-4 text-primary" />
                            TOP 50 Tahminci
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="p-0 relative">
                        {loading && (
                            <div className="absolute inset-0 bg-background/50 backdrop-blur-[2px] z-50 flex flex-col items-center justify-center gap-3">
                                <Zap className="w-8 h-8 text-primary animate-pulse shadow-glow-primary" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">Veriler Çekiliyor</span>
                            </div>
                        )}

                        {leaderboard.length === 0 && !loading ? (
                            <EmptyState
                                title="Henüz Skor Yok"
                                description="Bu kategori için henüz sıralama verisi oluşturulmamış. İlk tahmini sen yap!"
                                icon={Award}
                                className="min-h-[400px] border-none"
                                actionLabel="Hemen Tahmin Yap"
                                onAction={() => window.location.href = '/ligler'}
                            />
                        ) : (
                            <div className="divide-y divide-border-subtle">
                                {leaderboard.map((entry) => {
                                    const isCurrentUser = user?.id === entry.user_id;
                                    const points = type === 'weekly' ? entry.weekly_points :
                                        type === 'monthly' ? entry.monthly_points :
                                            entry.total_points;
                                    const isTop3 = entry.rank <= 3;

                                    return (
                                        <div
                                            key={entry.user_id}
                                            className={cn(
                                                "flex items-center justify-between p-4 transition-all duration-300 group",
                                                isCurrentUser ? "bg-primary/5" : "hover:bg-surface-secondary/50"
                                            )}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={cn(
                                                    "w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm transition-transform group-hover:scale-110",
                                                    entry.rank === 1 ? "bg-amber-500 text-white shadow-glow-accent" :
                                                        entry.rank === 2 ? "bg-slate-300 text-slate-800" :
                                                            entry.rank === 3 ? "bg-amber-600 text-white shadow-md shadow-amber-900/20" :
                                                                "bg-surface-secondary text-text-muted border border-border-subtle"
                                                )}>
                                                    #{entry.rank}
                                                </div>

                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-2">
                                                        <span className={cn(
                                                            "font-black tracking-tight",
                                                            isCurrentUser ? "text-primary" : "text-text-primary"
                                                        )}>
                                                            {entry.display_name || 'Anonim Tahminci'}
                                                        </span>
                                                        {isCurrentUser && (
                                                            <Badge variant="default" className="h-4 px-1.5 py-0 text-[8px] font-black uppercase tracking-widest">Sen</Badge>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-3 mt-1 underline-offset-4">
                                                        <span className="text-[10px] font-medium text-text-muted flex items-center gap-1">
                                                            <Badge variant="secondary" className="px-1 py-0 h-4 text-[8px]">{entry.correct_predictions}</Badge> İsabet
                                                        </span>
                                                        {entry.current_streak >= 3 && (
                                                            <span className="text-[10px] font-black text-primary italic flex items-center gap-1">
                                                                <Zap className="w-2.5 h-2.5 fill-current" />
                                                                {entry.current_streak} SERİ!
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <div className={cn(
                                                    "text-xl font-black tabular-nums tracking-tighter",
                                                    isTop3 ? "text-amber-500" : "text-text-primary"
                                                )}>
                                                    {points}
                                                    <span className="text-[9px] text-text-muted ml-0.5 uppercase">pts</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Legend / Info Footer */}
                <Card className="bg-surface-secondary/20 border-border-main/30 border-dashed">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Info className="w-4 h-4 text-primary" />
                            <h4 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Puanlama Sistemi</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <InfoCard title="Tahmin" value="+10" desc="Skoru tam bilenlere" />
                            <InfoCard title="Seri Bonusu" value="+5" desc="Üst üste 3 doğru maça" />
                            <InfoCard title="Sıralama" value="15 DK" desc="Güncelleme aralığı" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}

const InfoCard = ({ title, value, desc }: { title: string; value: string; desc: string }) => (
    <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-text-muted uppercase">{title}</span>
            <span className="text-xs font-black text-primary">{value}</span>
        </div>
        <p className="text-[10px] text-text-secondary leading-tight">{desc}</p>
    </div>
);

```

## File: app\leaderboard\loading.tsx
```
import { SkeletonTable, SkeletonStats } from "../components/Skeleton";

export default function LeaderboardLoading() {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-4">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header skeleton */}
                <div className="text-center space-y-2">
                    <div className="h-10 w-64 bg-slate-800 rounded animate-pulse mx-auto" />
                    <div className="h-4 w-96 bg-slate-800/50 rounded animate-pulse mx-auto" />
                </div>

                {/* Stats skeleton */}
                <SkeletonStats count={4} />

                {/* Table skeleton */}
                <SkeletonTable rows={10} columns={5} />
            </div>
        </div>
    );
}

```

## File: app\leaderboard\page.tsx
```
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

```

## File: app\ligler\loading.tsx
```
import { SkeletonCard } from "../components/Skeleton";

export default function LiglerLoading() {
    return (
        <div className="min-h-screen bg-slate-950">
            <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
                <div className="flex flex-col gap-1 items-center md:items-start text-center md:text-left">
                    <div className="h-8 w-32 bg-slate-800 rounded animate-pulse" />
                    <div className="h-4 w-64 bg-slate-800/50 rounded animate-pulse mt-2" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <SkeletonCard key={i} className="h-48" />
                    ))}
                </div>
            </div>
        </div>
    );
}

```

