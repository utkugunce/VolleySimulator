"use client";

import { useEffect, useState } from "react";
import { TeamStats } from "../../types";
import PageHeader from "../../components/PageHeader";

export default function Stats2LigPage() {
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
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
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

    const StatTile = ({ title, icon, teams, statKey, color, suffix }: {
        title: string; icon: string;
        teams: typeof teamsWithStats;
        statKey: 'losses' | 'wins' | 'setsWon' | 'setsLost' | 'points' | 'winRate';
        color: string;
        suffix?: string;
    }) => (
        <div className="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden hover:border-slate-700 transition-all duration-300 hover:scale-[1.02]">
            <div className={`${color} px-4 py-2 border-b border-white/5`}>
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    <span>{icon}</span> {title}
                </h3>
            </div>
            <div className="p-2 space-y-1 bg-gradient-to-b from-slate-900 to-slate-950">
                {teams.map((t, idx) => (
                    <div
                        key={t.name}
                        className="flex items-center justify-between gap-2 p-2 rounded hover:bg-slate-800/50 transition-colors group"
                    >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className={`text-xs font-bold w-4 text-center ${idx === 0 ? 'text-amber-400' : idx === 1 ? 'text-slate-300' : idx === 2 ? 'text-amber-700' : 'text-slate-500'}`}>
                                {idx + 1}
                            </span>
                            <span className="text-xs text-white truncate opacity-90 group-hover:opacity-100" title={t.name}>{t.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-600 bg-slate-900 px-1 rounded">{t.groupName}</span>
                            <span className={`text-xs font-bold w-8 text-right ${idx === 0 ? 'text-amber-400' : 'text-slate-300'}`}>
                                {t[statKey]}{suffix || ''}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <main className="min-h-screen bg-slate-950 text-slate-100 p-4 font-sans">
            <div className="max-w-7xl mx-auto space-y-6 pt-4">
                <PageHeader
                    title="2. Lig İstatistikleri"
                    subtitle="Kadınlar 2. Ligi İstatistik Merkezi"
                />

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 pb-8">
                    <StatTile title="En Çok Puan" icon="💎" teams={mostPoints} statKey="points" color="bg-amber-600" suffix=" P" />
                    <StatTile title="En Yüksek Galibiyet %" icon="📈" teams={bestWinRate} statKey="winRate" color="bg-teal-600" suffix="%" />
                    <StatTile title="En Çok Set Alan" icon="🏐" teams={mostSets} statKey="setsWon" color="bg-purple-600" suffix=" Set" />
                    <StatTile title="En Az Mağlubiyet" icon="🛡️" teams={leastLosses} statKey="losses" color="bg-emerald-600" suffix=" M" />
                    <StatTile title="En Az Set Veren" icon="🧱" teams={leastSetsLost} statKey="setsLost" color="bg-rose-600" suffix=" Set" />
                    <StatTile title="En Çok Mağlubiyet" icon="📉" teams={mostLosses} statKey="losses" color="bg-slate-700" suffix=" M" />
                </div>
            </div>
        </main>
    );
}
