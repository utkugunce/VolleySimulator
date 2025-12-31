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

export default function CEVCLStatsPage() {
    const [loading, setLoading] = useState(true);
    const [allTeams, setAllTeams] = useState<Team[]>([]);

    useEffect(() => {
        fetch("/api/cev-cl")
            .then(res => res.json())
            .then(data => {
                setAllTeams(data.teams || []);
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="h-[calc(100vh-64px)] flex items-center justify-center text-slate-400">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const teamsWithStats = allTeams.map(t => ({
        ...t,
        losses: t.played - t.wins,
        winRate: t.played > 0 ? Math.round((t.wins / t.played) * 100) : 0,
        setRatio: t.setsLost > 0 ? (t.setsWon / t.setsLost).toFixed(2) : t.setsWon.toString()
    }));

    const totalMatches = teamsWithStats.reduce((sum, t) => sum + t.played, 0) / 2;
    const totalSets = teamsWithStats.reduce((sum, t) => sum + t.setsWon, 0);
    const avgPointsPerTeam = teamsWithStats.length > 0
        ? Math.round(teamsWithStats.reduce((sum, t) => sum + t.points, 0) / teamsWithStats.length)
        : 0;

    const mostPoints = [...teamsWithStats].sort((a, b) => b.points - a.points).slice(0, 5);
    const mostSets = [...teamsWithStats].sort((a, b) => b.setsWon - a.setsWon).slice(0, 5);
    const leastLosses = [...teamsWithStats].sort((a, b) => a.losses - b.losses || b.wins - a.wins).slice(0, 5);
    const bestWinRate = [...teamsWithStats].filter(t => t.played >= 2).sort((a, b) => b.winRate - a.winRate).slice(0, 5);

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
        const maxValue = Math.max(...teams.map(t => Number(t[statKey])));

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
                            className={`flex items-center gap-3 p-2 rounded-xl transition-all ${idx === 0 ? 'bg-gradient-to-r from-blue-500/10 to-transparent border border-blue-500/20' : 'hover:bg-slate-800/50'
                                }`}
                        >
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-sm ${idx === 0 ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30' :
                                idx === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-slate-800' :
                                    idx === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-700 text-white' :
                                        'bg-slate-800 text-slate-500'
                                }`}>
                                {idx + 1}
                            </div>

                            <div className="flex-1 min-w-0">
                                <span className={`text-sm font-medium truncate block ${idx === 0 ? 'text-blue-300' : 'text-white'}`} title={t.name}>
                                    {t.name}
                                </span>
                            </div>

                            <div className="flex items-center gap-2 w-24">
                                <BarChart value={Number(t[statKey])} max={maxValue} color={color} />
                                <span className={`text-sm font-bold min-w-[40px] text-right ${idx === 0 ? 'text-blue-400' : 'text-slate-300'}`}>
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
                    title="CEV Şampiyonlar Ligi İstatistikleri"
                    subtitle="Kadınlar • 2025-2026"
                />

                {/* Summary Cards */}
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

                {/* Stats Grid */}
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
