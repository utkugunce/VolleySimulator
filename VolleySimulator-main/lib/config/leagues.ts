/**
 * Merkezi Lig Konfigürasyon Sistemi
 * Single Source of Truth - Tüm lig ayarları buradan yönetilir
 */

export const LEAGUE_IDS = [
  'vsl',
  '1lig',
  '2lig',
  'cev-cl',
  'cev-cup',
  'cev-challenge',
] as const;

export type LeagueId = (typeof LEAGUE_IDS)[number];
export type LeagueTheme = 'red' | 'amber' | 'emerald' | 'blue' | 'rose' | 'purple';

export interface ThemeColors {
  text: string;
  gradient: string;
  border: string;
  bg: string;
  ring: string;
  solid: string;
}

export interface LeagueConfig {
  id: LeagueId;
  name: string;
  shortName: string;
  subtitle: string;
  theme: LeagueTheme;
  apiEndpoint: string;
  dataFile: string;
  storageKey: string;
  hasGroups: boolean;
  hasRounds: boolean;
  hasPlayoffs: boolean;
  groups?: string[];
  rounds?: string[];
  playoffSpots?: number;
  secondaryPlayoffSpots?: number;
  relegationSpots?: number;
  country: 'TR' | 'EU';
  icon: string;
}

// Tema renk tanımları
export const THEME_COLORS: Record<LeagueTheme, ThemeColors> = {
  red: {
    text: 'text-red-400',
    gradient: 'from-red-500 to-rose-500',
    border: 'border-red-500/30',
    bg: 'bg-red-600/20',
    ring: 'ring-red-500/50',
    solid: 'bg-red-600',
  },
  amber: {
    text: 'text-amber-400',
    gradient: 'from-amber-500 to-orange-500',
    border: 'border-amber-500/30',
    bg: 'bg-amber-600/20',
    ring: 'ring-amber-500/50',
    solid: 'bg-amber-600',
  },
  emerald: {
    text: 'text-emerald-400',
    gradient: 'from-emerald-500 to-teal-500',
    border: 'border-emerald-500/30',
    bg: 'bg-emerald-600/20',
    ring: 'ring-emerald-500/50',
    solid: 'bg-emerald-600',
  },
  blue: {
    text: 'text-blue-400',
    gradient: 'from-blue-500 to-cyan-500',
    border: 'border-blue-500/30',
    bg: 'bg-blue-600/20',
    ring: 'ring-blue-500/50',
    solid: 'bg-blue-600',
  },
  rose: {
    text: 'text-rose-400',
    gradient: 'from-rose-500 to-pink-500',
    border: 'border-rose-500/30',
    bg: 'bg-rose-600/20',
    ring: 'ring-rose-500/50',
    solid: 'bg-rose-600',
  },
  purple: {
    text: 'text-purple-400',
    gradient: 'from-purple-500 to-violet-500',
    border: 'border-purple-500/30',
    bg: 'bg-purple-600/20',
    ring: 'ring-purple-500/50',
    solid: 'bg-purple-600',
  },
};

// Merkezi Lig Konfigürasyonları
export const LEAGUES: Record<LeagueId, LeagueConfig> = {
  vsl: {
    id: 'vsl',
    name: 'Vodafone Sultanlar Ligi',
    shortName: 'VSL',
    subtitle: 'Kadınlar • 2025-2026',
    theme: 'red',
    apiEndpoint: '/api/vsl',
    dataFile: 'vsl-data.json',
    storageKey: 'vslGroupScenarios',
    hasGroups: false,
    hasRounds: false,
    hasPlayoffs: true,
    playoffSpots: 4,
    secondaryPlayoffSpots: 4,
    relegationSpots: 2,
    country: 'TR',
    icon: '🏆',
  },
  '1lig': {
    id: '1lig',
    name: 'Arabica Coffee House 1. Lig',
    shortName: '1. Lig',
    subtitle: 'Kadınlar • 2025-2026',
    theme: 'amber',
    apiEndpoint: '/api/1lig',
    dataFile: '1lig-data.json',
    storageKey: '1ligGroupScenarios',
    hasGroups: true,
    groups: ['A. Grup', 'B. Grup'],
    hasRounds: false,
    hasPlayoffs: true,
    playoffSpots: 2,
    relegationSpots: 2,
    country: 'TR',
    icon: '🥈',
  },
  '2lig': {
    id: '2lig',
    name: 'Kadınlar 2. Lig',
    shortName: '2. Lig',
    subtitle: 'Kadınlar • 2025-2026',
    theme: 'emerald',
    apiEndpoint: '/api/scrape',
    dataFile: '2lig-data.json',
    storageKey: 'groupScenarios',
    hasGroups: true,
    hasRounds: false,
    hasPlayoffs: true,
    playoffSpots: 2,
    relegationSpots: 2,
    country: 'TR',
    icon: '🥉',
  },
  'cev-cl': {
    id: 'cev-cl',
    name: 'CEV Şampiyonlar Ligi',
    shortName: 'CEV CL',
    subtitle: 'Kadınlar • 2025-2026',
    theme: 'blue',
    apiEndpoint: '/api/cev-cl',
    dataFile: 'cev-cl-data.json',
    storageKey: 'cevclGroupScenarios',
    hasGroups: true,
    hasRounds: false,
    hasPlayoffs: true,
    country: 'EU',
    icon: '⭐',
  },
  'cev-cup': {
    id: 'cev-cup',
    name: 'CEV Cup',
    shortName: 'CEV Cup',
    subtitle: 'Kadınlar • 2025-2026',
    theme: 'amber',
    apiEndpoint: '/api/cev-cup',
    dataFile: 'cev-cup-data.json',
    storageKey: 'cevcupScenarios',
    hasGroups: false,
    hasRounds: true,
    hasPlayoffs: true,
    country: 'EU',
    icon: '🏅',
  },
  'cev-challenge': {
    id: 'cev-challenge',
    name: 'CEV Challenge Cup',
    shortName: 'Challenge',
    subtitle: 'Kadınlar • 2025-2026',
    theme: 'emerald',
    apiEndpoint: '/api/cev-challenge',
    dataFile: 'cev-challenge-cup-data.json',
    storageKey: 'cevChallengeScenarios',
    hasGroups: false,
    hasRounds: true,
    hasPlayoffs: true,
    country: 'EU',
    icon: '🎯',
  },
};

// Helper fonksiyonlar
export function getLeagueConfig(id: string): LeagueConfig | null {
  return LEAGUES[id as LeagueId] || null;
}

export function isValidLeagueId(id: string): id is LeagueId {
  return LEAGUE_IDS.includes(id as LeagueId);
}

export function getLeagueThemeColors(id: LeagueId): ThemeColors {
  const config = LEAGUES[id];
  return THEME_COLORS[config.theme];
}

export function getTurkishLeagues(): LeagueConfig[] {
  return Object.values(LEAGUES).filter((l) => l.country === 'TR');
}

export function getEuropeanLeagues(): LeagueConfig[] {
  return Object.values(LEAGUES).filter((l) => l.country === 'EU');
}

export function getAllLeagues(): LeagueConfig[] {
  return Object.values(LEAGUES);
}
