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
