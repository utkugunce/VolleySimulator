# Project Core Context (Types, State, Utils)

## File: app\types.ts
```typescript
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

```

## File: package.json
```typescript
{
  "name": "web_app",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "build:analyze": "ANALYZE=true next build",
    "start": "next start",
    "lint": "eslint",
    "test": "jest",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:report": "playwright show-report"
  },
  "dependencies": {
    "@google/generative-ai": "^0.24.1",
    "@radix-ui/react-accordion": "^1.2.12",
    "@radix-ui/react-avatar": "^1.1.11",
    "@radix-ui/react-checkbox": "^1.3.3",
    "@radix-ui/react-collapsible": "^1.1.12",
    "@radix-ui/react-dialog": "^1.1.15",
    "@radix-ui/react-dropdown-menu": "^2.1.16",
    "@radix-ui/react-label": "^2.1.8",
    "@radix-ui/react-navigation-menu": "^1.2.14",
    "@radix-ui/react-popover": "^1.1.15",
    "@radix-ui/react-progress": "^1.1.8",
    "@radix-ui/react-radio-group": "^1.3.8",
    "@radix-ui/react-scroll-area": "^1.2.10",
    "@radix-ui/react-select": "^2.2.6",
    "@radix-ui/react-separator": "^1.1.8",
    "@radix-ui/react-slider": "^1.3.6",
    "@radix-ui/react-slot": "^1.2.4",
    "@radix-ui/react-switch": "^1.2.6",
    "@radix-ui/react-tabs": "^1.1.13",
    "@radix-ui/react-tooltip": "^1.2.8",
    "@supabase/ssr": "^0.8.0",
    "@supabase/supabase-js": "^2.89.0",
    "@tailwindcss/postcss": "^4.1.18",
    "@tanstack/react-query": "^5.90.16",
    "@types/canvas-confetti": "^1.9.0",
    "@types/node": "^25.0.3",
    "@types/react": "^19.2.7",
    "@types/react-dom": "^19.2.3",
    "@vercel/analytics": "^1.6.1",
    "@vercel/speed-insights": "^1.3.1",
    "autoprefixer": "^10.4.23",
    "canvas-confetti": "^1.9.4",
    "cheerio": "^1.1.2",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "cmdk": "^1.1.1",
    "eslint": "^9.39.2",
    "eslint-config-next": "^16.1.1",
    "framer-motion": "^12.23.26",
    "html-to-image": "^1.11.13",
    "iconv-lite": "^0.7.1",
    "lucide-react": "^0.562.0",
    "next": "^16.1.1",
    "next-intl": "^4.7.0",
    "next-themes": "^0.4.6",
    "postcss": "^8.5.6",
    "puppeteer": "^24.34.0",
    "react": "^19.2.3",
    "react-dom": "^19.2.3",
    "react-hot-toast": "^2.6.0",
    "recharts": "^3.6.0",
    "sonner": "^2.0.7",
    "tailwind-merge": "^3.4.0",
    "tailwindcss": "^4.1.18",
    "tailwindcss-animate": "^1.0.7",
    "tw-animate-css": "^1.4.0",
    "typescript": "^5.9.3"
  },
  "devDependencies": {
    "@next/bundle-analyzer": "^16.1.1",
    "@playwright/test": "^1.57.0",
    "@testing-library/dom": "^10.4.1",
    "@testing-library/jest-dom": "^6.9.1",
    "@testing-library/react": "^16.3.1",
    "@types/jest": "^30.0.0",
    "jest": "^30.2.0",
    "jest-environment-jsdom": "^30.2.0",
    "ts-node": "^10.9.2",
    "xlsx": "^0.18.5"
  }
}

```

## File: next.config.ts
```typescript
import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

// eslint-disable-next-line @typescript-eslint/no-require-imports
const bundleAnalyzer = process.env.ANALYZE === 'true' ? require('@next/bundle-analyzer') : null;
const withBundleAnalyzer = bundleAnalyzer
  ? bundleAnalyzer({ enabled: true })
  : (config: NextConfig) => config;

const nextConfig: NextConfig = {
  // output: 'export', // Uncomment for static site generation (no API routes support if used)

  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
  },

  // Turbopack requires an empty config object for recognition
  turbopack: {},

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },

  // Experimental features for better performance
  experimental: {
    optimizePackageImports: [
      '@supabase/supabase-js',
      '@tanstack/react-query',
      'cheerio',
      'lucide-react',
      'date-fns',
      'lodash',
      'recharts'
    ],
  },

  // Production optimizations
  poweredByHeader: false,
  reactStrictMode: true,

  // Enable gzip/brotli compression headers hint
  compress: true,

  // Security headers using Next.js async headers function
  async headers() {
    return [
      {
        source: '/((?!api|_next/static|_next/image|favicon.ico).*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://www.googletagmanager.com https://www.google-analytics.com https://acsbapp.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data: https:; connect-src 'self' https://supabase.co https://www.google-analytics.com https://www.googletagmanager.com https://acsbapp.com; frame-ancestors 'none'"
          }
        ]
      }
    ];
  }
};

export default withNextIntl(withBundleAnalyzer(nextConfig));

```

## File: tsconfig.json
```typescript
{
  "compilerOptions": {
    "forceConsistentCasingInFileNames": true,
    "target": "ES2020",
    "lib": [
      "dom",
      "dom.iterable",
      "esnext"
    ],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": [
        "./*"
      ]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts",
    "**/*.mts"
  ],
  "exclude": [
    "node_modules"
  ]
}
```

## File: README.md
```typescript
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

```

## File: app\context\AuthContext.tsx
```typescript
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session, SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '../utils/supabase';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    signUp: (email: string, password: string, metadata?: { name?: string }) => Promise<{ error: Error | null }>;
    signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
    signOut: () => Promise<void>;
    signInWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [supabase, setSupabase] = useState<SupabaseClient | null>(null);

    // Initialize Supabase client only in browser
    useEffect(() => {
        const client = createClient();
        setSupabase(client);

        if (!client) {
            setLoading(false);
            return;
        }

        const initAuth = async () => {
            try {
                // Set a timeout to prevent infinite loading
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Auth timeout')), 5000)
                );

                const sessionPromise = client.auth.getSession();

                // Race between session fetch and timeout
                const { data } = await Promise.race([sessionPromise, timeoutPromise]) as any;

                setSession(data.session);
                setUser(data.session?.user ?? null);
            } catch (err) {
                console.warn("Auth check failed or timed out:", err);
                // If it was a timeout or error, valid state is "not logged in"
                setSession(null);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        initAuth();

        // Listen for auth changes
        const { data: { subscription } } = client.auth.onAuthStateChange((_event: string, currentSession: Session | null) => {
            setSession(currentSession);
            setUser(currentSession?.user ?? null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signUp = async (email: string, password: string, metadata?: { name?: string }) => {
        if (!supabase) {
            return { error: new Error('Supabase is not configured') };
        }
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: metadata
            }
        });
        return { error: error as Error | null };
    };

    const signIn = async (email: string, password: string) => {
        if (!supabase) {
            return { error: new Error('Supabase is not configured') };
        }
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        return { error: error as Error | null };
    };

    const signOut = async () => {
        if (!supabase) return;
        await supabase.auth.signOut();
        // Redirect to home page after sign out
        window.location.href = '/';
    };

    const signInWithGoogle = async () => {
        if (!supabase) return;
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`
            }
        });
    };

    return (
        <AuthContext.Provider value={{
            user,
            session,
            loading,
            signUp,
            signIn,
            signOut,
            signInWithGoogle
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

```

## File: app\context\CustomLeaguesContext.tsx
```typescript
"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { 
  CustomLeague, 
  CustomLeagueMember, 
  CustomLeagueInvite,
  UserProfile 
} from "../types";
import { useAuth } from "./AuthContext";

interface CustomLeaguesContextType {
  myLeagues: CustomLeague[];
  joinedLeagues: CustomLeague[];
  pendingInvites: CustomLeagueInvite[];
  currentLeague: CustomLeague | null;
  isLoading: boolean;
  error: string | null;
  // Actions
  createLeague: (data: CreateLeagueData) => Promise<CustomLeague | null>;
  updateLeague: (leagueId: string, data: Partial<CreateLeagueData>) => Promise<boolean>;
  deleteLeague: (leagueId: string) => Promise<boolean>;
  joinLeague: (code: string) => Promise<boolean>;
  leaveLeague: (leagueId: string) => Promise<boolean>;
  inviteMember: (leagueId: string, email: string) => Promise<boolean>;
  removeMember: (leagueId: string, userId: string) => Promise<boolean>;
  promoteMember: (leagueId: string, userId: string, role: 'admin' | 'member') => Promise<boolean>;
  acceptInvite: (inviteId: string) => Promise<boolean>;
  rejectInvite: (inviteId: string) => Promise<boolean>;
  getLeagueDetails: (leagueId: string) => Promise<CustomLeague | null>;
  getLeagueLeaderboard: (leagueId: string) => Promise<CustomLeagueMember[]>;
  refreshLeagues: () => Promise<void>;
}

interface CreateLeagueData {
  name: string;
  description?: string;
  isPrivate: boolean;
  maxMembers: number;
  leagues: string[];
  startDate: string;
  endDate: string;
}

const CustomLeaguesContext = createContext<CustomLeaguesContextType | undefined>(undefined);

export function CustomLeaguesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [myLeagues, setMyLeagues] = useState<CustomLeague[]>([]);
  const [joinedLeagues, setJoinedLeagues] = useState<CustomLeague[]>([]);
  const [pendingInvites, setPendingInvites] = useState<CustomLeagueInvite[]>([]);
  const [currentLeague, setCurrentLeague] = useState<CustomLeague | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's leagues
  const fetchLeagues = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/custom-leagues', {
        headers: {
          'Authorization': `Bearer ${user.id}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch leagues');
      
      const data = await response.json();
      setMyLeagues(data.myLeagues || []);
      setJoinedLeagues(data.joinedLeagues || []);
      setPendingInvites(data.pendingInvites || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Create new league
  const createLeague = useCallback(async (data: CreateLeagueData): Promise<CustomLeague | null> => {
    if (!user) return null;
    
    try {
      const response = await fetch('/api/custom-leagues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.id}`,
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) throw new Error('Failed to create league');
      
      const result = await response.json();
      await fetchLeagues();
      return result.league;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    }
  }, [user, fetchLeagues]);

  // Update league
  const updateLeague = useCallback(async (
    leagueId: string, 
    data: Partial<CreateLeagueData>
  ): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const response = await fetch(`/api/custom-leagues/${leagueId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.id}`,
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) throw new Error('Failed to update league');
      
      await fetchLeagues();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    }
  }, [user, fetchLeagues]);

  // Delete league
  const deleteLeague = useCallback(async (leagueId: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const response = await fetch(`/api/custom-leagues/${leagueId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.id}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to delete league');
      
      await fetchLeagues();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    }
  }, [user, fetchLeagues]);

  // Join league with code
  const joinLeague = useCallback(async (code: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const response = await fetch('/api/custom-leagues/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.id}`,
        },
        body: JSON.stringify({ code }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to join league');
      }
      
      await fetchLeagues();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    }
  }, [user, fetchLeagues]);

  // Leave league
  const leaveLeague = useCallback(async (leagueId: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const response = await fetch(`/api/custom-leagues/${leagueId}/leave`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.id}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to leave league');
      
      await fetchLeagues();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    }
  }, [user, fetchLeagues]);

  // Invite member
  const inviteMember = useCallback(async (leagueId: string, email: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const response = await fetch(`/api/custom-leagues/${leagueId}/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.id}`,
        },
        body: JSON.stringify({ email }),
      });
      
      if (!response.ok) throw new Error('Failed to invite member');
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    }
  }, [user]);

  // Remove member
  const removeMember = useCallback(async (leagueId: string, userId: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const response = await fetch(`/api/custom-leagues/${leagueId}/members/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.id}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to remove member');
      
      await fetchLeagues();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    }
  }, [user, fetchLeagues]);

  // Promote/demote member
  const promoteMember = useCallback(async (
    leagueId: string, 
    userId: string, 
    role: 'admin' | 'member'
  ): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const response = await fetch(`/api/custom-leagues/${leagueId}/members/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.id}`,
        },
        body: JSON.stringify({ role }),
      });
      
      if (!response.ok) throw new Error('Failed to update member role');
      
      await fetchLeagues();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    }
  }, [user, fetchLeagues]);

  // Accept invite
  const acceptInvite = useCallback(async (inviteId: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const response = await fetch(`/api/custom-leagues/invites/${inviteId}/accept`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.id}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to accept invite');
      
      await fetchLeagues();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    }
  }, [user, fetchLeagues]);

  // Reject invite
  const rejectInvite = useCallback(async (inviteId: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const response = await fetch(`/api/custom-leagues/invites/${inviteId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.id}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to reject invite');
      
      await fetchLeagues();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    }
  }, [user, fetchLeagues]);

  // Get league details
  const getLeagueDetails = useCallback(async (leagueId: string): Promise<CustomLeague | null> => {
    if (!user) return null;
    
    try {
      const response = await fetch(`/api/custom-leagues/${leagueId}`, {
        headers: {
          'Authorization': `Bearer ${user.id}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to get league details');
      
      const data = await response.json();
      setCurrentLeague(data.league);
      return data.league;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    }
  }, [user]);

  // Get league leaderboard
  const getLeagueLeaderboard = useCallback(async (leagueId: string): Promise<CustomLeagueMember[]> => {
    if (!user) return [];
    
    try {
      const response = await fetch(`/api/custom-leagues/${leagueId}/leaderboard`, {
        headers: {
          'Authorization': `Bearer ${user.id}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to get leaderboard');
      
      const data = await response.json();
      return data.leaderboard || [];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return [];
    }
  }, [user]);

  // Refresh leagues
  const refreshLeagues = useCallback(async () => {
    await fetchLeagues();
  }, [fetchLeagues]);

  // Initial fetch
  useEffect(() => {
    if (user) {
      fetchLeagues();
    }
  }, [user, fetchLeagues]);

  return (
    <CustomLeaguesContext.Provider
      value={{
        myLeagues,
        joinedLeagues,
        pendingInvites,
        currentLeague,
        isLoading,
        error,
        createLeague,
        updateLeague,
        deleteLeague,
        joinLeague,
        leaveLeague,
        inviteMember,
        removeMember,
        promoteMember,
        acceptInvite,
        rejectInvite,
        getLeagueDetails,
        getLeagueLeaderboard,
        refreshLeagues,
      }}
    >
      {children}
    </CustomLeaguesContext.Provider>
  );
}

export function useCustomLeagues() {
  const context = useContext(CustomLeaguesContext);
  if (context === undefined) {
    throw new Error('useCustomLeagues must be used within a CustomLeaguesProvider');
  }
  return context;
}

```

## File: app\context\FriendsContext.tsx
```typescript
"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { Friend, UserProfile, FriendActivity, FriendshipStatus } from "../types";
import { useAuth } from "./AuthContext";

interface FriendsContextType {
  friends: Friend[];
  pendingRequests: Friend[];
  friendActivities: FriendActivity[];
  isLoading: boolean;
  error: string | null;
  // Actions
  sendFriendRequest: (userId: string) => Promise<boolean>;
  acceptFriendRequest: (friendshipId: string) => Promise<boolean>;
  rejectFriendRequest: (friendshipId: string) => Promise<boolean>;
  removeFriend: (friendshipId: string) => Promise<boolean>;
  blockUser: (userId: string) => Promise<boolean>;
  searchUsers: (query: string) => Promise<UserProfile[]>;
  getFriendProfile: (userId: string) => Promise<UserProfile | null>;
  comparePredictions: (friendId: string, league?: string) => Promise<PredictionComparison | null>;
  refreshFriends: () => Promise<void>;
}

interface PredictionComparison {
  userId: string;
  friendId: string;
  userStats: {
    totalPredictions: number;
    correctPredictions: number;
    accuracy: number;
    points: number;
  };
  friendStats: {
    totalPredictions: number;
    correctPredictions: number;
    accuracy: number;
    points: number;
  };
  commonMatches: CommonMatchPrediction[];
}

interface CommonMatchPrediction {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  userPrediction: string;
  friendPrediction: string;
  actualResult?: string;
  userCorrect?: boolean;
  friendCorrect?: boolean;
}

const FriendsContext = createContext<FriendsContextType | undefined>(undefined);

export function FriendsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Friend[]>([]);
  const [friendActivities, setFriendActivities] = useState<FriendActivity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch friends list
  const fetchFriends = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/friends', {
        headers: {
          'Authorization': `Bearer ${user.id}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch friends');
      
      const data = await response.json();
      setFriends(data.friends || []);
      setPendingRequests(data.pendingRequests || []);
      setFriendActivities(data.activities || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Send friend request
  const sendFriendRequest = useCallback(async (userId: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const response = await fetch('/api/friends/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.id}`,
        },
        body: JSON.stringify({ friendId: userId }),
      });
      
      if (!response.ok) throw new Error('Failed to send friend request');
      
      await fetchFriends();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    }
  }, [user, fetchFriends]);

  // Accept friend request
  const acceptFriendRequest = useCallback(async (friendshipId: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const response = await fetch(`/api/friends/request/${friendshipId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.id}`,
        },
        body: JSON.stringify({ action: 'accept' }),
      });
      
      if (!response.ok) throw new Error('Failed to accept friend request');
      
      await fetchFriends();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    }
  }, [user, fetchFriends]);

  // Reject friend request
  const rejectFriendRequest = useCallback(async (friendshipId: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const response = await fetch(`/api/friends/request/${friendshipId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.id}`,
        },
        body: JSON.stringify({ action: 'reject' }),
      });
      
      if (!response.ok) throw new Error('Failed to reject friend request');
      
      await fetchFriends();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    }
  }, [user, fetchFriends]);

  // Remove friend
  const removeFriend = useCallback(async (friendshipId: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const response = await fetch(`/api/friends/${friendshipId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.id}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to remove friend');
      
      await fetchFriends();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    }
  }, [user, fetchFriends]);

  // Block user
  const blockUser = useCallback(async (userId: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const response = await fetch('/api/friends/block', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.id}`,
        },
        body: JSON.stringify({ userId }),
      });
      
      if (!response.ok) throw new Error('Failed to block user');
      
      await fetchFriends();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    }
  }, [user, fetchFriends]);

  // Search users
  const searchUsers = useCallback(async (query: string): Promise<UserProfile[]> => {
    if (!user || query.length < 2) return [];
    
    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': `Bearer ${user.id}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to search users');
      
      const data = await response.json();
      return data.users || [];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return [];
    }
  }, [user]);

  // Get friend profile
  const getFriendProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    if (!user) return null;
    
    try {
      const response = await fetch(`/api/users/${userId}/profile`, {
        headers: {
          'Authorization': `Bearer ${user.id}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to get user profile');
      
      const data = await response.json();
      return data.profile;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    }
  }, [user]);

  // Compare predictions with friend
  const comparePredictions = useCallback(async (
    friendId: string,
    league?: string
  ): Promise<PredictionComparison | null> => {
    if (!user) return null;
    
    try {
      const url = league 
        ? `/api/friends/${friendId}/compare?league=${encodeURIComponent(league)}`
        : `/api/friends/${friendId}/compare`;
        
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${user.id}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to compare predictions');
      
      const data = await response.json();
      return data.comparison;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    }
  }, [user]);

  // Refresh friends data
  const refreshFriends = useCallback(async () => {
    await fetchFriends();
  }, [fetchFriends]);

  // Initial fetch
  useEffect(() => {
    if (user) {
      fetchFriends();
    }
  }, [user, fetchFriends]);

  return (
    <FriendsContext.Provider
      value={{
        friends,
        pendingRequests,
        friendActivities,
        isLoading,
        error,
        sendFriendRequest,
        acceptFriendRequest,
        rejectFriendRequest,
        removeFriend,
        blockUser,
        searchUsers,
        getFriendProfile,
        comparePredictions,
        refreshFriends,
      }}
    >
      {children}
    </FriendsContext.Provider>
  );
}

export function useFriends() {
  const context = useContext(FriendsContext);
  if (context === undefined) {
    throw new Error('useFriends must be used within a FriendsProvider');
  }
  return context;
}

```

## File: app\context\LiveMatchContext.tsx
```typescript
"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import {
  LiveMatch,
  MatchComment,
  LiveChatMessage,
  MatchSimulation
} from "../types";
import { useAuth } from "./AuthContext";

interface LiveMatchContextType {
  liveMatches: LiveMatch[];
  currentMatch: LiveMatch | null;
  comments: MatchComment[];
  chatMessages: LiveChatMessage[];
  isLoading: boolean;
  isConnected: boolean;
  // Actions
  selectMatch: (matchId: string) => void;
  addComment: (matchId: string, message: string) => Promise<boolean>;
  likeComment: (commentId: string) => Promise<boolean>;
  sendChatMessage: (matchId: string, message: string) => Promise<boolean>;
  subscribeToMatch: (matchId: string) => void;
  unsubscribeFromMatch: () => void;
  simulateMatch: (homeTeam: string, awayTeam: string) => Promise<MatchSimulation | null>;
  refreshLiveMatches: () => Promise<void>;
}

const LiveMatchContext = createContext<LiveMatchContextType | undefined>(undefined);

export function LiveMatchProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [liveMatches, setLiveMatches] = useState<LiveMatch[]>([]);
  const [currentMatch, setCurrentMatch] = useState<LiveMatch | null>(null);
  const [comments, setComments] = useState<MatchComment[]>([]);
  const [chatMessages, setChatMessages] = useState<LiveChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [websocket, setWebsocket] = useState<WebSocket | null>(null);

  // Fetch live matches
  const fetchLiveMatches = useCallback(async () => {
    setIsLoading(true);

    try {
      // Use consolidated API endpoint
      const response = await fetch('/api/live');

      if (!response.ok) throw new Error('Failed to fetch live matches');

      const data = await response.json();
      // API returns liveMatches, context expects matches but state is named liveMatches
      // The previous code expected data.matches, but route returns data.liveMatches
      setLiveMatches(data.liveMatches || []);
    } catch (err) {
      console.error('Failed to fetch live matches:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Select a match to follow
  const selectMatch = useCallback((matchId: string) => {
    const match = liveMatches.find(m => m.id === matchId);
    setCurrentMatch(match || null);

    if (match) {
      // Fetch comments for this match
      fetchComments(matchId);
    }
  }, [liveMatches]);

  // Fetch comments for a match
  const fetchComments = async (matchId: string) => {
    try {
      const response = await fetch(`/api/live/matches/${matchId}/comments`);

      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
      }
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    }
  };

  // Add comment
  const addComment = useCallback(async (matchId: string, message: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const response = await fetch(`/api/live/matches/${matchId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.id}`,
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) throw new Error('Failed to add comment');

      const data = await response.json();
      setComments(prev => [data.comment, ...prev]);

      return true;
    } catch (err) {
      console.error('Failed to add comment:', err);
      return false;
    }
  }, [user]);

  // Like comment
  const likeComment = useCallback(async (commentId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const response = await fetch(`/api/live/comments/${commentId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.id}`,
        },
      });

      if (!response.ok) throw new Error('Failed to like comment');

      setComments(prev =>
        prev.map(c => c.id === commentId ? { ...c, likes: c.likes + 1 } : c)
      );

      return true;
    } catch (err) {
      console.error('Failed to like comment:', err);
      return false;
    }
  }, [user]);

  // Send chat message (WebSocket)
  const sendChatMessage = useCallback(async (matchId: string, message: string): Promise<boolean> => {
    if (!user || !websocket || websocket.readyState !== WebSocket.OPEN) return false;

    try {
      websocket.send(JSON.stringify({
        type: 'chat_message',
        matchId,
        message,
        userId: user.id,
      }));

      return true;
    } catch (err) {
      console.error('Failed to send chat message:', err);
      return false;
    }
  }, [user, websocket]);

  // Subscribe to live match updates (WebSocket)
  const subscribeToMatch = useCallback((matchId: string) => {
    // Close existing connection
    if (websocket) {
      websocket.close();
    }

    // Create new WebSocket connection
    const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001'}/live/${matchId}`);

    ws.onopen = () => {
      setIsConnected(true);
      setIsConnected(true);
      // Connected
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case 'match_update':
            setCurrentMatch(prev => prev ? { ...prev, ...data.match } : null);
            break;
          case 'chat_message':
            setChatMessages(prev => [...prev, data.message]);
            break;
          case 'score_update':
            setCurrentMatch(prev => {
              if (!prev) return null;
              return {
                ...prev,
                currentSetHomePoints: data.homePoints,
                currentSetAwayPoints: data.awayPoints,
              };
            });
            break;
          case 'set_end':
            setCurrentMatch(prev => {
              if (!prev) return null;
              return {
                ...prev,
                homeSetScore: data.homeSetScore,
                awaySetScore: data.awaySetScore,
                currentSet: data.currentSet,
                setScores: data.setScores,
              };
            });
            break;
          case 'match_end':
            setCurrentMatch(prev => prev ? { ...prev, status: 'finished' } : null);
            break;
        }
      } catch (err) {
        console.error('Failed to parse WebSocket message:', err);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      setIsConnected(false);
      // Disconnected
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };

    setWebsocket(ws);
  }, [websocket]);

  // Unsubscribe from match
  const unsubscribeFromMatch = useCallback(() => {
    if (websocket) {
      websocket.close();
      setWebsocket(null);
    }
    setIsConnected(false);
    setChatMessages([]);
  }, [websocket]);

  // Simulate a match
  const simulateMatch = useCallback(async (
    homeTeam: string,
    awayTeam: string
  ): Promise<MatchSimulation | null> => {
    try {
      const response = await fetch('/api/simulation/match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ homeTeam, awayTeam }),
      });

      if (!response.ok) throw new Error('Failed to simulate match');

      const data = await response.json();
      return data.simulation;
    } catch (err) {
      console.error('Failed to simulate match:', err);
      return null;
    }
  }, []);

  // Refresh live matches
  const refreshLiveMatches = useCallback(async () => {
    await fetchLiveMatches();
  }, [fetchLiveMatches]);

  // Initial fetch and polling
  useEffect(() => {
    fetchLiveMatches();

    // Poll for updates every 30 seconds
    const interval = setInterval(fetchLiveMatches, 30000);

    return () => clearInterval(interval);
  }, [fetchLiveMatches]);

  // Cleanup WebSocket on unmount
  useEffect(() => {
    return () => {
      if (websocket) {
        websocket.close();
      }
    };
  }, [websocket]);

  return (
    <LiveMatchContext.Provider
      value={{
        liveMatches,
        currentMatch,
        comments,
        chatMessages,
        isLoading,
        isConnected,
        selectMatch,
        addComment,
        likeComment,
        sendChatMessage,
        subscribeToMatch,
        unsubscribeFromMatch,
        simulateMatch,
        refreshLiveMatches,
      }}
    >
      {children}
    </LiveMatchContext.Provider>
  );
}

export function useLiveMatch() {
  const context = useContext(LiveMatchContext);
  if (context === undefined) {
    throw new Error('useLiveMatch must be used within a LiveMatchProvider');
  }
  return context;
}

```

## File: app\context\LocaleContext.tsx
```typescript
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Locale = 'tr' | 'en';

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

function getInitialLocale(): Locale {
  if (typeof document === 'undefined') return 'tr';
  
  const savedLocale = document.cookie
    .split('; ')
    .find(row => row.startsWith('NEXT_LOCALE='))
    ?.split('=')[1];
  
  if (savedLocale === 'tr' || savedLocale === 'en') {
    return savedLocale;
  }
  return 'tr';
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    // Set cookie for 1 year
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
    // Reload to apply new locale
    window.location.reload();
  };

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
}

```

## File: app\context\NotificationsContext.tsx
```typescript
"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import type { Notification, NotificationPreferences, NotificationType } from "../types";
import { useAuth } from "./AuthContext";

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  preferences: NotificationPreferences;
  isLoading: boolean;
  // Actions
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  clearAll: () => Promise<void>;
  updatePreferences: (prefs: Partial<NotificationPreferences>) => Promise<void>;
  requestPushPermission: () => Promise<boolean>;
  // Real-time
  subscribeToNotifications: () => void;
  unsubscribeFromNotifications: () => void;
}

const defaultPreferences: NotificationPreferences = {
  matchReminders: true,
  matchResults: true,
  friendRequests: true,
  friendActivity: true,
  achievements: true,
  leaderboardChanges: true,
  dailyQuests: true,
  weeklyDigest: true,
  pushEnabled: false,
  emailEnabled: true,
};

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);
  const [isLoading, setIsLoading] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/notifications', {
        headers: {
          'Authorization': `Bearer ${user.id}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch notifications');
      
      const data = await response.json();
      setNotifications(data.notifications || []);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Fetch preferences
  const fetchPreferences = useCallback(async () => {
    if (!user) return;
    
    try {
      const response = await fetch('/api/notifications/preferences', {
        headers: {
          'Authorization': `Bearer ${user.id}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch preferences');
      
      const data = await response.json();
      setPreferences(data.preferences || defaultPreferences);
    } catch (err) {
      console.error('Failed to fetch preferences:', err);
    }
  }, [user]);

  // Mark single notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    if (!user) return;
    
    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user.id}`,
        },
      });
      
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  }, [user]);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    if (!user) return;
    
    try {
      await fetch('/api/notifications/read-all', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user.id}`,
        },
      });
      
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  }, [user]);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    if (!user) return;
    
    try {
      await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.id}`,
        },
      });
      
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  }, [user]);

  // Clear all notifications
  const clearAll = useCallback(async () => {
    if (!user) return;
    
    try {
      await fetch('/api/notifications', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.id}`,
        },
      });
      
      setNotifications([]);
    } catch (err) {
      console.error('Failed to clear notifications:', err);
    }
  }, [user]);

  // Update preferences
  const updatePreferences = useCallback(async (prefs: Partial<NotificationPreferences>) => {
    if (!user) return;
    
    try {
      const response = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.id}`,
        },
        body: JSON.stringify(prefs),
      });
      
      if (!response.ok) throw new Error('Failed to update preferences');
      
      setPreferences(prev => ({ ...prev, ...prefs }));
    } catch (err) {
      console.error('Failed to update preferences:', err);
    }
  }, [user]);

  // Request push permission
  const requestPushPermission = useCallback(async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }
    
    if (Notification.permission === 'granted') {
      await updatePreferences({ pushEnabled: true });
      return true;
    }
    
    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        await updatePreferences({ pushEnabled: true });
        
        // Register service worker for push
        if ('serviceWorker' in navigator) {
          try {
            const registration = await navigator.serviceWorker.ready;
            // Here you would subscribe to push notifications
            console.log('Push notification registered');
          } catch (err) {
            console.error('Failed to register push:', err);
          }
        }
        
        return true;
      }
    }
    
    return false;
  }, [updatePreferences]);

  // Subscribe to real-time notifications (SSE)
  const subscribeToNotifications = useCallback(() => {
    if (!user || eventSourceRef.current) return;
    
    eventSourceRef.current = new EventSource(`/api/notifications/stream?userId=${user.id}`);
    
    eventSourceRef.current.onmessage = (event) => {
      try {
        const notification = JSON.parse(event.data) as Notification;
        setNotifications(prev => [notification, ...prev]);
        
        // Show browser notification if enabled
        if (preferences.pushEnabled && Notification.permission === 'granted') {
          new Notification(notification.title, {
            body: notification.message,
            icon: '/icons/icon-192x192.png',
          });
        }
      } catch (err) {
        console.error('Failed to parse notification:', err);
      }
    };
    
    eventSourceRef.current.onerror = () => {
      eventSourceRef.current?.close();
      eventSourceRef.current = null;
      
      // Retry after 5 seconds
      setTimeout(subscribeToNotifications, 5000);
    };
  }, [user, preferences.pushEnabled]);

  // Unsubscribe from notifications
  const unsubscribeFromNotifications = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    if (user) {
      fetchNotifications();
      fetchPreferences();
    }
  }, [user, fetchNotifications, fetchPreferences]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      unsubscribeFromNotifications();
    };
  }, [unsubscribeFromNotifications]);

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        preferences,
        isLoading,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
        updatePreferences,
        requestPushPermission,
        subscribeToNotifications,
        unsubscribeFromNotifications,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
}

```

## File: app\context\QuestsContext.tsx
```typescript
"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { DailyQuest, WeeklyChallenge, StreakData, Badge } from "../types";
import { useAuth } from "./AuthContext";
import { useGameState } from "../utils/gameState";

interface QuestsContextType {
  dailyQuests: DailyQuest[];
  weeklyChallenge: WeeklyChallenge | null;
  streakData: StreakData;
  badges: Badge[];
  unlockedBadges: Badge[];
  isLoading: boolean;
  // Actions
  claimQuestReward: (questId: string) => Promise<{ xp: number; coins: number } | null>;
  useStreakFreeze: () => Promise<boolean>;
  refreshQuests: () => Promise<void>;
  trackQuestProgress: (questType: string, amount?: number) => Promise<void>;
}

const defaultStreakData: StreakData = {
  currentStreak: 0,
  longestStreak: 0,
  lastPredictionDate: '',
  streakFreezeAvailable: 0,
  streakHistory: [],
};

const QuestsContext = createContext<QuestsContextType | undefined>(undefined);

export function QuestsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { addXP } = useGameState();
  const [dailyQuests, setDailyQuests] = useState<DailyQuest[]>([]);
  const [weeklyChallenge, setWeeklyChallenge] = useState<WeeklyChallenge | null>(null);
  const [streakData, setStreakData] = useState<StreakData>(defaultStreakData);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [unlockedBadges, setUnlockedBadges] = useState<Badge[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch daily quests
  const fetchQuests = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);

    try {
      // Use consolidated API endpoint
      const response = await fetch('/api/quests', {
        headers: { 'Authorization': `Bearer ${user.id}` },
      });

      if (response.ok) {
        const data = await response.json();

        if (data.dailyQuests) {
          setDailyQuests(data.dailyQuests);
        } else {
          setDailyQuests(generateDefaultQuests());
        }

        if (data.weeklyChallenge) {
          setWeeklyChallenge(data.weeklyChallenge);
        }

        if (data.streak) {
          setStreakData(data.streak);
        } else {
          setStreakData(defaultStreakData);
        }

        if (data.badges) {
          setBadges(data.badges);
          // Assuming unlockedBadges are part of badges or separate property, 
          // but API returns 'badges' which likely contains status.
          // For now, filtering if structure supports it, or setting empty if separate property missing
          setUnlockedBadges(data.badges.filter((b: Badge) => b.unlockedAt) || []);
        }
      } else {
        throw new Error('Failed to fetch quests');
      }
    } catch (err) {
      console.error('Failed to fetch quests:', err);
      // Use default quests on error
      setDailyQuests(generateDefaultQuests());
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Generate default daily quests
  function generateDefaultQuests(): DailyQuest[] {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const expiresAt = today.toISOString();

    return [
      {
        id: 'daily_predict_3',
        type: 'make_predictions',
        title: '3 Tahmin Yap',
        description: 'Bugün en az 3 maç tahmini yap',
        icon: '🎯',
        target: 3,
        progress: 0,
        xpReward: 50,
        coinReward: 10,
        expiresAt,
        completed: false,
        claimed: false,
      },
      {
        id: 'daily_correct_1',
        type: 'correct_predictions',
        title: 'Doğru Tahmin',
        description: '1 doğru tahmin yap',
        icon: '✅',
        target: 1,
        progress: 0,
        xpReward: 75,
        coinReward: 15,
        expiresAt,
        completed: false,
        claimed: false,
      },
      {
        id: 'daily_underdog',
        type: 'predict_underdog',
        title: 'Underdog Tahmini',
        description: 'Bir maçta sürpriz sonuç tahmin et',
        icon: '🐺',
        target: 1,
        progress: 0,
        xpReward: 100,
        coinReward: 25,
        expiresAt,
        completed: false,
        claimed: false,
      },
      {
        id: 'daily_view_stats',
        type: 'view_stats',
        title: 'İstatistikleri İncele',
        description: 'Takım istatistiklerini görüntüle',
        icon: '📊',
        target: 1,
        progress: 0,
        xpReward: 25,
        coinReward: 5,
        expiresAt,
        completed: false,
        claimed: false,
      },
    ];
  }

  // Claim quest reward
  const claimQuestReward = useCallback(async (questId: string): Promise<{ xp: number; coins: number } | null> => {
    if (!user) return null;

    const quest = dailyQuests.find(q => q.id === questId);
    if (!quest || !quest.completed || quest.claimed) return null;

    try {
      const response = await fetch(`/api/quests/${questId}/claim`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.id}`,
        },
      });

      if (!response.ok) throw new Error('Failed to claim reward');

      const data = await response.json();

      // Update local state
      setDailyQuests(prev =>
        prev.map(q => q.id === questId ? { ...q, claimed: true } : q)
      );

      // Add XP
      addXP(quest.xpReward);

      return { xp: quest.xpReward, coins: quest.coinReward };
    } catch (err) {
      console.error('Failed to claim reward:', err);
      return null;
    }
  }, [user, dailyQuests, addXP]);

  // Use streak freeze
  const useStreakFreeze = useCallback(async (): Promise<boolean> => {
    if (!user || streakData.streakFreezeAvailable <= 0) return false;

    try {
      const response = await fetch('/api/streak/freeze', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.id}`,
        },
      });

      if (!response.ok) throw new Error('Failed to use streak freeze');

      setStreakData(prev => ({
        ...prev,
        streakFreezeAvailable: prev.streakFreezeAvailable - 1,
      }));

      return true;
    } catch (err) {
      console.error('Failed to use streak freeze:', err);
      return false;
    }
  }, [user, streakData.streakFreezeAvailable]);

  // Track quest progress
  const trackQuestProgress = useCallback(async (questType: string, amount: number = 1) => {
    if (!user) return;

    // Update local state optimistically
    setDailyQuests(prev =>
      prev.map(q => {
        if (q.type === questType && !q.completed) {
          const newProgress = Math.min(q.progress + amount, q.target);
          return {
            ...q,
            progress: newProgress,
            completed: newProgress >= q.target,
          };
        }
        return q;
      })
    );

    // Send to server
    try {
      await fetch('/api/quests/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.id}`,
        },
        body: JSON.stringify({ questType, amount }),
      });
    } catch (err) {
      console.error('Failed to track quest progress:', err);
    }
  }, [user]);

  // Refresh quests
  const refreshQuests = useCallback(async () => {
    await fetchQuests();
  }, [fetchQuests]);

  // Initial fetch
  useEffect(() => {
    if (user) {
      fetchQuests();
    }
  }, [user, fetchQuests]);

  // Check for new day and reset quests
  useEffect(() => {
    const checkDailyReset = () => {
      const now = new Date();
      const questExpiry = dailyQuests[0]?.expiresAt;

      if (questExpiry && new Date(questExpiry) < now) {
        fetchQuests();
      }
    };

    const interval = setInterval(checkDailyReset, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [dailyQuests, fetchQuests]);

  return (
    <QuestsContext.Provider
      value={{
        dailyQuests,
        weeklyChallenge,
        streakData,
        badges,
        unlockedBadges,
        isLoading,
        claimQuestReward,
        useStreakFreeze,
        refreshQuests,
        trackQuestProgress,
      }}
    >
      {children}
    </QuestsContext.Provider>
  );
}

export function useQuests() {
  const context = useContext(QuestsContext);
  if (context === undefined) {
    throw new Error('useQuests must be used within a QuestsProvider');
  }
  return context;
}

```

## File: app\context\ThemeContext.tsx
```typescript
"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { ThemeMode, AccentColor, UIPreferences, DashboardWidget } from "../types";

type Theme = "dark" | "light";

interface ThemeContextType {
    theme: Theme;
    themeMode: ThemeMode;
    accentColor: AccentColor;
    preferences: UIPreferences;
    isDark: boolean;
    toggleTheme: () => void;
    setTheme: (theme: Theme) => void;
    setThemeMode: (mode: ThemeMode) => void;
    setAccentColor: (color: AccentColor) => void;
    updatePreferences: (prefs: Partial<UIPreferences>) => void;
    updateDashboardLayout: (widgets: DashboardWidget[]) => void;
    playSound: (sound: SoundType) => void;
}

type SoundType = 'success' | 'error' | 'notification' | 'levelUp' | 'achievement' | 'click';

const defaultPreferences: UIPreferences = {
    theme: 'dark',
    accentColor: 'emerald',
    soundEffects: true,
    hapticFeedback: true,
    compactMode: false,
    showAnimations: true,
    fontSize: 'medium',
    dashboardLayout: [
        { id: 'standings', type: 'standings', position: 1, size: 'large', visible: true },
        { id: 'upcoming', type: 'upcoming', position: 2, size: 'medium', visible: true },
        { id: 'quests', type: 'quests', position: 3, size: 'small', visible: true },
        { id: 'streak', type: 'streak', position: 4, size: 'small', visible: true },
        { id: 'leaderboard', type: 'leaderboard', position: 5, size: 'medium', visible: true },
        { id: 'friends', type: 'friends', position: 6, size: 'medium', visible: true },
    ],
};

const SOUNDS: Record<SoundType, string> = {
    success: '/sounds/success.mp3',
    error: '/sounds/error.mp3',
    notification: '/sounds/notification.mp3',
    levelUp: '/sounds/level-up.mp3',
    achievement: '/sounds/achievement.mp3',
    click: '/sounds/click.mp3',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<Theme>("dark");
    const [themeMode, setThemeModeState] = useState<ThemeMode>("dark");
    const [accentColor, setAccentColorState] = useState<AccentColor>("emerald");
    const [preferences, setPreferences] = useState<UIPreferences>(defaultPreferences);
    const [mounted, setMounted] = useState(false);
    const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('dark');

    const isDark = themeMode === 'dark' || (themeMode === 'system' && systemTheme === 'dark');

    // Listen for system theme changes
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        // Initialize system theme
        Promise.resolve().then(() => setSystemTheme(mediaQuery.matches ? 'dark' : 'light'));

        const handleChange = (e: MediaQueryListEvent) => {
            setSystemTheme(e.matches ? 'dark' : 'light');
        };

        mediaQuery.addEventListener('change', handleChange);

        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    useEffect(() => {
        Promise.resolve().then(() => setMounted(true));
    }, []);

    useEffect(() => {
        if (!mounted) return;

        const saved = localStorage.getItem("theme") as Theme | null;
        const savedPrefs = localStorage.getItem("ui-preferences");

        if (saved) {
            Promise.resolve().then(() => {
                setThemeState(saved);
                document.documentElement.setAttribute("data-theme", saved);
            });
        }

        if (savedPrefs) {
            try {
                const prefs = JSON.parse(savedPrefs);
                Promise.resolve().then(() => {
                    setPreferences(prefs);
                    setThemeModeState(prefs.theme || 'dark');
                    setAccentColorState(prefs.accentColor || 'emerald');
                });
            } catch (e) {
                // Ignore parse errors
            }
        }
    }, []);

    // Apply accent color as CSS variable
    useEffect(() => {
        if (!mounted) return;

        const root = document.documentElement;
        const colors: Record<AccentColor, string> = {
            emerald: '#10b981',
            blue: '#3b82f6',
            purple: '#8b5cf6',
            rose: '#f43f5e',
            amber: '#f59e0b',
            cyan: '#06b6d4',
        };
        root.style.setProperty('--accent-color', colors[accentColor]);

        // Apply font size
        const fontSizes = { small: '14px', medium: '16px', large: '18px' };
        root.style.setProperty('--base-font-size', fontSizes[preferences.fontSize]);
    }, [mounted, accentColor, preferences.fontSize]);

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
        localStorage.setItem("theme", newTheme);
        document.documentElement.setAttribute("data-theme", newTheme);
    };

    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark");
    };

    const setThemeMode = useCallback((mode: ThemeMode) => {
        setThemeModeState(mode);
        const newPrefs = { ...preferences, theme: mode };
        setPreferences(newPrefs);
        localStorage.setItem("ui-preferences", JSON.stringify(newPrefs));

        // Also update legacy theme
        const actualTheme = mode === 'system' ? systemTheme : mode;
        setTheme(actualTheme as Theme);
    }, [preferences, systemTheme]);

    const setAccentColor = useCallback((color: AccentColor) => {
        setAccentColorState(color);
        const newPrefs = { ...preferences, accentColor: color };
        setPreferences(newPrefs);
        localStorage.setItem("ui-preferences", JSON.stringify(newPrefs));
    }, [preferences]);

    const updatePreferences = useCallback((prefs: Partial<UIPreferences>) => {
        const newPrefs = { ...preferences, ...prefs };
        setPreferences(newPrefs);
        localStorage.setItem("ui-preferences", JSON.stringify(newPrefs));
    }, [preferences]);

    const updateDashboardLayout = useCallback((widgets: DashboardWidget[]) => {
        const newPrefs = { ...preferences, dashboardLayout: widgets };
        setPreferences(newPrefs);
        localStorage.setItem("ui-preferences", JSON.stringify(newPrefs));
    }, [preferences]);

    const playSound = useCallback((sound: SoundType) => {
        if (!preferences.soundEffects) return;

        try {
            const audio = new Audio(SOUNDS[sound]);
            audio.volume = 0.5;
            audio.play().catch(() => {
                // Ignore errors (e.g., user hasn't interacted with page yet)
            });
        } catch (err) {
            // Ignore sound errors
        }
    }, [preferences.soundEffects]);

    // Prevent flash of wrong theme
    if (!mounted) {
        return <>{children}</>;
    }

    return (
        <ThemeContext.Provider value={{
            theme,
            themeMode,
            accentColor,
            preferences,
            isDark,
            toggleTheme,
            setTheme,
            setThemeMode,
            setAccentColor,
            updatePreferences,
            updateDashboardLayout,
            playSound,
        }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}

// Hook for accent color classes
export function useAccentClasses() {
    const { accentColor } = useTheme();

    const classes: Record<AccentColor, {
        bg: string;
        bgHover: string;
        text: string;
        border: string;
        gradient: string;
    }> = {
        emerald: {
            bg: 'bg-emerald-500',
            bgHover: 'hover:bg-emerald-600',
            text: 'text-emerald-500',
            border: 'border-emerald-500',
            gradient: 'from-emerald-500 to-teal-500',
        },
        blue: {
            bg: 'bg-blue-500',
            bgHover: 'hover:bg-blue-600',
            text: 'text-blue-500',
            border: 'border-blue-500',
            gradient: 'from-blue-500 to-cyan-500',
        },
        purple: {
            bg: 'bg-purple-500',
            bgHover: 'hover:bg-purple-600',
            text: 'text-purple-500',
            border: 'border-purple-500',
            gradient: 'from-purple-500 to-pink-500',
        },
        rose: {
            bg: 'bg-rose-500',
            bgHover: 'hover:bg-rose-600',
            text: 'text-rose-500',
            border: 'border-rose-500',
            gradient: 'from-rose-500 to-red-500',
        },
        amber: {
            bg: 'bg-amber-500',
            bgHover: 'hover:bg-amber-600',
            text: 'text-amber-500',
            border: 'border-amber-500',
            gradient: 'from-amber-500 to-orange-500',
        },
        cyan: {
            bg: 'bg-cyan-500',
            bgHover: 'hover:bg-cyan-600',
            text: 'text-cyan-500',
            border: 'border-cyan-500',
            gradient: 'from-cyan-500 to-blue-500',
        },
    };

    return classes[accentColor];
}

```

## File: app\hooks\index.ts
```typescript
// Hooks barrel export
export { useLocalStorage } from './useLocalStorage';
export { usePredictions } from './usePredictions';
export { useSimulationEngine } from './useSimulationEngine';
export { useUndoableAction } from './useUndoableAction';
export { useUserStats } from './useUserStats';
export { useLeagueQuery, useLeagueData, useInvalidateLeague } from './useLeagueQuery';
export { useWebVitals, useNavigationTiming } from './usePerformance';
export { usePushNotifications } from './usePushNotifications';
export { useModal } from './useModal';

```

## File: app\hooks\useAdvancedStats.ts
```typescript
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
```typescript
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
```typescript
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
```typescript
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
```typescript
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
```typescript
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
```typescript
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
```typescript
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
```typescript
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
```typescript
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
```typescript
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
```typescript
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

## File: app\utils\apiValidation.ts
```typescript
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';

// Validation schemas for API routes
export const ScoreSchema = z.string()
    .regex(/^[0-3]-[0-3]$/, 'Geçerli skor formatı: "X-Y" (örn: "3-0")');

export const PredictionSchema = z.object({
    matchId: z.string().min(1),
    score: ScoreSchema,
    leagueId: z.string().min(1),
});

export const LeagueIdSchema = z.enum([
    'vsl',
    '1lig',
    '2lig',
    'cev-cl',
    'cev-cup',
    'cev-challenge',
    'tvf'
]);

/**
 * Validate JSON body with Zod schema
 * @param req - NextRequest
 * @param schema - Zod schema
 * @returns Validated data or error response
 */
export async function validateBody<T>(
    req: NextRequest,
    schema: z.ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; error: string }> {
    try {
        const body = await req.json();
        const validated = schema.parse(body);
        return { success: true, data: validated as T };
    } catch (error) {
        if (error instanceof z.ZodError) {
            const message = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
            return { success: false, error: message };
        }
        return { success: false, error: 'Invalid request body' };
    }
}

/**
 * Create error response
 */
export function errorResponse(message: string, status: number = 400) {
    return NextResponse.json({ error: message }, { status });
}

/**
 * Create success response
 */
export function successResponse<T>(data: T, status: number = 200) {
    return NextResponse.json(data, { status });
}

/**
 * Validate if a score string is a valid volleyball score
 */
export function isValidScore(score: string): boolean {
    const result = ScoreSchema.safeParse(score);
    if (!result.success) return false;

    const [home, away] = score.split('-').map(Number);
    // Valid volleyball scores: one team must have 3, other must have 0-2
    return (home === 3 && away >= 0 && away <= 2) || (away === 3 && home >= 0 && home <= 2);
}

/**
 * Validate score format
 */
export function validateScore(score: unknown): { valid: boolean; error?: string } {
    const result = ScoreSchema.safeParse(score);
    if (!result.success) {
        return { valid: false, error: result.error.errors[0]?.message || 'Invalid score' };
    }
    if (!isValidScore(score as string)) {
        return { valid: false, error: 'Invalid volleyball score (one team must win 3 sets)' };
    }
    return { valid: true };
}

/**
 * Validate match ID format
 */
export function validateMatchId(matchId: unknown): { valid: boolean; error?: string } {
    if (typeof matchId !== 'string' || matchId.length === 0) {
        return { valid: false, error: 'Match ID is required' };
    }
    return { valid: true };
}

```

## File: app\utils\calculatorUtils.ts
```typescript
import { Match, MatchOutcome, TeamStats } from "../types";

export const SCORES = ['3-0', '3-1', '3-2', '2-3', '1-3', '0-3'];

export function getOutcomeFromScore(score: string): MatchOutcome | null {
    const [h, a] = score.split('-').map(Number);
    if (isNaN(h) || isNaN(a)) return null;

    if (h === 3) {
        if (a === 0 || a === 1) return { homeSets: 3, awaySets: a, homePoints: 3, awayPoints: 0, homeWin: true };
        if (a === 2) return { homeSets: 3, awaySets: 2, homePoints: 2, awayPoints: 1, homeWin: true };
    }
    if (a === 3) {
        if (h === 0 || h === 1) return { homeSets: h, awaySets: 3, homePoints: 0, awayPoints: 3, homeWin: false };
        if (h === 2) return { homeSets: 2, awaySets: 3, homePoints: 1, awayPoints: 2, homeWin: false };
    }
    return null;
}

export function sortStandings(teams: TeamStats[]): TeamStats[] {
    return [...teams].sort((a, b) => {
        // 1. Wins (most wins first)
        if (b.wins !== a.wins) return b.wins - a.wins;
        // 2. Points
        if (b.points !== a.points) return b.points - a.points;
        // 3. Set Average (ratio)
        const setAvgB = (b.setsWon === 0 && b.setsLost === 0) ? 0 : (b.setsWon / (b.setsLost || 1));
        const setAvgA = (a.setsWon === 0 && a.setsLost === 0) ? 0 : (a.setsWon / (a.setsLost || 1));
        return setAvgB - setAvgA;
    });
}

export const normalizeTeamName = (name: string) => {
    return name
        .replace(/İ/g, 'I')
        .replace(/ı/g, 'I')
        .replace(/Ş/g, 'S')
        .replace(/ş/g, 'S')
        .replace(/Ğ/g, 'G')
        .replace(/ğ/g, 'G')
        .replace(/Ü/g, 'U')
        .replace(/ü/g, 'U')
        .replace(/Ö/g, 'O')
        .replace(/ö/g, 'O')
        .replace(/Ç/g, 'C')
        .replace(/ç/g, 'C')
        .replace(/i/g, 'I')
        .toUpperCase()
        .replace(/\s+/g, '')
        .replace(/[^A-Z0-9]/g, '')
        .trim();
};

export function calculateLiveStandings(
    initialTeams: TeamStats[],
    matches: Match[],
    overrides: Record<string, string> // matchId -> "3-0"
): TeamStats[] {
    // Deep clone teams to simulate changes, indexed by normalized name
    const teamsMap = new Map<string, TeamStats>();
    initialTeams.forEach(t => {
        const key = normalizeTeamName(t.name);
        teamsMap.set(key, { ...t });
    });

    matches.forEach(m => {
        // Normalize match team names for lookup
        const homeKey = normalizeTeamName(m.homeTeam);
        const awayKey = normalizeTeamName(m.awayTeam);

        // Check for override with both separator formats for compatibility
        const matchId1 = `${m.homeTeam}|||${m.awayTeam}`;
        const matchId2 = `${m.homeTeam}-${m.awayTeam}`;
        const overriddenScore = overrides[matchId1] || overrides[matchId2];

        if (overriddenScore && !m.isPlayed) {
            const outcome = getOutcomeFromScore(overriddenScore);
            if (outcome) {
                const home = teamsMap.get(homeKey);
                const away = teamsMap.get(awayKey);

                if (home && away) {
                    home.played += 1;
                    home.points += outcome.homePoints;
                    home.setsWon += outcome.homeSets;
                    home.setsLost += outcome.awaySets;
                    if (outcome.homeWin) home.wins += 1;

                    away.played += 1;
                    away.points += outcome.awayPoints;
                    away.setsWon += outcome.awaySets;
                    away.setsLost += outcome.homeSets;
                    if (!outcome.homeWin) away.wins += 1;
                }
            }
        }
    });

    return sortStandings(Array.from(teamsMap.values()));
}

```

## File: app\utils\eloCalculator.ts
```typescript
import { Match, TeamStats } from "../types";

export function calculateElo(teams: TeamStats[], matches: Match[]): Map<string, number> {
    const ratings = new Map<string, number>();
    
    // Initialize all teams with 1200
    teams.forEach(t => ratings.set(t.name, 1200));

    // Sort matches by date if possible to ensure chronological order calculation
    // Assuming matches are roughly in order or we want to process played matches
    const playedMatches = matches.filter(m => m.isPlayed && m.resultScore).sort((a, b) => {
        // Simple date sort if available
        if (a.matchDate && b.matchDate) return a.matchDate.localeCompare(b.matchDate);
        return 0;
    });

    playedMatches.forEach(m => {
        const homeName = m.homeTeam;
        const awayName = m.awayTeam;
        
        const homeRating = ratings.get(homeName) || 1200;
        const awayRating = ratings.get(awayName) || 1200;
        
        const [hSets, aSets] = (m.resultScore || '0-0').split('-').map(Number);
        
        // Skip invalid scores
        if (isNaN(hSets) || isNaN(aSets)) return;

        // Determine actual score (1 for win, 0 for loss)
        // Advanced: We could use 0.9 for 3-2 wins etc, but standard Elo is 1/0
        const actualHome = hSets > aSets ? 1 : 0;
        const actualAway = 1 - actualHome;

        // K-Factor - using 32 as standard for many sports
        const K = 32;

        // Expected score
        // Ea = 1 / (1 + 10 ^ ((Rb - Ra) / 400))
        const expectedHome = 1 / (1 + Math.pow(10, (awayRating - homeRating) / 400));
        const expectedAway = 1 / (1 + Math.pow(10, (homeRating - awayRating) / 400));

        // Margin of victory Multiplier (Optional but good for Volleyball 3-0 vs 3-2)
        // Multiplier = ln(abs(PD) + 1) * (2.2 / ((ELOW - ELOL) * 0.001 + 2.2))
        // Simplified multiplier: 
        // 3-0: 1.5x
        // 3-1: 1.25x
        // 3-2: 1.0x
        let multiplier = 1;
        const setDiff = Math.abs(hSets - aSets);
        if (setDiff === 3) multiplier = 1.3; // Dominant win
        else if (setDiff === 2) multiplier = 1.1; // Solid win
        else multiplier = 1.0; // Tie-break win

        // Update ratings
        const newHomeRating = homeRating + K * multiplier * (actualHome - expectedHome);
        const newAwayRating = awayRating + K * multiplier * (actualAway - expectedAway);

        ratings.set(homeName, newHomeRating);
        ratings.set(awayName, newAwayRating);
    });

    return ratings;
}

```

## File: app\utils\gameState.ts
```typescript
"use client";

import { useState, useEffect, useCallback } from 'react';
import {
    GameState,
    Achievement,
    AchievementId,
    Quest,
    QuestId,
    LEVEL_THRESHOLDS,
    LEVEL_TITLES
} from '../types';

// ============================================
// ACHIEVEMENT DEFINITIONS
// ============================================
export const ACHIEVEMENTS: Record<AchievementId, Omit<Achievement, 'unlockedAt'>> = {
    first_prediction: {
        id: 'first_prediction',
        name: 'İlk Adım',
        description: 'İlk tahminini yaptın!',
        icon: '🎯',
        xpReward: 50
    },
    streak_3: {
        id: 'streak_3',
        name: '3\'lü Seri',
        description: '3 maç üst üste doğru tahmin',
        icon: '🔥',
        xpReward: 100
    },
    streak_5: {
        id: 'streak_5',
        name: '5\'li Seri',
        description: '5 maç üst üste doğru tahmin',
        icon: '💥',
        xpReward: 200
    },
    champion_predictor: {
        id: 'champion_predictor',
        name: 'Şampiyon Tahmincisi',
        description: 'Sezon şampiyonunu doğru tahmin ettin',
        icon: '🏆',
        xpReward: 500
    },
    perfect_week: {
        id: 'perfect_week',
        name: 'Mükemmel Hafta',
        description: 'Bir haftada 5/5 doğru tahmin',
        icon: '💯',
        xpReward: 300
    },
    underdog_hero: {
        id: 'underdog_hero',
        name: 'Underdog Kahramanı',
        description: 'Sürpriz bir sonucu doğru tahmin ettin',
        icon: '🦸',
        xpReward: 150
    },
    game_addict: {
        id: 'game_addict',
        name: 'Oyun Bağımlısı',
        description: '50+ tahmin yaptın',
        icon: '🎮',
        xpReward: 250
    },
    loyal_fan: {
        id: 'loyal_fan',
        name: 'Sadık Taraftar',
        description: 'Favori takım seçtin ve 10 maçını tahmin ettin',
        icon: '❤️',
        xpReward: 150
    }
};

// ============================================
// INITIAL STATE
// ============================================
const getInitialGameState = (): GameState => ({
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
        predictedChampions: []
    },
    soundEnabled: true,
    lastActiveDate: new Date().toISOString().split('T')[0]
});

// ============================================
// HELPER FUNCTIONS
// ============================================
export function calculateLevel(xp: number): number {
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
        if (xp >= LEVEL_THRESHOLDS[i]) {
            return i + 1;
        }
    }
    return 1;
}

export function getXPForNextLevel(level: number): number {
    if (level >= LEVEL_THRESHOLDS.length) {
        return LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1] + 3000 * (level - LEVEL_THRESHOLDS.length + 1);
    }
    return LEVEL_THRESHOLDS[level] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
}

export function getLevelTitle(level: number): string {
    const titles = Object.entries(LEVEL_TITLES)
        .map(([lvl, title]) => ({ level: parseInt(lvl), title }))
        .sort((a, b) => b.level - a.level);

    for (const { level: reqLevel, title } of titles) {
        if (level >= reqLevel) return title;
    }
    return 'Çaylak';
}

// ============================================
// GAME STATE HOOK
// ============================================
const STORAGE_KEY = 'volleySimGameState';

export function useGameState() {
    const [gameState, setGameState] = useState<GameState>(getInitialGameState);
    const [isLoaded, setIsLoaded] = useState(false);
    const [showLevelUp, setShowLevelUp] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        const loadState = () => {
            try {
                const saved = localStorage.getItem(STORAGE_KEY);
                if (saved) {
                    const parsed = JSON.parse(saved);
                    setGameState(prev => ({ ...prev, ...parsed }));
                }
            } catch (e) {
                console.error('Failed to load game state:', e);
            }
            setIsLoaded(true);
        };

        Promise.resolve().then(loadState);
    }, []);

    // Save to localStorage on change
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
        }
    }, [gameState, isLoaded]);

    // Add XP
    const addXP = useCallback((amount: number) => {
        setGameState(prev => {
            const newXP = prev.xp + amount;
            const newLevel = calculateLevel(newXP);
            if (newLevel > prev.level) {
                setShowLevelUp(true);
            }
            return {
                ...prev,
                xp: newXP,
                level: newLevel
            };
        });
    }, []);

    // Record prediction
    const recordPrediction = useCallback((isCorrect: boolean) => {
        setGameState(prev => {
            const newStats = { ...prev.stats };
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

            return { ...prev, stats: newStats };
        });
    }, []);

    // Unlock achievement
    const unlockAchievement = useCallback((id: AchievementId): boolean => {
        let wasUnlocked = false;

        setGameState(prev => {
            // Check if already unlocked
            if (prev.achievements.some(a => a.id === id)) {
                return prev;
            }

            const achievementDef = ACHIEVEMENTS[id];
            if (!achievementDef) return prev;

            const newAchievement: Achievement = {
                ...achievementDef,
                unlockedAt: new Date().toISOString()
            };

            wasUnlocked = true;
            const newXP = prev.xp + achievementDef.xpReward;

            return {
                ...prev,
                xp: newXP,
                level: calculateLevel(newXP),
                achievements: [...prev.achievements, newAchievement]
            };
        });

        return wasUnlocked;
    }, []);

    // Set favorite team
    const setFavoriteTeam = useCallback((teamName: string | null) => {
        setGameState(prev => ({ ...prev, favoriteTeam: teamName }));
    }, []);

    // Toggle sound
    const toggleSound = useCallback(() => {
        setGameState(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }));
    }, []);

    // Check if achievement is unlocked
    const hasAchievement = useCallback((id: AchievementId): boolean => {
        return gameState.achievements.some(a => a.id === id);
    }, [gameState.achievements]);

    return {
        gameState,
        isLoaded,
        showLevelUp,
        clearLevelUp: () => setShowLevelUp(false),
        addXP,
        recordPrediction,
        unlockAchievement,
        setFavoriteTeam,
        toggleSound,
        hasAchievement,
        getLevelTitle: () => getLevelTitle(gameState.level),
        getXPProgress: () => {
            const currentLevelXP = LEVEL_THRESHOLDS[gameState.level - 1] || 0;
            const nextLevelXP = getXPForNextLevel(gameState.level);
            const progress = gameState.xp - currentLevelXP;
            const required = nextLevelXP - currentLevelXP;
            return { progress, required, percentage: (progress / required) * 100 };
        }
    };
}

```

## File: app\utils\index.ts
```typescript
// Utility functions barrel export
export * from './apiValidation';
export * from './rateLimit';
export * from './validation';
export * from './performance';

// Re-export commonly used utilities
export { calculateLiveStandings, normalizeTeamName } from './calculatorUtils';
export { createClient } from './supabase';
export { generateTeamSlug, getTeamNameFromSlug, registerTeamSlug, isSlugRegistered } from './teamSlug';

```

## File: app\utils\performance.ts
```typescript
/**
 * Performance utilities for throttling, debouncing, and optimization
 */

type AnyFunction = (...args: never[]) => void;

/**
 * Throttle function execution to at most once per wait period
 */
export function throttle<T extends AnyFunction>(
    func: T,
    wait: number
): T & { cancel: () => void } {
    let timeout: NodeJS.Timeout | null = null;
    let lastArgs: Parameters<T> | null = null;
    let lastCallTime = 0;

    const throttled = function (this: unknown, ...args: Parameters<T>) {
        const now = Date.now();
        const remaining = wait - (now - lastCallTime);

        if (remaining <= 0 || remaining > wait) {
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }
            lastCallTime = now;
            func.apply(this, args);
        } else {
            lastArgs = args;
            if (!timeout) {
                timeout = setTimeout(() => {
                    lastCallTime = Date.now();
                    timeout = null;
                    if (lastArgs) {
                        func.apply(this, lastArgs);
                        lastArgs = null;
                    }
                }, remaining);
            }
        }
    } as T & { cancel: () => void };

    throttled.cancel = () => {
        if (timeout) {
            clearTimeout(timeout);
            timeout = null;
        }
        lastArgs = null;
    };

    return throttled;
}

/**
 * Debounce function execution until after wait period has elapsed since last call
 */
export function debounce<T extends AnyFunction>(
    func: T,
    wait: number,
    options: { leading?: boolean } = {}
): T & { cancel: () => void } {
    let timeout: NodeJS.Timeout | null = null;
    let lastArgs: Parameters<T> | null = null;

    const debounced = function (this: unknown, ...args: Parameters<T>) {
        lastArgs = args;

        if (options.leading && !timeout) {
            func.apply(this, args);
        }

        if (timeout) {
            clearTimeout(timeout);
        }

        timeout = setTimeout(() => {
            timeout = null;
            if (!options.leading && lastArgs) {
                func.apply(this, lastArgs);
            }
            lastArgs = null;
        }, wait);
    } as T & { cancel: () => void };

    debounced.cancel = () => {
        if (timeout) {
            clearTimeout(timeout);
            timeout = null;
        }
        lastArgs = null;
    };

    return debounced;
}

/**
 * Request animation frame based throttle for scroll/resize handlers
 */
export function rafThrottle<T extends AnyFunction>(
    func: T
): T & { cancel: () => void } {
    let rafId: number | null = null;
    let lastArgs: Parameters<T> | null = null;

    const throttled = function (this: unknown, ...args: Parameters<T>) {
        lastArgs = args;

        if (rafId === null) {
            rafId = requestAnimationFrame(() => {
                rafId = null;
                if (lastArgs) {
                    func.apply(this, lastArgs);
                }
            });
        }
    } as T & { cancel: () => void };

    throttled.cancel = () => {
        if (rafId !== null) {
            cancelAnimationFrame(rafId);
            rafId = null;
        }
        lastArgs = null;
    };

    return throttled;
}

type AnyReturnFunction = (...args: never[]) => unknown;

/**
 * Memoize function results based on arguments
 */
export function memoize<T extends AnyReturnFunction>(
    func: T,
    keyResolver?: (...args: Parameters<T>) => string
): T {
    const cache = new Map<string, unknown>();

    return function (this: unknown, ...args: Parameters<T>) {
        const key = keyResolver ? keyResolver(...args) : JSON.stringify(args);

        if (cache.has(key)) {
            return cache.get(key) as ReturnType<T>;
        }

        const result = func.apply(this, args) as ReturnType<T>;
        cache.set(key, result);
        return result;
    } as T;
}

```

## File: app\utils\playoffUtils.ts
```typescript
import { Match, TeamStats, MatchOverride } from "../types";
import { normalizeTeamName } from "./calculatorUtils";
import { calculateElo } from "./eloCalculator";

export interface PlayoffTeam extends TeamStats {
    elo: number;
    sourceGroup: string;
    position: string;
    initialSeed?: number; // 0-3 for 1st-4th
    scenarioWins?: number;
    scenarioLosses?: number;
    scenarioPlayed?: number;
    scenarioPoints?: number;
    scenarioSetsWon?: number;
    scenarioSetsLost?: number;
}

export interface PlayoffGroup {
    groupName: string;
    teams: PlayoffTeam[];
}

export const SCORES = ['3-0', '3-1', '3-2', '2-3', '1-3', '0-3'];

export interface PlayoffMatch {
    id: string; // e.g., "quarter-A-Team1-Team2"
    homeTeam: string;
    awayTeam: string;
    date: string;
    stage: 'quarter' | 'semi' | 'final';
}

export interface GroupStanding {
    groupName: string;
    first: TeamStats | null;
    second: TeamStats | null;
    teams: TeamStats[]; // Full sorted list for flexible selection (e.g. 1. Lig needs Top 4)
}

// Calculate regular season standings to find 1st and 2nd of each group
export function calculateGroupStandings(teams: TeamStats[]): GroupStanding[] {
    const groups: Record<string, TeamStats[]> = {};
    teams.forEach(t => {
        const gName = t.groupName || "Unknown";
        if (!groups[gName]) groups[gName] = [];
        groups[gName].push(t);
    });

    const standings: GroupStanding[] = [];
    Object.keys(groups).sort().forEach(gName => {
        const sorted = groups[gName].sort((a, b) => b.points - a.points); // Simply points for now
        standings.push({
            groupName: gName,
            first: sorted[0] || null,
            second: sorted[1] || null,
            teams: sorted
        });
    });
    return standings;
}

// Generate Quarter Final Groups (A-H)
export function generateQuarterGroups(standings: GroupStanding[], fixture: Match[]): PlayoffGroup[] {
    const allTeams = standings.flatMap(s => [s.first, s.second].filter(Boolean)) as TeamStats[];
    // Calculate Elo for seeding
    const eloMap = calculateElo(allTeams, fixture);
    const ratings = Object.fromEntries(eloMap);


    const playoffGroupDefs = [
        { name: "A", teamDefs: [{ group: 1, position: 1 }, { group: 16, position: 1 }, { group: 8, position: 2 }, { group: 9, position: 2 }] },
        { name: "B", teamDefs: [{ group: 2, position: 1 }, { group: 15, position: 1 }, { group: 7, position: 2 }, { group: 10, position: 2 }] },
        { name: "C", teamDefs: [{ group: 3, position: 1 }, { group: 14, position: 1 }, { group: 6, position: 2 }, { group: 11, position: 2 }] },
        { name: "D", teamDefs: [{ group: 4, position: 1 }, { group: 13, position: 1 }, { group: 5, position: 2 }, { group: 12, position: 2 }] },
        { name: "E", teamDefs: [{ group: 5, position: 1 }, { group: 12, position: 1 }, { group: 4, position: 2 }, { group: 13, position: 2 }] },
        { name: "F", teamDefs: [{ group: 6, position: 1 }, { group: 11, position: 1 }, { group: 3, position: 2 }, { group: 14, position: 2 }] },
        { name: "G", teamDefs: [{ group: 7, position: 1 }, { group: 10, position: 1 }, { group: 2, position: 2 }, { group: 15, position: 2 }] },
        { name: "H", teamDefs: [{ group: 8, position: 1 }, { group: 9, position: 1 }, { group: 1, position: 2 }, { group: 16, position: 2 }] },
    ];

    const getTeam = (def: { group: number; position: number }): PlayoffTeam | null => {
        const grp = standings.find(s => parseInt(s.groupName.match(/\d+/)?.[0] || "0") === def.group);
        const team = def.position === 1 ? grp?.first : grp?.second;
        if (!team) return null;
        return {
            ...team,
            elo: ratings[team.name] || 1200,
            sourceGroup: `${def.group}. GR`,
            position: `${def.position}.`
        };
    };

    return playoffGroupDefs.map(pg => {
        const teams = pg.teamDefs.map(getTeam).filter(Boolean) as PlayoffTeam[];
        // Assign initial seeds based on the definition order (assuming definitions are ordered 1-4seeds)
        // Actually, teamDefs is just an array. We need to set initialSeed 0..3
        teams.forEach((t, i) => { if (t) t.initialSeed = i; });
        return { groupName: pg.name, teams };
    });
}

// Generate Semi Final Groups (A-D)
export function generateSemiGroups(quarterGroups: PlayoffGroup[]): PlayoffGroup[] {
    const semiDefs = [
        { name: "A", sources: [{ grp: "A", pos: 1 }, { grp: "E", pos: 1 }, { grp: "D", pos: 2 }, { grp: "H", pos: 2 }] },
        { name: "B", sources: [{ grp: "B", pos: 1 }, { grp: "F", pos: 1 }, { grp: "C", pos: 2 }, { grp: "G", pos: 2 }] },
        { name: "C", sources: [{ grp: "C", pos: 1 }, { grp: "G", pos: 1 }, { grp: "B", pos: 2 }, { grp: "F", pos: 2 }] },
        { name: "D", sources: [{ grp: "D", pos: 1 }, { grp: "H", pos: 1 }, { grp: "A", pos: 2 }, { grp: "E", pos: 2 }] },
    ];

    const getTeam = (grpName: string, position: number): PlayoffTeam | null => {
        const qGroup = quarterGroups.find(g => g.groupName === grpName);
        if (!qGroup) return null;
        // IMPORTANT: The caller is responsible for ensuring quarterGroups are sorted by standings!
        const team = qGroup.teams[position - 1];
        if (!team) return null;
        return { ...team, sourceGroup: `ÇF ${grpName}`, position: `${position}.` };
    };

    return semiDefs.map(sd => {
        const teams = sd.sources.map(s => getTeam(s.grp, s.pos)).filter(Boolean) as PlayoffTeam[];
        // Sort removed: Respect definition order for fixture generation
        return { groupName: sd.name, teams };
    });
}

// Generate Final Groups (1-2)
export function generateFinalGroups(semiGroups: PlayoffGroup[]): PlayoffGroup[] {
    const finalDefs = [
        { name: "1", sources: [{ grp: "A", pos: 1 }, { grp: "C", pos: 1 }, { grp: "B", pos: 2 }, { grp: "D", pos: 2 }] },
        { name: "2", sources: [{ grp: "B", pos: 1 }, { grp: "D", pos: 1 }, { grp: "A", pos: 2 }, { grp: "C", pos: 2 }] },
    ];

    const getTeam = (grpName: string, position: number): PlayoffTeam | null => {
        const sGroup = semiGroups.find(g => g.groupName === grpName);
        if (!sGroup) return null;
        const team = sGroup.teams[position - 1];
        if (!team) return null;
        return { ...team, sourceGroup: `YF ${grpName}`, position: `${position}.` };
    };

    return finalDefs.map(fd => {
        const teams = fd.sources.map(s => getTeam(s.grp, s.pos)).filter(Boolean) as PlayoffTeam[];
        // Sort removed: Respect definition order for fixture generation
        return { groupName: fd.name, teams };
    });
}

// ----------------------------------------------------------------------
// 1. LIG SPECIAL LOGIC
// ----------------------------------------------------------------------

// 1. Lig Semi-Finals (I. Group, II. Group)
// I. GRUP: A1, B4, A3, B2
// II. GRUP: B1, A4, B3, A2
export function generate1LigSemiGroups(standings: GroupStanding[]): PlayoffGroup[] {
    const getTeam = (groupName: string, pos: number): PlayoffTeam | null => {
        const grp = standings.find(s => s.groupName === groupName);
        if (!grp || !grp.teams || !grp.teams[pos - 1]) return null;
        const team = grp.teams[pos - 1];
        return { ...team, elo: 1200 + team.points, sourceGroup: `${groupName.charAt(0)}.${pos}`, position: `${pos}.` };
    };

    const semiDefs = [
        { name: "I", sources: [{ grp: "A. Grup", pos: 1 }, { grp: "B. Grup", pos: 4 }, { grp: "A. Grup", pos: 3 }, { grp: "B. Grup", pos: 2 }] },
        { name: "II", sources: [{ grp: "B. Grup", pos: 1 }, { grp: "A. Grup", pos: 4 }, { grp: "B. Grup", pos: 3 }, { grp: "A. Grup", pos: 2 }] },
    ];

    return semiDefs.map(sd => {
        const teams = sd.sources.map(s => getTeam(s.grp, s.pos)).filter(Boolean) as PlayoffTeam[];
        return { groupName: sd.name, teams };
    });
}

// 1. Lig Final (One Group of 4)
// Sources: I. Group 1st, I. Group 2nd, II. Group 1st, II. Group 2nd
export function generate1LigFinalGroups(semiGroups: PlayoffGroup[]): PlayoffGroup[] {
    const getTeam = (grpName: string, position: number): PlayoffTeam | null => {
        const sGroup = semiGroups.find(g => g.groupName === grpName);
        if (!sGroup || !sGroup.teams[position - 1]) return null;
        const team = sGroup.teams[position - 1];
        return { ...team, sourceGroup: `${grpName}. Grup`, position: `${position}.` };
    };

    const finalSources = [
        { grp: "I", pos: 1 },
        { grp: "I", pos: 2 },
        { grp: "II", pos: 1 },
        { grp: "II", pos: 2 }
    ];

    const teams = finalSources.map(s => getTeam(s.grp, s.pos)).filter(Boolean) as PlayoffTeam[];
    return [{ groupName: "Final", teams }];
}

export function generateGroupFixture(groups: PlayoffGroup[], stage: 'quarter' | 'semi' | 'final'): PlayoffMatch[] {
    const matches: PlayoffMatch[] = [];

    groups.forEach(group => {
        // Use initialSeed if available to find the "original" 1st, 2nd, 3rd, 4th team of the group
        // If not available (old data?), fall back to current index, but that's risky if sorted.
        // We will sort by initialSeed to be safe.
        const sorted = [...group.teams].sort((a, b) => (a.initialSeed ?? 0) - (b.initialSeed ?? 0));

        // Ensure we have 4 teams for standard fixture
        // If < 4, we might skip matches. 
        if (sorted.length !== 4) return;

        const [t1, t2, t3, t4] = sorted;

        // Custom seeding/pairing logic 1-4, 2-3
        // Day 1
        matches.push({ id: `${stage}-${group.groupName}-${t1.name}-${t4.name}`, homeTeam: t1.name, awayTeam: t4.name, date: 'G�n 1', stage });
        matches.push({ id: `${stage}-${group.groupName}-${t2.name}-${t3.name}`, homeTeam: t2.name, awayTeam: t3.name, date: 'G�n 1', stage });
        // Day 2
        matches.push({ id: `${stage}-${group.groupName}-${t4.name}-${t2.name}`, homeTeam: t4.name, awayTeam: t2.name, date: 'G�n 2', stage });
        matches.push({ id: `${stage}-${group.groupName}-${t3.name}-${t1.name}`, homeTeam: t3.name, awayTeam: t1.name, date: 'G�n 2', stage });
        // Day 3
        matches.push({ id: `${stage}-${group.groupName}-${t3.name}-${t4.name}`, homeTeam: t3.name, awayTeam: t4.name, date: 'G�n 3', stage });
        matches.push({ id: `${stage}-${group.groupName}-${t1.name}-${t2.name}`, homeTeam: t1.name, awayTeam: t2.name, date: 'G�n 3', stage });
    });

    return matches;
}

// Apply Overrides and Calculate Standings for Playoff Groups
export function applyOverridesToGroups(
    groups: PlayoffGroup[],
    overrides: Record<string, string>,
    stage: string
): PlayoffGroup[] {
    // Generate authoritative fixture to validate overrides
    const validMatches = generateGroupFixture(groups, stage as 'quarter' | 'semi' | 'final');
    const validMatchIds = new Set(validMatches.map(m => m.id));

    return groups.map(group => {
        const teamPoints: Record<string, { wins: number; lost: number; points: number; setsWon: number; setsLost: number; played: number }> = {};

        group.teams.forEach(t => {
            teamPoints[normalizeTeamName(t.name)] = { wins: 0, lost: 0, points: 0, setsWon: 0, setsLost: 0, played: 0 };
        });

        // Loop through all overrides to find matches for this group
        Object.entries(overrides).forEach(([matchId, score]) => {
            // Strict Validation: Ignore any override not in the current valid fixture
            if (!validMatchIds.has(matchId)) return;

            if (!matchId.startsWith(`${stage}-${group.groupName}-`)) return;

            const parts = matchId.split('-');
            const homeTeam = parts[2];
            const awayTeam = parts[3];

            // Normalize names for lookup
            const hKey = normalizeTeamName(homeTeam);
            const aKey = normalizeTeamName(awayTeam);

            if (!teamPoints[hKey] || !teamPoints[aKey]) return;

            const [hSets, aSets] = score.split('-').map(Number);
            const homeWin = hSets > aSets;

            teamPoints[hKey].setsWon += hSets;
            teamPoints[hKey].setsLost += aSets;
            teamPoints[hKey].played += 1;

            teamPoints[aKey].setsWon += aSets;
            teamPoints[aKey].setsLost += hSets;
            teamPoints[aKey].played += 1;

            if (homeWin) {
                teamPoints[hKey].wins++;
                teamPoints[aKey].lost++;
                teamPoints[hKey].points += hSets === 3 && aSets <= 1 ? 3 : 2;
                if (aSets === 2) teamPoints[aKey].points += 1;
            } else {
                teamPoints[aKey].wins++;
                teamPoints[hKey].lost++;
                teamPoints[aKey].points += aSets === 3 && hSets <= 1 ? 3 : 2;
                if (hSets === 2) teamPoints[hKey].points += 1;
            }
        });

        // Update team stats from calculated points
        const updatedTeams = group.teams.map(t => {
            const tKey = normalizeTeamName(t.name);
            return {
                ...t,
                scenarioWins: teamPoints[tKey]?.wins || 0,
                scenarioLosses: teamPoints[tKey]?.lost || 0,
                scenarioPlayed: teamPoints[tKey]?.played || 0,
                scenarioPoints: teamPoints[tKey]?.points || 0,
                scenarioSetsWon: teamPoints[tKey]?.setsWon || 0,
                scenarioSetsLost: teamPoints[tKey]?.setsLost || 0,
            };
        });

        updatedTeams.sort((a, b) => {
            // 1. Total Wins (Galibiyet Say�s�)
            if ((b.scenarioWins || 0) !== (a.scenarioWins || 0)) return (b.scenarioWins || 0) - (a.scenarioWins || 0);

            // 2. Total Points (Puan)
            if ((b.scenarioPoints || 0) !== (a.scenarioPoints || 0)) return (b.scenarioPoints || 0) - (a.scenarioPoints || 0);

            // 3. Set Ratio (Set Averaj�)
            // Calculate ratios - handle 0 division safely
            const getRatio = (won: number, lost: number) => {
                if (lost === 0 && won === 0) return 0; // No games played -> 0 ratio
                if (lost === 0) return 10000; // Infinite ratio (played but never lost set)
                return won / lost;
            };

            const ratioA = getRatio(a.scenarioSetsWon || 0, a.scenarioSetsLost || 0);
            const ratioB = getRatio(b.scenarioSetsWon || 0, b.scenarioSetsLost || 0);

            if (Math.abs(ratioB - ratioA) > 0.0001) return ratioB - ratioA;

            // Fallback to Elo if everything else is tied (Initial state or perfect tie)
            return (b.elo || 0) - (a.elo || 0);
        });

        return { ...group, teams: updatedTeams };
    });
}
// Apply Overrides and Calculate Standings for a linear list of Teams (e.g. Regular Season Group)
export function applyOverridesToTeams(
    teams: TeamStats[],
    overrides: MatchOverride[]
): TeamStats[] {
    // If overrides is empty, return teams as is
    if (!overrides || !Array.isArray(overrides) || overrides.length === 0) {
        return teams;
    }

    const teamPoints: Record<string, { wins: number; lost: number; points: number; setsWon: number; setsLost: number; played: number }> = {};

    // Initialize with existing stats
    teams.forEach(t => {
        teamPoints[t.name] = {
            wins: t.wins,
            lost: t.played - t.wins,
            points: t.points,
            setsWon: t.setsWon,
            setsLost: t.setsLost,
            played: t.played
        };
    });

    // Apply Overrides
    // Expecting overrides to be an array of objects like { home: string, away: string, homeScore: number, awayScore: number }
    // Or simpler if coming from localStorage

    // Assuming the user wants to add 'extra' matches or simulate unplayed matches.
    // However, the `scenarios` from `localStorage` in `GroupPage` are stored as a list of modified Match objects.

    overrides.forEach((match: MatchOverride) => {
        // We only care if the match has a score
        if (!match.homeScore && match.homeScore !== 0) return;

        const homeTeam = match.homeTeam;
        const awayTeam = match.awayTeam;
        const hSets = Number(match.homeScore);
        const aSets = Number(match.awayScore);

        if (!teamPoints[homeTeam] || !teamPoints[awayTeam]) return;

        // Check if this match was already "played" in real life?
        // For simplicity in this "Scenario Page", we might be double counting if we are not careful.
        // But the prompt said "Oyundan gelen puan durumu". usually means "Standings derived from the game inputs".
        // Use case: The user enters predictions for *future* matches.
        // So we should strictly ADD these to the current stats.

        const homeWin = hSets > aSets;

        teamPoints[homeTeam].setsWon += hSets;
        teamPoints[homeTeam].setsLost += aSets;
        teamPoints[homeTeam].played += 1;

        teamPoints[awayTeam].setsWon += aSets;
        teamPoints[awayTeam].setsLost += hSets;
        teamPoints[awayTeam].played += 1;

        if (homeWin) {
            teamPoints[homeTeam].wins++;
            teamPoints[awayTeam].lost++;
            teamPoints[homeTeam].points += hSets === 3 && aSets <= 1 ? 3 : 2;
            if (aSets === 2) teamPoints[awayTeam].points += 1;
        } else {
            teamPoints[awayTeam].wins++;
            teamPoints[homeTeam].lost++;
            teamPoints[awayTeam].points += aSets === 3 && hSets <= 1 ? 3 : 2;
            if (hSets === 2) teamPoints[homeTeam].points += 1;
        }
    });

    return teams.map(t => ({
        ...t,
        wins: teamPoints[t.name]?.wins || t.wins,
        // losses isn't on TeamStats directly, logic handles it via played - wins
        points: teamPoints[t.name]?.points || t.points,
        setsWon: teamPoints[t.name]?.setsWon || t.setsWon,
        setsLost: teamPoints[t.name]?.setsLost || t.setsLost,
        played: teamPoints[t.name]?.played || t.played,
    }));
}

```

## File: app\utils\rateLimit.ts
```typescript
import { NextRequest, NextResponse } from 'next/server';

interface RateLimitConfig {
    requests: number;
    windowMs: number; // in milliseconds
}

const rateLimits = new Map<string, { count: number; resetTime: number }>();

/**
 * Simple in-memory rate limiter
 * For production, use external service like Upstash Redis
 */
export function createRateLimiter(config: RateLimitConfig) {
    return function rateLimit(req: NextRequest): NextResponse | null {
        const identifier = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'anonymous';
        const key = `${identifier}:${req.nextUrl.pathname}`;
        const now = Date.now();

        const limit = rateLimits.get(key);

        if (!limit || now > limit.resetTime) {
            // New window or expired
            rateLimits.set(key, {
                count: 1,
                resetTime: now + config.windowMs
            });
            return null; // Allow
        }

        if (limit.count >= config.requests) {
            return NextResponse.json(
                { error: 'Çok fazla istek. Lütfen daha sonra tekrar deneyin.' },
                {
                    status: 429,
                    headers: {
                        'Retry-After': String(Math.ceil((limit.resetTime - now) / 1000))
                    }
                }
            );
        }

        limit.count++;
        return null; // Allow
    };
}

/**
 * API route rate limiting middleware
 * Usage in API routes:
 * 
 * const rateLimiter = createRateLimiter({ requests: 10, windowMs: 60000 });
 * 
 * export async function POST(req) {
 *     const limitResponse = rateLimiter(req);
 *     if (limitResponse) return limitResponse;
 *     
 *     // ... rest of handler
 * }
 */

// Auto-cleanup interval reference
let cleanupInterval: NodeJS.Timeout | null = null;

/**
 * Cleanup old entries periodically
 * Automatically starts on first rateLimiter use
 */
export function startRateLimitCleanup(intervalMs = 60000) {
    // Prevent multiple intervals
    if (cleanupInterval) return;

    cleanupInterval = setInterval(() => {
        const now = Date.now();
        for (const [key, limit] of rateLimits.entries()) {
            if (now > limit.resetTime) {
                rateLimits.delete(key);
            }
        }
    }, intervalMs);

    // Don't block Node.js from exiting
    if (cleanupInterval.unref) {
        cleanupInterval.unref();
    }
}

// Auto-start cleanup when module is loaded
// Auto-start cleanup when module is loaded
if (typeof window === 'undefined') {
    startRateLimitCleanup();
}

// Export a direct check function for use in middleware
export async function checkRateLimit(identifier: string, limit: number, windowMs: number): Promise<{ success: boolean; retryAfter?: number }> {
    const key = `${identifier}`;
    const now = Date.now();
    const entry = rateLimits.get(key);

    if (!entry || now > entry.resetTime) {
        rateLimits.set(key, {
            count: 1,
            resetTime: now + windowMs
        });
        return { success: true };
    }

    if (entry.count >= limit) {
        return {
            success: false,
            retryAfter: Math.ceil((entry.resetTime - now) / 1000)
        };
    }

    entry.count++;
    return { success: true };
}


```

## File: app\utils\scenarioUtils.ts
```typescript
import { TeamStats } from "../types";

export interface TeamDiff {
    name: string;
    rankDiff: number;   // e.g. +2 (rose 2 spots), -1 (fell 1 spot)
    pointDiff: number;  // e.g. +3 points
    winDiff: number;
}

export function compareStandings(baseStandings: TeamStats[], targetStandings: TeamStats[]): TeamDiff[] {
    const baseMap = new Map<string, { rank: number, stats: TeamStats }>();
    baseStandings.forEach((t, i) => baseMap.set(t.name, { rank: i + 1, stats: t }));

    const diffs: TeamDiff[] = [];

    targetStandings.forEach((t, i) => {
        const currentRank = i + 1;
        const base = baseMap.get(t.name);

        if (base) {
            // Rank Diff: oldRank - newRank. 
            // If old was 5 and new is 3, diff is 5-3 = 2 (Positive means improvement)
            const rankDiff = base.rank - currentRank;
            const pointDiff = t.points - base.stats.points;
            const winDiff = t.wins - base.stats.wins;

            diffs.push({
                name: t.name,
                rankDiff,
                pointDiff,
                winDiff
            });
        }
    });

    return diffs;
}

```

## File: app\utils\serverData.ts
```typescript
import fs from 'fs';
import path from 'path';
import { TeamStats, Match } from '../types';
import { createServiceRoleClient } from './supabase-server';
import { getOutcomeFromScore, sortStandings } from './calculatorUtils';

export interface LeagueData {
    teams: TeamStats[];
    fixture: Match[];
}

export async function getLeagueData(league: string): Promise<LeagueData> {
    try {
        const filePath = path.join(process.cwd(), 'data', `${league}-data.json`);
        if (!fs.existsSync(filePath)) {
            console.error(`Data file not found: ${filePath}`);
            return { teams: [], fixture: [] };
        }

        const content = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(content);

        // Filter out withdrawn teams (ligden çekilen takımlar)
        // Filter out withdrawn teams (ligden çekilen takımlar)
        if (league === '1lig') {
            const withdrawnTeams = ['Edremit Bld. Altınoluk', 'İzmirspor'];
            if (data.teams) {
                data.teams = data.teams.filter((t: TeamStats) => !withdrawnTeams.includes(t.name));
            }
            const filterMatches = (matches: Match[]) => matches.filter((m: Match) =>
                !withdrawnTeams.includes(m.homeTeam) && !withdrawnTeams.includes(m.awayTeam)
            );
            if (data.fixture) data.fixture = filterMatches(data.fixture);
            if (data.matches) data.matches = filterMatches(data.matches);
        }

        // Rename CEV CL teams
        if (league === 'cev-cl') {
            const teamNameMapping: Record<string, string> = {
                'VakifBank ISTANBUL': 'VAKIFBANK',
                'Fenerbahçe Medicana ISTANBUL': 'FENERBAHÇE MEDICANA',
                'Eczacibasi ISTANBUL': 'ECZACIBAŞI DYNAVİT',
                'ANKARA Zeren Spor Kulübü': 'ZEREN SPOR'
            };

            const renameTeam = (name: string) => teamNameMapping[name] || name;

            if (data.teams) {
                data.teams = data.teams.map((t: TeamStats) => ({
                    ...t,
                    name: renameTeam(t.name)
                }));
            }

            const renameMatches = (matches: Match[]) => matches.map((m: Match) => ({
                ...m,
                homeTeam: renameTeam(m.homeTeam),
                awayTeam: renameTeam(m.awayTeam)
            }));

            if (data.fixture) data.fixture = renameMatches(data.fixture);
            if (data.matches) data.matches = renameMatches(data.matches);
        }

        // Normalize fixture data
        let fixture = (data.fixture || data.matches || []).map((m: Match & { date?: string }) => ({
            ...m,
            matchDate: m.matchDate || m.date
        }));

        // 2. Fetch database overrides (Admin verified results)
        try {
            const supabase = createServiceRoleClient();

            // Map league names to match how they are stored in DB (Sultanlar Ligi vs vsl)
            const leagueDbMap: Record<string, string> = {
                'vsl': 'Sultanlar Ligi',
                '1lig': '1. Lig',
                '2lig': '2. Lig',
                'cev-cl': 'Şampiyonlar Ligi'
            };

            const dbLeagueName = leagueDbMap[league] || league;

            const { data: dbResults } = await supabase
                .from('match_results')
                .select('*')
                .eq('league', dbLeagueName)
                .eq('is_verified', true);

            if (dbResults && dbResults.length > 0) {
                // console.log(`[getLeagueData] Found ${dbResults.length} database overrides for ${league}`);

                // Create a map for easy lookup
                const overridesMap = new Map();
                // We use homeTeam-awayTeam or other consistent key
                dbResults.forEach(res => {
                    const key = `${res.home_team}-${res.away_team}`;
                    overridesMap.set(key, res.result_score);
                });

                // Apply overrides to fixture
                let statsChanged = false;
                fixture = fixture.map((m: Match) => {
                    const key = `${m.homeTeam}-${m.awayTeam}`;
                    if (overridesMap.has(key)) {
                        const newScore = overridesMap.get(key);
                        if (m.resultScore !== newScore) {
                            statsChanged = true;
                            return {
                                ...m,
                                isPlayed: true,
                                resultScore: newScore
                            };
                        }
                    }
                    return m;
                });

                // 3. Recalculate standings if overrides applied
                if (statsChanged) {
                    // Start from scratch for correctness
                    const newTeams: Record<string, TeamStats> = {};
                    (data.teams || []).forEach((t: TeamStats) => {
                        newTeams[t.name] = { ...t, played: 0, wins: 0, points: 0, setsWon: 0, setsLost: 0 };
                    });

                    fixture.forEach((m: Match) => {
                        if (m.isPlayed && m.resultScore) {
                            const outcome = getOutcomeFromScore(m.resultScore);
                            if (outcome && newTeams[m.homeTeam] && newTeams[m.awayTeam]) {
                                const h = newTeams[m.homeTeam];
                                const a = newTeams[m.awayTeam];

                                h.played++;
                                h.points += outcome.homePoints;
                                h.setsWon += outcome.homeSets;
                                h.setsLost += outcome.awaySets;
                                if (outcome.homeWin) h.wins++;

                                a.played++;
                                a.points += outcome.awayPoints;
                                a.setsWon += outcome.awaySets;
                                a.setsLost += outcome.homeSets;
                                if (!outcome.homeWin) a.wins++;
                            }
                        }
                    });

                    // Update teams and sort (preserve group structure if possible, though calculateStandings might need to know groups)
                    // For now, let's just return the recalculated list sorted
                    const finalTeams = sortStandings(Object.values(newTeams));
                    return { teams: finalTeams, fixture };
                }
            }
        } catch (dbError) {
            console.error(`[getLeagueData] Database override fetch failed for ${league}:`, dbError);
            // Fallback to JSON only
        }

        // console.log(`[getLeagueData] Returning ${data.teams?.length} teams for ${league} (Fallback/Normal)`);
        return {
            teams: data.teams || [],
            fixture: fixture
        };
    } catch (error) {
        console.error(`Error reading ${league} data:`, error);
        return { teams: [], fixture: [] };
    }
}

```

## File: app\utils\sounds.ts
```typescript
// Sound effect utilities for gamification
"use client";

// Sound file paths
const SOUNDS = {
    click: '/sounds/click.mp3',
    scoreSelect: '/sounds/score-select.mp3',
    achievement: '/sounds/achievement.mp3',
    levelUp: '/sounds/levelup.mp3',
    victory: '/sounds/victory.mp3',
} as const;

type SoundName = keyof typeof SOUNDS;

// Audio cache to prevent reloading
const audioCache: Map<SoundName, HTMLAudioElement> = new Map();

// Check if sound is enabled from localStorage
function isSoundEnabled(): boolean {
    if (typeof window === 'undefined') return true;
    try {
        const state = localStorage.getItem('volleySimGameState');
        if (state) {
            const parsed = JSON.parse(state);
            return parsed.soundEnabled !== false;
        }
    } catch {
        return true;
    }
    return true;
}

// Preload all sounds
export function preloadSounds(): void {
    if (typeof window === 'undefined') return;

    Object.entries(SOUNDS).forEach(([name, path]) => {
        const audio = new Audio(path);
        audio.preload = 'auto';
        audio.volume = 0.5;
        audioCache.set(name as SoundName, audio);
    });
}

// Play a sound effect
export function playSound(name: SoundName, volume = 0.5): void {
    if (typeof window === 'undefined') return;
    if (!isSoundEnabled()) return;

    try {
        // Get cached audio or create new
        let audio = audioCache.get(name);

        if (!audio) {
            const path = SOUNDS[name];
            if (!path) return;
            audio = new Audio(path);
            audioCache.set(name, audio);
        }

        // Clone to allow overlapping sounds
        const clone = audio.cloneNode() as HTMLAudioElement;
        clone.volume = volume;
        clone.play().catch(() => {
            // Silently fail if autoplay is blocked
        });
    } catch {
        // Silently fail
    }
}

// Specific sound functions for convenience
export const sounds = {
    click: () => playSound('click', 0.3),
    scoreSelect: () => playSound('scoreSelect', 0.4),
    achievement: () => playSound('achievement', 0.6),
    levelUp: () => playSound('levelUp', 0.7),
    victory: () => playSound('victory', 0.5),
};

```

## File: app\utils\supabase-server.ts
```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export async function createServerSupabaseClient() {
    const cookieStore = await cookies();

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
                set(name: string, value: string, options: CookieOptions) {
                    try {
                        cookieStore.set({ name, value, ...options });
                    } catch (error) {
                        // Handle errors in server components
                    }
                },
                remove(name: string, options: CookieOptions) {
                    try {
                        cookieStore.set({ name, value: '', ...options });
                    } catch (error) {
                        // Handle errors in server components
                    }
                },
            },
        }
    );
}

// Service role client for admin operations (bypasses RLS)
// Service role client for admin operations (bypasses RLS)
export function createServiceRoleClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
        throw new Error('Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) are missing.');
    }

    return createClient(url, key, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
    );
}

```

## File: app\utils\supabase.ts
```typescript
import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

// Check if Supabase is properly configured
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

let supabaseClient: SupabaseClient | null = null;

export function createClient(): SupabaseClient | null {
    // Only create client in browser environment
    if (typeof window === 'undefined') {
        return null;
    }

    if (!isSupabaseConfigured) {
        return null;
    }

    if (!supabaseClient) {
        supabaseClient = createBrowserClient(supabaseUrl!, supabaseAnonKey!);
    }

    return supabaseClient;
}

```

## File: app\utils\team-themes.ts
```typescript
export interface TeamTheme {
    primary: string;
    secondary: string;
    accent: string;
    logo?: string;
}

export const TEAM_THEMES: Record<string, TeamTheme> = {
    "VakıfBank": {
        primary: "#ffcc00", // Gold
        secondary: "#000000", // Black
        accent: "#ffdd44"
    },
    "Eczacıbaşı Dynavit": {
        primary: "#ff6600", // Orange
        secondary: "#ffffff",
        accent: "#ff8844"
    },
    "Fenerbahçe Medicana": {
        primary: "#003366", // Navy
        secondary: "#ffed00", // Yellow
        accent: "#004488"
    },
    "Türk Hava Yolları": {
        primary: "#cc0000", // Red
        secondary: "#ffffff",
        accent: "#ee0000"
    },
    "Galatasaray Daikin": {
        primary: "#800000", // Maroon
        secondary: "#ffcc00", // Gold
        accent: "#a00000"
    },
    "Kuzeyboru": {
        primary: "#000000",
        secondary: "#ffffff",
        accent: "#333333"
    },
    "Zeren Spor": {
        primary: "#004488",
        secondary: "#ffffff",
        accent: "#0066aa"
    },
    "Aydın B.Ş.B.": {
        primary: "#003399",
        secondary: "#ffffff",
        accent: "#0055bb"
    },
    "Aras Kargo": {
        primary: "#ee3322",
        secondary: "#ffffff",
        accent: "#ff4433"
    },
    "Beşiktaş": {
        primary: "#000000",
        secondary: "#ffffff",
        accent: "#333333"
    },
    "Nilüfer Bld.": {
        primary: "#0066ff",
        secondary: "#ffffff",
        accent: "#3388ff"
    },
    "Sigorta Shop": {
        primary: "#ff0066",
        secondary: "#ffffff",
        accent: "#ff3388"
    },
    "Sarıyer Bld.": {
        primary: "#22aa44",
        secondary: "#ffffff",
        accent: "#33bb55"
    },
    "Bahçelievler Bld.": {
        primary: "#0088cc",
        secondary: "#ffffff",
        accent: "#22aacc"
    }
};

export const DEFAULT_THEME: TeamTheme = {
    primary: "#10b981", // Emerald
    secondary: "#0f172a", // Slate 900
    accent: "#34d399"
};

export function getTeamTheme(teamName: string | null): TeamTheme {
    if (!teamName) return DEFAULT_THEME;
    return TEAM_THEMES[teamName] || DEFAULT_THEME;
}

```

## File: app\utils\teamIds.ts
```typescript
/**
 * Auto-generated Team IDs
 * Generated at: 2026-01-03T16:39:03.182Z
 * Total Teams: 352
 */

export type TeamId = number;

export interface TeamInfo {
  id: TeamId;
  slug: string;
  name: string;
  league: 'VSL' | '1LIG' | '2LIG' | 'CEV_CL' | 'CEV_CUP' | 'CEV_CHALLENGE';
  country: string | null;
  groupName: string | null;
  clubId?: string | null;
}

export const TEAM_IDS: Record<string, TeamId> = {
  'aras-kargo-vsl': 1000,
  'aydin-buyuksehi-r-beledi-yespor-vsl': 1001,
  'bahceli-evler-bld-vsl': 1002,
  'besi-ktas-vsl': 1003,
  'eczacibasi-dynavi-t-vsl': 1004,
  'fenerbahce-medicana-vsl': 1005,
  'galatasaray-daikin-vsl': 1006,
  'goztepe-vsl': 1007,
  'i-lbank-vsl': 1013,
  'kuzeyboru-vsl': 1008,
  'ni-lufer-beledi-yespor-eker-vsl': 1009,
  'turk-hava-yollari-vsl': 1010,
  'vakifbank-vsl': 1011,
  'zeren-spor-vsl': 1012,
  'afyon-bld-yuntas-1lig': 1033,
  'alfemo-zeren-spor-1lig': 1030,
  'altinordu-1lig': 1021,
  'bodrum-bld-bodrumspor-1lig': 1024,
  'canakkale-bld-1lig': 1015,
  'deni-zli-b-sehi-r-bld-1lig': 1017,
  'di-yarbakir-b-sehi-r-bld-1lig': 1029,
  'eczacibasi-1lig': 1016,
  'endo-karsiyaka-1lig': 1022,
  'fdm-yapi-konya-eregli-bld-1lig': 1038,
  'fenerbahce-medicana-1lig': 1014,
  'havran-bld-1lig': 1025,
  'i-ba-ki-mya-ted-ankara-kolejli-ler-1lig': 1039,
  'i-bb-spor-kulubu-1lig': 1018,
  'i-lbank-1lig': 1028,
  'karayollari-1lig': 1032,
  'kuzeyboru-maxi-pi-pe-spor-1lig': 1026,
  'meri-nos-voleybol-1lig': 1031,
  'muratpasa-bld-aci-koleji-1lig': 1036,
  'ptt-1lig': 1037,
  'sakarya-voleybol-1lig': 1027,
  'si-gorta-shop-mke-ankaragucu-1lig': 1035,
  'trendy-hotels-manavgat-bld-1lig': 1034,
  'vakifbank-1lig': 1019,
  'vestel-mani-sa-b-sehi-r-bld-1lig': 1023,
  'yesi-lyurt-1lig': 1020,
  '07-mega-spor-2lig': 1122,
  '52-camlik-spor-2lig': 1198,
  '73-sirnak-bld-2lig': 1216,
  '91000-dev-spor-2lig': 1212,
  'aci-koleji-2lig': 1120,
  'adana-b-sehi-r-bld-2lig': 1185,
  'adana-sporcu-egi-ti-m-spor-2lig': 1183,
  'adana-t-d-s-2lig': 1180,
  'afyon-gencli-k-spor-2lig': 1129,
  'ahmet-hamdi-tanpinar-ortaokulu-2lig': 1160,
  'akdeni-z-bi-lgi-spor-2lig': 1123,
  'akhi-sar-bld-2lig': 1098,
  'akhi-sar-gucu-2lig': 1097,
  'al-ka-altin-kanatlar-2lig': 1142,
  'alp-spor-2lig': 1080,
  'altay-2lig': 1093,
  'altinay-spor-2lig': 1099,
  'altinyurt-2lig': 1062,
  'ankara-barosu-2lig': 1157,
  'ankara-dsi-2lig': 1168,
  'antepi-a-2lig': 1208,
  'arkas-spor-2lig': 1107,
  'arnavutkoy-bld-2lig': 1047,
  'arsavev-hatay-voleybol-2lig': 1187,
  'ata-okul-spor-2lig': 1096,
  'atasehi-r-kartallari-2lig': 1071,
  'avrupa-voleybol-geli-si-m-2lig': 1040,
  'aydin-buyuksehi-r-beledi-yespor-2lig': 1111,
  'b-sehi-r-bld-ankara-spor-2lig': 1176,
  'bahceli-evler-bld-2lig': 1052,
  'bahcesehi-r-koleji-dalaman-bld-2lig': 1131,
  'balikesi-r-b-sehi-r-bld-2lig': 1082,
  'balikesi-r-dsi-2lig': 1090,
  'bandirma-celi-k-spor-2lig': 1083,
  'bartin-volley-academy-2lig': 1149,
  'basaksehi-r-voleybol-2lig': 1054,
  'baskent-ada-spor-2lig': 1155,
  'baskent-zi-rve-2lig': 1170,
  'bayburt-gencli-k-merkezi-2lig': 1190,
  'bayrakli-bld-2lig': 1102,
  'bergama-bld-2lig': 1104,
  'besi-kduzu-2lig': 1199,
  'besi-ktas-naviosa-2lig': 1055,
  'beyli-kduzu-beykent-2lig': 1042,
  'bi-zi-mkent-voleybol-2lig': 1044,
  'bolu-ataturk-anadolu-li-sesi-2lig': 1154,
  'bursa-b-sehi-r-bld-2lig': 1136,
  'bursa-fethi-ye-1973-spor-2lig': 1134,
  'buyuk-resi-tpasa-ortaokulu-2lig': 1056,
  'buyukcekmece-voleybol-akademi-2lig': 1050,
  'cadence-boya-golcuk-i-hsani-ye-2lig': 1146,
  'can-mi-lan-atleti-k-2lig': 1064,
  'caba-spor-2lig': 1173,
  'can-kale-spor-2lig': 1087,
  'canakkale-kepez-2lig': 1085,
  'catalca-bld-2lig': 1041,
  'cekmekoy-i-stanbul-spor-2lig': 1077,
  'cengelkoy-voleybol-2lig': 1066,
  'cerkezkoy-voleybol-akademi-2lig': 1086,
  'corlu-bld-2lig': 1092,
  'corum-arena-spor-2lig': 1194,
  'corum-voleybol-2lig': 1201,
  'deni-zli-b-sehi-r-bld-2lig': 1125,
  'dev-atasehi-r-2lig': 1068,
  'di-yarbakir-voleybolcular-2lig': 1211,
  'dogu-akademi-2lig': 1069,
  'duzce-voleybol-2lig': 1144,
  'efor-gencli-k-2lig': 1095,
  'elazig-bld-2lig': 1220,
  'eli-t-akdeni-z-2lig': 1121,
  'endo-karsiyaka-2lig': 1118,
  'english-time-spor-2lig': 1164,
  'eregli-sumer-spor-2lig': 1179,
  'eryaman-geli-si-m-2lig': 1167,
  'eski-sehi-r-peyman-spor-2lig': 1135,
  'eski-sehi-r-sehi-r-koleji-egt-kultur-2lig': 1143,
  'eti-mesgut-bld-geli-si-m-2lig': 1165,
  'eyupsultan-bld-2lig': 1061,
  'fenerbahce-medicana-2lig': 1072,
  'fethi-ye-voleybol-2lig': 1126,
  'firat-ozkan-2lig': 1206,
  'forza-spor-2lig': 1106,
  'galatasaray-2lig': 1070,
  'gazi-antep-bld-2lig': 1210,
  'gazi-emi-r-bld-2lig': 1115,
  'gebze-gencli-k-ve-spor-2lig': 1147,
  'geli-si-m-koleji-2lig': 1108,
  'gemli-k-i-sti-klal-spor-2lig': 1133,
  'golbasi-i-ncek-spor-2lig': 1159,
  'goztepe-2lig': 1101,
  'gungoren-voleybol-2lig': 1053,
  'gural-premier-antalyaspor-2lig': 1127,
  'hakan-akisik-spor-2lig': 1163,
  'hakkari-maemtal-2lig': 1217,
  'hakkari-sporti-f-faali-yetler-2lig': 1219,
  'harput-lahmacun-yahya-kaptan-2lig': 1148,
  'hedef-ankara-2lig': 1178,
  'heki-moglu-global-connect-travel-bvi-2lig': 1132,
  'hoca-ahmet-yesevi-anadolu-l-es-voleybol--2lig': 1137,
  'hopa-beledi-ye-2lig': 1192,
  'isparta-gencli-k-spor-2lig': 1124,
  'i-lbank-2lig': 1158,
  'i-stanbul-bi-zi-mkent-spor-2lig': 1046,
  'i-zmi-r-b-sehir-bld-2lig': 1114,
  'i-zmi-r-dsi-2lig': 1116,
  'i-zmi-t-spor-2lig': 1151,
  'kamari-n-spor-2lig': 1074,
  'karabuk-gencli-k-spor-2lig': 1145,
  'kartal-anadolu-2lig': 1078,
  'kartal-bld-2lig': 1079,
  'kavak-spor-2lig': 1169,
  'kayseri-ci-mnasti-k-spor-2lig': 1203,
  'kayseri-voleybol-2lig': 1204,
  'kirklareli-gencli-k-spor-2lig': 1089,
  'kocaeli-ni-comedi-a-akademi-2lig': 1150,
  'kocaeli-voleybol-akademi-2lig': 1153,
  'kuzey-yildizlari-2lig': 1081,
  'kucukcekmece-voleybol-2lig': 1048,
  'kzy-spor-2lig': 1103,
  'lanueva-kozmeti-k-anadolu-marmara-2lig': 1065,
  'mac-sayisi-2lig': 1067,
  'malatya-voleybol-2lig': 1214,
  'margenc-2lig': 1213,
  'marmari-s-bld-2lig': 1130,
  'media-first-ayvalik-geli-si-m-spor-2lig': 1084,
  'mehmet-ege-i-nsaat-i-negol-orhani-ye-vol-2lig': 1140,
  'mehmet-erdem-marmara-akademi-2lig': 1075,
  'meri-nos-voleybol-2lig': 1205,
  'mg-spor-2lig': 1138,
  'misiroglu-beytepe-2lig': 1174,
  'mke-ankaragucu-2lig': 1172,
  'mus-oli-mpi-k-spor-2lig': 1215,
  'ni-cer-hotel-voleybol-2lig': 1218,
  'ni-lufer-bld-2lig': 1139,
  'okura-loji-sti-k-mersi-n-i-hti-sas-2lig': 1184,
  'osmancik-bld-2lig': 1196,
  'polat-group-di-di-m-beledi-yespor-2lig': 1109,
  'polatli-duatepe-2lig': 1177,
  'ptt-2lig': 1166,
  'ri-ze-endustri-meslek-li-sesi-2lig': 1200,
  'roberteam-2lig': 1058,
  'rota-koleji-2lig': 1112,
  'semt-asansor-bordo-mavi-61-2lig': 1197,
  'serdi-van-bld-2lig': 1152,
  'seyhan-bld-2lig': 1182,
  'sinav-koleji-samsunspor-2lig': 1191,
  'si-banet-kozan-i-mamoglu-spor-2lig': 1189,
  'si-li-vri-cagribey-2lig': 1049,
  'si-lopi-bld-sporti-f-faali-yetler-2lig': 1222,
  'si-lopi-geli-si-m-faali-yetleri-2lig': 1221,
  'si-vas-toprak-gayri-menkul-pars-akademi-2lig': 1209,
  'smac-spor-2lig': 1045,
  'smart-holding-a-s-cayeli-2lig': 1195,
  'soke-beledi-ye-saldos-voleybol-2lig': 1113,
  'superpool-findikli-1974-2lig': 1193,
  'tarsus-ameri-kan-koleji-2lig': 1181,
  'ted-ankara-kolejli-ler-2lig': 1175,
  'tek-metal-sporti-f-2lig': 1161,
  'teki-rdag-voleybol-i-hti-sas-2lig': 1091,
  'temi-z-enerji-birli-gi-2lig': 1156,
  'toros-universi-tesi-volgem-2lig': 1188,
  'toroslar-bld-2lig': 1186,
  'toyzz-shop-di-namo-spor-2lig': 1073,
  'turgutlu-bld-kultur-sanat-2lig': 1105,
  'tuzla-mercan-2lig': 1076,
  'turk-hava-yollari-2lig': 1043,
  'turkoglu-spor-kulubu-2lig': 1094,
  'tvf-spor-li-sesi-2lig': 1162,
  'uysallar-oto-fethi-ye-zi-rve-2lig': 1128,
  'ulku-spor-2lig': 1110,
  'unsped-2lig': 1051,
  'vefa-2lig': 1060,
  'venus-spor-2lig': 1117,
  'vi-ransehi-r-voleybol-2lig': 1207,
  'volkan-guc-spor-2lig': 1119,
  'world-medicine-ates-spor-2lig': 1063,
  'yalova-ci-ftli-kkoy-bld-2lig': 1141,
  'yedi-dag-spor-2lig': 1171,
  'yeni-ay-loji-sti-k-sariyer-konak-spor-2lig': 1057,
  'yesi-l-bayrami-c-2lig': 1088,
  'yesi-lyurt-2lig': 1059,
  'yunusemre-bld-2lig': 1100,
  'zeugma-gazi-antep-spor-2lig': 1202,
  'a-carraro-prosecco-doc-conegliano-cev-cl': 1235,
  'ankara-zeren-spor-kulubu-cev-cl': 1236,
  'cs-volei-alba-blaj-cev-cl': 1225,
  'dresdner-sc-cev-cl': 1237,
  'eczacibasi-istanbul-cev-cl': 1232,
  'fenerbahce-medicana-istanbul-cev-cl': 1227,
  'igor-gorgonzola-novara-cev-cl': 1228,
  'ks-developres-rzesz-w-cev-cl': 1240,
  'levallois-paris-saint-cloud-cev-cl': 1241,
  'ks-commercecon-d-cev-cl': 1238,
  'maritza-plovdiv-cev-cl': 1242,
  'numia-vero-volley-milano-cev-cl': 1231,
  'ok-elezni-ar-lajkovac-cev-cl': 1234,
  'olympiacos-piraeus-cev-cl': 1233,
  'pge-budowlani-d-cev-cl': 1230,
  'savino-del-bene-scandicci-cev-cl': 1223,
  'sport-lisboa-e-benfica-cev-cl': 1229,
  'ssc-palmberg-schwerin-cev-cl': 1239,
  'vakifbank-istanbul-cev-cl': 1224,
  'volero-le-cannet-cev-cl': 1226,
  'ac-paok-thessaloniki-cev-cup': 1266,
  'allianz-mtv-stuttgart-cev-cup': 1245,
  'asterix-avo-beveren-cev-cup': 1260,
  'avarca-de-menorca-cev-cup': 1268,
  'bks-bostik-bielsko-bia-a-cev-cup': 1252,
  'c-s-o-voluntari-2005-cev-cup': 1247,
  'cd-heidelberg-las-palmas-cev-cup': 1267,
  'darta-bevo-roeselare-cev-cup': 1259,
  'dinamo-bucuresti-cev-cup': 1248,
  'dukla-liberec-cev-cup': 1265,
  'fc-porto-cev-cup': 1261,
  'galatasaray-daikin-istanbul-cev-cup': 1243,
  'janta-volej-kisela-voda-cev-cup': 1273,
  'mbh-b-k-scsaba-cev-cup': 1255,
  'mladost-zagreb-cev-cup': 1257,
  'moya-radomka-radom-cev-cup': 1253,
  'ok-dinamo-zagreb-cev-cup': 1258,
  'otp-banka-branik-maribor-cev-cup': 1254,
  'reale-mutua-fenera-chieri-76-cev-cup': 1249,
  'sporting-cp-lisboa-cev-cup': 1262,
  'tent-obrenovac-cev-cup': 1269,
  'thy-istanbul-cev-cup': 1244,
  'vandoeuvre-nancy-vb-cev-cup': 1251,
  'vasas-buda-budapest-cev-cup': 1256,
  'vfb-suhl-thuringen-cev-cup': 1246,
  'viteos-neuchatel-uc-cev-cup': 1263,
  'vk-up-olomouc-cev-cup': 1264,
  'volley-mulhouse-alsace-cev-cup': 1250,
  'ok-gacko-rd-swisslion-cev-cup': 1272,
  'ok-ribola-ka-tela-cev-cup': 1271,
  'zok-ub-cev-cup': 1270,
  'aek-athens-cev-challenge': 1274,
  'aek-athens-gre-cev-challenge': 1318,
  'ao-thiras-cev-challenge': 1294,
  'ao-thiras-gre-cev-challenge': 1338,
  'buducnost-podgorica-cev-challenge': 1301,
  'buducnost-podgorica-mne-cev-challenge': 1345,
  'c-s-m-lugoj-cev-challenge': 1287,
  'c-s-m-lugoj-rou-cev-challenge': 1331,
  'draisma-dynamo-apeldoorn-cev-challenge': 1279,
  'draisma-dynamo-apeldoorn-ned-cev-challenge': 1323,
  'erzbergm-trofaiach-eisenerz-cev-challenge': 1306,
  'erzbergm-trofaiach-eisenerz-aut-cev-challenge': 1350,
  'fatum-ny-regyh-za-cev-challenge': 1296,
  'fatum-ny-regyh-za-hun-cev-challenge': 1340,
  'fleyr-t-rshavn-cev-challenge': 1293,
  'fleyr-t-rshavn-far-cev-challenge': 1337,
  'friso-sneek-cev-challenge': 1286,
  'friso-sneek-ned-cev-challenge': 1330,
  'fundaci-n-cajasol-andaluc-a-cev-challenge': 1282,
  'fundaci-n-cajasol-andaluc-a-esp-cev-challenge': 1326,
  'gs-panionios-nea-smyrni-cev-challenge': 1295,
  'gs-panionios-nea-smyrni-gre-cev-challenge': 1339,
  'gzok-srem-sremska-mitrovica-cev-challenge': 1275,
  'gzok-srem-sremska-mitrovica-srb-cev-challenge': 1319,
  'holte-if-cev-challenge': 1281,
  'holte-if-den-cev-challenge': 1325,
  'kaunas-vdu-cev-challenge': 1298,
  'kaunas-vdu-ltu-cev-challenge': 1342,
  'kv-fer-volley-ferizaj-cev-challenge': 1291,
  'kv-fer-volley-ferizaj-kos-cev-challenge': 1335,
  'levski-sofia-cev-challenge': 1289,
  'levski-sofia-bul-cev-challenge': 1333,
  'lp-salo-cev-challenge': 1297,
  'lp-salo-fin-cev-challenge': 1341,
  'nakovski-volej-strumica-cev-challenge': 1277,
  'nakovski-volej-strumica-mkd-cev-challenge': 1321,
  'ocisa-haro-rioja-cev-challenge': 1300,
  'ocisa-haro-rioja-esp-cev-challenge': 1344,
  'ok-brda-split-cev-challenge': 1284,
  'ok-brda-split-cro-cev-challenge': 1328,
  'ksyl-myre-cev-challenge': 1299,
  'ksyl-myre-nor-cev-challenge': 1343,
  'olympiada-neapolis-nicosia-cev-challenge': 1285,
  'olympiada-neapolis-nicosia-cyp-cev-challenge': 1329,
  'rabotnicki-skopje-cev-challenge': 1302,
  'rabotnicki-skopje-mkd-cev-challenge': 1346,
  'rae-spordikool-viaston-juri-cev-challenge': 1303,
  'rae-spordikool-viaston-juri-est-cev-challenge': 1347,
  'sc-balta-cev-challenge': 1307,
  'sc-balta-ukr-cev-challenge': 1351,
  'tchalou-chapelle-lez-herlaimont-cev-challenge': 1292,
  'tchalou-chapelle-lez-herlaimont-bel-cev-challenge': 1336,
  'tif-viking-bergen-cev-challenge': 1305,
  'tif-viking-bergen-nor-cev-challenge': 1349,
  'tj-ostrava-cev-challenge': 1276,
  'tj-ostrava-cze-cev-challenge': 1320,
  'va-uniza-zilina-cev-challenge': 1280,
  'va-uniza-zilina-svk-cev-challenge': 1324,
  'vbc-cheseaux-cev-challenge': 1288,
  'vbc-cheseaux-sui-cev-challenge': 1332,
  'vk-pirane-brusno-cev-challenge': 1304,
  'vk-pirane-brusno-svk-cev-challenge': 1348,
  'vk-prostejov-cev-challenge': 1278,
  'vk-prostejov-cze-cev-challenge': 1322,
  'vk-slovan-bratislava-cev-challenge': 1283,
  'vk-slovan-bratislava-svk-cev-challenge': 1327,
  'volley-dudingen-cev-challenge': 1290,
  'volley-dudingen-sui-cev-challenge': 1334,
  'winner-chcm-67-68-cev-challenge': 1308,
  'winner-chcw-69-70-cev-challenge': 1309,
  'winner-chcw-71-72-cev-challenge': 1310,
  'winner-chcw-73-74-cev-challenge': 1311,
  'winner-chcw-75-76-cev-challenge': 1312,
  'winner-chcw-77-78-cev-challenge': 1313,
  'winner-chcw-79-80-cev-challenge': 1314,
  'winner-chcw-81-82-cev-challenge': 1315,
  'winner-chcw-91-92-cev-challenge': 1316,
  'winner-chcw-93-94-cev-challenge': 1317
};

export const TEAMS: Record<TeamId, TeamInfo> = {
  1000: {"id":1000,"slug":"aras-kargo-vsl","name":"ARAS KARGO","league":"VSL","country":"TUR","groupName":"Vodafone Sultanlar Ligi"},
  1001: {"id":1001,"slug":"aydin-buyuksehi-r-beledi-yespor-vsl","name":"AYDIN BÜYÜKŞEHİR BELEDİYESPOR","league":"VSL","country":"TUR","groupName":"Vodafone Sultanlar Ligi"},
  1002: {"id":1002,"slug":"bahceli-evler-bld-vsl","name":"BAHÇELİEVLER BLD.","league":"VSL","country":"TUR","groupName":"Vodafone Sultanlar Ligi"},
  1003: {"id":1003,"slug":"besi-ktas-vsl","name":"BEŞİKTAŞ","league":"VSL","country":"TUR","groupName":"Vodafone Sultanlar Ligi"},
  1004: {"id":1004,"slug":"eczacibasi-dynavi-t-vsl","name":"ECZACIBAŞI DYNAVİT","league":"VSL","country":"TUR","groupName":"Vodafone Sultanlar Ligi"},
  1005: {"id":1005,"slug":"fenerbahce-medicana-vsl","name":"FENERBAHÇE MEDICANA","league":"VSL","country":"TUR","groupName":"Vodafone Sultanlar Ligi"},
  1006: {"id":1006,"slug":"galatasaray-daikin-vsl","name":"GALATASARAY DAIKIN","league":"VSL","country":"TUR","groupName":"Vodafone Sultanlar Ligi"},
  1007: {"id":1007,"slug":"goztepe-vsl","name":"GÖZTEPE","league":"VSL","country":"TUR","groupName":"Vodafone Sultanlar Ligi"},
  1013: {"id":1013,"slug":"i-lbank-vsl","name":"İLBANK","league":"VSL","country":"TUR","groupName":"Vodafone Sultanlar Ligi"},
  1008: {"id":1008,"slug":"kuzeyboru-vsl","name":"KUZEYBORU","league":"VSL","country":"TUR","groupName":"Vodafone Sultanlar Ligi"},
  1009: {"id":1009,"slug":"ni-lufer-beledi-yespor-eker-vsl","name":"NİLÜFER BELEDİYESPOR EKER","league":"VSL","country":"TUR","groupName":"Vodafone Sultanlar Ligi"},
  1010: {"id":1010,"slug":"turk-hava-yollari-vsl","name":"TÜRK HAVA YOLLARI","league":"VSL","country":"TUR","groupName":"Vodafone Sultanlar Ligi"},
  1011: {"id":1011,"slug":"vakifbank-vsl","name":"VAKIFBANK","league":"VSL","country":"TUR","groupName":"Vodafone Sultanlar Ligi"},
  1012: {"id":1012,"slug":"zeren-spor-vsl","name":"ZEREN SPOR","league":"VSL","country":"TUR","groupName":"Vodafone Sultanlar Ligi"},
  1033: {"id":1033,"slug":"afyon-bld-yuntas-1lig","name":"AFYON BLD. YÜNTAŞ","league":"1LIG","country":"TUR","groupName":"B. Grup"},
  1030: {"id":1030,"slug":"alfemo-zeren-spor-1lig","name":"ALFEMO ZEREN SPOR","league":"1LIG","country":"TUR","groupName":"B. Grup"},
  1021: {"id":1021,"slug":"altinordu-1lig","name":"ALTINORDU","league":"1LIG","country":"TUR","groupName":"A. Grup"},
  1024: {"id":1024,"slug":"bodrum-bld-bodrumspor-1lig","name":"BODRUM BLD. BODRUMSPOR","league":"1LIG","country":"TUR","groupName":"A. Grup"},
  1015: {"id":1015,"slug":"canakkale-bld-1lig","name":"ÇANAKKALE BLD.","league":"1LIG","country":"TUR","groupName":"A. Grup"},
  1017: {"id":1017,"slug":"deni-zli-b-sehi-r-bld-1lig","name":"DENİZLİ B.ŞEHİR BLD.","league":"1LIG","country":"TUR","groupName":"A. Grup"},
  1029: {"id":1029,"slug":"di-yarbakir-b-sehi-r-bld-1lig","name":"DİYARBAKIR B.ŞEHİR BLD.","league":"1LIG","country":"TUR","groupName":"B. Grup"},
  1016: {"id":1016,"slug":"eczacibasi-1lig","name":"ECZACIBAŞI","league":"1LIG","country":"TUR","groupName":"A. Grup"},
  1022: {"id":1022,"slug":"endo-karsiyaka-1lig","name":"ENDO KARŞIYAKA","league":"1LIG","country":"TUR","groupName":"A. Grup"},
  1038: {"id":1038,"slug":"fdm-yapi-konya-eregli-bld-1lig","name":"FDM YAPI KONYA EREĞLİ BLD.","league":"1LIG","country":"TUR","groupName":"B. Grup"},
  1014: {"id":1014,"slug":"fenerbahce-medicana-1lig","name":"FENERBAHÇE MEDICANA","league":"1LIG","country":"TUR","groupName":"A. Grup"},
  1025: {"id":1025,"slug":"havran-bld-1lig","name":"HAVRAN BLD.","league":"1LIG","country":"TUR","groupName":"A. Grup"},
  1039: {"id":1039,"slug":"i-ba-ki-mya-ted-ankara-kolejli-ler-1lig","name":"İBA KİMYA TED ANKARA KOLEJLİLER","league":"1LIG","country":"TUR","groupName":"B. Grup"},
  1018: {"id":1018,"slug":"i-bb-spor-kulubu-1lig","name":"İBB SPOR KULÜBÜ","league":"1LIG","country":"TUR","groupName":"A. Grup"},
  1028: {"id":1028,"slug":"i-lbank-1lig","name":"İLBANK","league":"1LIG","country":"TUR","groupName":"B. Grup"},
  1032: {"id":1032,"slug":"karayollari-1lig","name":"KARAYOLLARI","league":"1LIG","country":"TUR","groupName":"B. Grup"},
  1026: {"id":1026,"slug":"kuzeyboru-maxi-pi-pe-spor-1lig","name":"KUZEYBORU MAXİPİPE SPOR","league":"1LIG","country":"TUR","groupName":"B. Grup"},
  1031: {"id":1031,"slug":"meri-nos-voleybol-1lig","name":"MERİNOS VOLEYBOL","league":"1LIG","country":"TUR","groupName":"B. Grup"},
  1036: {"id":1036,"slug":"muratpasa-bld-aci-koleji-1lig","name":"MURATPAŞA BLD. AÇI KOLEJİ","league":"1LIG","country":"TUR","groupName":"B. Grup"},
  1037: {"id":1037,"slug":"ptt-1lig","name":"PTT","league":"1LIG","country":"TUR","groupName":"B. Grup"},
  1027: {"id":1027,"slug":"sakarya-voleybol-1lig","name":"SAKARYA VOLEYBOL","league":"1LIG","country":"TUR","groupName":"B. Grup"},
  1035: {"id":1035,"slug":"si-gorta-shop-mke-ankaragucu-1lig","name":"SİGORTA SHOP MKE ANKARAGÜCÜ","league":"1LIG","country":"TUR","groupName":"B. Grup"},
  1034: {"id":1034,"slug":"trendy-hotels-manavgat-bld-1lig","name":"TRENDY HOTELS MANAVGAT BLD.","league":"1LIG","country":"TUR","groupName":"B. Grup"},
  1019: {"id":1019,"slug":"vakifbank-1lig","name":"VAKIFBANK","league":"1LIG","country":"TUR","groupName":"A. Grup"},
  1023: {"id":1023,"slug":"vestel-mani-sa-b-sehi-r-bld-1lig","name":"VESTEL MANİSA B.ŞEHİR BLD.","league":"1LIG","country":"TUR","groupName":"A. Grup"},
  1020: {"id":1020,"slug":"yesi-lyurt-1lig","name":"YEŞİLYURT","league":"1LIG","country":"TUR","groupName":"A. Grup"},
  1122: {"id":1122,"slug":"07-mega-spor-2lig","name":"07 MEGA SPOR","league":"2LIG","country":"TUR","groupName":"8. GRUP"},
  1198: {"id":1198,"slug":"52-camlik-spor-2lig","name":"52 ÇAMLIK SPOR","league":"2LIG","country":"TUR","groupName":"14. GRUP"},
  1216: {"id":1216,"slug":"73-sirnak-bld-2lig","name":"73 ŞIRNAK BLD.","league":"2LIG","country":"TUR","groupName":"16. GRUP"},
  1212: {"id":1212,"slug":"91000-dev-spor-2lig","name":"91000 DEV SPOR","league":"2LIG","country":"TUR","groupName":"16. GRUP"},
  1120: {"id":1120,"slug":"aci-koleji-2lig","name":"AÇI KOLEJİ","league":"2LIG","country":"TUR","groupName":"8. GRUP"},
  1185: {"id":1185,"slug":"adana-b-sehi-r-bld-2lig","name":"ADANA B.ŞEHİR BLD.","league":"2LIG","country":"TUR","groupName":"13. GRUP"},
  1183: {"id":1183,"slug":"adana-sporcu-egi-ti-m-spor-2lig","name":"ADANA SPORCU EĞİTİM SPOR","league":"2LIG","country":"TUR","groupName":"13. GRUP"},
  1180: {"id":1180,"slug":"adana-t-d-s-2lig","name":"ADANA T.D.S.","league":"2LIG","country":"TUR","groupName":"13. GRUP"},
  1129: {"id":1129,"slug":"afyon-gencli-k-spor-2lig","name":"AFYON GENÇLİK SPOR","league":"2LIG","country":"TUR","groupName":"8. GRUP"},
  1160: {"id":1160,"slug":"ahmet-hamdi-tanpinar-ortaokulu-2lig","name":"AHMET HAMDİ TANPINAR ORTAOKULU","league":"2LIG","country":"TUR","groupName":"11. GRUP"},
  1123: {"id":1123,"slug":"akdeni-z-bi-lgi-spor-2lig","name":"AKDENİZ BİLGİ SPOR","league":"2LIG","country":"TUR","groupName":"8. GRUP"},
  1098: {"id":1098,"slug":"akhi-sar-bld-2lig","name":"AKHİSAR BLD.","league":"2LIG","country":"TUR","groupName":"6. GRUP"},
  1097: {"id":1097,"slug":"akhi-sar-gucu-2lig","name":"AKHİSAR GÜCÜ","league":"2LIG","country":"TUR","groupName":"6. GRUP"},
  1142: {"id":1142,"slug":"al-ka-altin-kanatlar-2lig","name":"AL-KA ALTIN KANATLAR","league":"2LIG","country":"TUR","groupName":"9. GRUP"},
  1080: {"id":1080,"slug":"alp-spor-2lig","name":"ALP SPOR","league":"2LIG","country":"TUR","groupName":"4. GRUP"},
  1093: {"id":1093,"slug":"altay-2lig","name":"ALTAY","league":"2LIG","country":"TUR","groupName":"6. GRUP"},
  1099: {"id":1099,"slug":"altinay-spor-2lig","name":"ALTINAY SPOR","league":"2LIG","country":"TUR","groupName":"6. GRUP"},
  1062: {"id":1062,"slug":"altinyurt-2lig","name":"ALTINYURT","league":"2LIG","country":"TUR","groupName":"3. GRUP"},
  1157: {"id":1157,"slug":"ankara-barosu-2lig","name":"ANKARA BAROSU","league":"2LIG","country":"TUR","groupName":"11. GRUP"},
  1168: {"id":1168,"slug":"ankara-dsi-2lig","name":"ANKARA DSİ","league":"2LIG","country":"TUR","groupName":"12. GRUP"},
  1208: {"id":1208,"slug":"antepi-a-2lig","name":"ANTEPİA","league":"2LIG","country":"TUR","groupName":"15. GRUP"},
  1107: {"id":1107,"slug":"arkas-spor-2lig","name":"ARKAS SPOR","league":"2LIG","country":"TUR","groupName":"7. GRUP"},
  1047: {"id":1047,"slug":"arnavutkoy-bld-2lig","name":"ARNAVUTKÖY BLD.","league":"2LIG","country":"TUR","groupName":"1. GRUP"},
  1187: {"id":1187,"slug":"arsavev-hatay-voleybol-2lig","name":"ARSAVEV HATAY VOLEYBOL","league":"2LIG","country":"TUR","groupName":"13. GRUP"},
  1096: {"id":1096,"slug":"ata-okul-spor-2lig","name":"ATA OKUL SPOR","league":"2LIG","country":"TUR","groupName":"6. GRUP"},
  1071: {"id":1071,"slug":"atasehi-r-kartallari-2lig","name":"ATAŞEHİR KARTALLARI","league":"2LIG","country":"TUR","groupName":"3. GRUP"},
  1040: {"id":1040,"slug":"avrupa-voleybol-geli-si-m-2lig","name":"AVRUPA VOLEYBOL GELİŞİM","league":"2LIG","country":"TUR","groupName":"1. GRUP"},
  1111: {"id":1111,"slug":"aydin-buyuksehi-r-beledi-yespor-2lig","name":"AYDIN BÜYÜKŞEHİR BELEDİYESPOR","league":"2LIG","country":"TUR","groupName":"7. GRUP"},
  1176: {"id":1176,"slug":"b-sehi-r-bld-ankara-spor-2lig","name":"B.ŞEHİR BLD. ANKARA SPOR","league":"2LIG","country":"TUR","groupName":"12. GRUP"},
  1052: {"id":1052,"slug":"bahceli-evler-bld-2lig","name":"BAHÇELİEVLER BLD.","league":"2LIG","country":"TUR","groupName":"2. GRUP"},
  1131: {"id":1131,"slug":"bahcesehi-r-koleji-dalaman-bld-2lig","name":"BAHÇEŞEHİR KOLEJİ DALAMAN BLD.","league":"2LIG","country":"TUR","groupName":"8. GRUP"},
  1082: {"id":1082,"slug":"balikesi-r-b-sehi-r-bld-2lig","name":"BALIKESİR B.ŞEHİR BLD.","league":"2LIG","country":"TUR","groupName":"5. GRUP"},
  1090: {"id":1090,"slug":"balikesi-r-dsi-2lig","name":"BALIKESİR DSİ","league":"2LIG","country":"TUR","groupName":"5. GRUP"},
  1083: {"id":1083,"slug":"bandirma-celi-k-spor-2lig","name":"BANDIRMA ÇELİK SPOR","league":"2LIG","country":"TUR","groupName":"5. GRUP"},
  1149: {"id":1149,"slug":"bartin-volley-academy-2lig","name":"BARTIN VOLLEY ACADEMY","league":"2LIG","country":"TUR","groupName":"10. GRUP"},
  1054: {"id":1054,"slug":"basaksehi-r-voleybol-2lig","name":"BAŞAKŞEHİR VOLEYBOL","league":"2LIG","country":"TUR","groupName":"2. GRUP"},
  1155: {"id":1155,"slug":"baskent-ada-spor-2lig","name":"BAŞKENT ADA SPOR","league":"2LIG","country":"TUR","groupName":"11. GRUP"},
  1170: {"id":1170,"slug":"baskent-zi-rve-2lig","name":"BAŞKENT ZİRVE","league":"2LIG","country":"TUR","groupName":"12. GRUP"},
  1190: {"id":1190,"slug":"bayburt-gencli-k-merkezi-2lig","name":"BAYBURT GENÇLİK MERKEZİ","league":"2LIG","country":"TUR","groupName":"14. GRUP"},
  1102: {"id":1102,"slug":"bayrakli-bld-2lig","name":"BAYRAKLI BLD.","league":"2LIG","country":"TUR","groupName":"6. GRUP"},
  1104: {"id":1104,"slug":"bergama-bld-2lig","name":"BERGAMA BLD.","league":"2LIG","country":"TUR","groupName":"6. GRUP"},
  1199: {"id":1199,"slug":"besi-kduzu-2lig","name":"BEŞİKDÜZÜ","league":"2LIG","country":"TUR","groupName":"14. GRUP"},
  1055: {"id":1055,"slug":"besi-ktas-naviosa-2lig","name":"BEŞİKTAŞ NAVIOSA","league":"2LIG","country":"TUR","groupName":"2. GRUP"},
  1042: {"id":1042,"slug":"beyli-kduzu-beykent-2lig","name":"BEYLİKDÜZÜ BEYKENT","league":"2LIG","country":"TUR","groupName":"1. GRUP"},
  1044: {"id":1044,"slug":"bi-zi-mkent-voleybol-2lig","name":"BİZİMKENT VOLEYBOL","league":"2LIG","country":"TUR","groupName":"1. GRUP"},
  1154: {"id":1154,"slug":"bolu-ataturk-anadolu-li-sesi-2lig","name":"BOLU ATATÜRK ANADOLU LİSESİ","league":"2LIG","country":"TUR","groupName":"10. GRUP"},
  1136: {"id":1136,"slug":"bursa-b-sehi-r-bld-2lig","name":"BURSA B.ŞEHİR BLD.","league":"2LIG","country":"TUR","groupName":"9. GRUP"},
  1134: {"id":1134,"slug":"bursa-fethi-ye-1973-spor-2lig","name":"BURSA FETHİYE 1973 SPOR","league":"2LIG","country":"TUR","groupName":"9. GRUP"},
  1056: {"id":1056,"slug":"buyuk-resi-tpasa-ortaokulu-2lig","name":"BÜYÜK REŞİTPAŞA ORTAOKULU","league":"2LIG","country":"TUR","groupName":"2. GRUP"},
  1050: {"id":1050,"slug":"buyukcekmece-voleybol-akademi-2lig","name":"BÜYÜKÇEKMECE VOLEYBOL AKADEMİ","league":"2LIG","country":"TUR","groupName":"1. GRUP"},
  1146: {"id":1146,"slug":"cadence-boya-golcuk-i-hsani-ye-2lig","name":"CADENCE BOYA GÖLCÜK İHSANİYE","league":"2LIG","country":"TUR","groupName":"10. GRUP"},
  1064: {"id":1064,"slug":"can-mi-lan-atleti-k-2lig","name":"CAN MİLAN ATLETİK","league":"2LIG","country":"TUR","groupName":"3. GRUP"},
  1173: {"id":1173,"slug":"caba-spor-2lig","name":"ÇABA SPOR","league":"2LIG","country":"TUR","groupName":"12. GRUP"},
  1087: {"id":1087,"slug":"can-kale-spor-2lig","name":"ÇAN KALE SPOR","league":"2LIG","country":"TUR","groupName":"5. GRUP"},
  1085: {"id":1085,"slug":"canakkale-kepez-2lig","name":"ÇANAKKALE KEPEZ","league":"2LIG","country":"TUR","groupName":"5. GRUP"},
  1041: {"id":1041,"slug":"catalca-bld-2lig","name":"ÇATALCA BLD.","league":"2LIG","country":"TUR","groupName":"1. GRUP"},
  1077: {"id":1077,"slug":"cekmekoy-i-stanbul-spor-2lig","name":"ÇEKMEKÖY İSTANBUL SPOR","league":"2LIG","country":"TUR","groupName":"4. GRUP"},
  1066: {"id":1066,"slug":"cengelkoy-voleybol-2lig","name":"ÇENGELKÖY VOLEYBOL","league":"2LIG","country":"TUR","groupName":"3. GRUP"},
  1086: {"id":1086,"slug":"cerkezkoy-voleybol-akademi-2lig","name":"ÇERKEZKÖY VOLEYBOL AKADEMİ","league":"2LIG","country":"TUR","groupName":"5. GRUP"},
  1092: {"id":1092,"slug":"corlu-bld-2lig","name":"ÇORLU BLD.","league":"2LIG","country":"TUR","groupName":"5. GRUP"},
  1194: {"id":1194,"slug":"corum-arena-spor-2lig","name":"ÇORUM ARENA SPOR","league":"2LIG","country":"TUR","groupName":"14. GRUP"},
  1201: {"id":1201,"slug":"corum-voleybol-2lig","name":"ÇORUM VOLEYBOL","league":"2LIG","country":"TUR","groupName":"14. GRUP"},
  1125: {"id":1125,"slug":"deni-zli-b-sehi-r-bld-2lig","name":"DENİZLİ B.ŞEHİR BLD.","league":"2LIG","country":"TUR","groupName":"8. GRUP"},
  1068: {"id":1068,"slug":"dev-atasehi-r-2lig","name":"DEV ATAŞEHİR","league":"2LIG","country":"TUR","groupName":"3. GRUP"},
  1211: {"id":1211,"slug":"di-yarbakir-voleybolcular-2lig","name":"DİYARBAKIR VOLEYBOLCULAR","league":"2LIG","country":"TUR","groupName":"15. GRUP"},
  1069: {"id":1069,"slug":"dogu-akademi-2lig","name":"DOĞU AKADEMİ","league":"2LIG","country":"TUR","groupName":"3. GRUP"},
  1144: {"id":1144,"slug":"duzce-voleybol-2lig","name":"DÜZCE VOLEYBOL","league":"2LIG","country":"TUR","groupName":"10. GRUP"},
  1095: {"id":1095,"slug":"efor-gencli-k-2lig","name":"EFOR GENÇLİK","league":"2LIG","country":"TUR","groupName":"6. GRUP"},
  1220: {"id":1220,"slug":"elazig-bld-2lig","name":"ELAZIĞ BLD.","league":"2LIG","country":"TUR","groupName":"16. GRUP"},
  1121: {"id":1121,"slug":"eli-t-akdeni-z-2lig","name":"ELİT AKDENİZ","league":"2LIG","country":"TUR","groupName":"8. GRUP"},
  1118: {"id":1118,"slug":"endo-karsiyaka-2lig","name":"ENDO KARŞIYAKA","league":"2LIG","country":"TUR","groupName":"7. GRUP"},
  1164: {"id":1164,"slug":"english-time-spor-2lig","name":"ENGLISH TIME SPOR","league":"2LIG","country":"TUR","groupName":"11. GRUP"},
  1179: {"id":1179,"slug":"eregli-sumer-spor-2lig","name":"EREĞLİ SÜMER SPOR","league":"2LIG","country":"TUR","groupName":"13. GRUP"},
  1167: {"id":1167,"slug":"eryaman-geli-si-m-2lig","name":"ERYAMAN GELİŞİM","league":"2LIG","country":"TUR","groupName":"12. GRUP"},
  1135: {"id":1135,"slug":"eski-sehi-r-peyman-spor-2lig","name":"ESKİŞEHİR PEYMAN SPOR","league":"2LIG","country":"TUR","groupName":"9. GRUP"},
  1143: {"id":1143,"slug":"eski-sehi-r-sehi-r-koleji-egt-kultur-2lig","name":"ESKİŞEHİR ŞEHİR KOLEJİ EĞT. KÜLTÜR","league":"2LIG","country":"TUR","groupName":"9. GRUP"},
  1165: {"id":1165,"slug":"eti-mesgut-bld-geli-si-m-2lig","name":"ETİMESGUT BLD. GELİŞİM","league":"2LIG","country":"TUR","groupName":"11. GRUP"},
  1061: {"id":1061,"slug":"eyupsultan-bld-2lig","name":"EYÜPSULTAN BLD.","league":"2LIG","country":"TUR","groupName":"2. GRUP"},
  1072: {"id":1072,"slug":"fenerbahce-medicana-2lig","name":"FENERBAHÇE MEDICANA","league":"2LIG","country":"TUR","groupName":"4. GRUP"},
  1126: {"id":1126,"slug":"fethi-ye-voleybol-2lig","name":"FETHİYE VOLEYBOL","league":"2LIG","country":"TUR","groupName":"8. GRUP"},
  1206: {"id":1206,"slug":"firat-ozkan-2lig","name":"FIRAT ÖZKAN","league":"2LIG","country":"TUR","groupName":"15. GRUP"},
  1106: {"id":1106,"slug":"forza-spor-2lig","name":"FORZA SPOR","league":"2LIG","country":"TUR","groupName":"6. GRUP"},
  1070: {"id":1070,"slug":"galatasaray-2lig","name":"GALATASARAY","league":"2LIG","country":"TUR","groupName":"3. GRUP"},
  1210: {"id":1210,"slug":"gazi-antep-bld-2lig","name":"GAZİANTEP BLD.","league":"2LIG","country":"TUR","groupName":"15. GRUP"},
  1115: {"id":1115,"slug":"gazi-emi-r-bld-2lig","name":"GAZİEMİR BLD.","league":"2LIG","country":"TUR","groupName":"7. GRUP"},
  1147: {"id":1147,"slug":"gebze-gencli-k-ve-spor-2lig","name":"GEBZE GENÇLİK VE SPOR","league":"2LIG","country":"TUR","groupName":"10. GRUP"},
  1108: {"id":1108,"slug":"geli-si-m-koleji-2lig","name":"GELİŞİM KOLEJİ","league":"2LIG","country":"TUR","groupName":"7. GRUP"},
  1133: {"id":1133,"slug":"gemli-k-i-sti-klal-spor-2lig","name":"GEMLİK İSTİKLAL SPOR","league":"2LIG","country":"TUR","groupName":"9. GRUP"},
  1159: {"id":1159,"slug":"golbasi-i-ncek-spor-2lig","name":"GÖLBAŞI İNCEK SPOR","league":"2LIG","country":"TUR","groupName":"11. GRUP"},
  1101: {"id":1101,"slug":"goztepe-2lig","name":"GÖZTEPE","league":"2LIG","country":"TUR","groupName":"6. GRUP"},
  1053: {"id":1053,"slug":"gungoren-voleybol-2lig","name":"GÜNGÖREN VOLEYBOL","league":"2LIG","country":"TUR","groupName":"2. GRUP"},
  1127: {"id":1127,"slug":"gural-premier-antalyaspor-2lig","name":"GÜRAL PREMIER ANTALYASPOR","league":"2LIG","country":"TUR","groupName":"8. GRUP"},
  1163: {"id":1163,"slug":"hakan-akisik-spor-2lig","name":"HAKAN AKIŞIK SPOR","league":"2LIG","country":"TUR","groupName":"11. GRUP"},
  1217: {"id":1217,"slug":"hakkari-maemtal-2lig","name":"HAKKARİ MAEMTAL","league":"2LIG","country":"TUR","groupName":"16. GRUP"},
  1219: {"id":1219,"slug":"hakkari-sporti-f-faali-yetler-2lig","name":"HAKKARİ SPORTİF FAALİYETLER","league":"2LIG","country":"TUR","groupName":"16. GRUP"},
  1148: {"id":1148,"slug":"harput-lahmacun-yahya-kaptan-2lig","name":"HARPUT LAHMACUN YAHYA KAPTAN","league":"2LIG","country":"TUR","groupName":"10. GRUP"},
  1178: {"id":1178,"slug":"hedef-ankara-2lig","name":"HEDEF ANKARA","league":"2LIG","country":"TUR","groupName":"12. GRUP"},
  1132: {"id":1132,"slug":"heki-moglu-global-connect-travel-bvi-2lig","name":"HEKİMOĞLU GLOBAL CONNECT TRAVEL BVİ","league":"2LIG","country":"TUR","groupName":"9. GRUP"},
  1137: {"id":1137,"slug":"hoca-ahmet-yesevi-anadolu-l-es-voleybol--2lig","name":"HOCA AHMET YESEVİ ANADOLU L. ES VOLEYBOL AKADEMİ","league":"2LIG","country":"TUR","groupName":"9. GRUP"},
  1192: {"id":1192,"slug":"hopa-beledi-ye-2lig","name":"HOPA BELEDİYE","league":"2LIG","country":"TUR","groupName":"14. GRUP"},
  1124: {"id":1124,"slug":"isparta-gencli-k-spor-2lig","name":"ISPARTA GENÇLİK SPOR","league":"2LIG","country":"TUR","groupName":"8. GRUP"},
  1158: {"id":1158,"slug":"i-lbank-2lig","name":"İLBANK","league":"2LIG","country":"TUR","groupName":"11. GRUP"},
  1046: {"id":1046,"slug":"i-stanbul-bi-zi-mkent-spor-2lig","name":"İSTANBUL BİZİMKENT SPOR","league":"2LIG","country":"TUR","groupName":"1. GRUP"},
  1114: {"id":1114,"slug":"i-zmi-r-b-sehir-bld-2lig","name":"İZMİR B.ŞEHIR BLD.","league":"2LIG","country":"TUR","groupName":"7. GRUP"},
  1116: {"id":1116,"slug":"i-zmi-r-dsi-2lig","name":"İZMİR DSİ","league":"2LIG","country":"TUR","groupName":"7. GRUP"},
  1151: {"id":1151,"slug":"i-zmi-t-spor-2lig","name":"İZMİT SPOR","league":"2LIG","country":"TUR","groupName":"10. GRUP"},
  1074: {"id":1074,"slug":"kamari-n-spor-2lig","name":"KAMARİN SPOR","league":"2LIG","country":"TUR","groupName":"4. GRUP"},
  1145: {"id":1145,"slug":"karabuk-gencli-k-spor-2lig","name":"KARABÜK GENÇLİK SPOR","league":"2LIG","country":"TUR","groupName":"10. GRUP"},
  1078: {"id":1078,"slug":"kartal-anadolu-2lig","name":"KARTAL ANADOLU","league":"2LIG","country":"TUR","groupName":"4. GRUP"},
  1079: {"id":1079,"slug":"kartal-bld-2lig","name":"KARTAL BLD.","league":"2LIG","country":"TUR","groupName":"4. GRUP"},
  1169: {"id":1169,"slug":"kavak-spor-2lig","name":"KAVAK SPOR","league":"2LIG","country":"TUR","groupName":"12. GRUP"},
  1203: {"id":1203,"slug":"kayseri-ci-mnasti-k-spor-2lig","name":"KAYSERİ CİMNASTİK SPOR","league":"2LIG","country":"TUR","groupName":"15. GRUP"},
  1204: {"id":1204,"slug":"kayseri-voleybol-2lig","name":"KAYSERİ VOLEYBOL","league":"2LIG","country":"TUR","groupName":"15. GRUP"},
  1089: {"id":1089,"slug":"kirklareli-gencli-k-spor-2lig","name":"KIRKLARELİ GENÇLİK SPOR","league":"2LIG","country":"TUR","groupName":"5. GRUP"},
  1150: {"id":1150,"slug":"kocaeli-ni-comedi-a-akademi-2lig","name":"KOCAELİ NİCOMEDİA AKADEMİ","league":"2LIG","country":"TUR","groupName":"10. GRUP"},
  1153: {"id":1153,"slug":"kocaeli-voleybol-akademi-2lig","name":"KOCAELİ VOLEYBOL AKADEMİ","league":"2LIG","country":"TUR","groupName":"10. GRUP"},
  1081: {"id":1081,"slug":"kuzey-yildizlari-2lig","name":"KUZEY YILDIZLARI","league":"2LIG","country":"TUR","groupName":"4. GRUP"},
  1048: {"id":1048,"slug":"kucukcekmece-voleybol-2lig","name":"KÜÇÜKÇEKMECE VOLEYBOL","league":"2LIG","country":"TUR","groupName":"1. GRUP"},
  1103: {"id":1103,"slug":"kzy-spor-2lig","name":"KZY SPOR","league":"2LIG","country":"TUR","groupName":"6. GRUP"},
  1065: {"id":1065,"slug":"lanueva-kozmeti-k-anadolu-marmara-2lig","name":"LANUEVA KOZMETİK ANADOLU MARMARA","league":"2LIG","country":"TUR","groupName":"3. GRUP"},
  1067: {"id":1067,"slug":"mac-sayisi-2lig","name":"MAÇ SAYISI","league":"2LIG","country":"TUR","groupName":"3. GRUP"},
  1214: {"id":1214,"slug":"malatya-voleybol-2lig","name":"MALATYA VOLEYBOL","league":"2LIG","country":"TUR","groupName":"16. GRUP"},
  1213: {"id":1213,"slug":"margenc-2lig","name":"MARGENÇ","league":"2LIG","country":"TUR","groupName":"16. GRUP"},
  1130: {"id":1130,"slug":"marmari-s-bld-2lig","name":"MARMARİS BLD.","league":"2LIG","country":"TUR","groupName":"8. GRUP"},
  1084: {"id":1084,"slug":"media-first-ayvalik-geli-si-m-spor-2lig","name":"MEDIA FIRST AYVALIK GELİŞİM SPOR","league":"2LIG","country":"TUR","groupName":"5. GRUP"},
  1140: {"id":1140,"slug":"mehmet-ege-i-nsaat-i-negol-orhani-ye-vol-2lig","name":"MEHMET EGE İNŞAAT İNEGÖL ORHANİYE VOLEYBOL","league":"2LIG","country":"TUR","groupName":"9. GRUP"},
  1075: {"id":1075,"slug":"mehmet-erdem-marmara-akademi-2lig","name":"MEHMET ERDEM MARMARA AKADEMİ","league":"2LIG","country":"TUR","groupName":"4. GRUP"},
  1205: {"id":1205,"slug":"meri-nos-voleybol-2lig","name":"MERİNOS VOLEYBOL","league":"2LIG","country":"TUR","groupName":"15. GRUP"},
  1138: {"id":1138,"slug":"mg-spor-2lig","name":"MG SPOR","league":"2LIG","country":"TUR","groupName":"9. GRUP"},
  1174: {"id":1174,"slug":"misiroglu-beytepe-2lig","name":"MISIROĞLU BEYTEPE","league":"2LIG","country":"TUR","groupName":"12. GRUP"},
  1172: {"id":1172,"slug":"mke-ankaragucu-2lig","name":"MKE ANKARAGÜCÜ","league":"2LIG","country":"TUR","groupName":"12. GRUP"},
  1215: {"id":1215,"slug":"mus-oli-mpi-k-spor-2lig","name":"MUŞ OLİMPİK SPOR","league":"2LIG","country":"TUR","groupName":"16. GRUP"},
  1218: {"id":1218,"slug":"ni-cer-hotel-voleybol-2lig","name":"NİCER HOTEL VOLEYBOL","league":"2LIG","country":"TUR","groupName":"16. GRUP"},
  1139: {"id":1139,"slug":"ni-lufer-bld-2lig","name":"NİLÜFER BLD.","league":"2LIG","country":"TUR","groupName":"9. GRUP"},
  1184: {"id":1184,"slug":"okura-loji-sti-k-mersi-n-i-hti-sas-2lig","name":"OKURA LOJİSTİK MERSİN İHTİSAS","league":"2LIG","country":"TUR","groupName":"13. GRUP"},
  1196: {"id":1196,"slug":"osmancik-bld-2lig","name":"OSMANCIK BLD.","league":"2LIG","country":"TUR","groupName":"14. GRUP"},
  1109: {"id":1109,"slug":"polat-group-di-di-m-beledi-yespor-2lig","name":"POLAT GROUP DİDİM BELEDİYESPOR","league":"2LIG","country":"TUR","groupName":"7. GRUP"},
  1177: {"id":1177,"slug":"polatli-duatepe-2lig","name":"POLATLI DUATEPE","league":"2LIG","country":"TUR","groupName":"12. GRUP"},
  1166: {"id":1166,"slug":"ptt-2lig","name":"PTT","league":"2LIG","country":"TUR","groupName":"11. GRUP"},
  1200: {"id":1200,"slug":"ri-ze-endustri-meslek-li-sesi-2lig","name":"RİZE ENDÜSTRİ MESLEK LİSESİ","league":"2LIG","country":"TUR","groupName":"14. GRUP"},
  1058: {"id":1058,"slug":"roberteam-2lig","name":"ROBERTEAM","league":"2LIG","country":"TUR","groupName":"2. GRUP"},
  1112: {"id":1112,"slug":"rota-koleji-2lig","name":"ROTA KOLEJİ","league":"2LIG","country":"TUR","groupName":"7. GRUP"},
  1197: {"id":1197,"slug":"semt-asansor-bordo-mavi-61-2lig","name":"SEMT ASANSÖR BORDO MAVİ 61","league":"2LIG","country":"TUR","groupName":"14. GRUP"},
  1152: {"id":1152,"slug":"serdi-van-bld-2lig","name":"SERDİVAN BLD.","league":"2LIG","country":"TUR","groupName":"10. GRUP"},
  1182: {"id":1182,"slug":"seyhan-bld-2lig","name":"SEYHAN BLD.","league":"2LIG","country":"TUR","groupName":"13. GRUP"},
  1191: {"id":1191,"slug":"sinav-koleji-samsunspor-2lig","name":"SINAV KOLEJİ SAMSUNSPOR","league":"2LIG","country":"TUR","groupName":"14. GRUP"},
  1189: {"id":1189,"slug":"si-banet-kozan-i-mamoglu-spor-2lig","name":"SİBANET KOZAN İMAMOĞLU SPOR","league":"2LIG","country":"TUR","groupName":"13. GRUP"},
  1049: {"id":1049,"slug":"si-li-vri-cagribey-2lig","name":"SİLİVRİ ÇAĞRIBEY","league":"2LIG","country":"TUR","groupName":"1. GRUP"},
  1222: {"id":1222,"slug":"si-lopi-bld-sporti-f-faali-yetler-2lig","name":"SİLOPİ BLD. SPORTİF FAALİYETLER","league":"2LIG","country":"TUR","groupName":"16. GRUP"},
  1221: {"id":1221,"slug":"si-lopi-geli-si-m-faali-yetleri-2lig","name":"SİLOPİ GELİŞİM FAALİYETLERİ","league":"2LIG","country":"TUR","groupName":"16. GRUP"},
  1209: {"id":1209,"slug":"si-vas-toprak-gayri-menkul-pars-akademi-2lig","name":"SİVAS TOPRAK GAYRİMENKUL PARS AKADEMİ","league":"2LIG","country":"TUR","groupName":"15. GRUP"},
  1045: {"id":1045,"slug":"smac-spor-2lig","name":"SMAÇ SPOR","league":"2LIG","country":"TUR","groupName":"1. GRUP"},
  1195: {"id":1195,"slug":"smart-holding-a-s-cayeli-2lig","name":"SMART HOLDING A.Ş. ÇAYELI","league":"2LIG","country":"TUR","groupName":"14. GRUP"},
  1113: {"id":1113,"slug":"soke-beledi-ye-saldos-voleybol-2lig","name":"SÖKE BELEDİYE SALDOS VOLEYBOL","league":"2LIG","country":"TUR","groupName":"7. GRUP"},
  1193: {"id":1193,"slug":"superpool-findikli-1974-2lig","name":"SUPERPOOL FINDIKLI 1974","league":"2LIG","country":"TUR","groupName":"14. GRUP"},
  1181: {"id":1181,"slug":"tarsus-ameri-kan-koleji-2lig","name":"TARSUS AMERİKAN KOLEJİ","league":"2LIG","country":"TUR","groupName":"13. GRUP"},
  1175: {"id":1175,"slug":"ted-ankara-kolejli-ler-2lig","name":"TED ANKARA KOLEJLİLER","league":"2LIG","country":"TUR","groupName":"12. GRUP"},
  1161: {"id":1161,"slug":"tek-metal-sporti-f-2lig","name":"TEK METAL SPORTİF","league":"2LIG","country":"TUR","groupName":"11. GRUP"},
  1091: {"id":1091,"slug":"teki-rdag-voleybol-i-hti-sas-2lig","name":"TEKİRDAĞ VOLEYBOL İHTİSAS","league":"2LIG","country":"TUR","groupName":"5. GRUP"},
  1156: {"id":1156,"slug":"temi-z-enerji-birli-gi-2lig","name":"TEMİZ ENERJİ BIRLİĞİ","league":"2LIG","country":"TUR","groupName":"11. GRUP"},
  1188: {"id":1188,"slug":"toros-universi-tesi-volgem-2lig","name":"TOROS ÜNIVERSİTESİ VOLGEM","league":"2LIG","country":"TUR","groupName":"13. GRUP"},
  1186: {"id":1186,"slug":"toroslar-bld-2lig","name":"TOROSLAR BLD.","league":"2LIG","country":"TUR","groupName":"13. GRUP"},
  1073: {"id":1073,"slug":"toyzz-shop-di-namo-spor-2lig","name":"TOYZZ SHOP DİNAMO SPOR","league":"2LIG","country":"TUR","groupName":"4. GRUP"},
  1105: {"id":1105,"slug":"turgutlu-bld-kultur-sanat-2lig","name":"TURGUTLU BLD. KÜLTÜR SANAT","league":"2LIG","country":"TUR","groupName":"6. GRUP"},
  1076: {"id":1076,"slug":"tuzla-mercan-2lig","name":"TUZLA MERCAN","league":"2LIG","country":"TUR","groupName":"4. GRUP"},
  1043: {"id":1043,"slug":"turk-hava-yollari-2lig","name":"TÜRK HAVA YOLLARI","league":"2LIG","country":"TUR","groupName":"1. GRUP"},
  1094: {"id":1094,"slug":"turkoglu-spor-kulubu-2lig","name":"TÜRKOĞLU SPOR KULÜBÜ","league":"2LIG","country":"TUR","groupName":"6. GRUP"},
  1162: {"id":1162,"slug":"tvf-spor-li-sesi-2lig","name":"TVF SPOR LİSESİ","league":"2LIG","country":"TUR","groupName":"11. GRUP"},
  1128: {"id":1128,"slug":"uysallar-oto-fethi-ye-zi-rve-2lig","name":"UYSALLAR OTO FETHİYE ZİRVE","league":"2LIG","country":"TUR","groupName":"8. GRUP"},
  1110: {"id":1110,"slug":"ulku-spor-2lig","name":"ÜLKÜ SPOR","league":"2LIG","country":"TUR","groupName":"7. GRUP"},
  1051: {"id":1051,"slug":"unsped-2lig","name":"ÜNSPED","league":"2LIG","country":"TUR","groupName":"2. GRUP"},
  1060: {"id":1060,"slug":"vefa-2lig","name":"VEFA","league":"2LIG","country":"TUR","groupName":"2. GRUP"},
  1117: {"id":1117,"slug":"venus-spor-2lig","name":"VENÜS SPOR","league":"2LIG","country":"TUR","groupName":"7. GRUP"},
  1207: {"id":1207,"slug":"vi-ransehi-r-voleybol-2lig","name":"VİRANŞEHİR VOLEYBOL","league":"2LIG","country":"TUR","groupName":"15. GRUP"},
  1119: {"id":1119,"slug":"volkan-guc-spor-2lig","name":"VOLKAN GÜÇ SPOR","league":"2LIG","country":"TUR","groupName":"7. GRUP"},
  1063: {"id":1063,"slug":"world-medicine-ates-spor-2lig","name":"WORLD MEDICINE ATEŞ SPOR","league":"2LIG","country":"TUR","groupName":"3. GRUP"},
  1141: {"id":1141,"slug":"yalova-ci-ftli-kkoy-bld-2lig","name":"YALOVA ÇİFTLİKKÖY BLD.","league":"2LIG","country":"TUR","groupName":"9. GRUP"},
  1171: {"id":1171,"slug":"yedi-dag-spor-2lig","name":"YEDİDAĞ SPOR","league":"2LIG","country":"TUR","groupName":"12. GRUP"},
  1057: {"id":1057,"slug":"yeni-ay-loji-sti-k-sariyer-konak-spor-2lig","name":"YENİAY LOJİSTİK SARIYER KONAK SPOR","league":"2LIG","country":"TUR","groupName":"2. GRUP"},
  1088: {"id":1088,"slug":"yesi-l-bayrami-c-2lig","name":"YEŞİL BAYRAMİÇ","league":"2LIG","country":"TUR","groupName":"5. GRUP"},
  1059: {"id":1059,"slug":"yesi-lyurt-2lig","name":"YEŞİLYURT","league":"2LIG","country":"TUR","groupName":"2. GRUP"},
  1100: {"id":1100,"slug":"yunusemre-bld-2lig","name":"YUNUSEMRE BLD.","league":"2LIG","country":"TUR","groupName":"6. GRUP"},
  1202: {"id":1202,"slug":"zeugma-gazi-antep-spor-2lig","name":"ZEUGMA GAZİANTEP SPOR","league":"2LIG","country":"TUR","groupName":"15. GRUP"},
  1235: {"id":1235,"slug":"a-carraro-prosecco-doc-conegliano-cev-cl","name":"A. Carraro Prosecco DOC CONEGLIANO","league":"CEV_CL","country":null,"groupName":"Pool D"},
  1236: {"id":1236,"slug":"ankara-zeren-spor-kulubu-cev-cl","name":"ANKARA Zeren Spor Kulübü","league":"CEV_CL","country":null,"groupName":"Pool D"},
  1225: {"id":1225,"slug":"cs-volei-alba-blaj-cev-cl","name":"CS Volei Alba BLAJ","league":"CEV_CL","country":null,"groupName":"Pool A"},
  1237: {"id":1237,"slug":"dresdner-sc-cev-cl","name":"DRESDNER SC","league":"CEV_CL","country":null,"groupName":"Pool D"},
  1232: {"id":1232,"slug":"eczacibasi-istanbul-cev-cl","name":"Eczacibasi ISTANBUL","league":"CEV_CL","country":null,"groupName":"Pool C"},
  1227: {"id":1227,"slug":"fenerbahce-medicana-istanbul-cev-cl","name":"Fenerbahçe Medicana ISTANBUL","league":"CEV_CL","country":null,"groupName":"Pool B"},
  1228: {"id":1228,"slug":"igor-gorgonzola-novara-cev-cl","name":"Igor Gorgonzola NOVARA","league":"CEV_CL","country":null,"groupName":"Pool B"},
  1240: {"id":1240,"slug":"ks-developres-rzesz-w-cev-cl","name":"KS Developres RZESZÓW","league":"CEV_CL","country":null,"groupName":"Pool E"},
  1241: {"id":1241,"slug":"levallois-paris-saint-cloud-cev-cl","name":"LEVALLOIS PARIS Saint Cloud","league":"CEV_CL","country":null,"groupName":"Pool E"},
  1238: {"id":1238,"slug":"ks-commercecon-d-cev-cl","name":"ŁKS Commercecon ŁÓDŹ","league":"CEV_CL","country":null,"groupName":"Pool D"},
  1242: {"id":1242,"slug":"maritza-plovdiv-cev-cl","name":"Maritza PLOVDIV","league":"CEV_CL","country":null,"groupName":"Pool E"},
  1231: {"id":1231,"slug":"numia-vero-volley-milano-cev-cl","name":"Numia Vero Volley MILANO","league":"CEV_CL","country":null,"groupName":"Pool C"},
  1234: {"id":1234,"slug":"ok-elezni-ar-lajkovac-cev-cl","name":"OK Železničar LAJKOVAC","league":"CEV_CL","country":null,"groupName":"Pool C"},
  1233: {"id":1233,"slug":"olympiacos-piraeus-cev-cl","name":"Olympiacos PIRAEUS","league":"CEV_CL","country":null,"groupName":"Pool C"},
  1230: {"id":1230,"slug":"pge-budowlani-d-cev-cl","name":"PGE Budowlani ŁÓDŹ","league":"CEV_CL","country":null,"groupName":"Pool B"},
  1223: {"id":1223,"slug":"savino-del-bene-scandicci-cev-cl","name":"Savino Del Bene SCANDICCI","league":"CEV_CL","country":null,"groupName":"Pool A"},
  1229: {"id":1229,"slug":"sport-lisboa-e-benfica-cev-cl","name":"Sport LISBOA e Benfica","league":"CEV_CL","country":null,"groupName":"Pool B"},
  1239: {"id":1239,"slug":"ssc-palmberg-schwerin-cev-cl","name":"SSC Palmberg SCHWERIN","league":"CEV_CL","country":null,"groupName":"Pool E"},
  1224: {"id":1224,"slug":"vakifbank-istanbul-cev-cl","name":"VakifBank ISTANBUL","league":"CEV_CL","country":null,"groupName":"Pool A"},
  1226: {"id":1226,"slug":"volero-le-cannet-cev-cl","name":"Volero LE CANNET","league":"CEV_CL","country":null,"groupName":"Pool A"},
  1266: {"id":1266,"slug":"ac-paok-thessaloniki-cev-cup","name":"AC PAOK THESSALONIKI","league":"CEV_CUP","country":"GRE","groupName":null},
  1245: {"id":1245,"slug":"allianz-mtv-stuttgart-cev-cup","name":"Allianz MTV STUTTGART","league":"CEV_CUP","country":"GER","groupName":null},
  1260: {"id":1260,"slug":"asterix-avo-beveren-cev-cup","name":"Asterix Avo BEVEREN","league":"CEV_CUP","country":"BEL","groupName":null},
  1268: {"id":1268,"slug":"avarca-de-menorca-cev-cup","name":"Avarca de MENORCA","league":"CEV_CUP","country":"ESP","groupName":null},
  1252: {"id":1252,"slug":"bks-bostik-bielsko-bia-a-cev-cup","name":"BKS Bostik BIELSKO-BIAŁA","league":"CEV_CUP","country":"POL","groupName":null},
  1247: {"id":1247,"slug":"c-s-o-voluntari-2005-cev-cup","name":"C.S.O. VOLUNTARI 2005","league":"CEV_CUP","country":"ROU","groupName":null},
  1267: {"id":1267,"slug":"cd-heidelberg-las-palmas-cev-cup","name":"CD Heidelberg LAS PALMAS","league":"CEV_CUP","country":"ESP","groupName":null},
  1259: {"id":1259,"slug":"darta-bevo-roeselare-cev-cup","name":"Darta Bevo ROESELARE","league":"CEV_CUP","country":"BEL","groupName":null},
  1248: {"id":1248,"slug":"dinamo-bucuresti-cev-cup","name":"Dinamo BUCURESTI","league":"CEV_CUP","country":"ROU","groupName":null},
  1265: {"id":1265,"slug":"dukla-liberec-cev-cup","name":"Dukla LIBEREC","league":"CEV_CUP","country":"CZE","groupName":null},
  1261: {"id":1261,"slug":"fc-porto-cev-cup","name":"FC PORTO","league":"CEV_CUP","country":"POR","groupName":null},
  1243: {"id":1243,"slug":"galatasaray-daikin-istanbul-cev-cup","name":"Galatasaray Daikin ISTANBUL","league":"CEV_CUP","country":"TUR","groupName":null},
  1273: {"id":1273,"slug":"janta-volej-kisela-voda-cev-cup","name":"Janta Volej KISELA VODA","league":"CEV_CUP","country":"MKD","groupName":null},
  1255: {"id":1255,"slug":"mbh-b-k-scsaba-cev-cup","name":"MBH - BÉKÉSCSABA","league":"CEV_CUP","country":"HUN","groupName":null},
  1257: {"id":1257,"slug":"mladost-zagreb-cev-cup","name":"Mladost ZAGREB","league":"CEV_CUP","country":"CRO","groupName":null},
  1253: {"id":1253,"slug":"moya-radomka-radom-cev-cup","name":"MOYA Radomka RADOM","league":"CEV_CUP","country":"POL","groupName":null},
  1258: {"id":1258,"slug":"ok-dinamo-zagreb-cev-cup","name":"OK Dinamo ZAGREB","league":"CEV_CUP","country":"CRO","groupName":null},
  1254: {"id":1254,"slug":"otp-banka-branik-maribor-cev-cup","name":"OTP Banka Branik MARIBOR","league":"CEV_CUP","country":"SLO","groupName":null},
  1249: {"id":1249,"slug":"reale-mutua-fenera-chieri-76-cev-cup","name":"Reale Mutua Fenera CHIERI'76","league":"CEV_CUP","country":"ITA","groupName":null},
  1262: {"id":1262,"slug":"sporting-cp-lisboa-cev-cup","name":"Sporting CP LISBOA","league":"CEV_CUP","country":"POR","groupName":null},
  1269: {"id":1269,"slug":"tent-obrenovac-cev-cup","name":"Tent OBRENOVAC","league":"CEV_CUP","country":"SRB","groupName":null},
  1244: {"id":1244,"slug":"thy-istanbul-cev-cup","name":"THY ISTANBUL","league":"CEV_CUP","country":"TUR","groupName":null},
  1251: {"id":1251,"slug":"vandoeuvre-nancy-vb-cev-cup","name":"Vandoeuvre NANCY VB","league":"CEV_CUP","country":"FRA","groupName":null},
  1256: {"id":1256,"slug":"vasas-buda-budapest-cev-cup","name":"Vasas Óbuda BUDAPEST","league":"CEV_CUP","country":"HUN","groupName":null},
  1246: {"id":1246,"slug":"vfb-suhl-thuringen-cev-cup","name":"VfB SUHL Thüringen","league":"CEV_CUP","country":"GER","groupName":null},
  1263: {"id":1263,"slug":"viteos-neuchatel-uc-cev-cup","name":"Viteos NEUCHATEL UC","league":"CEV_CUP","country":"SUI","groupName":null},
  1264: {"id":1264,"slug":"vk-up-olomouc-cev-cup","name":"VK UP OLOMOUC","league":"CEV_CUP","country":"CZE","groupName":null},
  1250: {"id":1250,"slug":"volley-mulhouse-alsace-cev-cup","name":"Volley MULHOUSE Alsace","league":"CEV_CUP","country":"FRA","groupName":null},
  1272: {"id":1272,"slug":"ok-gacko-rd-swisslion-cev-cup","name":"ŽOK GACKO RD Swisslion","league":"CEV_CUP","country":"BIH","groupName":null},
  1271: {"id":1271,"slug":"ok-ribola-ka-tela-cev-cup","name":"ŽOK Ribola KAŠTELA","league":"CEV_CUP","country":"CRO","groupName":null},
  1270: {"id":1270,"slug":"zok-ub-cev-cup","name":"ZOK UB","league":"CEV_CUP","country":"SRB","groupName":null},
  1274: {"id":1274,"slug":"aek-athens-cev-challenge","name":"AEK ATHENS","league":"CEV_CHALLENGE","country":null,"groupName":null},
  1318: {"id":1318,"slug":"aek-athens-gre-cev-challenge","name":"AEK ATHENS GRE","league":"CEV_CHALLENGE","country":null,"groupName":null},
  1294: {"id":1294,"slug":"ao-thiras-cev-challenge","name":"AO THIRAS","league":"CEV_CHALLENGE","country":null,"groupName":null},
  1338: {"id":1338,"slug":"ao-thiras-gre-cev-challenge","name":"AO THIRAS GRE","league":"CEV_CHALLENGE","country":null,"groupName":null},
  1301: {"id":1301,"slug":"buducnost-podgorica-cev-challenge","name":"Buducnost PODGORICA","league":"CEV_CHALLENGE","country":null,"groupName":null},
  1345: {"id":1345,"slug":"buducnost-podgorica-mne-cev-challenge","name":"Buducnost PODGORICA MNE","league":"CEV_CHALLENGE","country":null,"groupName":null},
  1287: {"id":1287,"slug":"c-s-m-lugoj-cev-challenge","name":"C.S.M LUGOJ","league":"CEV_CHALLENGE","country":null,"groupName":null},
  1331: {"id":1331,"slug":"c-s-m-lugoj-rou-cev-challenge","name":"C.S.M LUGOJ ROU","league":"CEV_CHALLENGE","country":null,"groupName":null},
  1279: {"id":1279,"slug":"draisma-dynamo-apeldoorn-cev-challenge","name":"Draisma Dynamo APELDOORN","league":"CEV_CHALLENGE","country":null,"groupName":null},
  1323: {"id":1323,"slug":"draisma-dynamo-apeldoorn-ned-cev-challenge","name":"Draisma Dynamo APELDOORN NED","league":"CEV_CHALLENGE","country":null,"groupName":null},
  1306: {"id":1306,"slug":"erzbergm-trofaiach-eisenerz-cev-challenge","name":"Erzbergm TROFAIACH EISENERZ","league":"CEV_CHALLENGE","country":null,"groupName":null},
  1350: {"id":1350,"slug":"erzbergm-trofaiach-eisenerz-aut-cev-challenge","name":"Erzbergm TROFAIACH EISENERZ AUT","league":"CEV_CHALLENGE","country":null,"groupName":null},
  1296: {"id":1296,"slug":"fatum-ny-regyh-za-cev-challenge","name":"Fatum NYÍREGYHÁZA","league":"CEV_CHALLENGE","country":null,"groupName":null},
  1340: {"id":1340,"slug":"fatum-ny-regyh-za-hun-cev-challenge","name":"Fatum NYÍREGYHÁZA HUN","league":"CEV_CHALLENGE","country":null,"groupName":null},
  1293: {"id":1293,"slug":"fleyr-t-rshavn-cev-challenge","name":"Fleyr TÓRSHAVN","league":"CEV_CHALLENGE","country":null,"groupName":null},
  1337: {"id":1337,"slug":"fleyr-t-rshavn-far-cev-challenge","name":"Fleyr TÓRSHAVN FAR","league":"CEV_CHALLENGE","country":null,"groupName":null},
  1286: {"id":1286,"slug":"friso-sneek-cev-challenge","name":"Friso SNEEK","league":"CEV_CHALLENGE","country":null,"groupName":null},
  1330: {"id":1330,"slug":"friso-sneek-ned-cev-challenge","name":"Friso SNEEK NED","league":"CEV_CHALLENGE","country":null,"groupName":null},
  1282: {"id":1282,"slug":"fundaci-n-cajasol-andaluc-a-cev-challenge","name":"Fundación Cajasol ANDALUCÍA","league":"CEV_CHALLENGE","country":null,"groupName":null},
  1326: {"id":1326,"slug":"fundaci-n-cajasol-andaluc-a-esp-cev-challenge","name":"Fundación Cajasol ANDALUCÍA ESP","league":"CEV_CHALLENGE","country":null,"groupName":null},
  1295: {"id":1295,"slug":"gs-panionios-nea-smyrni-cev-challenge","name":"GS Panionios NEA SMYRNI","league":"CEV_CHALLENGE","country":null,"groupName":null},
  1339: {"id":1339,"slug":"gs-panionios-nea-smyrni-gre-cev-challenge","name":"GS Panionios NEA SMYRNI GRE","league":"CEV_CHALLENGE","country":null,"groupName":null},
  1275: {"id":1275,"slug":"gzok-srem-sremska-mitrovica-cev-challenge","name":"GZOK Srem SREMSKA MITROVICA","league":"CEV_CHALLENGE","country":null,"groupName":null},
  1319: {"id":1319,"slug":"gzok-srem-sremska-mitrovica-srb-cev-challenge","name":"GZOK Srem SREMSKA MITROVICA SRB","league":"CEV_CHALLENGE","country":null,"groupName":null},
  1281: {"id":1281,"slug":"holte-if-cev-challenge","name":"HOLTE IF","league":"CEV_CHALLENGE","country":null,"groupName":null},
  1325: {"id":1325,"slug":"holte-if-den-cev-challenge","name":"HOLTE IF DEN","league":"CEV_CHALLENGE","country":null,"groupName":null},
  1298: {"id":1298,"slug":"kaunas-vdu-cev-challenge","name":"KAUNAS VDU","league":"CEV_CHALLENGE","country":null,"groupName":null},
  1342: {"id":1342,"slug":"kaunas-vdu-ltu-cev-challenge","name":"KAUNAS VDU LTU","league":"CEV_CHALLENGE","country":null,"groupName":null},
  1291: {"id":1291,"slug":"kv-fer-volley-ferizaj-cev-challenge","name":"KV Fer Volley FERIZAJ","league":"CEV_CHALLENGE","country":null,"groupName":null},
  1335: {"id":1335,"slug":"kv-fer-volley-ferizaj-kos-cev-challenge","name":"KV Fer Volley FERIZAJ KOS","league":"CEV_CHALLENGE","country":null,"groupName":null},
  1289: {"id":1289,"slug":"levski-sofia-cev-challenge","name":"Levski SOFIA","league":"CEV_CHALLENGE","country":null,"groupName":null},
  1333: {"id":1333,"slug":"levski-sofia-bul-cev-challenge","name":"Levski SOFIA BUL","league":"CEV_CHALLENGE","country":null,"groupName":null},
  1297: {"id":1297,"slug":"lp-salo-cev-challenge","name":"LP SALO","league":"CEV_CHALLENGE","country":null,"groupName":null},
  1341: {"id":1341,"slug":"lp-salo-fin-cev-challenge","name":"LP SALO FIN","league":"CEV_CHALLENGE","country":null,"groupName":null},
  1277: {"id":1277,"slug":"nakovski-volej-strumica-cev-challenge","name":"Nakovski Volej STRUMICA","league":"CEV_CHALLENGE","country":null,"groupName":null},
  1321: {"id":1321,"slug":"nakovski-volej-strumica-mkd-cev-challenge","name":"Nakovski Volej STRUMICA MKD","league":"CEV_CHALLENGE","country":null,"groupName":null},
  1300: {"id":1300,"slug":"ocisa-haro-rioja-cev-challenge","name":"Ocisa HARO Rioja","league":"CEV_CHALLENGE","country":null,"groupName":null},
  1344: {"id":1344,"slug":"ocisa-haro-rioja-esp-cev-challenge","name":"Ocisa HARO Rioja ESP","league":"CEV_CHALLENGE","country":null,"groupName":null},
  1284: {"id":1284,"slug":"ok-brda-split-cev-challenge","name":"OK BRDA SPLIT","league":"CEV_CHALLENGE","country":null,"groupName":null},
  1328: {"id":1328,"slug":"ok-brda-split-cro-cev-challenge","name":"OK BRDA SPLIT CRO","league":"CEV_CHALLENGE","country":null,"groupName":null},
  1299: {"id":1299,"slug":"ksyl-myre-cev-challenge","name":"Øksyl MYRE","league":"CEV_CHALLENGE","country":null,"groupName":null},
  1343: {"id":1343,"slug":"ksyl-myre-nor-cev-challenge","name":"Øksyl MYRE NOR","league":"CEV_CHALLENGE","country":null,"groupName":null},
  1285: {"id":1285,"slug":"olympiada-neapolis-nicosia-cev-challenge","name":"Olympiada Neapolis NICOSIA","league":"CEV_CHALLENGE","country":null,"groupName":null},
  1329: {"id":1329,"slug":"olympiada-neapolis-nicosia-cyp-cev-challenge","name":"Olympiada Neapolis NICOSIA CYP","league":"CEV_CHALLENGE","country":null,"groupName":null},
  1302: {"id":1302,"slug":"rabotnicki-skopje-cev-challenge","name":"Rabotnicki SKOPJE","league":"CEV_CHALLENGE","country":null,"groupName":null},
  1346: {"id":1346,"slug":"rabotnicki-skopje-mkd-cev-challenge","name":"Rabotnicki SKOPJE MKD","league":"CEV_CHALLENGE","country":null,"groupName":null},
  1303: {"id":1303,"slug":"rae-spordikool-viaston-juri-cev-challenge","name":"RAE Spordikool Viaston JÜRI","league":"CEV_CHALLENGE","country":null,"groupName":null},
  1347: {"id":1347,"slug":"rae-spordikool-viaston-juri-est-cev-challenge","name":"RAE Spordikool Viaston JÜRI EST","league":"CEV_CHALLENGE","country":null,"groupName":null},
  1307: {"id":1307,"slug":"sc-balta-cev-challenge","name":"SC BALTA","league":"CEV_CHALLENGE","country":null,"groupName":null},
  1351: {"id":1351,"slug":"sc-balta-ukr-cev-challenge","name":"SC BALTA UKR","league":"CEV_CHALLENGE","country":null,"groupName":null},
  1292: {"id":1292,"slug":"tchalou-chapelle-lez-herlaimont-cev-challenge","name":"Tchalou CHAPELLE-LEZ-HERLAIMONT","league":"CEV_CHALLENGE","country":null,"groupName":null},
  1336: {"id":1336,"slug":"tchalou-chapelle-lez-herlaimont-bel-cev-challenge","name":"Tchalou CHAPELLE-LEZ-HERLAIMONT BEL","league":"CEV_CHALLENGE","country":null,"groupName":null},
  1305: {"id":1305,"slug":"tif-viking-bergen-cev-challenge","name":"TIF Viking BERGEN","league":"CEV_CHALLENGE","country":null,"groupName":null},
  1349: {"id":1349,"slug":"tif-viking-bergen-nor-cev-challenge","name":"TIF Viking BERGEN NOR","league":"CEV_CHALLENGE","country":null,"groupName":null},
  1276: {"id":1276,"slug":"tj-ostrava-cev-challenge","name":"TJ OSTRAVA","league":"CEV_CHALLENGE","country":null,"groupName":null},
  1320: {"id":1320,"slug":"tj-ostrava-cze-cev-challenge","name":"TJ OSTRAVA CZE","league":"CEV_CHALLENGE","country":null,"groupName":null},
  1280: {"id":1280,"slug":"va-uniza-zilina-cev-challenge","name":"VA Uniza ZILINA","league":"CEV_CHALLENGE","country":null,"groupName":null},
  1324: {"id":1324,"slug":"va-uniza-zilina-svk-cev-challenge","name":"VA Uniza ZILINA SVK","league":"CEV_CHALLENGE","country":null,"groupName":null},
  1288: {"id":1288,"slug":"vbc-cheseaux-cev-challenge","name":"VBC CHESEAUX","league":"CEV_CHALLENGE","country":null,"groupName":null},
  1332: {"id":1332,"slug":"vbc-cheseaux-sui-cev-challenge","name":"VBC CHESEAUX SUI","league":"CEV_CHALLENGE","country":null,"groupName":null},
  1304: {"id":1304,"slug":"vk-pirane-brusno-cev-challenge","name":"VK Pirane BRUSNO","league":"CEV_CHALLENGE","country":null,"groupName":null},
  1348: {"id":1348,"slug":"vk-pirane-brusno-svk-cev-challenge","name":"VK Pirane BRUSNO SVK","league":"CEV_CHALLENGE","country":null,"groupName":null},
  1278: {"id":1278,"slug":"vk-prostejov-cev-challenge","name":"VK PROSTEJOV","league":"CEV_CHALLENGE","country":null,"groupName":null},
  1322: {"id":1322,"slug":"vk-prostejov-cze-cev-challenge","name":"VK PROSTEJOV CZE","league":"CEV_CHALLENGE","country":null,"groupName":null},
  1283: {"id":1283,"slug":"vk-slovan-bratislava-cev-challenge","name":"VK Slovan BRATISLAVA","league":"CEV_CHALLENGE","country":null,"groupName":null},
  1327: {"id":1327,"slug":"vk-slovan-bratislava-svk-cev-challenge","name":"VK Slovan BRATISLAVA SVK","league":"CEV_CHALLENGE","country":null,"groupName":null},
  1290: {"id":1290,"slug":"volley-dudingen-cev-challenge","name":"Volley DÜDINGEN","league":"CEV_CHALLENGE","country":null,"groupName":null},
  1334: {"id":1334,"slug":"volley-dudingen-sui-cev-challenge","name":"Volley DÜDINGEN SUI","league":"CEV_CHALLENGE","country":null,"groupName":null},
  1308: {"id":1308,"slug":"winner-chcm-67-68-cev-challenge","name":"Winner CHCM 67/68","league":"CEV_CHALLENGE","country":null,"groupName":null},
  1309: {"id":1309,"slug":"winner-chcw-69-70-cev-challenge","name":"Winner CHCW 69/70","league":"CEV_CHALLENGE","country":null,"groupName":null},
  1310: {"id":1310,"slug":"winner-chcw-71-72-cev-challenge","name":"Winner CHCW 71/72","league":"CEV_CHALLENGE","country":null,"groupName":null},
  1311: {"id":1311,"slug":"winner-chcw-73-74-cev-challenge","name":"Winner CHCW 73/74","league":"CEV_CHALLENGE","country":null,"groupName":null},
  1312: {"id":1312,"slug":"winner-chcw-75-76-cev-challenge","name":"Winner CHCW 75/76","league":"CEV_CHALLENGE","country":null,"groupName":null},
  1313: {"id":1313,"slug":"winner-chcw-77-78-cev-challenge","name":"Winner CHCW 77/78","league":"CEV_CHALLENGE","country":null,"groupName":null},
  1314: {"id":1314,"slug":"winner-chcw-79-80-cev-challenge","name":"Winner CHCW 79/80","league":"CEV_CHALLENGE","country":null,"groupName":null},
  1315: {"id":1315,"slug":"winner-chcw-81-82-cev-challenge","name":"Winner CHCW 81/82","league":"CEV_CHALLENGE","country":null,"groupName":null},
  1316: {"id":1316,"slug":"winner-chcw-91-92-cev-challenge","name":"Winner CHCW 91/92","league":"CEV_CHALLENGE","country":null,"groupName":null},
  1317: {"id":1317,"slug":"winner-chcw-93-94-cev-challenge","name":"Winner CHCW 93/94","league":"CEV_CHALLENGE","country":null,"groupName":null}
};

export type ClubId = 
  | 'CLUB_FENERBAHCE'
  | 'CLUB_GALATASARAY'
  | 'CLUB_BESIKTAS'
  | 'CLUB_ECZACIBASI'
  | 'CLUB_VAKIFBANK'
  | 'CLUB_THY'
  | 'CLUB_ZEREN'
  | 'CLUB_ILBANK'
  | 'CLUB_AYDIN_BSB'
  | 'CLUB_BAHCELIEVLER'
  | 'CLUB_GOZTEPE'
  | 'CLUB_DENIZLI_BSB'
  | 'CLUB_KARSIYAKA'
  | 'CLUB_MERINOS'
  | 'CLUB_PTT'
  | 'CLUB_YESILYURT'
  | 'CLUB_NILUFER'
  | 'CLUB_KUZEYBORU'
  | 'CLUB_ARAS_KARGO'
  | 'CLUB_BURSA_BSB'
  | 'CLUB_IZMIR_BSB'
  | 'CLUB_ISTANBULBBSK'
  | null;

export const CLUBS: Record<string, { clubId: ClubId; teams: TeamId[] }> = {
  'CLUB_ARAS_KARGO': { clubId: 'CLUB_ARAS_KARGO', teams: [1000] },
  'CLUB_AYDIN_BSB': { clubId: 'CLUB_AYDIN_BSB', teams: [1001, 1111] },
  'CLUB_BAHCELIEVLER': { clubId: 'CLUB_BAHCELIEVLER', teams: [1002, 1052] },
  'CLUB_BESIKTAS': { clubId: 'CLUB_BESIKTAS', teams: [1003, 1055] },
  'CLUB_ECZACIBASI': { clubId: 'CLUB_ECZACIBASI', teams: [1004, 1016, 1232] },
  'CLUB_FENERBAHCE': { clubId: 'CLUB_FENERBAHCE', teams: [1005, 1014, 1072, 1227] },
  'CLUB_GALATASARAY': { clubId: 'CLUB_GALATASARAY', teams: [1006, 1070, 1243] },
  'CLUB_GOZTEPE': { clubId: 'CLUB_GOZTEPE', teams: [1007, 1101] },
  'CLUB_ILBANK': { clubId: 'CLUB_ILBANK', teams: [1013, 1028, 1158] },
  'CLUB_KUZEYBORU': { clubId: 'CLUB_KUZEYBORU', teams: [1008, 1026] },
  'CLUB_NILUFER': { clubId: 'CLUB_NILUFER', teams: [1009, 1139] },
  'CLUB_THY': { clubId: 'CLUB_THY', teams: [1010, 1043, 1244] },
  'CLUB_VAKIFBANK': { clubId: 'CLUB_VAKIFBANK', teams: [1011, 1019, 1224] },
  'CLUB_ZEREN': { clubId: 'CLUB_ZEREN', teams: [1012, 1030, 1236] },
  'CLUB_DENIZLI_BSB': { clubId: 'CLUB_DENIZLI_BSB', teams: [1017, 1125] },
  'CLUB_KARSIYAKA': { clubId: 'CLUB_KARSIYAKA', teams: [1022, 1118] },
  'CLUB_ISTANBULBBSK': { clubId: 'CLUB_ISTANBULBBSK', teams: [1018] },
  'CLUB_MERINOS': { clubId: 'CLUB_MERINOS', teams: [1031, 1205] },
  'CLUB_PTT': { clubId: 'CLUB_PTT', teams: [1037, 1166] },
  'CLUB_YESILYURT': { clubId: 'CLUB_YESILYURT', teams: [1020, 1059] },
  'CLUB_BURSA_BSB': { clubId: 'CLUB_BURSA_BSB', teams: [1136] }
};

```

## File: app\utils\teamSlug.ts
```typescript
/**
 * Team Slug Utility
 * Generates URL-safe slugs from team names and provides reverse lookup
 */

// Turkish character normalization map
const turkishCharMap: Record<string, string> = {
    'ş': 's', 'Ş': 'S',
    'ğ': 'g', 'Ğ': 'G',
    'ü': 'u', 'Ü': 'U',
    'ö': 'o', 'Ö': 'O',
    'ç': 'c', 'Ç': 'C',
    'ı': 'i', 'İ': 'I',
};

// Store for reverse lookup (populated as teams are encountered)
const slugToNameMap = new Map<string, string>();

/**
 * Normalize Turkish characters to ASCII equivalents
 */
function normalizeTurkish(str: string): string {
    return str.split('').map(char => turkishCharMap[char] || char).join('');
}

/**
 * Generate a URL-safe slug from a team name
 * Example: "Fenerbahçe Medicana" -> "fenerbahce-medicana"
 */
export function generateTeamSlug(teamName: string): string {
    const normalized = normalizeTurkish(teamName);
    const slug = normalized
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
        .replace(/\s+/g, '-')          // Replace spaces with hyphens
        .replace(/-+/g, '-')           // Remove consecutive hyphens
        .replace(/^-|-$/g, '');        // Remove leading/trailing hyphens

    // Store for reverse lookup
    slugToNameMap.set(slug, teamName);

    return slug;
}

/**
 * Get the original team name from a slug
 * Returns null if the slug hasn't been registered
 */
export function getTeamNameFromSlug(slug: string): string | null {
    return slugToNameMap.get(slug) || null;
}

/**
 * Register a team name for reverse lookup without generating a new slug
 * Useful for pre-populating the map with known teams
 */
export function registerTeamSlug(teamName: string): void {
    generateTeamSlug(teamName);
}

/**
 * Check if a slug is registered
 */
export function isSlugRegistered(slug: string): boolean {
    return slugToNameMap.has(slug);
}

```

## File: app\utils\useFetch.ts
```typescript
"use client";

import { useCallback, useState } from "react";

interface FetchOptions extends RequestInit {
    retries?: number;
    retryDelay?: number;
}

interface UseFetchReturn<T> {
    data: T | null;
    error: string | null;
    loading: boolean;
    execute: (url: string, options?: FetchOptions) => Promise<T | null>;
    retry: () => Promise<T | null>;
}

/**
 * Custom hook for data fetching with automatic retry and error handling.
 * 
 * @example
 * const { data, error, loading, execute, retry } = useFetch<TeamStats[]>();
 * 
 * useEffect(() => {
 *   execute('/api/scrape');
 * }, []);
 */
export function useFetch<T>(): UseFetchReturn<T> {
    const [data, setData] = useState<T | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [lastRequest, setLastRequest] = useState<{ url: string; options?: FetchOptions } | null>(null);

    const execute = useCallback(async (url: string, options?: FetchOptions): Promise<T | null> => {
        const { retries = 3, retryDelay = 1000, ...fetchOptions } = options || {};

        setLoading(true);
        setError(null);
        setLastRequest({ url, options });

        let lastError: Error | null = null;

        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const fullUrl = (apiUrl && url.startsWith('/api'))
            ? url.replace('/api', apiUrl)
            : url;

        for (let attempt = 0; attempt <= retries; attempt++) {
            try {
                const response = await fetch(fullUrl, fetchOptions);

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const result = await response.json();
                setData(result);
                setLoading(false);
                return result;
            } catch (err) {
                lastError = err instanceof Error ? err : new Error(String(err));

                if (attempt < retries) {
                    // Wait before retrying
                    await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
                }
            }
        }

        // All retries failed
        const errorMessage = lastError?.message || "Bilinmeyen hata";
        setError(errorMessage);
        setLoading(false);
        return null;
    }, []);

    const retry = useCallback(async (): Promise<T | null> => {
        if (!lastRequest) return null;
        return execute(lastRequest.url, lastRequest.options);
    }, [lastRequest, execute]);

    return { data, error, loading, execute, retry };
}

/**
 * Simple fetch wrapper with retry logic.
 * For use outside of React components.
 */
export async function fetchWithRetry<T>(
    url: string,
    options?: FetchOptions
): Promise<{ data: T | null; error: string | null }> {
    const { retries = 3, retryDelay = 1000, ...fetchOptions } = options || {};

    let lastError: Error | null = null;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const fullUrl = (apiUrl && url.startsWith('/api'))
        ? url.replace('/api', apiUrl)
        : url;

    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const response = await fetch(fullUrl, fetchOptions);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            return { data, error: null };
        } catch (err) {
            lastError = err instanceof Error ? err : new Error(String(err));

            if (attempt < retries) {
                await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
            }
        }
    }

    return { data: null, error: lastError?.message || "Bilinmeyen hata" };
}

```

## File: app\utils\validation.ts
```typescript
/**
 * Validation utilities using simple schema-based validation
 * Lightweight alternative to Zod for basic validation needs
 */

// ============================================
// VALIDATION RESULT TYPES
// ============================================

export interface ValidationResult<T> {
    success: boolean;
    data?: T;
    errors?: string[];
}

// ============================================
// BASIC VALIDATORS
// ============================================

export const validators = {
    // String validators
    string: {
        required: (value: unknown, message = 'Bu alan zorunludur'): string | null => {
            if (typeof value !== 'string' || value.trim() === '') return message;
            return null;
        },
        minLength: (min: number) => (value: string, message = `En az ${min} karakter olmalı`): string | null => {
            if (value.length < min) return message;
            return null;
        },
        maxLength: (max: number) => (value: string, message = `En fazla ${max} karakter olmalı`): string | null => {
            if (value.length > max) return message;
            return null;
        },
        email: (value: string, message = 'Geçerli bir e-posta adresi girin'): string | null => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) return message;
            return null;
        },
        pattern: (regex: RegExp, message: string) => (value: string): string | null => {
            if (!regex.test(value)) return message;
            return null;
        }
    },

    // Number validators
    number: {
        required: (value: unknown, message = 'Bu alan zorunludur'): string | null => {
            if (typeof value !== 'number' || isNaN(value)) return message;
            return null;
        },
        min: (min: number) => (value: number, message = `Değer en az ${min} olmalı`): string | null => {
            if (value < min) return message;
            return null;
        },
        max: (max: number) => (value: number, message = `Değer en fazla ${max} olmalı`): string | null => {
            if (value > max) return message;
            return null;
        },
        integer: (value: number, message = 'Tam sayı olmalı'): string | null => {
            if (!Number.isInteger(value)) return message;
            return null;
        }
    },

    // Score validators (volleyball specific)
    score: {
        valid: (value: string, message = 'Geçerli bir skor girin (örn: 3-0, 3-1, 3-2, 2-3, 1-3, 0-3)'): string | null => {
            const validScores = ['3-0', '3-1', '3-2', '2-3', '1-3', '0-3'];
            if (!validScores.includes(value)) return message;
            return null;
        }
    }
};

// ============================================
// SCHEMA-BASED VALIDATION
// ============================================

type ValidatorFn = (value: unknown, message?: string) => string | null;

interface FieldSchema {
    validators: ValidatorFn[];
}

interface Schema {
    [field: string]: FieldSchema;
}

export function validate<T extends Record<string, unknown>>(
    data: T,
    schema: Schema
): ValidationResult<T> {
    const errors: string[] = [];

    for (const [field, fieldSchema] of Object.entries(schema)) {
        const value = data[field];

        for (const validator of fieldSchema.validators) {
            const error = validator(value);
            if (error) {
                errors.push(`${field}: ${error}`);
                break; // Stop on first error for this field
            }
        }
    }

    if (errors.length > 0) {
        return { success: false, errors };
    }

    return { success: true, data };
}

// ============================================
// COMMON SCHEMAS
// ============================================

export const schemas = {
    prediction: {
        score: {
            validators: [
                validators.string.required,
                validators.score.valid
            ]
        }
    },

    user: {
        email: {
            validators: [
                validators.string.required,
                validators.string.email
            ]
        },
        password: {
            validators: [
                validators.string.required,
                validators.string.minLength(6)
            ]
        },
        name: {
            validators: [
                validators.string.required,
                validators.string.minLength(2),
                validators.string.maxLength(50)
            ]
        }
    }
};

// ============================================
// SANITIZATION
// ============================================

export const sanitize = {
    // Remove HTML tags
    stripHtml: (input: string): string => {
        return input.replace(/<[^>]*>/g, '');
    },

    // Escape special characters
    escapeHtml: (input: string): string => {
        const escapeMap: Record<string, string> = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        };
        return input.replace(/[&<>"']/g, char => escapeMap[char]);
    },

    // Trim and normalize whitespace
    normalizeWhitespace: (input: string): string => {
        return input.trim().replace(/\s+/g, ' ');
    },

    // Remove non-alphanumeric characters
    alphanumericOnly: (input: string): string => {
        return input.replace(/[^a-zA-Z0-9\s]/g, '');
    },

    // Sanitize for safe display
    forDisplay: (input: string): string => {
        return sanitize.escapeHtml(sanitize.normalizeWhitespace(input));
    }
};

export default { validators, validate, schemas, sanitize };

```

## File: lib\api-middleware.ts
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/app/utils/supabase-server';
import { checkRateLimit } from '@/app/utils/rateLimit';

type ProtectedHandler = (
    req: NextRequest,
    session: { user: any },
    params?: any
) => Promise<NextResponse>;

interface AuthOptions {
    rateLimit?: {
        limit: number;
        windowMs: number;
    };
}

export async function withAuth(
    req: NextRequest,
    handler: ProtectedHandler,
    options: AuthOptions = {}
) {
    try {
        // 1. Rate Limiting
        const rateLimitConfig = options.rateLimit || { limit: 20, windowMs: 60 * 1000 };
        // Use IP or a simplified identifier if possible, for now falling back to simple check
        // In a real edge environment, get IP from headers
        const ip = req.headers.get('x-forwarded-for') || 'unknown';

        const rateLimitResult = await checkRateLimit(ip, rateLimitConfig.limit, rateLimitConfig.windowMs);
        if (!rateLimitResult.success) {
            return NextResponse.json(
                { error: 'Too many requests', retryAfter: rateLimitResult.retryAfter },
                { status: 429 }
            );
        }

        // 2. Authentication
        const supabase = await createServerSupabaseClient();
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 3. Handover to handler
        return handler(req, { user }, undefined); // params passed separately usually
    } catch (error) {
        console.error('API Middleware Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

```

## File: lib\error-tracking.ts
```typescript
/**
 * Utility to track errors to the server
 */
export const trackError = async (error: Error, context: Record<string, any> = {}) => {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
        console.error('[ErrorTracker]', error, context);
    }

    try {
        await fetch('/api/errors', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: error.message,
                stack: error.stack,
                context,
                timestamp: new Date().toISOString(),
                url: typeof window !== 'undefined' ? window.location.href : '',
                userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
            }),
        });
    } catch (loggingError) {
        // Fallback if logging fails
        console.error('Failed to report error:', loggingError);
    }
};

```

## File: lib\utils.ts
```typescript
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

```

