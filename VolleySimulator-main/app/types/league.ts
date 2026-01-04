export interface TeamStats {
    name: string;
    groupName: string;
    played: number;
    wins: number;
    points: number;
    setsWon: number;
    setsLost: number;
    setRatio?: number;
}

export interface Match {
    homeTeam: string;
    awayTeam: string;
    groupName: string;
    isPlayed: boolean;
    resultScore?: string;
    homeScore?: number | null;
    awayScore?: number | null;
    matchDate?: string;
    matchTime?: string;
    id?: number;
    venue?: string;
}

export interface ScenarioOverride {
    homeTeam: string;
    awayTeam: string;
    score: string;
}

export interface MatchPrediction {
    homeTeam: string;
    awayTeam: string;
    homeWinProb: number;
    awayWinProb: number;
}

export interface SimulationResult {
    bestRank: number;
    worstRank: number;
    championshipProbability: number;
    playoffProbability: number;
    relegationProbability: number;
    aiAnalysis: string;
    matchPredictions: MatchPrediction[];
}

export interface MatchOutcome {
    homeSets: number;
    awaySets: number;
    homePoints: number;
    awayPoints: number;
    homeWin: boolean;
}

export interface ScenarioExport {
    version: '1.0';
    league: '1lig' | '2lig';
    timestamp: string;
    groupId: string;
    overrides: Record<string, string>;
    metadata: {
        completedMatches: number;
        totalMatches: number;
    };
}

export interface MatchOverride {
    homeTeam: string;
    awayTeam: string;
    homeScore?: number;
    awayScore?: number;
    score?: string;
}

export interface GroupScenarios {
    [groupName: string]: Record<string, string>;
}
