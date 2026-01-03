# Project Application Context - Part 4

## File: app\anasayfa\AnasayfaClient.tsx
```
"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useState, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { useGameState, getLevelTitle, getXPForNextLevel } from "../utils/gameState";
import { useTutorial } from "../components/TutorialModal";
import { LEVEL_THRESHOLDS, TeamStats, Match } from "../types";
import TeamAvatar from "../components/TeamAvatar";

const TutorialModal = dynamic(() => import("../components/TutorialModal").then(mod => ({ default: mod.default })), {
    loading: () => null,
    ssr: false,
});


interface AnasayfaClientProps {
    initialLig1: { teams: TeamStats[], fixture: Match[] };
    initialLig2: { teams: TeamStats[], fixture: Match[] };
    initialVsl: { teams: TeamStats[], fixture: Match[] };
}

const sortStandings = (teams: TeamStats[]): TeamStats[] => {
    return [...teams].sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        const aAvg = a.setsLost > 0 ? a.setsWon / a.setsLost : a.setsWon;
        const bAvg = b.setsLost > 0 ? b.setsWon / b.setsLost : b.setsWon;
        if (bAvg !== aAvg) return bAvg - aAvg;
        return b.setsWon - a.setsWon;
    });
};

export default function AnasayfaClient({ initialLig1, initialLig2, initialVsl }: AnasayfaClientProps) {
    const { user } = useAuth();
    const { gameState } = useGameState();
    const { showTutorial, closeTutorial } = useTutorial();

    // XP Progress calculation
    const currentLevelXP = LEVEL_THRESHOLDS[gameState.level - 1] || 0;
    const nextLevelXP = getXPForNextLevel(gameState.level);
    const progress = gameState.xp - currentLevelXP;
    const required = nextLevelXP - currentLevelXP;
    const percentage = (progress / required) * 100;

    // Derived State
    const lig1Groups = useMemo(() => [...new Set(initialLig1.teams.map(t => t.groupName))].sort(), [initialLig1.teams]);
    const lig2Groups = useMemo(() => [...new Set(initialLig2.teams.map(t => t.groupName))].sort(), [initialLig2.teams]);

    const lig1TopTeams = useMemo(() => sortStandings(initialLig1.teams.filter(t => t.groupName === lig1Groups[0])).slice(0, 3), [initialLig1.teams, lig1Groups]);
    const lig2TopTeams = useMemo(() => sortStandings(initialLig2.teams.filter(t => t.groupName === lig2Groups[0])).slice(0, 3), [initialLig2.teams, lig2Groups]);
    const vslTopTeams = useMemo(() => sortStandings(initialVsl.teams).slice(0, 3), [initialVsl.teams]);

    const lig1UpcomingMatches = useMemo(() => initialLig1.fixture.filter(m => !m.isPlayed).slice(0, 3), [initialLig1.fixture]);
    const lig2UpcomingMatches = useMemo(() => initialLig2.fixture.filter(m => !m.isPlayed).slice(0, 3), [initialLig2.fixture]);
    const vslUpcomingMatches = useMemo(() => initialVsl.fixture.filter(m => !m.isPlayed).slice(0, 3), [initialVsl.fixture]);

    return (
        <div className="min-h-screen bg-slate-950">
            {/* Hero Header */}
            <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 px-4 py-6 relative overflow-hidden">
                <div className="relative max-w-4xl mx-auto">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-white mb-1">
                                Hoş Geldin, {user?.user_metadata?.name || 'Oyuncu'}!
                            </h1>
                            <p className="text-white/70 text-sm">{getLevelTitle(gameState.level)}</p>
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-bold text-white">Lv.{gameState.level}</div>
                            <div className="text-xs text-white/60">{gameState.xp} XP</div>
                        </div>
                    </div>

                    {/* XP Progress Bar */}
                    <div className="mt-4">
                        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-amber-400 to-orange-400 transition-all duration-500"
                                style={{ width: `${Math.min(percentage, 100)}%` }}
                            />
                        </div>
                        <div className="flex justify-between text-xs text-white/60 mt-1">
                            <span>{progress} / {required} XP</span>
                            <span>{gameState.achievements.length} Başarım</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 mt-4 space-y-6 pb-6">

                {/* Quick Actions */}
                <div className="grid grid-cols-3 gap-3">
                    <Link
                        href="/vsl/tahminoyunu"
                        className="bg-gradient-to-br from-red-600 to-rose-700 rounded-2xl p-4 text-center shadow-xl shadow-red-500/20 hover:scale-[1.02] transition-all"
                    >
                        <div className="font-bold text-white text-lg mb-1">Volley</div>
                        <div className="font-bold text-white">Sultanlar Ligi</div>
                        <div className="text-xs text-white/60">Tahmin Oyunu</div>
                    </Link>
                    <Link
                        href="/1lig/tahminoyunu"
                        className="bg-gradient-to-br from-amber-600 to-orange-700 rounded-2xl p-4 text-center shadow-xl shadow-amber-500/20 hover:scale-[1.02] transition-all"
                    >
                        <div className="font-bold text-white text-lg mb-1">1. Lig</div>
                        <div className="font-bold text-white">Kadınlar</div>
                        <div className="text-xs text-white/60">Tahmin Oyunu</div>
                    </Link>
                    <Link
                        href="/2lig/tahminoyunu"
                        className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-4 text-center shadow-xl shadow-emerald-500/20 hover:scale-[1.02] transition-all"
                    >
                        <div className="font-bold text-white text-lg mb-1">2. Lig</div>
                        <div className="font-bold text-white">Kadınlar</div>
                        <div className="text-xs text-white/60">Tahmin Oyunu</div>
                    </Link>
                </div>

                {/* 1. Lig Summary */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                    <div className="bg-gradient-to-r from-amber-600 to-orange-600 px-4 py-3 flex items-center justify-between">
                        <h2 className="font-bold text-white flex items-center gap-2">
                            Arabica Coffee House 1. Lig
                        </h2>
                        <Link href="/1lig/gunceldurum" className="text-xs text-white/80 hover:text-white">
                            Tümünü Gör →
                        </Link>
                    </div>

                    <div className="p-4 grid md:grid-cols-2 gap-4">
                        {/* Standings Preview */}
                        <div>
                            <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Puan Durumu ({lig1Groups[0]})</h3>
                            <div className="space-y-1">
                                {lig1TopTeams.map((team, i) => (
                                    <div key={team.name} className="flex items-center gap-2 p-2 bg-slate-800/50 rounded-lg">
                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${i === 0 ? "bg-amber-500 text-white" : "bg-slate-700 text-slate-400"
                                            }`}>{i + 1}</div>
                                        <TeamAvatar name={team.name} size="xs" />
                                        <span className="flex-1 text-sm text-slate-300 truncate">{team.name}</span>
                                        <span className="text-xs text-slate-400">{team.played}M</span>
                                        <span className="font-bold text-white text-sm">{team.points}P</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Upcoming Matches */}
                        <div>
                            <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Yaklaşan Maçlar</h3>
                            <div className="space-y-1">
                                {lig1UpcomingMatches.map((match, i) => (
                                    <div key={i} className="flex items-center gap-2 p-2 bg-slate-800/50 rounded-lg text-xs">
                                        <TeamAvatar name={match.homeTeam} size="xs" />
                                        <span className="flex-1 text-slate-300 truncate text-right">{match.homeTeam}</span>
                                        <span className="px-2 py-0.5 bg-slate-700 rounded text-slate-300">vs</span>
                                        <span className="flex-1 text-slate-300 truncate">{match.awayTeam}</span>
                                        <TeamAvatar name={match.awayTeam} size="xs" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Vodafone Sultanlar Ligi Summary */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                    <div className="bg-gradient-to-r from-red-600 to-rose-600 px-4 py-3 flex items-center justify-between">
                        <h2 className="font-bold text-white flex items-center gap-2">
                            Vodafone Sultanlar Ligi
                        </h2>
                        <Link href="/vsl/gunceldurum" className="text-xs text-white/80 hover:text-white">
                            Tümünü Gör →
                        </Link>
                    </div>

                    <div className="p-4 grid md:grid-cols-2 gap-4">
                        {/* Standings Preview */}
                        <div>
                            <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Puan Durumu</h3>
                            <div className="space-y-1">
                                {vslTopTeams.map((team, i) => (
                                    <div key={team.name} className="flex items-center gap-2 p-2 bg-slate-800/50 rounded-lg">
                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${i === 0 ? "bg-red-600 text-white" : "bg-slate-700 text-slate-400"
                                            }`}>{i + 1}</div>
                                        <TeamAvatar name={team.name} size="xs" />
                                        <span className="flex-1 text-sm text-slate-300 truncate">{team.name}</span>
                                        <span className="text-xs text-slate-400">{team.played}M</span>
                                        <span className="font-bold text-white text-sm">{team.points}P</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Upcoming Matches */}
                        <div>
                            <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Yaklaşan Maçlar</h3>
                            <div className="space-y-1">
                                {vslUpcomingMatches.map((match, i) => (
                                    <div key={i} className="flex items-center gap-2 p-2 bg-slate-800/50 rounded-lg text-xs">
                                        <TeamAvatar name={match.homeTeam} size="xs" />
                                        <span className="flex-1 text-slate-300 truncate text-right">{match.homeTeam}</span>
                                        <span className="px-2 py-0.5 bg-slate-700 rounded text-slate-300">vs</span>
                                        <span className="flex-1 text-slate-300 truncate">{match.awayTeam}</span>
                                        <TeamAvatar name={match.awayTeam} size="xs" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Lig Summary */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                    <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3 flex items-center justify-between">
                        <h2 className="font-bold text-white flex items-center gap-2">
                            Kadınlar 2. Lig
                        </h2>
                        <Link href="/2lig/gunceldurum" className="text-xs text-white/80 hover:text-white">
                            Tümünü Gör →
                        </Link>
                    </div>

                    <div className="p-4 grid md:grid-cols-2 gap-4">
                        {/* Standings Preview */}
                        <div>
                            <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Puan Durumu ({lig2Groups[0]})</h3>
                            <div className="space-y-1">
                                {lig2TopTeams.map((team, i) => (
                                    <div key={team.name} className="flex items-center gap-2 p-2 bg-slate-800/50 rounded-lg">
                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${i === 0 ? "bg-emerald-500 text-white" : "bg-slate-700 text-slate-400"
                                            }`}>{i + 1}</div>
                                        <TeamAvatar name={team.name} size="xs" />
                                        <span className="flex-1 text-sm text-slate-300 truncate">{team.name}</span>
                                        <span className="text-xs text-slate-400">{team.played}M</span>
                                        <span className="font-bold text-white text-sm">{team.points}P</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Upcoming Matches */}
                        <div>
                            <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Yaklaşan Maçlar</h3>
                            <div className="space-y-1">
                                {lig2UpcomingMatches.map((match, i) => (
                                    <div key={i} className="flex items-center gap-2 p-2 bg-slate-800/50 rounded-lg text-xs">
                                        <TeamAvatar name={match.homeTeam} size="xs" />
                                        <span className="flex-1 text-slate-300 truncate text-right">{match.homeTeam}</span>
                                        <span className="px-2 py-0.5 bg-slate-700 rounded text-slate-300">vs</span>
                                        <span className="flex-1 text-slate-300 truncate">{match.awayTeam}</span>
                                        <TeamAvatar name={match.awayTeam} size="xs" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Card */}
                <div className="grid grid-cols-4 gap-2">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
                        <div className="text-xl font-bold text-amber-400">{gameState.stats.totalPredictions}</div>
                        <div className="text-[10px] text-slate-400">Tahmin</div>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
                        <div className="text-xl font-bold text-emerald-400">{gameState.stats.correctPredictions}</div>
                        <div className="text-[10px] text-slate-400">Doğru</div>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
                        <div className="text-xl font-bold text-orange-400">{gameState.stats.bestStreak}</div>
                        <div className="text-[10px] text-slate-400">En İyi Seri</div>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
                        <div className="text-xl font-bold text-cyan-400">{gameState.achievements.length}</div>
                        <div className="text-[10px] text-slate-400">Başarım</div>
                    </div>
                </div>

                {/* Changelog */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-lg">🆕</span>
                            <h2 className="font-bold text-white">Son Güncellemeler</h2>
                        </div>
                        <span className="text-xs font-mono bg-white/20 px-2 py-0.5 rounded text-white/80">v1.2.0</span>
                    </div>
                    <div className="p-4 space-y-3">
                        <div className="flex gap-3 items-start">
                            <span className="text-[10px] font-mono bg-emerald-600/30 text-emerald-400 px-1.5 py-0.5 rounded flex-shrink-0">v1.2.0</span>
                            <div>
                                <div className="text-sm font-medium text-white">Oynanmış maçlar artık doğru gösteriliyor</div>
                                <div className="text-xs text-slate-500">3 Ocak 2026</div>
                            </div>
                        </div>
                        <div className="flex gap-3 items-start">
                            <span className="text-[10px] font-mono bg-emerald-600/30 text-emerald-400 px-1.5 py-0.5 rounded flex-shrink-0">v1.2.0</span>
                            <div>
                                <div className="text-sm font-medium text-white">Puan tabloları artık ekrana sığıyor</div>
                                <div className="text-xs text-slate-500">3 Ocak 2026</div>
                            </div>
                        </div>
                        <div className="flex gap-3 items-start">
                            <span className="text-[10px] font-mono bg-emerald-600/30 text-emerald-400 px-1.5 py-0.5 rounded flex-shrink-0">v1.2.0</span>
                            <div>
                                <div className="text-sm font-medium text-white">Maç saatleri artık tüm maçlarda görünüyor</div>
                                <div className="text-xs text-slate-500">3 Ocak 2026</div>
                            </div>
                        </div>
                        <div className="flex gap-3 items-start">
                            <span className="text-[10px] font-mono bg-emerald-600/30 text-emerald-400 px-1.5 py-0.5 rounded flex-shrink-0">v1.2.0</span>
                            <div>
                                <div className="text-sm font-medium text-white">İstatistik kartları daha kompakt ve şık hale getirildi</div>
                                <div className="text-xs text-slate-500">3 Ocak 2026</div>
                            </div>
                        </div>
                        <div className="flex gap-3 items-start">
                            <span className="text-[10px] font-mono bg-blue-600/30 text-blue-400 px-1.5 py-0.5 rounded flex-shrink-0">v1.1.0</span>
                            <div>
                                <div className="text-sm font-medium text-white">CEV Şampiyonlar Ligi, CEV Cup ve Challenge Cup eklendi</div>
                                <div className="text-xs text-slate-500">Aralık 2025</div>
                            </div>
                        </div>
                        <div className="flex gap-3 items-start">
                            <span className="text-[10px] font-mono bg-purple-600/30 text-purple-400 px-1.5 py-0.5 rounded flex-shrink-0">v1.0.0</span>
                            <div>
                                <div className="text-sm font-medium text-white">Tahmin oyunu ve liderlik tablosu sistemi eklendi</div>
                                <div className="text-xs text-slate-500">Aralık 2025</div>
                            </div>
                        </div>
                        <div className="flex gap-3 items-start">
                            <span className="text-[10px] font-mono bg-slate-600/30 text-slate-400 px-1.5 py-0.5 rounded flex-shrink-0">v0.0.0</span>
                            <div>
                                <div className="text-sm font-medium text-white">VolleySimulator ilk sürüm yayınlandı</div>
                                <div className="text-xs text-slate-500">Kasım 2025</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tutorial Modal */}
            <TutorialModal isOpen={showTutorial} onClose={closeTutorial} />
        </div>
    );
}

```

## File: app\anasayfa\page.tsx
```
import { getLeagueData } from "../utils/serverData";
import AnasayfaClient from "./AnasayfaClient";

export default async function AnasayfaPage() {
    // Fetch all league data in parallel on the server
    const [lig1, lig2, vsl] = await Promise.all([
        getLeagueData("1lig"),
        getLeagueData("2lig"),
        getLeagueData("vsl")
    ]);

    return (
        <AnasayfaClient
            initialLig1={{ teams: lig1.teams || [], fixture: lig1.fixture || [] }}
            initialLig2={{ teams: lig2.teams || [], fixture: lig2.fixture || [] }}
            initialVsl={{ teams: vsl.teams || [], fixture: vsl.fixture || [] }}
        />
    );
}

```

## File: app\api\1lig\route.ts
```
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Revalidate every 5 minutes
export const revalidate = 300;

export async function GET(req: NextRequest) {
    try {
        // Read the 1. Lig data from local JSON file
        const dataPath = path.join(process.cwd(), 'data', '1lig-data.json');
        const jsonData = fs.readFileSync(dataPath, 'utf-8');
        const data = JSON.parse(jsonData);

        // Filter out withdrawn teams (ligden çekilen takımlar)
        const withdrawnTeams = ['Edremit Bld. Altınoluk', 'İzmirspor'];

        data.teams = data.teams.filter((team: any) => !withdrawnTeams.includes(team.name));
        data.fixture = data.fixture.filter((match: any) =>
            !withdrawnTeams.includes(match.homeTeam) && !withdrawnTeams.includes(match.awayTeam)
        );

        // Return with cache headers
        return NextResponse.json(data, {
            headers: {
                'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
            }
        });
    } catch (error) {
        console.error('Error reading 1. Lig data:', error);
        return NextResponse.json(
            { error: 'Failed to load 1. Lig data' },
            { status: 500 }
        );
    }
}

```

## File: app\api\ai\analysis\route.ts
```
import { NextRequest, NextResponse } from 'next/server';

// GET /api/ai/analysis - Get AI match analysis
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const homeTeam = searchParams.get('homeTeam');
    const awayTeam = searchParams.get('awayTeam');

    if (!homeTeam || !awayTeam) {
      return NextResponse.json({ error: 'Home and away teams are required' }, { status: 400 });
    }

    // In production, fetch real data and run analysis
    const analysis = {
      homeTeam,
      awayTeam,
      headToHead: {
        totalMatches: 15,
        homeWins: 9,
        awayWins: 6,
        lastFiveResults: [
          { date: '2024-01-15', homeScore: 3, awayScore: 1, winner: 'home' },
          { date: '2023-12-20', homeScore: 2, awayScore: 3, winner: 'away' },
          { date: '2023-11-10', homeScore: 3, awayScore: 0, winner: 'home' },
          { date: '2023-10-05', homeScore: 3, awayScore: 2, winner: 'home' },
          { date: '2023-09-15', homeScore: 1, awayScore: 3, winner: 'away' },
        ],
        averageSetsPerMatch: 4.2,
        averagePointDiff: 3.5,
      },
      homeTeamForm: {
        lastFiveMatches: ['W', 'W', 'L', 'W', 'W'],
        formPercentage: 80,
        goalsScored: 78,
        goalsConceded: 65,
        winStreak: 2,
        recentOpponents: ['Team A', 'Team B', 'Team C', 'Team D', 'Team E'],
      },
      awayTeamForm: {
        lastFiveMatches: ['L', 'W', 'W', 'L', 'W'],
        formPercentage: 60,
        goalsScored: 71,
        goalsConceded: 68,
        winStreak: 1,
        recentOpponents: ['Team F', 'Team G', 'Team H', 'Team I', 'Team J'],
      },
      keyPlayers: {
        home: [
          { name: 'Melissa Vargas', position: 'Outside Hitter', rating: 95 },
          { name: 'Arina Fedorovtseva', position: 'Opposite', rating: 92 },
        ],
        away: [
          { name: 'Tijana Bošković', position: 'Opposite', rating: 96 },
          { name: 'Kim Yeon-koung', position: 'Outside Hitter', rating: 91 },
        ],
      },
      statisticalInsights: [
        {
          category: 'Servis',
          home: { value: 4.2, label: 'As/Maç' },
          away: { value: 3.8, label: 'As/Maç' },
          advantage: 'home',
        },
        {
          category: 'Blok',
          home: { value: 8.5, label: 'Blok/Maç' },
          away: { value: 9.2, label: 'Blok/Maç' },
          advantage: 'away',
        },
        {
          category: 'Hücum',
          home: { value: 48.2, label: '%' },
          away: { value: 45.8, label: '%' },
          advantage: 'home',
        },
        {
          category: 'Resepsiyon',
          home: { value: 52.1, label: '%' },
          away: { value: 54.3, label: '%' },
          advantage: 'away',
        },
      ],
      venueAnalysis: {
        venue: 'Burhan Felek Voleybol Salonu',
        capacity: 5000,
        homeWinRate: 72,
        averageAttendance: 3500,
      },
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('Error generating analysis:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

```

## File: app\api\ai\prediction\route.ts
```
import { NextRequest, NextResponse } from 'next/server';

// POST /api/ai/prediction - Get AI prediction for a match
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { matchId, homeTeam, awayTeam, league } = body;

    if (!homeTeam || !awayTeam) {
      return NextResponse.json({ error: 'Home and away teams are required' }, { status: 400 });
    }

    // In production, this would call an ML model or prediction service
    // For now, generate a mock prediction based on team names

    // Simulate some AI processing time
    await new Promise(resolve => setTimeout(resolve, 500));

    // Generate prediction probabilities (mock)
    const homeStrength = getTeamStrength(homeTeam);
    const awayStrength = getTeamStrength(awayTeam);
    const total = homeStrength + awayStrength;

    const homeWinProb = Math.round((homeStrength / total) * 100);
    const awayWinProb = 100 - homeWinProb;

    // Generate predicted score (mock)
    const predictedSets = homeWinProb > awayWinProb 
      ? generateSetScore(true) 
      : generateSetScore(false);

    const prediction = {
      matchId: matchId || `${homeTeam}-vs-${awayTeam}`,
      homeTeam,
      awayTeam,
      prediction: {
        homeWinProbability: homeWinProb,
        awayWinProbability: awayWinProb,
        predictedWinner: homeWinProb > awayWinProb ? 'home' : 'away',
        predictedScore: predictedSets.join('-'),
        confidence: Math.abs(homeWinProb - 50) + 50,
        reasoning: generateReasoning(homeTeam, awayTeam, homeWinProb > awayWinProb),
      },
      factors: {
        recentForm: {
          home: Math.floor(Math.random() * 30) + 60,
          away: Math.floor(Math.random() * 30) + 60,
        },
        headToHead: {
          home: Math.floor(Math.random() * 5),
          away: Math.floor(Math.random() * 5),
        },
        homeAdvantage: 5 + Math.floor(Math.random() * 10),
        injuries: Math.random() > 0.7 ? 'minor' : 'none',
      },
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json({ prediction });
  } catch (error) {
    console.error('Error generating AI prediction:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper functions
function getTeamStrength(teamName: string): number {
  // Mock team strengths based on known teams
  const strengths: Record<string, number> = {
    'FENERBAHÇE MEDICANA': 95,
    'ECZACIBAŞI DYNAVİT': 93,
    'VAKIFBANK': 94,
    'GALATASARAY DAIKIN': 88,
    'THY': 82,
    'NİLÜFER BELEDİYESPOR': 78,
    'BEŞİKTAŞ': 75,
    'ARAS KARGO': 72,
    'KUZEYBORUİSTANBUL': 68,
    'SIGORTA SHOP': 65,
    'PTT': 62,
    'TOKAT BELEDİYE PLEVNE': 58,
  };

  return strengths[teamName] || 70 + Math.floor(Math.random() * 20);
}

function generateSetScore(homeWins: boolean): number[] {
  const outcomes = [
    [3, 0], [3, 1], [3, 2],
    [0, 3], [1, 3], [2, 3]
  ];
  
  const homeOutcomes = outcomes.filter(o => homeWins ? o[0] > o[1] : o[0] < o[1]);
  return homeOutcomes[Math.floor(Math.random() * homeOutcomes.length)];
}

function generateReasoning(homeTeam: string, awayTeam: string, homeWins: boolean): string[] {
  const winner = homeWins ? homeTeam : awayTeam;
  const loser = homeWins ? awayTeam : homeTeam;

  const reasons = [
    `${winner} son 5 maçta 4 galibiyet aldı`,
    `${winner} takımı ev sahibi avantajını kullanıyor`,
    `${winner} servis istatistiklerinde üstün`,
    `${loser} takımında sakat oyuncular var`,
    `${winner} head-to-head istatistiklerinde önde`,
    `${winner} blok etkinliğinde daha başarılı`,
    `${winner} takımı hücum etkinliğinde %5 daha iyi`,
  ];

  // Return 3-4 random reasons
  const shuffled = reasons.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3 + Math.floor(Math.random() * 2));
}

```

## File: app\api\calculate\route.ts
```
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { calculateElo } from '../../utils/eloCalculator';
import { normalizeTeamName, sortStandings } from '../../utils/calculatorUtils';
import { TeamStats, Match, MatchOutcome } from '../../types';

// Helper to simulate a single match outcome based on Elo
function simulateMatch(homeElo: number, awayElo: number): MatchOutcome {
    const expectedHome = 1 / (1 + Math.pow(10, (awayElo - homeElo) / 400));
    const random = Math.random();
    const homeWin = random < expectedHome;

    // Simplified score distribution
    // If very clear winner (prob > 0.8), likely 3-0 or 3-1
    // If close (prob ~ 0.5), likely 3-2

    let hSets = 0, aSets = 0;

    if (homeWin) {
        hSets = 3;
        // Prob of 3-0 vs 3-1 vs 3-2
        const dominance = expectedHome; // 0.5 to 1.0
        const r2 = Math.random();
        if (dominance > 0.8) aSets = r2 < 0.7 ? 0 : 1;
        else if (dominance > 0.6) aSets = r2 < 0.5 ? 1 : 2;
        else aSets = 2; // Close match
    } else {
        aSets = 3;
        const dominance = 1 - expectedHome; // 0.5 to 1.0
        const r2 = Math.random();
        if (dominance > 0.8) hSets = r2 < 0.7 ? 0 : 1;
        else if (dominance > 0.6) hSets = r2 < 0.5 ? 1 : 2;
        else hSets = 2;
    }

    let hPoints = 0, aPoints = 0;
    if (hSets === 3) {
        if (aSets <= 1) hPoints = 3;
        else { hPoints = 2; aPoints = 1; }
    } else {
        if (hSets <= 1) aPoints = 3;
        else { aPoints = 2; hPoints = 1; }
    }

    return { homeSets: hSets, awaySets: aSets, homePoints: hPoints, awayPoints: aPoints, homeWin };
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { teams, fixture, targetTeam, overrides } = body;

        if (!teams || !targetTeam) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // 1. Calculate Base Elo from History
        const eloMap = calculateElo(teams, fixture);

        // 2. Identify Unplayed Matches (excluding overrides if they are treated as played upstream)
        // The fixture passed usually contains ALL matches. We filter for unplayed.
        // Overrides passed are ALREADY applied to 'teams' (live standings) in the frontend?
        // Actually, the frontend passed 'sortedTeams' which includes applied overrides. 
        // AND it passed 'overrides' array.
        // We should simulate matches that are NOT in overrides and NOT played.

        const overrideIds = new Set(overrides.map((o: any) => `${o.homeTeam}|||${o.awayTeam}`));

        const matchesToSimulate = (fixture as Match[]).filter(m =>
            !m.isPlayed &&
            !overrideIds.has(`${m.homeTeam}|||${m.awayTeam}`)
        );

        // If no matches left, just return current rank
        if (matchesToSimulate.length === 0) {
            const index = teams.findIndex((t: TeamStats) => t.name === targetTeam);
            return NextResponse.json({
                bestRank: index + 1,
                worstRank: index + 1,
                championshipProbability: index === 0 ? 100 : 0,
                playoffProbability: index < 4 ? 100 : 0,
                relegationProbability: index >= teams.length - 2 ? 100 : 0,
                aiAnalysis: "Tüm maçlar tamamlandı veya tahmin edildi."
            });
        }

        // 3. Run Monte Carlo Simulation
        const SIMULATIONS = 1000;
        const ranks: number[] = [];

        // Deep clone for base state
        // Optimize: Convert teams to simpler struct for speed
        const baseTeams = teams.map((t: TeamStats) => ({ ...t, normalizedName: normalizeTeamName(t.name) }));

        for (let i = 0; i < SIMULATIONS; i++) {
            // Copy state
            const simTeams = baseTeams.map((t: any) => ({ ...t }));
            const simMap = new Map();
            simTeams.forEach((t: any) => simMap.set(t.normalizedName, t));

            for (const m of matchesToSimulate) {
                const hName = normalizeTeamName(m.homeTeam);
                const aName = normalizeTeamName(m.awayTeam);
                const hElo = eloMap.get(m.homeTeam) || 1200;
                const aElo = eloMap.get(m.awayTeam) || 1200;

                const outcome = simulateMatch(hElo, aElo);

                const h = simMap.get(hName);
                const a = simMap.get(aName);

                if (h && a) {
                    h.played++;
                    h.wins += outcome.homeWin ? 1 : 0;
                    h.points += outcome.homePoints;
                    h.setsWon += outcome.homeSets;
                    h.setsLost += outcome.awaySets;

                    a.played++;
                    a.wins += outcome.homeWin ? 0 : 1;
                    a.points += outcome.awayPoints;
                    a.setsWon += outcome.awaySets;
                    a.setsLost += outcome.homeSets;
                }
            }

            // Sort
            const sorted = sortStandings(simTeams);
            const rank = sorted.findIndex(t => t.name === targetTeam) + 1;
            ranks.push(rank);
        }

        // 4. Statistics
        const bestRank = Math.min(...ranks);
        const worstRank = Math.max(...ranks);
        const champCount = ranks.filter(r => r === 1).length;
        const playoffCount = ranks.filter(r => r <= 4).length; // Top 4
        // Relegation: Last 2 (assuming 16 teams? Or group specific logic?)
        // Group size varies (e.g. 9 teams). Relegation is usually last 2.
        const delegationThreshold = teams.length - 1; // 8th and 9th if 9 teams
        const relCount = ranks.filter(r => r >= delegationThreshold).length;

        // 5. AI Analysis
        let aiAnalysis = "Analiz oluşturulamadı.";
        if (process.env.GEMINI_API_KEY) {
            try {
                const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
                const model = genAI.getGenerativeModel({ model: "gemini-pro" });

                const context = `
Takım: ${targetTeam}
Mevcut Puan: ${teams.find((t: any) => t.name === targetTeam)?.points}
Kalan Maç Sayısı: ${matchesToSimulate.length}
Simülasyon Sonuçları (1000 tekrar):
- En İyi Sıra: ${bestRank}
- En Kötü Sıra: ${worstRank}
- Şampiyonluk İhtimali: %${(champCount / SIMULATIONS * 100).toFixed(1)}
- Play-off İhtimali: %${(playoffCount / SIMULATIONS * 100).toFixed(1)}
- Düşme İhtimali: %${(relCount / SIMULATIONS * 100).toFixed(1)}

Bu takım için kısa, esprili ve motive edici bir analiz yaz. Voleybol terimleri kullan.
`;
                const result = await model.generateContent(context);
                aiAnalysis = result.response.text();
            } catch (e) {
                console.error("AI Error:", e);
                aiAnalysis = "AI servisine şu an ulaşılamıyor, ancak istatistikler güncel.";
            }
        }

        return NextResponse.json({
            bestRank,
            worstRank,
            championshipProbability: (champCount / SIMULATIONS) * 100,
            playoffProbability: (playoffCount / SIMULATIONS) * 100,
            relegationProbability: (relCount / SIMULATIONS) * 100,
            aiAnalysis
        });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

```

## File: app\api\cev-challenge\route.ts
```
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
    try {
        const filePath = path.join(process.cwd(), 'data', 'cev-challenge-cup-data.json');

        if (!fs.existsSync(filePath)) {
            return NextResponse.json({ league: 'CEV Challenge Cup', fixture: [], teams: [] });
        }

        const fileContent = fs.readFileSync(filePath, 'utf8');
        const sourceData = JSON.parse(fileContent);

        // Transform to CEV Cup format
        const fixture: any[] = [];
        const teamsMap = new Map();

        // Helper to parse score "3-0" -> { home: 3, away: 0 }
        const parseScore = (scoreStr: string | null) => {
            if (!scoreStr || !scoreStr.includes('-')) return { home: null, away: null };
            const parts = scoreStr.split('-').map(p => parseInt(p.trim()));
            return { home: isNaN(parts[0]) ? null : parts[0], away: isNaN(parts[1]) ? null : parts[1] };
        };

        let matchCounter = 1;

        if (sourceData.phases) {
            sourceData.phases.forEach((phase: any) => {
                const roundName = phase.name; // e.g., "Qualification Rounds", "Main Round"
                // Map generic phase names to CEV Cup expected rounds if needed, or update the UI constants.
                // For now, let's keep original names but might need mapping for bracket logic.

                phase.matches.forEach((m: any) => {
                    const { home, away } = parseScore(m.score);

                    // Add teams
                    if (!teamsMap.has(m.homeTeam)) teamsMap.set(m.homeTeam, { name: m.homeTeam, country: '' });
                    if (!teamsMap.has(m.awayTeam)) teamsMap.set(m.awayTeam, { name: m.awayTeam, country: '' });

                    fixture.push({
                        id: matchCounter++,
                        round: roundName,
                        leg: 1, // Challenge Cup scraper doesn't detect leg yet, default to 1 or logic needed
                        date: m.date || 'TBD',
                        matchTime: '', // Scraper didn't separate time
                        homeTeam: m.homeTeam,
                        awayTeam: m.awayTeam,
                        homeScore: home,
                        awayScore: away,
                        setScores: m.sets,
                        isPlayed: m.isPlayed,
                        venue: ''
                    });
                });
            });
        }

        return NextResponse.json({
            league: "CEV Challenge Cup",
            season: "2025-2026",
            currentStage: "Main Round", // Default or derive
            teams: Array.from(teamsMap.values()),
            fixture: fixture
        });
    } catch (error) {
        console.error('Error reading CEV Challenge Cup data:', error);
        return NextResponse.json({ error: 'Failed to load data' }, { status: 500 });
    }
}

```

## File: app\api\cev-cl\route.ts
```
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(req: NextRequest) {
    try {
        // Read the CEV CL data from local JSON file
        const dataPath = path.join(process.cwd(), 'data', 'cev-cl-data.json');

        if (!fs.existsSync(dataPath)) {
            return NextResponse.json(
                { error: 'Data file not found.' },
                { status: 404 }
            );
        }

        const jsonData = fs.readFileSync(dataPath, 'utf-8');
        const data = JSON.parse(jsonData);

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error reading CEV CL data:', error);
        return NextResponse.json(
            { error: 'Failed to load CEV CL data' },
            { status: 500 }
        );
    }
}

```

## File: app\api\cev-cup\route.ts
```
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(req: NextRequest) {
    try {
        // Read the CEV Cup data from local JSON file
        const dataPath = path.join(process.cwd(), 'data', 'cev-cup-data.json');

        if (!fs.existsSync(dataPath)) {
            return NextResponse.json(
                { error: 'Data file not found.' },
                { status: 404 }
            );
        }

        const jsonData = fs.readFileSync(dataPath, 'utf-8');
        const data = JSON.parse(jsonData);

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error reading CEV Cup data:', error);
        return NextResponse.json(
            { error: 'Failed to load CEV Cup data' },
            { status: 500 }
        );
    }
}

```

## File: app\api\cron\update-results\route.ts
```
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';
import { createServiceRoleClient } from '../../../utils/supabase-server';

// Cron job endpoint - fetches all league results from TVF Calendar (Takvim)
// Updates VSL, 1. Lig, and 2. Lig in one pass

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow up to 60 seconds

const TVF_TAKVIM_URL = "https://fikstur.tvf.org.tr/Takvim";

interface MatchResult {
    league: string;
    homeTeam: string;
    awayTeam: string;
    homeScore: number;
    awayScore: number;
    resultScore: string;
}

async function fetchAllLeagueResults(): Promise<MatchResult[]> {
    try {
        const response = await fetch(TVF_TAKVIM_URL, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
            next: { revalidate: 0 }
        });

        if (!response.ok) {
            console.error(`TVF Calendar fetch failed: ${response.status}`);
            return [];
        }

        const html = await response.text();
        const $ = cheerio.load(html);
        const results: MatchResult[] = [];

        // On the Takvim page, matches are grouped under league headers
        // We find all league containers or iterate through rows
        // Headers usually have class .tvf-fixture-league-header (found by subagent)

        $('.tvf-fixture-league-header').each((_, header) => {
            const leagueName = $(header).text().trim();

            // Find the table/container immediately following this header
            // TVF structure usually has rows following the header in the same parent or next sibling
            const $container = $(header).next('table, .tvf-fixture-league-matches, div');

            $container.find('tr').each((_, row) => {
                const $row = $(row);

                const homeTeam = $row.find('span[id*="_gevsahibi"]').text().trim();
                const awayTeam = $row.find('span[id*="_gmisafir"], span[id*="_gdeplasman"]').text().trim();
                const homeScoreStr = $row.find('span[id*="_gseta"]').text().trim();
                const awayScoreStr = $row.find('span[id*="_gsetb"], span[id*="_gsetd"]').text().trim();

                const homeScore = parseInt(homeScoreStr);
                const awayScore = parseInt(awayScoreStr);

                if (homeTeam && awayTeam && !isNaN(homeScore) && !isNaN(awayScore)) {
                    results.push({
                        league: leagueName,
                        homeTeam,
                        awayTeam,
                        homeScore,
                        awayScore,
                        resultScore: `${homeScore}-${awayScore}`
                    });
                }
            });
        });

        // Fallback: If no headers found, try scraping all rows and inferring league (less reliable)
        if (results.length === 0) {
            console.log('No league headers found, attempting broad row scrape...');
            $('tr').each((_, row) => {
                const $row = $(row);
                const homeTeam = $row.find('span[id*="_gevsahibi"]').text().trim();
                const awayTeam = $row.find('span[id*="_gmisafir"], span[id*="_gdeplasman"]').text().trim();
                const homeScoreStr = $row.find('span[id*="_gseta"]').text().trim();
                const awayScoreStr = $row.find('span[id*="_gsetb"], span[id*="_gsetd"]').text().trim();

                if (homeTeam && awayTeam && homeScoreStr !== '' && awayScoreStr !== '') {
                    // Find nearest preceding league header if possible
                    let leagueName = "Unknown League";
                    const prevHeader = $row.closest('table').prevAll('.tvf-fixture-league-header').first();
                    if (prevHeader.length) leagueName = prevHeader.text().trim();

                    results.push({
                        league: leagueName,
                        homeTeam,
                        awayTeam,
                        homeScore: parseInt(homeScoreStr),
                        awayScore: parseInt(awayScoreStr),
                        resultScore: `${homeScoreStr}-${awayScoreStr}`
                    });
                }
            });
        }

        return results;
    } catch (error) {
        console.error('Error in fetchAllLeagueResults:', error);
        return [];
    }
}

async function syncToDatabaseAndLocal(results: MatchResult[]) {
    const supabase = createServiceRoleClient();
    let synced = 0;
    const localUpdates: Record<string, number> = { vsl: 0, '1lig': 0, '2lig': 0 };

    // Group results by our internal league keys
    const leagueMapping: Record<string, string> = {
        'vsl': 'Sultanlar Ligi',
        '1lig': '1. Lig',
        '2lig': '2. Lig'
    };

    const reverseMapping: Record<string, string> = {
        'Vodafone Sultanlar Ligi': 'vsl',
        'KADINLAR 1. LİG': '1lig',
        'KADINLAR 2. LİG': '2lig',
        'Sultanlar Ligi': 'vsl' // Catch-all variations
    };

    // Helper to find our internal league key from TVF name
    const findInternalKey = (tvfLeague: string) => {
        const upper = tvfLeague.toUpperCase();
        if (upper.includes('SULTANLAR')) return 'vsl';
        if (upper.includes('1. LİG') || upper.includes('1.LİG')) return '1lig';
        if (upper.includes('2. LİG') || upper.includes('2.LİG')) return '2lig';
        return null;
    };

    const dataFiles: Record<string, string> = {
        'vsl': 'vsl-data.json',
        '1lig': '1lig-data.json',
        '2lig': 'tvf-data.json'
    };

    for (const res of results) {
        const internalKey = findInternalKey(res.league);
        if (!internalKey) continue;

        // 1. Database Sync (Persistent)
        const dbLeagueName = leagueMapping[internalKey];
        try {
            const { error } = await supabase
                .from('match_results')
                .upsert({
                    league: dbLeagueName,
                    home_team: res.homeTeam,
                    away_team: res.awayTeam,
                    result_score: res.resultScore,
                    is_verified: true,
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'league,home_team,away_team'
                });

            if (!error) synced++;
        } catch (e) {
            console.error(`DB Sync Error for ${res.homeTeam}:`, e);
        }

        // 2. Local File Update (Dev Mode)
        try {
            const fileName = dataFiles[internalKey];
            const filePath = path.join(process.cwd(), 'data', fileName);
            if (fs.existsSync(filePath)) {
                const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
                let fileModified = false;

                const fixture = data.fixture || data.matches;
                if (fixture && Array.isArray(fixture)) {
                    for (const match of fixture) {
                        if (match.homeTeam.toUpperCase() === res.homeTeam.toUpperCase() &&
                            match.awayTeam.toUpperCase() === res.awayTeam.toUpperCase() &&
                            !match.isPlayed) {
                            match.isPlayed = true;
                            match.homeScore = res.homeScore;
                            match.awayScore = res.awayScore;
                            match.resultScore = res.resultScore;
                            fileModified = true;
                            localUpdates[internalKey]++;
                        }
                    }
                }

                if (fileModified) {
                    data.lastUpdated = new Date().toISOString();
                    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
                }
            }
        } catch (e) {
            // Ignore write errors in Vercel environment
        }
    }

    return { synced, localUpdates };
}

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET;
        const vercelCron = request.headers.get('x-vercel-cron');

        if (cronSecret && authHeader !== `Bearer ${cronSecret}` && !vercelCron) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.log('Starting results sync via TVF Takvim...');
        const startTime = Date.now();

        const allResults = await fetchAllLeagueResults();
        console.log(`Fetched ${allResults.length} total matches from Takvim`);

        const syncStats = await syncToDatabaseAndLocal(allResults);

        const duration = Date.now() - startTime;

        return NextResponse.json({
            success: true,
            duration: `${duration}ms`,
            timestamp: new Date().toISOString(),
            fetchedCount: allResults.length,
            syncedCount: syncStats.synced,
            localUpdates: syncStats.localUpdates,
            sampleLeagues: [...new Set(allResults.map(r => r.league))]
        });

    } catch (error: any) {
        console.error('Unified Cron job error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    return GET(request);
}

```

## File: app\api\custom-leagues\route.ts
```
import { NextRequest, NextResponse } from 'next/server';

// GET /api/custom-leagues - Get user's custom leagues
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // In production, fetch from Supabase
    const mockLeagues = [
      {
        id: 'league-1',
        name: 'Ofis Ligi',
        description: 'Şirket içi voleybol tahmin yarışması',
        type: 'private',
        ownerId: userId,
        inviteCode: 'OFIS2024',
        maxMembers: 50,
        memberCount: 12,
        settings: {
          allowedLeagues: ['vsl', '1lig'],
          scoringMultiplier: 1,
          showRankings: true,
          allowChat: true,
        },
        createdAt: new Date('2024-01-01').toISOString(),
        members: [
          { id: 'm-1', username: 'user1', displayName: 'Ahmet', role: 'owner', joinedAt: new Date().toISOString(), points: 450 },
          { id: 'm-2', username: 'user2', displayName: 'Mehmet', role: 'member', joinedAt: new Date().toISOString(), points: 380 },
          { id: 'm-3', username: 'user3', displayName: 'Ayşe', role: 'moderator', joinedAt: new Date().toISOString(), points: 520 },
        ],
      },
      {
        id: 'league-2',
        name: 'Üniversite Turnuvası',
        description: 'Kampüs voleybol sezonu',
        type: 'private',
        ownerId: 'other-user',
        inviteCode: 'UNI2024',
        maxMembers: 100,
        memberCount: 45,
        settings: {
          allowedLeagues: ['vsl', '1lig', 'cev-cl'],
          scoringMultiplier: 1.5,
          showRankings: true,
          allowChat: true,
        },
        createdAt: new Date('2024-02-01').toISOString(),
        members: [],
      }
    ];

    return NextResponse.json({ leagues: mockLeagues });
  } catch (error) {
    console.error('Error fetching custom leagues:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/custom-leagues - Create a new custom league
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, type, maxMembers, settings } = body;

    if (!name) {
      return NextResponse.json({ error: 'League name is required' }, { status: 400 });
    }

    // Generate invite code
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    // In production, create in Supabase
    const newLeague = {
      id: `league-${Date.now()}`,
      name,
      description: description || '',
      type: type || 'private',
      ownerId: userId,
      inviteCode,
      maxMembers: maxMembers || 50,
      memberCount: 1,
      settings: settings || {
        allowedLeagues: ['vsl'],
        scoringMultiplier: 1,
        showRankings: true,
        allowChat: true,
      },
      createdAt: new Date().toISOString(),
      members: [
        { id: userId, username: 'you', displayName: 'Sen', role: 'owner', joinedAt: new Date().toISOString(), points: 0 }
      ],
    };

    return NextResponse.json({
      success: true,
      message: 'League created',
      league: newLeague,
    });
  } catch (error) {
    console.error('Error creating custom league:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/custom-leagues - Update a custom league
export async function PUT(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { leagueId, updates } = body;

    if (!leagueId) {
      return NextResponse.json({ error: 'League ID is required' }, { status: 400 });
    }

    // In production, check ownership and update in Supabase

    return NextResponse.json({
      success: true,
      message: 'League updated',
    });
  } catch (error) {
    console.error('Error updating custom league:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/custom-leagues - Delete a custom league
export async function DELETE(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const leagueId = searchParams.get('id');

    if (!leagueId) {
      return NextResponse.json({ error: 'League ID is required' }, { status: 400 });
    }

    // In production, check ownership and delete from Supabase

    return NextResponse.json({
      success: true,
      message: 'League deleted',
    });
  } catch (error) {
    console.error('Error deleting custom league:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

```

## File: app\api\custom-leagues\join\route.ts
```
import { NextRequest, NextResponse } from 'next/server';

// POST /api/custom-leagues/join - Join a league with invite code
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { inviteCode } = body;

    if (!inviteCode) {
      return NextResponse.json({ error: 'Invite code is required' }, { status: 400 });
    }

    // In production, find league by invite code and add member in Supabase
    
    // Mock response - simulate finding a league
    if (inviteCode.length !== 6) {
      return NextResponse.json({ error: 'Invalid invite code' }, { status: 400 });
    }

    const mockLeague = {
      id: 'joined-league',
      name: 'Yeni Katıldığın Lig',
      description: 'Bu lige davet koduyla katıldın',
      type: 'private',
      ownerId: 'other-user',
      inviteCode,
      maxMembers: 50,
      memberCount: 15,
    };

    return NextResponse.json({
      success: true,
      message: 'Successfully joined the league',
      league: mockLeague,
    });
  } catch (error) {
    console.error('Error joining league:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

```

## File: app\api\friends\route.ts
```
import { NextRequest, NextResponse } from 'next/server';

// GET /api/friends - Get user's friends list
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // In production, fetch from Supabase
    const mockFriends = [
      {
        id: '1',
        friendId: 'friend-1',
        status: 'accepted',
        createdAt: new Date().toISOString(),
        friend: {
          id: 'friend-1',
          username: 'voleybolcu123',
          displayName: 'Ahmet Yılmaz',
          avatar: null,
          level: 15,
          totalPoints: 2450,
          weeklyPoints: 320,
          correctPredictions: 156,
          totalPredictions: 210,
          winRate: 74.3,
          streak: 5,
          badges: ['early_adopter', 'streak_master'],
          favoriteTeam: 'FENERBAHÇE MEDICANA',
          isOnline: true,
          lastActive: new Date().toISOString(),
        }
      },
      {
        id: '2',
        friendId: 'friend-2',
        status: 'accepted',
        createdAt: new Date().toISOString(),
        friend: {
          id: 'friend-2',
          username: 'tahminKrali',
          displayName: 'Mehmet Demir',
          avatar: null,
          level: 12,
          totalPoints: 1890,
          weeklyPoints: 210,
          correctPredictions: 98,
          totalPredictions: 145,
          winRate: 67.6,
          streak: 3,
          badges: ['prediction_expert'],
          favoriteTeam: 'ECZACIBAŞI DYNAVİT',
          isOnline: false,
          lastActive: new Date(Date.now() - 3600000).toISOString(),
        }
      }
    ];

    return NextResponse.json({ friends: mockFriends });
  } catch (error) {
    console.error('Error fetching friends:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/friends - Send friend request
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { friendId } = body;

    if (!friendId) {
      return NextResponse.json({ error: 'Friend ID is required' }, { status: 400 });
    }

    // In production, create friend request in Supabase
    const friendRequest = {
      id: `request-${Date.now()}`,
      userId,
      friendId,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({ 
      success: true, 
      message: 'Friend request sent',
      request: friendRequest 
    });
  } catch (error) {
    console.error('Error sending friend request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/friends - Remove friend
export async function DELETE(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const friendId = searchParams.get('friendId');

    if (!friendId) {
      return NextResponse.json({ error: 'Friend ID is required' }, { status: 400 });
    }

    // In production, delete from Supabase

    return NextResponse.json({ 
      success: true, 
      message: 'Friend removed' 
    });
  } catch (error) {
    console.error('Error removing friend:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

```

## File: app\api\friends\requests\route.ts
```
import { NextRequest, NextResponse } from 'next/server';

// GET /api/friends/requests - Get pending friend requests
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // In production, fetch from Supabase
    const mockRequests = [
      {
        id: 'req-1',
        userId: 'user-3',
        friendId: userId,
        status: 'pending',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        sender: {
          id: 'user-3',
          username: 'voleybolSever',
          displayName: 'Zeynep Kaya',
          avatar: null,
          level: 8,
          totalPoints: 890,
        }
      }
    ];

    return NextResponse.json({ requests: mockRequests });
  } catch (error) {
    console.error('Error fetching friend requests:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/friends/requests - Accept or reject friend request
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { requestId, action } = body;

    if (!requestId || !action) {
      return NextResponse.json({ error: 'Request ID and action are required' }, { status: 400 });
    }

    if (!['accept', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // In production, update in Supabase

    return NextResponse.json({ 
      success: true, 
      message: action === 'accept' ? 'Friend request accepted' : 'Friend request rejected'
    });
  } catch (error) {
    console.error('Error processing friend request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

```

## File: app\api\friends\search\route.ts
```
import { NextRequest, NextResponse } from 'next/server';

// GET /api/friends/search - Search for users
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
      return NextResponse.json({ users: [] });
    }

    // In production, search in Supabase
    const mockUsers = [
      {
        id: 'user-1',
        username: 'voleybolcu123',
        displayName: 'Ahmet Yılmaz',
        avatar: null,
        level: 15,
        totalPoints: 2450,
      },
      {
        id: 'user-2',
        username: 'tahminKrali',
        displayName: 'Mehmet Demir',
        avatar: null,
        level: 12,
        totalPoints: 1890,
      },
      {
        id: 'user-3',
        username: 'voleybolSever',
        displayName: 'Zeynep Kaya',
        avatar: null,
        level: 8,
        totalPoints: 890,
      },
    ].filter(user => 
      user.username.toLowerCase().includes(query.toLowerCase()) ||
      user.displayName.toLowerCase().includes(query.toLowerCase())
    );

    return NextResponse.json({ users: mockUsers });
  } catch (error) {
    console.error('Error searching users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

```

## File: app\api\leaderboard\route.ts
```
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../utils/supabase-server';

// Revalidate every 2 minutes for leaderboard
export const revalidate = 120;

// GET - Fetch leaderboard
export async function GET(request: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient();
        const { searchParams } = new URL(request.url);

        const type = searchParams.get('type') || 'total'; // total, weekly, monthly
        const limit = parseInt(searchParams.get('limit') || '50');

        let orderColumn = 'total_points';
        if (type === 'weekly') orderColumn = 'weekly_points';
        if (type === 'monthly') orderColumn = 'monthly_points';

        const { data, error } = await supabase
            .from('leaderboard')
            .select('*')
            .order(orderColumn, { ascending: false })
            .limit(limit);

        if (error) {
            console.error('Error fetching leaderboard:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Add rank to each entry
        const rankedData = data?.map((entry, index) => ({
            ...entry,
            rank: index + 1
        }));

        // Get current user's position if authenticated
        const { data: { user } } = await supabase.auth.getUser();
        let userEntry = null;
        let userRank = null;

        if (user) {
            // Find user in the full leaderboard
            const { data: allData } = await supabase
                .from('leaderboard')
                .select('user_id')
                .order(orderColumn, { ascending: false });

            if (allData) {
                const userIndex = allData.findIndex(e => e.user_id === user.id);
                if (userIndex !== -1) {
                    userRank = userIndex + 1;
                    userEntry = rankedData?.find(e => e.user_id === user.id) || null;

                    // If user not in top results, fetch their entry
                    if (!userEntry) {
                        const { data: userData } = await supabase
                            .from('leaderboard')
                            .select('*')
                            .eq('user_id', user.id)
                            .single();

                        if (userData) {
                            userEntry = { ...userData, rank: userRank };
                        }
                    }
                }
            }
        }

        return NextResponse.json({
            leaderboard: rankedData,
            userEntry,
            userRank,
            type
        }, {
            headers: {
                'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300',
            }
        });
    } catch (error) {
        console.error('Leaderboard GET error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

```

## File: app\api\live\route.ts
```
import { NextRequest, NextResponse } from 'next/server';

// GET /api/live - Get live matches
export async function GET(request: NextRequest) {
  try {
    // In production, fetch live matches from external API or WebSocket
    const mockLiveMatches = [
      {
        id: 'live-1',
        homeTeam: 'FENERBAHÇE MEDICANA',
        awayTeam: 'ECZACIBAŞI DYNAVİT',
        homeScore: [25, 23, 18],
        awayScore: [21, 25, 15],
        currentSet: 3,
        currentSetScore: { home: 18, away: 15 },
        status: 'live',
        startTime: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
        league: 'vsl',
        venue: 'Burhan Felek Voleybol Salonu',
        viewers: 1245,
        isHighlighted: true,
        setWins: { home: 1, away: 1 },
      },
      {
        id: 'live-2',
        homeTeam: 'VAKIFBANK',
        awayTeam: 'GALATASARAY DAIKIN',
        homeScore: [25, 22],
        awayScore: [19, 25],
        currentSet: 3,
        currentSetScore: { home: 12, away: 10 },
        status: 'live',
        startTime: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
        league: 'vsl',
        venue: 'Vakıf Spor Salonu',
        viewers: 892,
        isHighlighted: false,
        setWins: { home: 1, away: 1 },
      },
    ];

    const mockUpcomingMatches = [
      {
        id: 'upcoming-1',
        homeTeam: 'THY',
        awayTeam: 'NİLÜFER BELEDİYESPOR',
        status: 'upcoming',
        startTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        league: 'vsl',
        venue: 'THY Spor Salonu',
      },
      {
        id: 'upcoming-2',
        homeTeam: 'BEŞİKTAŞ',
        awayTeam: 'ARAS KARGO',
        status: 'upcoming',
        startTime: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
        league: 'vsl',
        venue: 'Beşiktaş Spor Salonu',
      },
    ];

    return NextResponse.json({
      liveMatches: mockLiveMatches,
      upcomingMatches: mockUpcomingMatches,
    });
  } catch (error) {
    console.error('Error fetching live matches:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

```

## File: app\api\live\[matchId]\comments\route.ts
```
import { NextRequest, NextResponse } from 'next/server';

// GET /api/live/[matchId]/comments - Get match comments
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
  try {
    const { matchId } = await params;

    // In production, fetch from Supabase
    const mockComments = [
      {
        id: 'comment-1',
        matchId,
        userId: 'user-1',
        username: 'voleybolcu123',
        displayName: 'Ahmet Yılmaz',
        avatar: null,
        content: 'Fenerbahçe bu seti alır! 💪',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        likes: 12,
        isLiked: false,
      },
      {
        id: 'comment-2',
        matchId,
        userId: 'user-2',
        username: 'tahminKrali',
        displayName: 'Mehmet Demir',
        avatar: null,
        content: 'Harika bir maç! Her iki takım da çok iyi oynuyor 🏐',
        timestamp: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
        likes: 8,
        isLiked: true,
      },
      {
        id: 'comment-3',
        matchId,
        userId: 'user-3',
        username: 'voleybolSever',
        displayName: 'Zeynep Kaya',
        avatar: null,
        content: 'Bu ace çok güzeldi! 🎯',
        timestamp: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
        likes: 5,
        isLiked: false,
      },
    ];

    return NextResponse.json({ comments: mockComments });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/live/[matchId]/comments - Add a comment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { matchId } = await params;
    const body = await request.json();
    const { content } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Comment content is required' }, { status: 400 });
    }

    // In production, save to Supabase
    const newComment = {
      id: `comment-${Date.now()}`,
      matchId,
      userId,
      username: 'currentUser',
      displayName: 'Kullanıcı',
      avatar: null,
      content: content.trim(),
      timestamp: new Date().toISOString(),
      likes: 0,
      isLiked: false,
    };

    return NextResponse.json({
      success: true,
      comment: newComment,
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

```

## File: app\api\live\[matchId]\comments\[commentId]\like\route.ts
```
import { NextRequest, NextResponse } from 'next/server';

// POST /api/live/[matchId]/comments/[commentId]/like - Like/unlike a comment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ matchId: string; commentId: string }> }
) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { matchId, commentId } = await params;

    // In production, toggle like in Supabase
    // This would check if user already liked and toggle

    return NextResponse.json({
      success: true,
      liked: true, // or false if unliked
    });
  } catch (error) {
    console.error('Error liking comment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

```

## File: app\api\notifications\route.ts
```
import { NextRequest, NextResponse } from 'next/server';

// GET /api/notifications - Get user's notifications
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // In production, fetch from Supabase
    const mockNotifications = [
      {
        id: 'notif-1',
        userId,
        type: 'match_reminder',
        title: 'Maç Başlıyor!',
        message: 'Fenerbahçe vs Eczacıbaşı maçı 1 saat sonra başlıyor. Tahminini yaptın mı?',
        data: { matchId: 'match-1' },
        isRead: false,
        link: '/vsl',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'notif-2',
        userId,
        type: 'match_result',
        title: 'Maç Sonuçlandı',
        message: 'VakıfBank 3-1 Galatasaray. Tahminini doğru yaptın! +25 puan kazandın.',
        data: { matchId: 'match-2', points: 25 },
        isRead: false,
        link: '/vsl',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 'notif-3',
        userId,
        type: 'friend_request',
        title: 'Yeni Arkadaşlık İsteği',
        message: 'voleybolSever sana arkadaşlık isteği gönderdi.',
        data: { senderId: 'user-3' },
        isRead: true,
        link: '/friends',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 'notif-4',
        userId,
        type: 'achievement',
        title: 'Yeni Rozet Kazandın! 🏆',
        message: 'Tahmin Ustası rozetini kazandın. 50 doğru tahmin yaptın!',
        data: { badgeId: 'prediction_master' },
        isRead: true,
        link: '/quests',
        createdAt: new Date(Date.now() - 172800000).toISOString(),
      },
      {
        id: 'notif-5',
        userId,
        type: 'leaderboard_change',
        title: 'Sıralama Değişikliği',
        message: 'Haftalık sıralamada 5. sıraya yükseldin!',
        data: { rank: 5, change: 3 },
        isRead: true,
        link: '/leaderboard',
        createdAt: new Date(Date.now() - 259200000).toISOString(),
      },
    ];

    return NextResponse.json({ 
      notifications: mockNotifications,
      unreadCount: mockNotifications.filter(n => !n.isRead).length
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/notifications - Mark notifications as read
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, notificationIds } = body;

    if (action === 'markAsRead' && notificationIds) {
      // In production, update in Supabase
      return NextResponse.json({ 
        success: true, 
        message: 'Notifications marked as read' 
      });
    }

    if (action === 'markAllAsRead') {
      // In production, update all in Supabase
      return NextResponse.json({ 
        success: true, 
        message: 'All notifications marked as read' 
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error updating notifications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/notifications - Delete notification(s)
export async function DELETE(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get('id');
    const clearAll = searchParams.get('clearAll');

    if (clearAll === 'true') {
      // In production, delete all from Supabase
      return NextResponse.json({ 
        success: true, 
        message: 'All notifications cleared' 
      });
    }

    if (notificationId) {
      // In production, delete from Supabase
      return NextResponse.json({ 
        success: true, 
        message: 'Notification deleted' 
      });
    }

    return NextResponse.json({ error: 'Notification ID or clearAll required' }, { status: 400 });
  } catch (error) {
    console.error('Error deleting notifications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

```

## File: app\api\notifications\preferences\route.ts
```
import { NextRequest, NextResponse } from 'next/server';

// GET /api/notifications/preferences - Get notification preferences
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // In production, fetch from Supabase
    const mockPreferences = {
      userId,
      pushEnabled: true,
      emailEnabled: true,
      matchReminders: true,
      matchResults: true,
      friendRequests: true,
      friendActivity: true,
      achievements: true,
      leaderboardChanges: true,
      dailyQuests: true,
      weeklyDigest: true,
      quietHoursStart: '23:00',
      quietHoursEnd: '08:00',
    };

    return NextResponse.json({ preferences: mockPreferences });
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/notifications/preferences - Update notification preferences
export async function PUT(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // In production, update in Supabase
    
    return NextResponse.json({ 
      success: true, 
      message: 'Preferences updated',
      preferences: { userId, ...body }
    });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

```

## File: app\api\notifications\subscribe\route.ts
```
import { NextRequest, NextResponse } from 'next/server';

// GET /api/notifications/subscribe - Subscribe to push notifications
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { subscription } = body;

    if (!subscription) {
      return NextResponse.json({ error: 'Subscription data required' }, { status: 400 });
    }

    // In production, store subscription in Supabase
    // This would include:
    // - subscription.endpoint
    // - subscription.keys.p256dh
    // - subscription.keys.auth
    
    return NextResponse.json({ 
      success: true, 
      message: 'Push subscription saved' 
    });
  } catch (error) {
    console.error('Error saving push subscription:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/notifications/subscribe - Unsubscribe from push notifications
export async function DELETE(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // In production, remove subscription from Supabase
    
    return NextResponse.json({ 
      success: true, 
      message: 'Push subscription removed' 
    });
  } catch (error) {
    console.error('Error removing push subscription:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

```

## File: app\api\predict-all\route.ts
```
import { NextRequest, NextResponse } from 'next/server';
import { calculateElo } from '../../utils/eloCalculator';
import { Match } from '../../types';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { teams, upcomingMatches, allMatches } = body;

        if (!upcomingMatches || !allMatches) {
            return NextResponse.json({ error: "Missing match data" }, { status: 400 });
        }

        // 1. Calculate Base Elo from History
        const eloMap = calculateElo(teams, allMatches);

        const predictions: Record<string, string> = {};

        // 2. Predict each upcoming match
        (upcomingMatches as Match[]).forEach(m => {
            const hElo = eloMap.get(m.homeTeam) || 1200;
            const aElo = eloMap.get(m.awayTeam) || 1200;

            const expectedHome = 1 / (1 + Math.pow(10, (aElo - hElo) / 400));

            // Logic for score prediction based on probability
            // > 0.85 -> 3-0
            // > 0.70 -> 3-1
            // > 0.55 -> 3-2
            // < 0.45 -> Away Wins (reversed logic)
            // 0.45 - 0.55 -> Close match 3-2 or 2-3

            let score = "3-2"; // default close

            if (expectedHome > 0.85) score = "3-0";
            else if (expectedHome > 0.70) score = "3-1";
            else if (expectedHome > 0.55) score = "3-2";
            else if (expectedHome < 0.15) score = "0-3";
            else if (expectedHome < 0.30) score = "1-3";
            else if (expectedHome < 0.45) score = "2-3";
            else {
                // Toss up for 3-2 or 2-3
                score = expectedHome >= 0.5 ? "3-2" : "2-3";
            }

            const matchId = `${m.homeTeam}|||${m.awayTeam}`;
            predictions[matchId] = score;
        });

        return NextResponse.json(predictions);

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

```

## File: app\api\predictions\route.ts
```
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient } from '../../utils/supabase-server';
import { createRateLimiter } from '../../utils/rateLimit';

// Validation schemas
const PredictionInputSchema = z.object({
    matchId: z.string().min(1),
    league: z.enum(['1lig', '2lig', 'vsl', 'cev-cl']),
    groupName: z.string().optional(),
    homeTeam: z.string().min(1),
    awayTeam: z.string().min(1),
    matchDate: z.string().optional(),
    predictedScore: z.string().regex(/^\d+-\d+$/, 'Invalid score format'),
});

const PredictionBatchSchema = z.array(PredictionInputSchema);

export interface PredictionInput {
    matchId: string;
    league: '1lig' | '2lig' | 'vsl' | 'cev-cl';
    groupName?: string;
    homeTeam: string;
    awayTeam: string;
    matchDate?: string;
    predictedScore: string;
}

// Rate limiter: 60 requests per minute per user
const rateLimiter = createRateLimiter({ requests: 60, windowMs: 60000 });

// GET - Fetch user's predictions
export async function GET(request: NextRequest) {
    try {
        // Apply rate limiting
        const limitResponse = rateLimiter(request);
        if (limitResponse) return limitResponse;

        const supabase = await createServerSupabaseClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const league = searchParams.get('league');
        const groupName = searchParams.get('group');

        let query = supabase
            .from('predictions')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (league) query = query.eq('league', league);
        if (groupName) query = query.eq('group_name', groupName);

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching predictions:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ predictions: data });
    } catch (error) {
        console.error('Predictions GET error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST - Create or update predictions (batch)
export async function POST(request: NextRequest) {
    try {
        // Apply rate limiting
        const limitResponse = rateLimiter(request);
        if (limitResponse) return limitResponse;

        const supabase = await createServerSupabaseClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const predictions: PredictionInput[] = Array.isArray(body) ? body : [body];

        if (predictions.length === 0) {
            return NextResponse.json({ error: 'No predictions provided' }, { status: 400 });
        }

        // Validate all predictions
        try {
            PredictionBatchSchema.parse(predictions);
        } catch (validationError) {
            if (validationError instanceof z.ZodError) {
                return NextResponse.json(
                    { error: 'Invalid prediction data', details: validationError.errors },
                    { status: 400 }
                );
            }
            throw validationError;
        }

        // Transform predictions for upsert
        const records = predictions.map(p => ({
            user_id: user.id,
            match_id: p.matchId,
            league: p.league,
            group_name: p.groupName || null,
            home_team: p.homeTeam,
            away_team: p.awayTeam,
            match_date: p.matchDate ? new Date(p.matchDate).toISOString().split('T')[0] : null,
            predicted_score: p.predictedScore,
            updated_at: new Date().toISOString()
        }));

        // Upsert predictions (insert or update on conflict)
        const { data, error } = await supabase
            .from('predictions')
            .upsert(records, {
                onConflict: 'user_id,match_id',
                ignoreDuplicates: false
            })
            .select();

        if (error) {
            console.error('Error saving predictions:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            saved: data?.length || 0,
            message: `${data?.length || 0} tahmin kaydedildi`
        });
    } catch (error) {
        console.error('Predictions POST error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE - Remove a prediction
export async function DELETE(request: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const matchId = searchParams.get('matchId');

        if (!matchId) {
            return NextResponse.json({ error: 'Match ID required' }, { status: 400 });
        }

        const { error } = await supabase
            .from('predictions')
            .delete()
            .eq('user_id', user.id)
            .eq('match_id', matchId);

        if (error) {
            console.error('Error deleting prediction:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Predictions DELETE error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

```

## File: app\api\push\subscribe\route.ts
```
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/app/utils/supabase-server';

/**
 * POST /api/push/subscribe
 * Save push subscription to database
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const subscription = await request.json();

    // Validate subscription object
    if (!subscription.endpoint || !subscription.keys) {
      return NextResponse.json(
        { error: 'Invalid subscription object' },
        { status: 400 }
      );
    }

    // Save subscription to database
    const { error } = await supabase
      .from('push_subscriptions')
      .upsert({
        user_id: user.id,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      });

    if (error) {
      console.error('Error saving push subscription:', error);
      return NextResponse.json(
        { error: 'Failed to save subscription' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Push subscription error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

```

## File: app\api\push\unsubscribe\route.ts
```
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/app/utils/supabase-server';

/**
 * POST /api/push/unsubscribe
 * Remove push subscription from database
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { endpoint } = await request.json();

    if (!endpoint) {
      return NextResponse.json(
        { error: 'Endpoint required' },
        { status: 400 }
      );
    }

    // Remove subscription from database
    const { error } = await supabase
      .from('push_subscriptions')
      .delete()
      .eq('user_id', user.id)
      .eq('endpoint', endpoint);

    if (error) {
      console.error('Error removing push subscription:', error);
      return NextResponse.json(
        { error: 'Failed to remove subscription' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Push unsubscription error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

```

## File: app\api\quests\route.ts
```
import { NextRequest, NextResponse } from 'next/server';

// GET /api/quests - Get user's quests and badges
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const today = new Date().toISOString().split('T')[0];

    // In production, fetch from Supabase
    const mockDailyQuests = [
      {
        id: 'quest-1',
        type: 'make_predictions',
        title: '3 Tahmin Yap',
        description: 'Bugün 3 maç tahmini yap',
        reward: 50,
        progress: 2,
        target: 3,
        completed: false,
        claimedAt: null,
        expiresAt: new Date(new Date().setHours(23, 59, 59, 999)).toISOString(),
      },
      {
        id: 'quest-2',
        type: 'correct_prediction',
        title: 'Doğru Tahmin',
        description: 'En az 1 doğru tahmin yap',
        reward: 30,
        progress: 1,
        target: 1,
        completed: true,
        claimedAt: null,
        expiresAt: new Date(new Date().setHours(23, 59, 59, 999)).toISOString(),
      },
      {
        id: 'quest-3',
        type: 'visit_app',
        title: 'Günlük Giriş',
        description: 'Uygulamaya giriş yap',
        reward: 10,
        progress: 1,
        target: 1,
        completed: true,
        claimedAt: new Date().toISOString(),
        expiresAt: new Date(new Date().setHours(23, 59, 59, 999)).toISOString(),
      },
    ];

    const mockWeeklyChallenge = {
      id: 'weekly-1',
      title: 'Haftalık Meydan Okuma',
      description: 'Bu hafta 10 doğru tahmin yap',
      reward: 500,
      progress: 6,
      target: 10,
      completed: false,
      expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    };

    const mockBadges = [
      {
        id: 'early_adopter',
        name: 'İlk Katılımcı',
        description: 'Beta döneminde katıldın',
        icon: '🌟',
        rarity: 'legendary',
        earnedAt: new Date('2024-01-15').toISOString(),
        category: 'special',
      },
      {
        id: 'first_prediction',
        name: 'İlk Adım',
        description: 'İlk tahminini yaptın',
        icon: '🎯',
        rarity: 'common',
        earnedAt: new Date('2024-01-16').toISOString(),
        category: 'prediction',
      },
      {
        id: 'streak_3',
        name: '3 Gün Seri',
        description: '3 gün üst üste tahmin yaptın',
        icon: '🔥',
        rarity: 'uncommon',
        earnedAt: new Date('2024-01-20').toISOString(),
        category: 'streak',
      },
      {
        id: 'prediction_50',
        name: 'Deneyimli Tahminci',
        description: '50 tahmin yaptın',
        icon: '📊',
        rarity: 'rare',
        earnedAt: new Date('2024-02-01').toISOString(),
        category: 'prediction',
      },
    ];

    const mockStreak = {
      currentStreak: 5,
      longestStreak: 12,
      lastActivityDate: today,
      freezesAvailable: 2,
      freezeUsedToday: false,
    };

    return NextResponse.json({
      dailyQuests: mockDailyQuests,
      weeklyChallenge: mockWeeklyChallenge,
      badges: mockBadges,
      streak: mockStreak,
    });
  } catch (error) {
    console.error('Error fetching quests:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/quests - Claim quest reward or use streak freeze
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, questId } = body;

    if (action === 'claimReward' && questId) {
      // In production, update in Supabase and add points to user
      return NextResponse.json({
        success: true,
        message: 'Reward claimed',
        pointsEarned: 50,
      });
    }

    if (action === 'useStreakFreeze') {
      // In production, update in Supabase
      return NextResponse.json({
        success: true,
        message: 'Streak freeze used',
        freezesRemaining: 1,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error processing quest action:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

```

## File: app\api\refresh\route.ts
```
import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

export async function POST() {
    try {
        // Run the data update script
        const scriptPath = path.join(process.cwd(), 'scripts', 'update-data.js');

        console.log('[REFRESH] Running update script:', scriptPath);

        const { stdout, stderr } = await execAsync(`node "${scriptPath}"`, {
            timeout: 60000, // 60 second timeout
            cwd: process.cwd()
        });

        if (stderr && !stderr.includes('DevTools')) {
            console.warn('[REFRESH] Script stderr:', stderr);
        }

        console.log('[REFRESH] Script completed successfully');

        return NextResponse.json({
            success: true,
            message: 'Veri güncellendi!',
            timestamp: new Date().toISOString()
        });

    } catch (error: any) {
        console.error('[REFRESH] Error:', error.message);

        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}

// GET endpoint for polling status
export async function GET() {
    return NextResponse.json({
        status: 'ready',
        message: 'POST to this endpoint to refresh data'
    });
}

```

