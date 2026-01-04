import { Badge } from './gamification';

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
    isProfilePublic: boolean;
    showPredictions: boolean;
}
