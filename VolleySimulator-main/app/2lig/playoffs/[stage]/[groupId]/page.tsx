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
