"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useGameState, getLevelTitle, getXPForNextLevel } from "../utils/gameState";
import { LEVEL_THRESHOLDS } from "../types";
import TutorialModal, { useTutorial } from "../components/TutorialModal";

interface Team {
    name: string;
    groupName: string;
    played: number;
    wins: number;
    losses: number;
    points: number;
    setsWon: number;
    setsLost: number;
}

interface Match {
    homeTeam: string;
    awayTeam: string;
    groupName: string;
    matchDate?: string;
    isPlayed: boolean;
    resultScore?: string;
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

export default function AnasayfaPage() {
    const { user } = useAuth();
    const { gameState } = useGameState();
    const { showTutorial, closeTutorial } = useTutorial();

    const [lig1Teams, setLig1Teams] = useState<Team[]>([]);
    const [lig1Matches, setLig1Matches] = useState<Match[]>([]);
    const [lig2Teams, setLig2Teams] = useState<Team[]>([]);
    const [lig2Matches, setLig2Matches] = useState<Match[]>([]);
    const [vslTeams, setVslTeams] = useState<Team[]>([]);
    const [vslMatches, setVslMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);

    // XP Progress calculation
    const currentLevelXP = LEVEL_THRESHOLDS[gameState.level - 1] || 0;
    const nextLevelXP = getXPForNextLevel(gameState.level);
    const progress = gameState.xp - currentLevelXP;
    const required = nextLevelXP - currentLevelXP;
    const percentage = (progress / required) * 100;

    useEffect(() => {
        async function fetchData() {
            try {
                const [res1, res2, resVsl] = await Promise.all([
                    fetch("/api/1lig"),
                    fetch("/api/calculate"),
                    fetch("/api/vsl")
                ]);

                if (res1.ok) {
                    const data1 = await res1.json();
                    setLig1Teams(data1.teams || []);
                    setLig1Matches(data1.fixture || []);
                }

                if (res2.ok) {
                    const data2 = await res2.json();
                    setLig2Teams(data2.teams || []);
                    setLig2Matches(data2.fixture || []);
                }

                if (resVsl.ok) {
                    const dataVsl = await resVsl.json();
                    setVslTeams(dataVsl.teams || []);
                    setVslMatches(dataVsl.fixture || []);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    // Get top 3 teams from first group of each league
    const lig1Groups = [...new Set(lig1Teams.map(t => t.groupName))].sort();
    const lig2Groups = [...new Set(lig2Teams.map(t => t.groupName))].sort();

    const lig1TopTeams = sortStandings(lig1Teams.filter(t => t.groupName === lig1Groups[0])).slice(0, 3);
    const lig2TopTeams = sortStandings(lig2Teams.filter(t => t.groupName === lig2Groups[0])).slice(0, 3);
    const vslTopTeams = sortStandings(vslTeams).slice(0, 3);

    const lig1UpcomingMatches = lig1Matches.filter(m => !m.isPlayed).slice(0, 3);
    const lig2UpcomingMatches = lig2Matches.filter(m => !m.isPlayed).slice(0, 3);
    const vslUpcomingMatches = vslMatches.filter(m => !m.isPlayed).slice(0, 3);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
            </div>
        );
    }

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
                            <span>🏆 {gameState.achievements.length} Başarım</span>
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
                        <div className="text-3xl mb-2">🏆</div>
                        <div className="font-bold text-white">Sultanlar</div>
                        <div className="text-xs text-white/60">Tahmin Oyunu</div>
                    </Link>
                    <Link
                        href="/1lig/tahminoyunu"
                        className="bg-gradient-to-br from-amber-600 to-orange-700 rounded-2xl p-4 text-center shadow-xl shadow-amber-500/20 hover:scale-[1.02] transition-all"
                    >
                        <div className="text-3xl mb-2">🥇</div>
                        <div className="font-bold text-white">1. Lig</div>
                        <div className="text-xs text-white/60">Tahmin Oyunu</div>
                    </Link>
                    <Link
                        href="/2lig/tahminoyunu"
                        className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-4 text-center shadow-xl shadow-emerald-500/20 hover:scale-[1.02] transition-all"
                    >
                        <div className="text-3xl mb-2">🥈</div>
                        <div className="font-bold text-white">2. Lig</div>
                        <div className="text-xs text-white/60">Tahmin Oyunu</div>
                    </Link>
                </div>

                {/* 1. Lig Summary */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                    <div className="bg-gradient-to-r from-amber-600 to-orange-600 px-4 py-3 flex items-center justify-between">
                        <h2 className="font-bold text-white flex items-center gap-2">
                            <span>🥇</span> Arabica Coffee House 1. Lig
                        </h2>
                        <Link href="/1lig/gunceldurum" className="text-xs text-white/80 hover:text-white">
                            Tümünü Gör →
                        </Link>
                    </div>

                    <div className="p-4 grid md:grid-cols-2 gap-4">
                        {/* Standings Preview */}
                        <div>
                            <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">Puan Durumu ({lig1Groups[0]})</h3>
                            <div className="space-y-1">
                                {lig1TopTeams.map((team, i) => (
                                    <div key={team.name} className="flex items-center gap-2 p-2 bg-slate-800/50 rounded-lg">
                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${i === 0 ? "bg-amber-500 text-white" : "bg-slate-700 text-slate-400"
                                            }`}>{i + 1}</div>
                                        <span className="flex-1 text-sm text-slate-300 truncate">{team.name}</span>
                                        <span className="text-xs text-slate-500">{team.played}M</span>
                                        <span className="font-bold text-white text-sm">{team.points}P</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Upcoming Matches */}
                        <div>
                            <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">Yaklaşan Maçlar</h3>
                            <div className="space-y-1">
                                {lig1UpcomingMatches.map((match, i) => (
                                    <div key={i} className="flex items-center gap-2 p-2 bg-slate-800/50 rounded-lg text-xs">
                                        <span className="flex-1 text-slate-300 truncate text-right">{match.homeTeam}</span>
                                        <span className="px-2 py-0.5 bg-slate-700 rounded text-slate-500">vs</span>
                                        <span className="flex-1 text-slate-300 truncate">{match.awayTeam}</span>
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
                            <span>🏆</span> Vodafone Sultanlar Ligi
                        </h2>
                        <Link href="/vsl/gunceldurum" className="text-xs text-white/80 hover:text-white">
                            Tümünü Gör →
                        </Link>
                    </div>

                    <div className="p-4 grid md:grid-cols-2 gap-4">
                        {/* Standings Preview */}
                        <div>
                            <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">Puan Durumu</h3>
                            <div className="space-y-1">
                                {vslTopTeams.map((team, i) => (
                                    <div key={team.name} className="flex items-center gap-2 p-2 bg-slate-800/50 rounded-lg">
                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${i === 0 ? "bg-red-600 text-white" : "bg-slate-700 text-slate-400"
                                            }`}>{i + 1}</div>
                                        <span className="flex-1 text-sm text-slate-300 truncate">{team.name}</span>
                                        <span className="text-xs text-slate-500">{team.played}M</span>
                                        <span className="font-bold text-white text-sm">{team.points}P</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Upcoming Matches */}
                        <div>
                            <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">Yaklaşan Maçlar</h3>
                            <div className="space-y-1">
                                {vslUpcomingMatches.map((match, i) => (
                                    <div key={i} className="flex items-center gap-2 p-2 bg-slate-800/50 rounded-lg text-xs">
                                        <span className="flex-1 text-slate-300 truncate text-right">{match.homeTeam}</span>
                                        <span className="px-2 py-0.5 bg-slate-700 rounded text-slate-500">vs</span>
                                        <span className="flex-1 text-slate-300 truncate">{match.awayTeam}</span>
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
                            <span>🥈</span> Kadınlar 2. Lig
                        </h2>
                        <Link href="/2lig/gunceldurum" className="text-xs text-white/80 hover:text-white">
                            Tümünü Gör →
                        </Link>
                    </div>

                    <div className="p-4 grid md:grid-cols-2 gap-4">
                        {/* Standings Preview */}
                        <div>
                            <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">Puan Durumu ({lig2Groups[0]})</h3>
                            <div className="space-y-1">
                                {lig2TopTeams.map((team, i) => (
                                    <div key={team.name} className="flex items-center gap-2 p-2 bg-slate-800/50 rounded-lg">
                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${i === 0 ? "bg-emerald-500 text-white" : "bg-slate-700 text-slate-400"
                                            }`}>{i + 1}</div>
                                        <span className="flex-1 text-sm text-slate-300 truncate">{team.name}</span>
                                        <span className="text-xs text-slate-500">{team.played}M</span>
                                        <span className="font-bold text-white text-sm">{team.points}P</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Upcoming Matches */}
                        <div>
                            <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">Yaklaşan Maçlar</h3>
                            <div className="space-y-1">
                                {lig2UpcomingMatches.map((match, i) => (
                                    <div key={i} className="flex items-center gap-2 p-2 bg-slate-800/50 rounded-lg text-xs">
                                        <span className="flex-1 text-slate-300 truncate text-right">{match.homeTeam}</span>
                                        <span className="px-2 py-0.5 bg-slate-700 rounded text-slate-500">vs</span>
                                        <span className="flex-1 text-slate-300 truncate">{match.awayTeam}</span>
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
                        <div className="text-[10px] text-slate-500">Tahmin</div>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
                        <div className="text-xl font-bold text-emerald-400">{gameState.stats.correctPredictions}</div>
                        <div className="text-[10px] text-slate-500">Doğru</div>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
                        <div className="text-xl font-bold text-orange-400">{gameState.stats.bestStreak}</div>
                        <div className="text-[10px] text-slate-500">En İyi Seri</div>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
                        <div className="text-xl font-bold text-cyan-400">{gameState.achievements.length}</div>
                        <div className="text-[10px] text-slate-500">Başarım</div>
                    </div>
                </div>
            </div>

            {/* Tutorial Modal */}
            <TutorialModal isOpen={showTutorial} onClose={closeTutorial} />
        </div>
    );
}
