import { HeadToHeadStats, FormComparison } from './stats';

export interface AIPrediction {
    matchId: string;
    homeTeam: string;
    awayTeam: string;
    predictedScore: string;
    confidence: number;
    homeWinProbability: number;
    awayWinProbability: number;
    analysis: string;
    factors: AIPredictionFactor[];
    lastUpdated: string;
}

export interface AIPredictionFactor {
    name: string;
    description: string;
    impact: 'positive' | 'negative' | 'neutral';
    weight: number;
    team: 'home' | 'away' | 'both';
}

export interface AIMatchAnalysis {
    matchId: string;
    homeTeam: string;
    awayTeam: string;
    overallAnalysis: string;
    keyFactors: string[];
    homeStrengths: string[];
    homeWeaknesses: string[];
    awayStrengths: string[];
    awayWeaknesses: string[];
    headToHead: HeadToHeadStats;
    formComparison: FormComparison;
    prediction: AIPrediction;
}
