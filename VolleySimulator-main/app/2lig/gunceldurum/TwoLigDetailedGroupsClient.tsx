"use client";

import { useState, useMemo } from "react";
import { TeamStats, Match } from "../../types";

import StandingsTable from "../../components/Calculator/StandingsTable";
import { sortStandings } from "../../utils/calculatorUtils";
import TeamAvatar from "@/app/components/TeamAvatar";
import LeagueActionBar from "../../components/LeagueTemplate/LeagueActionBar";
import { LEAGUE_CONFIGS } from "../../components/LeagueTemplate/types";

interface TwoLigDetailedGroupsClientProps {
    initialTeams: TeamStats[];
    initialMatches: Match[];
}

export default function TwoLigDetailedGroupsClient({ initialTeams, initialMatches }: TwoLigDetailedGroupsClientProps) {
    const [allTeams] = useState<TeamStats[]>(initialTeams);
    const [allMatches] = useState<Match[]>(initialMatches.map((m: any) => ({
        ...m,
        matchDate: m.date || m.matchDate
    })));

    const groups = useMemo(() => {
        return [...new Set(initialTeams.map(t => t.groupName))].sort((a: any, b: any) => {
            const numA = parseInt(a.match(/\d+/)?.[0] || "0");
            const numB = parseInt(b.match(/\d+/)?.[0] || "0");
            return numA - numB;
        });
    }, [initialTeams]);

    const [activeGroup, setActiveGroup] = useState<string>(groups[0] || "");

    // Filter data for active group
    const groupTeams = useMemo(() => sortStandings(allTeams.filter(t => t.groupName === activeGroup)), [allTeams, activeGroup]);
    const groupMatches = useMemo(() => allMatches.filter(m => m.groupName === activeGroup), [allMatches, activeGroup]);

    const playedCount = groupMatches.filter(m => m.isPlayed).length;
    const totalCount = groupMatches.length;
    const completionRate = totalCount > 0 ? Math.round((playedCount / totalCount) * 100) : 0;

    // Turkish day names
    const dayNames = ['PAZAR', 'PAZARTESİ', 'SALI', 'ÇARŞAMBA', 'PERŞEMBE', 'CUMA', 'CUMARTESİ'];

    // Helper: Parse DD.MM.YYYY
    const parseDDMMYYYY = (dateStr: string) => {
        const parts = dateStr.split('.');
        if (parts.length === 3) {
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1; // JS months 0-11
            const year = parseInt(parts[2], 10);
            return new Date(year, month, day);
        }
        return null;
    };

    // Format date as DD/MM/YYYY + Day
    const formatDate = (dateStr?: string) => {
        if (!dateStr || dateStr.trim() === '') return { formatted: 'TARİH BELİRSİZ', sortKey: '9999-99-99' };
        let date: Date | null = null;
        if (dateStr.includes('.')) {
            date = parseDDMMYYYY(dateStr);
        } else {
            date = new Date(dateStr);
        }
        if (!date || isNaN(date.getTime())) return { formatted: 'TARİH BELİRSİZ', sortKey: '9999-99-99' };
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const dayName = dayNames[date.getDay()];
        return { formatted: `${day}/${month}/${year} ${dayName}`, sortKey: `${year}-${month}-${day}` };
    };

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
            acc[dateKey] = matchesByDate[dateKey];
            return acc;
        }, {} as Record<string, { formatted: string, matches: Match[] }>);
    }, [groupMatches]);

    return (
        <main className="min-h-screen bg-slate-950 text-slate-100 p-0 sm:p-2 font-sans overflow-hidden">
            <div className="max-w-7xl mx-auto space-y-1 h-full flex flex-col">
                <div className="space-y-3 bg-slate-900/40 p-3 rounded-2xl border border-slate-800/60 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
                    {/* Action Bar using LeagueTemplate */}
                    <LeagueActionBar
                        config={LEAGUE_CONFIGS['2lig']}
                        title={`${LEAGUE_CONFIGS['2lig'].shortName} - ${activeGroup}`}
                        subtitle="Kadınlar 2. Ligi Analiz ve Puan Durumu"
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
                                <StandingsTable teams={groupTeams} playoffSpots={2} relegationSpots={2} compact={true} />
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
                                            {Object.entries(groupedMatches).map(([dateKey, group], dateIdx) => (
                                                <div key={dateKey} className={dateIdx > 0 ? 'mt-3' : ''}>
                                                    <div className="sticky top-0 bg-emerald-600/20 px-2 py-1 rounded border border-emerald-500/30 mb-2 z-10">
                                                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wide">
                                                            {group.formatted}
                                                        </span>
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        {group.matches.map((match, idx) => (
                                                            <div key={idx} className="flex items-center justify-between p-2 bg-slate-900/40 rounded border border-slate-800/50 hover:bg-slate-800/50 transition-colors group">
                                                                <div className="flex-1 flex items-center justify-end gap-2 overflow-hidden">
                                                                    <span className="text-xs font-bold text-slate-300 text-right truncate">{match.homeTeam}</span>
                                                                    <TeamAvatar name={match.homeTeam} size="xs" />
                                                                </div>
                                                                <div className="px-3 flex flex-col items-center">
                                                                    <span className="text-[10px] font-bold text-slate-600 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">VS</span>
                                                                    {match.matchTime && (
                                                                        <span className="text-[9px] text-slate-500 mt-0.5">{match.matchTime}</span>
                                                                    )}
                                                                </div>
                                                                <div className="flex-1 flex items-center justify-start gap-2 overflow-hidden">
                                                                    <TeamAvatar name={match.awayTeam} size="xs" />
                                                                    <span className="text-xs font-bold text-slate-300 text-left truncate">{match.awayTeam}</span>
                                                                </div>
                                                            </div>
                                                        ))}
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
