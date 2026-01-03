"use client";

import { useMemo } from "react";
import { TeamStats, Match } from "../../types";
import PageHeader from "../../components/PageHeader";
import StandingsTable from "../../components/Calculator/StandingsTable";
import { sortStandings } from "../../utils/calculatorUtils";
import TeamAvatar from "@/app/components/TeamAvatar";

interface VSLDetailedClientProps {
    initialTeams: TeamStats[];
    initialMatches: Match[];
}

export default function VSLDetailedClient({ initialTeams, initialMatches }: VSLDetailedClientProps) {
    const groupName = "Vodafone Sultanlar Ligi";

    const teams = useMemo(() => sortStandings(initialTeams), [initialTeams]);
    const matches = useMemo(() => initialMatches.map((m: any) => ({
        ...m,
        matchDate: m.date || m.matchDate
    })), [initialMatches]);

    const playedCount = matches.filter(m => m.isPlayed).length;
    const totalCount = matches.length;
    const completionRate = totalCount > 0 ? Math.round((playedCount / totalCount) * 100) : 0;

    const dayNames = ['PAZAR', 'PAZARTESİ', 'SALI', 'ÇARŞAMBA', 'PERŞEMBE', 'CUMA', 'CUMARTESİ'];

    const formatDate = (dateStr?: string) => {
        if (!dateStr || dateStr.trim() === '') return { formatted: 'TARİH BELİRSİZ', sortKey: '9999-99-99' };
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return { formatted: 'TARİH BELİRSİZ', sortKey: '9999-99-99' };
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            const dayName = dayNames[date.getDay()];
            return { formatted: `${day}/${month}/${year} ${dayName}`, sortKey: dateStr };
        } catch {
            return { formatted: 'TARİH BELİRSİZ', sortKey: '9999-99-99' };
        }
    };

    const groupedMatches = useMemo(() => {
        const matchesByDate: Record<string, { formatted: string; matches: Match[] }> = {};
        const upcomingMatches = matches.filter(m => !m.isPlayed);

        upcomingMatches.forEach(match => {
            const { formatted, sortKey } = formatDate(match.matchDate);
            if (!matchesByDate[sortKey]) {
                matchesByDate[sortKey] = { formatted, matches: [] };
            }
            matchesByDate[sortKey].matches.push(match);
        });

        const sortedDates = Object.keys(matchesByDate).sort();
        return sortedDates.reduce((acc, dateKey) => {
            acc[matchesByDate[dateKey].formatted] = matchesByDate[dateKey].matches;
            return acc;
        }, {} as Record<string, Match[]>);
    }, [matches]);

    return (
        <main className="min-h-screen bg-slate-950 text-slate-100 p-0 sm:p-2 font-sans overflow-hidden">
            <div className="max-w-7xl mx-auto space-y-1 h-full flex flex-col">
                <PageHeader
                    title="Vodafone Sultanlar Ligi"
                    subtitle="2025-2026 Sezonu Puan Durumu ve Fikstür"
                />

                <div className="space-y-3 bg-slate-900/40 p-3 rounded-2xl border border-slate-800/60 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 border-b border-slate-800 pb-3">
                        <div className="space-y-0.5">
                            <h2 className="text-2xl font-black italic uppercase tracking-tighter text-red-600 leading-none">
                                {groupName}
                            </h2>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">İlerleme</span>
                                <div className="w-16 sm:w-24 h-1 bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-red-600 transition-all duration-1000" style={{ width: `${completionRate}%` }}></div>
                                </div>
                                <span className="text-[9px] font-bold text-red-400">%{completionRate}</span>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2 items-center">
                            <div className="hidden sm:flex bg-slate-950/50 px-3 py-1.5 rounded-lg border border-slate-800 text-center flex-col justify-center h-full min-h-[32px]">
                                <div className="text-[9px] font-bold text-slate-500 uppercase leading-none mb-0.5">Lider</div>
                                <div className="text-xs font-bold text-white truncate max-w-[100px] leading-none">{teams[0]?.name}</div>
                            </div>
                            <div className="px-3 h-8 bg-emerald-950/50 rounded-lg border border-emerald-800/50 flex items-center gap-2">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                                <span className="text-[10px] font-bold text-emerald-400 uppercase hidden sm:inline">Otomatik Güncelleme</span>
                                <span className="text-[10px] font-bold text-emerald-400 uppercase sm:hidden">CANLI</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 h-full">
                        <div className="lg:col-span-2 space-y-1 flex flex-col h-full">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                                <span>📋</span> Puan Durumu
                            </h3>
                            <div className="bg-slate-950/40 rounded-xl overflow-hidden border border-slate-800/50 flex-1 max-h-[calc(100vh-200px)]">
                                <StandingsTable
                                    teams={teams}
                                    playoffSpots={4}
                                    secondaryPlayoffSpots={4}
                                    relegationSpots={2}
                                    compact={true}
                                />
                            </div>
                        </div>

                        <div className="space-y-4 flex flex-col h-full">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                                <span>📅</span> Gelecek Maçlar
                            </h3>
                            <div className="bg-slate-950/40 rounded-xl overflow-hidden border border-slate-800/50 flex-1 relative flex flex-col">
                                <div className="overflow-y-auto p-2 space-y-2 flex-1 custom-scrollbar">
                                    {Object.keys(groupedMatches).length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-full text-slate-500 text-xs italic">
                                            Maç bulunamadı veya sezon tamamlandı.
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {Object.entries(groupedMatches).map(([date, matches], dateIdx) => (
                                                <div key={date} className={dateIdx > 0 ? 'mt-3' : ''}>
                                                    <div className="sticky top-0 bg-slate-950/90 backdrop-blur-sm py-1.5 px-3 rounded-lg border border-slate-800 flex items-center justify-between z-10 mb-2 shadow-sm">
                                                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wide flex items-center gap-2">
                                                            <span>📅</span> {date}
                                                        </span>
                                                        <span className="text-[9px] text-slate-400 bg-slate-800/50 px-2 py-0.5 rounded">{matches.length} maç</span>
                                                    </div>
                                                    <div className="px-1 space-y-2">
                                                        {matches.map(match => {
                                                            const homeRank = teams.findIndex(t => t.name === match.homeTeam) + 1;
                                                            const awayRank = teams.findIndex(t => t.name === match.awayTeam) + 1;

                                                            // Determine importance (simplified logic closer to FixtureList)
                                                            let borderColor = 'border-slate-800/50';
                                                            let importanceColor = null;

                                                            // Top 4 clash
                                                            if (homeRank <= 4 && awayRank <= 4 && homeRank > 0 && awayRank > 0) {
                                                                borderColor = 'border-emerald-700/30';
                                                                importanceColor = 'from-emerald-600/80 to-emerald-500/60 text-emerald-100';
                                                            }
                                                            // Relegation clash (Assuming 14 teams)
                                                            else if (homeRank >= 13 && awayRank >= 13) {
                                                                borderColor = 'border-rose-700/30';
                                                                importanceColor = 'from-rose-600/80 to-rose-500/60 text-rose-100';
                                                            }

                                                            return (
                                                                <div key={match.id || `${match.homeTeam}-${match.awayTeam}`} className={`bg-slate-900 border ${borderColor} rounded-lg p-2.5 shadow-sm hover:border-slate-700 transition-all group relative overflow-hidden`}>

                                                                    {importanceColor && (
                                                                        <div className={`absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r ${importanceColor.split(' ')[0]}`}></div>
                                                                    )}

                                                                    {/* Time Badge */}
                                                                    <div className="flex justify-center -mt-1 mb-2">
                                                                        <span className="text-[9px] font-mono bg-slate-950/80 px-2 py-0.5 rounded text-slate-400 border border-slate-800/50 shadow-sm">
                                                                            {match.matchTime && match.matchTime !== '00:00' ? match.matchTime : '--:--'}
                                                                        </span>
                                                                    </div>

                                                                    <div className="flex items-center justify-between gap-2">
                                                                        <div className="flex-1 flex items-center justify-end gap-2 overflow-hidden">
                                                                            {homeRank > 0 && homeRank <= 4 && (
                                                                                <span className="text-[9px] font-bold text-emerald-500 bg-emerald-950/30 px-1 py-0.5 rounded hidden sm:inline-block">{homeRank}.</span>
                                                                            )}
                                                                            <div className="text-[11px] font-bold text-slate-200 truncate group-hover:text-white transition-colors text-right leading-tight">{match.homeTeam}</div>
                                                                            <TeamAvatar name={match.homeTeam} size="xs" />
                                                                        </div>

                                                                        <div className="mx-1 shrink-0">
                                                                            {match.isPlayed ? (
                                                                                <div className="px-2.5 py-1 bg-slate-950 rounded text-[11px] font-mono font-bold text-slate-200 border border-slate-800 shadow-inner tracking-wider">
                                                                                    {match.homeScore}-{match.awayScore}
                                                                                </div>
                                                                            ) : (
                                                                                <div className="text-[10px] text-slate-600 font-mono font-bold">vs</div>
                                                                            )}
                                                                        </div>

                                                                        <div className="flex-1 flex items-center justify-start gap-2 overflow-hidden">
                                                                            <TeamAvatar name={match.awayTeam} size="xs" />
                                                                            <div className="text-[11px] font-bold text-slate-200 truncate group-hover:text-white transition-colors text-left leading-tight">{match.awayTeam}</div>
                                                                            {awayRank > 0 && awayRank <= 4 && (
                                                                                <span className="text-[9px] font-bold text-emerald-500 bg-emerald-950/30 px-1 py-0.5 rounded hidden sm:inline-block">{awayRank}.</span>
                                                                            )}
                                                                        </div>
                                                                    </div>

                                                                    <div className="mt-2 pt-1.5 border-t border-slate-800/50 flex justify-between items-center opacity-60 group-hover:opacity-100 transition-opacity">
                                                                        <div className="flex items-center gap-1 text-[9px] text-slate-500">
                                                                            <span>📍</span>
                                                                            <span className="truncate max-w-[150px]">{match.venue || 'Salon Belirtilmemiş'}</span>
                                                                        </div>
                                                                        {!match.isPlayed && (
                                                                            <div className="text-[9px] text-indigo-400 font-medium">Yakında</div>
                                                                        )}
                                                                        {match.isPlayed && (
                                                                            <div className="text-[9px] text-emerald-500 font-medium">Bitti</div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
