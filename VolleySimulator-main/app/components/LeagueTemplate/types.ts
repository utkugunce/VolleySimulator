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

// ... (skipping theme colors) ...

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
