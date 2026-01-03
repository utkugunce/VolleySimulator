"use client";

import { useMemo } from "react";

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

interface CEVChallengeStatsClientProps {
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

export default function CEVChallengeStatsClient({ teams, fixture }: CEVChallengeStatsClientProps) {
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
                    {teamStats.map((t, idx) => (
                        <div
                            key={t.name}
                            className={`flex items-center gap-2 p-1.5 rounded-lg transition-all ${idx === 0 ? 'bg-gradient-to-r from-emerald-500/10 to-transparent border border-emerald-500/20' : 'hover:bg-slate-800/50'
                                }`}
                        >
                            <div className={`w-5 h-5 rounded flex items-center justify-center font-bold text-[10px] shadow-sm ${idx === 0 ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white' :
                                idx === 1 ? 'bg-slate-300 text-slate-800' :
                                    idx === 2 ? 'bg-emerald-700 text-white' :
                                        'bg-slate-800 text-slate-500'
                                }`}>
                                {idx + 1}
                            </div>
                            <TeamAvatar name={t.name} size="xs" />

                            <div className="flex-1 min-w-0">
                                <span className={`text-[11px] font-medium truncate block ${idx === 0 ? 'text-emerald-300' : 'text-white'}`} title={t.name}>
                                    {t.name}
                                </span>
                            </div>

                            <div className="flex items-center gap-1.5 w-16">
                                <BarChart value={Number(t[statKey])} max={maxValue} color={color} />
                                <span className={`text-[11px] font-bold min-w-[24px] text-right ${idx === 0 ? 'text-emerald-400' : 'text-slate-300'}`}>
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
                    <h1 className="font-bold text-white text-lg tracking-tight leading-none hidden sm:block">CEV Challenge Cup İstatistikleri</h1>
                    <p className="text-[10px] text-slate-400 hidden sm:block">Kadınlar • 2025-2026</p>
                </div>

                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                    <div className="bg-gradient-to-br from-emerald-600/20 to-emerald-900/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-emerald-600/30 text-center">
                        <div className="text-2xl sm:text-4xl font-bold text-emerald-400">{totalMatches}</div>
                        <div className="text-[10px] sm:text-xs text-emerald-400/70 uppercase tracking-wider mt-1">Oynanan Maç</div>
                    </div>
                    <div className="bg-gradient-to-br from-teal-600/20 to-teal-900/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-teal-600/30 text-center">
                        <div className="text-2xl sm:text-4xl font-bold text-teal-400">{totalSets}</div>
                        <div className="text-[10px] sm:text-xs text-teal-400/70 uppercase tracking-wider mt-1">Toplam Set</div>
                    </div>
                    <div className="bg-gradient-to-br from-indigo-600/20 to-indigo-900/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-indigo-600/30 text-center">
                        <div className="text-2xl sm:text-4xl font-bold text-indigo-400">{teamsWithStats.length}</div>
                        <div className="text-[10px] sm:text-xs text-indigo-400/70 uppercase tracking-wider mt-1">Aktif Takım</div>
                    </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3 sm:gap-4 pb-8">
                    <StatCard
                        title="En Çok Galibiyet"
                        icon="🏆"
                        teamStats={mostWins}
                        statKey="wins"
                        color="bg-emerald-500"
                        gradient="bg-gradient-to-r from-emerald-600 to-teal-600"
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
                        color="bg-indigo-500"
                        gradient="bg-gradient-to-r from-indigo-600 to-purple-600"
                    />
                    <StatCard
                        title="En Az Mağlubiyet"
                        icon="🛡️"
                        teamStats={leastLosses}
                        statKey="losses"
                        color="bg-orange-500"
                        gradient="bg-gradient-to-r from-orange-600 to-red-600"
                        suffix="M"
                    />
                </div>
            </div>
        </main>
    );
}
