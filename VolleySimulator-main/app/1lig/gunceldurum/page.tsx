"use client";

import { useEffect, useState } from "react";
import { TeamStats, Match } from "../../types";
import PageHeader from "../../components/PageHeader";
import StandingsTable from "../../components/Calculator/StandingsTable";
import { sortStandings } from "../../utils/calculatorUtils";

export default function OneLigDetailedGroupsPage() {
    const [loading, setLoading] = useState(true);
    const [allTeams, setAllTeams] = useState<TeamStats[]>([]);
    const [allMatches, setAllMatches] = useState<Match[]>([]);
    const [groups, setGroups] = useState<string[]>([]);
    const [activeGroup, setActiveGroup] = useState<string>("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const res = await fetch("/api/1lig");
                if (!res.ok) throw new Error("Veri çekilemedi");
                const data = await res.json();

                setAllTeams(data.teams || []);
                setAllMatches(data.fixture || []);

                const uniqueGroups = [...new Set(data.teams.map((t: any) => t.groupName))].sort();
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
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
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

    // Playoff Candidates: Can they catch the 4th place team?
    // 1. Lig: Top 4 qualify for playoffs
    const rank4Team = groupTeams[3];
    const rank4Points = rank4Team ? rank4Team.points : 0;

    // Only filter if we actually have a 4th team to compare against, else show all or specific logic
    const playoffs = groupTeams.length > 3
        ? teamsWithMath.filter(t => t.maxPossiblePoints >= rank4Points)
        : teamsWithMath;

    // Relegation Candidates: Can they fall into Bottom 2?
    const relegationZoneStartIndex = Math.max(0, totalTeamsCount - 2);
    // The threshold is the HIGHEST standard a relegation-zone team can set.
    // If the last place team has 5 games left, they might reach a higher score than the 2nd-to-last.
    // So we need the Max of MaxPossiblePoints of all teams in the relegation zone.
    const relegationZoneTeams = teamsWithMath.slice(relegationZoneStartIndex);
    const relegationThreshold = relegationZoneTeams.length > 0
        ? Math.max(...relegationZoneTeams.map(t => t.maxPossiblePoints))
        : -1;

    // A team is a candidate if their CURRENT points are <= threshold.
    const relegation = teamsWithMath.filter(t => t.points <= relegationThreshold).reverse();

    return (
        <main className="min-h-screen bg-slate-950 text-slate-100 p-0 sm:p-2 font-sans overflow-hidden">
            <div className="max-w-7xl mx-auto space-y-1 h-full flex flex-col">
                <PageHeader
                    title="1. Lig Detaylı Gruplar"
                    subtitle="Kadınlar 1. Ligi Analiz ve Puan Durumu"
                />



                {/* Active Group Content */}
                <div className="space-y-3 bg-slate-900/40 p-3 rounded-2xl border border-slate-800/60 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-300 key={activeGroup}">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-2 border-b border-slate-800 pb-2">
                        <div className="space-y-0.5">
                            <h2 className="text-2xl font-black italic uppercase tracking-tighter text-amber-500 leading-none">
                                {activeGroup}
                            </h2>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">İlerleme</span>
                                <div className="w-24 h-1 bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-amber-500 transition-all duration-1000" style={{ width: `${completionRate}%` }}></div>
                                </div>
                                <span className="text-[9px] font-bold text-amber-400">%{completionRate}</span>
                            </div>
                        </div>
                        <div className="flex gap-2 items-center">
                            {/* Group Selection IN Header */}
                            <div className="flex gap-1 p-1 bg-slate-950/50 rounded-lg border border-slate-800 h-full items-center">
                                {groups.map(groupName => (
                                    <button
                                        key={groupName}
                                        onClick={() => setActiveGroup(groupName)}
                                        className={`px-3 py-1 rounded-md text-[10px] uppercase font-black transition-all ${activeGroup === groupName
                                            ? 'bg-amber-600/20 text-amber-500 border border-amber-500/30'
                                            : 'text-slate-500 hover:text-slate-300'
                                            }`}
                                    >
                                        {groupName.replace(" Grubu", "")}
                                    </button>
                                ))}
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
                                href={`/1lig/tahminoyunu?group=${encodeURIComponent(activeGroup)}`}
                                className="px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-black text-xs uppercase italic rounded-lg transition-all hover:scale-105 shadow-lg shadow-amber-500/20 flex items-center gap-1.5"
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
                                <StandingsTable teams={groupTeams} playoffSpots={4} relegationSpots={2} compact={true} />
                            </div>
                        </div>

                        {/* Highlights & Analysis - Replaced with Upcoming Matches as per request */}
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
                                        const dayNames = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];

                                        // Format date as DD/MM/YYYY + Day
                                        const formatDate = (dateStr?: string) => {
                                            if (!dateStr) return { formatted: 'Tarih Belirsiz', sortKey: '9999-99-99' };
                                            try {
                                                const date = new Date(dateStr);
                                                if (isNaN(date.getTime())) return { formatted: 'Tarih Belirsiz', sortKey: '9999-99-99' };
                                                const day = String(date.getDate()).padStart(2, '0');
                                                const month = String(date.getMonth() + 1).padStart(2, '0');
                                                const year = date.getFullYear();
                                                const dayName = dayNames[date.getDay()];
                                                return { formatted: `${day}/${month}/${year} ${dayName}`, sortKey: dateStr };
                                            } catch {
                                                return { formatted: 'Tarih Belirsiz', sortKey: '9999-99-99' };
                                            }
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
                                                <div className="sticky top-0 bg-amber-600/20 px-2 py-1 rounded border border-amber-500/30 mb-2 z-10">
                                                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wide">
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
