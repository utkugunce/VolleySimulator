# Project Application Context - Part 3

## File: app\2lig\playoffs\TwoLigPlayoffsClient.tsx
```
"use client";

import { useEffect, useState, useMemo } from "react";
import { TeamStats, Match } from "../../types";
import Link from "next/link";
import {
    generateQuarterGroups,
    generateSemiGroups,
    generateFinalGroups,
    applyOverridesToGroups,
    PlayoffGroup,
    calculateGroupStandings
} from "../../utils/playoffUtils";
import { calculateLiveStandings } from "../../utils/calculatorUtils";

import TeamAvatar from "../../components/TeamAvatar";

interface TwoLigPlayoffsClientProps {
    initialTeams: TeamStats[];
    initialMatches: Match[];
}

export default function TwoLigPlayoffsClient({ initialTeams, initialMatches }: TwoLigPlayoffsClientProps) {
    const [groupOverrides, setGroupOverrides] = useState<Record<string, string>>({});
    const [playoffOverrides, setPlayoffOverrides] = useState<Record<string, string>>({});
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const loadSaved = () => {
            const savedPlayoff = localStorage.getItem('playoffScenarios');
            if (savedPlayoff) {
                try {
                    setPlayoffOverrides(JSON.parse(savedPlayoff));
                } catch (e) { console.error(e); }
            }

            const savedGroup = localStorage.getItem('groupScenarios');
            if (savedGroup) {
                try {
                    const parsed = JSON.parse(savedGroup);
                    let flatOverrides: Record<string, string> = {};
                    Object.values(parsed).forEach((groupObj: unknown) => {
                        flatOverrides = { ...flatOverrides, ...(groupObj as Record<string, string>) };
                    });
                    setGroupOverrides(flatOverrides);
                } catch (e) { console.error(e); }
            }
            setIsLoaded(true);
        };

        Promise.resolve().then(loadSaved);
    }, []);

    const baseStandings = useMemo(() => {
        const calculatedTeams = calculateLiveStandings(initialTeams, initialMatches, groupOverrides);
        return calculateGroupStandings(calculatedTeams);
    }, [initialTeams, initialMatches, groupOverrides]);

    const quarterGroups = useMemo(() => {
        const qs = generateQuarterGroups(baseStandings, initialMatches);
        return applyOverridesToGroups(qs, playoffOverrides, 'quarter');
    }, [baseStandings, initialMatches, playoffOverrides]);

    const semiGroups = useMemo(() => {
        const ss = generateSemiGroups(quarterGroups);
        return applyOverridesToGroups(ss, playoffOverrides, 'semi');
    }, [quarterGroups, playoffOverrides]);

    const finalGroups = useMemo(() => {
        const fs = generateFinalGroups(semiGroups);
        return applyOverridesToGroups(fs, playoffOverrides, 'final');
    }, [semiGroups, playoffOverrides]);

    const remainingGroupMatchesCount = useMemo(() => {
        let remaining = initialMatches.filter((m: Match) => !m.isPlayed).length;
        remaining = Math.max(0, remaining - Object.keys(groupOverrides).length);
        return remaining;
    }, [initialMatches, groupOverrides]);

    const isGroupsComplete = remainingGroupMatchesCount === 0;

    const renderStageGroups = (stage: string, groups: PlayoffGroup[], title: string, color: string) => {
        return (
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${color}`}></span>
                    {title}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {groups.map(group => {
                        const groupPrefix = `${stage}-${group.groupName}-`;
                        const groupMatchesCount = Object.keys(playoffOverrides).filter(k => k.startsWith(groupPrefix)).length;
                        const totalMatches = 6;
                        const isComplete = groupMatchesCount >= totalMatches;

                        let displayName = group.groupName;
                        if (stage === 'semi') {
                            const map: Record<string, string> = { 'A': '1', 'B': '2', 'C': '3', 'D': '4' };
                            displayName = map[group.groupName] || group.groupName;
                        }

                        return (
                            <Link
                                key={group.groupName}
                                href={`/2lig/playoffs/${stage}/${group.groupName}`}
                                className="block bg-slate-900 border border-slate-800 rounded-lg overflow-hidden hover:border-slate-600 hover:shadow-lg transition-all"
                            >
                                <div className={`h-2 ${color}/50`}></div>
                                <div className="p-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="font-bold text-white text-lg">
                                            {stage === 'semi' ? `${displayName}. Grup` : `Grup ${displayName}`}
                                        </h3>
                                        {isComplete ? (
                                            <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">Tamamlandı</span>
                                        ) : (
                                            <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded">{totalMatches - groupMatchesCount} Maç Eksik</span>
                                        )}
                                    </div>
                                    <div className="space-y-0.5">
                                        <div className="flex items-center justify-between text-[10px] text-slate-500 px-2 pb-1 border-b border-slate-800/50">
                                            <span>#</span>
                                            <span className="flex-1 px-2">Takım</span>
                                            <span>P</span>
                                        </div>
                                        {group.teams.map((team, idx) => (
                                            <div key={team.name} className={`flex items-center justify-between text-xs py-1 px-2 rounded ${idx < 2 ? 'bg-emerald-500/5' : ''}`}>
                                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                                    <span className={`w-3 text-center text-[10px] ${idx < 2 ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>{idx + 1}</span>
                                                    <TeamAvatar name={team.name} size="xs" />
                                                    <span className={`truncate ${idx < 2 ? 'text-slate-200 font-medium' : 'text-slate-400'}`}>{team.name}</span>
                                                </div>
                                                <span className={`font-bold ml-2 w-4 text-center ${idx < 2 ? 'text-white' : 'text-slate-500'}`}>
                                                    {team.scenarioPoints ?? 0}
                                                </span>
                                            </div>
                                        ))}
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
                    <h1 className="font-bold text-white text-lg tracking-tight leading-none hidden sm:block">Play-Off Senaryo Modu</h1>
                    <p className="text-[10px] text-slate-400 hidden sm:block">Turnuva simülasyonu ve eşleşme tahminleri</p>
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
                    const promotedTeams: Array<{ name: string; rank: 1 | 2; group: string }> = [];
                    finalGroups.forEach(g => {
                        const count = Object.keys(playoffOverrides).filter(k => k.startsWith(`final-${g.groupName}-`)).length;
                        if (count >= 6) {
                            if (g.teams[0]) promotedTeams.push({ name: g.teams[0].name, rank: 1, group: g.groupName });
                            if (g.teams[1]) promotedTeams.push({ name: g.teams[1].name, rank: 2, group: g.groupName });
                        }
                    });

                    if (promotedTeams.length === 0) return null;

                    const champCount = promotedTeams.filter(t => t.rank === 1).length;
                    const runnerUpCount = promotedTeams.filter(t => t.rank === 2).length;
                    const totalPlayoffMatches = Object.keys(playoffOverrides).length;

                    return (
                        <div className="bg-gradient-to-r from-emerald-900/50 via-slate-900 to-emerald-900/30 border border-emerald-500/30 rounded-xl p-6 relative overflow-hidden">
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2 relative z-10">
                                <span className="text-3xl">🎉</span>
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-200">
                                    1. Lige Yükselen Takımlar
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
                                                    Final {team.group}. Grup {team.rank === 1 ? 'Şampiyonu' : 'İkincisi'}
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
                                        <div className="text-lg font-bold text-white mb-1">Turnuva Özeti</div>
                                        <div className="text-sm text-slate-400">2. Lig Play-Off 2025-26</div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4 w-full mt-2">
                                        <div className="text-center p-3 bg-slate-900/50 rounded-lg">
                                            <div className="text-2xl font-bold text-amber-400">{champCount}</div>
                                            <div className="text-[10px] text-slate-500 uppercase tracking-wider">Şampiyon</div>
                                        </div>
                                        <div className="text-center p-3 bg-slate-900/50 rounded-lg">
                                            <div className="text-2xl font-bold text-slate-300">{runnerUpCount}</div>
                                            <div className="text-[10px] text-slate-500 uppercase tracking-wider">İkinci</div>
                                        </div>
                                        <div className="text-center p-3 bg-slate-900/50 rounded-lg">
                                            <div className="text-2xl font-bold text-emerald-400">{totalPlayoffMatches}</div>
                                            <div className="text-[10px] text-slate-500 uppercase tracking-wider">Toplam Maç</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })()}

                {isGroupsComplete ? (
                    (() => {
                        const quarterMatchCount = Object.keys(playoffOverrides).filter(k => k.startsWith('quarter-')).length;
                        const isQuarterComplete = quarterMatchCount >= 24;

                        const semiMatchCount = Object.keys(playoffOverrides).filter(k => k.startsWith('semi-')).length;
                        const isSemiComplete = semiMatchCount >= 24;

                        return (
                            <div className="space-y-12">
                                {renderStageGroups('quarter', quarterGroups, 'Çeyrek Final', 'bg-amber-500')}

                                <div className="relative">
                                    {!isQuarterComplete && (
                                        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center rounded-xl py-8">
                                            <div className="text-4xl mb-2">🔒</div>
                                            <h3 className="text-lg font-bold text-white mb-1">Yarı Final Kilitli</h3>
                                            <p className="text-slate-400 text-xs text-center max-w-sm">
                                                Yarı Final gruplarını açmak için Çeyrek Final gruplarını tamamlayın.
                                            </p>
                                            <p className="text-amber-400 text-sm font-medium mt-2">
                                                {24 - quarterMatchCount} / 24 maç eksik
                                            </p>
                                        </div>
                                    )}
                                    <div className={!isQuarterComplete ? 'opacity-30 pointer-events-none select-none' : ''}>
                                        {renderStageGroups('semi', semiGroups, 'Yarı Final', 'bg-blue-500')}
                                    </div>
                                </div>

                                <div className="relative">
                                    {!isSemiComplete && (
                                        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center rounded-xl py-8">
                                            <div className="text-4xl mb-2">🔒</div>
                                            <h3 className="text-lg font-bold text-white mb-1">Final Grubu Kilitli</h3>
                                            <p className="text-slate-400 text-xs text-center max-w-sm">
                                                Final grubunu açmak için Yarı Final gruplarını tamamlayın.
                                            </p>
                                            <p className="text-blue-400 text-sm font-medium mt-2">
                                                {24 - semiMatchCount} / 24 maç eksik
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
                                {remainingGroupMatchesCount} maç eksik
                            </p>
                            <Link href="/2lig/tahminoyunu" className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-colors">
                                Tahminleri Tamamla →
                            </Link>
                        </div>
                        <div className="opacity-30 pointer-events-none select-none space-y-12">
                            {renderStageGroups('quarter', quarterGroups, 'Çeyrek Final', 'bg-amber-500')}
                            {renderStageGroups('semi', semiGroups, 'Yarı Final', 'bg-blue-500')}
                            {renderStageGroups('final', finalGroups, 'Final Grubu', 'bg-emerald-500')}
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}

```

## File: app\2lig\playoffs\[stage]\[groupId]\page.tsx
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
    generateQuarterGroups,
    generateSemiGroups,
    generateFinalGroups,
    generateGroupFixture,
    applyOverridesToGroups
} from "../../../../utils/playoffUtils";

export default function PlayoffGroupDetailPage() {
    const params = useParams();
    const router = useRouter();
    const stage = params.stage as 'quarter' | 'semi' | 'final';
    const groupId = params.groupId as string;

    const [loading, setLoading] = useState(true);
    const [currentGroup, setCurrentGroup] = useState<PlayoffGroup | null>(null);
    const [initialGroup, setInitialGroup] = useState<PlayoffGroup | null>(null); // Stable seed state
    const [groupFixture, setGroupFixture] = useState<PlayoffMatch[]>([]);
    const [overrides, setOverrides] = useState<Record<string, string>>({});
    const [originalFixture, setOriginalFixture] = useState<Match[]>([]);
    const [baseStandings, setBaseStandings] = useState<GroupStanding[]>([]);

    // Auto-save status
    const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'idle'>('idle');
    const [isLoaded, setIsLoaded] = useState(false);
    const [predicting, setPredicting] = useState(false);

    // Initial Rank Map for calculating diffs
    const [initialRanks, setInitialRanks] = useState<Map<string, number>>(new Map());

    // 1. Load Overrides from LocalStorage
    useEffect(() => {
        const saved = localStorage.getItem('playoffScenarios');
        if (saved) {
            try {
                setOverrides(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to load playoff scenarios', e);
            }
        }
        setIsLoaded(true);
    }, []);

    // 2. Fetch Base Data (Once)
    useEffect(() => {
        async function fetchBaseData() {
            try {
                setLoading(true);
                const res = await fetch("/api/scrape");
                if (!res.ok) throw new Error("Veri çekilemedi");
                const data = await res.json();
                setOriginalFixture(data.fixture);
                const standings = calculateGroupStandings(data.teams);
                setBaseStandings(standings);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchBaseData();
    }, []);

    // 3. Auto-save effect
    useEffect(() => {
        if (!isLoaded) return;

        setSaveStatus('saving');
        const timer = setTimeout(() => {
            localStorage.setItem('playoffScenarios', JSON.stringify(overrides));
            setSaveStatus('saved');
        }, 500);

        return () => clearTimeout(timer);
    }, [overrides, isLoaded]);

    // 4. Core Simulation Logic - Runs when Data is Ready OR Overrides Change OR Stage/Group Changes
    useEffect(() => {
        if (!originalFixture.length || !baseStandings.length) return;

        // Reconstruct the playoff tree to get to *this* group state
        const quarters = generateQuarterGroups(baseStandings, originalFixture);

        let targetGroups: PlayoffGroup[] = [];

        if (stage === 'quarter') {
            targetGroups = quarters;
        } else if (stage === 'semi') {
            const updatedQuarters = applyOverridesToGroups(quarters, overrides, 'quarter');
            targetGroups = generateSemiGroups(updatedQuarters);
        } else if (stage === 'final') {
            const updatedQuarters = applyOverridesToGroups(quarters, overrides, 'quarter');
            const semis = generateSemiGroups(updatedQuarters);
            const updatedSemis = applyOverridesToGroups(semis, overrides, 'semi');
            targetGroups = generateFinalGroups(updatedSemis);
        }

        const foundGroup = targetGroups.find(g => g.groupName === groupId);

        if (foundGroup) {
            // Only set initialGroup if it's the first derivation for this specific group/stage context
            // actually, we want initialGroup to be the 'base' state of this group before internal overrides are applied
            // But 'foundGroup' ALREADY has incoming overrides applied (e.g. from Quarter finals)
            // So foundGroup IS the seed for this stage.

            // We only want to set initialGroup if it changes significantly (e.g. different teams)
            // But simple equality check is complex.
            // Let's rely on re-calculating it.

            setInitialGroup(foundGroup);

            const rankMap = new Map<string, number>();
            foundGroup.teams.forEach((t, i) => rankMap.set(t.name, i + 1));
            setInitialRanks(rankMap);

            // Now apply *internal* overrides for *this* stage to this group
            const updatedGroupArray = applyOverridesToGroups([foundGroup], overrides, stage);
            setCurrentGroup(updatedGroupArray[0]);

            const fixture = generateGroupFixture([foundGroup], stage);
            setGroupFixture(fixture);
        }

    }, [baseStandings, originalFixture, overrides, stage, groupId]);


    function handleScoreSelect(matchId: string, score: string | null) {
        setOverrides(prev => {
            const next = { ...prev };
            if (score === null) {
                delete next[matchId];
            } else {
                next[matchId] = score;
            }
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
                // Simple random prediction
                const randomScore = scores[Math.floor(Math.random() * scores.length)];
                predictions[match.id] = randomScore;
            });

            setOverrides(prev => ({ ...prev, ...predictions }));

        } catch (e) {
            console.error(e);
        } finally {
            setPredicting(false);
        }
    }

    const getStageInfo = () => {
        switch (stage) {
            case 'quarter': return { title: 'Çeyrek Final', color: 'from-amber-600 to-amber-500', text: 'text-amber-500', nextStage: 'Yarı Final' };
            case 'semi': return { title: 'Yarı Final', color: 'from-blue-600 to-blue-500', text: 'text-blue-500', nextStage: 'Final' };
            case 'final': return { title: 'Final', color: 'from-emerald-600 to-emerald-500', text: 'text-emerald-500', nextStage: 'Şampiyon' };
            default: return { title: 'Play-Off', color: 'from-slate-600 to-slate-500', text: 'text-slate-500', nextStage: '-' };
        }
    };

    const stageInfo = getStageInfo();

    // Quick Navigation Groups
    const stageGroups = {
        quarter: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
        semi: ['A', 'B', 'C', 'D'],
        final: ['1', '2']
    };
    const currentStageGroups = stageGroups[stage] || [];

    // Next Round Projection Logic
    const getNextRoundMapping = (pos: 1 | 2) => {
        if (stage === 'quarter') {
            // Mapping based on official schema:
            // Semi A -> 1. Grup
            // Semi B -> 2. Grup
            // Semi C -> 3. Grup
            // Semi D -> 4. Grup
            // Keys must be Uppercase because URL might be lowercase but internal names are Upper.
            const map: Record<string, { 1: string, 2: string }> = {
                'A': { 1: '1', 2: '4' }, 'B': { 1: '2', 2: '3' },
                'C': { 1: '3', 2: '2' }, 'D': { 1: '4', 2: '1' },
                'E': { 1: '1', 2: '4' }, 'F': { 1: '2', 2: '3' },
                'G': { 1: '3', 2: '2' }, 'H': { 1: '4', 2: '1' }
            };
            const key = groupId.toUpperCase();
            return map[key]?.[pos] || '??';
        }
        if (stage === 'semi') {
            const map: Record<string, { 1: string, 2: string }> = {
                'A': { 1: '1', 2: '2' }, 'B': { 1: '2', 2: '1' },
                'C': { 1: '1', 2: '2' }, 'D': { 1: '2', 2: '1' }
            };
            const key = groupId.toUpperCase();
            return map[key]?.[pos] || '??';
        }
        return '?';
    };

    if (loading) {
        return (
            <main className="h-screen overflow-hidden bg-slate-950 text-slate-100 font-sans flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2 opacity-50"></div>
                </div>
            </main>
        );
    }

    if (!currentGroup) {
        return (
            <main className="h-screen bg-slate-950 text-slate-100 p-4 font-sans flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-lg font-bold text-white mb-2">Grup Bulunamadı</h2>
                    <Link href="/2lig/playoffs" className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded text-xs text-white transition-colors">
                        Geri Dön
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="h-screen overflow-hidden bg-slate-950 text-slate-100 flex flex-col p-2 sm:p-4 font-sans">
            <div className="w-full max-w-[1400px] mx-auto flex flex-col h-full gap-3">

                {/* Header & Nav Row */}
                <div className="flex flex-col sm:flex-row items-center justify-between bg-slate-900 border border-slate-800 rounded-lg p-2 gap-2 flex-shrink-0">
                    <div className="flex items-center gap-3 w-full sm:w-auto overflow-hidden">
                        <Link href="/" className="flex-shrink-0 p-1.5 bg-slate-800 hover:bg-slate-700 rounded transition-colors text-slate-400 hover:text-white text-xs flex items-center gap-1">
                            <span>←</span>
                            <span className="hidden sm:inline">Anasayfaya Dön</span>
                        </Link>
                        <div className="flex-1 min-w-0">
                            <h1 className="text-lg font-bold text-white tracking-tight truncate flex items-center gap-2">
                                <span className={`${stageInfo.text}`}>{stageInfo.title}</span>
                                <span className="text-slate-600">|</span>
                                <span>Grup {currentGroup.groupName}</span>
                                <span className="text-xs font-normal text-slate-500 hidden sm:inline-block">- Play-Off Senaryo</span>
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto scrollbar-hide">
                        {/* Quick Nav */}
                        <div className="flex items-center gap-1 bg-slate-950/50 p-1 rounded-md">
                            {currentStageGroups.map(gId => {
                                const isActive = gId === groupId;
                                return (
                                    <Link
                                        key={gId}
                                        href={`/2lig/playoffs/${stage}/${gId}`}
                                        replace
                                        className={`px-2.5 py-1 text-xs font-bold rounded transition-all ${isActive
                                            ? `bg-gradient-to-r ${stageInfo.color} text-white shadow`
                                            : 'text-slate-500 hover:bg-slate-800 hover:text-slate-300'
                                            }`}
                                    >
                                        {gId}
                                    </Link>
                                )
                            })}
                        </div>

                        <div className="w-px h-6 bg-slate-800 mx-1 flex-shrink-0"></div>

                        <button
                            onClick={() => {
                                const groupMatches = groupFixture.map(m => m.id);
                                setOverrides(prev => {
                                    const next = { ...prev };
                                    groupMatches.forEach(id => delete next[id]);
                                    return next;
                                });
                            }}
                            className="px-2 py-1 bg-slate-800 hover:bg-rose-900/30 text-rose-400 hover:text-rose-300 text-xs rounded transition-colors whitespace-nowrap"
                        >
                            Sıfırla
                        </button>
                    </div>
                </div>

                {/* Main Content Area - Auto Height */}
                <div className="grid lg:grid-cols-12 gap-3 flex-1 min-h-0">

                    {/* Left Column: Standings + Projection (5 Cols) */}
                    <div className="lg:col-span-5 flex flex-col h-full gap-3">
                        {/* Standings */}
                        <div className="flex flex-col gap-0 min-h-0">
                            <div className={`bg-gradient-to-r ${stageInfo.color} px-3 py-1.5 rounded-t-lg shadow`}>
                                <h2 className="text-xs font-bold text-white text-center tracking-wide">PUAN DURUMU</h2>
                            </div>
                            <div className="bg-slate-900 border border-slate-800 rounded-b-lg overflow-x-auto">
                                <table className="w-full text-xs text-left table-fixed">
                                    <thead className="bg-slate-800 text-slate-400 uppercase text-[9px]">
                                        <tr>
                                            <th className="px-1 py-2 w-6 text-center">#</th>
                                            <th className="px-2 py-2 text-left w-auto">Takım</th>
                                            <th className="px-1 py-1 text-center w-6" title="Oynanan">O</th>
                                            <th className="px-1 py-1 text-center w-6" title="Galibiyet">G</th>
                                            <th className="px-1 py-1 text-center w-6" title="Mağlubiyet">M</th>
                                            <th className="px-1 py-1 text-center w-7 font-bold text-slate-200" title="Puan">P</th>
                                            <th className="px-1 py-1 text-center w-6" title="Alınan">AS</th>
                                            <th className="px-1 py-1 text-center w-6" title="Verilen">VS</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/50">
                                        {currentGroup.teams.map((team, idx) => {
                                            const isQualifying = idx < 2;
                                            const oldRank = initialRanks.get(team.name);
                                            const currentRank = idx + 1;
                                            const hasMatches = groupFixture.some(m => overrides[m.id]);

                                            let diffIcon = null;
                                            if (hasMatches && oldRank) {
                                                const diff = oldRank - currentRank;
                                                if (diff > 0) diffIcon = <span className="text-emerald-500 text-[9px]">▲</span>;
                                                else if (diff < 0) diffIcon = <span className="text-rose-500 text-[9px]">▼</span>;
                                            }

                                            return (
                                                <tr key={team.name} className={`hover:bg-slate-800/50 transition-colors ${isQualifying ? 'bg-emerald-950/10' : ''}`}>
                                                    <td className="px-1 py-1.5 text-slate-500 text-center relative">
                                                        <span className={`text-sm font-medium ${isQualifying ? 'text-emerald-400' : 'text-slate-500'}`}>{idx + 1}</span>
                                                        {diffIcon && <div className="absolute top-0.5 right-0">{diffIcon}</div>}
                                                    </td>
                                                    <td className="px-2 py-1.5">
                                                        <div className="font-semibold text-white text-xs truncate leading-tight w-24 sm:w-auto" title={team.name}>{team.name}</div>
                                                        <div className="text-[9px] text-slate-500 truncate mt-0.5">{team.sourceGroup}</div>
                                                    </td>
                                                    <td className="px-1 py-1.5 text-center text-slate-400">{team.scenarioPlayed}</td>
                                                    <td className="px-1 py-1.5 text-center text-emerald-400">{team.scenarioWins}</td>
                                                    <td className="px-1 py-1.5 text-center text-rose-400">{team.scenarioLosses}</td>
                                                    <td className="px-1 py-1.5 text-center font-bold text-white text-sm bg-slate-800/30 rounded">{team.scenarioPoints}</td>
                                                    <td className="px-1 py-1.5 text-center text-slate-500">{team.scenarioSetsWon}</td>
                                                    <td className="px-1 py-1.5 text-center text-slate-500">{team.scenarioSetsLost}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                                <div className="p-1.5 text-[9px] text-slate-600 text-center border-t border-slate-800/50">
                                    İlk 2 takım bir sonraki tura yükselir.
                                </div>
                            </div>
                        </div>

                        {/* Next Round Projection */}
                        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 flex-1">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3 text-center border-b border-slate-800/50 pb-2">
                                🔮 {stageInfo.nextStage} Yolculuğu
                            </h3>
                            <div className="space-y-2">
                                {/* 1st Place */}
                                <div className={`flex items-center gap-3 p-2 rounded-lg border ${stage === 'final' ? 'bg-amber-500/10 border-amber-500/30' : 'bg-emerald-950/10 border-emerald-900/30'}`}>
                                    <div className={`w-6 h-6 flex items-center justify-center rounded text-xs font-bold ${stage === 'final' ? 'bg-amber-500/20 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'}`}>1</div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-xs font-bold text-white truncate">{currentGroup.teams[0]?.name || '-'}</div>
                                        <div className={`text-[10px] ${stage === 'final' ? 'text-amber-400 font-bold' : 'text-emerald-400'}`}>
                                            {stage === 'final' ? '1. Lige Yükselir 🏆' : `Yarı Final ${getNextRoundMapping(1)}. Grup'a gider`}
                                        </div>
                                    </div>
                                    <div className="text-xl opacity-20">{stage === 'final' ? '🥇' : '✈️'}</div>
                                </div>

                                {/* 2nd Place */}
                                <div className={`flex items-center gap-3 p-2 rounded-lg border ${stage === 'final' ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-slate-800/30 border-slate-700/30'}`}>
                                    <div className={`w-6 h-6 flex items-center justify-center rounded text-xs font-bold ${stage === 'final' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-slate-700/50 text-slate-400'}`}>2</div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-xs font-semibold text-slate-300 truncate">{currentGroup.teams[1]?.name || '-'}</div>
                                        <div className={`text-[10px] ${stage === 'final' ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
                                            {stage === 'final' ? '1. Lige Yükselir 🏆' : `Yarı Final ${getNextRoundMapping(2)}. Grup'a gider`}
                                        </div>
                                    </div>
                                    <div className="text-xl opacity-20">{stage === 'final' ? '🥈' : '✈️'}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Fixtures (7 Cols) */}
                    <div className="lg:col-span-7 flex flex-col h-full gap-2 min-h-0">
                        <div className="flex items-center justify-between px-1">
                            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Maç Fikstürü</h2>
                            <button
                                onClick={predictGroupMatches}
                                disabled={predicting}
                                className="px-2 py-1 bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 hover:text-white border border-purple-500/30 disabled:opacity-50 text-[10px] rounded transition-colors flex items-center gap-1.5"
                            >
                                {predicting ? <span className="animate-spin">⏳</span> : '🔮'}
                                {predicting ? '...' : 'Tümünü Tahmin Et'}
                            </button>
                        </div>

                        {/* Fixture Grid - Scrollable if needed, but designed to fit */}
                        <div className="flex-1 overflow-y-auto min-h-0 pr-1">
                            <div className="grid grid-cols-1 gap-2 pb-2">
                                {groupFixture.map((match, mIdx) => {
                                    const currentScore = overrides[match.id];
                                    return (
                                        <div key={match.id} className="bg-slate-900 border border-slate-800 rounded p-2 hover:border-slate-700 transition-colors group flex items-center gap-3">
                                            {/* Match Index */}
                                            <div className="text-[9px] font-bold text-slate-600 w-4 text-center shrink-0">
                                                {mIdx + 1}.
                                            </div>

                                            <div className="flex-1 flex flex-col gap-1.5 min-w-0">
                                                {/* Teams Row */}
                                                <div className="flex items-center justify-between text-[11px] leading-tight">
                                                    <div className="w-[45%] text-right font-medium text-slate-300 truncate" title={match.homeTeam}>{match.homeTeam}</div>
                                                    <div className="text-[9px] text-slate-600 font-mono shrink-0">v</div>
                                                    <div className="w-[45%] text-left font-medium text-slate-300 truncate" title={match.awayTeam}>{match.awayTeam}</div>
                                                </div>

                                                {/* Scores Row */}
                                                <div className="flex justify-center gap-1">
                                                    {SCORES.map(score => {
                                                        const isSelected = currentScore === score;
                                                        const [h, a] = score.split('-').map(Number);
                                                        const homeWin = h > a;

                                                        return (
                                                            <button
                                                                key={score}
                                                                onClick={() => handleScoreSelect(match.id, isSelected ? null : score)}
                                                                className={`w-8 h-5 flex items-center justify-center rounded-[3px] text-[9px] font-bold transition-all border ${isSelected
                                                                    ? homeWin
                                                                        ? 'bg-emerald-600 border-emerald-500 text-white'
                                                                        : 'bg-rose-600 border-rose-500 text-white'
                                                                    : 'bg-slate-950 border-slate-800 text-slate-500 hover:bg-slate-800 hover:text-slate-300'
                                                                    }`}
                                                            >
                                                                {score}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    );
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

## File: app\2lig\stats\page.tsx
```
import { Metadata } from "next";
import { getLeagueData } from "../../utils/serverData";
import TwoLigStatsClient from "./TwoLigStatsClient";

export const metadata: Metadata = {
    title: "2. Lig İstatistikler",
    description: "Kadınlar 2. Lig takım istatistikleri ve performans analizleri. 5 grup detaylı veriler.",
    openGraph: {
        title: "2. Lig İstatistikler | VolleySimulator",
        description: "2. Lig takım istatistikleri ve performans analizleri.",
    },
};

export default async function TwoLigStatsPage() {
    const { teams } = await getLeagueData("2lig");

    return (
        <TwoLigStatsClient initialTeams={teams} />
    );
}

```

## File: app\2lig\stats\TwoLigStatsClient.tsx
```
"use client";

import { useState, useMemo } from "react";
import { TeamStats } from "../../types";

import TeamAvatar from "@/app/components/TeamAvatar";

interface TwoLigStatsClientProps {
    initialTeams: TeamStats[];
}

interface ExtendedTeamStats extends TeamStats {
    losses: number;
    winRate: number;
    setRatioDisplay: string;
}

export default function TwoLigStatsClient({ initialTeams }: TwoLigStatsClientProps) {
    const [activeTab, setActiveTab] = useState("GENEL");

    const groups = useMemo(() => {
        return Array.from(new Set(initialTeams.map((t: TeamStats) => t.groupName)))
            .sort((a: string, b: string) => {
                const numA = parseInt(a) || 0;
                const numB = parseInt(b) || 0;
                if (numA === numB) return a.localeCompare(b);
                return numA - numB;
            }) as string[];
    }, [initialTeams]);

    const filteredTeams = useMemo(() => activeTab === "GENEL"
        ? initialTeams
        : initialTeams.filter(t => t.groupName === activeTab), [initialTeams, activeTab]);

    const teamsWithStats = useMemo(() => filteredTeams.map(t => ({
        ...t,
        losses: (t.played || 0) - (t.wins || 0),
        winRate: (t.played || 0) > 0 ? Math.round(((t.wins || 0) / (t.played || 0)) * 100) : 0,
        setRatioDisplay: (t.setsLost || 0) > 0 ? ((t.setsWon || 0) / (t.setsLost || 0)).toFixed(2) : (t.setsWon || 0).toString()
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

    return (
        <main className="min-h-screen bg-slate-950 text-slate-100 p-2 sm:p-4 font-sans">
            <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
                <div className="flex flex-col gap-1 px-1">
                    <h1 className="font-bold text-white text-lg tracking-tight leading-none hidden sm:block">2. Lig İstatistikleri</h1>
                    <p className="text-[10px] text-slate-400 hidden sm:block">Kadınlar 2. Ligi İstatistik Merkezi</p>
                </div>

                <div className="flex bg-slate-900/50 p-1 rounded-xl border border-slate-800/50 overflow-x-auto no-scrollbar snap-x">
                    <button
                        onClick={() => setActiveTab("GENEL")}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap snap-start ${activeTab === "GENEL"
                            ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                            : "text-slate-400 hover:text-white hover:bg-slate-800"
                            }`}
                    >
                        GENEL İSTATİSTİKLER
                    </button>
                    {groups.map(group => (
                        <button
                            key={group}
                            onClick={() => setActiveTab(group)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ml-1 snap-start ${activeTab === group
                                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                                : "text-slate-400 hover:text-white hover:bg-slate-800"
                                }`}
                        >
                            {group}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                    <div className="bg-gradient-to-br from-emerald-600/20 to-emerald-900/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-emerald-600/30 text-center">
                        <div className="text-2xl sm:text-4xl font-bold text-emerald-400">{Math.round(totalMatches)}</div>
                        <div className="text-[10px] sm:text-xs text-emerald-400/70 uppercase tracking-wider mt-1">Toplam Maç</div>
                    </div>
                    <div className="bg-gradient-to-br from-teal-600/20 to-teal-900/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-teal-600/30 text-center">
                        <div className="text-2xl sm:text-4xl font-bold text-teal-400">{totalSets}</div>
                        <div className="text-[10px] sm:text-xs text-teal-400/70 uppercase tracking-wider mt-1">Toplam Set</div>
                    </div>
                    <div className="bg-gradient-to-br from-cyan-600/20 to-cyan-900/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-cyan-600/30 text-center">
                        <div className="text-2xl sm:text-4xl font-bold text-cyan-400">{avgPointsPerTeam}</div>
                        <div className="text-[10px] sm:text-xs text-cyan-400/70 uppercase tracking-wider mt-1">Ort. Puan</div>
                    </div>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 pb-8">
                    <StatCard
                        title="En Çok Puan"
                        icon="💎"
                        teams={mostPoints}
                        statKey="points"
                        color="bg-emerald-500"
                        gradient="bg-gradient-to-r from-emerald-600 to-teal-600"
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
                        color="bg-cyan-500"
                        gradient="bg-gradient-to-r from-cyan-600 to-blue-600"
                    />
                    <StatCard
                        title="En Az Mağlubiyet"
                        icon="🛡️"
                        teams={leastLosses}
                        statKey="losses"
                        color="bg-green-500"
                        gradient="bg-gradient-to-r from-green-600 to-emerald-600"
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

// Extracted Component
const StatCard = ({ title, icon, teams, statKey, color, gradient, suffix = "" }: {
    title: string; icon: string;
    teams: ExtendedTeamStats[];
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
                                <div className={`h-full ${color} opacity-80`} style={{ '--stat-width': `${Math.min((Number(t[statKey]) / maxValue) * 100, 100)}%`, width: 'var(--stat-width)' } as any}></div>
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

```

## File: app\2lig\tahminoyunu\page.tsx
```
import { Suspense } from "react";
import { Metadata } from "next";
import { getLeagueData } from "../../utils/serverData";
import TwoLigCalculatorClient from "./TwoLigCalculatorClient";
import ErrorBoundary from "../../components/ErrorBoundary";
import { SkeletonPage } from "../../components/Skeleton";

export const metadata: Metadata = {
    title: "2. Lig Tahmin Oyunu",
    description: "Kadınlar 2. Lig maç sonuçlarını tahmin edin. 5 gruplu sistemde takımların maçlarını tahmin ederek puan kazanın.",
    openGraph: {
        title: "2. Lig Tahmin Oyunu | VolleySimulator",
        description: "2. Lig maç sonuçlarını tahmin edin ve liderlik tablosunda yerinizi alın.",
    },
};

export default async function TwoLigTahminOyunuPage() {
    const { teams, fixture } = await getLeagueData("2lig");

    return (
        <ErrorBoundary>
            <Suspense fallback={<SkeletonPage />}>
                <TwoLigCalculatorClient
                    initialTeams={teams}
                    initialMatches={fixture}
                />
            </Suspense>
        </ErrorBoundary>
    );
}

```

## File: app\2lig\tahminoyunu\TwoLigCalculatorClient.tsx
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

interface TwoLigCalculatorClientProps {
    initialTeams: TeamStats[];
    initialMatches: Match[];
}

export default function TwoLigCalculatorClient({ initialTeams, initialMatches }: TwoLigCalculatorClientProps) {
    const { showToast, showUndoToast } = useToast();
    const searchParams = useSearchParams();
    const groupParam = searchParams.get("group");
    const standingsRef = useRef<HTMLDivElement>(null);

    // Normalize data (Matching original fetchData logic)
    const normalizedData = useMemo(() => {
        const teamsData: any[] = initialTeams.filter((item: any) => item.name && !item.homeTeam);
        const matchesData: any[] = initialMatches;

        return { teams: teamsData, matches: matchesData };
    }, [initialTeams, initialMatches]);

    // Data State
    const [allTeams] = useState<TeamStats[]>(normalizedData.teams);
    const [allMatches] = useState<Match[]>(normalizedData.matches);
    const groups = useMemo(() => [...new Set(normalizedData.teams.map(t => t.groupName))].sort((a: any, b: any) => {
        const numA = parseInt(a.match(/\d+/)?.[0] || "0");
        const numB = parseInt(b.match(/\d+/)?.[0] || "0");
        return numA - numB;
    }), [normalizedData.teams]);

    // UI State
    const [selectedGroup, setSelectedGroup] = useState<string>(groupParam && groups.includes(groupParam) ? groupParam : (groups[0] || "1. GRUP"));
    const [overrides, setOverrides] = useState<Record<string, string>>({});
    const [showAchievements, setShowAchievements] = useState(false);
    const [showAutoMenu, setShowAutoMenu] = useState(false);
    const [showResetMenu, setShowResetMenu] = useState(false);
    const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);

    // Game State
    const { gameState, addXP, recordPrediction, unlockAchievement, hasAchievement } = useGameState();

    // Load saved scenarios on mount
    useEffect(() => {
        const saved = localStorage.getItem('groupScenarios');
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
        const saved = localStorage.getItem('groupScenarios');
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
        localStorage.setItem('groupScenarios', JSON.stringify(newGlobalObj));
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
        localStorage.removeItem('groupScenarios');
        showUndoToast("Tüm 2. Lig tahminleri sıfırlandı", () => {
            setOverrides(previousOverrides);
            localStorage.setItem('groupScenarios', JSON.stringify(previousOverrides));
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
                league: '2. Lig',
                groupScenarios: JSON.parse(localStorage.getItem('groupScenarios') || '{}'),
                date: new Date().toISOString()
            };
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
            const a = document.createElement('a');
            a.href = dataStr;
            a.download = `senaryo-${new Date().toLocaleDateString('tr-TR')}.json`;
            a.click();
            showToast("Senaryo indirildi", "success");
        } catch (e) { console.error(e); }
    };

    const handleScrollToNextMatch = () => {
        const nextMatch = activeMatches.find(m => !m.isPlayed && !overrides[`${m.homeTeam}-${m.awayTeam}`]);
        if (nextMatch) {
            const id = `match-${nextMatch.homeTeam}-${nextMatch.awayTeam}`;
            const el = document.getElementById(id);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                el.classList.add('ring-2', 'ring-emerald-500');
                setTimeout(() => el.classList.remove('ring-2', 'ring-emerald-500'), 2000);
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
                    localStorage.setItem('groupScenarios', JSON.stringify(convertedScenarios));
                    let flat: Record<string, string> = {};
                    Object.values(convertedScenarios).forEach((obj: any) => flat = { ...flat, ...obj });
                    setOverrides(flat);
                }
                showToast("Senaryo yüklendi", "success");
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
                            <h1 className="font-bold text-white text-lg tracking-tight leading-none hidden sm:block">Kadınlar 2. Lig</h1>
                            <p className="text-[10px] text-slate-400 hidden sm:block">Tahmin Oyunu</p>
                        </div>
                        <div className="flex gap-2 items-center w-full sm:w-auto">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest hidden sm:inline whitespace-nowrap">GRUP:</span>
                            <select
                                value={activeGroup}
                                onChange={(e) => setSelectedGroup(e.target.value)}
                                title="Grup Seçin"
                                className="flex-1 sm:flex-none px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg border border-slate-700 hover:border-slate-600 outline-none cursor-pointer transition-all focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                            >
                                {groups.map(groupName => (
                                    <option key={groupName} value={groupName} className="bg-slate-900 text-white py-2">
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
                                    <span className="hidden sm:inline">Otomatik</span>
                                    <span className="text-[8px] ml-0.5">▼</span>
                                </button>
                                {showAutoMenu && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setShowAutoMenu(false)}></div>
                                        <div className="absolute top-full right-0 sm:left-auto sm:right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                            <button
                                                onClick={() => { handleSimulateSmart(); setShowAutoMenu(false); }}
                                                className="w-full text-left px-4 py-3 hover:bg-slate-800 transition-colors flex items-center gap-3 border-b border-slate-800"
                                            >
                                                <div>
                                                    <div className="text-xs font-bold text-white">Güç Dengelerine Göre</div>
                                                    <div className="text-[9px] text-slate-400">Takım güçlerine göre gerçekçi tahmin</div>
                                                </div>
                                            </button>
                                            <button
                                                onClick={() => { handleSimulateRandom(); setShowAutoMenu(false); }}
                                                className="w-full text-left px-4 py-3 hover:bg-slate-800 transition-colors flex items-center gap-3"
                                            >
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
                                id="import-upload-2lig"
                            />
                            <label
                                htmlFor="import-upload-2lig"
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
                            <StandingsTable teams={liveStandings} initialRanks={initialRanks} compact={true} />
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <FixtureList
                            matches={activeMatches}
                            overrides={overrides}
                            onScoreChange={handleScoreChange}
                            teamRanks={currentRanks}
                            totalTeams={activeTeams.length}
                            relegationSpots={2}
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

