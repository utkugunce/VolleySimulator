"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { TeamStats, Match, Achievement } from "@/app/types";
import { useToast, AchievementToast, AchievementsPanel } from "../../components";
import StandingsTable from "../../components/Calculator/StandingsTable";
import FixtureList from "../../components/Calculator/FixtureList";
import ShareButton from "../../components/ShareButton";
import { calculateLiveStandings } from "../../utils/calculatorUtils";
import { useGameState, ACHIEVEMENTS } from "../../utils/gameState";
import { sounds } from "../../utils/sounds";

interface CEVCLCalculatorClientProps {
    initialTeams: TeamStats[];
    initialMatches: Match[];
}

export default function CEVCLCalculatorClient({ initialTeams, initialMatches }: CEVCLCalculatorClientProps) {
    const { showToast, showUndoToast } = useToast();
    const standingsRef = useRef<HTMLDivElement>(null);

    // Normalize data (Matching original fetchData logic)
    const normalizedTeams = useMemo(() => initialTeams.map((t: any) => ({
        ...t,
        name: t.name.toLocaleUpperCase('tr-TR'),
        groupName: t.groupName.replace('Pool ', '') + ' GRUBU'
    })), [initialTeams]);

    const normalizedMatches = useMemo(() => initialMatches.map((m: any) => ({
        ...m,
        matchDate: m.date || m.matchDate,
        homeTeam: m.homeTeam.toLocaleUpperCase('tr-TR'),
        awayTeam: m.awayTeam.toLocaleUpperCase('tr-TR'),
        groupName: m.groupName.replace('Pool ', '') + ' GRUBU'
    })), [initialMatches]);

    // Data State
    const [allTeams] = useState<TeamStats[]>(normalizedTeams);
    const [allMatches] = useState<Match[]>(normalizedMatches);
    const [selectedPool, setSelectedPool] = useState<string>("A GRUBU");

    // UI State
    const [overrides, setOverrides] = useState<Record<string, string>>({});
    const [showAchievements, setShowAchievements] = useState(false);
    const [showResetMenu, setShowResetMenu] = useState(false);
    const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);

    // Game State
    const { gameState, addXP, recordPrediction, unlockAchievement, hasAchievement } = useGameState();

    const pools = ["A GRUBU", "B GRUBU", "C GRUBU", "D GRUBU", "E GRUBU"];

    // Load saved scenarios on mount
    useEffect(() => {
        const saved = localStorage.getItem('cevclGroupScenarios');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setOverrides(parsed);
            } catch (e) { console.error(e); }
        }
    }, []);

    // Filter by selected pool
    const poolTeams = useMemo(() =>
        allTeams.filter(t => t.groupName === selectedPool),
        [allTeams, selectedPool]
    );

    const poolMatches = useMemo(() =>
        allMatches.filter(m => m.groupName === selectedPool),
        [allMatches, selectedPool]
    );

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
        localStorage.setItem('cevclGroupScenarios', JSON.stringify(overrides));
    }, [overrides]);

    const handleResetGroup = () => {
        if (!confirm(`${selectedPool} tahminleriniz silinecek. Emin misiniz?`)) return;
        const newOverrides = { ...overrides };
        const groupMatches = allMatches
            .filter(m => m.groupName === selectedPool)
            .map(m => `${m.homeTeam}-${m.awayTeam}`);
        groupMatches.forEach(matchId => {
            delete newOverrides[matchId];
        });
        setOverrides(newOverrides);
        showToast(`${selectedPool} tahminleri sıfırlandı`, "success");
    };

    const handleResetAll = () => {
        const previousOverrides = { ...overrides };
        setOverrides({});
        localStorage.removeItem('cevclGroupScenarios');
        showUndoToast("Şampiyonlar Ligi tahminleri sıfırlandı", () => {
            setOverrides(previousOverrides);
            localStorage.setItem('cevclGroupScenarios', JSON.stringify(previousOverrides));
        });
    };

    // Memoize standings calculations for current pool
    const initialStandings = useMemo(() =>
        calculateLiveStandings(poolTeams, poolMatches, {}),
        [poolTeams, poolMatches]
    );

    const initialRanks = useMemo(() => {
        const ranks = new Map<string, number>();
        initialStandings.forEach((team, idx) => ranks.set(team.name, idx + 1));
        return ranks;
    }, [initialStandings]);

    const liveStandings = useMemo(() =>
        calculateLiveStandings(poolTeams, poolMatches, overrides),
        [poolTeams, poolMatches, overrides]
    );

    const currentRanks = useMemo(() => {
        const ranks = new Map<string, number>();
        liveStandings.forEach((team, idx) => ranks.set(team.name, idx + 1));
        return ranks;
    }, [liveStandings]);

    const handleScrollToNextMatch = () => {
        const nextMatch = poolMatches.find(m => !m.isPlayed && !overrides[`${m.homeTeam}-${m.awayTeam}`]);
        if (nextMatch) {
            const id = `match-${nextMatch.homeTeam}-${nextMatch.awayTeam}`;
            const el = document.getElementById(id);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                el.classList.add('ring-2', 'ring-blue-500');
                setTimeout(() => el.classList.remove('ring-2', 'ring-blue-500'), 2000);
            }
        }
    };

    return (
        <main className="min-h-screen bg-slate-950 text-slate-100 p-1 sm:p-2 font-sans">
            <div className="w-full max-w-7xl mx-auto flex flex-col h-full gap-2">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-900/50 to-indigo-900/50 border border-slate-800 rounded-xl p-3">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div>
                                <h1 className="font-bold text-white text-lg tracking-tight">CEV Şampiyonlar Ligi</h1>
                                <p className="text-[10px] text-slate-400">Tahmin Oyunu • 2025-2026</p>
                            </div>
                        </div>

                        {/* Navigation in Header */}
                        <div className="flex items-center gap-2">
                            <a
                                href="/cev-cl/tahminoyunu"
                                className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg"
                            >
                                Tahmin
                            </a>
                            <a
                                href="/cev-cl/playoffs"
                                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold rounded-lg transition-all border border-slate-700"
                            >
                                Playoffs
                            </a>
                            <a
                                href="/ayarlar"
                                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold rounded-lg transition-all border border-slate-700"
                            >
                                Ayarlar
                            </a>
                        </div>
                    </div>
                </div>

                {/* Action Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-2 bg-slate-900/40 rounded-xl border border-slate-800">
                    <div className="flex gap-2 items-center w-full sm:w-auto">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest hidden sm:inline whitespace-nowrap">GRUP:</span>
                        <select
                            value={selectedPool}
                            onChange={(e) => setSelectedPool(e.target.value)}
                            aria-label="Grup Seçin"
                            className="appearance-none bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg px-4 py-2 border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none cursor-pointer min-w-[120px]"
                        >
                            {pools.map(pool => (
                                <option key={pool} value={pool} className="bg-slate-900">
                                    {pool}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto pb-1 sm:pb-0 justify-end flex-wrap sm:flex-nowrap">
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
                                                    <div className="text-[9px] text-slate-400">Sadece {selectedPool} silinir</div>
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
                                playoffSpots={2}
                                secondaryPlayoffSpots={0}
                                relegationSpots={0}
                                initialRanks={initialRanks}
                                compact={true}
                            />
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <FixtureList
                            matches={poolMatches}
                            overrides={overrides}
                            onScoreChange={handleScoreChange}
                            teamRanks={currentRanks}
                            totalTeams={poolTeams.length}
                            relegationSpots={0}
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
