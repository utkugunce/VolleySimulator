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
import PageHeader from "../../../../components/PageHeader";

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
                                            <th className="px-1 py-2 w-6 text-center">#</th>
                                            <th className="px-2 py-2 text-left w-auto">Takım</th>
                                            <th className="px-1 py-1 text-center w-6">O</th>
                                            <th className="px-1 py-1 text-center w-6">G</th>
                                            <th className="px-1 py-1 text-center w-6">M</th>
                                            <th className="px-1 py-1 text-center w-7 font-bold text-slate-200">P</th>
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
