import { UserProfile } from './user';

export type FriendshipStatus = 'pending' | 'accepted' | 'rejected' | 'blocked';

export interface Friend {
    id: string;
    oderId: string;
    userId: string;
    friendId: string;
    status: FriendshipStatus;
    createdAt: string;
    updatedAt: string;
    friend?: UserProfile;
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
    quietHoursStart?: string;
    quietHoursEnd?: string;
}

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

export interface CustomLeague {
    id: string;
    name: string;
    description?: string;
    code: string;
    creatorId: string;
    isPrivate: boolean;
    maxMembers: number;
    members: CustomLeagueMember[];
    season: string;
    leagues: string[];
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
