export interface TeamStats {
  name: string;
  groupName: string; // [NEW] e.g., "1. GRUP"
  played: number;    // [NEW] Matches Played
  wins: number;
  points: number;
  setsWon: number;
  setsLost: number;
  setRatio?: number;
}

export interface Match {
  homeTeam: string;
  awayTeam: string;
  groupName: string; // [NEW]
  isPlayed: boolean;
  resultScore?: string;
  homeScore?: number | null;
  awayScore?: number | null;
  matchDate?: string; // YYYY-MM-DD
  matchTime?: string; // HH:MM
  id?: number;
  venue?: string;
}

export interface ScenarioOverride {
  homeTeam: string;
  awayTeam: string;
  score: string; // e.g. "3-0"
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
  matchPredictions: MatchPrediction[]; // [NEW] Next 3 matches
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

// Used for applyOverridesToTeams in playoffUtils
export interface MatchOverride {
  homeTeam: string;
  awayTeam: string;
  homeScore?: number;
  awayScore?: number;
  score?: string; // Alternative: "3-0" format
}

// Group scenarios storage format
export interface GroupScenarios {
  [groupName: string]: Record<string, string>;
}

// ============================================
// GAMIFICATION TYPES
// ============================================

export type AchievementId =
  | 'first_prediction'
  | 'streak_3'
  | 'streak_5'
  | 'champion_predictor'
  | 'perfect_week'
  | 'underdog_hero'
  | 'game_addict'
  | 'loyal_fan';

export interface Achievement {
  id: AchievementId;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string; // ISO date string
  xpReward: number;
}

export type QuestId =
  | 'daily_3_predictions'
  | 'daily_underdog'
  | 'daily_complete_group';

export interface Quest {
  id: QuestId;
  name: string;
  description: string;
  icon: string;
  target: number;
  progress: number;
  xpReward: number;
  expiresAt: string; // ISO date string (midnight)
  completed: boolean;
}

export interface PlayerStats {
  totalPredictions: number;
  correctPredictions: number;
  currentStreak: number;
  bestStreak: number;
  predictedChampions: string[];
}

export interface GameState {
  xp: number;
  level: number;
  favoriteTeam: string | null;
  achievements: Achievement[];
  quests: Quest[];
  stats: PlayerStats;
  soundEnabled: boolean;
  lastActiveDate: string; // ISO date for daily reset
}

export const LEVEL_THRESHOLDS = [
  0,      // Level 1
  100,    // Level 2
  250,    // Level 3
  500,    // Level 4
  800,    // Level 5 (Amatör)
  1200,   // Level 6
  1700,   // Level 7
  2300,   // Level 8
  3000,   // Level 9
  3800,   // Level 10 (Uzman)
  4700,   // Level 11
  5700,   // Level 12
  6800,   // Level 13
  8000,   // Level 14
  9300,   // Level 15
  10700,  // Level 16
  12200,  // Level 17
  13800,  // Level 18
  15500,  // Level 19
  17300,  // Level 20 (Efsane)
  20000,  // Level 21+
];

export const LEVEL_TITLES: Record<number, string> = {
  1: 'Çaylak',
  5: 'Amatör',
  10: 'Uzman',
  15: 'Profesyonel',
  20: 'Efsane',
};

