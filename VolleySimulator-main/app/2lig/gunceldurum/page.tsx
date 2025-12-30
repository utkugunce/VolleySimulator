"use client";

import { useEffect, useState } from "react";
import { TeamStats, Match } from "../../types";
import PageHeader from "../../components/PageHeader";
import StandingsTable from "../../components/Calculator/StandingsTable";
import { sortStandings } from "../../utils/calculatorUtils";

export default function TwoLigDetailedGroupsPage() {
    const [loading, setLoading] = useState(true);
    const [allTeams, setAllTeams] = useState<TeamStats[]>([]);
    const [allMatches, setAllMatches] = useState<Match[]>([]);
    const [groups, setGroups] = useState<string[]>([]);
    const [activeGroup, setActiveGroup] = useState<string>("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const res = await fetch("/api/scrape");
                if (!res.ok) throw new Error("Veri çekilemedi");
                const data = await res.json();

                const teamsData = data.teams || [];
                const fixtureData = (data.fixture || []).map((m: any) => ({
                    ...m,
                    matchDate: m.date // Map 'date' from JSON to 'matchDate' expected by Match type
                }));
                setAllTeams(teamsData);
                setAllMatches(fixtureData);

                const uniqueGroups = [...new Set(teamsData.map((t: any) => t.groupName))].sort((a: any, b: any) => {
                    const numA = parseInt(a.match(/\d+/)?.[0] || "0");
                    const numB = parseInt(b.match(/\d+/)?.[0] || "0");
                    return numA - numB;
                });
                setGroups(uniqueGroups as string[]);
                if (uniqueGroups.length > 0) {
                    setActiveGroup(uniqueGroups[0] as string);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="h-[calc(100vh-64px)] flex items-center justify-center text-slate-400">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    // Filter data for active group
    const groupTeams = sortStandings(allTeams.filter(t => t.groupName === activeGroup));
    const groupMatches = allMatches.filter(m => m.groupName === activeGroup);
    const playedCount = groupMatches.filter(m => m.isPlayed).length;
    const totalCount = groupMatches.length;
    const completionRate = totalCount > 0 ? Math.round((playedCount / totalCount) * 100) : 0;

    // Mathematical Calculations for Candidates
    const totalTeamsCount = groupTeams.length;
    const totalMatchesPerTeam = (totalTeamsCount - 1) * 2;

    const teamsWithMath = groupTeams.map(t => {
        const remainingMatches = Math.max(0, totalMatchesPerTeam - t.played);
        return {
            ...t,
            maxPossiblePoints: t.points + (remainingMatches * 3)
        };
    });

    // Playoff Candidates: Can they catch the 2nd place team?
    const rank2Team = groupTeams[1];
    const rank2Points = rank2Team ? rank2Team.points : 0;

    const playoffs = groupTeams.length > 1
        ? teamsWithMath.filter(t => t.maxPossiblePoints >= rank2Points)
        : teamsWithMath;

    // Relegation Candidates: Can they fall into Bottom 2?
    const relegationZoneStartIndex = Math.max(0, totalTeamsCount - 2);
    const relegationZoneTeams = teamsWithMath.slice(relegationZoneStartIndex);
    const relegationThreshold = relegationZoneTeams.length > 0
        ? Math.max(...relegationZoneTeams.map(t => t.maxPossiblePoints))
        : -1;

    const relegation = teamsWithMath.filter(t => t.points <= relegationThreshold).reverse();

    return (
        <main className="min-h-screen bg-slate-950 text-slate-100 p-0 sm:p-2 font-sans overflow-hidden">
            <div className="max-w-7xl mx-auto space-y-1 h-full flex flex-col">
                <PageHeader
                    title="2. Lig Detaylı Gruplar"
                    subtitle="Kadınlar 2. Ligi Analiz ve Puan Durumu"
                />

                {/* Active Group Content */}
                <div className="space-y-3 bg-slate-900/40 p-3 rounded-2xl border border-slate-800/60 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-300 key={activeGroup}">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-2 border-b border-slate-800 pb-2">
                        <div className="space-y-0.5">
                            <h2 className="text-2xl font-black italic uppercase tracking-tighter text-emerald-500 leading-none">
                                {activeGroup}
                            </h2>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">İlerleme</span>
                                <div className="w-24 h-1 bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${completionRate}%` }}></div>
                                </div>
                                <span className="text-[9px] font-bold text-emerald-400">%{completionRate}</span>
                            </div>
                        </div>
                        <div className="flex gap-2 items-center flex-wrap">
                            {/* Group Selection - Dropdown for 16 groups */}
                            <div className="flex gap-1 p-1 bg-slate-950/50 rounded-lg border border-slate-800 h-full items-center">
                                <select
                                    value={activeGroup}
                                    onChange={(e) => setActiveGroup(e.target.value)}
                                    className="px-3 py-1 bg-emerald-600/20 text-emerald-500 text-[10px] uppercase font-black rounded-md border border-emerald-500/30 outline-none cursor-pointer transition-all focus:ring-2 focus:ring-emerald-500/50"
                                >
                                    {groups.map(groupName => (
                                        <option key={groupName} value={groupName} className="bg-slate-900 text-white">
                                            {groupName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="bg-slate-950/50 px-3 py-1.5 rounded-lg border border-slate-800 text-center flex flex-col justify-center">
                                <div className="text-[9px] font-bold text-slate-500 uppercase leading-none mb-0.5">Lider</div>
                                <div className="text-xs font-bold text-white truncate max-w-[100px] leading-none">{groupTeams[0]?.name}</div>
                            </div>
                            <div className="px-3 py-1.5 bg-emerald-950/50 rounded-lg border border-emerald-800/50 flex items-center gap-2" title="Sonuçlar her gün saat 08:00'da otomatik güncellenir">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                                <span className="text-[10px] font-bold text-emerald-400 uppercase">Otomatik Güncelleme</span>
                            </div>
                            <a
                                href={`/2lig/tahminoyunu?group=${encodeURIComponent(activeGroup)}`}
                                className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs uppercase italic rounded-lg transition-all hover:scale-105 shadow-lg shadow-emerald-500/20 flex items-center gap-1.5"
                            >
                                <span>Simüle Et</span>
                                <span>⚡</span>
                            </a>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 h-full">
                        {/* Detailed Standings */}
                        <div className="lg:col-span-2 space-y-1 flex flex-col h-full">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                                <span>📋</span> Puan Durumu Detayları
                            </h3>
                            <div className="bg-slate-950/40 rounded-xl overflow-hidden border border-slate-800/50 flex-1">
                                <StandingsTable teams={groupTeams} playoffSpots={2} relegationSpots={2} compact={true} />
                            </div>
                        </div>

                        {/* Upcoming Matches */}
                        <div className="space-y-4 flex flex-col h-full">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                                <span>📅</span> Gelecek Maçlar
                            </h3>
                            <div className="bg-slate-950/40 rounded-xl overflow-hidden border border-slate-800/50 flex-1 relative">
                                <div className="absolute inset-0 overflow-y-auto p-2 space-y-2">
                                    {(() => {
                                        const upcomingMatches = groupMatches.filter(m => !m.isPlayed);
                                        if (upcomingMatches.length === 0) {
                                            return (
                                                <div className="flex flex-col items-center justify-center h-full text-slate-500 text-xs italic">
                                                    Maç bulunamadı veya sezon tamamlandı.
                                                </div>
                                            );
                                        }

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
                                            // Check for DD.MM.YYYY format first
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

                                            // sortKey needs to be ISO format for string sorting
                                            const sortKey = `${year}-${month}-${day}`;

                                            return { formatted: `${day}/${month}/${year} ${dayName}`, sortKey };
                                        };

                                        // Group matches by date
                                        const matchesByDate: Record<string, { formatted: string; matches: Match[] }> = {};
                                        upcomingMatches.forEach(match => {
                                            const { formatted, sortKey } = formatDate(match.matchDate);
                                            if (!matchesByDate[sortKey]) {
                                                matchesByDate[sortKey] = { formatted, matches: [] };
                                            }
                                            matchesByDate[sortKey].matches.push(match);
                                        });

                                        // Sort by date
                                        const sortedDates = Object.keys(matchesByDate).sort();

                                        return sortedDates.map((dateKey, dateIdx) => (
                                            <div key={dateKey} className={dateIdx > 0 ? 'mt-3' : ''}>
                                                <div className="sticky top-0 bg-emerald-600/20 px-2 py-1 rounded border border-emerald-500/30 mb-2 z-10">
                                                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wide">
                                                        {matchesByDate[dateKey].formatted}
                                                    </span>
                                                </div>
                                                <div className="space-y-1.5">
                                                    {matchesByDate[dateKey].matches.map((match, idx) => (
                                                        <div key={idx} className="flex items-center justify-between p-2 bg-slate-900/40 rounded border border-slate-800/50 hover:bg-slate-800/50 transition-colors">
                                                            <div className="flex flex-col flex-1 items-end gap-0.5">
                                                                <span className="text-xs font-bold text-slate-300 text-right">{match.homeTeam}</span>
                                                            </div>
                                                            <div className="px-2 flex flex-col items-center">
                                                                <span className="text-[10px] font-bold text-slate-600 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">VS</span>
                                                                {match.matchTime && (
                                                                    <span className="text-[9px] text-slate-500 mt-0.5">{match.matchTime}</span>
                                                                )}
                                                            </div>
                                                            <div className="flex flex-col flex-1 gap-0.5">
                                                                <span className="text-xs font-bold text-slate-300 text-left">{match.awayTeam}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ));
                                    })()}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
