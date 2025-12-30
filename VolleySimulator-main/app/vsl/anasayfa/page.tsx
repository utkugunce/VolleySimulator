"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

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

export default function VSLAnasayfa() {
    const [teams, setTeams] = useState<Team[]>([]);
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/vsl")
            .then(res => res.json())
            .then(data => {
                setTeams(data.teams || []);
                setMatches(data.fixture || []);
            })
            .finally(() => setLoading(false));
    }, []);

    const sortedTeams = sortStandings(teams).slice(0, 5);
    const upcomingMatches = matches.filter(m => !m.isPlayed).slice(0, 4);
    const playedCount = matches.filter(m => m.isPlayed).length;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950">
            {/* Hero Header */}
            <div className="bg-gradient-to-br from-red-600 via-rose-600 to-red-800 px-4 py-4 relative overflow-hidden">
                <div className="relative max-w-4xl mx-auto">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-white mb-1">Vodafone Sultanlar Ligi</h1>
                            <p className="text-white/70 text-sm">2025/2026 Sezonu</p>
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-bold text-white">{playedCount}</div>
                            <div className="text-xs text-white/60">Oynanan Maç</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 mt-4 space-y-4 pb-6">
                {/* Quick Action - Tahmin Oyunu */}
                <Link
                    href="/vsl/tahminoyunu"
                    className="block bg-slate-900 border border-red-500/30 rounded-2xl p-4 shadow-xl shadow-red-500/10 hover:border-red-500/50 transition-all group"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-red-600 to-rose-700 rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-red-500/30 group-hover:scale-110 transition-transform">
                            🎯
                        </div>
                        <div className="flex-1">
                            <div className="font-bold text-white text-lg">Tahmin Oyunu</div>
                            <div className="text-sm text-slate-400">Maç skorlarını tahmin et</div>
                        </div>
                        <div className="text-red-400 text-xl">→</div>
                    </div>
                </Link>

                {/* Standings Preview */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                    <div className="bg-slate-800/50 px-4 py-3 flex items-center justify-between border-b border-slate-800">
                        <h3 className="font-bold text-white flex items-center gap-2">
                            <span className="text-red-400">📊</span> Puan Durumu
                        </h3>
                        <Link href="/vsl/gunceldurum" className="text-xs text-red-400 hover:underline">
                            Tümünü Gör →
                        </Link>
                    </div>
                    <div className="divide-y divide-slate-800/50">
                        {sortedTeams.map((team, i) => (
                            <div key={team.name} className="px-4 py-2.5 flex items-center gap-3">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? "bg-red-600 text-white" :
                                    i === 1 ? "bg-emerald-500 text-white" :
                                        "bg-slate-700 text-slate-400"
                                    }`}>
                                    {i + 1}
                                </div>
                                <div className="flex-1 font-medium text-sm text-slate-200 truncate">{team.name}</div>
                                <div className="text-xs text-slate-500">{team.played}M</div>
                                <div className="font-bold text-sm text-white w-8 text-right">{team.points}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Upcoming Matches */}
                {upcomingMatches.length > 0 && (
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                        <div className="bg-slate-800/50 px-4 py-3 flex items-center justify-between border-b border-slate-800">
                            <h3 className="font-bold text-white flex items-center gap-2">
                                <span className="text-emerald-400">📅</span> Yaklaşan Maçlar
                            </h3>
                        </div>
                        <div className="divide-y divide-slate-800/50">
                            {upcomingMatches.map((match, i) => (
                                <div key={i} className="px-4 py-3 flex items-center gap-2">
                                    <div className="flex-1 text-right text-sm text-slate-300 truncate">{match.homeTeam}</div>
                                    <div className="px-2 py-0.5 bg-slate-800 rounded text-[10px] text-slate-500 font-mono">vs</div>
                                    <div className="flex-1 text-sm text-slate-300 truncate">{match.awayTeam}</div>
                                    {match.matchDate && (
                                        <div className="text-[10px] text-slate-500 shrink-0">{match.matchDate}</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Other Actions */}
                <div className="grid grid-cols-2 gap-3">
                    <Link
                        href="/vsl/gunceldurum"
                        className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center hover:border-slate-600 transition-all"
                    >
                        <div className="text-2xl mb-2">📋</div>
                        <div className="text-sm font-bold text-slate-200">Puan Durumu</div>
                    </Link>
                    <Link
                        href="/vsl/stats"
                        className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center hover:border-slate-600 transition-all"
                    >
                        <div className="text-2xl mb-2">📈</div>
                        <div className="text-sm font-bold text-slate-200">İstatistikler</div>
                    </Link>
                </div>
            </div>
        </div>
    );
}
