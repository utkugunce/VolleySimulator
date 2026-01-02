"use client";

import { useState, useMemo } from "react";
import { TeamStats } from "../../types";
import PageHeader from "@/app/components/PageHeader";
import TeamAvatar from "@/app/components/TeamAvatar";

interface OneLigStatsClientProps {
    initialTeams: TeamStats[];
}

export default function OneLigStatsClient({ initialTeams }: OneLigStatsClientProps) {
    const [activeTab, setActiveTab] = useState("GENEL");

    const groups = useMemo(() => {
        return Array.from(new Set(initialTeams.map((t: TeamStats) => t.groupName))).sort() as string[];
    }, [initialTeams]);

    const filteredTeams = useMemo(() => activeTab === "GENEL"
        ? initialTeams
        : initialTeams.filter(t => t.groupName === activeTab), [initialTeams, activeTab]);

    const teamsWithStats = useMemo(() => filteredTeams.map(t => ({
        ...t,
        losses: (t.played || 0) - (t.wins || 0),
        winRate: (t.played || 0) > 0 ? Math.round(((t.wins || 0) / (t.played || 0)) * 100) : 0,
        setRatio: (t.setsLost || 0) > 0 ? ((t.setsWon || 0) / (t.setsLost || 0)).toFixed(2) : (t.setsWon || 0).toString()
    })), [filteredTeams]);

    const totalMatches = useMemo(() => teamsWithStats.reduce((sum, t) => sum + (t.played || 0), 0) / 2, [teamsWithStats]);
    const totalSets = useMemo(() => teamsWithStats.reduce((sum, t) => sum + (t.setsWon || 0), 0), [teamsWithStats]);
    const avgPointsPerTeam = useMemo(() => teamsWithStats.length > 0
        ? Math.round(teamsWithStats.reduce((sum, t) => sum + (t.points || 0), 0) / teamsWithStats.length)
        : 0, [teamsWithStats]);

    const leastLosses = useMemo(() => [...teamsWithStats].sort((a, b) => a.losses - b.losses || b.wins - a.wins).slice(0, 5), [teamsWithStats]);
    const mostLosses = useMemo(() => [...teamsWithStats].sort((a, b) => b.losses - a.losses || a.wins - b.wins).slice(0, 5), [teamsWithStats]);
    const mostSets = useMemo(() => [...teamsWithStats].sort((a, b) => b.setsWon - a.setsWon).slice(0, 5), [teamsWithStats]);
    const mostPoints = useMemo(() => [...teamsWithStats].sort((a, b) => b.points - a.points).slice(0, 5), [teamsWithStats]);
    const leastSetsLost = useMemo(() => [...teamsWithStats].sort((a, b) => a.setsLost - b.setsLost || b.wins - a.wins).slice(0, 5), [teamsWithStats]);
    const bestWinRate = useMemo(() => [...teamsWithStats].filter(t => (t.played || 0) >= 3).sort((a, b) => b.winRate - a.winRate).slice(0, 5), [teamsWithStats]);

    const BarChart = ({ value, max, color }: { value: number; max: number; color: string }) => (
        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden flex-1">
            <div
                className={`h-full ${color} transition-all duration-500`}
                style={{ width: `${Math.min((value / (max || 1)) * 100, 100)}%` }}
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
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 rounded-2xl border border-slate-800 overflow-hidden hover:border-slate-700 transition-all duration-300 group">
                <div className={`${gradient} px-4 py-3 border-b border-white/10`}>
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold text-white text-sm flex items-center gap-2">
                            <span className="text-lg">{icon}</span> {title}
                        </h3>
                        <span className="text-xs text-white/60 bg-white/10 px-2 py-0.5 rounded-full">TOP 5</span>
                    </div>
                </div>

                <div className="p-3 space-y-2">
                    {teams.map((t, idx) => (
                        <div
                            key={t.name}
                            className={`flex items-center gap-3 p-2 rounded-xl transition-all ${idx === 0 ? 'bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/20' : 'hover:bg-slate-800/50'
                                }`}
                        >
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-sm ${idx === 0 ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/30' :
                                idx === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-slate-800' :
                                    idx === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-700 text-white' :
                                        'bg-slate-800 text-slate-500'
                                }`}>
                                {idx + 1}
                            </div>
                            <TeamAvatar name={t.name} size="xs" />

                            <div className="flex-1 min-w-0">
                                <span className={`text-sm font-medium truncate block ${idx === 0 ? 'text-amber-300' : 'text-white'}`} title={t.name}>
                                    {t.name}
                                </span>
                                <span className="text-[10px] text-slate-500">{t.groupName}</span>
                            </div>

                            <div className="flex items-center gap-2 w-24">
                                <BarChart value={Number(t[statKey])} max={maxValue} color={color} />
                                <span className={`text-sm font-bold min-w-[40px] text-right ${idx === 0 ? 'text-amber-400' : 'text-slate-300'}`}>
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
                <PageHeader
                    title="1. Lig İstatistikleri"
                    subtitle="Kadınlar 1. Ligi İstatistik Merkezi"
                />

                <div className="flex bg-slate-900/50 p-1 rounded-xl border border-slate-800/50 overflow-x-auto">
                    <button
                        onClick={() => setActiveTab("GENEL")}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${activeTab === "GENEL"
                            ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20"
                            : "text-slate-400 hover:text-white hover:bg-slate-800"
                            }`}
                    >
                        GENEL İSTATİSTİKLER
                    </button>
                    {groups.map(group => (
                        <button
                            key={group}
                            onClick={() => setActiveTab(group)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ml-1 ${activeTab === group
                                ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20"
                                : "text-slate-400 hover:text-white hover:bg-slate-800"
                                }`}
                        >
                            {group} İSTATİSTİKLERİ
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                    <div className="bg-gradient-to-br from-amber-600/20 to-amber-900/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-amber-600/30 text-center">
                        <div className="text-2xl sm:text-4xl font-bold text-amber-400">{Math.round(totalMatches)}</div>
                        <div className="text-[10px] sm:text-xs text-amber-400/70 uppercase tracking-wider mt-1">Toplam Maç</div>
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
                        color="bg-amber-500"
                        gradient="bg-gradient-to-r from-amber-600 to-orange-600"
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
