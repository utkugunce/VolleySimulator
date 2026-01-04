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
    unlockedAt?: string;
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
    expiresAt: string;
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
    lastActiveDate: string;
}

export const LEVEL_THRESHOLDS = [
    0, 100, 250, 500, 800, 1200, 1700, 2300, 3000, 3800,
    4700, 5700, 6800, 8000, 9300, 10700, 12200, 13800, 15500, 17300, 20000,
];

export const LEVEL_TITLES: Record<number, string> = {
    1: 'Çaylak',
    5: 'Amatör',
    10: 'Uzman',
    15: 'Profesyonel',
    20: 'Efsane',
};

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
    frame?: string;
    effect?: 'glow' | 'pulse' | 'sparkle' | 'fire' | 'ice';
}
