"use client";

import { useEffect, useState } from "react";
import PageHeader from "../../components/PageHeader";

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

export default function CEVCLGuncelDurum() {
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
    const playedCount = matches.filter(m => m.isPlayed).length;

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
            <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">
                <PageHeader
                    title="CEV Şampiyonlar Ligi"
                    subtitle="Güncel Durum • 2025-2026"
                />

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
            </div>
        </div>
    );
}
