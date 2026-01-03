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

// ============================================
// FRIENDSHIP SYSTEM TYPES
// ============================================

export type FriendshipStatus = 'pending' | 'accepted' | 'rejected' | 'blocked';

export interface Friend {
  id: string;
  oderId: string;
  userId: string;
  friendId: string;
  status: FriendshipStatus;
  createdAt: string;
  updatedAt: string;
  // Joined user data
  friend?: UserProfile;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  favoriteTeam?: string;
  level: number;
  xp: number;
  totalPoints: number;
  rank?: number;
  badges: Badge[];
  isPremium: boolean;
  createdAt: string;
  lastActiveAt: string;
  // Privacy settings
  isProfilePublic: boolean;
  showPredictions: boolean;
}

export interface FriendActivity {
  id: string;
  userId: string;
  activityType: 'prediction' | 'achievement' | 'level_up' | 'badge' | 'streak';
  title: string;
  description: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  user?: UserProfile;
}

// ============================================
// BADGE & ACHIEVEMENT SYSTEM
// ============================================

export type BadgeRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type BadgeCategory = 'prediction' | 'social' | 'streak' | 'season' | 'special' | 'team';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: BadgeRarity;
  category: BadgeCategory;
  requirement: string;
  xpReward: number;
  unlockedAt?: string;
  progress?: number;
  target?: number;
}

export const BADGE_RARITY_COLORS: Record<BadgeRarity, string> = {
  common: 'from-slate-400 to-slate-500',
  uncommon: 'from-green-400 to-emerald-500',
  rare: 'from-blue-400 to-cyan-500',
  epic: 'from-purple-400 to-pink-500',
  legendary: 'from-amber-400 to-orange-500',
};

// ============================================
// DAILY QUESTS & CHALLENGES
// ============================================

export type DailyQuestType = 
  | 'make_predictions'
  | 'correct_predictions'
  | 'predict_underdog'
  | 'complete_group'
  | 'view_stats'
  | 'share_prediction'
  | 'add_friend'
  | 'comment_match';

export interface DailyQuest {
  id: string;
  type: DailyQuestType;
  title: string;
  description: string;
  icon: string;
  target: number;
  progress: number;
  xpReward: number;
  coinReward: number;
  expiresAt: string;
  completed: boolean;
  claimed: boolean;
}

export interface WeeklyChallenge {
  id: string;
  title: string;
  description: string;
  icon: string;
  startDate: string;
  endDate: string;
  target: number;
  progress: number;
  xpReward: number;
  badgeReward?: string;
  participants: number;
  leaderboard: ChallengeLeaderboardEntry[];
}

export interface ChallengeLeaderboardEntry {
  userId: string;
  displayName: string;
  avatarUrl?: string;
  score: number;
  rank: number;
}

// ============================================
// STREAK SYSTEM
// ============================================

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastPredictionDate: string;
  streakFreezeAvailable: number;
  streakHistory: StreakHistoryEntry[];
}

export interface StreakHistoryEntry {
  date: string;
  predictionsCount: number;
  correctCount: number;
  streakValue: number;
}

// ============================================
// NOTIFICATION SYSTEM
// ============================================

export type NotificationType = 
  | 'match_reminder'
  | 'match_result'
  | 'prediction_result'
  | 'friend_request'
  | 'friend_activity'
  | 'achievement'
  | 'level_up'
  | 'leaderboard_change'
  | 'daily_quest'
  | 'weekly_challenge'
  | 'system';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  icon?: string;
  link?: string;
  metadata?: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationPreferences {
  matchReminders: boolean;
  matchResults: boolean;
  friendRequests: boolean;
  friendActivity: boolean;
  achievements: boolean;
  leaderboardChanges: boolean;
  dailyQuests: boolean;
  weeklyDigest: boolean;
  pushEnabled: boolean;
  emailEnabled: boolean;
  quietHoursStart?: string; // HH:MM
  quietHoursEnd?: string;
}

// ============================================
// AI PREDICTION SYSTEM
// ============================================

export interface AIPrediction {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  predictedScore: string;
  confidence: number; // 0-100
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

// ============================================
// ADVANCED STATISTICS
// ============================================

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
  // Additional form fields for components
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
  // Basic stats
  played: number;
  wins: number;
  losses: number;
  points: number;
  setsWon: number;
  setsLost: number;
  setRatio: number;
  // Advanced stats
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
  // Form
  currentStreak: number;
  streakType: 'W' | 'L';
  last10: ('W' | 'L')[];
  // Rating
  eloRating: number;
  strengthRank: number;
}

export interface UserPredictionStats {
  userId: string;
  totalPredictions: number;
  correctPredictions: number;
  accuracy: number;
  // By league
  byLeague: Record<string, { total: number; correct: number; accuracy: number }>;
  // By team
  byTeam: Record<string, { total: number; correct: number; accuracy: number }>;
  // By score type
  exactScoreHits: number;
  winnerOnlyHits: number;
  // Streaks
  currentStreak: number;
  bestStreak: number;
  // Points
  totalPoints: number;
  avgPointsPerPrediction: number;
  // Time-based
  bestDay: string;
  bestWeek: string;
  bestMonth: string;
}

// ============================================
// LIVE FEATURES
// ============================================

export interface LiveMatch {
  id: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  status: 'scheduled' | 'live' | 'finished' | 'postponed' | 'upcoming';
  currentSet: number;
  homeSetScore: number;
  awaySetScore: number;
  currentSetHomePoints: number;
  currentSetAwayPoints: number;
  setScores: SetScore[];
  startTime: string;
  lastUpdated: string;
  venue?: string;
  viewers?: number;
  isHighlighted?: boolean;
  homeScore?: number[];
  awayScore?: number[];
  currentSetScore?: { home: number; away: number };
  setWins?: { home: number; away: number };
  // Live betting odds (if available)
  liveOdds?: {
    homeWin: number;
    awayWin: number;
  };
}

export interface SetScore {
  setNumber: number;
  homePoints: number;
  awayPoints: number;
  winner: 'home' | 'away';
}

export interface MatchComment {
  id: string;
  matchId: string;
  oderId: string;
  userId: string;
  message: string;
  createdAt: string;
  likes: number;
  user?: UserProfile;
}

export interface LiveChatMessage {
  id: string;
  matchId: string;
  userId: string;
  message: string;
  timestamp: string;
  user?: {
    displayName: string;
    avatarUrl?: string;
    badge?: string;
  };
}

// ============================================
// CUSTOM LEAGUES (Private Leagues)
// ============================================

export interface CustomLeague {
  id: string;
  name: string;
  description?: string;
  code: string; // Join code
  creatorId: string;
  isPrivate: boolean;
  maxMembers: number;
  members: CustomLeagueMember[];
  season: string;
  leagues: string[]; // Which volleyball leagues are included
  createdAt: string;
  startDate: string;
  endDate: string;
  prizes?: CustomLeaguePrize[];
}

export interface CustomLeagueMember {
  oderId: string;
  userId: string;
  role: 'owner' | 'admin' | 'member';
  points: number;
  rank: number;
  joinedAt: string;
  user?: UserProfile;
}

export interface CustomLeaguePrize {
  rank: number;
  title: string;
  description: string;
  icon: string;
}

export interface CustomLeagueInvite {
  id: string;
  leagueId: string;
  inviterId: string;
  inviteeId?: string;
  inviteeEmail?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  createdAt: string;
  expiresAt: string;
}

// ============================================
// TOURNAMENT PREDICTIONS
// ============================================

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

// ============================================
// PREMIUM FEATURES
// ============================================

export type PremiumTier = 'free' | 'basic' | 'pro' | 'elite';

export interface PremiumSubscription {
  userId: string;
  tier: PremiumTier;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  paymentMethod?: string;
  features: PremiumFeature[];
}

export interface PremiumFeature {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: PremiumTier;
  enabled: boolean;
}

export const PREMIUM_FEATURES: Record<PremiumTier, string[]> = {
  free: ['basic_predictions', 'leaderboard_view', 'basic_stats'],
  basic: ['ad_free', 'advanced_stats', 'ai_predictions_5', 'custom_avatar'],
  pro: ['unlimited_ai', 'h2h_analysis', 'form_graphs', 'priority_support', 'exclusive_badges'],
  elite: ['early_access', 'personal_coach', 'api_access', 'custom_leagues_unlimited'],
};

// ============================================
// THEME & UI PREFERENCES
// ============================================

export type ThemeMode = 'light' | 'dark' | 'system';
export type AccentColor = 'emerald' | 'blue' | 'purple' | 'rose' | 'amber' | 'cyan';

export interface UIPreferences {
  theme: ThemeMode;
  accentColor: AccentColor;
  soundEffects: boolean;
  hapticFeedback: boolean;
  compactMode: boolean;
  showAnimations: boolean;
  fontSize: 'small' | 'medium' | 'large';
  dashboardLayout: DashboardWidget[];
}

export interface DashboardWidget {
  id: string;
  type: 'standings' | 'upcoming' | 'leaderboard' | 'stats' | 'friends' | 'quests' | 'streak';
  position: number;
  size: 'small' | 'medium' | 'large';
  visible: boolean;
}

// ============================================
// COINS & VIRTUAL CURRENCY
// ============================================

export interface UserWallet {
  userId: string;
  coins: number;
  totalEarned: number;
  totalSpent: number;
  transactions: CoinTransaction[];
}

export interface CoinTransaction {
  id: string;
  type: 'earn' | 'spend';
  amount: number;
  reason: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'avatar' | 'badge' | 'theme' | 'boost' | 'freeze';
  price: number;
  rarity: BadgeRarity;
  isLimited: boolean;
  availableUntil?: string;
}

// ============================================
// AVATAR CUSTOMIZATION
// ============================================

export interface UserAvatar {
  oderId: string;
  userId: string;
  type: 'image' | 'custom';
  imageUrl?: string;
  customAvatar?: CustomAvatarConfig;
}

export interface CustomAvatarConfig {
  backgroundColor: string;
  shape: 'circle' | 'square' | 'hexagon';
  border: {
    color: string;
    width: number;
    style: 'solid' | 'gradient' | 'animated';
  };
  icon?: string;
  emoji?: string;
  initials?: string;
  frame?: string; // Earned through achievements
  effect?: 'glow' | 'pulse' | 'sparkle' | 'fire' | 'ice';
}

// ============================================
// MATCH SIMULATION
// ============================================

export interface MatchSimulation {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  simulatedSets: SimulatedSet[];
  finalScore: string;
  winner: string;
  keyMoments: SimulationMoment[];
  duration: number; // in seconds for animation
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
