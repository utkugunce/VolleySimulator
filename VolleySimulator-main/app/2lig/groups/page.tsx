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
                const fixtureData = data.fixture || [];
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

    const groupTeams = sortStandings(allTeams.filter(t => t.groupName === activeGroup));

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
    // Threshold: Current points of the team at Rank 2 (Index 1).
    // If we want strict "Top 2", we check if Max >= Rank_2_Current.
    // (Actually a team could be Rank 10, but if Rank 2 has 20 pts and Rank 10 has 0 but 10 games left (30 max), they can catch up).
    const rank2Team = groupTeams[1];
    const rank2Points = rank2Team ? rank2Team.points : 0;

    // Sort logic inside filter: Just filter by math possibility
    const playoffs = teamsWithMath.filter(t => t.maxPossiblePoints >= rank2Points);

    // Relegation Candidates: Can they fall into Bottom 2?
    // Safe if Current Points > Max Possible Points of the highest team currently in Relegation Zone.
    // Relegation Zone start index: totalTeamsCount - 2 (for bottom 2).
    const relegationZoneStartIndex = Math.max(0, totalTeamsCount - 2);

    // The threshold is the HIGHEST standard a relegation-zone team can set.
    const relegationZoneTeams = teamsWithMath.slice(relegationZoneStartIndex);
    const relegationThreshold = relegationZoneTeams.length > 0
        ? Math.max(...relegationZoneTeams.map(t => t.maxPossiblePoints))
        : -1;

    // A team is a candidate if their CURRENT points are <= threshold.
    // Meaning they haven't "cleared" the danger zone yet.
    // We reverse this list for display usually (bottom up), but let's just filter first.
    // We only care about teams that show up in the "danger" list.
    // Wait, the user wants "matematiksel olarak düşme ihtimali bulunanlar".
    // Those are teams who are NOT safe.
    // Safe means: My Score > RelegationTeam's MAX Potential.
    const relegation = teamsWithMath.filter(t => t.points <= relegationThreshold).reverse(); // Reverse to show bottom teams first/standard convention? Or sort by rank? 
    // Relegation list usually shows bottom-up. Standard simple sort is Top-Down. Reversing makes it Bottom-Up which is clearer for drop zone.
    // But let's verify sort. groupTeams is already sorted Top-Down.
    // So 'relegation' array is filtered from Top-Down. So it will be [Rank 8, Rank 9, Rank 10...].
    // Reversing it gives [Rank 10, Rank 9, Rank 8]. This is good for "Danger Zone" growing upwards.

    return (
        <main className="min-h-screen bg-slate-950 text-slate-100 p-0 sm:p-2 font-sans overflow-hidden">
            <div className="max-w-7xl mx-auto space-y-2 h-full flex flex-col">
                <PageHeader
                    title="2. Lig Gruplar"
                    subtitle="Tüm Grupların Detaylı Puan Durumu"
                />

                {/* Group Selection Tabs - Updated for Quick Navigation */}
                {/* Group Selection Tabs - Updated for Quick Navigation */}
                {/* Group Selection Tabs */}
                <div className="bg-slate-900/50 p-1 rounded-lg border border-slate-800 backdrop-blur-sm flex items-center gap-2 overflow-x-auto">
                    <h3 className="text-[9px] font-bold text-slate-500 uppercase tracking-widest pl-1 whitespace-nowrap hidden sm:block">GRUP SEÇİMİ</h3>
                    <div className="flex flex-nowrap gap-1">
                        {groups.map(groupName => (
                            <button
                                key={groupName}
                                onClick={() => setActiveGroup(groupName)}
                                className={`px-2 py-0.5 rounded text-[9px] font-bold transition-all border whitespace-nowrap ${activeGroup === groupName
                                    ? 'bg-emerald-600 text-white border-emerald-500 shadow shadow-emerald-600/20'
                                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white hover:bg-slate-700 hover:border-slate-500'
                                    }`}
                            >
                                {groupName}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Active Group Content */}
                <div className="flex flex-col lg:flex-row gap-2 flex-1 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300 key={activeGroup}">

                    {/* Main Standings */}
                    <div className="flex-1 bg-slate-900/30 rounded-2xl border border-slate-800/50 overflow-hidden flex flex-col">
                        <div className="p-2 bg-slate-800/50 border-b border-slate-800 flex items-center justify-between gap-2">
                            <h2 className="text-xl font-black italic uppercase tracking-tighter text-emerald-400">
                                {activeGroup}
                            </h2>
                            <div className="px-3 py-1.5 bg-emerald-950/50 rounded-lg border border-emerald-800/50 flex items-center gap-2" title="Sonuçlar her gün saat 08:00'da otomatik güncellenir">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                                <span className="text-[9px] font-bold text-emerald-400 uppercase">Otomatik Güncelleme</span>
                            </div>
                            <a
                                href={`/2lig/tahminoyunu?group=${encodeURIComponent(activeGroup)}`}
                                className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-all shadow shadow-emerald-600/20 flex items-center gap-1"
                            >
                                <span>Simüle Et</span>
                                <span>→</span>
                            </a>
                        </div>
                        <div className="overflow-hidden flex-1">
                            <StandingsTable teams={groupTeams} playoffSpots={2} relegationSpots={2} compact={true} />
                        </div>
                    </div>

                    {/* Sidebar Stats - Playoff & Relegation Candidates */}
                    <div className="w-full lg:w-80 space-y-4">

                        {/* Playoff Candidates */}
                        <div className="bg-slate-900/40 rounded-xl border border-emerald-500/20 p-3 space-y-2">
                            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                                <span>🏆</span> Play-off Adayları
                            </h3>
                            <div className="space-y-1">
                                {playoffs.map((team, idx) => {
                                    const actualRank = groupTeams.findIndex(t => t.name === team.name) + 1;
                                    return (
                                        <div key={team.name} className="flex items-center justify-between p-1.5 bg-emerald-950/20 rounded-lg border border-emerald-900/30">
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[9px] font-black border border-emerald-500/30">
                                                    {actualRank}
                                                </div>
                                                <span className="text-[10px] font-bold text-white max-w-[100px] truncate">{team.name}</span>
                                            </div>
                                            <div className="text-[10px] font-mono font-bold text-emerald-500">{team.points} P</div>
                                        </div>
                                    );
                                })}
                            </div>
                            <p className="text-[9px] text-slate-500 italic border-t border-slate-800/50 pt-1 mt-1">
                                İlk 2 şansı süren {playoffs.length} takım.
                            </p>
                        </div>

                        {/* Relegation Candidates */}
                        <div className="bg-slate-900/40 rounded-xl border border-rose-500/20 p-3 space-y-2">
                            <h3 className="text-xs font-bold text-rose-400 uppercase tracking-widest flex items-center gap-1">
                                <span>⬇️</span> Düşme Hattı
                            </h3>
                            <div className="space-y-1">
                                {relegation.reverse().map((team, idx) => {
                                    const actualRank = groupTeams.findIndex(t => t.name === team.name) + 1;
                                    return (
                                        <div key={team.name} className="flex items-center justify-between p-1.5 bg-rose-950/20 rounded-lg border border-rose-900/30">
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center text-[9px] font-black border border-rose-500/30">
                                                    {actualRank}
                                                </div>
                                                <span className="text-[10px] font-bold text-white max-w-[100px] truncate">{team.name}</span>
                                            </div>
                                            <div className="text-[10px] font-mono font-bold text-rose-500">{team.points} P</div>
                                        </div>
                                    );
                                })}
                            </div>
                            <p className="text-[9px] text-slate-500 italic border-t border-slate-800/50 pt-1 mt-1">
                                Düşme tehlikesi olan {relegation.length} takım.
                            </p>
                        </div>

                    </div>
                </div>
            </div>
        </main>
    );
}
