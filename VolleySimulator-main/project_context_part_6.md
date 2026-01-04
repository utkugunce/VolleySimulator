# Project Application Context - Part 6

## File: app\cev-challenge\tahminoyunu\CEVChallengeTahminOyunuClient.tsx
```
"use client";

import { useEffect, useState, useMemo } from "react";

import TeamAvatar from "@/app/components/TeamAvatar";
import { useToast } from "../../components";
import { useGameState } from "../../utils/gameState";
import { sounds } from "../../utils/sounds";

interface Match {
    id: number;
    round: string;
    leg?: number;
    date: string;
    homeTeam: string;
    awayTeam: string;
    homeScore: number | null;
    awayScore: number | null;
    isPlayed: boolean;
}

interface CEVChallengeData {
    league: string;
    season: string;
    currentStage: string;
    teams: any[];
    fixture: Match[];
}

const ROUNDS = ["Qualification Rounds", "Main Round", "4th Finals", "Semi Finals", "Finals", "Final Phase"];
const ROUND_LABELS: Record<string, string> = {
    "Qualification Rounds": "Eleme Turları",
    "Main Round": "Ana Tablo",
    "4th Finals": "Çeyrek Final",
    "Semi Finals": "Yarı Final",
    "Finals": "Final",
    "Final Phase": "Final Aşaması"
};

const TURKISH_TEAMS = ["Galatasaray Daikin ISTANBUL", "Kuzeyboru", "THY ISTANBUL"];

export default function CEVChallengeTahminOyunuClient({ initialData }: { initialData: CEVChallengeData }) {
    const { showToast, showUndoToast } = useToast();
    const { addXP, recordPrediction, unlockAchievement, hasAchievement, gameState } = useGameState();

    const [activeRound, setActiveRound] = useState<string>(
        ROUND_LABELS[initialData.currentStage] ? initialData.currentStage : (initialData.fixture.length > 0 ? initialData.fixture[0].round : "Main Round")
    );
    const [overrides, setOverrides] = useState<Record<string, string>>({});

    const availableRounds = useMemo(() => {
        const roundsInData = new Set(initialData.fixture.map(m => m.round));
        return ROUNDS.filter(r => roundsInData.has(r));
    }, [initialData.fixture]);

    const roundMatches = useMemo(() => {
        return initialData.fixture.filter(m => m.round === activeRound);
    }, [initialData.fixture, activeRound]);

    // Load saved predictions
    useEffect(() => {
        const saved = localStorage.getItem('cevChallengePredictions');
        if (saved) {
            try {
                setOverrides(JSON.parse(saved));
            } catch (e) { console.error(e); }
        }
    }, []);

    // Save predictions
    useEffect(() => {
        localStorage.setItem('cevChallengePredictions', JSON.stringify(overrides));
    }, [overrides]);

    const handleScoreChange = (matchId: string, score: string) => {
        const newOverrides = { ...overrides };
        const wasNew = !overrides[matchId];

        if (score) {
            newOverrides[matchId] = score;

            if (wasNew) {
                addXP(10);
                sounds.scoreSelect();

                if (!hasAchievement('first_prediction')) {
                    unlockAchievement('first_prediction');
                    sounds.achievement();
                }

                if (gameState.stats.totalPredictions >= 49 && !hasAchievement('game_addict')) {
                    unlockAchievement('game_addict');
                    sounds.achievement();
                }

                recordPrediction(true);
            }
        } else {
            delete newOverrides[matchId];
        }
        setOverrides(newOverrides);
    };

    const handleResetRound = () => {
        if (!confirm(`${ROUND_LABELS[activeRound]} tahminleriniz silinecek. Emin misiniz?`)) return;
        const newOverrides = { ...overrides };
        roundMatches.forEach(m => {
            delete newOverrides[`match-${m.id}`];
        });
        setOverrides(newOverrides);
        showToast(`${ROUND_LABELS[activeRound]} tahminleri sıfırlandı`, "success");
    };

    const handleResetAll = () => {
        const previousOverrides = { ...overrides };
        setOverrides({});
        localStorage.removeItem('cevChallengePredictions');
        showUndoToast("CEV Challenge Cup tahminleri sıfırlandı", () => {
            setOverrides(previousOverrides);
        });
    };

    const handleRandomize = () => {
        if (!confirm("Oynanmamış maçlar rastgele skorlarla doldurulacak. Onaylıyor musunuz?")) return;
        const newOverrides = { ...overrides };
        const scores = ["3-0", "3-1", "3-2", "2-3", "1-3", "0-3"];
        let count = 0;

        roundMatches.forEach(match => {
            if (match.isPlayed || newOverrides[`match-${match.id}`]) return;
            const randomScore = scores[Math.floor(Math.random() * scores.length)];
            newOverrides[`match-${match.id}`] = randomScore;
            count++;
        });

        setOverrides(newOverrides);
        if (count > 0) {
            sounds.levelUp();
            showToast(`${count} maç rastgele tahmin edildi!`, "success");
            addXP(count * 2);
        }
    };

    const predictedCount = roundMatches.filter(m => overrides[`match-${m.id}`]).length;
    const totalUnplayed = roundMatches.filter(m => !m.isPlayed).length;

    return (
        <main className="min-h-screen bg-slate-950 text-slate-100 p-1 sm:p-2 font-sans">
            <div className="w-full max-w-7xl mx-auto flex flex-col h-full gap-2">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-2 bg-slate-900/40 rounded-xl border border-slate-800">
                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                        <div className="text-center sm:text-left">
                            <h1 className="font-bold text-white text-lg tracking-tight leading-none hidden sm:block">CEV Challenge Cup</h1>
                            <p className="text-[10px] text-slate-400 hidden sm:block">Tahmin Oyunu</p>
                        </div>
                        <div className="flex gap-2 items-center w-full sm:w-auto">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest hidden sm:inline whitespace-nowrap">TUR:</span>
                            <div className="flex gap-1 p-1 bg-slate-950/50 rounded-lg border border-slate-800 items-center">
                                <select
                                    value={activeRound}
                                    onChange={(e) => setActiveRound(e.target.value)}
                                    title="Tur Seçin"
                                    className="px-3 py-1 bg-emerald-600/20 text-emerald-500 text-[10px] uppercase font-black rounded-md border border-emerald-500/30 outline-none cursor-pointer transition-all focus:ring-2 focus:ring-emerald-500/50"
                                >
                                    {availableRounds.map(r => (
                                        <option key={r} value={r} className="bg-slate-900 text-white">
                                            {ROUND_LABELS[r] || r}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                        <div className="flex items-center gap-2 sm:mr-2">
                            <span className="text-xs text-slate-500 hidden lg:inline">
                                {predictedCount}/{totalUnplayed} tahmin
                            </span>
                            <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-emerald-500 transition-all"
                                     
                                    style={{ width: `${totalUnplayed > 0 ? (predictedCount / totalUnplayed) * 100 : 0}%` }}
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleRandomize}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-all"
                            >
                                🎲 Rastgele
                            </button>
                            <button
                                onClick={handleResetRound}
                                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-bold rounded-lg transition-all border border-slate-700"
                            >
                                Turu Sıfırla
                            </button>
                            <button
                                onClick={handleResetAll}
                                className="px-3 py-1.5 bg-slate-800 hover:bg-rose-900/50 text-slate-400 hover:text-rose-400 text-xs font-bold rounded-lg transition-all border border-slate-700"
                            >
                                Tümünü Sıfırla
                            </button>
                        </div>
                    </div>
                </div>

                {/* Matches Grid */}
                <div className="bg-slate-900/40 rounded-2xl border border-slate-800/60 p-3 space-y-3">
                    <h2 className="text-xl font-black italic uppercase tracking-tighter text-emerald-500">
                        {ROUND_LABELS[activeRound] || activeRound}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {roundMatches.map(match => {
                            const matchId = `match-${match.id}`;
                            const prediction = overrides[matchId];
                            const hasTurkish = TURKISH_TEAMS.some(t => match.homeTeam.includes(t)) || TURKISH_TEAMS.some(t => match.awayTeam.includes(t));

                            return (
                                <div
                                    key={match.id}
                                    id={matchId}
                                    className={`bg-slate-950/60 rounded-xl border p-3 space-y-2 ${hasTurkish ? 'border-emerald-700/50 ring-1 ring-emerald-500/20' : 'border-slate-800/50'
                                        }`}
                                >
                                    {/* Match Header */}
                                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                                        <span>{match.leg === 1 ? "1. Maç" : match.leg === 2 ? "2. Maç" : ""}</span>
                                        <span>{match.date?.split('-').reverse().join('.')}</span>
                                    </div>

                                    {/* Teams */}
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-2 flex-1 overflow-hidden">
                                            <TeamAvatar name={match.homeTeam} size="sm" />
                                            <span className="text-sm font-bold text-slate-200 truncate">
                                                {match.homeTeam}
                                                {TURKISH_TEAMS.some(t => match.homeTeam.includes(t)) && <span className="ml-1">🇹🇷</span>}
                                            </span>
                                        </div>
                                        <div className="px-2">
                                            {match.isPlayed ? (
                                                <span className="text-sm font-bold text-emerald-400">
                                                    {match.homeScore} - {match.awayScore}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-slate-600">VS</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 flex-1 justify-end overflow-hidden">
                                            <span className="text-sm font-bold text-slate-200 truncate text-right">
                                                {TURKISH_TEAMS.some(t => match.awayTeam.includes(t)) && <span className="mr-1">🇹🇷</span>}
                                                {match.awayTeam}
                                            </span>
                                            <TeamAvatar name={match.awayTeam} size="sm" />
                                        </div>
                                    </div>

                                    {/* Score Selection */}
                                    {!match.isPlayed && (
                                        <div className="flex flex-wrap gap-1 pt-2 border-t border-slate-800/50">
                                            {["3-0", "3-1", "3-2", "2-3", "1-3", "0-3"].map(score => {
                                                const isSelected = prediction === score;
                                                return (
                                                    <button
                                                        key={score}
                                                        onClick={() => handleScoreChange(matchId, isSelected ? "" : score)}
                                                        className={`
                                                            px-2 py-1 text-xs rounded border transition-all
                                                            ${isSelected
                                                                ? 'bg-emerald-600 border-emerald-400 text-white font-bold shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                                                                : 'bg-slate-900 border-slate-700 text-slate-500 hover:bg-slate-800 hover:border-slate-500'}
                                                        `}
                                                    >
                                                        {score}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {roundMatches.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                            <span className="text-4xl mb-2">🏐</span>
                            <p className="text-sm">Bu tur için henüz maç planlanmadı.</p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}

```

## File: app\cev-challenge\tahminoyunu\page.tsx
```
import fs from 'fs';
import path from 'path';
import { Metadata } from "next";
import CEVChallengeTahminOyunuClient from './CEVChallengeTahminOyunuClient';

export const metadata: Metadata = {
    title: "CEV Challenge Cup Tahmin Oyunu",
    description: "CEV Challenge Cup maç sonuçlarını tahmin edin. Avrupa kupası maçlarını tahmin ederek puan kazanın.",
    openGraph: {
        title: "CEV Challenge Cup Tahmin Oyunu | VolleySimulator",
        description: "Challenge Cup maç sonuçlarını tahmin edin ve liderlik tablosunda yerinizi alın.",
    },
};

export default async function CEVChallengeTahminOyunuPage() {
    const filePath = path.join(process.cwd(), 'data', 'cev-challenge-cup-data.json');
    let data = null;

    try {
        if (fs.existsSync(filePath)) {
            const fileContent = fs.readFileSync(filePath, 'utf8');
            const sourceData = JSON.parse(fileContent);

            const fixture: any[] = [];
            let matchCounter = 1;

            const parseScore = (scoreStr: string | null) => {
                if (!scoreStr || !scoreStr.includes('-')) return { home: null, away: null };
                const parts = scoreStr.split('-').map(p => parseInt(p.trim()));
                return { home: isNaN(parts[0]) ? null : parts[0], away: isNaN(parts[1]) ? null : parts[1] };
            };

            if (sourceData.phases) {
                sourceData.phases.forEach((phase: any) => {
                    const roundName = phase.name;
                    phase.matches.forEach((m: any) => {
                        const { home, away } = parseScore(m.score);
                        fixture.push({
                            id: matchCounter++,
                            round: roundName,
                            leg: 1,
                            date: m.date || 'TBD',
                            homeTeam: m.homeTeam,
                            awayTeam: m.awayTeam,
                            homeScore: home,
                            awayScore: away,
                            isPlayed: m.isPlayed
                        });
                    });
                });
            }

            data = {
                league: "CEV Challenge Cup",
                season: "2025-2026",
                currentStage: "Main Round",
                teams: [],
                fixture: fixture
            };
        }
    } catch (error) {
        console.error('Error reading CEV Challenge data:', error);
    }

    if (!data) {
        return (
            <main className="min-h-screen bg-slate-950 text-slate-100 p-4 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-emerald-500">Veri Yüklenemedi</h1>
                    <p className="text-slate-400 mt-2">CEV Challenge Cup verileri yüklenirken bir hata oluştu.</p>
                </div>
            </main>
        );
    }

    return (
        <CEVChallengeTahminOyunuClient initialData={data} />
    );
}

```

## File: app\cev-cl\anasayfa\page.tsx
```
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface Team {
    name: string;
    groupName: string;
    played: number;
    wins: number;
    points: number;
    setsWon: number;
    setsLost: number;
}

interface Match {
    homeTeam: string;
    awayTeam: string;
    groupName: string;
    date?: string;
    matchTime?: string;
    round?: string;
    isPlayed: boolean;
    homeScore?: number | null;
    awayScore?: number | null;
    venue?: string;
}

const sortStandings = (teams: Team[]): Team[] => {
    return [...teams].sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        const aAvg = a.setsLost > 0 ? a.setsWon / a.setsLost : a.setsWon;
        const bAvg = b.setsLost > 0 ? b.setsWon / b.setsLost : b.setsWon;
        if (bAvg !== aAvg) return bAvg - aAvg;
        return b.setsWon - a.setsWon;
    });
};

export default function CEVCLAnasayfa() {
    const [teams, setTeams] = useState<Team[]>([]);
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPool, setSelectedPool] = useState<string>("Pool A");

    useEffect(() => {
        fetch("/api/cev-cl")
            .then(res => res.json())
            .then(data => {
                setTeams(data.teams || []);
                setMatches(data.fixture || []);
            })
            .finally(() => setLoading(false));
    }, []);

    const pools = ["Pool A", "Pool B", "Pool C", "Pool D", "Pool E"];
    const poolTeams = sortStandings(teams.filter(t => t.groupName === selectedPool));
    const poolMatches = matches.filter(m => m.groupName === selectedPool);
    const upcomingMatches = poolMatches.filter(m => !m.isPlayed).slice(0, 4);
    const playedCount = matches.filter(m => m.isPlayed).length;

    // Turkish teams highlight
    const turkishTeams = ["VakifBank ISTANBUL", "Fenerbahçe Medicana ISTANBUL", "Eczacibasi ISTANBUL", "ANKARA Zeren Spor Kulübü"];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950">
            {/* Hero Header */}
            <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-800 px-4 py-4 relative overflow-hidden">
                <div className="relative max-w-4xl mx-auto">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-bold text-white mb-1">CEV Şampiyonlar Ligi</h1>
                            <p className="text-white/70 text-sm">Kadınlar • 2025-2026</p>
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-bold text-white">{playedCount}</div>
                            <div className="text-xs text-white/60">Oynanan Maç</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 mt-4 space-y-4 pb-6">
                {/* Pool Selector */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {pools.map(pool => (
                        <button
                            key={pool}
                            onClick={() => setSelectedPool(pool)}
                            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${selectedPool === pool
                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                                    : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                                }`}
                        >
                            {pool}
                        </button>
                    ))}
                </div>

                {/* Pool Standings */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                    <div className="bg-slate-800/50 px-4 py-3 flex items-center justify-between border-b border-slate-800">
                        <h3 className="font-bold text-white flex items-center gap-2">
                            <span className="text-blue-400">📊</span> {selectedPool} - Puan Durumu
                        </h3>
                    </div>
                    <div className="divide-y divide-slate-800/50">
                        {poolTeams.map((team, i) => (
                            <div key={team.name} className={`px-4 py-2.5 flex items-center gap-3 ${turkishTeams.includes(team.name) ? "bg-red-900/20" : ""
                                }`}>
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? "bg-blue-600 text-white" :
                                        i === 1 ? "bg-emerald-500 text-white" :
                                            "bg-slate-700 text-slate-400"
                                    }`}>
                                    {i + 1}
                                </div>
                                <div className="flex-1">
                                    <div className="font-medium text-sm text-slate-200 truncate flex items-center gap-2">
                                        {team.name}
                                        {turkishTeams.includes(team.name) && (
                                            <span className="text-xs">🇹🇷</span>
                                        )}
                                    </div>
                                </div>
                                <div className="text-xs text-slate-500">{team.played}M</div>
                                <div className="text-xs text-slate-500">{team.setsWon}-{team.setsLost}</div>
                                <div className="font-bold text-sm text-white w-8 text-right">{team.points}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Pool Matches */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                    <div className="bg-slate-800/50 px-4 py-3 border-b border-slate-800">
                        <h3 className="font-bold text-white flex items-center gap-2">
                            <span className="text-indigo-400">📅</span> {selectedPool} - Maçlar
                        </h3>
                    </div>
                    <div className="divide-y divide-slate-800/50 max-h-96 overflow-y-auto">
                        {poolMatches.map((match, i) => (
                            <div key={i} className={`px-4 py-3 ${(turkishTeams.includes(match.homeTeam) || turkishTeams.includes(match.awayTeam))
                                    ? "bg-red-900/10" : ""
                                }`}>
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="flex-1 text-right text-sm text-slate-300 truncate">
                                        {match.homeTeam}
                                        {turkishTeams.includes(match.homeTeam) && <span className="ml-1">🇹🇷</span>}
                                    </div>
                                    <div className={`px-2 py-0.5 rounded text-xs font-mono ${match.isPlayed
                                            ? "bg-emerald-500/20 text-emerald-400"
                                            : "bg-slate-800 text-slate-500"
                                        }`}>
                                        {match.isPlayed ? `${match.homeScore} - ${match.awayScore}` : "vs"}
                                    </div>
                                    <div className="flex-1 text-sm text-slate-300 truncate">
                                        {turkishTeams.includes(match.awayTeam) && <span className="mr-1">🇹🇷</span>}
                                        {match.awayTeam}
                                    </div>
                                </div>
                                <div className="flex justify-between text-[10px] text-slate-500">
                                    <span>{match.round}</span>
                                    <span>{match.date} {match.matchTime}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Turkish Teams Overview */}
                <div className="bg-slate-900 border border-red-500/30 rounded-2xl overflow-hidden">
                    <div className="bg-red-900/20 px-4 py-3 border-b border-red-500/20">
                        <h3 className="font-bold text-white flex items-center gap-2">
                            <span>🇹🇷</span> Türk Takımları
                        </h3>
                    </div>
                    <div className="divide-y divide-slate-800/50">
                        {teams.filter(t => turkishTeams.includes(t.name)).map((team, i) => (
                            <div key={team.name} className="px-4 py-3 flex items-center gap-3">
                                <div className="flex-1">
                                    <div className="font-medium text-sm text-white">{team.name}</div>
                                    <div className="text-xs text-slate-500">{team.groupName}</div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-white">{team.points} P</div>
                                    <div className="text-xs text-slate-500">{team.wins}G {team.played - team.wins}M</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

```

## File: app\cev-cl\gunceldurum\CEVCLGuncelDurumClient.tsx
```
"use client";

import { useState, useMemo } from "react";
import { TeamStats, Match } from "../../types";

import StandingsTable from "../../components/Calculator/StandingsTable";
import { sortStandings } from "../../utils/calculatorUtils";
import TeamAvatar from "@/app/components/TeamAvatar";
import LeagueActionBar from "../../components/LeagueTemplate/LeagueActionBar";
import { LEAGUE_CONFIGS } from "../../components/LeagueTemplate/types";

interface CEVCLGuncelDurumClientProps {
    initialTeams: TeamStats[];
    initialMatches: Match[];
}

export default function CEVCLGuncelDurumClient({ initialTeams, initialMatches }: CEVCLGuncelDurumClientProps) {
    const [allTeams] = useState<TeamStats[]>(initialTeams);
    const [allMatches] = useState<Match[]>(initialMatches.map((m: any) => ({
        ...m,
        matchDate: m.date || m.matchDate
    })));

    const pools = ["Grup A", "Grup B", "Grup C", "Grup D", "Grup E"];
    const [activePool, setActivePool] = useState<string>("Grup A");

    const backendGroupName = useMemo(() => activePool.replace("Grup", "Pool"), [activePool]);
    const poolTeams = useMemo(() => sortStandings(allTeams.filter(t => t.groupName === backendGroupName)), [allTeams, backendGroupName]);
    const poolMatches = useMemo(() => allMatches.filter(m => m.groupName === backendGroupName), [allMatches, backendGroupName]);

    const playedCount = poolMatches.filter(m => m.isPlayed).length;
    const totalCount = poolMatches.length;
    const completionRate = totalCount > 0 ? Math.round((playedCount / totalCount) * 100) : 0;

    const turkishTeams = ["VakifBank ISTANBUL", "Savino Del Bene SCANDICCI", "Fenerbahçe Medicana ISTANBUL", "Eczacibasi ISTANBUL", "ANKARA Zeren Spor Kulübü"];

    const groupedMatches = useMemo(() => {
        const matchesByDate: Record<string, { formatted: string; matches: Match[] }> = {};
        const upcomingMatches = poolMatches.filter(m => !m.isPlayed);

        upcomingMatches.forEach(match => {
            if (!match.matchDate) return;
            const parts = match.matchDate.split(/[-.]/);
            let year, month, day;
            if (parts[0].length === 4) { [year, month, day] = parts; }
            else { [day, month, year] = parts; }
            if (!year) year = "2025";

            const sortKey = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            const formatted = `${day}/${month}/${year}`;

            if (!matchesByDate[sortKey]) {
                matchesByDate[sortKey] = { formatted, matches: [] };
            }
            matchesByDate[sortKey].matches.push(match);
        });

        const sortedDates = Object.keys(matchesByDate).sort();
        return sortedDates.reduce((acc, dateKey) => {
            acc[dateKey] = matchesByDate[dateKey];
            return acc;
        }, {} as Record<string, { formatted: string, matches: Match[] }>);
    }, [poolMatches]);

    return (
        <main className="min-h-screen bg-slate-950 text-slate-100 p-0 sm:p-2 font-sans overflow-hidden">
            <div className="max-w-7xl mx-auto space-y-1 h-full flex flex-col">
                <div className="space-y-3 bg-slate-900/40 p-3 rounded-2xl border border-slate-800/60 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
                    {/* Action Bar using LeagueTemplate */}
                    <LeagueActionBar
                        config={LEAGUE_CONFIGS['cev-cl']}
                        title={`${LEAGUE_CONFIGS['cev-cl'].name} - ${activePool}`}
                        subtitle="CEV Şampiyonlar Ligi • Güncel Durum"
                        selectorLabel="Grup"
                        selectorValue={activePool}
                        selectorOptions={pools}
                        onSelectorChange={setActivePool}
                        progress={completionRate}
                        progressLabel={`%${completionRate}`}
                    >
                        {/* Leader Badge */}
                        <div className="hidden sm:flex bg-slate-950/50 px-3 py-1.5 rounded-lg border border-slate-800 text-center flex-col justify-center h-full min-h-[32px]">
                            <div className="text-[9px] font-bold text-slate-500 uppercase leading-none mb-0.5">Lider</div>
                            <div className="text-xs font-bold text-white truncate max-w-[100px] leading-none">{poolTeams[0]?.name || "-"}</div>
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
                                <span>📋</span> Puan Durumu Detayları
                            </h3>
                            <div className="bg-slate-950/40 rounded-xl overflow-hidden border border-slate-800/50 flex-1">
                                <StandingsTable teams={poolTeams} playoffSpots={2} relegationSpots={0} compact={true} />
                            </div>
                        </div>

                        <div className="space-y-4 flex flex-col h-full">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                                <span>📅</span> Gelecek Maçlar
                            </h3>
                            <div className="bg-slate-950/40 rounded-xl overflow-hidden border border-slate-800/50 flex-1 relative">
                                <div className="absolute inset-0 overflow-y-auto p-2 space-y-2">
                                    {Object.keys(groupedMatches).length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-full text-slate-500 text-xs italic">
                                            Maç bulunamadı veya sezon tamamlandı.
                                        </div>
                                    ) : (
                                        Object.entries(groupedMatches).map(([dateKey, group], dateIdx) => (
                                            <div key={dateKey} className={dateIdx > 0 ? 'mt-3' : ''}>
                                                <div className="sticky top-0 bg-blue-600/20 px-2 py-1 rounded border border-blue-500/30 mb-2 z-10">
                                                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wide">
                                                        {group.formatted}
                                                    </span>
                                                </div>
                                                <div className="space-y-1.5">
                                                    {group.matches.map((match, idx) => (
                                                        <div key={idx} className="flex items-center justify-between p-2 bg-slate-900/40 rounded border border-slate-800/50 hover:bg-slate-800/50 transition-colors group">
                                                            <div className="flex-1 flex items-center justify-end gap-2 overflow-hidden">
                                                                <span className="text-xs font-bold text-slate-300 text-right truncate">
                                                                    {match.homeTeam}
                                                                    {turkishTeams.includes(match.homeTeam) && <span className="ml-1">🇹🇷</span>}
                                                                </span>
                                                                <TeamAvatar name={match.homeTeam} size="xs" />
                                                            </div>
                                                            <div className="px-3 flex flex-col items-center">
                                                                <span className="text-[10px] font-bold text-slate-600 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">VS</span>
                                                                {match.matchTime && (
                                                                    <span className="text-[9px] text-slate-500 mt-0.5">{match.matchTime}</span>
                                                                )}
                                                            </div>
                                                            <div className="flex-1 flex items-center justify-start gap-2 overflow-hidden">
                                                                <TeamAvatar name={match.awayTeam} size="xs" />
                                                                <span className="text-xs font-bold text-slate-300 text-left truncate">
                                                                    {turkishTeams.includes(match.awayTeam) && <span className="mr-1">🇹🇷</span>}
                                                                    {match.awayTeam}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))
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

## File: app\cev-cl\gunceldurum\page.tsx
```
import { Metadata } from "next";
import { getLeagueData } from "../../utils/serverData";
import CEVCLGuncelDurumClient from "./CEVCLGuncelDurumClient";

export const metadata: Metadata = {
    title: "CEV Şampiyonlar Ligi Güncel Durum",
    description: "CEV Kadınlar Şampiyonlar Ligi puan durumu, grup sıralamaları ve maç sonuçları. Avrupa'nın en prestijli turnuvası.",
    openGraph: {
        title: "CEV Şampiyonlar Ligi Güncel Durum | VolleySimulator",
        description: "Şampiyonlar Ligi grup sıralamaları ve puan durumu.",
    },
};

export default async function CEVCLGuncelDurum() {
    const { teams, fixture } = await getLeagueData("cev-cl");

    return (
        <CEVCLGuncelDurumClient
            initialTeams={teams}
            initialMatches={fixture}
        />
    );
}

```

## File: app\cev-cl\playoffs\CEVCLPlayoffsClient.tsx
```
"use client";

import { useEffect, useState, useMemo } from "react";
import { TeamStats, Match } from "../../types";
import Link from "next/link";

import TeamAvatar from "../../components/TeamAvatar";
import { calculateLiveStandings } from "../../utils/calculatorUtils";

interface PoolData {
    poolName: string;
    teams: TeamStats[];
}

interface CEVCLPlayoffsClientProps {
    initialTeams: TeamStats[];
    initialMatches: Match[];
}

export default function CEVCLPlayoffsClient({ initialTeams, initialMatches }: CEVCLPlayoffsClientProps) {
    // ONE-TIME Normalization to match Calculator Client keys (TR Uppercase)
    const [baseTeams] = useState<TeamStats[]>(() =>
        initialTeams.map(t => ({
            ...t,
            name: t.name.toLocaleUpperCase('tr-TR'),
            groupName: t.groupName.replace('Pool ', '') + ' GRUBU' // Match Calculator style
        }))
    );

    const [allMatches] = useState<Match[]>(() =>
        initialMatches.map(m => ({
            ...m,
            homeTeam: m.homeTeam.toLocaleUpperCase('tr-TR'),
            awayTeam: m.awayTeam.toLocaleUpperCase('tr-TR'),
            groupName: typeof m.groupName === 'string' ? m.groupName.replace('Pool ', '') + ' GRUBU' : m.groupName
        }))
    );

    const [groupOverrides, setGroupOverrides] = useState<Record<string, string>>({});
    const [remainingMatches, setRemainingMatches] = useState(0);
    const [playoffOverrides, setPlayoffOverrides] = useState<Record<string, string>>({});
    const [isLoaded, setIsLoaded] = useState(false);

    // Tab state
    const [activeTabFF, setActiveTabFF] = useState<'semi' | 'final' | '3rd'>('semi');

    // Load Overrides
    useEffect(() => {
        const savedPlayoff = localStorage.getItem('cevclPlayoffScenarios');
        if (savedPlayoff) {
            try {
                setPlayoffOverrides(JSON.parse(savedPlayoff));
            } catch (e) { console.error(e); }
        }

        const savedGroup = localStorage.getItem('cevclGroupScenarios');
        if (savedGroup) {
            try {
                setGroupOverrides(JSON.parse(savedGroup));
            } catch (e) { console.error(e); }
        }

        setIsLoaded(true);
    }, []);

    // Check remaining matches
    useEffect(() => {
        let remaining = allMatches.filter((m: Match) => !m.isPlayed).length;
        if (groupOverrides) {
            const predictedCount = allMatches.filter(m => !m.isPlayed && groupOverrides[`${m.homeTeam}-${m.awayTeam}`]).length;
            remaining = Math.max(0, remaining - predictedCount);
        }
        setRemainingMatches(remaining);
    }, [allMatches, groupOverrides]);


    // Calculate live standings
    const pools = useMemo(() => {
        if (!baseTeams.length) return [];

        const poolNames = ["A GRUBU", "B GRUBU", "C GRUBU", "D GRUBU", "E GRUBU"];
        const calculatedTeams = calculateLiveStandings(baseTeams, allMatches, groupOverrides);

        return poolNames.map(poolName => {
            const poolTeams = calculatedTeams
                .filter((t: TeamStats) => t.groupName === poolName)
                .sort((a: TeamStats, b: TeamStats) => {
                    if (b.wins !== a.wins) return b.wins - a.wins;
                    if (b.points !== a.points) return b.points - a.points;
                    const aRatio = a.setsLost > 0 ? a.setsWon / a.setsLost : a.setsWon;
                    const bRatio = b.setsLost > 0 ? b.setsWon / b.setsLost : b.setsWon;
                    return bRatio - aRatio;
                });
            return { poolName, teams: poolTeams };
        });
    }, [baseTeams, allMatches, groupOverrides]);

    // Save overrides
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('cevclPlayoffScenarios', JSON.stringify(playoffOverrides));
        }
    }, [playoffOverrides, isLoaded]);

    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('cevclGroupScenarios', JSON.stringify(groupOverrides));
        }
    }, [groupOverrides, isLoaded]);

    const isGroupsComplete = remainingMatches === 0;

    const handleScoreChange = (matchId: string, score: string) => {
        const newOverrides = { ...playoffOverrides };
        if (score) {
            newOverrides[matchId] = score;
        } else {
            delete newOverrides[matchId];
        }
        setPlayoffOverrides(newOverrides);
    };

    const handlePredictAll = () => {
        const newGroupOverrides = { ...groupOverrides };
        const possibleScores = ['3-0', '3-1', '3-2', '2-3', '1-3', '0-3'];

        let addedCount = 0;
        allMatches.forEach(m => {
            if (!m.isPlayed) {
                const key = `${m.homeTeam}-${m.awayTeam}`;
                if (!newGroupOverrides[key]) {
                    newGroupOverrides[key] = possibleScores[Math.floor(Math.random() * possibleScores.length)];
                    addedCount++;
                }
            }
        });

        if (addedCount > 0) {
            setGroupOverrides(newGroupOverrides);
        }
    };

    // Get pool winners and runners-up
    const poolWinners = pools.map(p => p.teams[0]?.name || null);
    const poolRunnersUp = pools.map(p => p.teams[1]?.name || null);
    const poolThirds = pools.map(p => p.teams[2]?.name || null);

    // Rank pool winners
    const rankedWinners = pools
        .map((p, idx) => ({ name: p.teams[0]?.name, points: p.teams[0]?.points || 0, poolIdx: idx }))
        .sort((a, b) => b.points - a.points);

    // Rank runners-up
    const rankedRunnersUp = pools
        .map((p, idx) => ({ name: p.teams[1]?.name, points: p.teams[1]?.points || 0, poolIdx: idx }))
        .sort((a, b) => b.points - a.points);

    // Best 3rd placed team
    const rankedThirds = pools
        .map((p, idx) => ({ name: p.teams[2]?.name, points: p.teams[2]?.points || 0, poolIdx: idx }))
        .sort((a, b) => b.points - a.points);
    const bestThird = rankedThirds[0]?.name || null;

    // Calculate points for a match score
    const getMatchPoints = (score: string | undefined): { home: number, away: number } | null => {
        if (!score) return null;
        const [h, a] = score.split('-').map(Number);

        if (h === 3 && (a === 0 || a === 1)) return { home: 3, away: 0 };
        if (h === 3 && a === 2) return { home: 2, away: 1 };
        if (h === 2 && a === 3) return { home: 1, away: 2 };
        if ((h === 0 || h === 1) && a === 3) return { home: 0, away: 3 };
        return { home: 0, away: 0 };
    };

    const calculateLegacyResult = (matchId: string, homeTeam: string | null, awayTeam: string | null, matchFormat: '2leg' | '1match') => {
        if (!homeTeam || !awayTeam) return { winner: null, loser: null, goldenSetNeeded: false };

        if (matchFormat === '1match') {
            const score = playoffOverrides[`${matchId}-m1`];
            if (!score) return { winner: null, loser: null };
            const [h, a] = score.split('-').map(Number);
            return h > a ? { winner: homeTeam, loser: awayTeam } : { winner: awayTeam, loser: homeTeam };
        }

        // 2 Leg Logic
        const score1 = playoffOverrides[`${matchId}-m1`];
        const score2 = playoffOverrides[`${matchId}-m2`];
        const golden = playoffOverrides[`${matchId}-golden`];

        if (!score1 || !score2) return { winner: null, loser: null, goldenSetNeeded: false };

        const p1 = getMatchPoints(score1);
        const p2 = getMatchPoints(score2);

        if (!p1 || !p2) return { winner: null, loser: null };

        const totalHome = p1.home + p2.home;
        const totalAway = p1.away + p2.away;

        if (totalHome > totalAway) return { winner: homeTeam, loser: awayTeam, goldenSetNeeded: false };
        if (totalAway > totalHome) return { winner: awayTeam, loser: homeTeam, goldenSetNeeded: false };

        if (golden === 'home') return { winner: homeTeam, loser: awayTeam, goldenSetNeeded: true };
        if (golden === 'away') return { winner: awayTeam, loser: homeTeam, goldenSetNeeded: true };

        return { winner: null, loser: null, goldenSetNeeded: true };
    };

    const getWinner = (matchId: string, homeTeam: string | null, awayTeam: string | null, matchFormat: '2leg' | '1match' = '2leg'): string | null => {
        return calculateLegacyResult(matchId, homeTeam, awayTeam, matchFormat).winner;
    };

    const getLoser = (matchId: string, homeTeam: string | null, awayTeam: string | null, matchFormat: '2leg' | '1match' = '2leg'): string | null => {
        return calculateLegacyResult(matchId, homeTeam, awayTeam, matchFormat).loser;
    };

    const randomizeCEVMatch = (matchId: string, matchFormat: '2leg' | '1match') => {
        const newOverrides = { ...playoffOverrides };
        const possibleScores = ['3-0', '3-1', '3-2', '2-3', '1-3', '0-3'];

        const s1 = possibleScores[Math.floor(Math.random() * possibleScores.length)];
        newOverrides[`${matchId}-m1`] = s1;

        if (matchFormat === '2leg') {
            const s2 = possibleScores[Math.floor(Math.random() * possibleScores.length)];
            newOverrides[`${matchId}-m2`] = s2;

            const p1 = getMatchPoints(s1);
            const p2 = getMatchPoints(s2);
            if (p1 && p2) {
                const totalHome = p1.home + p2.home;
                const totalAway = p1.away + p2.away;
                if (totalHome === totalAway) {
                    newOverrides[`${matchId}-golden`] = Math.random() > 0.5 ? 'home' : 'away';
                } else {
                    delete newOverrides[`${matchId}-golden`];
                }
            }
        }
        setPlayoffOverrides(newOverrides);
    };

    const renderBracketMatch = (matchId: string, homeTeam: string | null, awayTeam: string | null, label: string, matchFormat: '2leg' | '1match' = '2leg') => {
        const result = calculateLegacyResult(matchId, homeTeam, awayTeam, matchFormat);
        const homeSeriesWin = result.winner === homeTeam;
        const awaySeriesWin = result.winner === awayTeam;
        const showGoldenSet = result.goldenSetNeeded;

        const formatLabel = matchFormat === '2leg' ? '2 Leg' : 'Tek Maç';

        return (
            <div className="bg-slate-800 rounded-lg p-3 border border-slate-700 space-y-3 min-w-[200px]">
                <div className="flex items-center justify-between border-b border-slate-700/50 pb-2">
                    <div className="text-[10px] text-blue-400 font-bold uppercase tracking-wider flex items-center gap-2">
                        {label}
                        {homeTeam && awayTeam && (
                            <button
                                onClick={() => randomizeCEVMatch(matchId, matchFormat)}
                                className="text-base hover:scale-110 transition-transform"
                                title="Rastgele Oynat"
                            >
                                🎲
                            </button>
                        )}
                    </div>
                    <span className="text-[9px] text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded">{formatLabel}</span>
                </div>

                <div className={`flex items-center justify-between p-2 rounded transition-colors ${homeSeriesWin ? 'bg-gradient-to-r from-emerald-900/40 to-slate-900/50 border border-emerald-500/30' : 'bg-slate-900/50'}`}>
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        <TeamAvatar name={homeTeam || '?'} size="sm" />
                        <span className={`text-xs truncate ${homeSeriesWin ? 'text-emerald-400 font-bold' : 'text-slate-300'}`}>
                            {homeTeam || 'TBD'}
                        </span>
                    </div>
                    {homeSeriesWin && <span className="text-xs text-emerald-400 font-bold">Tur Atladı</span>}
                </div>

                <div className={`flex items-center justify-between p-2 rounded transition-colors ${awaySeriesWin ? 'bg-gradient-to-r from-emerald-900/40 to-slate-900/50 border border-emerald-500/30' : 'bg-slate-900/50'}`}>
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        <TeamAvatar name={awayTeam || '?'} size="sm" />
                        <span className={`text-xs truncate ${awaySeriesWin ? 'text-emerald-400 font-bold' : 'text-slate-300'}`}>
                            {awayTeam || 'TBD'}
                        </span>
                    </div>
                    {awaySeriesWin && <span className="text-xs text-emerald-400 font-bold">Tur Atladı</span>}
                </div>

                {homeTeam && awayTeam && (
                    <div className="bg-slate-900/50 p-2 rounded border border-slate-800 mt-2 space-y-3">
                        {/* Match 1 */}
                        <div className="flex flex-col gap-1">
                            <span className="text-[9px] text-slate-500 uppercase font-bold pl-1">
                                {matchFormat === '1match' ? `${homeTeam} vs ${awayTeam}` : `1. Maç: ${homeTeam} vs ${awayTeam}`}
                            </span>
                            <div className="flex flex-wrap gap-1">
                                {['3-0', '3-1', '3-2', '2-3', '1-3', '0-3'].map(score => {
                                    const isSelected = playoffOverrides[`${matchId}-m1`] === score;
                                    return (
                                        <button
                                            key={score}
                                            onClick={() => handleScoreChange(`${matchId}-m1`, isSelected ? '' : score)}
                                            className={`
                                                px-1.5 py-0.5 text-[10px] rounded border transition-all
                                                ${isSelected
                                                    ? 'bg-blue-600 border-blue-400 text-white font-bold shadow-[0_0_10px_rgba(37,99,235,0.5)]'
                                                    : 'bg-slate-900 border-slate-700 text-slate-500 hover:bg-slate-800 hover:border-slate-500'}
                                            `}
                                        >
                                            {score}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Match 2 (Only for 2leg) */}
                        {matchFormat === '2leg' && (
                            <div className="flex flex-col gap-1">
                                <span className="text-[9px] text-slate-500 uppercase font-bold pl-1">2. Maç: {awayTeam} vs {homeTeam}</span>
                                <div className="flex flex-wrap gap-1">
                                    {['3-0', '3-1', '3-2', '2-3', '1-3', '0-3'].map(score => {
                                        const isSelected = playoffOverrides[`${matchId}-m2`] === score;
                                        return (
                                            <button
                                                key={score}
                                                onClick={() => handleScoreChange(`${matchId}-m2`, isSelected ? '' : score)}
                                                className={`
                                                    px-1.5 py-0.5 text-[10px] rounded border transition-all
                                                    ${isSelected
                                                        ? 'bg-blue-600 border-blue-400 text-white font-bold shadow-[0_0_10px_rgba(37,99,235,0.5)]'
                                                        : 'bg-slate-900 border-slate-700 text-slate-500 hover:bg-slate-800 hover:border-slate-500'}
                                                `}
                                            >
                                                {score}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Golden Set Input */}
                        {showGoldenSet && (
                            <div className="flex flex-col gap-1 animate-in fade-in slide-in-from-top-2">
                                <span className="text-[9px] text-amber-500 uppercase font-bold pl-1 flex items-center gap-1">
                                    <span>🏆</span> Altın Set Kazananı
                                </span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleScoreChange(`${matchId}-golden`, 'home')}
                                        className={`flex-1 py-1.5 text-[10px] rounded border ${playoffOverrides[`${matchId}-golden`] === 'home' ? 'bg-amber-500/20 border-amber-500 text-amber-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}
                                    >
                                        Ev Sahibi
                                    </button>
                                    <button
                                        onClick={() => handleScoreChange(`${matchId}-golden`, 'away')}
                                        className={`flex-1 py-1.5 text-[10px] rounded border ${playoffOverrides[`${matchId}-golden`] === 'away' ? 'bg-amber-500/20 border-amber-500 text-amber-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}
                                    >
                                        Deplasman
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    const playoff6_1_home = bestThird;
    const playoff6_1_away = rankedRunnersUp[0]?.name || null;
    const playoff6_2_home = rankedRunnersUp[4]?.name || null;
    const playoff6_2_away = rankedRunnersUp[1]?.name || null;
    const playoff6_3_home = rankedRunnersUp[3]?.name || null;
    const playoff6_3_away = rankedRunnersUp[2]?.name || null;

    const playoff6_1_winner = getWinner('cevcl-po6-1', playoff6_1_home, playoff6_1_away);
    const playoff6_2_winner = getWinner('cevcl-po6-2', playoff6_2_home, playoff6_2_away);
    const playoff6_3_winner = getWinner('cevcl-po6-3', playoff6_3_home, playoff6_3_away);

    const qf1_home = playoff6_1_winner;
    const qf1_away = rankedWinners[2]?.name || null;
    const qf2_home = playoff6_2_winner;
    const qf2_away = rankedWinners[1]?.name || null;
    const qf3_home = rankedWinners[4]?.name || null;
    const qf3_away = rankedWinners[3]?.name || null;
    const qf4_home = playoff6_3_winner;
    const qf4_away = rankedWinners[0]?.name || null;

    const qf1_winner = getWinner('cevcl-qf-1', qf1_home, qf1_away);
    const qf2_winner = getWinner('cevcl-qf-2', qf2_home, qf2_away);
    const qf3_winner = getWinner('cevcl-qf-3', qf3_home, qf3_away);
    const qf4_winner = getWinner('cevcl-qf-4', qf4_home, qf4_away);

    const sf1_winner = getWinner('cevcl-sf-1', qf1_winner, qf2_winner, '1match');
    const sf2_winner = getWinner('cevcl-sf-2', qf3_winner, qf4_winner, '1match');
    const sf1_loser = getLoser('cevcl-sf-1', qf1_winner, qf2_winner, '1match');
    const sf2_loser = getLoser('cevcl-sf-2', qf3_winner, qf4_winner, '1match');

    const finalWinner = getWinner('cevcl-final', sf1_winner, sf2_winner, '1match');
    const thirdPlaceWinner = getWinner('cevcl-3rd', sf1_loser, sf2_loser, '1match');


    return (
        <main className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex flex-col gap-1">
                    <h1 className="font-bold text-white text-lg tracking-tight leading-none hidden sm:block">CEV Şampiyonlar Ligi</h1>
                    <p className="text-[10px] text-slate-400 hidden sm:block">Playoff ve Final Four 2025-2026</p>
                </div>

                {!isGroupsComplete && (
                    <div className="bg-blue-500/10 border border-blue-500/20 text-blue-200 p-4 rounded-lg flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">⚠️</span>
                            <div>
                                <p className="font-bold text-sm">Havuz Etabı Henüz Tamamlanmadı</p>
                                <p className="text-xs opacity-70">
                                    Play-Off senaryoları mevcut sıralamaya göre hesaplanmaktadır.
                                    Kesin sonuçlar için önce tüm havuz maçlarını tahmin edin.
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handlePredictAll}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded flex items-center gap-1 transition-colors whitespace-nowrap"
                        >
                            <span>🎲</span>
                            Tümünü Tahmin Et
                        </button>
                    </div>
                )}

                <div className="relative">
                    {!isGroupsComplete && (
                        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-20 flex flex-col items-center justify-start pt-16 rounded-xl">
                            <div className="text-6xl mb-4">🔒</div>
                            <h3 className="text-xl font-bold text-white mb-2">Play-Off Kilitli</h3>
                            <p className="text-slate-400 text-sm text-center max-w-md mb-4">
                                Play-Off senaryolarını düzenleyebilmek için önce tüm havuz maçlarını tahmin etmeniz gerekmektedir.
                            </p>
                            <p className="text-blue-400 font-medium">
                                {remainingMatches} maç eksik
                            </p>
                            <div className="flex gap-2 mt-4">
                                <Link href="/cev-cl/tahminoyunu" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg transition-colors border border-slate-700">
                                    Tahminlere Git →
                                </Link>
                                <button
                                    onClick={handlePredictAll}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors shadow-lg shadow-blue-600/20"
                                >
                                    🎲 Tümünü Tahmin Et ({remainingMatches})
                                </button>
                            </div>
                        </div>
                    )}

                    <div className={`${!isGroupsComplete ? 'opacity-30 pointer-events-none select-none' : ''} space-y-6`}>

                        {/* Pool Qualification Status */}
                        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
                            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <span>📊</span> Havuz Durumu ve Kalifikasyon
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                                {pools.map((pool) => (
                                    <div key={pool.poolName} className="bg-slate-800 rounded-lg p-3 border border-slate-700">
                                        <div className="text-xs font-bold text-blue-400 mb-2">{pool.poolName}</div>
                                        <div className="space-y-1">
                                            {pool.teams.slice(0, 3).map((team, tIdx) => (
                                                <div key={team.name} className={`text-xs flex items-center gap-1 ${tIdx === 0 ? 'text-emerald-400' :
                                                    tIdx === 1 ? 'text-amber-400' :
                                                        'text-slate-400'
                                                    }`}>
                                                    <span className="w-4 text-center">{tIdx + 1}.</span>
                                                    <TeamAvatar name={team.name} size="xs" />
                                                    <span className="truncate flex-1">{team.name}</span>
                                                    <span className="text-slate-500">{team.points}P</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* PLAYOFF 6 */}
                        <div className="bg-gradient-to-br from-amber-900/30 to-slate-900/50 border border-amber-500/20 rounded-xl p-6">
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                                Playoff 6
                                <span className="text-xs text-amber-400 ml-auto">Şubat 2026</span>
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {renderBracketMatch('cevcl-po6-1', playoff6_1_home, playoff6_1_away, 'Tie 1: En İyi 3. vs 1. İkinci')}
                                {renderBracketMatch('cevcl-po6-2', playoff6_2_home, playoff6_2_away, 'Tie 2: 5. İkinci vs 2. İkinci')}
                                {renderBracketMatch('cevcl-po6-3', playoff6_3_home, playoff6_3_away, 'Tie 3: 4. İkinci vs 3. İkinci')}
                            </div>
                        </div>

                        {/* QUARTERFINALS */}
                        <div className="bg-gradient-to-br from-blue-900/30 to-slate-900/50 border border-blue-500/20 rounded-xl p-6">
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                                Çeyrek Final
                                <span className="text-xs text-blue-400 ml-auto">Mart 2026</span>
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {renderBracketMatch('cevcl-qf-1', qf1_home, qf1_away, 'QF1: PO6-1 K. vs 3. Birinci')}
                                {renderBracketMatch('cevcl-qf-2', qf2_home, qf2_away, 'QF2: PO6-2 K. vs 2. Birinci')}
                                {renderBracketMatch('cevcl-qf-3', qf3_home, qf3_away, 'QF3: 5. Birinci vs 4. Birinci')}
                                {renderBracketMatch('cevcl-qf-4', qf4_home, qf4_away, 'QF4: PO6-3 K. vs 1. Birinci')}
                            </div>
                        </div>

                        {/* FINAL FOUR */}
                        <div className="bg-gradient-to-br from-purple-900/30 to-slate-900/50 border border-purple-500/20 rounded-xl p-6">
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                                Final Four
                                <span className="text-xs text-purple-400 ml-auto">2-3 Mayıs 2026</span>
                            </h2>

                            <div className="flex gap-2 border-b border-purple-500/20 mb-6 overflow-x-auto pb-2">
                                <button onClick={() => setActiveTabFF('semi')} className={`px-4 py-2 text-sm font-bold rounded-t-lg transition-colors whitespace-nowrap ${activeTabFF === 'semi' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>Yarı Final</button>
                                <button onClick={() => setActiveTabFF('final')} className={`px-4 py-2 text-sm font-bold rounded-t-lg transition-colors whitespace-nowrap ${activeTabFF === 'final' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>Super Final</button>
                                <button onClick={() => setActiveTabFF('3rd')} className={`px-4 py-2 text-sm font-bold rounded-t-lg transition-colors whitespace-nowrap ${activeTabFF === '3rd' ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>3.&apos;lük Maçı</button>
                            </div>

                            <div className="min-h-[250px]">
                                {activeTabFF === 'semi' && (
                                    <div className="grid md:grid-cols-2 gap-6">
                                        {renderBracketMatch('cevcl-sf-1', qf1_winner, qf2_winner, 'SF1: QF1 K. vs QF2 K.', '1match')}
                                        {renderBracketMatch('cevcl-sf-2', qf3_winner, qf4_winner, 'SF2: QF3 K. vs QF4 K.', '1match')}
                                    </div>
                                )}
                                {activeTabFF === 'final' && (
                                    <div>
                                        <div className="max-w-md">
                                            {renderBracketMatch('cevcl-final', sf1_winner, sf2_winner, '🏆 ŞAMPİYONLUK FİNALİ', '1match')}
                                        </div>
                                        {finalWinner && (
                                            <div className="mt-4 bg-gradient-to-r from-amber-500/20 to-amber-600/10 border border-amber-500/30 rounded-lg p-6 text-center max-w-md animate-in fade-in zoom-in duration-500">
                                                <div className="text-5xl mb-2">🏆</div>
                                                <div className="text-sm text-amber-400 uppercase tracking-wider font-bold">CEV Şampiyonlar Ligi Kazananı</div>
                                                <div className="text-3xl font-black text-white mt-1">{finalWinner}</div>
                                            </div>
                                        )}
                                    </div>
                                )}
                                {activeTabFF === '3rd' && (
                                    <div>
                                        <div className="max-w-md">
                                            {renderBracketMatch('cevcl-3rd', sf1_loser, sf2_loser, '🥉 3. lük Mücadelesi', '1match')}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

```

## File: app\cev-cl\playoffs\page.tsx
```
import { Metadata } from "next";
import { getLeagueData } from "../../utils/serverData";
import CEVCLPlayoffsClient from "./CEVCLPlayoffsClient";

export const metadata: Metadata = {
    title: "CEV Şampiyonlar Ligi Playoff Simülasyonu",
    description: "CEV Şampiyonlar Ligi playoff simülasyonu. Çeyrek final, yarı final ve final eşleşmelerini simüle edin.",
    openGraph: {
        title: "CEV Şampiyonlar Ligi Playoff | VolleySimulator",
        description: "Şampiyonlar Ligi playoff eşleşmelerini simüle edin.",
    },
};

export default async function CEVCLPlayoffsPage() {
    const { teams, fixture } = await getLeagueData("cev-cl");

    return (
        <CEVCLPlayoffsClient
            initialTeams={teams}
            initialMatches={fixture}
        />
    );
}

```

## File: app\cev-cl\stats\CEVCLStatsClient.tsx
```
"use client";

import { useMemo } from "react";
import { TeamStats } from "../../types";

import TeamAvatar from "@/app/components/TeamAvatar";

interface CEVCLStatsClientProps {
    initialTeams: TeamStats[];
}

interface ExtendedTeamStats extends TeamStats {
    losses: number;
    winRate: number;
    setRatioDisplay: string;
}

export default function CEVCLStatsClient({ initialTeams }: CEVCLStatsClientProps) {
    const teamsWithStats = useMemo(() => initialTeams.map(t => ({
        ...t,
        losses: (t.played || 0) - (t.wins || 0),
        winRate: (t.played || 0) > 0 ? Math.round(((t.wins || 0) / (t.played || 0)) * 100) : 0,
        setRatioDisplay: (t.setsLost || 0) > 0 ? ((t.setsWon || 0) / (t.setsLost || 0)).toFixed(2) : (t.setsWon || 0).toString()
    })), [initialTeams]);

    const totalMatches = useMemo(() => teamsWithStats.reduce((sum, t) => sum + (t.played || 0), 0) / 2, [teamsWithStats]);
    const totalSets = useMemo(() => teamsWithStats.reduce((sum, t) => sum + (t.setsWon || 0), 0), [teamsWithStats]);
    const avgPointsPerTeam = useMemo(() => teamsWithStats.length > 0
        ? Math.round(teamsWithStats.reduce((sum, t) => sum + (t.points || 0), 0) / teamsWithStats.length)
        : 0, [teamsWithStats]);

    const mostPoints = useMemo(() => [...teamsWithStats].sort((a, b) => (b.points || 0) - (a.points || 0)).slice(0, 5), [teamsWithStats]);
    const mostSets = useMemo(() => [...teamsWithStats].sort((a, b) => (b.setsWon || 0) - (a.setsWon || 0)).slice(0, 5), [teamsWithStats]);
    const leastLosses = useMemo(() => [...teamsWithStats].sort((a, b) => a.losses - b.losses || b.wins - a.wins).slice(0, 5), [teamsWithStats]);
    const bestWinRate = useMemo(() => [...teamsWithStats].filter(t => (t.played || 0) >= 2).sort((a, b) => b.winRate - a.winRate).slice(0, 5), [teamsWithStats]);

    return (
        <main className="min-h-screen bg-slate-950 text-slate-100 p-2 sm:p-4 font-sans">
            <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
                <div className="flex flex-col gap-1 px-1">
                    <h1 className="font-bold text-white text-lg tracking-tight leading-none hidden sm:block">CEV Şampiyonlar Ligi İstatistikleri</h1>
                    <p className="text-[10px] text-slate-400 hidden sm:block">Kadınlar • 2025-2026</p>
                </div>

                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                    <div className="bg-gradient-to-br from-blue-600/20 to-blue-900/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-blue-600/30 text-center">
                        <div className="text-2xl sm:text-4xl font-bold text-blue-400">{Math.round(totalMatches)}</div>
                        <div className="text-[10px] sm:text-xs text-blue-400/70 uppercase tracking-wider mt-1">Toplam Maç</div>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-600/20 to-emerald-900/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-emerald-600/30 text-center">
                        <div className="text-2xl sm:text-4xl font-bold text-emerald-400">{totalSets}</div>
                        <div className="text-[10px] sm:text-xs text-emerald-400/70 uppercase tracking-wider mt-1">Toplam Set</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-600/20 to-purple-900/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-purple-600/30 text-center">
                        <div className="text-2xl sm:text-4xl font-bold text-purple-400">{avgPointsPerTeam}</div>
                        <div className="text-[10px] sm:text-xs text-purple-400/70 uppercase tracking-wider mt-1">Ort. Puan</div>
                    </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3 sm:gap-4 pb-8">
                    <StatCard
                        title="En Çok Puan"
                        icon="💎"
                        teams={mostPoints}
                        statKey="points"
                        color="bg-blue-500"
                        gradient="bg-gradient-to-r from-blue-600 to-indigo-600"
                        suffix="P"
                    />
                    <StatCard
                        title="En Yüksek Galibiyet"
                        icon="📈"
                        teams={bestWinRate}
                        statKey="winRate"
                        color="bg-teal-500"
                        gradient="bg-gradient-to-r from-teal-600 to-cyan-600"
                        suffix="%"
                    />
                    <StatCard
                        title="En Çok Set Alan"
                        icon="🏐"
                        teams={mostSets}
                        statKey="setsWon"
                        color="bg-purple-500"
                        gradient="bg-gradient-to-r from-purple-600 to-pink-600"
                    />
                    <StatCard
                        title="En Az Mağlubiyet"
                        icon="🛡️"
                        teams={leastLosses}
                        statKey="losses"
                        color="bg-emerald-500"
                        gradient="bg-gradient-to-r from-emerald-600 to-green-600"
                        suffix="M"
                    />
                </div>
            </div>
        </main>
    );
}

// Extracted Components
const BarChart = ({ value, max, color }: { value: number; max: number; color: string }) => (
    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden flex-1">
        <div
            className={`h-full ${color} transition-all duration-500`}
            style={{ '--stat-width': `${Math.min((value / (max || 1)) * 100, 100)}%`, width: 'var(--stat-width)' } as any}
        />
    </div>
);

const StatCard = ({ title, icon, teams, statKey, color, gradient, suffix = "" }: {
    title: string; icon: string;
    teams: ExtendedTeamStats[];
    statKey: 'losses' | 'wins' | 'setsWon' | 'setsLost' | 'points' | 'winRate';
    color: string;
    gradient: string;
    suffix?: string;
}) => {
    const maxValue = Math.max(...teams.map(t => Number(t[statKey])), 1);

    return (
        <div className="bg-slate-950/50 backdrop-blur-md rounded-xl border border-slate-800/60 overflow-hidden hover:border-slate-700/80 transition-all duration-300 group shadow-md hover:shadow-lg">
            <div className={`${gradient} px-2.5 py-2 border-b border-white/10 relative overflow-hidden`}>
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="flex items-center justify-between relative z-10">
                    <h3 className="font-bold text-white text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                        <span className="text-sm">{icon}</span> {title}
                    </h3>
                    <span className="text-[9px] font-bold text-white/70 bg-black/20 px-1.5 py-0.5 rounded-full border border-white/10">TOP 5</span>
                </div>
            </div>

            <div className="p-1.5 space-y-1">
                {teams.map((t, idx) => (
                    <div
                        key={t.name}
                        className={`flex items-center gap-2 p-1.5 rounded-lg transition-all ${idx === 0 ? 'bg-gradient-to-r from-white/5 to-transparent border border-white/10' : 'hover:bg-white/5'
                            }`}
                    >
                        <div className={`w-5 h-5 rounded flex items-center justify-center font-bold text-[10px] shadow-sm ${idx === 0 ? 'bg-amber-400 text-amber-950' :
                            idx === 1 ? 'bg-slate-300 text-slate-800' :
                                idx === 2 ? 'bg-amber-700 text-amber-100' :
                                    'bg-slate-800 text-slate-500'
                            }`}>
                            {idx + 1}
                        </div>
                        <TeamAvatar name={t.name} size="xs" />

                        <div className="flex-1 min-w-0">
                            <span className={`text-[11px] font-bold truncate block ${idx === 0 ? 'text-white' : 'text-slate-300'}`} title={t.name}>
                                {t.name}
                            </span>
                        </div>

                        <div className="flex items-center gap-1.5 w-16 justify-end">
                            <div className="h-1 bg-slate-800/50 rounded-full overflow-hidden flex-1 max-w-[30px]">
                                <div className={`h-full ${color} opacity-80`} style={{ '--stat-width': `${Math.min((Number(t[statKey]) / maxValue) * 100, 100)}%`, width: 'var(--stat-width)' } as any}></div>
                            </div>
                            <span className={`text-[11px] font-bold min-w-[24px] text-right ${idx === 0 ? 'text-white' : 'text-slate-400'}`}>
                                {t[statKey]}{suffix}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

```

## File: app\cev-cl\stats\page.tsx
```
import { Metadata } from "next";
import { getLeagueData } from "../../utils/serverData";
import CEVCLStatsClient from "./CEVCLStatsClient";

export const metadata: Metadata = {
    title: "CEV Şampiyonlar Ligi İstatistikler",
    description: "CEV Şampiyonlar Ligi takım istatistikleri, performans analizleri ve karşılaştırmalar.",
    openGraph: {
        title: "CEV Şampiyonlar Ligi İstatistikler | VolleySimulator",
        description: "Şampiyonlar Ligi takım istatistikleri ve analizler.",
    },
};

export default async function CEVCLStatsPage() {
    const { teams } = await getLeagueData("cev-cl");

    return (
        <CEVCLStatsClient initialTeams={teams} />
    );
}

```

