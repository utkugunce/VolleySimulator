"use client";

import { useState, useMemo } from "react";
import { TeamStats, Match } from "../../types";

import StandingsTable from "../../components/Calculator/StandingsTable";
import { sortStandings } from "../../utils/calculatorUtils";
import TeamAvatar from "@/app/components/TeamAvatar";
import LeagueActionBar from "../../components/LeagueTemplate/LeagueActionBar";
import { LEAGUE_CONFIGS } from "../../components/LeagueTemplate/types";

interface CEVCLGuncelDurumClientProps {
    initialTeams: TeamStats[];
    initialMatches: Match[];
}

export default function CEVCLGuncelDurumClient({ initialTeams, initialMatches }: CEVCLGuncelDurumClientProps) {
    const [allTeams] = useState<TeamStats[]>(initialTeams);
    const [allMatches] = useState<Match[]>(initialMatches.map((m: any) => ({
        ...m,
        matchDate: m.date || m.matchDate
    })));

    const pools = ["Grup A", "Grup B", "Grup C", "Grup D", "Grup E"];
    const [activePool, setActivePool] = useState<string>("Grup A");

    const backendGroupName = useMemo(() => activePool.replace("Grup", "Pool"), [activePool]);
    const poolTeams = useMemo(() => sortStandings(allTeams.filter(t => t.groupName === backendGroupName)), [allTeams, backendGroupName]);
    const poolMatches = useMemo(() => allMatches.filter(m => m.groupName === backendGroupName), [allMatches, backendGroupName]);

    const playedCount = poolMatches.filter(m => m.isPlayed).length;
    const totalCount = poolMatches.length;
    const completionRate = totalCount > 0 ? Math.round((playedCount / totalCount) * 100) : 0;

    const turkishTeams = ["VakifBank ISTANBUL", "Savino Del Bene SCANDICCI", "Fenerbahçe Medicana ISTANBUL", "Eczacibasi ISTANBUL", "ANKARA Zeren Spor Kulübü"];

    const groupedMatches = useMemo(() => {
        const matchesByDate: Record<string, { formatted: string; matches: Match[] }> = {};
        const upcomingMatches = poolMatches.filter(m => !m.isPlayed);

        upcomingMatches.forEach(match => {
            if (!match.matchDate) return;
            const parts = match.matchDate.split(/[-.]/);
            let year, month, day;
            if (parts[0].length === 4) { [year, month, day] = parts; }
            else { [day, month, year] = parts; }
            if (!year) year = "2025";

            const sortKey = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            const formatted = `${day}/${month}/${year}`;

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
    }, [poolMatches]);

    return (
        <main className="min-h-screen bg-slate-950 text-slate-100 p-0 sm:p-2 font-sans overflow-hidden">
            <div className="max-w-7xl mx-auto space-y-1 h-full flex flex-col">
                <div className="space-y-3 bg-slate-900/40 p-3 rounded-2xl border border-slate-800/60 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
                    {/* Action Bar using LeagueTemplate */}
                    <LeagueActionBar
                        config={LEAGUE_CONFIGS['cev-cl']}
                        title={`${LEAGUE_CONFIGS['cev-cl'].name} - ${activePool}`}
                        subtitle="CEV Şampiyonlar Ligi • Güncel Durum"
                        selectorLabel="Grup"
                        selectorValue={activePool}
                        selectorOptions={pools}
                        onSelectorChange={setActivePool}
                        progress={completionRate}
                        progressLabel={`%${completionRate}`}
                    >
                        {/* Leader Badge */}
                        <div className="hidden sm:flex bg-slate-950/50 px-3 py-1.5 rounded-lg border border-slate-800 text-center flex-col justify-center h-full min-h-[32px]">
                            <div className="text-[9px] font-bold text-slate-500 uppercase leading-none mb-0.5">Lider</div>
                            <div className="text-xs font-bold text-white truncate max-w-[100px] leading-none">{poolTeams[0]?.name || "-"}</div>
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
                            <div className="bg-slate-950/40 rounded-xl overflow-hidden border border-slate-800/50 flex-1">
                                <StandingsTable teams={poolTeams} playoffSpots={2} relegationSpots={0} compact={true} />
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
                                        Object.entries(groupedMatches).map(([dateKey, group], dateIdx) => (
                                            <div key={dateKey} className={dateIdx > 0 ? 'mt-3' : ''}>
                                                <div className="sticky top-0 bg-blue-600/20 px-2 py-1 rounded border border-blue-500/30 mb-2 z-10">
                                                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wide">
                                                        {group.formatted}
                                                    </span>
                                                </div>
                                                <div className="space-y-1.5">
                                                    {group.matches.map((match, idx) => (
                                                        <div key={idx} className="flex items-center justify-between p-2 bg-slate-900/40 rounded border border-slate-800/50 hover:bg-slate-800/50 transition-colors group">
                                                            <div className="flex-1 flex items-center justify-end gap-2 overflow-hidden">
                                                                <span className="text-xs font-bold text-slate-300 text-right truncate">
                                                                    {match.homeTeam}
                                                                    {turkishTeams.includes(match.homeTeam) && <span className="ml-1">🇹🇷</span>}
                                                                </span>
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
                                                                <span className="text-xs font-bold text-slate-300 text-left truncate">
                                                                    {turkishTeams.includes(match.awayTeam) && <span className="mr-1">🇹🇷</span>}
                                                                    {match.awayTeam}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))
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
