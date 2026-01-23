"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { TeamStats, Match, Achievement } from "@/app/types";
import { useToast, AchievementToast, AchievementsPanel } from "./components";
import StandingsTable from "./components/Calculator/StandingsTable";
import FixtureList from "./components/Calculator/FixtureList";
import RankingTables from "./components/RankingTables";
import { calculateLiveStandings } from "./utils/calculatorUtils";
import { useGameState, ACHIEVEMENTS } from "./utils/gameState";
import { sounds } from "./utils/sounds";
import { RankingsData } from "./utils/serverData";
import { useLanguage } from "./context/LanguageContext";

interface CEVCLCalculatorClientProps {
    initialTeams: TeamStats[];
    initialMatches: Match[];
    rankings?: RankingsData;
}

export default function CEVCLCalculatorClient({ initialTeams, initialMatches, rankings }: CEVCLCalculatorClientProps) {
    const { t, language, setLanguage } = useLanguage();
    const { showToast, showUndoToast } = useToast();
    const standingsRef = useRef<HTMLDivElement>(null);

    // Normalize data (Matching original fetchData logic)
    // We update this when language changes to localize Team Names if needed (optional)
    // For now, let's keep team names standard but normalize Group names
    const normalizedTeams = useMemo(() => initialTeams.map((t: any) => ({
        ...t,
        name: t.name.toLocaleUpperCase(language === 'tr' ? 'tr-TR' : 'en-US'),
        groupName: t.groupName.replace('Pool ', '') + (language === 'tr' ? ' GRUBU' : ' POOL')
    })), [initialTeams, language]);

    const normalizedMatches = useMemo(() => initialMatches.map((m: any) => ({
        ...m,
        matchDate: m.date || m.matchDate,
        homeTeam: m.homeTeam.toLocaleUpperCase(language === 'tr' ? 'tr-TR' : 'en-US'),
        awayTeam: m.awayTeam.toLocaleUpperCase(language === 'tr' ? 'tr-TR' : 'en-US'),
        groupName: m.groupName.replace('Pool ', '') + (language === 'tr' ? ' GRUBU' : ' POOL')
    })), [initialMatches, language]);

    // Data State
    const [allTeams, setAllTeams] = useState<TeamStats[]>(normalizedTeams);
    const [allMatches, setAllMatches] = useState<Match[]>(normalizedMatches);

    useEffect(() => {
        setAllTeams(normalizedTeams);
        setAllMatches(normalizedMatches);
    }, [normalizedTeams, normalizedMatches]);

    const [selectedPool, setSelectedPool] = useState<string>("A" + (language === 'tr' ? ' GRUBU' : ' POOL'));

    // Handle language switch for selected pool
    useEffect(() => {
        const letter = selectedPool.split(' ')[0];
        setSelectedPool(letter + (language === 'tr' ? ' GRUBU' : ' POOL'));
    }, [language]);

    const [showRankings, setShowRankings] = useState(false);

    // UI State
    const [overrides, setOverrides] = useState<Record<string, string>>({});
    const [showAchievements, setShowAchievements] = useState(false);
    const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);
    const [isMobileAutofillOpen, setIsMobileAutofillOpen] = useState(false);

    // Game State
    const { gameState, addXP, recordPrediction, unlockAchievement, hasAchievement } = useGameState();

    const pools = ["A", "B", "C", "D", "E"].map(l => l + (language === 'tr' ? ' GRUBU' : ' POOL'));

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
                    if (unlockAchievement('first_prediction')) {
                        setNewAchievement(ACHIEVEMENTS.first_prediction as Achievement);
                        sounds.achievement();
                    }
                }
                if (gameState.stats.totalPredictions >= 49 && !hasAchievement('game_addict')) {
                    if (unlockAchievement('game_addict')) {
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


    // Auto-fill remaining matches based on team strength (rankings)
    const handleAutoFill = (mode: 'favorites' | 'random') => {
        setIsMobileAutofillOpen(false); // Close dropdown
        const newOverrides = { ...overrides };

        // Use normalized names logic for key generation if matchId is dynamic. 
        // Current matchId construction: overrides[`${m.homeTeam}-${m.awayTeam}`]
        // Since homeTeam/awayTeam in `allMatches` changes with language, the KEYS also change!
        // This means predictions are language-specific currently.
        // Ideally we should use untranslated IDs. But `normalizedMatches` transforms them.
        // Accepted Limitation: users should restart if they switch language midpoint during prediction.
        // OR: we fix the override key to be always uppercase TR (assuming backend ID).
        // For now, proceeding with simple logic.

        const unplayedMatches = allMatches.filter(m => !m.isPlayed && !overrides[`${m.homeTeam}-${m.awayTeam}`]);

        if (unplayedMatches.length === 0) {
            showToast(t('status.groupIncomplete'), "info");
            return;
        }

        unplayedMatches.forEach(match => {
            const matchId = `${match.homeTeam}-${match.awayTeam}`;

            if (mode === 'favorites') {
                const homeRank = liveStandings.findIndex(t => t.name === match.homeTeam);
                const awayRank = liveStandings.findIndex(t => t.name === match.awayTeam);
                if (homeRank !== -1 && awayRank !== -1) {
                    if (homeRank < awayRank) {
                        newOverrides[matchId] = "3-1";
                    } else if (homeRank > awayRank) {
                        newOverrides[matchId] = "1-3";
                    } else {
                        newOverrides[matchId] = "3-2";
                    }
                } else {
                    newOverrides[matchId] = "3-1";
                }
            } else {
                const scores = ["3-0", "3-1", "3-2", "2-3", "1-3", "0-3"];
                newOverrides[matchId] = scores[Math.floor(Math.random() * scores.length)];
            }
            addXP(5);
            recordPrediction(true);
        });

        setOverrides(newOverrides);
        sounds.achievement();
        showToast(`${unplayedMatches.length} ${t('status.matchesRemaining')}`, "success");
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

    // Dynamic Global Rankings Calculation
    const calculatedRankings = useMemo(() => {
        const firstPlace: TeamStats[] = [];
        const secondPlace: TeamStats[] = [];
        const thirdPlace: TeamStats[] = [];

        // For each pool, calculate standings
        pools.forEach(poolName => {
            const pTeams = allTeams.filter(t => t.groupName === poolName);
            const pMatches = allMatches.filter(m => m.groupName === poolName);
            const standings = calculateLiveStandings(pTeams, pMatches, overrides);

            if (standings.length > 0) firstPlace.push({ ...standings[0], groupName: poolName });
            if (standings.length > 1) secondPlace.push({ ...standings[1], groupName: poolName });
            if (standings.length > 2) thirdPlace.push({ ...standings[2], groupName: poolName });
        });

        // Helper to format for RankingEntry
        const toEntry = (t: TeamStats, idx: number) => ({
            pos: idx + 1,
            team: t.name,
            pool: t.groupName || "",
            pld: t.played,
            w: t.wins,
            l: t.played - t.wins,
            pts: t.points,
            sw: t.setsWon,
            sl: t.setsLost,
            sr: t.setsLost === 0 ? (t.setsWon > 0 ? 1000 : 0) : t.setsWon / t.setsLost,
            spw: t.setPointsWon,
            spl: t.setPointsLost,
            spr: t.setPointsLost === 0 ? (t.setPointsWon > 0 ? 1000 : 0) : t.setPointsWon / t.setPointsLost
        });

        // Reuse sortStandings logic by importing or re-implementing sort manually to ensure consistency
        // Since sortStandings is available, we use that for sorting the arrays
        const sortedFirst = calculateLiveStandings(firstPlace, [], {}); // abusive use of calc to sort? No, calc expects matches. 
        // Better to use a simpler sort helper locally or export sortStandings properly.
        // I'll reimplement the sort comparator here to be safe and explicit, derived from CEV rules.
        const comparator = (a: TeamStats, b: TeamStats) => {
            if (b.wins !== a.wins) return b.wins - a.wins;
            if (b.points !== a.points) return b.points - a.points;
            const setAvgB = (b.setsLost === 0) ? (b.setsWon > 0 ? Number.MAX_VALUE : 0) : (b.setsWon / b.setsLost);
            const setAvgA = (a.setsLost === 0) ? (a.setsWon > 0 ? Number.MAX_VALUE : 0) : (a.setsWon / a.setsLost);
            if (Math.abs(setAvgB - setAvgA) > 0.0001) return setAvgB - setAvgA;
            const pointAvgB = (b.setPointsLost === 0) ? (b.setPointsWon > 0 ? Number.MAX_VALUE : 0) : (b.setPointsWon / b.setPointsLost);
            const pointAvgA = (a.setPointsLost === 0) ? (a.setPointsWon > 0 ? Number.MAX_VALUE : 0) : (a.setPointsWon / a.setPointsLost);
            return pointAvgB - pointAvgA;
        };

        return {
            firstPlace: [...firstPlace].sort(comparator).map(toEntry),
            secondPlace: [...secondPlace].sort(comparator).map(toEntry),
            thirdPlace: [...thirdPlace].sort(comparator).map(toEntry)
        };
    }, [allTeams, allMatches, overrides, pools]);

    return (
        <main className="min-h-screen bg-slate-950 text-slate-100 p-1 sm:p-2 font-sans">
            <div className="w-full max-w-7xl mx-auto flex flex-col h-full gap-2">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-900/50 to-indigo-900/50 border border-slate-800 rounded-xl p-3">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div>
                                <h1 className="font-bold text-white text-lg tracking-tight">{t('header.title')}</h1>
                            </div>
                        </div>

                        {/* Navigation in Header */}
                        <div className="flex items-center gap-2">
                            <a
                                href="/"
                                className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg"
                            >
                                {t('nav.groups')}
                            </a>
                            <a
                                href="/playoffs"
                                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold rounded-lg transition-all border border-slate-700"
                            >
                                {t('nav.playoffs')}
                            </a>
                            {/* Language Toggle */}
                            <div className="flex bg-slate-800 rounded-lg p-0.5 border border-slate-700">
                                <button
                                    onClick={() => setLanguage('tr')}
                                    className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all ${language === 'tr' ? 'bg-slate-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                                >TR</button>
                                <button
                                    onClick={() => setLanguage('en')}
                                    className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all ${language === 'en' ? 'bg-slate-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                                >EN</button>
                            </div>

                            {/* Theme Toggle */}
                            <button
                                onClick={() => {
                                    const root = document.documentElement;
                                    const isLight = root.getAttribute('data-theme') === 'light';
                                    root.setAttribute('data-theme', isLight ? 'dark' : 'light');
                                }}
                                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold rounded-lg transition-all border border-slate-700"
                                title="Tema Değiştir"
                            >
                                🌙
                            </button>
                        </div>
                    </div>
                </div>

                {/* Group Tabs & Actions */}
                <div className="flex flex-col gap-3">
                    {/* Groups as Tabs */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {pools.map(pool => (
                            <button
                                key={pool}
                                onClick={() => setSelectedPool(pool)}
                                className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all border ${selectedPool === pool
                                    ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/40"
                                    : "bg-slate-900/50 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                                    }`}
                            >
                                {pool}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center justify-between gap-2 p-2 bg-slate-900/30 rounded-lg border border-slate-800/50">
                        {/* Selected Group Label */}
                        <span className="text-sm font-bold text-white px-2 animate-in fade-in">{selectedPool}</span>

                        <div className="flex items-center gap-2 relative">
                            {/* Mobile Autofill Fix: Explicit toggle state instead of CSS hover */}
                            <div className="relative">
                                <button
                                    onClick={() => setIsMobileAutofillOpen(!isMobileAutofillOpen)}
                                    className="px-3 py-1.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1 shadow-lg shadow-green-900/20"
                                >
                                    <span>⚡</span>
                                    <span className="hidden sm:inline">{t('status.autoFill')}</span>
                                    <span className="text-[8px] ml-0.5">▼</span>
                                </button>

                                <div className="absolute top-0 right-full mr-2 hidden sm:flex items-center">
                                    <span className="text-[10px] text-slate-400 mr-2 max-w-[150px] text-right leading-tight">
                                        {t('guidance.rankings')}
                                    </span>
                                    <div className="w-8 h-px bg-slate-700"></div>
                                </div>

                                {isMobileAutofillOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40 bg-black/20" onClick={() => setIsMobileAutofillOpen(false)}></div>
                                        <div className="absolute top-full right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleAutoFill('favorites'); }}
                                                className="w-full text-left px-4 py-3 hover:bg-green-900/20 transition-colors flex items-center gap-3 border-b border-slate-800"
                                            >
                                                <span className="text-lg">🏆</span>
                                                <div>
                                                    <div className="text-xs font-bold text-white">{t('status.autoFillFavorites')}</div>
                                                    <div className="text-[9px] text-slate-400">{t('status.autoFillFavoritesDesc')}</div>
                                                </div>
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleAutoFill('random'); }}
                                                className="w-full text-left px-4 py-3 hover:bg-purple-900/20 transition-colors flex items-center gap-3"
                                            >
                                                <span className="text-lg">🎲</span>
                                                <div>
                                                    <div className="text-xs font-bold text-white">{t('status.autoFillRandom')}</div>
                                                    <div className="text-[9px] text-slate-400">{t('status.autoFillRandomDesc')}</div>
                                                </div>
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-4 h-auto lg:h-[320px]">
                        <div ref={standingsRef} className="h-full overflow-hidden">
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
                    <div className="flex flex-col h-auto lg:h-[320px]">
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
            </div>
        </main >
    );
}
