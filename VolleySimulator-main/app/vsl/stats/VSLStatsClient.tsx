"use client";

import { useMemo } from "react";
import { TeamStats } from "../../types";

import TeamAvatar from "@/app/components/TeamAvatar";

interface VSLStatsClientProps {
    initialTeams: TeamStats[];
}

export default function VSLStatsClient({ initialTeams }: VSLStatsClientProps) {
    const teamsWithStats = useMemo(() => initialTeams.map(t => ({
        ...t,
        losses: t.played - t.wins,
        winRate: t.played > 0 ? Math.round((t.wins / t.played) * 100) : 0,
        setRatio: t.setsLost > 0 ? (t.setsWon / t.setsLost).toFixed(2) : t.setsWon.toString()
    })), [initialTeams]);

    const totalMatches = useMemo(() => teamsWithStats.reduce((sum, t) => sum + t.played, 0) / 2, [teamsWithStats]);
    const totalSets = useMemo(() => teamsWithStats.reduce((sum, t) => sum + t.setsWon, 0), [teamsWithStats]);
    const avgPointsPerTeam = useMemo(() => teamsWithStats.length > 0
        ? Math.round(teamsWithStats.reduce((sum, t) => sum + t.points, 0) / teamsWithStats.length)
        : 0, [teamsWithStats]);

    const leastLosses = useMemo(() => [...teamsWithStats].sort((a, b) => a.losses - b.losses || b.wins - a.wins).slice(0, 5), [teamsWithStats]);
    const mostLosses = useMemo(() => [...teamsWithStats].sort((a, b) => b.losses - a.losses || a.wins - b.wins).slice(0, 5), [teamsWithStats]);
    const mostSets = useMemo(() => [...teamsWithStats].sort((a, b) => b.setsWon - a.setsWon).slice(0, 5), [teamsWithStats]);
    const mostPoints = useMemo(() => [...teamsWithStats].sort((a, b) => b.points - a.points).slice(0, 5), [teamsWithStats]);
    const leastSetsLost = useMemo(() => [...teamsWithStats].sort((a, b) => a.setsLost - b.setsLost || b.wins - a.wins).slice(0, 5), [teamsWithStats]);
    const bestWinRate = useMemo(() => [...teamsWithStats].filter(t => t.played >= 3).sort((a, b) => b.winRate - a.winRate).slice(0, 5), [teamsWithStats]);

    const BarChart = ({ value, max, color }: { value: number; max: number; color: string }) => (
        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden flex-1">
            <div
                className={`h-full ${color} transition-all duration-500`}
                style={{ width: `${Math.min((value / max) * 100, 100)}%` }}
            />
        </div>
    );

    const StatCard = ({ title, icon, teams, statKey, color, gradient, suffix = "" }: {
        title: string; icon: string;
        teams: typeof teamsWithStats;
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
                            className={`flex items-center gap-2 p-1.5 rounded-lg transition-all ${idx === 0 ? 'bg-gradient-to-r from-red-500/10 to-transparent border border-red-500/20' : 'hover:bg-slate-800/50'
                                }`}
                        >
                            <div className={`w-5 h-5 rounded flex items-center justify-center font-bold text-[10px] ${idx === 0 ? 'bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-sm' :
                                idx === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-slate-800' :
                                    idx === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-700 text-white' :
                                        'bg-slate-800 text-slate-500'
                                }`}>
                                {idx + 1}
                            </div>
                            <TeamAvatar name={t.name} size="xs" />

                            <div className="flex-1 min-w-0">
                                <span className={`text-[11px] font-medium truncate block ${idx === 0 ? 'text-red-300' : 'text-white'}`} title={t.name}>
                                    {t.name}
                                </span>
                            </div>

                            <div className="flex items-center gap-1.5 w-16">
                                <BarChart value={Number(t[statKey])} max={maxValue} color={color} />
                                <span className={`text-[11px] font-bold min-w-[28px] text-right ${idx === 0 ? 'text-red-400' : 'text-slate-300'}`}>
                                    {t[statKey]}{suffix}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <main className="min-h-screen bg-slate-950 text-slate-100 p-2 sm:p-4 font-sans">
            <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
                <div className="flex flex-col gap-1 px-1">
                    <h1 className="font-bold text-white text-lg tracking-tight leading-none hidden sm:block">Sultanlar Ligi İstatistikleri</h1>
                    <p className="text-[10px] text-slate-400 hidden sm:block">Vodafone Sultanlar Ligi İstatistik Merkezi</p>
                </div>

                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                    <div className="bg-gradient-to-br from-red-600/20 to-red-900/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-red-600/30 text-center">
                        <div className="text-2xl sm:text-4xl font-bold text-red-400">{Math.round(totalMatches)}</div>
                        <div className="text-[10px] sm:text-xs text-red-400/70 uppercase tracking-wider mt-1">Toplam Maç</div>
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

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 pb-8">
                    <StatCard
                        title="En Çok Puan"
                        icon="💎"
                        teams={mostPoints}
                        statKey="points"
                        color="bg-red-500"
                        gradient="bg-gradient-to-r from-red-600 to-rose-600"
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
                    <StatCard
                        title="En Az Set Veren"
                        icon="🧱"
                        teams={leastSetsLost}
                        statKey="setsLost"
                        color="bg-rose-500"
                        gradient="bg-gradient-to-r from-rose-600 to-red-600"
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
