"use client";

import { useEffect, useState, useMemo } from "react";
import { TeamStats, Match } from "../../types";
import Link from "next/link";
import {
    PlayoffGroup,
    PlayoffMatch,
    GroupStanding,
    calculateGroupStandings,
    generate1LigSemiGroups,
    generate1LigFinalGroups,
    applyOverridesToGroups
} from "../../utils/playoffUtils";
import { calculateLiveStandings } from "../../utils/calculatorUtils";
import PageHeader from "../../components/PageHeader";

export default function Playoffs1LigPage() {
    const [loading, setLoading] = useState(true);

    // Base Data
    const [baseTeams, setBaseTeams] = useState<TeamStats[]>([]);
    const [originalFixture, setOriginalFixture] = useState<Match[]>([]);
    const [groupOverrides, setGroupOverrides] = useState<Record<string, string>>({});

    // Simulated State
    const [semiGroups, setSemiGroups] = useState<PlayoffGroup[]>([]);
    const [finalGroups, setFinalGroups] = useState<PlayoffGroup[]>([]);

    const [remainingMatches, setRemainingMatches] = useState(0);
    const [playoffOverrides, setPlayoffOverrides] = useState<Record<string, string>>({});
    const [isLoaded, setIsLoaded] = useState(false);

    // 1. Load Overrides
    useEffect(() => {
        const savedPlayoff = localStorage.getItem('1ligPlayoffScenarios');
        if (savedPlayoff) {
            try {
                setPlayoffOverrides(JSON.parse(savedPlayoff));
            } catch (e) { console.error(e); }
        }

        // Load group predictions and flatten them
        const savedGroup = localStorage.getItem('1ligGroupScenarios');
        if (savedGroup) {
            try {
                const parsed = JSON.parse(savedGroup);
                let flatOverrides: Record<string, string> = {};
                Object.values(parsed).forEach((groupObj: any) => {
                    flatOverrides = { ...flatOverrides, ...groupObj };
                });
                setGroupOverrides(flatOverrides);
            } catch (e) { console.error(e); }
        }

        setIsLoaded(true);
    }, []);

    // 2. Fetch Base Data
    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                const res = await fetch("/api/1lig");
                if (!res.ok) throw new Error("Veri çekilemedi");
                const data = await res.json();

                setBaseTeams(data.teams || []);
                setOriginalFixture(data.fixture || []);

                // Check remaining matches
                let remaining = (data.fixture || []).filter((m: Match) => !m.isPlayed).length;
                const savedScenarios = localStorage.getItem('1ligGroupScenarios');
                if (savedScenarios) {
                    try {
                        const allScenarios = JSON.parse(savedScenarios);
                        let localScenarioCount = 0;
                        Object.values(allScenarios).forEach((groupOverrides: any) => {
                            localScenarioCount += Object.keys(groupOverrides).length;
                        });
                        remaining = Math.max(0, remaining - localScenarioCount);
                    } catch (e) { }
                }
                setRemainingMatches(remaining);

            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    // Calculate live standings using predictions
    const baseStandings = useMemo(() => {
        if (!baseTeams.length) return [];
        const calculatedTeams = calculateLiveStandings(baseTeams, originalFixture, groupOverrides);
        return calculateGroupStandings(calculatedTeams);
    }, [baseTeams, originalFixture, groupOverrides]);

    // 3. Reactive Simulation Logic
    useEffect(() => {
        if (!originalFixture.length || !baseStandings.length) return;

        // 1. Semi Finals
        const ss = generate1LigSemiGroups(baseStandings);
        const updatedSs = applyOverridesToGroups(ss, playoffOverrides, 'semi');
        setSemiGroups(updatedSs);

        // 2. Finals
        const fs = generate1LigFinalGroups(updatedSs);
        const updatedFs = applyOverridesToGroups(fs, playoffOverrides, 'final');
        setFinalGroups(updatedFs);

    }, [baseStandings, originalFixture, playoffOverrides]);

    const isGroupsComplete = remainingMatches === 0;

    const renderStageGroups = (stage: string, groups: PlayoffGroup[], title: string, color: string) => {
        return (
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${color}`}></span>
                    {title}
                </h2>
                <div className={`grid grid-cols-1 ${groups.length === 1 ? 'md:grid-cols-1 max-w-2xl' : 'md:grid-cols-2'} gap-4`}>
                    {groups.map(group => {
                        const groupPrefix = `${stage}-${group.groupName}-`;
                        const groupMatches = Object.keys(playoffOverrides).filter(k => k.startsWith(groupPrefix)).length;
                        // 1. Lig Semi/Final groups are 4 teams = 6 matches
                        const totalMatches = 6;
                        const isComplete = groupMatches >= totalMatches;

                        return (
                            <Link
                                key={group.groupName}
                                href={`/1lig/playoffs/${stage}/${group.groupName}`}
                                className="block bg-slate-900 border border-slate-800 rounded-lg overflow-hidden hover:border-slate-600 hover:shadow-lg transition-all group"
                            >
                                <div className={`h-2 ${color}/50`}></div>
                                <div className="p-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="font-bold text-white text-lg group-hover:text-emerald-400 transition-colors">
                                            {group.groupName === 'Final' ? 'Final Grubu' : `${group.groupName}. Grup`}
                                        </h3>
                                        {isComplete ? (
                                            <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">Tamamlandı</span>
                                        ) : (
                                            <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded text-nowrap">{totalMatches - groupMatches} Maç Eksik</span>
                                        )}
                                    </div>
                                    <div className="space-y-0.5">
                                        <div className="flex items-center justify-between text-[10px] text-slate-500 px-2 pb-1 border-b border-slate-800/50">
                                            <span>#</span>
                                            <span className="flex-1 px-2">Takım</span>
                                            <span className="w-12 text-center text-[9px]">Kaynak</span>
                                            <span>P</span>
                                        </div>
                                        {group.teams.map((team, idx) => (
                                            <div key={team.name} className={`flex items-center justify-between text-xs py-1 px-2 rounded ${idx < 2 ? 'bg-emerald-500/5' : ''}`}>
                                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                                    <span className={`w-3 text-center text-[10px] ${idx < 2 ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>{idx + 1}</span>
                                                    <span className={`truncate ${idx < 2 ? 'text-slate-200 font-medium' : 'text-slate-400'}`}>{team.name}</span>
                                                </div>
                                                <span className="w-12 text-center text-[9px] text-slate-600 truncate px-1">
                                                    {team.sourceGroup}
                                                </span>
                                                <span className={`font-bold ml-2 w-4 text-center ${idx < 2 ? 'text-white' : 'text-slate-500'}`}>
                                                    {team.scenarioPoints ?? 0}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-2 pt-2 border-t border-slate-800 text-[10px] text-slate-500 flex items-center gap-1">
                                        <span className={`w-2 h-2 rounded-full ${stage === 'final' ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                                        <span>{stage === 'final' ? 'Sultanlar Ligi\'ne Yükselir' : 'Finale Yükselir'}</span>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <main className="min-h-screen bg-slate-950 text-slate-100 p-8 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
            <div className="max-w-7xl mx-auto space-y-8">
                <PageHeader
                    title="1. Lig Play-Off"
                    subtitle="Sultanlar Ligi yükselme mücadelesi"
                />

                {!isGroupsComplete && (
                    <div className="bg-amber-500/10 border border-amber-500/20 text-amber-200 p-4 rounded-lg flex items-center gap-3">
                        <span className="text-2xl">⚠️</span>
                        <div>
                            <p className="font-bold text-sm">Grup Maçları Henüz Tamamlanmadı</p>
                            <p className="text-xs opacity-70">
                                Play-Off senaryoları mevcut grup sıralamalarına göre hesaplanmaktadır.
                                Kesin sonuçlar için önce grup maçlarını tamamlayın.
                            </p>
                        </div>
                    </div>
                )}

                {/* Promoted Teams Banner (Top 2 of Final Group) */}
                {(() => {
                    const finalGroup = finalGroups[0]; // 1. Lig has only one final group
                    if (!finalGroup) return null;

                    const groupMatches = Object.keys(playoffOverrides).filter(k => k.startsWith(`final-${finalGroup.groupName}-`)).length;
                    const totalMatches = 6;

                    if (groupMatches < totalMatches) return null;

                    const promotedTeams = finalGroup.teams.slice(0, 2).map((t, i) => ({ ...t, rank: i + 1 }));

                    if (promotedTeams.length === 0) return null;

                    return (
                        <div className="bg-gradient-to-r from-emerald-900/50 via-slate-900 to-emerald-900/30 border border-emerald-500/30 rounded-xl p-6 relative overflow-hidden">
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2 relative z-10">
                                <span className="text-3xl">🎉</span>
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-200">
                                    Sultanlar Ligi'ne Yükselen Takımlar
                                </span>
                            </h2>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
                                <div className="flex flex-col gap-3">
                                    {promotedTeams.map((team, idx) => (
                                        <div key={idx} className={`flex items-center gap-3 p-3 rounded-lg border backdrop-blur-sm transition-transform hover:scale-[1.02] ${team.rank === 1 ? 'bg-amber-500/10 border-amber-500/40' : 'bg-slate-700/30 border-slate-600/50'}`}>
                                            <div className={`w-10 h-10 flex items-center justify-center rounded-full text-lg font-bold shadow-lg ${team.rank === 1 ? 'bg-gradient-to-b from-amber-300 to-amber-600 text-white' : 'bg-gradient-to-b from-slate-300 to-slate-500 text-white'}`}>
                                                {team.rank === 1 ? '🥇' : '🥈'}
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-bold text-white text-lg leading-tight">{team.name}</div>
                                                <div className={`text-xs ${team.rank === 1 ? 'text-amber-400' : 'text-slate-400'}`}>
                                                    1. Lig {team.rank === 1 ? 'Şampiyonu' : 'İkincisi'}
                                                </div>
                                            </div>
                                            <div className={`text-2xl ${team.rank === 1 ? 'text-amber-400' : 'text-slate-500'}`}>
                                                {team.rank === 1 ? '👑' : '⭐'}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex flex-col items-center justify-center gap-4 bg-slate-800/30 rounded-xl p-6 border border-slate-700/50">
                                    <div className="text-8xl animate-bounce">🏆</div>
                                    <div className="text-center">
                                        <div className="text-lg font-bold text-white mb-1">Turnuva Tamamlandı</div>
                                        <div className="text-sm text-slate-400">1. Lig Play-Off 2025-26</div>
                                    </div>
                                    <div className="text-xs text-slate-500 mt-2 text-center">
                                        🎊 Tebrikler! Sultanlar Ligi'ne yükselmeye hak kazandınız!
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })()}

                {isGroupsComplete ? (
                    (() => {
                        // Check if semi finals are complete (2 groups * 6 matches = 12 matches)
                        const semiMatchCount = Object.keys(playoffOverrides).filter(k => k.startsWith('semi-')).length;
                        const isSemiComplete = semiMatchCount >= 12;

                        return (
                            <div className="space-y-12">
                                {renderStageGroups('semi', semiGroups, 'Yarı Final Grupları', 'bg-blue-500')}

                                {/* Final - Locked until Semi is complete */}
                                <div className="relative">
                                    {!isSemiComplete && (
                                        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center rounded-xl py-8">
                                            <div className="text-4xl mb-2">🔒</div>
                                            <h3 className="text-lg font-bold text-white mb-1">Final Grubu Kilitli</h3>
                                            <p className="text-slate-400 text-xs text-center max-w-sm">
                                                Final grubunu açmak için Yarı Final gruplarını tamamlayın.
                                            </p>
                                            <p className="text-blue-400 text-sm font-medium mt-2">
                                                {12 - semiMatchCount} / 12 maç eksik
                                            </p>
                                        </div>
                                    )}
                                    <div className={!isSemiComplete ? 'opacity-30 pointer-events-none select-none' : ''}>
                                        {renderStageGroups('final', finalGroups, 'Final Grubu', 'bg-emerald-500')}
                                    </div>
                                </div>
                            </div>
                        );
                    })()
                ) : (
                    <div className="relative">
                        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-20 flex flex-col items-center justify-start pt-16 rounded-xl">
                            <div className="text-6xl mb-4">🔒</div>
                            <h3 className="text-xl font-bold text-white mb-2">Play-Off Kilitli</h3>
                            <p className="text-slate-400 text-sm text-center max-w-md mb-4">
                                Play-Off senaryolarını düzenleyebilmek için önce tüm grup maçlarını tahmin etmeniz gerekmektedir.
                            </p>
                            <p className="text-amber-400 font-medium">
                                {remainingMatches} maç eksik
                            </p>
                            <Link href="/1lig/tahminoyunu" className="mt-4 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg transition-colors">
                                Tahminleri Tamamla →
                            </Link>
                        </div>
                        <div className="opacity-30 pointer-events-none select-none space-y-12">
                            {renderStageGroups('semi', semiGroups, 'Yarı Final Grupları', 'bg-blue-500')}
                            {renderStageGroups('final', finalGroups, 'Final Grubu', 'bg-emerald-500')}
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
