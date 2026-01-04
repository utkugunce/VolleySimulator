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
