export interface MatchSimulation {
    matchId: string;
    homeTeam: string;
    awayTeam: string;
    simulatedSets: SimulatedSet[];
    finalScore: string;
    winner: string;
    keyMoments: SimulationMoment[];
    duration: number;
}

export interface SimulatedSet {
    setNumber: number;
    homePoints: number;
    awayPoints: number;
    winner: 'home' | 'away';
    pointByPoint: SimulatedPoint[];
}

export interface SimulatedPoint {
    pointNumber: number;
    homeScore: number;
    awayScore: number;
    scorer: 'home' | 'away';
    type: 'attack' | 'block' | 'ace' | 'error';
}

export interface SimulationMoment {
    time: number;
    type: 'set_point' | 'match_point' | 'comeback' | 'streak' | 'timeout';
    description: string;
}
