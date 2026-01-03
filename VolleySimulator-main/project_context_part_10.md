# Project Application Context - Part 10

## File: app\components\LeagueTemplate\CalculatorTemplate.tsx
```
"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { TeamStats, Match, Achievement } from "../../types";

import { useToast } from "../Toast";
import { AchievementToast, AchievementsPanel } from "../Achievements";
import StandingsTable from "../Calculator/StandingsTable";
import FixtureList from "../Calculator/FixtureList";
import ShareButton from "../ShareButton";
import { calculateLiveStandings } from "../../utils/calculatorUtils";
import { useGameState, ACHIEVEMENTS } from "../../utils/gameState";
import { sounds } from "../../utils/sounds";
import { LeagueConfig, THEME_COLORS } from "./types";
import LeagueActionBar from "./LeagueActionBar";

interface CalculatorTemplateProps {
    config: LeagueConfig;
    initialTeams: TeamStats[];
    initialMatches: Match[];
}

export default function CalculatorTemplate({ config, initialTeams, initialMatches }: CalculatorTemplateProps) {
    const { showToast, showUndoToast } = useToast();
    const theme = THEME_COLORS[config.theme];
    const standingsRef = useRef<HTMLDivElement>(null);

    // Data State
    const [allTeams, setAllTeams] = useState<TeamStats[]>(initialTeams);
    const [allMatches, setAllMatches] = useState<Match[]>(initialMatches);
    const [activeGroup, setActiveGroup] = useState<string>(config.groups?.[0] || "");

    // UI State
    const [overrides, setOverrides] = useState<Record<string, string>>({});
    const [showAchievements, setShowAchievements] = useState(false);
    const [showAutoMenu, setShowAutoMenu] = useState(false);
    const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);

    // Game State
    const { gameState, addXP, recordPrediction, unlockAchievement, hasAchievement } = useGameState();

    // Update state when props change (needed for some edge cases)
    useEffect(() => {
        setAllTeams(initialTeams);
        setAllMatches(initialMatches);
    }, [initialTeams, initialMatches]);

    // Load saved scenarios on mount
    useEffect(() => {
        const saved = localStorage.getItem(config.storageKey);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setOverrides(parsed);
            } catch (e) { console.error(e); }
        }
    }, [config.storageKey]);

    // Derived Data based on active group (if hasGroups)
    const currentMatches = useMemo(() => {
        if (!config.hasGroups) return allMatches;
        return allMatches.filter(m => !activeGroup || (m as any).groupName === activeGroup);
    }, [allMatches, config.hasGroups, activeGroup]);

    const currentTeams = useMemo(() => {
        if (!config.hasGroups) return allTeams;
        return allTeams.filter(t => !activeGroup || (t as any).groupName === activeGroup);
    }, [allTeams, config.hasGroups, activeGroup]);


    // Handle Predictions
    const handleScoreChange = (matchId: string, score: string) => {
        const newOverrides = { ...overrides };
        const wasNew = !overrides[matchId];

        if (score) {
            newOverrides[matchId] = score;

            if (wasNew) {
                addXP(10);
                sounds.scoreSelect();

                // Achievement: First Prediction
                if (!hasAchievement('first_prediction')) {
                    const wasUnlocked = unlockAchievement('first_prediction');
                    if (wasUnlocked) {
                        setNewAchievement(ACHIEVEMENTS.first_prediction as Achievement);
                        sounds.achievement();
                    }
                }

                // Achievement: Game Addict
                if (gameState.stats.totalPredictions >= 49 && !hasAchievement('game_addict')) {
                    const wasUnlocked = unlockAchievement('game_addict');
                    if (wasUnlocked) {
                        setNewAchievement(ACHIEVEMENTS.game_addict as Achievement);
                        sounds.achievement();
                    }
                }

                recordPrediction(true);
            }
        } else {
            delete newOverrides[matchId];
        }
        setOverrides(newOverrides);
    };

    // Save Scenarios
    useEffect(() => {
        localStorage.setItem(config.storageKey, JSON.stringify(overrides));
    }, [overrides, config.storageKey]);

    // Reset Logic
    const handleReset = () => {
        const previousOverrides = { ...overrides };
        setOverrides({});
        localStorage.removeItem(config.storageKey);
        showUndoToast(`${config.name} tahminleri sıfırlandı`, () => {
            setOverrides(previousOverrides);
            localStorage.setItem(config.storageKey, JSON.stringify(previousOverrides));
        });
    };

    const handleRandomize = () => {
        if (!confirm("Oynanmamış maçlar rastgele skorlarla doldurulacak. Onaylıyor musunuz?")) return;
        const newOverrides = { ...overrides };
        const scores = ["3-0", "3-1", "3-2", "2-3", "1-3", "0-3"];
        let count = 0;

        currentMatches.forEach(match => {
            const matchId = `match-${match.id}`;
            if (!match.isPlayed && !newOverrides[matchId]) {
                const randomScore = scores[Math.floor(Math.random() * scores.length)];
                newOverrides[matchId] = randomScore;
                count++;
            }
        });

        if (count > 0) {
            setOverrides(newOverrides);
            sounds.levelUp();
            showToast(`${count} maç rastgele tahmin edildi!`, "success");
            addXP(count * 5); // 5xp per random match
        }
    };

    // Calculations
    const standings = useMemo(() =>
        calculateLiveStandings(currentTeams, currentMatches, overrides),
        [currentTeams, currentMatches, overrides]
    );

    // Initial Standings for comparison (rank changes)
    const initialRanks = useMemo(() => {
        const baseStandings = calculateLiveStandings(currentTeams, currentMatches, {});
        // Sort by points/wins etc to get rank
        const map = new Map<string, number>();
        baseStandings.forEach((t, i) => map.set(t.name, i + 1));
        return map;
    }, [currentTeams, currentMatches]);

    const completedMatches = currentMatches.filter(m => m.isPlayed || overrides[`match-${m.id}`]).length;
    const progress = (completedMatches / currentMatches.length) * 100 || 0;


    return (
        <main className="min-h-screen bg-slate-950 text-slate-100 p-2 sm:p-4 font-sans pb-20 sm:pb-4">
            <div className="w-full max-w-[1600px] mx-auto flex flex-col h-[calc(100vh-2rem)] gap-4">

                <LeagueActionBar
                    config={config}
                    title={config.name}
                    subtitle="Tahmin Oyunu & Puan Durumu Hesaplayıcı"
                    selectorLabel={config.hasGroups ? "Grup" : undefined}
                    selectorValue={activeGroup}
                    selectorOptions={config.hasGroups ? (config.groups || []) : []}
                    onSelectorChange={config.hasGroups ? setActiveGroup : undefined}
                    progress={progress}
                    progressLabel={`${completedMatches}/${currentMatches.length} Maç`}
                >
                    <button
                        onClick={handleRandomize}
                        className={`px-3 py-1.5 bg-${config.theme}-600 hover:bg-${config.theme}-500 text-white text-xs font-bold rounded-lg transition-all shadow-lg shadow-${config.theme}-900/20`}
                    >
                        🎲 Rastgele
                    </button>
                    <button
                        onClick={handleReset}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-rose-900/50 text-slate-400 hover:text-rose-400 text-xs font-bold rounded-lg transition-all border border-slate-700"
                    >
                        Sıfırla
                    </button>
                    <ShareButton
                        targetRef={standingsRef}
                    />
                </LeagueActionBar>

                {/* Content Grid */}
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0 overflow-hidden">
                    {/* Left: Fixture */}
                    <div className="lg:col-span-8 h-full min-h-0 flex flex-col bg-slate-900/50 rounded-xl border border-slate-800 overflow-hidden order-2 lg:order-1">
                        <FixtureList
                            matches={currentMatches}
                            overrides={overrides}
                            onScoreChange={handleScoreChange}
                        />
                    </div>

                    {/* Right: Standings */}
                    <div className="lg:col-span-4 h-full min-h-0 flex flex-col order-1 lg:order-2" ref={standingsRef}>
                        <StandingsTable
                            teams={standings}
                            playoffSpots={config.playoffSpots}
                            relegationSpots={config.relegationSpots}
                            initialRanks={initialRanks}
                        />

                        {/* Achievements Panel */}
                        {showAchievements && (
                            <div className="absolute inset-0 bg-slate-950/90 z-50 flex items-center justify-center p-4">
                                <AchievementsPanel
                                    isOpen={showAchievements}
                                    onClose={() => setShowAchievements(false)}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Achievement Toast */}
            {newAchievement && (
                <AchievementToast
                    achievement={newAchievement}
                    onClose={() => setNewAchievement(null)}
                />
            )}
        </main>
    );
}

```

## File: app\components\LeagueTemplate\index.ts
```
// LeagueTemplate - Barrel exports
export * from './types';
export { default as useLeagueData, useLeagueData as useLeague } from './useLeagueData';
export { default as LeagueActionBar } from './LeagueActionBar';

```

## File: app\components\LeagueTemplate\LeagueActionBar.tsx
```
"use client";

import { ReactNode } from 'react';
import { LeagueConfig, THEME_COLORS } from './types';

interface LeagueActionBarProps {
    config: LeagueConfig;
    // Left side
    title?: string;
    subtitle?: string;
    // Selector (group/round/pool)
    selectorLabel?: string;
    selectorValue?: string;
    selectorOptions?: (string | { label: string; value: string })[];
    onSelectorChange?: (value: string) => void;
    // Progress
    progress?: number;
    progressLabel?: string;
    // Right side actions
    children?: ReactNode;
}

export function LeagueActionBar({
    config,
    title,
    subtitle,
    selectorLabel,
    selectorValue,
    selectorOptions = [],
    onSelectorChange,
    progress,
    progressLabel,
    children
}: LeagueActionBarProps) {
    const theme = THEME_COLORS[config.theme];

    return (
        <div className="sticky top-14 z-20 flex flex-col sm:flex-row items-center justify-between gap-3 p-2 bg-slate-900/95 backdrop-blur-sm rounded-xl border border-slate-800 shadow-xl">
            {/* Left Side: Title + Selector */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                {/* Title Block */}
                {(title || subtitle) && (
                    <div className="text-center sm:text-left">
                        {title && (
                            <h1 className="font-bold text-white text-lg tracking-tight leading-none hidden sm:block">
                                {title}
                            </h1>
                        )}
                        {subtitle && (
                            <p className="text-[10px] text-slate-400 hidden sm:block">
                                {subtitle}
                            </p>
                        )}
                    </div>
                )}

                {/* Selector */}
                {selectorOptions.length > 0 && onSelectorChange && (
                    <div className="flex gap-2 items-center w-full sm:w-auto">
                        {selectorLabel && (
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest hidden sm:inline whitespace-nowrap">
                                {selectorLabel}:
                            </span>
                        )}
                        <div className="flex gap-1 p-1 bg-slate-950/50 rounded-lg border border-slate-800 items-center">
                            <select
                                value={selectorValue}
                                onChange={(e) => onSelectorChange(e.target.value)}
                                title={selectorLabel || 'Seçin'}
                                className={`px-3 py-1 bg-${config.theme}-600/20 ${theme.text} text-[10px] uppercase font-black rounded-md border border-${config.theme}-500/30 outline-none cursor-pointer transition-all focus:ring-2 focus:ring-${config.theme}-500/50`}
                            >
                                {selectorOptions.map(opt => {
                                    const value = typeof opt === 'string' ? opt : opt.value;
                                    const label = typeof opt === 'string' ? opt : opt.label;
                                    return (
                                        <option key={value} value={value} className="bg-slate-900 text-white">
                                            {label}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>
                    </div>
                )}

                {/* Progress */}
                {progress !== undefined && (
                    <div className="hidden sm:flex items-center gap-2">
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-800/50 rounded-lg border border-slate-700/50">
                            <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                <div
                                    className={`h-full bg-gradient-to-r ${theme.gradient} transition-all`}
                                    style={{ width: `${Math.min(progress, 100)}%` }}
                                />
                            </div>
                            <span className={`text-[9px] font-bold ${theme.text}`}>
                                {progressLabel || `%${Math.round(progress)}`}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Right Side: Actions */}
            {children && (
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap sm:flex-nowrap">
                    {children}
                </div>
            )}
        </div>
    );
}

export default LeagueActionBar;

```

## File: app\components\LeagueTemplate\PlayoffTemplate.tsx
```
"use client";

import { useMemo } from "react";
import { TeamStats, Match } from "../../types";
import { LeagueConfig } from "./types";
import LeagueActionBar from "./LeagueActionBar";

interface PlayoffTemplateProps {
    config: LeagueConfig;
    initialTeams: TeamStats[];
    initialMatches: Match[];
}

export default function PlayoffTemplate({ config, initialTeams, initialMatches }: PlayoffTemplateProps) {
    // Determine matches to show (e.g. only playoff rounds if specified)
    const currentMatches = useMemo(() => {
        // Filter for playoff matches if needed, currently assumes all passed matches are relevant
        return initialMatches;
    }, [initialMatches]);

    const progress = useMemo(() => {
        const played = currentMatches.filter(m => m.isPlayed).length;
        const total = currentMatches.length;
        return total > 0 ? Math.round((played / total) * 100) : 0;
    }, [currentMatches]);

    return (
        <main className="min-h-screen bg-slate-950 text-slate-100 p-0 sm:p-2 font-sans pb-20 sm:pb-4">
            <div className="max-w-[1600px] mx-auto flex flex-col h-[calc(100vh-2rem)] gap-4">

                <LeagueActionBar
                    config={config}
                    title={config.name}
                    subtitle="Play-Off Aşaması"
                    progress={progress}
                    progressLabel={`%${progress}`}
                />

                <div className="flex-1 min-h-0 bg-slate-900/50 rounded-xl border border-slate-800 overflow-hidden relative flex items-center justify-center">
                    <div className="text-center text-slate-500">
                        <p className="text-lg font-bold">Play-Off Bracket</p>
                        <p className="text-sm">{currentMatches.length} maç • {initialTeams.length} takım</p>
                    </div>
                </div>
            </div>
        </main>
    );
}

```

## File: app\components\LeagueTemplate\StatsTemplate.tsx
```
"use client";

import { useMemo } from "react";
import { TeamStats, Match } from "../../types";
import { LeagueConfig } from "./types";
import LeagueActionBar from "./LeagueActionBar";
import StatsCard from "../StatsCard";
import TeamAvatar from "../TeamAvatar";
import { sortStandings } from "../../utils/calculatorUtils";

interface StatsTemplateProps {
    config: LeagueConfig;
    initialTeams: TeamStats[];
    initialMatches: Match[];
}

export default function StatsTemplate({ config, initialTeams, initialMatches }: StatsTemplateProps) {
    const teams = useMemo(() => sortStandings(initialTeams), [initialTeams]);

    // Derived Stats
    const stats = useMemo(() => {
        // Calculate Streaks & Form
        const streaks = teams.map(t => {
            // This is a simplified streak calculation based on wins/losses since we don't have full match history in TeamStats
            // Ideally we'd parse matches to find current streak.
            // For now, let's use the matches array to find last matches for each team
            const teamMatches = initialMatches.filter(m => (m.homeTeam === t.name || m.awayTeam === t.name) && m.isPlayed);

            // Sort by ID (assuming ID correlates with time) or Date if available
            // Note: Match ID logic might need improvement
            return {
                name: t.name,
                matches: teamMatches.length,
                wins: t.wins
            };
        });

        const topWinRate = [...teams].sort((a, b) => (b.wins / (b.played || 1)) - (a.wins / (a.played || 1)))[0];
        const topSetRatio = [...teams].sort((a, b) => ((b.setsWon / (b.setsLost || 1)) - (a.setsWon / (a.setsLost || 1))))[0];
        const mostPlayed = [...teams].sort((a, b) => b.played - a.played)[0];

        return {
            topWinRate,
            topSetRatio,
            mostPlayed
        };
    }, [teams, initialMatches]);

    // Completion Rate for Action Bar
    const totalMatches = initialMatches.length;
    const playedMatches = initialMatches.filter(m => m.isPlayed).length;
    const progress = totalMatches > 0 ? Math.round((playedMatches / totalMatches) * 100) : 0;

    // Stat Tile Component (Local helper or could be separate)
    const StatTile = ({ title, player, team, value, icon, color }: any) => (
        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/50 flex items-center justify-between group hover:border-slate-700 transition-all">
            <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg bg-${color}-500/10 flex items-center justify-center text-xl`}>
                    {icon}
                </div>
                <div>
                    <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-0.5">{title}</div>
                    <div className="font-bold text-slate-200 group-hover:text-white transition-colors">{player}</div>
                    <div className="text-xs text-slate-500">{team}</div>
                </div>
            </div>
            <div className="text-right">
                <div className={`text-xl font-black text-${color}-400`}>{value}</div>
            </div>
        </div>
    );

    return (
        <main className="min-h-screen bg-slate-950 text-slate-100 p-0 sm:p-2 font-sans pb-20 sm:pb-4">
            <div className="max-w-7xl mx-auto space-y-4">

                <LeagueActionBar
                    config={config}
                    title={config.name}
                    subtitle={`${config.subtitle} İstatistikleri`}
                    progress={progress}
                    progressLabel={`%${progress}`}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatsCard
                        title="Galibiyet Lideri"
                        value={stats.topWinRate?.name || '-'}
                        subtitle={`${stats.topWinRate?.wins || 0} Galibiyet`}
                        trend="up"
                        icon="🏆"
                        color="emerald"
                    />
                    <StatsCard
                        title="Set Averajı"
                        value={stats.topSetRatio?.name || '-'}
                        subtitle={(stats.topSetRatio?.setsWon / (stats.topSetRatio?.setsLost || 1)).toFixed(2)}
                        trend="up"
                        icon="📊"
                        color="blue"
                    />
                    <StatsCard
                        title="En Çok Maç"
                        value={stats.mostPlayed?.name || '-'}
                        subtitle={`${stats.mostPlayed?.played || 0} Maç`}
                        trend="neutral"
                        icon="📅"
                        color="amber"
                    />
                    <StatsCard
                        title="MVP Adayı"
                        value="Tijana Boskovic"
                        subtitle="Eczacıbaşı"
                        trend="up"
                        icon="⭐"
                        color="rose"
                    />
                </div>

                {/* Detailed Stats Grid - Placeholder for now as we don't have player stats logic fully migrated */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-1">
                            Öne Çıkan Oyuncular (Demo)
                        </h3>
                        <div className="grid grid-cols-1 gap-3">
                            <StatTile
                                title="En Skorer"
                                player="Tijana Boskovic"
                                team="Eczacıbaşı Dynavit"
                                value="324"
                                icon="🏐"
                                color="rose"
                            />
                            <StatTile
                                title="En Çok Blok"
                                player="Zehra Güneş"
                                team="VakıfBank"
                                value="42"
                                icon="✋"
                                color="emerald"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-1">
                            Takım Performansı
                        </h3>
                        {/* Team Performance Bars could go here */}
                        <div className="bg-slate-900/40 rounded-xl p-4 border border-slate-800/50 h-full flex items-center justify-center text-slate-500 italic">
                            Detaylı takım istatistikleri yakında...
                        </div>
                    </div>
                </div>

            </div>
        </main>
    );
}

```

## File: app\components\LeagueTemplate\types.ts
```
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

```

## File: app\components\LeagueTemplate\useLeagueData.ts
```
"use client";

import { useState, useEffect, useCallback } from 'react';
import { LeagueConfig, LeagueData, LEAGUE_CONFIGS } from './types';
import { TeamStats, Match } from '../../types';

interface UseLeagueDataOptions {
    leagueId: string;
    autoFetch?: boolean;
}

interface UseLeagueDataReturn {
    data: LeagueData | null;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    config: LeagueConfig;
}

export function useLeagueData({ leagueId, autoFetch = true }: UseLeagueDataOptions): UseLeagueDataReturn {
    const [data, setData] = useState<LeagueData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const config = LEAGUE_CONFIGS[leagueId];

    const fetchData = useCallback(async () => {
        if (!config) {
            setError(`Unknown league: ${leagueId}`);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const res = await fetch(config.apiEndpoint);
            if (!res.ok) throw new Error('Veri çekilemedi');

            const json = await res.json();

            // Normalize data structure
            const normalizedData: LeagueData = {
                teams: json.teams || [],
                fixture: json.fixture || json.matches || [],
                groups: json.groups || (config.hasGroups ? extractGroups(json.teams) : undefined),
                rounds: json.rounds || undefined,
                pools: json.pools || undefined
            };

            setData(normalizedData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Bilinmeyen hata');
        } finally {
            setLoading(false);
        }
    }, [config, leagueId]);

    useEffect(() => {
        if (autoFetch) {
            fetchData();
        }
    }, [autoFetch, fetchData]);

    return {
        data,
        loading,
        error,
        refetch: fetchData,
        config
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

export default useLeagueData;

```

## File: app\components\Skeleton\index.tsx
```
"use client";

import { Skeleton as BaseSkeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface SkeletonProps {
    className?: string;
}

// Base skeleton with shimmer animation (using shadcn/ui)
export function Skeleton({ className = '' }: SkeletonProps) {
    return (
        <BaseSkeleton className={cn("bg-muted", className)} />
    );
}

// Text line skeleton
export function SkeletonText({ lines = 1, className = '' }: { lines?: number; className?: string }) {
    return (
        <div className={`space-y-2 ${className}`}>
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton
                    key={i}
                    className={`h-4 ${i === lines - 1 ? 'w-3/4' : 'w-full'}`}
                />
            ))}
        </div>
    );
}

// Avatar/Circle skeleton
export function SkeletonAvatar({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
    const sizes = {
        sm: 'w-8 h-8',
        md: 'w-12 h-12',
        lg: 'w-16 h-16'
    };
    return <Skeleton className={`${sizes[size]} rounded-full`} />;
}

// Card skeleton
export function SkeletonCard({ className = '' }: SkeletonProps) {
    return (
        <div className={`bg-slate-900/50 rounded-xl border border-slate-800 p-4 ${className}`}>
            <div className="flex items-center gap-3 mb-4">
                <SkeletonAvatar size="sm" />
                <div className="flex-1">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-3 w-16" />
                </div>
            </div>
            <SkeletonText lines={2} />
        </div>
    );
}

// Table row skeleton
export function SkeletonTableRow({ columns = 5 }: { columns?: number }) {
    return (
        <div className="flex items-center gap-3 p-2 border-b border-slate-800/50">
            <Skeleton className="w-6 h-6 rounded" />
            <SkeletonAvatar size="sm" />
            <div className="flex-1">
                <Skeleton className="h-4 w-32" />
            </div>
            {Array.from({ length: columns - 2 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-8" />
            ))}
        </div>
    );
}

// Table skeleton
export function SkeletonTable({ rows = 8, columns = 5 }: { rows?: number; columns?: number }) {
    return (
        <div className="bg-slate-900/50 rounded-xl border border-slate-800 overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 p-3 border-b border-slate-700 bg-slate-800/50">
                {Array.from({ length: columns }).map((_, i) => (
                    <Skeleton key={i} className={`h-3 ${i === 0 ? 'w-6' : i === 1 ? 'w-32' : 'w-12'}`} />
                ))}
            </div>
            {/* Rows */}
            {Array.from({ length: rows }).map((_, i) => (
                <SkeletonTableRow key={i} columns={columns} />
            ))}
        </div>
    );
}

// Stats grid skeleton
export function SkeletonStats({ count = 4 }: { count?: number }) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="bg-slate-900/50 rounded-xl border border-slate-800 p-4 text-center">
                    <Skeleton className="h-8 w-12 mx-auto mb-2" />
                    <Skeleton className="h-3 w-16 mx-auto" />
                </div>
            ))}
        </div>
    );
}

// Match list skeleton
export function SkeletonMatchList({ count = 6 }: { count?: number }) {
    return (
        <div className="space-y-2">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl border border-slate-800">
                    <div className="flex items-center gap-2">
                        <SkeletonAvatar size="sm" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-6 w-12 rounded-lg" />
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-24" />
                        <SkeletonAvatar size="sm" />
                    </div>
                </div>
            ))}
        </div>
    );
}

// Page skeleton (combines multiple elements)
export function SkeletonPage() {
    return (
        <div className="space-y-4 p-4 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <Skeleton className="h-6 w-48 mb-2" />
                    <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-10 w-24 rounded-lg" />
            </div>

            {/* Stats */}
            <SkeletonStats count={4} />

            {/* Content grid */}
            <div className="grid md:grid-cols-2 gap-4">
                <SkeletonTable rows={6} />
                <SkeletonMatchList count={4} />
            </div>
        </div>
    );
}

// Bracket skeleton for playoff views
export function SkeletonBracket({ rounds = 3 }: { rounds?: number }) {
    return (
        <div className="space-y-4 p-4">
            <Skeleton className="h-8 w-48 mb-6" />
            <div className="flex gap-8 overflow-x-auto pb-4">
                {Array.from({ length: rounds }).map((_, roundIdx) => (
                    <div key={roundIdx} className="flex flex-col gap-4 min-w-[200px]">
                        <Skeleton className="h-5 w-24 mb-2" />
                        {Array.from({ length: Math.pow(2, rounds - roundIdx - 1) }).map((_, matchIdx) => (
                            <div key={matchIdx} className="bg-slate-900/50 border border-slate-800 rounded-lg p-3 space-y-2">
                                <div className="flex items-center gap-2">
                                    <SkeletonAvatar size="sm" />
                                    <Skeleton className="h-4 w-20 flex-1" />
                                    <Skeleton className="h-4 w-6" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <SkeletonAvatar size="sm" />
                                    <Skeleton className="h-4 w-20 flex-1" />
                                    <Skeleton className="h-4 w-6" />
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}

// Leaderboard skeleton
export function SkeletonLeaderboard({ count = 10 }: { count?: number }) {
    return (
        <div className="space-y-2 p-4">
            <Skeleton className="h-8 w-48 mb-4" />
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-slate-900/50 border border-slate-800 rounded-lg">
                    <Skeleton className="h-6 w-8 rounded" />
                    <SkeletonAvatar size="sm" />
                    <div className="flex-1">
                        <Skeleton className="h-4 w-32 mb-1" />
                        <Skeleton className="h-3 w-20" />
                    </div>
                    <Skeleton className="h-6 w-16 rounded-lg" />
                </div>
            ))}
        </div>
    );
}

export default Skeleton;

```

## File: app\context\AuthContext.tsx
```
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
```
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
```
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
```
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
      console.log('Connected to live match:', matchId);
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
      console.log('Disconnected from live match');
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
```
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
```
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
```
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
```
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
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        const handleChange = (e: MediaQueryListEvent) => {
            setSystemTheme(e.matches ? 'dark' : 'light');
        };
        
        setSystemTheme(mediaQuery.matches ? 'dark' : 'light');
        mediaQuery.addEventListener('change', handleChange);
        
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    useEffect(() => {
        setMounted(true);
        const saved = localStorage.getItem("theme") as Theme | null;
        const savedPrefs = localStorage.getItem("ui-preferences");
        
        if (saved) {
            setThemeState(saved);
            document.documentElement.setAttribute("data-theme", saved);
        }
        
        if (savedPrefs) {
            try {
                const prefs = JSON.parse(savedPrefs);
                setPreferences(prefs);
                setThemeModeState(prefs.theme || 'dark');
                setAccentColorState(prefs.accentColor || 'emerald');
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

