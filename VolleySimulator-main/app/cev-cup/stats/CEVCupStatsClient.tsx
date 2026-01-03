"use client";

import { useMemo } from "react";
import PageHeader from "@/app/components/PageHeader";
import TeamAvatar from "@/app/components/TeamAvatar";

interface Team {
    name: string;
    country: string;
}

interface Match {
    id: number;
    round: string;
    homeTeam: string;
    awayTeam: string;
    homeScore: number | null;
    awayScore: number | null;
    isPlayed: boolean;
}

interface CEVCupStatsClientProps {
    teams: Team[];
    fixture: Match[];
}

interface TeamStats {
    name: string;
    country: string;
    played: number;
    wins: number;
    losses: number;
    setsWon: number;
    setsLost: number;
    winRate: number;
}

export default function CEVCupStatsClient({ teams, fixture }: CEVCupStatsClientProps) {
    const teamsWithStats = useMemo(() => {
        const statsMap = new Map<string, TeamStats>();

        // Initialize all teams
        teams.forEach(team => {
            statsMap.set(team.name, {
                name: team.name,
                country: team.country,
                played: 0,
                wins: 0,
                losses: 0,
                setsWon: 0,
                setsLost: 0,
                winRate: 0
            });
        });

        // Calculate stats from matches
        fixture.filter(m => m.isPlayed).forEach(match => {
            const homeStats = statsMap.get(match.homeTeam);
            const awayStats = statsMap.get(match.awayTeam);

            if (homeStats && match.homeScore !== null && match.awayScore !== null) {
                homeStats.played++;
                homeStats.setsWon += match.homeScore;
                homeStats.setsLost += match.awayScore;
                if (match.homeScore > match.awayScore) {
                    homeStats.wins++;
                } else {
                    homeStats.losses++;
                }
            }

            if (awayStats && match.homeScore !== null && match.awayScore !== null) {
                awayStats.played++;
                awayStats.setsWon += match.awayScore;
                awayStats.setsLost += match.homeScore;
                if (match.awayScore > match.homeScore) {
                    awayStats.wins++;
                } else {
                    awayStats.losses++;
                }
            }
        });

        // Calculate win rates
        statsMap.forEach(stats => {
            stats.winRate = stats.played > 0 ? Math.round((stats.wins / stats.played) * 100) : 0;
        });

        return Array.from(statsMap.values()).filter(t => t.played > 0);
    }, [teams, fixture]);

    const totalMatches = useMemo(() => fixture.filter(m => m.isPlayed).length, [fixture]);
    const totalSets = useMemo(() => teamsWithStats.reduce((sum, t) => sum + t.setsWon, 0), [teamsWithStats]);

    const mostWins = useMemo(() => [...teamsWithStats].sort((a, b) => b.wins - a.wins).slice(0, 5), [teamsWithStats]);
    const mostSets = useMemo(() => [...teamsWithStats].sort((a, b) => b.setsWon - a.setsWon).slice(0, 5), [teamsWithStats]);
    const bestWinRate = useMemo(() => [...teamsWithStats].filter(t => t.played >= 2).sort((a, b) => b.winRate - a.winRate).slice(0, 5), [teamsWithStats]);
    const leastLosses = useMemo(() => [...teamsWithStats].sort((a, b) => a.losses - b.losses || b.wins - a.wins).slice(0, 5), [teamsWithStats]);

    const BarChart = ({ value, max, color }: { value: number; max: number; color: string }) => (
        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden flex-1">
            <div
                className={`h-full ${color} transition-all duration-500`}
                // eslint-disable-next-line
                style={{ width: `${Math.min((value / (max || 1)) * 100, 100)}%` }}
            />
        </div>
    );

    const StatCard = ({ title, icon, teamStats, statKey, color, gradient, suffix = "" }: {
        title: string; icon: string;
        teamStats: TeamStats[];
        statKey: 'losses' | 'wins' | 'setsWon' | 'setsLost' | 'winRate';
        color: string;
        gradient: string;
        suffix?: string;
    }) => {
        const maxValue = Math.max(...teamStats.map(t => Number(t[statKey])), 1);

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
                    {teamStats.map((t, idx) => (
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

    return (
        <main className="min-h-screen bg-slate-950 text-slate-100 p-2 sm:p-4 font-sans">
            <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
                <PageHeader
                    title="CEV Cup İstatistikleri"
                    subtitle="Kadınlar • 2025-2026"
                />

                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                    <div className="bg-gradient-to-br from-amber-600/20 to-amber-900/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-amber-600/30 text-center">
                        <div className="text-2xl sm:text-4xl font-bold text-amber-400">{totalMatches}</div>
                        <div className="text-[10px] sm:text-xs text-amber-400/70 uppercase tracking-wider mt-1">Oynanan Maç</div>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-600/20 to-emerald-900/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-emerald-600/30 text-center">
                        <div className="text-2xl sm:text-4xl font-bold text-emerald-400">{totalSets}</div>
                        <div className="text-[10px] sm:text-xs text-emerald-400/70 uppercase tracking-wider mt-1">Toplam Set</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-600/20 to-purple-900/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-purple-600/30 text-center">
                        <div className="text-2xl sm:text-4xl font-bold text-purple-400">{teamsWithStats.length}</div>
                        <div className="text-[10px] sm:text-xs text-purple-400/70 uppercase tracking-wider mt-1">Aktif Takım</div>
                    </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3 sm:gap-4 pb-8">
                    <StatCard
                        title="En Çok Galibiyet"
                        icon="🏆"
                        teamStats={mostWins}
                        statKey="wins"
                        color="bg-amber-500"
                        gradient="bg-gradient-to-r from-amber-600 to-orange-600"
                        suffix="G"
                    />
                    <StatCard
                        title="En Yüksek Galibiyet %"
                        icon="📈"
                        teamStats={bestWinRate}
                        statKey="winRate"
                        color="bg-teal-500"
                        gradient="bg-gradient-to-r from-teal-600 to-cyan-600"
                        suffix="%"
                    />
                    <StatCard
                        title="En Çok Set Alan"
                        icon="🏐"
                        teamStats={mostSets}
                        statKey="setsWon"
                        color="bg-purple-500"
                        gradient="bg-gradient-to-r from-purple-600 to-pink-600"
                    />
                    <StatCard
                        title="En Az Mağlubiyet"
                        icon="🛡️"
                        teamStats={leastLosses}
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
