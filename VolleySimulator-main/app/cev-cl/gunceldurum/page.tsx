"use client";

import { useEffect, useState } from "react";
import { TeamStats, Match } from "../../types";
import PageHeader from "../../components/PageHeader";
import StandingsTable from "../../components/Calculator/StandingsTable";
import { sortStandings } from "../../utils/calculatorUtils";

export default function CEVCLGuncelDurum() {
    const [loading, setLoading] = useState(true);
    const [allTeams, setAllTeams] = useState<TeamStats[]>([]);
    const [allMatches, setAllMatches] = useState<Match[]>([]);
    const [pools, setPools] = useState<string[]>([]);
    const [activePool, setActivePool] = useState<string>("Grup A");

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const res = await fetch("/api/cev-cl");
                if (!res.ok) throw new Error("Veri çekilemedi");
                const data = await res.json();

                const teamsData = (data.teams || []).map((t: any) => ({
                    ...t,
                    groupName: t.groupName
                }));
                const fixtureData = (data.fixture || []).map((m: any) => ({
                    ...m,
                    matchDate: m.date
                }));

                setAllTeams(teamsData);
                setAllMatches(fixtureData);

                const uniquePools = ["Grup A", "Grup B", "Grup C", "Grup D", "Grup E"];
                setPools(uniquePools);
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
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    // Filter data for active pool
    // Map "Grup A" -> "Pool A" if backend uses "Pool A" (likely does)
    const backendGroupName = activePool.replace("Grup", "Pool");
    const poolTeams = sortStandings(allTeams.filter(t => t.groupName === backendGroupName));
    const poolMatches = allMatches.filter(m => m.groupName === backendGroupName);
    const playedCount = poolMatches.filter(m => m.isPlayed).length;
    const totalCount = poolMatches.length;
    const completionRate = totalCount > 0 ? Math.round((playedCount / totalCount) * 100) : 0;

    const turkishTeams = ["VakifBank ISTANBUL", "Savino Del Bene SCANDICCI", "Fenerbahçe Medicana ISTANBUL", "Eczacibasi ISTANBUL", "ANKARA Zeren Spor Kulübü"];

    return (
        <main className="min-h-screen bg-slate-950 text-slate-100 p-0 sm:p-2 font-sans overflow-hidden">
            <div className="max-w-7xl mx-auto space-y-1 h-full flex flex-col">
                <PageHeader
                    title="CEV Şampiyonlar Ligi"
                    subtitle="Güncel Durum • 2025-2026"
                />

                {/* Active Pool Content */}
                <div className="space-y-3 bg-slate-900/40 p-3 rounded-2xl border border-slate-800/60 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-2 border-b border-slate-800 pb-2">
                        <div className="space-y-0.5">
                            <div className="space-y-0.5">
                                <h2 className="text-2xl font-black italic uppercase tracking-tighter text-blue-500 leading-none">
                                    {activePool}
                                </h2>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">İlerleme</span>
                                    <div className="w-24 h-1 bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${completionRate}%` }}></div>
                                    </div>
                                    <span className="text-[9px] font-bold text-blue-400">%{completionRate}</span>
                                </div>
                            </div>
                            <div className="flex gap-2 items-center flex-wrap">
                                <div className="flex gap-2 items-center flex-wrap">
                                    {/* Pool Selection moved to PageHeader actions ideally, but for now keeping it here as requested 'near auto button' */}
                                    <div className="flex gap-1 p-1 bg-slate-950/50 rounded-lg border border-slate-800 h-full items-center">
                                        <select
                                            value={activePool}
                                            onChange={(e) => setActivePool(e.target.value)}
                                            className="px-3 py-1 bg-blue-600/20 text-blue-500 text-[10px] uppercase font-black rounded-md border border-blue-500/30 outline-none cursor-pointer transition-all focus:ring-2 focus:ring-blue-500/50"
                                        >
                                            {pools.map(poolName => (
                                                <option key={poolName} value={poolName} className="bg-slate-900 text-white">
                                                    {poolName}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="bg-slate-950/50 px-3 py-1.5 rounded-lg border border-slate-800 text-center flex flex-col justify-center">
                                        <div className="text-[9px] font-bold text-slate-500 uppercase leading-none mb-0.5">Lider</div>
                                        <div className="text-xs font-bold text-white truncate max-w-[100px] leading-none">{poolTeams[0]?.name || "-"}</div>
                                    </div>
                                    <div className="px-3 py-1.5 bg-blue-950/50 rounded-lg border border-blue-800/50 flex items-center gap-2" title="Sonuçlar her gün otomatik güncellenir">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                        <span className="text-[10px] font-bold text-blue-400 uppercase">Otomatik</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 h-full">
                                {/* Detailed Standings */}
                                <div className="lg:col-span-2 space-y-1 flex flex-col h-full">
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                                        <span>📋</span> Puan Durumu Detayları
                                    </h3>
                                    <div className="bg-slate-950/40 rounded-xl overflow-hidden border border-slate-800/50 flex-1">
                                        <StandingsTable teams={poolTeams} playoffSpots={2} relegationSpots={0} compact={true} />
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
                                                const upcomingMatches = poolMatches.filter(m => !m.isPlayed);
                                                if (upcomingMatches.length === 0) {
                                                    return (
                                                        <div className="flex flex-col items-center justify-center h-full text-slate-500 text-xs italic">
                                                            Maç bulunamadı veya sezon tamamlandı.
                                                        </div>
                                                    );
                                                }

                                                const dayNames = ['PAZAR', 'PAZARTESİ', 'SALI', 'ÇARŞAMBA', 'PERŞEMBE', 'CUMA', 'CUMARTESİ'];

                                                const parseDate = (dateStr: string) => {
                                                    if (dateStr.includes('-')) {
                                                        const parts = dateStr.split('-');
                                                        if (parts.length === 3) {
                                                            return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
                                                        }
                                                    }
                                                    if (dateStr.includes('.')) {
                                                        const parts = dateStr.split('.');
                                                        if (parts.length === 3) {
                                                            return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
                                                        }
                                                    }
                                                    return null;
                                                };

                                                const formatDate = (dateStr?: string) => {
                                                    if (!dateStr || dateStr.trim() === '') return { formatted: 'TARİH BELİRSİZ', sortKey: '9999-99-99' };

                                                    const date = parseDate(dateStr);
                                                    if (!date || isNaN(date.getTime())) return { formatted: 'TARİH BELİRSİZ', sortKey: '9999-99-99' };

                                                    const day = String(date.getDate()).padStart(2, '0');
                                                    const month = String(date.getMonth() + 1).padStart(2, '0');
                                                    const year = date.getFullYear();
                                                    const dayName = dayNames[date.getDay()];
                                                    const sortKey = `${year}-${month}-${day}`;

                                                    return { formatted: `${day}/${month}/${year} ${dayName}`, sortKey };
                                                };

                                                const matchesByDate: Record<string, { formatted: string; matches: Match[] }> = {};
                                                upcomingMatches.forEach(match => {
                                                    // Sort dates clearly
                                                    const parts = match.matchDate.split(/[-.]/);
                                                    // Handle both YYYY-MM-DD and DD.MM.YYYY
                                                    let year, month, day;
                                                    if (parts[0].length === 4) { [year, month, day] = parts; }
                                                    else { [day, month, year] = parts; }

                                                    // Fallback to today if invalid
                                                    if (!year) year = "2025";

                                                    const sortKey = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                                                    const formatted = `${day}/${month}/${year}`;

                                                    if (!matchesByDate[sortKey]) {
                                                        matchesByDate[sortKey] = { formatted, matches: [] };
                                                    }
                                                    matchesByDate[sortKey].matches.push(match);
                                                });

                                                const sortedDates = Object.keys(matchesByDate).sort();

                                                return sortedDates.map((dateKey, dateIdx) => (
                                                    <div key={dateKey} className={dateIdx > 0 ? 'mt-3' : ''}>
                                                        <div className="sticky top-0 bg-blue-600/20 px-2 py-1 rounded border border-blue-500/30 mb-2 z-10">
                                                            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wide">
                                                                {matchesByDate[dateKey].formatted}
                                                            </span>
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            {matchesByDate[dateKey].matches.map((match, idx) => (
                                                                <div key={idx} className="flex items-center justify-between p-2 bg-slate-900/40 rounded border border-slate-800/50 hover:bg-slate-800/50 transition-colors">
                                                                    <div className="flex flex-col flex-1 items-end gap-0.5">
                                                                        <span className="text-xs font-bold text-slate-300 text-right flex items-center gap-1">
                                                                            {match.homeTeam}
                                                                            {turkishTeams.includes(match.homeTeam) && <span>🇹🇷</span>}
                                                                        </span>
                                                                    </div>
                                                                    <div className="px-2 flex flex-col items-center">
                                                                        <span className="text-[10px] font-bold text-slate-600 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">VS</span>
                                                                        {match.matchTime && (
                                                                            <span className="text-[9px] text-slate-500 mt-0.5">{match.matchTime}</span>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex flex-col flex-1 gap-0.5">
                                                                        <span className="text-xs font-bold text-slate-300 text-left flex items-center gap-1">
                                                                            {turkishTeams.includes(match.awayTeam) && <span>🇹🇷</span>}
                                                                            {match.awayTeam}
                                                                        </span>
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
