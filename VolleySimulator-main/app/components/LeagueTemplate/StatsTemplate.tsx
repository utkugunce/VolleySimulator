"use client";

import { useMemo } from "react";
import { TeamStats, Match } from "../../types";
import { LeagueConfig } from "./types";
import LeagueActionBar from "./LeagueActionBar";
import StatsCard from "../StatsCard";
import TeamAvatar from "../TeamAvatar";
import { sortStandings } from "../../utils/calculatorUtils";

interface StatsTemplateProps {
    config: LeagueConfig;
    initialTeams: TeamStats[];
    initialMatches: Match[];
}

export default function StatsTemplate({ config, initialTeams, initialMatches }: StatsTemplateProps) {
    const teams = useMemo(() => sortStandings(initialTeams), [initialTeams]);

    // Derived Stats
    const stats = useMemo(() => {
        // Calculate Streaks & Form
        const streaks = teams.map(t => {
            // This is a simplified streak calculation based on wins/losses since we don't have full match history in TeamStats
            // Ideally we'd parse matches to find current streak.
            // For now, let's use the matches array to find last matches for each team
            const teamMatches = initialMatches.filter(m => (m.homeTeam === t.name || m.awayTeam === t.name) && m.isPlayed);

            // Sort by ID (assuming ID correlates with time) or Date if available
            // Note: Match ID logic might need improvement
            return {
                name: t.name,
                matches: teamMatches.length,
                wins: t.wins
            };
        });

        const topWinRate = [...teams].sort((a, b) => (b.wins / (b.played || 1)) - (a.wins / (a.played || 1)))[0];
        const topSetRatio = [...teams].sort((a, b) => ((b.setsWon / (b.setsLost || 1)) - (a.setsWon / (a.setsLost || 1))))[0];
        const mostPlayed = [...teams].sort((a, b) => b.played - a.played)[0];

        return {
            topWinRate,
            topSetRatio,
            mostPlayed
        };
    }, [teams, initialMatches]);

    // Completion Rate for Action Bar
    const totalMatches = initialMatches.length;
    const playedMatches = initialMatches.filter(m => m.isPlayed).length;
    const progress = totalMatches > 0 ? Math.round((playedMatches / totalMatches) * 100) : 0;

    // Stat Tile Component (Local helper or could be separate)
    const StatTile = ({ title, player, team, value, icon, color }: any) => (
        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/50 flex items-center justify-between group hover:border-slate-700 transition-all">
            <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg bg-${color}-500/10 flex items-center justify-center text-xl`}>
                    {icon}
                </div>
                <div>
                    <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-0.5">{title}</div>
                    <div className="font-bold text-slate-200 group-hover:text-white transition-colors">{player}</div>
                    <div className="text-xs text-slate-500">{team}</div>
                </div>
            </div>
            <div className="text-right">
                <div className={`text-xl font-black text-${color}-400`}>{value}</div>
            </div>
        </div>
    );

    return (
        <main className="min-h-screen bg-slate-950 text-slate-100 p-0 sm:p-2 font-sans pb-20 sm:pb-4">
            <div className="max-w-7xl mx-auto space-y-4">

                <LeagueActionBar
                    config={config}
                    title={config.name}
                    subtitle={`${config.subtitle} İstatistikleri`}
                    progress={progress}
                    progressLabel={`%${progress}`}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatsCard
                        title="Galibiyet Lideri"
                        value={stats.topWinRate?.name || '-'}
                        subtitle={`${stats.topWinRate?.wins || 0} Galibiyet`}
                        trend="up"
                        icon="🏆"
                        color="emerald"
                    />
                    <StatsCard
                        title="Set Averajı"
                        value={stats.topSetRatio?.name || '-'}
                        subtitle={(stats.topSetRatio?.setsWon / (stats.topSetRatio?.setsLost || 1)).toFixed(2)}
                        trend="up"
                        icon="📊"
                        color="blue"
                    />
                    <StatsCard
                        title="En Çok Maç"
                        value={stats.mostPlayed?.name || '-'}
                        subtitle={`${stats.mostPlayed?.played || 0} Maç`}
                        trend="neutral"
                        icon="📅"
                        color="amber"
                    />
                    <StatsCard
                        title="MVP Adayı"
                        value="Tijana Boskovic"
                        subtitle="Eczacıbaşı"
                        trend="up"
                        icon="⭐"
                        color="rose"
                    />
                </div>

                {/* Detailed Stats Grid - Placeholder for now as we don't have player stats logic fully migrated */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-1">
                            Öne Çıkan Oyuncular (Demo)
                        </h3>
                        <div className="grid grid-cols-1 gap-3">
                            <StatTile
                                title="En Skorer"
                                player="Tijana Boskovic"
                                team="Eczacıbaşı Dynavit"
                                value="324"
                                icon="🏐"
                                color="rose"
                            />
                            <StatTile
                                title="En Çok Blok"
                                player="Zehra Güneş"
                                team="VakıfBank"
                                value="42"
                                icon="✋"
                                color="emerald"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-1">
                            Takım Performansı
                        </h3>
                        {/* Team Performance Bars could go here */}
                        <div className="bg-slate-900/40 rounded-xl p-4 border border-slate-800/50 h-full flex items-center justify-center text-slate-500 italic">
                            Detaylı takım istatistikleri yakında...
                        </div>
                    </div>
                </div>

            </div>
        </main>
    );
}
