export interface HeadToHeadStats {
    totalMatches: number;
    homeWins: number;
    awayWins: number;
    homeSetWins: number;
    awaySetWins: number;
    lastMeetings: HeadToHeadMatch[];
    averageHomeScore: number;
    averageAwayScore: number;
}

export interface HeadToHeadMatch {
    date: string;
    homeTeam: string;
    awayTeam: string;
    score: string;
    venue: string;
    competition: string;
}

export interface FormComparison {
    homeForm: TeamForm;
    awayForm: TeamForm;
}

export interface TeamForm {
    teamName: string;
    last5Results: ('W' | 'L' | 'D')[];
    last5Scores: string[];
    winRate: number;
    avgPointsScored: number;
    avgPointsConceded: number;
    trend: 'improving' | 'declining' | 'stable';
    strengthRating: number;
    lastFiveMatches?: ('W' | 'L' | 'D')[];
    formPercentage?: number;
    goalsScored?: number;
    goalsConceded?: number;
    winStreak?: number;
    recentOpponents?: string[];
}

export interface TeamDetailedStats {
    teamName: string;
    league: string;
    season: string;
    played: number;
    wins: number;
    losses: number;
    points: number;
    setsWon: number;
    setsLost: number;
    setRatio: number;
    avgPointsPerSet: number;
    avgPointsConcededPerSet: number;
    homeRecord: { wins: number; losses: number };
    awayRecord: { wins: number; losses: number };
    threeZeroWins: number;
    threeOneWins: number;
    threeTwoWins: number;
    threeZeroLosses: number;
    threeOneLosses: number;
    threeTwoLosses: number;
    currentStreak: number;
    streakType: 'W' | 'L';
    last10: ('W' | 'L')[];
    eloRating: number;
    strengthRank: number;
}

export interface UserPredictionStats {
    userId: string;
    totalPredictions: number;
    correctPredictions: number;
    accuracy: number;
    byLeague: Record<string, { total: number; correct: number; accuracy: number }>;
    byTeam: Record<string, { total: number; correct: number; accuracy: number }>;
    exactScoreHits: number;
    winnerOnlyHits: number;
    currentStreak: number;
    bestStreak: number;
    totalPoints: number;
    avgPointsPerPrediction: number;
    bestDay: string;
    bestWeek: string;
    bestMonth: string;
}
