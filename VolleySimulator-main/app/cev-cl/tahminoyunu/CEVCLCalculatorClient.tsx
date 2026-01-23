"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { TeamStats, Match, Achievement } from "@/app/types";
import { useToast, AchievementToast, AchievementsPanel } from "../../components";
import StandingsTable from "../../components/Calculator/StandingsTable";
import FixtureList from "../../components/Calculator/FixtureList";
import RankingTables from "../../components/RankingTables";
import { calculateLiveStandings } from "../../utils/calculatorUtils";
import { useGameState, ACHIEVEMENTS } from "../../utils/gameState";
import { sounds } from "../../utils/sounds";
import { RankingsData } from "../../utils/serverData";

interface CEVCLCalculatorClientProps {
    initialTeams: TeamStats[];
    initialMatches: Match[];
    rankings?: RankingsData;
}

export default function CEVCLCalculatorClient({ initialTeams, initialMatches, rankings }: CEVCLCalculatorClientProps) {
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
    const [showRankings, setShowRankings] = useState(false);

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

    // Auto-fill remaining matches based on team strength (rankings)
    const handleAutoFill = (mode: 'favorites' | 'random') => {
        const newOverrides = { ...overrides };
        const unplayedMatches = allMatches.filter(m => !m.isPlayed && !overrides[`${m.homeTeam}-${m.awayTeam}`]);

        if (unplayedMatches.length === 0) {
            showToast("Tüm maçlar zaten tahmin edilmiş!", "info");
            return;
        }

        unplayedMatches.forEach(match => {
            const matchId = `${match.homeTeam}-${match.awayTeam}`;

            if (mode === 'favorites') {
                // Use team rankings to predict: higher ranked team wins 3-1
                const homeRank = liveStandings.findIndex(t => t.name === match.homeTeam);
                const awayRank = liveStandings.findIndex(t => t.name === match.awayTeam);

                // Home advantage + ranking comparison
                if (homeRank !== -1 && awayRank !== -1) {
                    if (homeRank < awayRank) {
                        newOverrides[matchId] = "3-1"; // Home wins
                    } else if (homeRank > awayRank) {
                        newOverrides[matchId] = "1-3"; // Away wins
                    } else {
                        newOverrides[matchId] = "3-2"; // Home wins close match
                    }
                } else {
                    newOverrides[matchId] = "3-1"; // Default home win
                }
            } else {
                // Random mode
                const scores = ["3-0", "3-1", "3-2", "2-3", "1-3", "0-3"];
                newOverrides[matchId] = scores[Math.floor(Math.random() * scores.length)];
            }

            // Add XP for each prediction
            addXP(5);
            recordPrediction(true);
        });

        setOverrides(newOverrides);
        sounds.achievement();
        showToast(`${unplayedMatches.length} maç otomatik dolduruldu!`, "success");
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
                            {/* Theme Toggle */}
                            <button
                                onClick={() => document.documentElement.classList.toggle('light')}
                                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold rounded-lg transition-all border border-slate-700"
                                title="Tema Değiştir"
                            >
                                🌙
                            </button>
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
                            {/* Auto-fill Dropdown */}
                            <div className="relative group">
                                <button
                                    className="px-3 py-1.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1 shadow-lg shadow-green-900/20"
                                    title="Kalan maçları otomatik doldur"
                                >
                                    <span>⚡</span>
                                    <span className="hidden sm:inline">Otomatik Doldur</span>
                                    <span className="text-[8px] ml-0.5">▼</span>
                                </button>
                                <div className="absolute top-full right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-xl overflow-hidden z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                                    <button
                                        onClick={() => handleAutoFill('favorites')}
                                        className="w-full text-left px-4 py-3 hover:bg-green-900/20 transition-colors flex items-center gap-3 border-b border-slate-800"
                                    >
                                        <span className="text-lg">🏆</span>
                                        <div>
                                            <div className="text-xs font-bold text-white">Favorilere Göre</div>
                                            <div className="text-[9px] text-slate-400">Sıralamaya göre tahmin et</div>
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => handleAutoFill('random')}
                                        className="w-full text-left px-4 py-3 hover:bg-purple-900/20 transition-colors flex items-center gap-3"
                                    >
                                        <span className="text-lg">🎲</span>
                                        <div>
                                            <div className="text-xs font-bold text-white">Rastgele</div>
                                            <div className="text-[9px] text-slate-400">Şansına bırak!</div>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Ranking Tables Toggle */}
            {rankings && (
                <div className="flex flex-col gap-2">
                    <button
                        onClick={() => setShowRankings(!showRankings)}
                        className={`w-full py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${showRankings
                            ? "bg-blue-600 text-white"
                            : "bg-gradient-to-r from-blue-900/30 to-indigo-900/30 text-blue-400 border border-blue-800/50 hover:border-blue-600"
                            }`}
                    >
                        <span>{showRankings ? "🏆 Sıralamaları Gizle" : "🏆 Havuz Sıralamalarını Göster"}</span>
                        <span className="text-xs opacity-70">(1., 2., 3. sıralar)</span>
                    </button>

                    {showRankings && (
                        <div className="animate-in slide-in-from-top-2 duration-300">
                            <RankingTables rankings={rankings} />
                        </div>
                    )}
                </div>
            )}

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

            {
                newAchievement && (
                    <AchievementToast
                        achievement={newAchievement}
                        onClose={() => setNewAchievement(null)}
                    />
                )
            }
            <AchievementsPanel
                isOpen={showAchievements}
                onClose={() => setShowAchievements(false)}
            />
        </main >
    );
}
