"use client";

import { useState, useMemo } from "react";
import { TeamStats, Match } from "../../types";

import StandingsTable from "../../components/Calculator/StandingsTable";
import { sortStandings } from "../../utils/calculatorUtils";
import TeamAvatar from "@/app/components/TeamAvatar";
import LeagueActionBar from "../../components/LeagueTemplate/LeagueActionBar";
import { LEAGUE_CONFIGS } from "../../components/LeagueTemplate/types";

interface OneLigDetailedGroupsClientProps {
    initialTeams: TeamStats[];
    initialMatches: Match[];
}

export default function OneLigDetailedGroupsClient({ initialTeams, initialMatches }: OneLigDetailedGroupsClientProps) {
    const [allTeams] = useState<TeamStats[]>(initialTeams);
    const [allMatches] = useState<Match[]>(initialMatches.map((m: any) => ({
        ...m,
        matchDate: m.date || m.matchDate
    })));

    const groups = useMemo(() => {
        return [...new Set(initialTeams.map(t => t.groupName))].sort();
    }, [initialTeams]);

    const [activeGroup, setActiveGroup] = useState<string>(groups[0] || "");

    // Filter data for active group
    const groupTeams = useMemo(() => sortStandings(allTeams.filter(t => t.groupName === activeGroup)), [allTeams, activeGroup]);
    const groupMatches = useMemo(() => allMatches.filter(m => m.groupName === activeGroup), [allMatches, activeGroup]);

    const playedCount = groupMatches.filter(m => m.isPlayed).length;
    const totalCount = groupMatches.length;
    const completionRate = totalCount > 0 ? Math.round((playedCount / totalCount) * 100) : 0;

    const groupedMatches = useMemo(() => {
        const matchesByDate: Record<string, { formatted: string; matches: Match[] }> = {};
        const upcomingMatches = groupMatches.filter(m => !m.isPlayed);

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
    }, [groupMatches]);

    const bottomTwoTeams = useMemo(() => groupTeams.slice(-2).map(t => t.name), [groupTeams]);

    return (
        <main className="min-h-screen bg-slate-950 text-slate-100 p-0 sm:p-2 font-sans overflow-hidden">
            <div className="max-w-7xl mx-auto space-y-1 h-full flex flex-col">
                <div className="space-y-3 bg-slate-900/40 p-3 rounded-2xl border border-slate-800/60 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
                    {/* Action Bar using LeagueTemplate */}
                    <LeagueActionBar
                        config={LEAGUE_CONFIGS['1lig']}
                        title={`${LEAGUE_CONFIGS['1lig'].shortName} - ${activeGroup}`}
                        subtitle="Kadınlar 1. Ligi Analiz ve Puan Durumu"
                        selectorLabel="Grup"
                        selectorValue={activeGroup}
                        selectorOptions={groups}
                        onSelectorChange={setActiveGroup}
                        progress={completionRate}
                        progressLabel={`%${completionRate}`}
                    >
                        {/* Leader Badge */}
                        <div className="hidden sm:flex bg-slate-950/50 px-3 py-1.5 rounded-lg border border-slate-800 text-center flex-col justify-center h-full min-h-[32px]">
                            <div className="text-[9px] font-bold text-slate-500 uppercase leading-none mb-0.5">Lider</div>
                            <div className="text-xs font-bold text-white truncate max-w-[100px] leading-none">{groupTeams[0]?.name}</div>
                        </div>
                        {/* Live Badge */}
                        <div className="px-3 h-8 bg-emerald-950/50 rounded-lg border border-emerald-800/50 flex items-center gap-2">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                            <span className="text-[10px] font-bold text-emerald-400 uppercase hidden sm:inline">Otomatik Güncelleme</span>
                            <span className="text-[10px] font-bold text-emerald-400 uppercase sm:hidden">CANLI</span>
                        </div>
                    </LeagueActionBar>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 h-full">
                        <div className="lg:col-span-2 space-y-1 flex flex-col h-full">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                                <span>📋</span> Puan Durumu Detayları
                            </h3>
                            <div className="bg-slate-950/40 rounded-xl overflow-hidden border border-slate-800/50 flex-1 max-h-[calc(100vh-200px)]">
                                <StandingsTable
                                    teams={groupTeams}
                                    playoffSpots={4}
                                    relegationSpots={activeGroup.includes('B') ? 2 : 0}
                                    compact={true}
                                />
                            </div>
                        </div>

                        <div className="space-y-4 flex flex-col h-full">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                                <span>📅</span> Gelecek Maçlar
                            </h3>
                            <div className="bg-slate-950/40 rounded-xl overflow-hidden border border-slate-800/50 flex-1 relative">
                                <div className="absolute inset-0 overflow-y-auto p-2 space-y-2">
                                    {Object.keys(groupedMatches).length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-full text-slate-500 text-xs italic">
                                            Maç bulunamadı veya sezon tamamlandı.
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {Object.entries(groupedMatches).map(([date, matches], dateIdx) => (
                                                <div key={date} className={dateIdx > 0 ? 'mt-3' : ''}>
                                                    <div className="sticky top-0 bg-amber-600/20 px-2 py-1 rounded border border-amber-500/30 mb-2 z-10">
                                                        <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wide">
                                                            {date}
                                                        </span>
                                                    </div>
                                                    <div className="px-2 space-y-1">
                                                        {matches.map(match => {
                                                            const isRelegationBattle = activeGroup.includes('B') && (bottomTwoTeams.includes(match.homeTeam) || bottomTwoTeams.includes(match.awayTeam));
                                                            return (
                                                                <div key={match.id || `${match.homeTeam}-${match.awayTeam}`} className={`bg-slate-900/30 border border-slate-800/50 rounded-lg p-2 hover:bg-slate-800/50 transition-colors group ${isRelegationBattle ? 'border-rose-900/50 bg-rose-900/5' : ''}`}>
                                                                    <div className="flex items-center justify-between gap-2">
                                                                        <div className="flex-1 flex items-center justify-end gap-2 overflow-hidden">
                                                                            <div className="text-[11px] font-bold text-slate-200 truncate group-hover:text-amber-500 transition-colors">{match.homeTeam}</div>
                                                                            <TeamAvatar name={match.homeTeam} size="xs" />
                                                                        </div>
                                                                        <div className="px-2 py-0.5 bg-slate-950 rounded text-[9px] font-mono text-slate-500 font-bold whitespace-nowrap border border-slate-900 shadow-inner">
                                                                            {match.matchTime && match.matchTime !== '00:00' ? match.matchTime : '20:00'}
                                                                        </div>
                                                                        <div className="flex-1 flex items-center justify-start gap-2 overflow-hidden">
                                                                            <TeamAvatar name={match.awayTeam} size="xs" />
                                                                            <div className="text-[11px] font-bold text-slate-200 truncate group-hover:text-amber-500 transition-colors">{match.awayTeam}</div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="mt-1.5 pt-1.5 border-t border-slate-800/50 flex justify-between items-center">
                                                                        <div className="flex items-center gap-1 text-[9px] text-slate-500">
                                                                            <span>📍</span>
                                                                            <span className="truncate max-w-[120px]">{match.venue || 'Salon Belirtilmemiş'}</span>
                                                                        </div>
                                                                        {isRelegationBattle && (
                                                                            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-rose-950/50 border border-rose-900/50 rounded text-[8px] text-rose-400 font-bold animate-pulse">
                                                                                <span>⚠️</span>
                                                                                <span>KÜME DÜŞME HATTI</span>
                                                                            </div>
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
        </main >
    );
}

// Helper functions moved outside component
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
