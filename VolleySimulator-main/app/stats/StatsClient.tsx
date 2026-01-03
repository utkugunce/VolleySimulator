"use client";

import { useMemo } from "react";
import { TeamStats } from "../types";

import TeamAvatar from "../components/TeamAvatar";

interface StatsClientProps {
    initialTeams: TeamStats[];
}

export default function StatsClient({ initialTeams }: StatsClientProps) {
    const teamsWithStats = useMemo(() => initialTeams.map(t => ({
        ...t,
        losses: t.played - t.wins,
        winRate: t.played > 0 ? Math.round((t.wins / t.played) * 100) : 0
    })), [initialTeams]);

    const leastLosses = useMemo(() => [...teamsWithStats].sort((a, b) => a.losses - b.losses || b.wins - a.wins).slice(0, 5), [teamsWithStats]);
    const mostLosses = useMemo(() => [...teamsWithStats].sort((a, b) => b.losses - a.losses || a.wins - b.wins).slice(0, 5), [teamsWithStats]);
    const mostSets = useMemo(() => [...teamsWithStats].sort((a, b) => b.setsWon - a.setsWon).slice(0, 5), [teamsWithStats]);
    const mostPoints = useMemo(() => [...teamsWithStats].sort((a, b) => b.points - a.points).slice(0, 5), [teamsWithStats]);
    const leastSetsLost = useMemo(() => [...teamsWithStats].sort((a, b) => a.setsLost - b.setsLost || b.wins - a.wins).slice(0, 5), [teamsWithStats]);
    const bestWinRate = useMemo(() => [...teamsWithStats].filter(t => t.played >= 5).sort((a, b) => b.winRate - a.winRate).slice(0, 5), [teamsWithStats]);

    // Summary stats
    const totalTeams = initialTeams.length;
    const totalMatches = Math.floor(initialTeams.reduce((acc, t) => acc + t.played, 0) / 2);
    const avgPoints = totalTeams > 0 ? Math.round(initialTeams.reduce((acc, t) => acc + t.points, 0) / totalTeams) : 0;

    return (
        <main className="min-h-screen bg-slate-950 text-slate-100 p-4 font-sans">
            <div className="max-w-7xl mx-auto space-y-8 pt-4">
                <div className="flex flex-col gap-1">
                    <h1 className="font-bold text-white text-lg tracking-tight leading-none hidden sm:block">İstatistikler</h1>
                    <p className="text-[10px] text-slate-400 hidden sm:block">Global İstatistik Merkezi</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-emerald-600/20 to-emerald-900/20 backdrop-blur-sm border border-emerald-500/20 rounded-2xl p-4 text-center">
                        <div className="text-3xl font-black text-emerald-400">{totalTeams}</div>
                        <div className="text-xs text-slate-400 uppercase tracking-wider mt-1">Takım</div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-600/20 to-blue-900/20 backdrop-blur-sm border border-blue-500/20 rounded-2xl p-4 text-center">
                        <div className="text-3xl font-black text-blue-400">{totalMatches}</div>
                        <div className="text-xs text-slate-400 uppercase tracking-wider mt-1">Maç</div>
                    </div>
                    <div className="bg-gradient-to-br from-amber-600/20 to-amber-900/20 backdrop-blur-sm border border-amber-500/20 rounded-2xl p-4 text-center">
                        <div className="text-3xl font-black text-amber-400">{avgPoints}</div>
                        <div className="text-xs text-slate-400 uppercase tracking-wider mt-1">Ort. Puan</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-600/20 to-purple-900/20 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-4 text-center">
                        <div className="text-3xl font-black text-purple-400">11</div>
                        <div className="text-xs text-slate-400 uppercase tracking-wider mt-1">Grup</div>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
                    <StatCard
                        title="En Çok Puan"
                        icon="💎"
                        teams={mostPoints}
                        statKey="points"
                        color="bg-amber-500"
                        gradient="bg-gradient-to-r from-amber-600 to-orange-600"
                        suffix="P"
                    />
                    <StatCard
                        title="En Yüksek Galibiyet %"
                        icon="📈"
                        teams={bestWinRate}
                        statKey="winRate"
                        color="bg-teal-500"
                        gradient="bg-gradient-to-r from-teal-600 to-emerald-600"
                        suffix="%"
                    />
                    <StatCard
                        title="En Çok Set Alan"
                        icon="🏐"
                        teams={mostSets}
                        statKey="setsWon"
                        color="bg-purple-500"
                        gradient="bg-gradient-to-r from-purple-600 to-pink-600"
                        suffix="Set"
                    />
                    <StatCard
                        title="En Az Mağlubiyet"
                        icon="🛡️"
                        teams={leastLosses}
                        statKey="losses"
                        color="bg-emerald-500"
                        gradient="bg-gradient-to-r from-emerald-600 to-cyan-600"
                        suffix="M"
                    />
                    <StatCard
                        title="En Az Set Veren"
                        icon="🧱"
                        teams={leastSetsLost}
                        statKey="setsLost"
                        color="bg-rose-500"
                        gradient="bg-gradient-to-r from-rose-600 to-red-600"
                        suffix="Set"
                    />
                    <StatCard
                        title="En Çok Mağlubiyet"
                        icon="📉"
                        teams={mostLosses}
                        statKey="losses"
                        color="bg-slate-500"
                        gradient="bg-gradient-to-r from-slate-600 to-slate-700"
                        suffix="M"
                    />
                </div>
            </div>
        </main>
    );
}

// Helper types for StatCard
type TeamWithStats = TeamStats & {
    losses: number;
    winRate: number;
};

const StatCard = ({ title, icon, teams, statKey, color, gradient, suffix = "" }: {
    title: string; icon: string;
    teams: TeamWithStats[];
    statKey: 'losses' | 'wins' | 'setsWon' | 'setsLost' | 'points' | 'winRate';
    color: string;
    gradient: string;
    suffix?: string;
}) => {
    const maxValue = Math.max(...teams.map(t => Number(t[statKey])), 1);

    return (
        <div className="bg-slate-950/50 backdrop-blur-md rounded-xl border border-slate-800/60 overflow-hidden hover:border-slate-700/80 transition-all duration-300 group shadow-lg hover:shadow-xl">
            <div className={`${gradient} px-3 py-2.5 border-b border-white/10 relative overflow-hidden`}>
                {/* Gloss effect */}
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="flex items-center justify-between relative z-10">
                    <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
                        <span className="text-base">{icon}</span> {title}
                    </h3>
                    <span className="text-[10px] font-bold text-white/80 bg-black/20 px-2 py-0.5 rounded-full backdrop-blur-sm border border-white/10">TOP 5</span>
                </div>
            </div>

            <div className="p-2 space-y-1.5">
                {teams.map((t, idx) => (
                    <div
                        key={t.name}
                        className={`flex items-center gap-2.5 p-1.5 rounded-lg transition-all ${idx === 0 ? 'bg-gradient-to-r from-white/5 to-transparent border border-white/10' : 'hover:bg-white/5'
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
                            <span className={`text-xs font-bold truncate block ${idx === 0 ? 'text-white' : 'text-slate-300'}`} title={t.name}>
                                {t.name}
                            </span>
                        </div>

                        <div className="flex items-center gap-2 w-20 justify-end">
                            <div className="h-1 bg-slate-800/50 rounded-full overflow-hidden flex-1 max-w-[40px]">
                                <div className={`h-full ${color} opacity-80`} style={{ width: `${Math.min((Number(t[statKey]) / maxValue) * 100, 100)}%` }}></div>
                            </div>
                            <span className={`text-xs font-bold min-w-[30px] text-right ${idx === 0 ? 'text-white' : 'text-slate-400'}`}>
                                {t[statKey]}{suffix}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
