"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { TeamStats, Match } from "@/app/types";
import Link from "next/link";
import TeamAvatar from "../components/TeamAvatar";
import { calculateLiveStandings } from "../utils/calculatorUtils";
import { useLanguage } from "../context/LanguageContext";

/* -------------------------------------------------------------------------- */
/*                                    TYPES                                   */
/* -------------------------------------------------------------------------- */

interface CEVCLPlayoffsClientProps {
    initialTeams: TeamStats[];
    initialMatches: Match[];
}

// Match Result
interface MatchResult {
    winner: string | null;
    loser: string | null;
    goldenSetNeeded: boolean;
    homePoints: number;
    awayPoints: number;
}

/* -------------------------------------------------------------------------- */
/*                                HELPER LOGIC                                */
/* -------------------------------------------------------------------------- */

const SCORES = ['3-0', '3-1', '3-2', '2-3', '1-3', '0-3'];

const getMatchPoints = (score: string | undefined): { home: number, away: number } | null => {
    if (!score) return null;
    const [h, a] = score.split('-').map(Number);
    if (h === 3 && (a === 0 || a === 1)) return { home: 3, away: 0 };
    if (h === 3 && a === 2) return { home: 2, away: 1 };
    if (h === 2 && a === 3) return { home: 1, away: 2 };
    if ((h === 0 || h === 1) && a === 3) return { home: 0, away: 3 };
    return { home: 0, away: 0 };
};

const sortTeamsByPerformance = (teams: TeamStats[]) => {
    return [...teams].sort((a, b) => {
        if (b.wins !== a.wins) return b.wins - a.wins;
        if (b.points !== a.points) return b.points - a.points;
        const aSetRatio = a.setsLost > 0 ? a.setsWon / a.setsLost : a.setsWon * 100;
        const bSetRatio = b.setsLost > 0 ? b.setsWon / b.setsLost : b.setsWon * 100;
        if (Math.abs(bSetRatio - aSetRatio) > 0.001) return bSetRatio - aSetRatio;
        const aPointRatio = a.setPointsWon / (a.setPointsLost || 1);
        const bPointRatio = b.setPointsWon / (b.setPointsLost || 1);
        return bPointRatio - aPointRatio;
    });
};

/* -------------------------------------------------------------------------- */
/*                               MAIN COMPONENT                               */
/* -------------------------------------------------------------------------- */

export default function CEVCLPlayoffsClient({ initialTeams, initialMatches }: CEVCLPlayoffsClientProps) {
    const { t, language, setLanguage } = useLanguage();

    // Normalize data to match Calculator logic (ensure keys match LocalStorage overrides)
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

    const [baseTeams, setBaseTeams] = useState<TeamStats[]>(normalizedTeams);
    const [allMatches, setAllMatches] = useState<Match[]>(normalizedMatches);

    useEffect(() => {
        setBaseTeams(normalizedTeams);
        setAllMatches(normalizedMatches);
    }, [normalizedTeams, normalizedMatches]);

    // Persisted User Predictions
    const [playoffOverrides, setPlayoffOverrides] = useState<Record<string, string>>({});
    const [groupOverrides, setGroupOverrides] = useState<Record<string, string>>({});

    // UI State
    const [remainingMatches, setRemainingMatches] = useState(0);
    const [isLoaded, setIsLoaded] = useState(false);

    // Refs for scrolling
    const bracketContainerRef = useRef<HTMLDivElement>(null);

    // --- Data Loading ---
    useEffect(() => {
        const savedPlayoff = localStorage.getItem('cevclPlayoffScenarios');
        if (savedPlayoff) {
            try { setPlayoffOverrides(JSON.parse(savedPlayoff)); } catch (e) { console.error(e); }
        }
        const savedGroup = localStorage.getItem('cevclGroupScenarios');
        if (savedGroup) {
            try { setGroupOverrides(JSON.parse(savedGroup)); } catch (e) { console.error(e); }
        }
        setIsLoaded(true);
    }, []);

    // --- Remaining Matches Check ---
    useEffect(() => {
        let remaining = allMatches.filter((m: Match) => !m.isPlayed).length;
        if (groupOverrides) {
            // Naive check: does not account for overrides on already played matches (shouldn't happen in this app's logic usually)
            // Better: matches that are NOT played AND NOT in overrides
            const pending = allMatches.filter(m => !m.isPlayed && !groupOverrides[`${m.homeTeam}-${m.awayTeam}`]).length;
            remaining = pending;
        }
        setRemainingMatches(remaining);
    }, [allMatches, groupOverrides]);

    // --- Save Logic ---
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('cevclPlayoffScenarios', JSON.stringify(playoffOverrides));
        }
    }, [playoffOverrides, isLoaded]);

    const handleScoreChange = (key: string, value: string) => {
        setPlayoffOverrides(prev => {
            const next = { ...prev };
            if (value) next[key] = value;
            else delete next[key];
            return next;
        });
    };

    // --- Calculation Logic ---
    const processedData = useMemo(() => {
        // 1. Calculate Standings for ALL pools accurately
        const poolLetters = ["A", "B", "C", "D", "E"];

        const poolResults = poolLetters.map(letter => {
            // Find teams belonging to this specific pool
            // We search for the letter in the groupName (handled case-insensitively and localized)
            const poolTeams = baseTeams.filter(t => {
                const gn = t.groupName.toUpperCase();
                return gn.startsWith(letter) || gn.includes(`POOL ${letter}`) || gn.includes(`${letter} GRUBU`);
            });

            const poolMatches = allMatches.filter(m => {
                const gn = m.groupName.toUpperCase();
                return gn.startsWith(letter) || gn.includes(`POOL ${letter}`) || gn.includes(`${letter} GRUBU`);
            });

            const standings = calculateLiveStandings(poolTeams, poolMatches, groupOverrides);
            return { letter, teams: standings };
        });

        // 2. Identify and Rank Pool Winners (Seeds 1-5)
        const winners = sortTeamsByPerformance(poolResults.map(pr => pr.teams[0]).filter(Boolean));
        const winnersNames = new Set(winners.map(w => w.name));

        // 3. Identify and Rank Non-Winners (Seeds 6-11)
        // Must exclude teams that are already in 'winners' to prevent duplicates if data is messy
        const allOtherTeams: TeamStats[] = [];
        poolResults.forEach(pr => {
            pr.teams.slice(1).forEach(t => {
                if (!winnersNames.has(t.name)) {
                    allOtherTeams.push(t);
                }
            });
        });

        const po6Qualifiers = sortTeamsByPerformance(allOtherTeams).slice(0, 6);

        return { winners, po6Qualifiers };
    }, [baseTeams, allMatches, groupOverrides, language]);

    const poolWinners = processedData.winners;
    const po6Qualifiers = processedData.po6Qualifiers;

    // --- Match Logic Helper ---
    const calculateResult = (matchId: string, home: string | undefined, away: string | undefined, isDoubleLeg: boolean): MatchResult => {
        if (!home || !away) return { winner: null, loser: null, goldenSetNeeded: false, homePoints: 0, awayPoints: 0 };

        const s1 = playoffOverrides[`${matchId}-m1`];

        if (!isDoubleLeg) { // Single Match (Final Four)
            if (!s1) return { winner: null, loser: null, goldenSetNeeded: false, homePoints: 0, awayPoints: 0 };
            const [h, a] = s1.split('-').map(Number);
            return h > a
                ? { winner: home, loser: away, goldenSetNeeded: false, homePoints: 3, awayPoints: 0 }
                : { winner: away, loser: home, goldenSetNeeded: false, homePoints: 0, awayPoints: 3 };
        }

        // Double Leg (PO6, QF)
        const s2 = playoffOverrides[`${matchId}-m2`];
        if (!s1 || !s2) return { winner: null, loser: null, goldenSetNeeded: false, homePoints: 0, awayPoints: 0 };

        const p1 = getMatchPoints(s1);
        const p2 = getMatchPoints(s2);

        if (!p1 || !p2) return { winner: null, loser: null, goldenSetNeeded: false, homePoints: 0, awayPoints: 0 };

        const totalHome = p1.home + p2.home;
        const totalAway = p1.away + p2.away;

        if (totalHome > totalAway) return { winner: home, loser: away, goldenSetNeeded: false, homePoints: totalHome, awayPoints: totalAway };
        if (totalAway > totalHome) return { winner: away, loser: home, goldenSetNeeded: false, homePoints: totalHome, awayPoints: totalAway };

        // Golden Set
        const golden = playoffOverrides[`${matchId}-golden`];
        if (golden === 'home') return { winner: home, loser: away, goldenSetNeeded: true, homePoints: totalHome, awayPoints: totalAway };
        if (golden === 'away') return { winner: away, loser: home, goldenSetNeeded: true, homePoints: totalHome, awayPoints: totalAway };

        return { winner: null, loser: null, goldenSetNeeded: true, homePoints: totalHome, awayPoints: totalAway };
    };

    // --- PAIRINGS (Refined per 2026 Wiki rules) ---
    // PO6 pairings: P1: 6th 11th (Best 2nd-6 vs 1st 3rd-11?) 
    // Wait, Wiki says: P1: 1st 3rd vs 1st 2nd. 
    // po6Qualifiers is sorted 1 to 6 (Best to Worst). 
    // Seed 6 = po6Qualifiers[0]. Seed 11 = po6Qualifiers[5].
    const po6_matches = [
        { id: 'po6-1', home: po6Qualifiers[5]?.name, away: po6Qualifiers[0]?.name, label: 'PO1 (11 v 6)' }, // 1st 3rd vs 1st 2nd
        { id: 'po6-2', home: po6Qualifiers[4]?.name, away: po6Qualifiers[1]?.name, label: 'PO2 (10 v 7)' }, // 5th 2nd vs 2nd 2nd
        { id: 'po6-3', home: po6Qualifiers[3]?.name, away: po6Qualifiers[2]?.name, label: 'PO3 (9 v 8)' }   // 4th 2nd vs 3rd 2nd
    ];
    const po6_results = po6_matches.map(m => ({ ...m, res: calculateResult(m.id, m.home, m.away, true) }));

    const po6Winner1 = po6_results[0].res.winner;
    const po6Winner2 = po6_results[1].res.winner;
    const po6Winner3 = po6_results[2].res.winner;

    const qf_matches = [
        { id: 'qf-1', home: po6Winner1, away: poolWinners[2]?.name, label: 'QF 1' }, // Winner P1 vs 3rd Winner
        { id: 'qf-2', home: po6Winner2, away: poolWinners[1]?.name, label: 'QF 2' }, // Winner P2 vs 2nd Winner
        { id: 'qf-3', home: poolWinners[4]?.name, away: poolWinners[3]?.name, label: 'QF 3' }, // 5th Winner vs 4th Winner
        { id: 'qf-4', home: po6Winner3, away: poolWinners[0]?.name, label: 'QF 4' }  // Winner P3 vs 1st Winner
    ];
    const qf_results = qf_matches.map(m => ({ ...m, res: calculateResult(m.id, m.home!, m.away!, true) }));

    const sf_matches = [
        { id: 'sf-1', home: qf_results[0].res.winner, away: qf_results[1].res.winner, label: 'Semi Final 1' }, // QF1 vs QF2
        { id: 'sf-2', home: qf_results[2].res.winner, away: qf_results[3].res.winner, label: 'Semi Final 2' }  // QF3 vs QF4
    ];
    const sf_results = sf_matches.map(m => ({ ...m, res: calculateResult(m.id, m.home!, m.away!, false) }));

    const final_match = { id: 'final', home: sf_results[0].res.winner, away: sf_results[1].res.winner, label: 'SUPER FINAL' };
    const final_result = calculateResult(final_match.id, final_match.home!, final_match.away!, false);

    const match3rd = { id: '3rd', home: sf_results[0].res.loser, away: sf_results[1].res.loser, label: '3.lük Maçı' };
    const result3rd = calculateResult(match3rd.id, match3rd.home!, match3rd.away!, false);

    /* -------------------------------------------------------------------------- */
    /*                                 SUB-COMPONENTS                             */
    /* -------------------------------------------------------------------------- */

    const MatchCard = ({ matchId, home, away, label, isDoubleLeg, result }: { matchId: string, home?: string | null, away?: string | null, label: string, isDoubleLeg: boolean, result: MatchResult }) => {
        const isReady = home && away;
        // Compact Placeholder
        if (!isReady) {
            return (
                <div className="w-56 h-20 bg-slate-100 dark:bg-slate-900/40 rounded-lg border border-dashed border-slate-300 dark:border-slate-700/50 flex flex-col items-center justify-center text-slate-500 gap-1">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-slate-500">{label}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{t('playoff.waiting')}</span>
                </div>
            )
        }

        const hWin = result.winner === home;
        const aWin = result.winner === away;
        const gsNeeded = result.goldenSetNeeded;

        return (
            <div className={`w-56 bg-white dark:bg-slate-900/90 border ${hWin || aWin ? 'border-emerald-500/30 shadow-[0_0_10px_-5px_rgba(16,185,129,0.2)]' : 'border-slate-200 dark:border-slate-700/60'} rounded-lg overflow-hidden backdrop-blur-md transition-all hover:border-slate-300 dark:hover:border-slate-600 group relative shadow-sm dark:shadow-none`}>
                <div className="px-2 py-1.5 bg-slate-50 dark:bg-black/20 border-b border-slate-100 dark:border-white/5 flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider scale-90 origin-left">{label}</span>
                    {isDoubleLeg ? <span className="text-[8px] px-1 py-0.5 bg-slate-200 dark:bg-slate-800 rounded text-slate-600 dark:text-slate-300">{t('playoff.doubleLeg')}</span> : <span className="text-[8px] px-1 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded">{t('playoff.singleMatch')}</span>}
                </div>

                <div className="p-2 space-y-1">
                    {/* Home Team */}
                    <div className={`flex items-center justify-between p-1.5 rounded ${hWin ? 'bg-emerald-100 dark:bg-emerald-900/20' : ''}`}>
                        <div className="flex items-center gap-1.5 min-w-0 flex-1">
                            <TeamAvatar name={home!} size="xs" />
                            <span className={`text-xs truncate font-medium ${hWin ? 'text-emerald-900 dark:text-white' : 'text-slate-700 dark:text-slate-400'}`}>{home}</span>
                        </div>
                    </div>

                    {/* Away Team */}
                    <div className={`flex items-center justify-between p-1.5 rounded ${aWin ? 'bg-emerald-100 dark:bg-emerald-900/20' : ''}`}>
                        <div className="flex items-center gap-1.5 min-w-0 flex-1">
                            <TeamAvatar name={away!} size="xs" />
                            <span className={`text-xs truncate font-medium ${aWin ? 'text-emerald-900 dark:text-white' : 'text-slate-700 dark:text-slate-400'}`}>{away}</span>
                        </div>
                    </div>
                </div>

                <div className="px-2 pb-2 pt-0 grid gap-1">
                    {/* Scores */}
                    <div className="flex items-center gap-1 justify-end">
                        {isDoubleLeg ? (
                            <div className="flex w-full justify-between items-center gap-2">
                                <div className="flex flex-col items-center">
                                    <span className="text-[7px] text-slate-500 dark:text-slate-400 uppercase font-bold mb-0.5">{t('playoff.leg1')}</span>
                                    <select
                                        aria-label={t('playoff.leg1')}
                                        className="bg-slate-100 dark:bg-slate-950 text-[10px] border border-slate-300 dark:border-slate-800 rounded px-1 py-0.5 text-slate-900 dark:text-slate-300 focus:outline-none focus:border-blue-500 h-6 w-14 text-center"
                                        value={playoffOverrides[`${matchId}-m1`] || ""}
                                        onChange={(e) => handleScoreChange(`${matchId}-m1`, e.target.value)}
                                    >
                                        <option value="">-</option>
                                        {SCORES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div className="flex flex-col items-center">
                                    <span className="text-[7px] text-slate-500 dark:text-slate-400 uppercase font-bold mb-0.5">{t('playoff.leg2')}</span>
                                    <select
                                        aria-label={t('playoff.leg2')}
                                        className="bg-slate-100 dark:bg-slate-950 text-[10px] border border-slate-300 dark:border-slate-800 rounded px-1 py-0.5 text-slate-900 dark:text-slate-300 focus:outline-none focus:border-blue-500 h-6 w-14 text-center"
                                        value={playoffOverrides[`${matchId}-m2`] || ""}
                                        onChange={(e) => handleScoreChange(`${matchId}-m2`, e.target.value)}
                                    >
                                        <option value="">-</option>
                                        {SCORES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-end w-full">
                                <span className="text-[7px] text-slate-500 dark:text-slate-400 uppercase font-bold mb-0.5 mr-1">{t('playoff.score')}</span>
                                <select
                                    aria-label={t('playoff.score')}
                                    className="bg-slate-100 dark:bg-slate-950 text-[10px] border border-slate-300 dark:border-slate-800 rounded px-1 py-0.5 text-slate-900 dark:text-slate-300 focus:outline-none focus:border-blue-500 h-6 w-14 text-center"
                                    value={playoffOverrides[`${matchId}-m1`] || ""}
                                    onChange={(e) => handleScoreChange(`${matchId}-m1`, e.target.value)}
                                >
                                    <option value="">-</option>
                                    {SCORES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Golden Set */}
                    {gsNeeded && (
                        <div className="pt-1 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-1">
                            <span className="text-[8px] text-amber-500 font-bold">{t('playoff.goldenSet')}</span>
                            <div className="flex gap-1">
                                <button
                                    onClick={() => handleScoreChange(`${matchId}-golden`, 'home')}
                                    className={`w-5 h-5 rounded flex items-center justify-center text-[8px] font-bold border ${playoffOverrides[`${matchId}-golden`] === 'home' ? 'bg-amber-500 text-black border-amber-400' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-500 border-slate-300 dark:border-slate-700'}`}
                                >H</button>
                                <button
                                    onClick={() => handleScoreChange(`${matchId}-golden`, 'away')}
                                    className={`w-5 h-5 rounded flex items-center justify-center text-[8px] font-bold border ${playoffOverrides[`${matchId}-golden`] === 'away' ? 'bg-amber-500 text-black border-amber-400' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-500 border-slate-300 dark:border-slate-700'}`}
                                >A</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        )
    };

    /* -------------------------------------------------------------------------- */
    /*                               RENDER                                       */
    /* -------------------------------------------------------------------------- */

    const isGroupsComplete = remainingMatches === 0;

    return (
        <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 font-sans selection:bg-purple-500/30 transition-colors duration-300">
            {/* --- HEADER --- */}
            <header className="sticky top-0 left-0 w-full z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
                <div className="max-w-[1600px] mx-auto px-4 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center text-lg shadow-lg shadow-purple-900/20">🏆</div>
                        <div>
                            <h1 className="font-bold text-slate-900 dark:text-white text-sm leading-tight">CEV Champions League</h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link href="/" className="px-3 py-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg transition-colors">
                            {t('nav.groups')}
                        </Link>
                        <Link href="/siralama" className="px-3 py-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg transition-colors">
                            {t('nav.ranking')}
                        </Link>
                        <div className="h-4 w-px bg-slate-300 dark:bg-slate-800 mx-1"></div>

                        <button
                            onClick={() => {
                                if (confirm(t('playoff.resetConfirm'))) {
                                    setPlayoffOverrides({});
                                    localStorage.removeItem('cevclPlayoffScenarios');
                                }
                            }}
                            className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white text-xs font-bold rounded-lg transition-all border border-rose-600/20"
                            title={t('playoff.resetSim')}
                        >
                            🔄 <span className="hidden sm:inline">{t('playoff.resetSim')}</span>
                        </button>

                        {/* Language Toggle */}
                        <div className="flex bg-slate-800 rounded-lg p-0.5 border border-slate-700">
                            <button
                                onClick={() => setLanguage('tr')}
                                className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all ${language === 'tr' ? 'bg-slate-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                            >TR</button>
                            <button
                                onClick={() => setLanguage('en')}
                                className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all ${language === 'en' ? 'bg-slate-600 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
                            >EN</button>
                        </div>

                        <button
                            onClick={() => {
                                const root = document.documentElement;
                                const isLight = root.getAttribute('data-theme') === 'light';
                                root.setAttribute('data-theme', isLight ? 'dark' : 'light');
                            }}
                            className="p-2 text-slate-400 hover:text-amber-400 transition-colors"
                        >
                            🌙
                        </button>
                    </div>
                </div>
            </header>

            {/* --- CONTENT --- */}
            <div className="max-w-[1600px] mx-auto p-4 space-y-6">

                {/* STATUS BAR */}
                {!isGroupsComplete && (
                    <div className="bg-gradient-to-r from-blue-900/20 to-indigo-900/20 border border-blue-500/20 rounded-xl p-4 flex flex-col md:flex-row items-center gap-4 text-center md:text-left relative overflow-hidden">
                        <div className="flex items-center gap-3 relative z-10">
                            <div className="w-8 h-8 flex items-center justify-center bg-blue-500/20 rounded-full text-blue-500 dark:text-blue-400">⚡</div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t('status.groupIncomplete')} ({remainingMatches} {t('status.matchesRemaining')})</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-xs">{t('status.groupIncompleteDesc')}</p>
                            </div>
                        </div>
                        <Link href="/tahminoyunu" className="relative z-10 md:ml-auto px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-all">
                            {t('status.completePredictions')}
                        </Link>
                    </div>
                )}

                {/* BRACKET CONTAINER */}
                <div ref={bracketContainerRef} className="overflow-x-auto pb-12 custom-scrollbar">
                    <div className="min-w-max flex gap-8 px-4 items-center">

                        {/* ROUND 1: PLAYOFF 6 */}
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="w-1.5 h-6 bg-amber-500 rounded-full"></span>
                                <div>
                                    <div className="text-xs font-bold text-amber-600 dark:text-white uppercase tracking-wider">{t('playoff.po6')}</div>
                                    <div className="text-[9px] text-slate-500 dark:text-slate-400">{t('playoff.po6Desc')} • 28 Jan - 13 Feb</div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-4 justify-center h-full">
                                {po6_results.map(m => (
                                    <MatchCard key={m.id} matchId={m.id} home={m.home} away={m.away} label={m.label} isDoubleLeg={true} result={m.res} />
                                ))}
                            </div>
                        </div>

                        {/* CONNECTOR 1 */}
                        <div className="w-8 border-slate-300 dark:border-slate-800"></div>

                        {/* ROUND 2: QUARTER FINALS */}
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
                                <div>
                                    <div className="text-xs font-bold text-blue-600 dark:text-white uppercase tracking-wider">{t('playoff.qf')}</div>
                                    <div className="text-[9px] text-slate-500 dark:text-slate-400">{t('playoff.qfDesc')} • 25 Feb - 13 Mar</div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-10 justify-center h-full">
                                {qf_results.map(m => (
                                    <MatchCard key={m.id} matchId={m.id} home={m.home} away={m.away} label={m.label} isDoubleLeg={true} result={m.res} />
                                ))}
                            </div>
                        </div>

                        {/* CONNECTOR 2 */}
                        <div className="w-8 border-slate-300 dark:border-slate-800"></div>

                        {/* ROUND 3: FINAL FOUR */}
                        <div className="flex flex-col gap-4 bg-slate-50 dark:bg-slate-900/30 p-4 rounded-xl border border-purple-500/10 shadow-sm dark:shadow-none">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="w-1.5 h-6 bg-purple-500 rounded-full shadow-[0_0_10px_purple]"></span>
                                <div>
                                    <div className="text-xs font-bold text-purple-600 dark:text-white uppercase tracking-wider">{t('playoff.f4')}</div>
                                    <div className="text-[9px] text-slate-500 dark:text-slate-400">{t('playoff.f4Desc')} • 17-18 May</div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-20 justify-center h-full">
                                {sf_results.map(m => (
                                    <MatchCard key={m.id} matchId={m.id} home={m.home} away={m.away} label={m.label} isDoubleLeg={false} result={m.res} />
                                ))}
                            </div>
                        </div>

                        {/* CONNECTOR 3 */}
                        <div className="w-8 border-slate-300 dark:border-slate-800"></div>

                        {/* ROUND 4: SUPER FINAL */}
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="w-1.5 h-6 bg-gradient-to-b from-yellow-400 to-amber-600 rounded-full"></span>
                                <div>
                                    <div className="text-xs font-bold text-amber-600 dark:text-white uppercase tracking-wider">{t('playoff.superFinal')}</div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-8 justify-center h-full">
                                <div className="scale-105 origin-left">
                                    <MatchCard matchId={final_match.id} home={final_match.home} away={final_match.away} label={t('playoff.superFinal')} isDoubleLeg={false} result={final_result} />
                                </div>

                                {/* Champion Card */}
                                {final_result.winner && (
                                    <div className="w-56 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-xl p-4 text-center shadow-lg shadow-amber-900/40 animate-in zoom-in fade-in duration-700">
                                        <div className="text-3xl mb-2">👑</div>
                                        <div className="text-[10px] font-bold text-amber-900 uppercase tracking-widest mb-1">{t('playoff.champion')}</div>
                                        <h2 className="text-lg font-black text-white drop-shadow-sm leading-tight">{final_result.winner}</h2>
                                    </div>
                                )}

                                <div className="mt-4 opacity-75">
                                    <MatchCard matchId={match3rd.id} home={match3rd.home} away={match3rd.away} label={t('playoff.match3rd')} isDoubleLeg={false} result={result3rd} />
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    height: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(15, 23, 42, 0.3);
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(71, 85, 105, 0.4);
                    border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(99, 102, 241, 0.4);
                }
            `}</style>
        </main>
    );
}
