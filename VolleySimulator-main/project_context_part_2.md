# Project Application Context - Part 2

## File: app\1lig\playoffs\OneLigPlayoffsClient.tsx
```
"use client";

import { useEffect, useState, useMemo } from "react";
import { TeamStats, Match } from "../../types";
import Link from "next/link";
import {
    PlayoffGroup,
    calculateGroupStandings,
    generate1LigSemiGroups,
    generate1LigFinalGroups,
    applyOverridesToGroups
} from "../../utils/playoffUtils";
import { calculateLiveStandings } from "../../utils/calculatorUtils";

import TeamAvatar from "../../components/TeamAvatar";

interface OneLigPlayoffsClientProps {
    initialTeams: TeamStats[];
    initialMatches: Match[];
}

export default function OneLigPlayoffsClient({ initialTeams, initialMatches }: OneLigPlayoffsClientProps) {
    const [groupOverrides, setGroupOverrides] = useState<Record<string, string>>({});
    const [playoffOverrides, setPlayoffOverrides] = useState<Record<string, string>>({});
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const savedPlayoff = localStorage.getItem('1ligPlayoffScenarios');
        if (savedPlayoff) {
            try {
                setPlayoffOverrides(JSON.parse(savedPlayoff));
            } catch (e) { console.error(e); }
        }

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

    const baseStandings = useMemo(() => {
        const calculatedTeams = calculateLiveStandings(initialTeams, initialMatches, groupOverrides);
        return calculateGroupStandings(calculatedTeams);
    }, [initialTeams, initialMatches, groupOverrides]);

    const semiGroups = useMemo(() => {
        const ss = generate1LigSemiGroups(baseStandings);
        return applyOverridesToGroups(ss, playoffOverrides, 'semi');
    }, [baseStandings, playoffOverrides]);

    const finalGroups = useMemo(() => {
        const fs = generate1LigFinalGroups(semiGroups);
        return applyOverridesToGroups(fs, playoffOverrides, 'final');
    }, [semiGroups, playoffOverrides]);

    const remainingMatchesCount = useMemo(() => {
        let remaining = initialMatches.filter((m: Match) => !m.isPlayed).length;
        remaining = Math.max(0, remaining - Object.keys(groupOverrides).length);
        return remaining;
    }, [initialMatches, groupOverrides]);

    const isGroupsComplete = remainingMatchesCount === 0;

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
                                                    <TeamAvatar name={team.name} size="xs" />
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

    return (
        <main className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex flex-col gap-1">
                    <h1 className="font-bold text-white text-lg tracking-tight leading-none hidden sm:block">1. Lig Play-Off</h1>
                    <p className="text-[10px] text-slate-400 hidden sm:block">Sultanlar Ligi yükselme mücadelesi</p>
                </div>

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

                {(() => {
                    const finalGroup = finalGroups[0];
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
                                            <TeamAvatar name={team.name} size="md" />
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
                        const semiMatchCount = Object.keys(playoffOverrides).filter(k => k.startsWith('semi-')).length;
                        const isSemiComplete = semiMatchCount >= 12;

                        return (
                            <div className="space-y-12">
                                {renderStageGroups('semi', semiGroups, 'Yarı Final Grupları', 'bg-blue-500')}

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
                                {remainingMatchesCount} maç eksik
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

```

## File: app\1lig\playoffs\page.tsx
```
import { Metadata } from "next";
import { getLeagueData } from "../../utils/serverData";
import OneLigPlayoffsClient from "./OneLigPlayoffsClient";

export const metadata: Metadata = {
    title: "1. Lig Playoff Simülasyonu",
    description: "1. Lig playoff simülasyonu. Grup birincileri ve ikincileri arasındaki eşleşmeleri simüle edin.",
    openGraph: {
        title: "1. Lig Playoff Simülasyonu | VolleySimulator",
        description: "1. Lig playoff eşleşmelerini simüle edin.",
    },
};

export default async function Playoffs1LigPage() {
    const { teams, fixture } = await getLeagueData("1lig");

    return (
        <OneLigPlayoffsClient initialTeams={teams} initialMatches={fixture} />
    );
}

```

## File: app\1lig\playoffs\[stage]\[groupId]\page.tsx
```
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Match, TeamStats } from "../../../../types";
import Link from "next/link";
import {
    GroupStanding,
    PlayoffGroup,
    PlayoffMatch,
    SCORES,
    calculateGroupStandings,
    generate1LigSemiGroups,
    generate1LigFinalGroups,
    generateGroupFixture,
    applyOverridesToGroups
} from "../../../../utils/playoffUtils";


export default function OneLigPlayoffGroupDetailPage() {
    const params = useParams();
    const router = useRouter();
    const stage = params.stage as 'semi' | 'final';
    const groupId = params.groupId as string;

    const [loading, setLoading] = useState(true);
    const [currentGroup, setCurrentGroup] = useState<PlayoffGroup | null>(null);
    const [groupFixture, setGroupFixture] = useState<PlayoffMatch[]>([]);
    const [overrides, setOverrides] = useState<Record<string, string>>({});
    const [originalFixture, setOriginalFixture] = useState<Match[]>([]);
    const [baseStandings, setBaseStandings] = useState<GroupStanding[]>([]);

    const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'idle'>('idle');
    const [isLoaded, setIsLoaded] = useState(false);
    const [predicting, setPredicting] = useState(false);
    const [initialRanks, setInitialRanks] = useState<Map<string, number>>(new Map());

    // 1. Load Overrides
    useEffect(() => {
        const saved = localStorage.getItem('1ligPlayoffScenarios');
        if (saved) {
            try {
                setOverrides(JSON.parse(saved));
            } catch (e) { console.error(e); }
        }
        setIsLoaded(true);
    }, []);

    // 2. Fetch Base Data
    useEffect(() => {
        async function fetchBaseData() {
            try {
                setLoading(true);
                const res = await fetch("/api/1lig");
                if (!res.ok) throw new Error("Veri çekilemedi");
                const data = await res.json();
                setOriginalFixture(data.fixture);
                // Important: Need to ensure calculateGroupStandings returns 'teams' array
                const standings = calculateGroupStandings(data.teams);
                setBaseStandings(standings);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        }
        fetchBaseData();
    }, []);

    // 3. Auto-save
    useEffect(() => {
        if (!isLoaded) return;
        setSaveStatus('saving');
        const timer = setTimeout(() => {
            localStorage.setItem('1ligPlayoffScenarios', JSON.stringify(overrides));
            setSaveStatus('saved');
        }, 500);
        return () => clearTimeout(timer);
    }, [overrides, isLoaded]);

    // 4. Core Logic
    useEffect(() => {
        if (!originalFixture.length || !baseStandings.length) return;

        // 1. Lig Logic: Semi -> Final
        const semis = generate1LigSemiGroups(baseStandings);

        let targetGroups: PlayoffGroup[] = [];

        if (stage === 'semi') {
            targetGroups = semis;
        } else if (stage === 'final') {
            const updatedSemis = applyOverridesToGroups(semis, overrides, 'semi');
            targetGroups = generate1LigFinalGroups(updatedSemis);
        }

        const foundGroup = targetGroups.find(g => g.groupName === groupId);

        if (foundGroup) {
            const rankMap = new Map<string, number>();
            foundGroup.teams.forEach((t, i) => rankMap.set(t.name, i + 1));
            setInitialRanks(rankMap);

            const updatedGroupArray = applyOverridesToGroups([foundGroup], overrides, stage);
            setCurrentGroup(updatedGroupArray[0]);

            const fixture = generateGroupFixture([foundGroup], stage);
            setGroupFixture(fixture);
        }

    }, [baseStandings, originalFixture, overrides, stage, groupId]);

    function handleScoreSelect(matchId: string, score: string | null) {
        setOverrides(prev => {
            const next = { ...prev };
            if (score === null) delete next[matchId];
            else next[matchId] = score;
            return next;
        });
    }

    function predictGroupMatches() {
        if (!currentGroup) return;
        setPredicting(true);
        try {
            const predictions: Record<string, string> = {};
            const scores = ['3-0', '3-1', '3-2', '2-3', '1-3', '0-3'];
            groupFixture.forEach(match => {
                const randomScore = scores[Math.floor(Math.random() * scores.length)];
                predictions[match.id] = randomScore;
            });
            setOverrides(prev => ({ ...prev, ...predictions }));
        } finally { setPredicting(false); }
    }

    const stageInfo = stage === 'semi'
        ? { title: 'Yarı Final', color: 'from-blue-600 to-blue-500', text: 'text-blue-500', nextStage: 'Final' }
        : { title: 'Final', color: 'from-emerald-600 to-emerald-500', text: 'text-emerald-500', nextStage: 'Sultanlar Ligi' };

    const navGroups = stage === 'semi' ? ['I', 'II'] : ['Final'];

    if (loading) return <div className="h-screen flex items-center justify-center bg-slate-950"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div></div>;
    if (!currentGroup) return <div className="h-screen flex items-center justify-center bg-slate-950 text-white">Grup Bulunamadı</div>;

    return (
        <main className="h-screen overflow-hidden bg-slate-950 text-slate-100 flex flex-col p-2 sm:p-4 font-sans">
            <div className="w-full max-w-[1400px] mx-auto flex flex-col h-full gap-3">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-center justify-between bg-slate-900 border border-slate-800 rounded-lg p-2 gap-2 flex-shrink-0">
                    <div className="flex items-center gap-3 w-full sm:w-auto overflow-hidden">
                        <Link href="/1lig/playoffs" className="flex-shrink-0 p-1.5 bg-slate-800 hover:bg-slate-700 rounded transition-colors text-slate-400 hover:text-white text-xs flex items-center gap-1">
                            <span>←</span> <span className="hidden sm:inline">Play-off Ana Sayfa</span>
                        </Link>
                        <div className="flex-1 min-w-0">
                            <h1 className="text-lg font-bold text-white tracking-tight truncate flex items-center gap-2">
                                <span className={`${stageInfo.text}`}>{stageInfo.title}</span>
                                <span className="text-slate-600">|</span>
                                <span>{currentGroup.groupName === 'Final' ? 'Final Grubu' : `${currentGroup.groupName}. Grup`}</span>
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 bg-slate-950/50 p-1 rounded-md">
                            {navGroups.map(gId => (
                                <Link
                                    key={gId}
                                    href={`/1lig/playoffs/${stage}/${gId}`}
                                    className={`px-2.5 py-1 text-xs font-bold rounded transition-all ${gId === groupId ? 'bg-gradient-to-r ' + stageInfo.color + ' text-white' : 'text-slate-500 hover:bg-slate-800'}`}
                                >
                                    {gId}
                                </Link>
                            ))}
                        </div>
                        <button onClick={() => {
                            const ids = groupFixture.map(m => m.id);
                            setOverrides(prev => { const n = { ...prev }; ids.forEach(id => delete n[id]); return n; });
                        }} className="px-2 py-1 bg-slate-800 text-rose-400 text-xs rounded hover:bg-rose-900/20">Sıfırla</button>
                    </div>
                </div>

                {/* Content */}
                <div className="grid lg:grid-cols-12 gap-3 flex-1 min-h-0">
                    {/* Standings */}
                    <div className="lg:col-span-5 flex flex-col h-full gap-3">
                        <div className="flex flex-col gap-0 min-h-0">
                            <div className={`bg-gradient-to-r ${stageInfo.color} px-3 py-1.5 rounded-t-lg shadow`}><h2 className="text-xs font-bold text-white text-center">PUAN DURUMU</h2></div>
                            <div className="bg-slate-900 border border-slate-800 rounded-b-lg overflow-x-auto">
                                <table className="w-full text-xs text-left table-fixed">
                                    <thead className="bg-slate-800 text-slate-400 uppercase text-[9px]">
                                        <tr>
                                            <th scope="col" className="px-1 py-2 w-6 text-center">#</th>
                                            <th scope="col" className="px-2 py-2 text-left w-auto">Takım</th>
                                            <th scope="col" className="px-1 py-1 text-center w-6">O</th>
                                            <th scope="col" className="px-1 py-1 text-center w-6">G</th>
                                            <th scope="col" className="px-1 py-1 text-center w-6">M</th>
                                            <th scope="col" className="px-1 py-1 text-center w-7 font-bold text-slate-200">P</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/50">
                                        {currentGroup.teams.map((team, idx) => {
                                            const isQualifying = idx < 2;
                                            return (
                                                <tr key={team.name} className={`hover:bg-slate-800/50 ${isQualifying ? 'bg-emerald-950/10' : ''}`}>
                                                    <td className={`px-1 py-1.5 text-center font-medium ${isQualifying ? 'text-emerald-400' : 'text-slate-500'}`}>{idx + 1}</td>
                                                    <td className="px-2 py-1.5">
                                                        <div className="font-semibold text-white text-xs truncate w-24 sm:w-auto">{team.name}</div>
                                                        <div className="text-[9px] text-slate-500">{team.sourceGroup}</div>
                                                    </td>
                                                    <td className="px-1 py-1.5 text-center text-slate-400">{team.scenarioPlayed}</td>
                                                    <td className="px-1 py-1.5 text-center text-emerald-400">{team.scenarioWins}</td>
                                                    <td className="px-1 py-1.5 text-center text-rose-400">{team.scenarioLosses}</td>
                                                    <td className="px-1 py-1.5 text-center font-bold text-white bg-slate-800/30 rounded">{team.scenarioPoints}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Projection */}
                        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 flex-1">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3 text-center border-b border-slate-800/50 pb-2">🔮 {stageInfo.nextStage} Yolculuğu</h3>
                            <div className="space-y-2">
                                <div className={`flex items-center gap-3 p-2 rounded-lg border ${stage === 'final' ? 'bg-amber-500/10 border-amber-500/30' : 'bg-emerald-950/10 border-emerald-900/30'}`}>
                                    <div className="w-6 h-6 flex items-center justify-center rounded text-xs font-bold bg-white/10">1</div>
                                    <div className="flex-1">
                                        <div className="text-xs font-bold text-white">{currentGroup.teams[0]?.name || '-'}</div>
                                        <div className="text-[10px] text-emerald-400">{stage === 'final' ? 'Sultanlar Ligi\'ne Yükselir 🏆' : 'Final Grubuna Yükselir'}</div>
                                    </div>
                                </div>
                                <div className={`flex items-center gap-3 p-2 rounded-lg border ${stage === 'final' ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-emerald-950/10 border-emerald-900/30'}`}>
                                    <div className="w-6 h-6 flex items-center justify-center rounded text-xs font-bold bg-white/10">2</div>
                                    <div className="flex-1">
                                        <div className="text-xs font-bold text-white">{currentGroup.teams[1]?.name || '-'}</div>
                                        <div className="text-[10px] text-emerald-400">{stage === 'final' ? 'Sultanlar Ligi\'ne Yükselir 🏆' : 'Final Grubuna Yükselir'}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Fixtures */}
                    <div className="lg:col-span-7 flex flex-col h-full gap-2 min-h-0">
                        <div className="flex items-center justify-between px-1">
                            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Maç Fikstürü</h2>
                            <button onClick={predictGroupMatches} disabled={predicting} className="px-2 py-1 bg-purple-600/20 text-purple-300 border border-purple-500/30 text-[10px] rounded hover:text-white transition-colors">
                                {predicting ? '...' : 'Tümünü Tahmin Et'}
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto pr-1">
                            <div className="grid grid-cols-1 gap-2 pb-2">
                                {groupFixture.map((match, mIdx) => {
                                    const currentScore = overrides[match.id];
                                    return (
                                        <div key={match.id} className="bg-slate-900 border border-slate-800 rounded p-2 flex items-center gap-3">
                                            <div className="text-[9px] font-bold text-slate-600 w-4 text-center">{mIdx + 1}.</div>
                                            <div className="flex-1 flex flex-col gap-1.5">
                                                <div className="flex items-center justify-between text-[11px]">
                                                    <div className="w-[45%] text-right font-medium text-slate-300 truncate">{match.homeTeam}</div>
                                                    <div className="text-[9px] text-slate-600">v</div>
                                                    <div className="w-[45%] text-left font-medium text-slate-300 truncate">{match.awayTeam}</div>
                                                </div>
                                                <div className="flex justify-center gap-1">
                                                    {SCORES.map(score => {
                                                        const isSelected = currentScore === score;
                                                        const homeWin = parseInt(score.split('-')[0]) > parseInt(score.split('-')[1]);
                                                        return (
                                                            <button
                                                                key={score}
                                                                onClick={() => handleScoreSelect(match.id, isSelected ? null : score)}
                                                                className={`w-8 h-5 flex items-center justify-center rounded-[3px] text-[9px] font-bold border transition-all ${isSelected ? (homeWin ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-rose-600 border-rose-500 text-white') : 'bg-slate-950 border-slate-800 text-slate-500 hover:bg-slate-800'}`}
                                                            >
                                                                {score}
                                                            </button>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

```

## File: app\1lig\stats\OneLigStatsClient.tsx
```
"use client";

import { useState, useMemo } from "react";
import { TeamStats } from "../../types";

import TeamAvatar from "@/app/components/TeamAvatar";

interface OneLigStatsClientProps {
    initialTeams: TeamStats[];
}

export default function OneLigStatsClient({ initialTeams }: OneLigStatsClientProps) {
    const [activeTab, setActiveTab] = useState("GENEL");

    const groups = useMemo(() => {
        return Array.from(new Set(initialTeams.map((t: TeamStats) => t.groupName))).sort() as string[];
    }, [initialTeams]);

    const filteredTeams = useMemo(() => activeTab === "GENEL"
        ? initialTeams
        : initialTeams.filter(t => t.groupName === activeTab), [initialTeams, activeTab]);

    const teamsWithStats = useMemo(() => filteredTeams.map(t => ({
        ...t,
        losses: (t.played || 0) - (t.wins || 0),
        winRate: (t.played || 0) > 0 ? Math.round(((t.wins || 0) / (t.played || 0)) * 100) : 0,
        setRatio: (t.setsLost || 0) > 0 ? ((t.setsWon || 0) / (t.setsLost || 0)).toFixed(2) : (t.setsWon || 0).toString()
    })), [filteredTeams]);

    const totalMatches = useMemo(() => teamsWithStats.reduce((sum, t) => sum + (t.played || 0), 0) / 2, [teamsWithStats]);
    const totalSets = useMemo(() => teamsWithStats.reduce((sum, t) => sum + (t.setsWon || 0), 0), [teamsWithStats]);
    const avgPointsPerTeam = useMemo(() => teamsWithStats.length > 0
        ? Math.round(teamsWithStats.reduce((sum, t) => sum + (t.points || 0), 0) / teamsWithStats.length)
        : 0, [teamsWithStats]);

    const leastLosses = useMemo(() => [...teamsWithStats].sort((a, b) => a.losses - b.losses || b.wins - a.wins).slice(0, 5), [teamsWithStats]);
    const mostLosses = useMemo(() => [...teamsWithStats].sort((a, b) => b.losses - a.losses || a.wins - b.wins).slice(0, 5), [teamsWithStats]);
    const mostSets = useMemo(() => [...teamsWithStats].sort((a, b) => b.setsWon - a.setsWon).slice(0, 5), [teamsWithStats]);
    const mostPoints = useMemo(() => [...teamsWithStats].sort((a, b) => b.points - a.points).slice(0, 5), [teamsWithStats]);
    const leastSetsLost = useMemo(() => [...teamsWithStats].sort((a, b) => a.setsLost - b.setsLost || b.wins - a.wins).slice(0, 5), [teamsWithStats]);
    const bestWinRate = useMemo(() => [...teamsWithStats].filter(t => (t.played || 0) >= 3).sort((a, b) => b.winRate - a.winRate).slice(0, 5), [teamsWithStats]);

    const BarChart = ({ value, max, color }: { value: number; max: number; color: string }) => (
        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden flex-1">
            <div
                className={`h-full ${color} transition-all duration-500`}
                style={{ width: `${Math.min((value / (max || 1)) * 100, 100)}%` }}
            />
        </div>
    );

    const StatCard = ({ title, icon, teams, statKey, color, gradient, suffix = "" }: {
        title: string; icon: string;
        teams: typeof teamsWithStats;
        statKey: 'losses' | 'wins' | 'setsWon' | 'setsLost' | 'points' | 'winRate';
        color: string;
        gradient: string;
        suffix?: string;
    }) => {
        const maxValue = Math.max(...teams.map(t => Number(t[statKey])), 1);

        return (
            <div className="bg-slate-950/50 backdrop-blur-md rounded-xl border border-slate-800/60 overflow-hidden hover:border-slate-700/80 transition-all duration-300 group shadow-md hover:shadow-lg">
                <div className={`${gradient} px-2.5 py-2 border-b border-white/10 relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="flex items-center justify-between relative z-10">
                        <h3 className="font-bold text-white text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                            <span className="text-sm">{icon}</span> {title}
                        </h3>
                        <span className="text-[9px] font-bold text-white/70 bg-black/20 px-1.5 py-0.5 rounded-full border border-white/10">TOP 5</span>
                    </div>
                </div>

                <div className="p-1.5 space-y-1">
                    {teams.map((t, idx) => (
                        <div
                            key={t.name}
                            className={`flex items-center gap-2 p-1.5 rounded-lg transition-all ${idx === 0 ? 'bg-gradient-to-r from-white/5 to-transparent border border-white/10' : 'hover:bg-white/5'
                                }`}
                        >
                            <div className={`w-5 h-5 rounded flex items-center justify-center font-bold text-[10px] shadow-sm ${idx === 0 ? 'bg-amber-400 text-amber-950' :
                                idx === 1 ? 'bg-slate-300 text-slate-800' :
                                    idx === 2 ? 'bg-amber-700 text-amber-100' :
                                        'bg-slate-800 text-slate-500'
                                }`}>
                                {idx + 1}
                            </div>
                            <TeamAvatar name={t.name} size="xs" />

                            <div className="flex-1 min-w-0">
                                <span className={`text-[11px] font-bold truncate block ${idx === 0 ? 'text-white' : 'text-slate-300'}`} title={t.name}>
                                    {t.name}
                                </span>
                                {t.groupName && (
                                    <span className="text-[8px] text-slate-500 block leading-tight">{t.groupName}</span>
                                )}
                            </div>

                            <div className="flex items-center gap-1.5 w-16 justify-end">
                                <div className="h-1 bg-slate-800/50 rounded-full overflow-hidden flex-1 max-w-[30px]">
                                    <div className={`h-full ${color} opacity-80`} style={{ width: `${Math.min((Number(t[statKey]) / maxValue) * 100, 100)}%` }}></div>
                                </div>
                                <span className={`text-[11px] font-bold min-w-[24px] text-right ${idx === 0 ? 'text-white' : 'text-slate-400'}`}>
                                    {t[statKey]}{suffix}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <main className="min-h-screen bg-slate-950 text-slate-100 p-2 sm:p-4 font-sans">
            <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
                <div className="flex flex-col gap-1 px-1">
                    <h1 className="font-bold text-white text-lg tracking-tight leading-none hidden sm:block">1. Lig İstatistikleri</h1>
                    <p className="text-[10px] text-slate-400 hidden sm:block">Kadınlar 1. Ligi İstatistik Merkezi</p>
                </div>

                <div className="flex bg-slate-900/50 p-1 rounded-xl border border-slate-800/50 overflow-x-auto">
                    <button
                        onClick={() => setActiveTab("GENEL")}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${activeTab === "GENEL"
                            ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20"
                            : "text-slate-400 hover:text-white hover:bg-slate-800"
                            }`}
                    >
                        GENEL İSTATİSTİKLER
                    </button>
                    {groups.map(group => (
                        <button
                            key={group}
                            onClick={() => setActiveTab(group)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ml-1 ${activeTab === group
                                ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20"
                                : "text-slate-400 hover:text-white hover:bg-slate-800"
                                }`}
                        >
                            {group} İSTATİSTİKLERİ
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                    <div className="bg-gradient-to-br from-amber-600/20 to-amber-900/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-amber-600/30 text-center">
                        <div className="text-2xl sm:text-4xl font-bold text-amber-400">{Math.round(totalMatches)}</div>
                        <div className="text-[10px] sm:text-xs text-amber-400/70 uppercase tracking-wider mt-1">Toplam Maç</div>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-600/20 to-emerald-900/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-emerald-600/30 text-center">
                        <div className="text-2xl sm:text-4xl font-bold text-emerald-400">{totalSets}</div>
                        <div className="text-[10px] sm:text-xs text-emerald-400/70 uppercase tracking-wider mt-1">Toplam Set</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-600/20 to-purple-900/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-purple-600/30 text-center">
                        <div className="text-2xl sm:text-4xl font-bold text-purple-400">{avgPointsPerTeam}</div>
                        <div className="text-[10px] sm:text-xs text-purple-400/70 uppercase tracking-wider mt-1">Ort. Puan</div>
                    </div>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 pb-8">
                    <StatCard
                        title="En Çok Puan"
                        icon="💎"
                        teams={mostPoints}
                        statKey="points"
                        color="bg-amber-500"
                        gradient="bg-gradient-to-r from-amber-600 to-orange-600"
                        suffix="P"
                    />
                    <StatCard
                        title="En Yüksek Galibiyet"
                        icon="📈"
                        teams={bestWinRate}
                        statKey="winRate"
                        color="bg-teal-500"
                        gradient="bg-gradient-to-r from-teal-600 to-cyan-600"
                        suffix="%"
                    />
                    <StatCard
                        title="En Çok Set Alan"
                        icon="🏐"
                        teams={mostSets}
                        statKey="setsWon"
                        color="bg-purple-500"
                        gradient="bg-gradient-to-r from-purple-600 to-pink-600"
                    />
                    <StatCard
                        title="En Az Mağlubiyet"
                        icon="🛡️"
                        teams={leastLosses}
                        statKey="losses"
                        color="bg-emerald-500"
                        gradient="bg-gradient-to-r from-emerald-600 to-green-600"
                        suffix="M"
                    />
                    <StatCard
                        title="En Az Set Veren"
                        icon="🧱"
                        teams={leastSetsLost}
                        statKey="setsLost"
                        color="bg-rose-500"
                        gradient="bg-gradient-to-r from-rose-600 to-red-600"
                    />
                    <StatCard
                        title="En Çok Mağlubiyet"
                        icon="📉"
                        teams={mostLosses}
                        statKey="losses"
                        color="bg-slate-500"
                        gradient="bg-gradient-to-r from-slate-600 to-slate-700"
                        suffix="M"
                    />
                </div>
            </div>
        </main>
    );
}

```

## File: app\1lig\stats\page.tsx
```
import { Metadata } from "next";
import { getLeagueData } from "../../utils/serverData";
import OneLigStatsClient from "./OneLigStatsClient";

export const metadata: Metadata = {
    title: "1. Lig İstatistikler",
    description: "Arabica Coffee House 1. Lig takım istatistikleri ve performans analizleri. Grup bazlı detaylı veriler.",
    openGraph: {
        title: "1. Lig İstatistikler | VolleySimulator",
        description: "1. Lig takım istatistikleri ve performans analizleri.",
    },
};

export default async function OneLigStatsPage() {
    const { teams } = await getLeagueData("1lig");

    return (
        <OneLigStatsClient initialTeams={teams} />
    );
}

```

## File: app\1lig\tahminoyunu\loading.tsx
```
import { SkeletonTable } from "../../components/Skeleton";

export default function OneLigCalculatorLoading() {
    return (
        <main className="min-h-screen bg-slate-950 text-slate-100 p-2 sm:p-4 font-sans pb-20 sm:pb-4">
            <div className="w-full max-w-[1600px] mx-auto flex flex-col h-[calc(100vh-2rem)] gap-4">
                {/* Header skeleton */}
                <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-4">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                            <div className="h-8 w-48 bg-slate-800 rounded animate-pulse" />
                            <div className="h-6 w-32 bg-slate-800/50 rounded animate-pulse" />
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-20 bg-slate-800 rounded animate-pulse" />
                            <div className="h-8 w-20 bg-slate-800 rounded animate-pulse" />
                        </div>
                    </div>
                    <div className="mt-4 h-2 w-full bg-slate-800 rounded-full animate-pulse" />
                </div>

                {/* Content grid skeleton */}
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0 overflow-hidden">
                    <div className="lg:col-span-7">
                        <SkeletonTable rows={12} columns={8} />
                    </div>
                    <div className="lg:col-span-5">
                        <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-4 space-y-4">
                            <div className="h-6 w-32 bg-slate-800 rounded animate-pulse" />
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 bg-slate-700 rounded-full animate-pulse" />
                                        <div className="h-4 w-24 bg-slate-700 rounded animate-pulse" />
                                    </div>
                                    <div className="h-6 w-16 bg-slate-700 rounded animate-pulse" />
                                    <div className="flex items-center gap-2">
                                        <div className="h-4 w-24 bg-slate-700 rounded animate-pulse" />
                                        <div className="w-6 h-6 bg-slate-700 rounded-full animate-pulse" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

```

## File: app\1lig\tahminoyunu\OneLigCalculatorClient.tsx
```
"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { TeamStats, Match, Achievement } from "../../types";

import { useToast, AchievementToast, AchievementsPanel } from "../../components";
import StandingsTable from "../../components/Calculator/StandingsTable";
import FixtureList from "../../components/Calculator/FixtureList";
import ShareButton from "../../components/ShareButton";
import { calculateLiveStandings } from "../../utils/calculatorUtils";
import { calculateElo } from "../../utils/eloCalculator";
import { useGameState, ACHIEVEMENTS } from "../../utils/gameState";
import { sounds } from "../../utils/sounds";

interface OneLigCalculatorClientProps {
    initialTeams: TeamStats[];
    initialMatches: Match[];
}

export default function OneLigCalculatorClient({ initialTeams, initialMatches }: OneLigCalculatorClientProps) {
    const { showToast, showUndoToast } = useToast();
    const searchParams = useSearchParams();
    const groupParam = searchParams.get("group");
    const standingsRef = useRef<HTMLDivElement>(null);

    // Normalize data
    const normalizedTeams = useMemo(() => initialTeams.map((t: any) => ({
        ...t,
        name: t.name.toLocaleUpperCase('tr-TR'),
        groupName: t.groupName.includes('A') ? 'A GRUBU' : 'B GRUBU'
    })), [initialTeams]);

    const normalizedMatches = useMemo(() => initialMatches.map((m: any) => ({
        ...m,
        homeTeam: m.homeTeam.toLocaleUpperCase('tr-TR'),
        awayTeam: m.awayTeam.toLocaleUpperCase('tr-TR'),
        matchDate: m.date || m.matchDate,
        groupName: m.groupName.includes('A') ? 'A GRUBU' : 'B GRUBU'
    })), [initialMatches]);

    // Data State
    const [allTeams] = useState<TeamStats[]>(normalizedTeams);
    const [allMatches] = useState<Match[]>(normalizedMatches);
    const groups = useMemo(() => [...new Set(normalizedTeams.map(t => t.groupName))].sort(), [normalizedTeams]);

    // UI State
    const [selectedGroup, setSelectedGroup] = useState<string>(groupParam && groups.includes(groupParam) ? groupParam : (groups[0] || "A GRUBU"));
    const [overrides, setOverrides] = useState<Record<string, string>>({});
    const [showAchievements, setShowAchievements] = useState(false);
    const [showAutoMenu, setShowAutoMenu] = useState(false);
    const [showResetMenu, setShowResetMenu] = useState(false);
    const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);

    // Game State
    const { gameState, addXP, recordPrediction, unlockAchievement, hasAchievement } = useGameState();

    // Load saved scenarios on mount
    useEffect(() => {
        const saved = localStorage.getItem('1ligGroupScenarios');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                let flatOverrides: Record<string, string> = {};
                Object.values(parsed).forEach((groupObj: any) => {
                    flatOverrides = { ...flatOverrides, ...groupObj };
                });
                setOverrides(flatOverrides);
            } catch (e) { console.error(e); }
        }
    }, []);

    const handleScoreChange = (matchId: string, score: string) => {
        const newOverrides = { ...overrides };
        const wasNew = !overrides[matchId];

        if (score) {
            newOverrides[matchId] = score;
            if (wasNew) {
                addXP(10);
                sounds.scoreSelect();
                if (!hasAchievement('first_prediction')) {
                    const wasUnlocked = unlockAchievement('first_prediction');
                    if (wasUnlocked) {
                        setNewAchievement(ACHIEVEMENTS.first_prediction as Achievement);
                        sounds.achievement();
                    }
                }
                if (gameState.stats.totalPredictions >= 49 && !hasAchievement('game_addict')) {
                    const wasUnlocked = unlockAchievement('game_addict');
                    if (wasUnlocked) {
                        setNewAchievement(ACHIEVEMENTS.game_addict as Achievement);
                        sounds.achievement();
                    }
                }
                recordPrediction(true);
            }
        } else {
            delete newOverrides[matchId];
        }
        setOverrides(newOverrides);
    };

    // Persist overrides to localStorage
    useEffect(() => {
        if (!selectedGroup) return;
        const saved = localStorage.getItem('1ligGroupScenarios');
        const globalObj = saved ? JSON.parse(saved) : {};
        const newGlobalObj = { ...globalObj };
        groups.forEach(g => {
            const groupMatches = allMatches.filter(m => m.groupName === g);
            const groupOverrides: Record<string, string> = {};
            groupMatches.forEach(m => {
                const id = `${m.homeTeam}-${m.awayTeam}`;
                if (overrides[id]) groupOverrides[id] = overrides[id];
            });
            newGlobalObj[g] = groupOverrides;
        });
        localStorage.setItem('1ligGroupScenarios', JSON.stringify(newGlobalObj));
    }, [overrides, groups, allMatches, selectedGroup]);

    const activeGroup = selectedGroup || groups[0];

    const activeTeams = useMemo(() =>
        allTeams.filter(t => t.groupName === activeGroup),
        [allTeams, activeGroup]
    );

    const activeMatches = useMemo(() =>
        allMatches.filter(m => m.groupName === activeGroup),
        [allMatches, activeGroup]
    );

    const handleResetGroup = () => {
        if (!confirm(`${activeGroup} grubundaki tahminleriniz silinecek. Emin misiniz?`)) return;
        const newOverrides = { ...overrides };
        const groupMatches = allMatches.filter(m => m.groupName === activeGroup);
        groupMatches.forEach(m => {
            const id = `${m.homeTeam}-${m.awayTeam}`;
            delete newOverrides[id];
        });
        setOverrides(newOverrides);
        showToast(`${activeGroup} tahminleri sıfırlandı`, "success");
    };

    const handleResetAll = () => {
        const previousOverrides = { ...overrides };
        setOverrides({});
        localStorage.removeItem('1ligGroupScenarios');
        showUndoToast("Tüm 1. Lig tahminleri sıfırlandı", () => {
            setOverrides(previousOverrides);
            localStorage.setItem('1ligGroupScenarios', JSON.stringify(previousOverrides));
        });
    };

    // Memoize standings calculations
    const initialStandings = useMemo(() =>
        calculateLiveStandings(activeTeams, activeMatches, {}),
        [activeTeams, activeMatches]
    );

    const initialRanks = useMemo(() => {
        const ranks = new Map<string, number>();
        initialStandings.forEach((team, idx) => ranks.set(team.name, idx + 1));
        return ranks;
    }, [initialStandings]);

    const liveStandings = useMemo(() =>
        calculateLiveStandings(activeTeams, activeMatches, overrides),
        [activeTeams, activeMatches, overrides]
    );

    const currentRanks = useMemo(() => {
        const ranks = new Map<string, number>();
        liveStandings.forEach((team, idx) => ranks.set(team.name, idx + 1));
        return ranks;
    }, [liveStandings]);

    // Export / Import Handlers
    const handleSaveAllScenarios = () => {
        try {
            const exportData = {
                league: '1. Lig',
                groupScenarios: JSON.parse(localStorage.getItem('1ligGroupScenarios') || '{}'),
                date: new Date().toISOString()
            };
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
            const a = document.createElement('a');
            a.href = dataStr;
            a.download = `1lig-tahmin-${new Date().toLocaleDateString('tr-TR')}.json`;
            a.click();
            showToast("1. Lig senaryosu indirildi", "success");
        } catch (e) { console.error(e); }
    };

    const handleScrollToNextMatch = () => {
        const nextMatch = activeMatches.find(m => !m.isPlayed && !overrides[`${m.homeTeam}-${m.awayTeam}`]);
        if (nextMatch) {
            const id = `match-${nextMatch.homeTeam}-${nextMatch.awayTeam}`;
            const el = document.getElementById(id);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                el.classList.add('ring-2', 'ring-amber-500');
                setTimeout(() => el.classList.remove('ring-2', 'ring-amber-500'), 2000);
            }
        }
    };

    const handleImportAllScenarios = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const json = JSON.parse(evt.target?.result as string);
                if (json.groupScenarios) {
                    const convertedScenarios: Record<string, Record<string, string>> = {};
                    for (const [groupName, groupData] of Object.entries(json.groupScenarios)) {
                        convertedScenarios[groupName] = {};
                        for (const [matchKey, score] of Object.entries(groupData as Record<string, string>)) {
                            const newKey = matchKey.includes('|||') ? matchKey.replace('|||', '-') : matchKey;
                            convertedScenarios[groupName][newKey] = score;
                        }
                    }
                    localStorage.setItem('1ligGroupScenarios', JSON.stringify(convertedScenarios));
                    let flat: Record<string, string> = {};
                    Object.values(convertedScenarios).forEach((obj: any) => flat = { ...flat, ...obj });
                    setOverrides(flat);
                }
                showToast("1. Lig senaryosu yüklendi", "success");
            } catch (err) { console.error(err); }
        }
        reader.readAsText(file);
        e.target.value = '';
    }

    // Auto Simulation Logic
    const handleSimulateSmart = () => {
        if (!confirm(`${activeGroup} grubu için oynanmamış maçlar güncel güç dengelerine göre doldurulacak. Onaylıyor musunuz?`)) return;
        const newOverrides = { ...overrides };
        let count = 0;
        const eloRatings = calculateElo(activeTeams, activeMatches.filter(m => m.isPlayed));
        activeMatches.forEach(match => {
            if (match.isPlayed || newOverrides[`${match.homeTeam}-${match.awayTeam}`]) return;
            const homeElo = eloRatings.get(match.homeTeam) || 1200;
            const awayElo = eloRatings.get(match.awayTeam) || 1200;
            const winProb = 1 / (1 + Math.pow(10, (awayElo - homeElo) / 400));
            const randomFactor = (Math.random() * 0.15) - 0.075;
            const finalProb = winProb + randomFactor;
            let score = "0-0";
            if (finalProb > 0.60) score = "3-0";
            else if (finalProb > 0.55) score = "3-1";
            else if (finalProb > 0.50) score = "3-2";
            else if (finalProb > 0.45) score = "2-3";
            else if (finalProb > 0.40) score = "1-3";
            else score = "0-3";
            newOverrides[`${match.homeTeam}-${match.awayTeam}`] = score;
            count++;
        });
        setOverrides(newOverrides);
        if (count > 0) {
            sounds.levelUp();
            showToast(`${count} maç güç dengelerine göre tahmin edildi! 🧠`, "success");
            addXP(count * 2);
        }
    };

    const handleSimulateRandom = () => {
        if (!confirm(`${activeGroup} grubu için oynanmamış maçlar RASTGELE skorlarla doldurulacak. Onaylıyor musunuz?`)) return;
        const newOverrides = { ...overrides };
        let count = 0;
        const scores = ["3-0", "3-1", "3-2", "2-3", "1-3", "0-3"];
        activeMatches.forEach(match => {
            if (match.isPlayed || newOverrides[`${match.homeTeam}-${match.awayTeam}`]) return;
            const randomScore = scores[Math.floor(Math.random() * scores.length)];
            newOverrides[`${match.homeTeam}-${match.awayTeam}`] = randomScore;
            count++;
        });
        setOverrides(newOverrides);
        if (count > 0) {
            sounds.levelUp();
            showToast(`${count} maç rastgele tahmin edildi! 🎲`, "success");
            addXP(count * 2);
        }
    };

    return (
        <main className="min-h-screen bg-slate-950 text-slate-100 p-1 sm:p-2 font-sans">
            <div className="w-full max-w-7xl mx-auto flex flex-col h-full gap-2">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-2 bg-slate-900/40 rounded-xl border border-slate-800">
                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                        <div className="text-center sm:text-left">
                            <h1 className="font-bold text-white text-lg tracking-tight leading-none hidden sm:block">Arabica Coffee House</h1>
                            <p className="text-[10px] text-slate-400 hidden sm:block">Kadınlar Voleybol 1.Ligi</p>
                        </div>
                        <div className="flex gap-2 items-center w-full sm:w-auto">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest hidden sm:inline whitespace-nowrap">GRUP:</span>
                            <select
                                value={activeGroup}
                                onChange={(e) => setSelectedGroup(e.target.value)}
                                title="Grup Seçin"
                                className="appearance-none bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg px-4 py-2 border border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all outline-none cursor-pointer min-w-[120px]"
                            >
                                {groups.map(groupName => (
                                    <option key={groupName} value={groupName} className="bg-slate-900">
                                        {groupName}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto pb-1 sm:pb-0 justify-between sm:justify-end flex-wrap sm:flex-nowrap">
                        <div className="flex items-center gap-2 shrink-0">
                            <div className="relative">
                                <button
                                    onClick={() => setShowAutoMenu(!showAutoMenu)}
                                    className={`px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1 shadow-lg shadow-amber-500/20 ${showAutoMenu ? 'ring-2 ring-amber-400' : ''}`}
                                >
                                    <span>⚡</span>
                                    <span className="hidden sm:inline">Otomatik</span>
                                    <span className="text-[8px] ml-0.5">▼</span>
                                </button>
                                {showAutoMenu && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setShowAutoMenu(false)}></div>
                                        <div className="absolute top-full left-0 sm:left-auto sm:right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                            <button
                                                onClick={() => { handleSimulateSmart(); setShowAutoMenu(false); }}
                                                className="w-full text-left px-4 py-3 hover:bg-slate-800 transition-colors flex items-center gap-3 border-b border-slate-800"
                                            >
                                                <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-lg">🧠</div>
                                                <div>
                                                    <div className="text-xs font-bold text-white">Güç Dengelerine Göre</div>
                                                    <div className="text-[9px] text-slate-400">Takım güçlerine göre gerçekçi tahmin</div>
                                                </div>
                                            </button>
                                            <button
                                                onClick={() => { handleSimulateRandom(); setShowAutoMenu(false); }}
                                                className="w-full text-left px-4 py-3 hover:bg-slate-800 transition-colors flex items-center gap-3"
                                            >
                                                <div className="w-8 h-8 rounded-full bg-fuchsia-500/20 text-fuchsia-400 flex items-center justify-center text-lg">🎲</div>
                                                <div>
                                                    <div className="text-xs font-bold text-white">Rastgele Dağıt</div>
                                                    <div className="text-[9px] text-slate-400">Tamamen şansa dayalı sonuçlar</div>
                                                </div>
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>

                            <input
                                type="file"
                                accept=".json"
                                onChange={handleImportAllScenarios}
                                className="hidden"
                                id="import-upload-1lig"
                            />
                            <label
                                htmlFor="import-upload-1lig"
                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1"
                                title="Senaryo Yükle"
                            >
                                <span className="hidden sm:inline">Yükle</span>
                            </label>
                            <button
                                onClick={handleSaveAllScenarios}
                                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1"
                                title="Senaryoyu Kaydet"
                            >
                                <span className="hidden sm:inline">Kaydet</span>
                            </button>
                        </div>
                        <div className="w-px h-4 bg-slate-700 hidden sm:block shrink-0"></div>
                        <div className="flex items-center gap-2 shrink-0">
                            <button
                                onClick={handleScrollToNextMatch}
                                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-bold rounded-lg transition-all border border-slate-700 flex items-center gap-1"
                                title="Son kaldığım maça git"
                            >
                                <span className="hidden sm:inline">Kaldığım Yer</span>
                            </button>
                            <div className="relative">
                                <button
                                    onClick={() => setShowResetMenu(!showResetMenu)}
                                    className={`px-3 py-1.5 bg-slate-800 hover:bg-rose-900/50 text-slate-400 hover:text-rose-400 text-xs font-bold rounded-lg transition-all border border-slate-700 flex items-center gap-1 ${showResetMenu ? 'ring-2 ring-rose-500/50' : ''}`}
                                >
                                    <span className="hidden sm:inline">Sıfırla</span>
                                    <span className="text-[8px] ml-0.5">▼</span>
                                </button>
                                {showResetMenu && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setShowResetMenu(false)}></div>
                                        <div className="absolute top-full right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                            <button
                                                onClick={() => { handleResetGroup(); setShowResetMenu(false); }}
                                                className="w-full text-left px-4 py-3 hover:bg-slate-800 transition-colors flex items-center gap-3 border-b border-slate-800"
                                            >
                                                <div>
                                                    <div className="text-xs font-bold text-white">Bu Grubu Sıfırla</div>
                                                    <div className="text-[9px] text-slate-400">Sadece {activeGroup} silinir</div>
                                                </div>
                                            </button>
                                            <button
                                                onClick={() => { handleResetAll(); setShowResetMenu(false); }}
                                                className="w-full text-left px-4 py-3 hover:bg-rose-900/20 transition-colors flex items-center gap-3 group"
                                            >
                                                <div>
                                                    <div className="text-xs font-bold text-rose-400 group-hover:text-rose-300">Tümünü Sıfırla</div>
                                                    <div className="text-[9px] text-rose-500/70 group-hover:text-rose-400/70">Bütün tahminler silinir</div>
                                                </div>
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                            <ShareButton
                                targetRef={standingsRef}
                                championName={liveStandings[0]?.name}
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-4 relative">
                        <div ref={standingsRef} className="sticky top-14 z-10 max-h-[calc(100vh-120px)] overflow-auto custom-scrollbar">
                            <StandingsTable
                                teams={liveStandings}
                                playoffSpots={4}
                                relegationSpots={activeGroup.includes('B') ? 2 : 0}
                                initialRanks={initialRanks}
                                compact={true}
                            />
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <FixtureList
                            matches={activeMatches}
                            overrides={overrides}
                            onScoreChange={handleScoreChange}
                            teamRanks={currentRanks}
                            totalTeams={activeTeams.length}
                            relegationSpots={activeGroup.includes('B') ? 2 : 0}
                        />
                    </div>
                </div>
            </div>

            {newAchievement && (
                <AchievementToast
                    achievement={newAchievement}
                    onClose={() => setNewAchievement(null)}
                />
            )}
            <AchievementsPanel
                isOpen={showAchievements}
                onClose={() => setShowAchievements(false)}
            />
        </main>
    );
}

```

## File: app\1lig\tahminoyunu\page.tsx
```
import { Suspense } from "react";
import { Metadata } from "next";
import { getLeagueData } from "../../utils/serverData";
import OneLigCalculatorClient from "./OneLigCalculatorClient";
import ErrorBoundary from "../../components/ErrorBoundary";
import { SkeletonPage } from "../../components/Skeleton";

export const metadata: Metadata = {
    title: "1. Lig Tahmin Oyunu",
    description: "Arabica Coffee House 1. Lig maç sonuçlarını tahmin edin. Grup A ve Grup B takımlarının maçlarını tahmin ederek puan kazanın.",
    openGraph: {
        title: "1. Lig Tahmin Oyunu | VolleySimulator",
        description: "1. Lig maç sonuçlarını tahmin edin ve liderlik tablosunda yerinizi alın.",
    },
};

export default async function OneLigTahminOyunuPage() {
    const { teams, fixture } = await getLeagueData("1lig");

    return (
        <ErrorBoundary>
            <Suspense fallback={<SkeletonPage />}>
                <OneLigCalculatorClient
                    initialTeams={teams}
                    initialMatches={fixture}
                />
            </Suspense>
        </ErrorBoundary>
    );
}

```

## File: app\2lig\group\[groupId]\page.tsx (SKIPPED - TOO LARGE)

## File: app\2lig\gunceldurum\page.tsx
```
import { Metadata } from "next";
import { getLeagueData } from "../../utils/serverData";
import TwoLigDetailedGroupsClient from "./TwoLigDetailedGroupsClient";

export const metadata: Metadata = {
    title: "2. Lig Güncel Durum",
    description: "Kadınlar 2. Lig puan durumu, 5 grup sıralamaları ve maç sonuçları. Güncel tablo ve fikstür.",
    openGraph: {
        title: "2. Lig Güncel Durum | VolleySimulator",
        description: "2. Lig grup sıralamaları ve puan durumu.",
    },
};

export default async function TwoLigDetailedGroupsPage() {
    const { teams, fixture } = await getLeagueData("2lig");

    return (
        <TwoLigDetailedGroupsClient
            initialTeams={teams}
            initialMatches={fixture}
        />
    );
}

```

## File: app\2lig\gunceldurum\TwoLigDetailedGroupsClient.tsx
```
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

```

## File: app\2lig\playoffs\page.tsx
```
import { Metadata } from "next";
import { getLeagueData } from "../../utils/serverData";
import TwoLigPlayoffsClient from "./TwoLigPlayoffsClient";

export const metadata: Metadata = {
    title: "2. Lig Playoff Simülasyonu",
    description: "Kadınlar 2. Lig playoff simülasyonu. Grup birincileri arasındaki eşleşmeleri simüle edin.",
    openGraph: {
        title: "2. Lig Playoff Simülasyonu | VolleySimulator",
        description: "2. Lig playoff eşleşmelerini simüle edin.",
    },
};

export default async function PlayoffsPage() {
    const { teams, fixture } = await getLeagueData("2lig");

    return (
        <TwoLigPlayoffsClient initialTeams={teams} initialMatches={fixture} />
    );
}

```

