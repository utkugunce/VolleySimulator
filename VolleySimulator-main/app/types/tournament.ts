export interface PlayoffBracketPrediction {
    id: string;
    oderId: string;
    userId: string;
    league: string;
    season: string;
    quarterFinals: BracketMatchPrediction[];
    semiFinals: BracketMatchPrediction[];
    final: BracketMatchPrediction;
    champion: string;
    createdAt: string;
    updatedAt: string;
    points: number;
}

export interface BracketMatchPrediction {
    matchId: string;
    homeTeam: string;
    awayTeam: string;
    predictedWinner: string;
    predictedScore: string;
    actualWinner?: string;
    actualScore?: string;
    pointsEarned?: number;
}

export interface SeasonPrediction {
    id: string;
    userId: string;
    league: string;
    season: string;
    champion: string;
    runnerUp: string;
    thirdPlace?: string;
    relegated: string[];
    mvp?: string;
    topScorer?: string;
    createdAt: string;
    points: number;
}
