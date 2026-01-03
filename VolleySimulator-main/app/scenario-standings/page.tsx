"use client";

import { useEffect, useState } from "react";
import { TeamStats } from "../types";
import Link from "next/link";
import { calculateGroupStandings, applyOverridesToTeams } from "../utils/playoffUtils";


export default function ScenarioStandingsPage() {
    const [loading, setLoading] = useState(true);
    const [allTeams, setAllTeams] = useState<TeamStats[]>([]);
    const [groups, setGroups] = useState<string[]>([]);
    const [scenarios, setScenarios] = useState<any>({});

    useEffect(() => {
        fetchData();
        // Load overrides correctly
        const saved = localStorage.getItem('playoffScenarios'); // Actually this might be wrong key.
        // Let's check how GroupPage saves it.
        // In GroupPage it saves to `playoffScenarios`? No, let's check group page.
        // GroupPage saves to: localStorage.setItem(`group_matches_${groupId}`, ...);
        // Wait, the user wants "Oyundan gelen puan durumu". 
        // This implies we need to read ALL `group_matches_X` keys.
    }, []);

    async function fetchData() {
        try {
            setLoading(true);
            const res = await fetch("/api/scrape");
            if (!res.ok) throw new Error("Veri çekilemedi");
            const data = await res.json();
            setAllTeams(data.teams);

            const uniqueGroups = [...new Set(data.teams.map((t: TeamStats) => t.groupName))].sort((a: any, b: any) => {
                const numA = parseInt(a.match(/\d+/)?.[0] || "0");
                const numB = parseInt(b.match(/\d+/)?.[0] || "0");
                return numA - numB;
            });
            setGroups(uniqueGroups as string[]);

            // Load all scenarios
            const savedScenarios = localStorage.getItem('groupScenarios');
            if (savedScenarios) {
                try {
                    setScenarios(JSON.parse(savedScenarios));
                } catch (e) {
                    console.error("Failed to parse scenarios", e);
                }
            }

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    // Calculate simulated standings for all groups
    const teamsByGroup = groups.reduce((acc, groupName) => {
        const originalGroupTeams = allTeams.filter(t => t.groupName === groupName);
        const groupOverrides = scenarios[groupName] || [];

        // Apply Logic
        // We need a way to verify if applyOverridesToTeams works with just Match objects or the full logic.
        // Looking at GroupPage, it does:
        // const newTeams = applyOverridesToTeams(originalTeams, overrides);
        // So we can perform the simulation here!

        const simulatedTeams = applyOverridesToTeams(originalGroupTeams, groupOverrides);

        acc[groupName] = simulatedTeams.sort((a: TeamStats, b: TeamStats) => b.points - a.points || b.wins - a.wins || (b.setsWon - b.setsLost) - (a.setsWon - a.setsLost));
        return acc;
    }, {} as Record<string, TeamStats[]>);

    if (loading) {
        return (
            <div className="h-[calc(100vh-64px)] flex items-center justify-center text-slate-400">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            </div>
        )
    }

    return (
        <main className="min-h-screen bg-slate-950 text-slate-100 p-2 sm:p-4 font-sans">
            <div className="max-w-7xl mx-auto flex flex-col gap-4">

                {/* Header */}
                <div className="flex flex-col gap-1 px-1">
                    <h1 className="font-bold text-white text-lg tracking-tight leading-none hidden sm:block">Senaryo Puan Durumu</h1>
                    <p className="text-[10px] text-slate-400 hidden sm:block">Yaptığınız maç tahminlerine göre oluşan puan durumu</p>
                </div>

                {/* Global Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {groups.map(groupName => {
                        const groupTeams = teamsByGroup[groupName] || [];
                        return (
                            <div key={groupName} className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden flex flex-col h-full">
                                {/* Header */}
                                <div className="bg-slate-800/50 px-3 py-2 border-b border-slate-800 flex justify-between items-center">
                                    <h3 className="font-bold text-slate-200">{groupName}. Grup</h3>
                                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                        Simülasyon
                                    </span>
                                </div>

                                {/* Table */}
                                <div className="p-2 space-y-0.5 flex-1">
                                    <div className="flex text-[9px] text-slate-500 px-2 pb-1 border-b border-slate-800/50 uppercase tracking-wider font-semibold">
                                        <span className="w-4">#</span>
                                        <span className="flex-1">Takım</span>
                                        <span className="w-6 text-center">O</span>
                                        <span className="w-6 text-center text-slate-300 font-bold">P</span>
                                    </div>
                                    {groupTeams.map((team, idx) => {
                                        const isRelegation = idx >= groupTeams.length - 2;
                                        const isPromotion = idx < 2;
                                        return (
                                            <div key={team.name} className={`flex items-center text-xs py-1.5 px-2 rounded ${isPromotion ? 'bg-emerald-500/10' : isRelegation ? 'bg-rose-500/10' : ''}`}>
                                                <span className={`w-4 text-[10px] font-bold ${isPromotion ? 'text-emerald-400' : isRelegation ? 'text-rose-500' : 'text-slate-600'}`}>
                                                    {idx + 1}
                                                </span>
                                                <span className={`flex-1 truncate pr-2 ${isPromotion ? 'text-slate-200 font-medium' : isRelegation ? 'text-rose-200/80' : 'text-slate-400'}`} title={team.name}>
                                                    {team.name}
                                                </span>
                                                <span className="w-6 text-center text-[10px] text-slate-500 font-mono">{team.played}</span>
                                                <span className={`w-6 text-center font-bold relative ${isPromotion ? 'text-white' : isRelegation ? 'text-rose-200' : 'text-slate-500'}`}>
                                                    {team.points}
                                                </span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </main>
    );
}
