# Project Application Context - Part 10

## File: app\components\Calculator\StandingsTable.tsx
```
import { memo } from "react";
import Link from "next/link";
import { TeamStats } from "../../types";
import { TeamDiff } from "../../utils/scenarioUtils";
import { generateTeamSlug } from "../../utils/teamSlug";
import TeamAvatar from "../TeamAvatar";
import { Card, CardHeader, CardTitle } from "../ui/Card";
import { StandingsTableSkeleton } from "../ui/Skeleton";
import { Badge } from "../ui/Badge";
import { cn } from "@/lib/utils";

interface StandingsTableProps {
    teams: TeamStats[];
    playoffSpots?: number;
    secondaryPlayoffSpots?: number; // For 5-8 playoff zone (VSL)
    relegationSpots?: number;
    initialRanks?: Map<string, number>; // For showing rank changes
    compact?: boolean;
    loading?: boolean;
    comparisonDiffs?: TeamDiff[];
}

function StandingsTable({
    teams,
    playoffSpots = 2,
    secondaryPlayoffSpots = 0,
    relegationSpots = 2,
    initialRanks,
    compact = false,
    loading = false,
    comparisonDiffs
}: StandingsTableProps) {
    if (loading) {
        return <StandingsTableSkeleton />;
    }

    const headClass = "px-2 py-3 text-[10px] sm:text-xs uppercase tracking-wider font-bold text-text-secondary border-b border-border-main bg-surface-secondary sticky top-0 z-20";
    const cellClass = "px-2 py-3 text-xs sm:text-sm border-b border-border-subtle transition-colors";

    return (
        <Card className={cn("flex flex-col h-full overflow-hidden", compact && "shadow-none border-none bg-transparent")}>
            {!compact && (
                <CardHeader className="bg-surface-secondary/50 py-3 border-b border-border-main">
                    <CardTitle className="text-base flex items-center gap-2">
                        <span className="text-lg">📊</span> Puan Durumu
                    </CardTitle>
                </CardHeader>
            )}

            {!compact && (
                <div className="px-4 py-2 bg-surface-secondary/30 border-b border-border-main flex gap-3 text-[10px] flex-wrap">
                    <div className="flex items-center gap-1.5">
                        <Badge variant="success" className="w-2 h-2 p-0 rounded-full" />
                        <span className="text-text-secondary">Play-off (İlk {playoffSpots})</span>
                    </div>
                    {secondaryPlayoffSpots > 0 && (
                        <div className="flex items-center gap-1.5">
                            <Badge variant="warning" className="w-2 h-2 p-0 rounded-full" />
                            <span className="text-text-secondary">{playoffSpots + 1}-{playoffSpots + secondaryPlayoffSpots} Bölgesi</span>
                        </div>
                    )}
                    <div className="flex items-center gap-1.5">
                        <Badge variant="destructive" className="w-2 h-2 p-0 rounded-full" />
                        <span className="text-text-secondary">Küme Düşme</span>
                    </div>
                </div>
            )}

            <div className="overflow-x-auto flex-1 custom-scrollbar relative">
                <table className="w-full text-left border-separate border-spacing-0">
                    <thead>
                        <tr>
                            <th scope="col" className={cn(headClass, "sticky left-0 z-30 w-12 text-center pl-4")} aria-label="Sıralama">#</th>
                            <th scope="col" className={cn(headClass, "sticky left-12 z-30 min-w-[140px]")}>Takım</th>
                            <th scope="col" className={cn(headClass, "w-10 text-center")} title="Oynanan Maç" aria-label="Oynanan Maç">OM</th>
                            <th scope="col" className={cn(headClass, "w-10 text-center text-emerald-500")} title="Galibiyet" aria-label="Galibiyet">G</th>
                            <th scope="col" className={cn(headClass, "w-10 text-center text-rose-500")} title="Mağlubiyet" aria-label="Mağlubiyet">M</th>
                            <th scope="col" className={cn(headClass, "w-12 text-center text-amber-500 font-bold")} title="Puan" aria-label="Puan">P</th>
                            <th scope="col" className={cn(headClass, "w-10 text-center hidden md:table-cell")} title="Alınan Set" aria-label="Alınan Set">AS</th>
                            <th scope="col" className={cn(headClass, "w-10 text-center hidden md:table-cell")} title="Verilen Set" aria-label="Verilen Set">VS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {teams.map((team, idx) => {
                            const currentRank = idx + 1;
                            const isChampion = idx === 0;
                            const isPlayoff = idx < playoffSpots;
                            const isSecondaryPlayoff = secondaryPlayoffSpots > 0 && idx >= playoffSpots && idx < playoffSpots + secondaryPlayoffSpots;
                            const isRelegation = idx >= teams.length - relegationSpots;
                            const losses = team.played - team.wins;

                            let rankChangeIcon = null;
                            let pointDiffIcon = null;

                            if (comparisonDiffs) {
                                const diff = comparisonDiffs.find(d => d.name === team.name);
                                if (diff) {
                                    if (diff.rankDiff > 0) rankChangeIcon = <span className="text-emerald-500 text-[10px] ml-1">▲{diff.rankDiff}</span>;
                                    else if (diff.rankDiff < 0) rankChangeIcon = <span className="text-rose-500 text-[10px] ml-1">▼{Math.abs(diff.rankDiff)}</span>;

                                    if (diff.pointDiff > 0) pointDiffIcon = <span className="text-emerald-500 text-[10px] ml-0.5">+{diff.pointDiff}</span>;
                                    else if (diff.pointDiff < 0) pointDiffIcon = <span className="text-rose-500 text-[10px] ml-0.5">{diff.pointDiff}</span>;
                                }
                            } else if (initialRanks && initialRanks.has(team.name)) {
                                const oldRank = initialRanks.get(team.name)!;
                                const diff = oldRank - currentRank;
                                if (diff > 0) rankChangeIcon = <span className="text-emerald-500 text-[10px] ml-1">▲{diff}</span>;
                                else if (diff < 0) rankChangeIcon = <span className="text-rose-500 text-[10px] ml-1">▼{Math.abs(diff)}</span>;
                            }

                            const zoneBg = isChampion ? 'bg-amber-500/5 hover:bg-amber-500/10' :
                                isPlayoff ? 'bg-emerald-500/5 hover:bg-emerald-500/10' :
                                    isSecondaryPlayoff ? 'bg-amber-500/5 hover:bg-amber-500/10' :
                                        isRelegation ? 'bg-rose-500/5 hover:bg-rose-500/10' :
                                            'hover:bg-surface-secondary/50';

                            return (
                                <tr
                                    key={team.name}
                                    className={cn("group group/row transition-colors", zoneBg)}
                                    aria-label={`${currentRank}. sırada olan ${team.name}, ${team.points} puan`}
                                >
                                    <td className={cn(cellClass, "sticky left-0 z-10 text-center font-mono pl-4",
                                        isChampion ? 'bg-amber-50 dark:bg-amber-900/20' :
                                            isPlayoff ? 'bg-emerald-50 dark:bg-emerald-900/20' :
                                                isSecondaryPlayoff ? 'bg-amber-50/50 dark:bg-amber-900/10' :
                                                    isRelegation ? 'bg-rose-50 dark:bg-rose-900/20' :
                                                        'bg-surface-primary group-hover/row:bg-surface-secondary/50'
                                    )}>
                                        <div className="flex items-center justify-center gap-0.5">
                                            <span className={cn(
                                                "w-6 h-6 flex items-center justify-center rounded-full text-[11px] font-bold shadow-sm",
                                                isChampion ? 'bg-amber-500 text-white' :
                                                    isPlayoff ? 'bg-emerald-500 text-white' :
                                                        isSecondaryPlayoff ? 'bg-amber-500 text-white' :
                                                            isRelegation ? 'bg-rose-500 text-white' :
                                                                'bg-surface-secondary text-text-secondary'
                                            )}>
                                                {isChampion ? '1' : currentRank}
                                            </span>
                                            {rankChangeIcon}
                                        </div>
                                    </td>
                                    <td className={cn(cellClass, "sticky left-12 z-10 font-semibold",
                                        isChampion ? 'bg-amber-50 dark:bg-amber-900/20' :
                                            isPlayoff ? 'bg-emerald-50 dark:bg-emerald-900/20' :
                                                isSecondaryPlayoff ? 'bg-amber-50/50 dark:bg-amber-900/10' :
                                                    isRelegation ? 'bg-rose-50 dark:bg-rose-900/20' :
                                                        'bg-surface-primary group-hover/row:bg-surface-secondary/50'
                                    )}>
                                        <Link href={`/takimlar/${generateTeamSlug(team.name)}`} className="flex items-center gap-2 group/link">
                                            <TeamAvatar name={team.name} size="sm" />
                                            <span className={cn(
                                                "truncate max-w-[120px] sm:max-w-none group-hover/link:underline",
                                                isPlayoff ? 'text-emerald-700 dark:text-emerald-400' :
                                                    isSecondaryPlayoff ? 'text-amber-700 dark:text-amber-400' :
                                                        isRelegation ? 'text-rose-700 dark:text-rose-400' :
                                                            'text-text-primary'
                                            )}>
                                                {team.name}
                                            </span>
                                        </Link>
                                    </td>
                                    <td className={cn(cellClass, "text-center text-text-secondary")}>{team.played}</td>
                                    <td className={cn(cellClass, "text-center text-emerald-600 dark:text-emerald-400 font-medium")}>{team.wins}</td>
                                    <td className={cn(cellClass, "text-center text-rose-600 dark:text-rose-400 font-medium")}>{losses}</td>
                                    <td className={cn(cellClass, "text-center font-bold text-amber-600 dark:text-amber-400 bg-surface-secondary/20")}>
                                        {team.points}
                                        {pointDiffIcon}
                                    </td>
                                    <td className={cn(cellClass, "text-center text-text-secondary hidden md:table-cell")}>{team.setsWon}</td>
                                    <td className={cn(cellClass, "text-center text-text-secondary hidden md:table-cell")}>{team.setsLost}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </Card>
    );
}

export default memo(StandingsTable);

```

## File: app\components\Calculator\TeamStatsRadar.tsx
```
"use client";

import React from 'react';
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    ResponsiveContainer,
    PolarRadiusAxis,
} from 'recharts';
import { getTeamTheme } from '../../utils/team-themes';

interface TeamStats {
    attack: number;
    block: number;
    serve: number;
    dig: number;
    reception: number;
    consistency: number;
}

const MOCK_TEAM_STATS: Record<string, TeamStats> = {
    "VakıfBank": { attack: 95, block: 92, serve: 88, dig: 85, reception: 82, consistency: 90 },
    "Eczacıbaşı Dynavit": { attack: 98, block: 88, serve: 92, dig: 82, reception: 85, consistency: 92 },
    "Fenerbahçe Medicana": { attack: 94, block: 90, serve: 95, dig: 88, reception: 90, consistency: 94 },
    "Türk Hava Yolları": { attack: 85, block: 82, serve: 80, dig: 78, reception: 75, consistency: 82 },
    "Galatasaray Daikin": { attack: 88, block: 85, serve: 82, dig: 80, reception: 82, consistency: 85 },
    "Kuzeyboru": { attack: 82, block: 80, serve: 75, dig: 85, reception: 80, consistency: 78 },
};

const DEFAULT_STATS: TeamStats = {
    attack: 70, block: 70, serve: 70, dig: 70, reception: 70, consistency: 70
};

interface TeamStatsRadarProps {
    homeTeam: string;
    awayTeam: string;
}

export function TeamStatsRadar({ homeTeam, awayTeam }: TeamStatsRadarProps) {
    const homeStats = MOCK_TEAM_STATS[homeTeam] || DEFAULT_STATS;
    const awayStats = MOCK_TEAM_STATS[awayTeam] || DEFAULT_STATS;
    const homeTheme = getTeamTheme(homeTeam);
    const awayTheme = getTeamTheme(awayTeam);

    const data = [
        { subject: 'Hücum', A: homeStats.attack, B: awayStats.attack, fullMark: 100 },
        { subject: 'Blok', A: homeStats.block, B: awayStats.block, fullMark: 100 },
        { subject: 'Servis', A: homeStats.serve, B: awayStats.serve, fullMark: 100 },
        { subject: 'Defans', A: homeStats.dig, B: awayStats.dig, fullMark: 100 },
        { subject: 'Manşet', A: homeStats.reception, B: awayStats.reception, fullMark: 100 },
        { subject: 'İstikrar', A: homeStats.consistency, B: awayStats.consistency, fullMark: 100 },
    ];

    return (
        <div className="w-full h-[300px] flex flex-col items-center justify-center">
            {/* Legend */}
            <div className="flex justify-center gap-6 mb-4 text-[10px] font-black uppercase tracking-widest">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ '--team-color': homeTheme.primary, backgroundColor: 'var(--team-color)' } as any} />
                    <span className="text-text-primary">{homeTeam}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ '--team-color': awayTheme.primary, backgroundColor: 'var(--team-color)' } as any} />
                    <span className="text-text-primary">{awayTeam}</span>
                </div>
            </div>

            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis
                        dataKey="subject"
                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }}
                    />
                    <Radar
                        name={homeTeam}
                        dataKey="A"
                        stroke={homeTheme.primary}
                        fill={homeTheme.primary}
                        fillOpacity={0.4}
                    />
                    <Radar
                        name={awayTeam}
                        dataKey="B"
                        stroke={awayTheme.primary}
                        fill={awayTheme.primary}
                        fillOpacity={0.4}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
}

```

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
        return allMatches.filter(m => !activeGroup || m.groupName === activeGroup);
    }, [allMatches, config.hasGroups, activeGroup]);

    const currentTeams = useMemo(() => {
        if (!config.hasGroups) return allTeams;
        return allTeams.filter(t => !activeGroup || t.groupName === activeGroup);
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
            const matchId = `${match.homeTeam}-${match.awayTeam}`;
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
    // Completion Rate for Action Bar
    const totalMatches = initialMatches.length;
    const playedMatches = initialMatches.filter(m => m.isPlayed).length;
    const progress = totalMatches > 0 ? Math.round((playedMatches / totalMatches) * 100) : 0;

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
        groups: ["A. Grup", "B. Grup"],
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

## File: app\components\ui\Badge.tsx
```
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    {
        variants: {
            variant: {
                default:
                    "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
                secondary:
                    "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
                destructive:
                    "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
                outline: "text-text-primary border-border-main",
                success: "border-transparent bg-emerald-500 text-white",
                warning: "border-transparent bg-amber-500 text-white",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
    return (
        <div className={cn(badgeVariants({ variant }), className)} {...props} />
    )
}

export { Badge, badgeVariants }

```

## File: app\components\ui\BottomSheet.tsx
```
"use client";

import * as React from "react";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface BottomSheetProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    className?: string;
}

export function BottomSheet({
    isOpen,
    onClose,
    title,
    children,
    className,
}: BottomSheetProps) {
    // Use useEffect to handle body scroll lock
    React.useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm"
                    />

                    {/* Sheet */}
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className={cn(
                            "fixed bottom-0 left-0 right-0 z-[120] flex flex-col rounded-t-[32px] bg-surface-primary border-t border-border-main shadow-2xl safe-p-bottom max-h-[90vh]",
                            className
                        )}
                    >
                        {/* Handle / Drag Bar */}
                        <div className="flex w-full items-center justify-center p-4">
                            <div className="h-1.5 w-12 rounded-full bg-surface-secondary" />
                        </div>

                        {/* Header */}
                        {title && (
                            <div className="flex items-center justify-between px-6 pb-4">
                                {title && (
                                    <h2 className="text-xl font-black text-text-primary tracking-tight">
                                        {title}
                                    </h2>
                                )}
                                <button
                                    onClick={onClose}
                                    className="rounded-full bg-surface-secondary p-1.5 text-text-muted hover:text-text-primary transition-colors"
                                    aria-label="Kapat"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        )}

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto px-6 pb-8 custom-scrollbar">
                            {children}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

```

## File: app\components\ui\Button.tsx
```
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
    {
        variants: {
            variant: {
                primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow-primary",
                secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-premium-sm",
                outline: "border border-border-main bg-transparent hover:bg-surface-secondary hover:text-text-primary",
                ghost: "hover:bg-surface-secondary hover:text-text-primary",
                destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
                premium: "bg-gradient-to-r from-primary to-accent text-white hover:brightness-110 shadow-glow-primary",
            },
            size: {
                default: "h-10 px-4 py-2",
                sm: "h-9 rounded-md px-3",
                lg: "h-11 rounded-md px-8",
                icon: "h-10 w-10",
            },
            fullWidth: {
                true: "w-full",
            },
        },
        defaultVariants: {
            variant: "primary",
            size: "default",
        },
    }
)

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean
    isLoading?: boolean
    leftIcon?: React.ReactNode
    rightIcon?: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, fullWidth, asChild = false, isLoading, leftIcon, rightIcon, children, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, fullWidth, className }))}
                ref={ref}
                disabled={isLoading || props.disabled}
                aria-busy={isLoading}
                aria-live={isLoading ? "polite" : "off"}
                {...props}
            >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
                {children}
                {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
            </Comp>
        )
    }
)
Button.displayName = "Button"

export { Button, buttonVariants }

```

## File: app\components\ui\Card.tsx
```
import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "rounded-xl border border-border-main bg-surface-primary text-text-primary shadow-premium-sm transition-all hover:shadow-premium-md",
            className
        )}
        {...props}
    />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("flex flex-col space-y-1.5 p-6", className)}
        {...props}
    />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
    <h3
        ref={ref}
        className={cn(
            "text-2xl font-semibold leading-none tracking-tight",
            className
        )}
        {...props}
    />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
    <p
        ref={ref}
        className={cn("text-sm text-text-secondary", className)}
        {...props}
    />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("flex items-center p-6 pt-0", className)}
        {...props}
    />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }

```

## File: app\components\ui\EmptyState.tsx
```
import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "./Button"
import { LucideIcon } from "lucide-react"

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
    title: string
    description?: string
    icon?: LucideIcon
    actionLabel?: string
    onAction?: () => void
}

export function EmptyState({
    title,
    description,
    icon: Icon,
    actionLabel,
    onAction,
    className,
    ...props
}: EmptyStateProps) {
    return (
        <div
            className={cn(
                "flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed border-border-main p-8 text-center animate-in fade-in zoom-in duration-300",
                className
            )}
            {...props}
        >
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-surface-secondary/50 shadow-premium-sm">
                {Icon ? (
                    <Icon className="h-10 w-10 text-text-muted opacity-50" />
                ) : (
                    <div className="h-10 w-10 rounded-full bg-border-subtle" />
                )}
            </div>
            <h3 className="mt-6 text-xl font-black text-text-primary tracking-tight">{title}</h3>
            {description && (
                <p className="mx-auto mt-4 max-w-sm text-sm text-text-secondary leading-relaxed">
                    {description}
                </p>
            )}
            {actionLabel && onAction && (
                <Button
                    variant="primary"
                    onClick={onAction}
                    className="mt-8 shadow-glow-primary px-8"
                >
                    {actionLabel}
                </Button>
            )}
        </div>
    )
}

```

## File: app\components\ui\LevelUpModal.tsx
```
"use client";

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameState } from '../../utils/gameState';
import { Button } from './Button';
import { Trophy, Star, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';

export function LevelUpModal() {
    const { gameState, showLevelUp, clearLevelUp, getLevelTitle } = useGameState();

    useEffect(() => {
        if (showLevelUp) {
            // Play sound would go here
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#10b981', '#fbbf24', '#3b82f6']
            });
        }
    }, [showLevelUp]);

    if (!showLevelUp) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                <motion.div
                    initial={{ scale: 0.5, opacity: 0, y: 100 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.5, opacity: 0, y: 100 }}
                    className="relative w-full max-w-sm bg-surface-primary rounded-[32px] p-8 border border-primary/20 shadow-glow-primary overflow-hidden"
                >
                    {/* Background Glows */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/10 blur-[80px] rounded-full -z-10" />

                    <div className="flex flex-col items-center text-center">
                        <motion.div
                            initial={{ rotate: -20, scale: 0 }}
                            animate={{ rotate: 0, scale: 1 }}
                            transition={{ delay: 0.2, type: "spring" }}
                            className="w-24 h-24 bg-gradient-to-br from-primary to-accent rounded-3xl flex items-center justify-center mb-6 shadow-glow-primary"
                        >
                            <Trophy className="w-12 h-12 text-white" />
                        </motion.div>

                        <h2 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-2">
                            Seviye Atladın!
                        </h2>

                        <div className="text-4xl font-black text-text-primary mb-1">
                            SEVİYE {gameState.level}
                        </div>

                        <div className="px-4 py-1 bg-primary/10 rounded-full text-[11px] font-black text-primary uppercase tracking-wider mb-8">
                            {getLevelTitle()}
                        </div>

                        <div className="grid grid-cols-2 gap-3 w-full mb-8">
                            <div className="bg-surface-secondary p-4 rounded-2xl border border-border-subtle">
                                <div className="text-text-muted text-[9px] font-black uppercase mb-1">Yeni Ödül</div>
                                <div className="flex items-center gap-2 text-text-primary text-xs font-bold">
                                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                    100 Coin
                                </div>
                            </div>
                            <div className="bg-surface-secondary p-4 rounded-2xl border border-border-subtle">
                                <div className="text-text-muted text-[9px] font-black uppercase mb-1">Gelişim</div>
                                <div className="flex items-center gap-2 text-text-primary text-xs font-bold">
                                    <Zap className="w-3.5 h-3.5 text-primary fill-primary" />
                                    +5% Analiz
                                </div>
                            </div>
                        </div>

                        <Button
                            variant="primary"
                            className="w-full h-14 rounded-2xl text-lg font-black shadow-glow-primary"
                            onClick={clearLevelUp}
                        >
                            DEVAM ET
                        </Button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

```

## File: app\components\ui\OnboardingTour.tsx
```
"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./Button";
import { Card } from "./Card";
import { X, ChevronRight, Zap, Trophy, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";

interface Step {
    title: string;
    description: string;
    icon: React.ElementType;
    target?: string;
}

const steps: Step[] = [
    {
        title: "Hoş Geldiniz!",
        description: "VolleySimulator ile ligleri simüle edin, puan durumunu tahmin edin ve sonuçları görün.",
        icon: Trophy,
    },
    {
        title: "Hızlı Tahmin",
        description: "Zap butonuna basarak 'Hızlı Tahmin' moduna geçebilir, skorları anında girebilirsiniz.",
        icon: Zap,
        target: "zap-button",
    },
    {
        title: "Puan Durumu",
        description: "Tahminleriniz anında puan durumuna yansır. Play-off ve Küme düşme hatlarını takip edin.",
        icon: TrendingUp,
        target: "standings-table",
    },
];

export default function OnboardingTour() {
    const [isOpen, setIsOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        const hasSeenTour = localStorage.getItem("hasSeenOnboarding_v1");
        if (!hasSeenTour) {
            setIsOpen(true);
        }
    }, []);

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            completeTour();
        }
    };

    const completeTour = () => {
        setIsOpen(false);
        localStorage.setItem("hasSeenOnboarding_v1", "true");
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#10b981', '#f59e0b', '#3b82f6']
        });
    };

    const skipTour = () => {
        setIsOpen(false);
        localStorage.setItem("hasSeenOnboarding_v1", "true");
    };

    if (!isOpen) return null;

    const current = steps[currentStep];
    const Icon = current.icon;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="w-full max-w-sm"
                >
                    <Card className="relative overflow-hidden border-primary/20 bg-surface-primary shadow-2xl">
                        <div className="absolute top-0 left-0 w-full h-1 bg-surface-secondary">
                            <motion.div
                                className="h-full bg-primary shadow-glow-primary"
                                initial={{ width: 0 }}
                                animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                            />
                        </div>

                        <button
                            onClick={skipTour}
                            className="absolute top-4 right-4 p-1 rounded-full hover:bg-surface-secondary transition-colors text-text-muted"
                            aria-label="Turu Atla"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="p-8 pb-6 flex flex-col items-center text-center">
                            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                                <Icon className="w-8 h-8 text-primary" />
                            </div>

                            <h2 className="text-2xl font-black text-text-primary tracking-tight mb-3">
                                {current.title}
                            </h2>

                            <p className="text-sm text-text-secondary leading-relaxed mb-8">
                                {current.description}
                            </p>

                            <div className="flex w-full gap-3">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="flex-1"
                                    onClick={skipTour}
                                >
                                    Atla
                                </Button>
                                <Button
                                    variant="primary"
                                    size="sm"
                                    className="flex-1 shadow-glow-primary"
                                    onClick={handleNext}
                                    rightIcon={<ChevronRight className="w-4 h-4" />}
                                >
                                    {currentStep === steps.length - 1 ? "Başla!" : "İleri"}
                                </Button>
                            </div>

                            <div className="flex gap-1.5 mt-8">
                                {steps.map((_, i) => (
                                    <div
                                        key={i}
                                        className={cn(
                                            "w-1.5 h-1.5 rounded-full transition-all duration-300",
                                            i === currentStep ? "w-4 bg-primary" : "bg-border-subtle"
                                        )}
                                    />
                                ))}
                            </div>
                        </div>
                    </Card>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

```

## File: app\components\ui\Skeleton.tsx
```
import { cn } from "@/lib/utils"

function Skeleton({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn("animate-pulse rounded-md bg-surface-secondary", className)}
            {...props}
        />
    )
}

export function StandingsTableSkeleton() {
    return (
        <div className="space-y-3">
            {[...Array(10)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-surface-primary border border-border-main rounded-xl">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <Skeleton className="h-6 w-32 flex-1" />
                    <div className="flex gap-3">
                        <Skeleton className="w-12 h-6" />
                        <Skeleton className="w-12 h-6" />
                        <Skeleton className="w-12 h-6" />
                    </div>
                </div>
            ))}
        </div>
    )
}

export function MatchCardSkeleton() {
    return (
        <div className="p-4 bg-surface-primary border border-border-main rounded-xl space-y-4">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-4 w-8" />
                <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="w-8 h-8 rounded-full" />
                </div>
            </div>
            <div className="grid grid-cols-4 gap-2">
                <Skeleton className="h-10 rounded-lg" />
                <Skeleton className="h-10 rounded-lg" />
                <Skeleton className="h-10 rounded-lg" />
                <Skeleton className="h-10 rounded-lg" />
            </div>
        </div>
    )
}

export { Skeleton }

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

