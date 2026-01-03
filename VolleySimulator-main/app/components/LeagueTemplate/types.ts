// LeagueTemplate Types
import { TeamStats, Match } from '../../types';

export type LeagueTheme = 'red' | 'amber' | 'emerald' | 'blue' | 'rose' | 'purple';

export interface LeagueConfig {
    id: string;
    name: string;
    shortName: string;
    subtitle: string;
    theme: LeagueTheme;
    apiEndpoint: string;
    storageKey: string;
    hasGroups: boolean;
    hasRounds: boolean;
    groups?: string[];
    rounds?: string[];
    playoffSpots?: number;
    secondaryPlayoffSpots?: number;
    relegationSpots?: number;
}

export interface LeagueData {
    teams: TeamStats[];
    fixture: Match[];
    groups?: string[];
    rounds?: string[];
    pools?: string[];
}

export interface LeaguePageProps {
    config: LeagueConfig;
    initialData?: LeagueData;
}

// Theme color definitions for each league theme
export interface ThemeColors {
    text: string;
    gradient: string;
    border: string;
    bg: string;
    ring: string;
}

export const THEME_COLORS: Record<LeagueTheme, ThemeColors> = {
    red: {
        text: 'text-red-400',
        gradient: 'from-red-500 to-rose-500',
        border: 'border-red-500/30',
        bg: 'bg-red-600/20',
        ring: 'ring-red-500/50'
    },
    amber: {
        text: 'text-amber-400',
        gradient: 'from-amber-500 to-orange-500',
        border: 'border-amber-500/30',
        bg: 'bg-amber-600/20',
        ring: 'ring-amber-500/50'
    },
    emerald: {
        text: 'text-emerald-400',
        gradient: 'from-emerald-500 to-teal-500',
        border: 'border-emerald-500/30',
        bg: 'bg-emerald-600/20',
        ring: 'ring-emerald-500/50'
    },
    blue: {
        text: 'text-blue-400',
        gradient: 'from-blue-500 to-cyan-500',
        border: 'border-blue-500/30',
        bg: 'bg-blue-600/20',
        ring: 'ring-blue-500/50'
    },
    rose: {
        text: 'text-rose-400',
        gradient: 'from-rose-500 to-pink-500',
        border: 'border-rose-500/30',
        bg: 'bg-rose-600/20',
        ring: 'ring-rose-500/50'
    },
    purple: {
        text: 'text-purple-400',
        gradient: 'from-purple-500 to-violet-500',
        border: 'border-purple-500/30',
        bg: 'bg-purple-600/20',
        ring: 'ring-purple-500/50'
    }
};

// Pre-defined league configurations
export const LEAGUE_CONFIGS: Record<string, LeagueConfig> = {
    vsl: {
        id: 'vsl',
        name: 'Vodafone Sultanlar Ligi',
        shortName: 'VSL',
        subtitle: 'Kadınlar • 2025-2026',
        theme: 'red',
        apiEndpoint: '/api/vsl',
        storageKey: 'vslGroupScenarios',
        hasGroups: false,
        hasRounds: false,
        playoffSpots: 4,
        secondaryPlayoffSpots: 4, // 5-8 Playoff
        relegationSpots: 2
    },
    '1lig': {
        id: '1lig',
        name: 'Arabica Coffee House 1. Lig',
        shortName: '1. Lig',
        subtitle: 'Kadınlar • 2025-2026',
        theme: 'amber',
        apiEndpoint: '/api/1lig',
        storageKey: '1ligGroupScenarios',
        hasGroups: true,
        hasRounds: false,
        playoffSpots: 2,
        relegationSpots: 2
    },
    '2lig': {
        id: '2lig',
        name: 'Kadınlar 2. Lig',
        shortName: '2. Lig',
        subtitle: 'Kadınlar • 2025-2026',
        theme: 'emerald',
        apiEndpoint: '/api/scrape',
        storageKey: 'groupScenarios',
        hasGroups: true,
        hasRounds: false,
        playoffSpots: 2,
        relegationSpots: 2
    },
    'cev-cl': {
        id: 'cev-cl',
        name: 'CEV Şampiyonlar Ligi',
        shortName: 'CEV CL',
        subtitle: 'Kadınlar • 2025-2026',
        theme: 'blue',
        apiEndpoint: '/api/cev-cl',
        storageKey: 'cevclGroupScenarios',
        hasGroups: true,
        hasRounds: false
    },
    'cev-cup': {
        id: 'cev-cup',
        name: 'CEV Cup',
        shortName: 'CEV Cup',
        subtitle: 'Kadınlar • 2025-2026',
        theme: 'amber',
        apiEndpoint: '/api/cev-cup',
        storageKey: 'cevcupScenarios',
        hasGroups: false,
        hasRounds: true
    },
    'cev-challenge': {
        id: 'cev-challenge',
        name: 'CEV Challenge Cup',
        shortName: 'Challenge',
        subtitle: 'Kadınlar • 2025-2026',
        theme: 'emerald',
        apiEndpoint: '/api/cev-challenge',
        storageKey: 'cevChallengeScenarios',
        hasGroups: false,
        hasRounds: true
    }
};
