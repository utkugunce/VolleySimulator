"use client";

import { useEffect, useState } from "react";
import { TeamStats } from "../types";
import Link from "next/link";
import PageHeader from "../components/PageHeader";

export default function StatsPage() {
    const [loading, setLoading] = useState(true);
    const [allTeams, setAllTeams] = useState<TeamStats[]>([]);

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        try {
            setLoading(true);
            const res = await fetch("/api/scrape");
            if (!res.ok) throw new Error("Veri çekilemedi");
            const data = await res.json();
            setAllTeams(data.teams);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="h-[calc(100vh-64px)] flex items-center justify-center text-slate-400">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
            </div>
        )
    }

    const teamsWithStats = allTeams.map(t => ({
        ...t,
        losses: t.played - t.wins,
        winRate: t.played > 0 ? Math.round((t.wins / t.played) * 100) : 0
    }));

    const leastLosses = [...teamsWithStats].sort((a, b) => a.losses - b.losses || b.wins - a.wins).slice(0, 5);
    const mostLosses = [...teamsWithStats].sort((a, b) => b.losses - a.losses || a.wins - b.wins).slice(0, 5);
    const mostSets = [...teamsWithStats].sort((a, b) => b.setsWon - a.setsWon).slice(0, 5);
    const mostPoints = [...teamsWithStats].sort((a, b) => b.points - a.points).slice(0, 5);
    const leastSetsLost = [...teamsWithStats].sort((a, b) => a.setsLost - b.setsLost || b.wins - a.wins).slice(0, 5);
    const bestWinRate = [...teamsWithStats].filter(t => t.played >= 5).sort((a, b) => b.winRate - a.winRate).slice(0, 5);

    // Summary stats
    const totalTeams = allTeams.length;
    const totalMatches = Math.floor(allTeams.reduce((acc, t) => acc + t.played, 0) / 2);
    const avgPoints = Math.round(allTeams.reduce((acc, t) => acc + t.points, 0) / totalTeams);

    const StatTile = ({ title, icon, teams, statKey, gradientFrom, gradientTo, suffix }: {
        title: string; icon: string;
        teams: typeof teamsWithStats;
        statKey: 'losses' | 'wins' | 'setsWon' | 'setsLost' | 'points' | 'winRate';
        gradientFrom: string;
        gradientTo: string;
        suffix?: string;
    }) => (
        <div className="group bg-slate-900/60 backdrop-blur-sm rounded-xl border border-slate-800/50 overflow-hidden hover:border-slate-600/50 transition-all duration-200">
            {/* Header with gradient */}
            <div className={`bg-gradient-to-r ${gradientFrom} ${gradientTo} px-3 py-2 border-b border-white/10`}>
                <h3 className="font-bold text-white text-xs flex items-center gap-2">
                    <span className="text-base">{icon}</span>
                    <span className="uppercase tracking-wide">{title}</span>
                </h3>
            </div>

            {/* Content */}
            <div className="p-2 space-y-0.5">
                {teams.map((t, idx) => (
                    <div
                        key={t.name}
                        className={`flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg transition-all duration-150 ${idx === 0
                            ? 'bg-gradient-to-r from-amber-500/10 to-transparent'
                            : 'hover:bg-slate-800/50'
                            }`}
                    >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                            {/* Rank Badge */}
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${idx === 0 ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white' :
                                idx === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-500 text-white' :
                                    idx === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-800 text-white' :
                                        'bg-slate-800 text-slate-500'
                                }`}>
                                {idx + 1}
                            </div>

                            {/* Team Name */}
                            <span className={`text-xs truncate ${idx === 0 ? 'text-white font-semibold' : 'text-slate-300'}`} title={t.name}>
                                {t.name}
                            </span>
                        </div>

                        {/* Stat Value */}
                        <span className={`text-sm font-black ${idx === 0 ? 'text-amber-400' : 'text-white'}`}>
                            {t[statKey]}<span className="text-[10px] text-slate-500 ml-0.5">{suffix}</span>
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <main className="min-h-screen bg-slate-950 text-slate-100 p-4 font-sans">
            <div className="max-w-7xl mx-auto space-y-8 pt-4">
                {/* Header */}
                <PageHeader
                    title="İstatistikler"
                    subtitle="2. Lig İstatistik Merkezi"
                />

                {/* Summary Cards */}
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

                {/* Stats Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
                    <StatTile
                        title="En Çok Puan"
                        icon="💎"
                        teams={mostPoints}
                        statKey="points"
                        gradientFrom="from-amber-600"
                        gradientTo="to-orange-600"
                        suffix="P"
                    />
                    <StatTile
                        title="En Yüksek Galibiyet %"
                        icon="📈"
                        teams={bestWinRate}
                        statKey="winRate"
                        gradientFrom="from-teal-600"
                        gradientTo="to-emerald-600"
                        suffix="%"
                    />
                    <StatTile
                        title="En Çok Set Alan"
                        icon="🏐"
                        teams={mostSets}
                        statKey="setsWon"
                        gradientFrom="from-purple-600"
                        gradientTo="to-pink-600"
                        suffix="Set"
                    />
                    <StatTile
                        title="En Az Mağlubiyet"
                        icon="🛡️"
                        teams={leastLosses}
                        statKey="losses"
                        gradientFrom="from-emerald-600"
                        gradientTo="to-cyan-600"
                        suffix="M"
                    />
                    <StatTile
                        title="En Az Set Veren"
                        icon="🧱"
                        teams={leastSetsLost}
                        statKey="setsLost"
                        gradientFrom="from-rose-600"
                        gradientTo="to-red-600"
                        suffix="Set"
                    />
                    <StatTile
                        title="En Çok Mağlubiyet"
                        icon="📉"
                        teams={mostLosses}
                        statKey="losses"
                        gradientFrom="from-slate-600"
                        gradientTo="to-slate-700"
                        suffix="M"
                    />
                </div>
            </div>
        </main>
    );
}
