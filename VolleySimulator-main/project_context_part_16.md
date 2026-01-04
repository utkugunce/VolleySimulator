# Project Application Context - Part 16

## File: app\utils\validation.ts
```
/**
 * Validation utilities using simple schema-based validation
 * Lightweight alternative to Zod for basic validation needs
 */

// ============================================
// VALIDATION RESULT TYPES
// ============================================

export interface ValidationResult<T> {
    success: boolean;
    data?: T;
    errors?: string[];
}

// ============================================
// BASIC VALIDATORS
// ============================================

export const validators = {
    // String validators
    string: {
        required: (value: unknown, message = 'Bu alan zorunludur'): string | null => {
            if (typeof value !== 'string' || value.trim() === '') return message;
            return null;
        },
        minLength: (min: number) => (value: string, message = `En az ${min} karakter olmalı`): string | null => {
            if (value.length < min) return message;
            return null;
        },
        maxLength: (max: number) => (value: string, message = `En fazla ${max} karakter olmalı`): string | null => {
            if (value.length > max) return message;
            return null;
        },
        email: (value: string, message = 'Geçerli bir e-posta adresi girin'): string | null => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) return message;
            return null;
        },
        pattern: (regex: RegExp, message: string) => (value: string): string | null => {
            if (!regex.test(value)) return message;
            return null;
        }
    },

    // Number validators
    number: {
        required: (value: unknown, message = 'Bu alan zorunludur'): string | null => {
            if (typeof value !== 'number' || isNaN(value)) return message;
            return null;
        },
        min: (min: number) => (value: number, message = `Değer en az ${min} olmalı`): string | null => {
            if (value < min) return message;
            return null;
        },
        max: (max: number) => (value: number, message = `Değer en fazla ${max} olmalı`): string | null => {
            if (value > max) return message;
            return null;
        },
        integer: (value: number, message = 'Tam sayı olmalı'): string | null => {
            if (!Number.isInteger(value)) return message;
            return null;
        }
    },

    // Score validators (volleyball specific)
    score: {
        valid: (value: string, message = 'Geçerli bir skor girin (örn: 3-0, 3-1, 3-2, 2-3, 1-3, 0-3)'): string | null => {
            const validScores = ['3-0', '3-1', '3-2', '2-3', '1-3', '0-3'];
            if (!validScores.includes(value)) return message;
            return null;
        }
    }
};

// ============================================
// SCHEMA-BASED VALIDATION
// ============================================

type ValidatorFn = (value: unknown, message?: string) => string | null;

interface FieldSchema {
    validators: ValidatorFn[];
}

interface Schema {
    [field: string]: FieldSchema;
}

export function validate<T extends Record<string, unknown>>(
    data: T,
    schema: Schema
): ValidationResult<T> {
    const errors: string[] = [];

    for (const [field, fieldSchema] of Object.entries(schema)) {
        const value = data[field];

        for (const validator of fieldSchema.validators) {
            const error = validator(value);
            if (error) {
                errors.push(`${field}: ${error}`);
                break; // Stop on first error for this field
            }
        }
    }

    if (errors.length > 0) {
        return { success: false, errors };
    }

    return { success: true, data };
}

// ============================================
// COMMON SCHEMAS
// ============================================

export const schemas = {
    prediction: {
        score: {
            validators: [
                validators.string.required,
                validators.score.valid
            ]
        }
    },

    user: {
        email: {
            validators: [
                validators.string.required,
                validators.string.email
            ]
        },
        password: {
            validators: [
                validators.string.required,
                validators.string.minLength(6)
            ]
        },
        name: {
            validators: [
                validators.string.required,
                validators.string.minLength(2),
                validators.string.maxLength(50)
            ]
        }
    }
};

// ============================================
// SANITIZATION
// ============================================

export const sanitize = {
    // Remove HTML tags
    stripHtml: (input: string): string => {
        return input.replace(/<[^>]*>/g, '');
    },

    // Escape special characters
    escapeHtml: (input: string): string => {
        const escapeMap: Record<string, string> = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        };
        return input.replace(/[&<>"']/g, char => escapeMap[char]);
    },

    // Trim and normalize whitespace
    normalizeWhitespace: (input: string): string => {
        return input.trim().replace(/\s+/g, ' ');
    },

    // Remove non-alphanumeric characters
    alphanumericOnly: (input: string): string => {
        return input.replace(/[^a-zA-Z0-9\s]/g, '');
    },

    // Sanitize for safe display
    forDisplay: (input: string): string => {
        return sanitize.escapeHtml(sanitize.normalizeWhitespace(input));
    }
};

export default { validators, validate, schemas, sanitize };

```

## File: app\vsl\gunceldurum\page.tsx
```
import { Metadata } from "next";
import { getLeagueData } from "../../utils/serverData";
import VSLDetailedClient from "./VSLDetailedClient";

export const metadata: Metadata = {
    title: "Sultanlar Ligi Güncel Durum",
    description: "Vodafone Sultanlar Ligi puan durumu, fikstür ve maç sonuçları. 2025-2026 sezonu güncel sıralama tablosu.",
    openGraph: {
        title: "Sultanlar Ligi Güncel Durum | VolleySimulator",
        description: "Sultanlar Ligi puan durumu ve fikstür bilgileri.",
    },
};

export default async function VSLDetailedPage() {
    const { teams, fixture } = await getLeagueData("vsl");

    return (
        <VSLDetailedClient
            initialTeams={teams}
            initialMatches={fixture}
        />
    );
}

```

## File: app\vsl\gunceldurum\VSLDetailedClient.tsx
```
"use client";

import { useMemo } from "react";
import { TeamStats, Match } from "../../types";

import StandingsTable from "../../components/Calculator/StandingsTable";
import { sortStandings } from "../../utils/calculatorUtils";
import TeamAvatar from "@/app/components/TeamAvatar";
import LeagueActionBar from "../../components/LeagueTemplate/LeagueActionBar";
import { LEAGUE_CONFIGS } from "../../components/LeagueTemplate/types";

interface VSLDetailedClientProps {
    initialTeams: TeamStats[];
    initialMatches: Match[];
}

export default function VSLDetailedClient({ initialTeams, initialMatches }: VSLDetailedClientProps) {
    const groupName = "Vodafone Sultanlar Ligi";

    const teams = useMemo(() => sortStandings(initialTeams), [initialTeams]);
    const matches = useMemo(() => initialMatches.map((m: Match & { date?: string }) => ({
        ...m,
        matchDate: m.date || m.matchDate
    })), [initialMatches]);

    const playedCount = matches.filter(m => m.isPlayed).length;
    const totalCount = matches.length;
    const completionRate = totalCount > 0 ? Math.round((playedCount / totalCount) * 100) : 0;

    const dayNames = ['PAZAR', 'PAZARTESİ', 'SALI', 'ÇARŞAMBA', 'PERŞEMBE', 'CUMA', 'CUMARTESİ'];

    const formatDate = (dateStr?: string) => {
        if (!dateStr || dateStr.trim() === '') return { formatted: 'TARİH BELİRSİZ', sortKey: '9999-99-99' };
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return { formatted: 'TARİH BELİRSİZ', sortKey: '9999-99-99' };
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            const dayName = dayNames[date.getDay()];
            return { formatted: `${day}/${month}/${year} ${dayName}`, sortKey: dateStr };
        } catch {
            return { formatted: 'TARİH BELİRSİZ', sortKey: '9999-99-99' };
        }
    };

    const groupedMatches = useMemo(() => {
        const matchesByDate: Record<string, { formatted: string; matches: Match[] }> = {};
        const upcomingMatches = matches.filter(m => !m.isPlayed);

        upcomingMatches.forEach(match => {
            const { formatted, sortKey } = formatDate(match.matchDate);
            if (!matchesByDate[sortKey]) {
                matchesByDate[sortKey] = { formatted, matches: [] };
            }
            matchesByDate[sortKey].matches.push(match);
        });

        const sortedDates = Object.keys(matchesByDate).sort();
        return sortedDates.reduce((acc, dateKey) => {
            acc[matchesByDate[dateKey].formatted] = matchesByDate[dateKey].matches;
            return acc;
        }, {} as Record<string, Match[]>);
    }, [matches]);

    return (
        <main className="min-h-screen bg-slate-950 text-slate-100 p-0 sm:p-2 font-sans overflow-hidden">
            <div className="max-w-7xl mx-auto space-y-1 h-full flex flex-col">
                <div className="space-y-3 bg-slate-900/40 p-3 rounded-2xl border border-slate-800/60 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
                    {/* Action Bar using LeagueTemplate */}
                    <LeagueActionBar
                        config={LEAGUE_CONFIGS.vsl}
                        title={LEAGUE_CONFIGS.vsl.name}
                        subtitle="2025-2026 Sezonu Puan Durumu"
                        progress={completionRate}
                        progressLabel={`%${completionRate}`}
                    >
                        {/* Leader Badge */}
                        <div className="hidden sm:flex bg-slate-950/50 px-3 py-1.5 rounded-lg border border-slate-800 text-center flex-col justify-center h-full min-h-[32px]">
                            <div className="text-[9px] font-bold text-slate-500 uppercase leading-none mb-0.5">Lider</div>
                            <div className="text-xs font-bold text-white truncate max-w-[100px] leading-none">{teams[0]?.name}</div>
                        </div>
                        {/* Live Badge */}
                        <div className="px-3 h-8 bg-emerald-950/50 rounded-lg border border-emerald-800/50 flex items-center gap-2">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                            <span className="text-[10px] font-bold text-emerald-400 uppercase hidden sm:inline">Otomatik Güncelleme</span>
                            <span className="text-[10px] font-bold text-emerald-400 uppercase sm:hidden">CANLI</span>
                        </div>
                    </LeagueActionBar>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 h-full">
                        <div className="lg:col-span-2 space-y-1 flex flex-col h-full">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                                <span>📋</span> Puan Durumu
                            </h3>
                            <div className="bg-slate-950/40 rounded-xl overflow-hidden border border-slate-800/50 flex-1 max-h-[calc(100vh-200px)]">
                                <StandingsTable
                                    teams={teams}
                                    playoffSpots={4}
                                    secondaryPlayoffSpots={4}
                                    relegationSpots={2}
                                    compact={true}
                                />
                            </div>
                        </div>

                        <div className="space-y-4 flex flex-col h-full">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                                <span>📅</span> Gelecek Maçlar
                            </h3>
                            <div className="bg-slate-950/40 rounded-xl overflow-hidden border border-slate-800/50 flex-1 relative flex flex-col">
                                <div className="overflow-y-auto p-2 space-y-2 flex-1 custom-scrollbar">
                                    {Object.keys(groupedMatches).length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-full text-slate-500 text-xs italic">
                                            Maç bulunamadı veya sezon tamamlandı.
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {Object.entries(groupedMatches).map(([date, matches], dateIdx) => (
                                                <div key={date} className={dateIdx > 0 ? 'mt-3' : ''}>
                                                    <div className="sticky top-0 bg-slate-950/90 backdrop-blur-sm py-1.5 px-3 rounded-lg border border-slate-800 flex items-center justify-between z-10 mb-2 shadow-sm">
                                                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wide flex items-center gap-2">
                                                            <span>📅</span> {date}
                                                        </span>
                                                        <span className="text-[9px] text-slate-400 bg-slate-800/50 px-2 py-0.5 rounded">{matches.length} maç</span>
                                                    </div>
                                                    <div className="px-1 space-y-2">
                                                        {matches.map(match => {
                                                            const homeRank = teams.findIndex(t => t.name === match.homeTeam) + 1;
                                                            const awayRank = teams.findIndex(t => t.name === match.awayTeam) + 1;

                                                            // Determine importance (simplified logic closer to FixtureList)
                                                            let borderColor = 'border-slate-800/50';
                                                            let importanceColor = null;

                                                            // Top 4 clash
                                                            if (homeRank <= 4 && awayRank <= 4 && homeRank > 0 && awayRank > 0) {
                                                                borderColor = 'border-emerald-700/30';
                                                                importanceColor = 'from-emerald-600/80 to-emerald-500/60 text-emerald-100';
                                                            }
                                                            // Relegation clash (Assuming 14 teams)
                                                            else if (homeRank >= 13 && awayRank >= 13) {
                                                                borderColor = 'border-rose-700/30';
                                                                importanceColor = 'from-rose-600/80 to-rose-500/60 text-rose-100';
                                                            }

                                                            return (
                                                                <div key={match.id || `${match.homeTeam}-${match.awayTeam}`} className={`bg-slate-900 border ${borderColor} rounded-lg p-2.5 shadow-sm hover:border-slate-700 transition-all group relative overflow-hidden`}>

                                                                    {importanceColor && (
                                                                        <div className={`absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r ${importanceColor.split(' ')[0]}`}></div>
                                                                    )}

                                                                    {/* Time Badge */}
                                                                    <div className="flex justify-center -mt-1 mb-2">
                                                                        <span className="text-[9px] font-mono bg-slate-950/80 px-2 py-0.5 rounded text-slate-400 border border-slate-800/50 shadow-sm">
                                                                            {match.matchTime && match.matchTime !== '00:00' ? match.matchTime : '--:--'}
                                                                        </span>
                                                                    </div>

                                                                    <div className="flex items-center justify-between gap-2">
                                                                        <div className="flex-1 flex items-center justify-end gap-2 overflow-hidden">
                                                                            {homeRank > 0 && homeRank <= 4 && (
                                                                                <span className="text-[9px] font-bold text-emerald-500 bg-emerald-950/30 px-1 py-0.5 rounded hidden sm:inline-block">{homeRank}.</span>
                                                                            )}
                                                                            <div className="text-[11px] font-bold text-slate-200 truncate group-hover:text-white transition-colors text-right leading-tight">{match.homeTeam}</div>
                                                                            <TeamAvatar name={match.homeTeam} size="xs" />
                                                                        </div>

                                                                        <div className="mx-1 shrink-0">
                                                                            {match.isPlayed ? (
                                                                                <div className="px-2.5 py-1 bg-slate-950 rounded text-[11px] font-mono font-bold text-slate-200 border border-slate-800 shadow-inner tracking-wider">
                                                                                    {match.homeScore}-{match.awayScore}
                                                                                </div>
                                                                            ) : (
                                                                                <div className="text-[10px] text-slate-600 font-mono font-bold">vs</div>
                                                                            )}
                                                                        </div>

                                                                        <div className="flex-1 flex items-center justify-start gap-2 overflow-hidden">
                                                                            <TeamAvatar name={match.awayTeam} size="xs" />
                                                                            <div className="text-[11px] font-bold text-slate-200 truncate group-hover:text-white transition-colors text-left leading-tight">{match.awayTeam}</div>
                                                                            {awayRank > 0 && awayRank <= 4 && (
                                                                                <span className="text-[9px] font-bold text-emerald-500 bg-emerald-950/30 px-1 py-0.5 rounded hidden sm:inline-block">{awayRank}.</span>
                                                                            )}
                                                                        </div>
                                                                    </div>

                                                                    <div className="mt-2 pt-1.5 border-t border-slate-800/50 flex justify-between items-center opacity-60 group-hover:opacity-100 transition-opacity">
                                                                        <div className="flex items-center gap-1 text-[9px] text-slate-500">
                                                                            <span>📍</span>
                                                                            <span className="truncate max-w-[150px]">{match.venue || 'Salon Belirtilmemiş'}</span>
                                                                        </div>
                                                                        {!match.isPlayed && (
                                                                            <div className="text-[9px] text-indigo-400 font-medium">Yakında</div>
                                                                        )}
                                                                        {match.isPlayed && (
                                                                            <div className="text-[9px] text-emerald-500 font-medium">Bitti</div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

```

## File: app\vsl\playoffs\page.tsx
```
import { Metadata } from "next";
import { getLeagueData } from "../../utils/serverData";
import VSLPlayoffsClient from "./VSLPlayoffsClient";

export const metadata: Metadata = {
    title: "Sultanlar Ligi Playoff Simülasyonu",
    description: "Vodafone Sultanlar Ligi playoff simülasyonu. Çeyrek final, yarı final ve final eşleşmelerini simüle edin.",
    openGraph: {
        title: "Sultanlar Ligi Playoff Simülasyonu | VolleySimulator",
        description: "Sultanlar Ligi playoff eşleşmelerini simüle edin.",
    },
};

export default async function PlayoffsVSLPage() {
    const { teams, fixture } = await getLeagueData("vsl");

    return (
        <VSLPlayoffsClient initialTeams={teams} initialMatches={fixture} />
    );
}

```

## File: app\vsl\playoffs\VSLPlayoffsClient.tsx
```
"use client";

import { useEffect, useState, useMemo } from "react";
import { TeamStats, Match } from "../../types";
import Link from "next/link";
import { calculateLiveStandings } from "../../utils/calculatorUtils";

import TeamAvatar from "../../components/TeamAvatar";

interface VSLPlayoffsClientProps {
    initialTeams: TeamStats[];
    initialMatches: Match[];
}

export default function VSLPlayoffsClient({ initialTeams, initialMatches }: VSLPlayoffsClientProps) {
    const [groupOverrides, setGroupOverrides] = useState<Record<string, string>>({});
    const [playoffOverrides, setPlayoffOverrides] = useState<Record<string, string>>({});
    const [isLoaded, setIsLoaded] = useState(false);

    // Tab states
    const [activeTab1_4, setActiveTab1_4] = useState<'semi' | 'final' | '3rd'>('semi');
    const [activeTab5_8, setActiveTab5_8] = useState<'semi' | 'final' | '7th'>('semi');

    useEffect(() => {
        const savedPlayoff = localStorage.getItem('vslPlayoffScenarios');
        if (savedPlayoff) {
            try {
                setPlayoffOverrides(JSON.parse(savedPlayoff));
            } catch (e) { console.error(e); }
        }

        const savedGroup = localStorage.getItem('vslGroupScenarios');
        if (savedGroup) {
            try {
                setGroupOverrides(JSON.parse(savedGroup));
            } catch (e) { console.error(e); }
        }

        setIsLoaded(true);
    }, []);

    const teams = useMemo(() => {
        return calculateLiveStandings(initialTeams, initialMatches, groupOverrides);
    }, [initialTeams, initialMatches, groupOverrides]);

    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('vslPlayoffScenarios', JSON.stringify(playoffOverrides));
        }
    }, [playoffOverrides, isLoaded]);

    const remainingMatchesCount = useMemo(() => {
        let remaining = initialMatches.filter((m: Match) => !m.isPlayed).length;
        remaining = Math.max(0, remaining - Object.keys(groupOverrides).length);
        return remaining;
    }, [initialMatches, groupOverrides]);

    const isGroupsComplete = remainingMatchesCount === 0;

    const top4 = useMemo(() => teams.slice(0, 4), [teams]);
    const teams5to8 = useMemo(() => teams.slice(4, 8), [teams]);

    const handleScoreChange = (matchId: string, score: string) => {
        const newOverrides = { ...playoffOverrides };
        if (score) {
            newOverrides[matchId] = score;
        } else {
            delete newOverrides[matchId];
        }
        setPlayoffOverrides(newOverrides);
    };

    const calculateSeriesResult = (matchId: string, homeTeam: string | null, awayTeam: string | null, seriesLength: 3 | 5) => {
        if (!homeTeam || !awayTeam) return { winner: null, loser: null, homeWins: 0, awayWins: 0 };

        let homeWins = 0;
        let awayWins = 0;
        const requiredWins = seriesLength === 3 ? 2 : 3;

        for (let i = 1; i <= seriesLength; i++) {
            const score = playoffOverrides[`${matchId}-m${i}`];
            if (score) {
                const [h, a] = score.split('-').map(Number);
                if (h > a) homeWins++;
                else if (a > h) awayWins++;
            }
        }

        let winner = null;
        let loser = null;

        if (homeWins >= requiredWins) {
            winner = homeTeam;
            loser = awayTeam;
        } else if (awayWins >= requiredWins) {
            winner = awayTeam;
            loser = homeTeam;
        }

        return { winner, loser, homeWins, awayWins };
    };

    const renderBracketMatch = (matchId: string, homeTeam: string | null, awayTeam: string | null, label: string, seriesType: 5 | 3 = 5) => {
        const result = calculateSeriesResult(matchId, homeTeam, awayTeam, seriesType);
        const homeSeriesWin = result.winner === homeTeam;
        const awaySeriesWin = result.winner === awayTeam;

        const matchInputs = [];
        for (let i = 1; i <= seriesType; i++) {
            let isHigherSeedHome = true;
            if (i === 1) isHigherSeedHome = false;
            if (i === 4) isHigherSeedHome = false;

            const matchHomeTeam = isHigherSeedHome ? homeTeam : awayTeam;
            const matchAwayTeam = isHigherSeedHome ? awayTeam : homeTeam;

            matchInputs.push(
                <div key={i} className="flex flex-col gap-1 mb-2">
                    <label htmlFor={`score-select-${matchId}-${i}`} className="text-xs text-slate-500 uppercase font-bold pl-1 block">
                        {i}. Maç: {matchHomeTeam || 'Ev'} vs {matchAwayTeam || 'Deplasman'}
                    </label>
                    <select
                        id={`score-select-${matchId}-${i}`}
                        value={playoffOverrides[`${matchId}-m${i}`] || ''}
                        onChange={(e) => handleScoreChange(`${matchId}-m${i}`, e.target.value)}
                        className="w-full p-2 bg-slate-900 border border-slate-700/50 rounded text-xs text-white focus:border-rose-500 transition-colors"
                    >
                        <option value="">Oynanmadı</option>
                        <option value="3-0">3-0</option>
                        <option value="3-1">3-1</option>
                        <option value="3-2">3-2</option>
                        <option value="2-3">2-3</option>
                        <option value="1-3">1-3</option>
                        <option value="0-3">0-3</option>
                    </select>
                </div>
            );
        }

        return (
            <div className="bg-slate-800 rounded-lg p-3 border border-slate-700 space-y-3 min-w-[240px]">
                <div className="flex justify-between items-center border-b border-slate-700/50 pb-2">
                    <div className="text-xs text-rose-400 font-bold uppercase tracking-wider">{label}</div>
                    <div className="text-xs font-bold text-slate-400 bg-slate-900 px-2 py-0.5 rounded">
                        Seri: {result.homeWins}-{result.awayWins}
                    </div>
                </div>

                <div className={`flex items-center justify-between p-2 rounded transition-colors ${homeSeriesWin ? 'bg-emerald-500/20 border border-emerald-500/30' : 'bg-slate-900/30'}`}>
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        <TeamAvatar name={homeTeam || ''} size="xs" />
                        <span className={`text-sm truncate ${homeSeriesWin ? 'text-emerald-400 font-bold' : 'text-slate-300'}`}>
                            {homeTeam || 'TBD (Üst Sıra)'}
                        </span>
                    </div>
                    {homeSeriesWin && <span className="text-xs text-emerald-400">🏆</span>}
                </div>

                <div className={`flex items-center justify-between p-2 rounded transition-colors ${awaySeriesWin ? 'bg-emerald-500/20 border border-emerald-500/30' : 'bg-slate-900/30'}`}>
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        <TeamAvatar name={awayTeam || ''} size="xs" />
                        <span className={`text-sm truncate ${awaySeriesWin ? 'text-emerald-400 font-bold' : 'text-slate-300'}`}>
                            {awayTeam || 'TBD (Alt Sıra)'}
                        </span>
                    </div>
                    {awaySeriesWin && <span className="text-xs text-emerald-400">🏆</span>}
                </div>

                {homeTeam && awayTeam && (
                    <div className="bg-slate-900/50 p-2 rounded border border-slate-800 mt-2">
                        <div className="text-xs text-slate-500 mb-2 font-bold text-center border-b border-slate-700 pb-1">MAÇ SKORLARI</div>
                        <div className="grid grid-cols-2 gap-2">
                            {matchInputs}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const getWinner = (matchId: string, homeTeam: string | null, awayTeam: string | null, seriesLength: 3 | 5 = 3): string | null => {
        return calculateSeriesResult(matchId, homeTeam, awayTeam, seriesLength).winner;
    };

    const getLoser = (matchId: string, homeTeam: string | null, awayTeam: string | null, seriesLength: 3 | 5 = 3): string | null => {
        return calculateSeriesResult(matchId, homeTeam, awayTeam, seriesLength).loser;
    };

    const semi1Home = top4[0]?.name || null;
    const semi1Away = top4[3]?.name || null;
    const semi2Home = top4[1]?.name || null;
    const semi2Away = top4[2]?.name || null;

    const semi1Winner = getWinner('vsl-semi-1', semi1Home, semi1Away, 3);
    const semi1Loser = getLoser('vsl-semi-1', semi1Home, semi1Away, 3);
    const semi2Winner = getWinner('vsl-semi-2', semi2Home, semi2Away, 3);
    const semi2Loser = getLoser('vsl-semi-2', semi2Home, semi2Away, 3);

    const finalWinner = getWinner('vsl-final', semi1Winner, semi2Winner, 5);
    const finalLoser = getLoser('vsl-final', semi1Winner, semi2Winner, 5);

    const thirdPlaceWinner = getWinner('vsl-3rd', semi1Loser, semi2Loser, 3);
    const thirdPlaceLoser = getLoser('vsl-3rd', semi1Loser, semi2Loser, 3);

    const semi58_1Home = teams5to8[0]?.name || null;
    const semi58_1Away = teams5to8[3]?.name || null;
    const semi58_2Home = teams5to8[1]?.name || null;
    const semi58_2Away = teams5to8[2]?.name || null;

    const semi58_1Winner = getWinner('vsl-58-semi-1', semi58_1Home, semi58_1Away, 3);
    const semi58_1Loser = getLoser('vsl-58-semi-1', semi58_1Home, semi58_1Away, 3);
    const semi58_2Winner = getWinner('vsl-58-semi-2', semi58_2Home, semi58_2Away, 3);
    const semi58_2Loser = getLoser('vsl-58-semi-2', semi58_2Home, semi58_2Away, 3);

    const fifthPlaceWinner = getWinner('vsl-58-final', semi58_1Winner, semi58_2Winner, 3);
    const fifthPlaceLoser = getLoser('vsl-58-final', semi58_1Winner, semi58_2Winner, 3);
    const seventhPlaceWinner = getWinner('vsl-58-7th', semi58_1Loser, semi58_2Loser, 3);
    const seventhPlaceLoser = getLoser('vsl-58-7th', semi58_1Loser, semi58_2Loser, 3);

    const allPlayoffsComplete = Boolean(
        finalWinner && finalLoser &&
        thirdPlaceWinner && thirdPlaceLoser &&
        fifthPlaceWinner && fifthPlaceLoser &&
        seventhPlaceWinner && seventhPlaceLoser
    );

    const finalStandings = allPlayoffsComplete ? [
        { rank: 1, team: finalWinner, badge: '🏆', color: 'text-amber-400', bgColor: 'bg-amber-500/20', borderColor: 'border-amber-500/30' },
        { rank: 2, team: finalLoser, badge: '🥈', color: 'text-amber-300', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/20' },
        { rank: 3, team: thirdPlaceWinner, badge: '🥉', color: 'text-amber-200', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/20' },
        { rank: 4, team: thirdPlaceLoser, badge: '', color: 'text-blue-400', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/20' },
        { rank: 5, team: fifthPlaceWinner, badge: '', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/20' },
        { rank: 6, team: fifthPlaceLoser, badge: '', color: 'text-purple-400', bgColor: 'bg-purple-500/10', borderColor: 'border-purple-500/20' },
        { rank: 7, team: seventhPlaceWinner, badge: '', color: 'text-slate-400', bgColor: 'bg-slate-800/50', borderColor: 'border-slate-700/50' },
        { rank: 8, team: seventhPlaceLoser, badge: '', color: 'text-slate-400', bgColor: 'bg-slate-800/50', borderColor: 'border-slate-700/50' },
    ] : [];

    return (
        <main className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex flex-col gap-1">
                    <h1 className="font-bold text-white text-lg tracking-tight leading-none hidden sm:block">Sultanlar Ligi Play-Off</h1>
                    <p className="text-[10px] text-slate-400 hidden sm:block">Şampiyonluk ve sıralama mücadelesi 2025-2026</p>
                </div>

                {!isGroupsComplete && (
                    <div className="bg-rose-500/10 border border-rose-500/20 text-rose-200 p-4 rounded-lg flex items-center gap-3">
                        <span className="text-2xl">⚠️</span>
                        <div>
                            <p className="font-bold text-sm">Lig Etabı Henüz Tamamlanmadı</p>
                            <p className="text-xs opacity-70">
                                Play-Off senaryoları mevcut sıralamaya göre hesaplanmaktadır.
                                Kesin sonuçlar için önce lig maçlarını tamamlayın.
                            </p>
                        </div>
                    </div>
                )}

                <div className="relative">
                    {!isGroupsComplete && (
                        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-20 flex flex-col items-center justify-start pt-16 rounded-xl">
                            <div className="text-6xl mb-4">🔒</div>
                            <h2 className="text-xl font-bold text-white mb-2">Play-Off Kilitli</h2>
                            <p className="text-slate-400 text-sm text-center max-w-md mb-4">
                                Play-Off senaryolarını düzenleyebilmek için önce tüm lig maçlarını tahmin etmeniz gerekmektedir.
                            </p>
                            <p className="text-rose-400 font-medium">
                                {remainingMatchesCount} maç eksik
                            </p>
                            <Link href="/vsl/tahminoyunu" className="mt-4 px-4 py-2 bg-rose-700 hover:bg-rose-600 text-white font-bold rounded-lg transition-colors">
                                Tahminleri Tamamla →
                            </Link>
                        </div>
                    )}

                    <div className={`${!isGroupsComplete ? 'opacity-30 pointer-events-none select-none' : ''} space-y-12`}>
                        <div className="bg-gradient-to-br from-rose-900/30 to-slate-900/50 border border-rose-500/20 rounded-xl p-6">
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                                Play-Off 1. Etap (1-4)
                                <span className="text-xs text-rose-400 ml-auto">Şampiyonluk Mücadelesi</span>
                            </h2>

                            <div className="flex gap-2 border-b border-rose-500/20 mb-6 overflow-x-auto pb-2">
                                <button
                                    onClick={() => setActiveTab1_4('semi')}
                                    className={`px-4 py-2 text-sm font-bold rounded-t-lg transition-colors whitespace-nowrap ${activeTab1_4 === 'semi' ? 'bg-rose-700 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                                >
                                    Yarı Final
                                </button>
                                <button
                                    onClick={() => setActiveTab1_4('final')}
                                    className={`px-4 py-2 text-sm font-bold rounded-t-lg transition-colors whitespace-nowrap ${activeTab1_4 === 'final' ? 'bg-amber-700 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                                >
                                    Final
                                </button>
                                <button
                                    onClick={() => setActiveTab1_4('3rd')}
                                    className={`px-4 py-2 text-sm font-bold rounded-t-lg transition-colors whitespace-nowrap ${activeTab1_4 === '3rd' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                                >
                                    3.lük Maçı
                                </button>
                            </div>

                            <div className="min-h-[300px]">
                                {activeTab1_4 === 'semi' && (
                                    <div className="space-y-6">
                                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Yarı Final (3 Maç Üzerinden)</div>
                                        <div className="grid md:grid-cols-2 gap-6">
                                            {renderBracketMatch('vsl-semi-1', semi1Home, semi1Away, '1. vs 4. (Yarı Final 1)', 3)}
                                            {renderBracketMatch('vsl-semi-2', semi2Home, semi2Away, '2. vs 3. (Yarı Final 2)', 3)}
                                        </div>
                                    </div>
                                )}

                                {activeTab1_4 === 'final' && (
                                    <div className="space-y-6">
                                        <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">Şampiyonluk Finali (5 Maç Üzerinden)</div>
                                        <div className="max-w-md">
                                            {renderBracketMatch('vsl-final', semi1Winner, semi2Winner, 'FİNAL', 5)}
                                        </div>

                                        {finalWinner && (
                                            <div className="bg-gradient-to-r from-amber-500/20 to-amber-600/10 border border-amber-500/30 rounded-lg p-6 text-center max-w-md animate-in fade-in zoom-in duration-500">
                                                <div className="text-5xl mb-2">🏆</div>
                                                <div className="text-sm text-amber-400 uppercase tracking-wider font-bold">2025-2026 Şampiyonu</div>
                                                <div className="text-3xl font-black text-white mt-1">{finalWinner}</div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab1_4 === '3rd' && (
                                    <div className="space-y-6">
                                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">3.lük Mücadelesi (3 Maç Üzerinden)</div>
                                        <div className="max-w-md">
                                            {renderBracketMatch('vsl-3rd', semi1Loser, semi2Loser, '3.lük Maçı', 3)}
                                        </div>

                                        {thirdPlaceWinner && (
                                            <div className="bg-slate-800/50 border border-slate-600/30 rounded-lg p-4 text-center max-w-md">
                                                <div className="text-2xl mb-1">🥉</div>
                                                <div className="text-xs text-slate-400">3. Sıra</div>
                                                <div className="text-xl font-bold text-white">{thirdPlaceWinner}</div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-amber-900/30 to-slate-900/50 border border-amber-500/20 rounded-xl p-6">
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                                Play-Off 2. Etap (5-8)
                                <span className="text-xs text-amber-400 ml-auto">Sıralama Mücadelesi</span>
                            </h2>

                            <div className="flex gap-2 border-b border-amber-500/20 mb-6 overflow-x-auto pb-2">
                                <button
                                    onClick={() => setActiveTab5_8('semi')}
                                    className={`px-4 py-2 text-sm font-bold rounded-t-lg transition-colors whitespace-nowrap ${activeTab5_8 === 'semi' ? 'bg-amber-700 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                                >
                                    Yarı Final
                                </button>
                                <button
                                    onClick={() => setActiveTab5_8('final')}
                                    className={`px-4 py-2 text-sm font-bold rounded-t-lg transition-colors whitespace-nowrap ${activeTab5_8 === 'final' ? 'bg-emerald-700 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                                >
                                    5.lik Maçı
                                </button>
                                <button
                                    onClick={() => setActiveTab5_8('7th')}
                                    className={`px-4 py-2 text-sm font-bold rounded-t-lg transition-colors whitespace-nowrap ${activeTab5_8 === '7th' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                                >
                                    7.lik Maçı
                                </button>
                            </div>

                            <div className="min-h-[300px]">
                                {activeTab5_8 === 'semi' && (
                                    <div className="space-y-6">
                                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Yarı Final (3 Maç Üzerinden)</div>
                                        <div className="grid md:grid-cols-2 gap-6">
                                            {renderBracketMatch('vsl-58-semi-1', semi58_1Home, semi58_1Away, '5. vs 8.', 3)}
                                            {renderBracketMatch('vsl-58-semi-2', semi58_2Home, semi58_2Away, '6. vs 7.', 3)}
                                        </div>
                                    </div>
                                )}

                                {activeTab5_8 === 'final' && (
                                    <div className="space-y-6">
                                        <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">5.lik Mücadelesi (3 Maç Üzerinden)</div>
                                        <div className="max-w-md">
                                            {renderBracketMatch('vsl-58-final', semi58_1Winner, semi58_2Winner, '5.lik Maçı', 3)}
                                        </div>
                                    </div>
                                )}

                                {activeTab5_8 === '7th' && (
                                    <div className="space-y-6">
                                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">7.lik Mücadelesi (3 Maç Üzerinden)</div>
                                        <div className="max-w-md">
                                            {renderBracketMatch('vsl-58-7th', semi58_1Loser, semi58_2Loser, '7.lik Maçı', 3)}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {allPlayoffsComplete && (
                            <div className="bg-gradient-to-br from-amber-900/20 via-slate-900/50 to-emerald-900/20 border border-amber-500/30 rounded-xl p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                                    <span className="text-3xl">🏅</span>
                                    <div>
                                        <div>Final Sıralaması</div>
                                        <div className="text-xs font-normal text-slate-400">2025-2026 Sultanlar Ligi</div>
                                    </div>
                                </h2>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                    {finalStandings.map((item) => (
                                        <div
                                            key={item.rank}
                                            className={`${item.bgColor} ${item.borderColor} border rounded-xl p-4 flex items-center gap-3 transition-all hover:scale-[1.02]`}
                                        >
                                            <div className={`text-3xl font-black ${item.color} min-w-[40px] text-center`}>
                                                {item.badge || `${item.rank}.`}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-xs text-slate-500 uppercase tracking-wider">
                                                    {item.rank}. Sıra
                                                </div>
                                                <div className={`font-bold truncate ${item.color}`}>
                                                    {item.team}
                                                </div>
                                            </div>
                                            {item.rank <= 3 && (
                                                <TeamAvatar name={item.team || ''} size="sm" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}

```

## File: app\vsl\stats\page.tsx
```
import { Metadata } from "next";
import { getLeagueData } from "../../utils/serverData";
import VSLStatsClient from "./VSLStatsClient";

export const metadata: Metadata = {
    title: "Sultanlar Ligi İstatistikler",
    description: "Vodafone Sultanlar Ligi takım istatistikleri, performans analizleri ve karşılaştırmaları. 2025-2026 sezonu detaylı veriler.",
    openGraph: {
        title: "Sultanlar Ligi İstatistikler | VolleySimulator",
        description: "Sultanlar Ligi takım istatistikleri ve performans analizleri.",
    },
};

export default async function VSLStatsPage() {
    const { teams, fixture } = await getLeagueData("vsl");

    return (
        <VSLStatsClient initialTeams={teams} initialMatches={fixture} />
    );
}

```

## File: app\vsl\stats\VSLStatsClient.tsx
```
"use client";

import { TeamStats, Match } from "../../types";
import StatsTemplate from "../../components/LeagueTemplate/StatsTemplate";
import { LEAGUE_CONFIGS } from "../../components/LeagueTemplate/types";

interface VSLStatsClientProps {
    initialTeams: TeamStats[];
    initialMatches: Match[];
}

export default function VSLStatsClient({ initialTeams, initialMatches }: VSLStatsClientProps) {
    return (
        <StatsTemplate
            config={LEAGUE_CONFIGS.vsl}
            initialTeams={initialTeams}
            initialMatches={initialMatches}
        />
    );
}

```

## File: app\vsl\tahminoyunu\loading.tsx
```
import { SkeletonTable } from "../../components/Skeleton";

export default function VSLCalculatorLoading() {
    return (
        <main className="min-h-screen bg-slate-950 text-slate-100 p-2 sm:p-4 font-sans pb-20 sm:pb-4">
            <div className="w-full max-w-[1600px] mx-auto flex flex-col h-[calc(100vh-2rem)] gap-4">
                {/* Header skeleton */}
                <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-4">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                            <div className="h-8 w-48 bg-slate-800 rounded animate-pulse" />
                            <div className="h-6 w-32 bg-slate-800/50 rounded animate-pulse" />
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-20 bg-slate-800 rounded animate-pulse" />
                            <div className="h-8 w-20 bg-slate-800 rounded animate-pulse" />
                        </div>
                    </div>
                    {/* Progress bar skeleton */}
                    <div className="mt-4 h-2 w-full bg-slate-800 rounded-full animate-pulse" />
                </div>

                {/* Content grid skeleton */}
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0 overflow-hidden">
                    <div className="lg:col-span-7">
                        <SkeletonTable rows={12} columns={8} />
                    </div>
                    <div className="lg:col-span-5">
                        <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-4 space-y-4">
                            <div className="h-6 w-32 bg-slate-800 rounded animate-pulse" />
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 bg-slate-700 rounded-full animate-pulse" />
                                        <div className="h-4 w-24 bg-slate-700 rounded animate-pulse" />
                                    </div>
                                    <div className="h-6 w-16 bg-slate-700 rounded animate-pulse" />
                                    <div className="flex items-center gap-2">
                                        <div className="h-4 w-24 bg-slate-700 rounded animate-pulse" />
                                        <div className="w-6 h-6 bg-slate-700 rounded-full animate-pulse" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

```

## File: app\vsl\tahminoyunu\page.tsx
```
import { Suspense } from "react";
import { Metadata } from "next";
import { getLeagueData } from "../../utils/serverData";
import VSLCalculatorClient from "./VSLCalculatorClient";
import ErrorBoundary from "../../components/ErrorBoundary";
import { SkeletonPage } from "../../components/Skeleton";

export const metadata: Metadata = {
    title: "Vodafone Sultanlar Ligi Tahmin Oyunu",
    description: "Sultanlar Ligi maç sonuçlarını tahmin edin, puan kazanın ve liderlik tablosunda yerinizi alın. 2025-2026 sezonu.",
    openGraph: {
        title: "Vodafone Sultanlar Ligi Tahmin Oyunu",
        description: "Sultanlar Ligi maç sonuçlarını tahmin edin, puan kazanın ve liderlik tablosunda yerinizi alın.",
    },
};

export default async function VSLTahminOyunuPage() {
    const { teams, fixture } = await getLeagueData("vsl");

    return (
        <ErrorBoundary>
            <Suspense fallback={<SkeletonPage />}>
                <VSLCalculatorClient
                    initialTeams={teams}
                    initialMatches={fixture}
                />
            </Suspense>
        </ErrorBoundary>
    );
}

```

## File: app\vsl\tahminoyunu\VSLCalculatorClient.tsx
```
import { TeamStats, Match } from "../../types";
import CalculatorTemplate from "../../components/LeagueTemplate/CalculatorTemplate";
import { LEAGUE_CONFIGS } from "../../components/LeagueTemplate/types";

interface VSLCalculatorClientProps {
    initialTeams: TeamStats[];
    initialMatches: Match[];
}

export default function VSLCalculatorClient({ initialTeams, initialMatches }: VSLCalculatorClientProps) {
    return (
        <CalculatorTemplate
            config={LEAGUE_CONFIGS.vsl}
            initialTeams={initialTeams}
            initialMatches={initialMatches}
        />
    );
}

```

## File: components\ui\accordion.tsx
```
"use client"

import * as React from "react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

const Accordion = AccordionPrimitive.Root

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn("border-b", className)}
    {...props}
  />
))
AccordionItem.displayName = "AccordionItem"

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex flex-1 items-center justify-between py-4 text-sm font-medium transition-all hover:underline text-left [&[data-state=open]>svg]:rotate-180",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
))
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={cn("pb-4 pt-0", className)}>{children}</div>
  </AccordionPrimitive.Content>
))
AccordionContent.displayName = AccordionPrimitive.Content.displayName

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }

```

## File: components\ui\alert.tsx
```
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground [&>svg~*]:pl-7",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive:
          "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
))
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }

```

## File: components\ui\avatar.tsx
```
"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"

import { cn } from "@/lib/utils"

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className
    )}
    {...props}
  />
))
Avatar.displayName = AvatarPrimitive.Root.displayName

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full", className)}
    {...props}
  />
))
AvatarImage.displayName = AvatarPrimitive.Image.displayName

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted",
      className
    )}
    {...props}
  />
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

export { Avatar, AvatarImage, AvatarFallback }

```

## File: components\ui\badge.tsx
```
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }

```

## File: components\ui\button.tsx
```
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

```

## File: components\ui\card.tsx
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
      "rounded-xl border bg-card text-card-foreground shadow",
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
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("font-semibold leading-none tracking-tight", className)}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
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

## File: components\ui\checkbox.tsx
```
"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "grid place-content-center peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn("grid place-content-center text-current")}
    >
      <Check className="h-4 w-4" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }

```

## File: components\ui\collapsible.tsx
```
"use client"

import * as CollapsiblePrimitive from "@radix-ui/react-collapsible"

const Collapsible = CollapsiblePrimitive.Root

const CollapsibleTrigger = CollapsiblePrimitive.CollapsibleTrigger

const CollapsibleContent = CollapsiblePrimitive.CollapsibleContent

export { Collapsible, CollapsibleTrigger, CollapsibleContent }

```

## File: components\ui\command.tsx
```
"use client"

import * as React from "react"
import { type DialogProps } from "@radix-ui/react-dialog"
import { Command as CommandPrimitive } from "cmdk"
import { Search } from "lucide-react"

import { cn } from "@/lib/utils"
import { Dialog, DialogContent } from "@/components/ui/dialog"

const Command = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ className, ...props }, ref) => (
  <CommandPrimitive
    ref={ref}
    className={cn(
      "flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground",
      className
    )}
    {...props}
  />
))
Command.displayName = CommandPrimitive.displayName

const CommandDialog = ({ children, ...props }: DialogProps) => {
  return (
    <Dialog {...props}>
      <DialogContent className="overflow-hidden p-0">
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  )
}

const CommandInput = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({ className, ...props }, ref) => (
  <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
    <CommandPrimitive.Input
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  </div>
))

CommandInput.displayName = CommandPrimitive.Input.displayName

const CommandList = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    className={cn("max-h-[300px] overflow-y-auto overflow-x-hidden", className)}
    {...props}
  />
))

CommandList.displayName = CommandPrimitive.List.displayName

const CommandEmpty = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>((props, ref) => (
  <CommandPrimitive.Empty
    ref={ref}
    className="py-6 text-center text-sm"
    {...props}
  />
))

CommandEmpty.displayName = CommandPrimitive.Empty.displayName

const CommandGroup = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    className={cn(
      "overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground",
      className
    )}
    {...props}
  />
))

CommandGroup.displayName = CommandPrimitive.Group.displayName

const CommandSeparator = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 h-px bg-border", className)}
    {...props}
  />
))
CommandSeparator.displayName = CommandPrimitive.Separator.displayName

const CommandItem = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default gap-2 select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled=true]:pointer-events-none data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
      className
    )}
    {...props}
  />
))

CommandItem.displayName = CommandPrimitive.Item.displayName

const CommandShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn(
        "ml-auto text-xs tracking-widest text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}
CommandShortcut.displayName = "CommandShortcut"

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
}

```

## File: components\ui\dialog.tsx
```
"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const Dialog = DialogPrimitive.Root

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}

```

## File: components\ui\dropdown-menu.tsx
```
"use client"

import * as React from "react"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { Check, ChevronRight, Circle } from "lucide-react"

import { cn } from "@/lib/utils"

const DropdownMenu = DropdownMenuPrimitive.Root

const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger

const DropdownMenuGroup = DropdownMenuPrimitive.Group

const DropdownMenuPortal = DropdownMenuPrimitive.Portal

const DropdownMenuSub = DropdownMenuPrimitive.Sub

const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup

const DropdownMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> & {
    inset?: boolean
  }
>(({ className, inset, children, ...props }, ref) => (
  <DropdownMenuPrimitive.SubTrigger
    ref={ref}
    className={cn(
      "flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
      inset && "pl-8",
      className
    )}
    {...props}
  >
    {children}
    <ChevronRight className="ml-auto" />
  </DropdownMenuPrimitive.SubTrigger>
))
DropdownMenuSubTrigger.displayName =
  DropdownMenuPrimitive.SubTrigger.displayName

const DropdownMenuSubContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.SubContent
    ref={ref}
    className={cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-dropdown-menu-content-transform-origin]",
      className
    )}
    {...props}
  />
))
DropdownMenuSubContent.displayName =
  DropdownMenuPrimitive.SubContent.displayName

const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-50 max-h-[var(--radix-dropdown-menu-content-available-height)] min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-dropdown-menu-content-transform-origin]",
        className
      )}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
))
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName

const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0",
      inset && "pl-8",
      className
    )}
    {...props}
  />
))
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName

const DropdownMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <DropdownMenuPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.CheckboxItem>
))
DropdownMenuCheckboxItem.displayName =
  DropdownMenuPrimitive.CheckboxItem.displayName

const DropdownMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <DropdownMenuPrimitive.RadioItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Circle className="h-2 w-2 fill-current" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.RadioItem>
))
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName

const DropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    className={cn(
      "px-2 py-1.5 text-sm font-semibold",
      inset && "pl-8",
      className
    )}
    {...props}
  />
))
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName

const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
))
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName

const DropdownMenuShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn("ml-auto text-xs tracking-widest opacity-60", className)}
      {...props}
    />
  )
}
DropdownMenuShortcut.displayName = "DropdownMenuShortcut"

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
}

```

## File: components\ui\input.tsx
```
import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }

```

## File: components\ui\label.tsx
```
"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
)

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label }

```

## File: components\ui\navigation-menu.tsx
```
import * as React from "react"
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu"
import { cva } from "class-variance-authority"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

const NavigationMenu = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Root>
>(({ className, children, ...props }, ref) => (
  <NavigationMenuPrimitive.Root
    ref={ref}
    className={cn(
      "relative z-10 flex max-w-max flex-1 items-center justify-center",
      className
    )}
    {...props}
  >
    {children}
    <NavigationMenuViewport />
  </NavigationMenuPrimitive.Root>
))
NavigationMenu.displayName = NavigationMenuPrimitive.Root.displayName

const NavigationMenuList = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.List>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.List
    ref={ref}
    className={cn(
      "group flex flex-1 list-none items-center justify-center space-x-1",
      className
    )}
    {...props}
  />
))
NavigationMenuList.displayName = NavigationMenuPrimitive.List.displayName

const NavigationMenuItem = NavigationMenuPrimitive.Item

const navigationMenuTriggerStyle = cva(
  "group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=open]:text-accent-foreground data-[state=open]:bg-accent/50 data-[state=open]:hover:bg-accent data-[state=open]:focus:bg-accent"
)

const NavigationMenuTrigger = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <NavigationMenuPrimitive.Trigger
    ref={ref}
    className={cn(navigationMenuTriggerStyle(), "group", className)}
    {...props}
  >
    {children}{" "}
    <ChevronDown
      className="relative top-[1px] ml-1 h-3 w-3 transition duration-300 group-data-[state=open]:rotate-180"
      aria-hidden="true"
    />
  </NavigationMenuPrimitive.Trigger>
))
NavigationMenuTrigger.displayName = NavigationMenuPrimitive.Trigger.displayName

const NavigationMenuContent = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Content>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.Content
    ref={ref}
    className={cn(
      "left-0 top-0 w-full data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52 md:absolute md:w-auto ",
      className
    )}
    {...props}
  />
))
NavigationMenuContent.displayName = NavigationMenuPrimitive.Content.displayName

const NavigationMenuLink = NavigationMenuPrimitive.Link

const NavigationMenuViewport = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Viewport>
>(({ className, ...props }, ref) => (
  <div className={cn("absolute left-0 top-full flex justify-center")}>
    <NavigationMenuPrimitive.Viewport
      className={cn(
        "origin-top-center relative mt-1.5 h-[var(--radix-navigation-menu-viewport-height)] w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90 md:w-[var(--radix-navigation-menu-viewport-width)]",
        className
      )}
      ref={ref}
      {...props}
    />
  </div>
))
NavigationMenuViewport.displayName =
  NavigationMenuPrimitive.Viewport.displayName

const NavigationMenuIndicator = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Indicator>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Indicator>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.Indicator
    ref={ref}
    className={cn(
      "top-full z-[1] flex h-1.5 items-end justify-center overflow-hidden data-[state=visible]:animate-in data-[state=hidden]:animate-out data-[state=hidden]:fade-out data-[state=visible]:fade-in",
      className
    )}
    {...props}
  >
    <div className="relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm bg-border shadow-md" />
  </NavigationMenuPrimitive.Indicator>
))
NavigationMenuIndicator.displayName =
  NavigationMenuPrimitive.Indicator.displayName

export {
  navigationMenuTriggerStyle,
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
}

```

## File: components\ui\popover.tsx
```
"use client"

import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"

import { cn } from "@/lib/utils"

const Popover = PopoverPrimitive.Root

const PopoverTrigger = PopoverPrimitive.Trigger

const PopoverAnchor = PopoverPrimitive.Anchor

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-popover-content-transform-origin]",
        className
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
))
PopoverContent.displayName = PopoverPrimitive.Content.displayName

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor }

```

## File: components\ui\progress.tsx
```
"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-2 w-full overflow-hidden rounded-full bg-primary/20",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 bg-primary transition-all"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }

```

## File: components\ui\radio-group.tsx
```
"use client"

import * as React from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { Circle } from "lucide-react"

import { cn } from "@/lib/utils"

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      className={cn("grid gap-2", className)}
      {...props}
      ref={ref}
    />
  )
})
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        "aspect-square h-4 w-4 rounded-full border border-primary text-primary shadow focus:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        <Circle className="h-3.5 w-3.5 fill-primary" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
})
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName

export { RadioGroup, RadioGroupItem }

```

## File: components\ui\scroll-area.tsx
```
"use client"

import * as React from "react"
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"

import { cn } from "@/lib/utils"

const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>
>(({ className, children, ...props }, ref) => (
  <ScrollAreaPrimitive.Root
    ref={ref}
    className={cn("relative overflow-hidden", className)}
    {...props}
  >
    <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">
      {children}
    </ScrollAreaPrimitive.Viewport>
    <ScrollBar />
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>
))
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName

const ScrollBar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>(({ className, orientation = "vertical", ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    className={cn(
      "flex touch-none select-none transition-colors",
      orientation === "vertical" &&
        "h-full w-2.5 border-l border-l-transparent p-[1px]",
      orientation === "horizontal" &&
        "h-2.5 flex-col border-t border-t-transparent p-[1px]",
      className
    )}
    {...props}
  >
    <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-border" />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
))
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName

export { ScrollArea, ScrollBar }

```

## File: components\ui\select.tsx
```
"use client"

import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { Check, ChevronDown, ChevronUp } from "lucide-react"

import { cn } from "@/lib/utils"

const Select = SelectPrimitive.Root

const SelectGroup = SelectPrimitive.Group

const SelectValue = SelectPrimitive.Value

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background data-[placeholder]:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
))
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  >
    <ChevronUp className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>
))
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  >
    <ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
))
SelectScrollDownButton.displayName =
  SelectPrimitive.ScrollDownButton.displayName

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "relative z-50 max-h-[--radix-select-content-available-height] min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-select-content-transform-origin]",
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className
      )}
      position={position}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          "p-1",
          position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
))
SelectContent.displayName = SelectPrimitive.Content.displayName

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("px-2 py-1.5 text-sm font-semibold", className)}
    {...props}
  />
))
SelectLabel.displayName = SelectPrimitive.Label.displayName

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
))
SelectItem.displayName = SelectPrimitive.Item.displayName

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
))
SelectSeparator.displayName = SelectPrimitive.Separator.displayName

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
}

```

