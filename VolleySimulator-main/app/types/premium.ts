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
