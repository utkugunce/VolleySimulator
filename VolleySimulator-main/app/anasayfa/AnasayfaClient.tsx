"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { useGameState, getLevelTitle, getXPForNextLevel } from "../utils/gameState";
import { LEVEL_THRESHOLDS, TeamStats, Match } from "../types";
import TutorialModal, { useTutorial } from "../components/TutorialModal";
import TeamAvatar from "../components/TeamAvatar";


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
