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
    playoffSpots?: number;
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

// Theme color mappings
export const THEME_COLORS: Record<LeagueTheme, {
    primary: string;
    bg: string;
    border: string;
    text: string;
    gradient: string;
}> = {
    red: {
        primary: 'red-500',
        bg: 'red-600/20',
        border: 'red-500/30',
        text: 'text-red-500',
        gradient: 'from-red-600 to-rose-600'
    },
    amber: {
        primary: 'amber-500',
        bg: 'amber-600/20',
        border: 'amber-500/30',
        text: 'text-amber-500',
        gradient: 'from-amber-600 to-orange-600'
    },
    emerald: {
        primary: 'emerald-500',
        bg: 'emerald-600/20',
        border: 'emerald-500/30',
        text: 'text-emerald-500',
        gradient: 'from-emerald-600 to-teal-600'
    },
    blue: {
        primary: 'blue-500',
        bg: 'blue-600/20',
        border: 'blue-500/30',
        text: 'text-blue-500',
        gradient: 'from-blue-600 to-indigo-600'
    },
    rose: {
        primary: 'rose-500',
        bg: 'rose-600/20',
        border: 'rose-500/30',
        text: 'text-rose-500',
        gradient: 'from-rose-600 to-pink-600'
    },
    purple: {
        primary: 'purple-500',
        bg: 'purple-600/20',
        border: 'purple-500/30',
        text: 'text-purple-500',
        gradient: 'from-purple-600 to-violet-600'
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
