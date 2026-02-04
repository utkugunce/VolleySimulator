import { useState, useEffect, useMemo, useRef } from 'react';
import { TeamStats, Match, Achievement } from "@/app/types";
import { useToast } from "@/app/components/Toast"; // Adjust path if needed
import { calculateLiveStandings } from "@/app/utils/calculatorUtils";
import { useGameState, ACHIEVEMENTS } from "@/app/utils/gameState";
import { sounds } from "@/app/utils/sounds";
import { useLanguage } from "@/app/context/LanguageContext";

interface UseCalculatorLogicProps {
    initialTeams: TeamStats[];
    initialMatches: Match[];
}

export function useCalculatorLogic({ initialTeams, initialMatches }: UseCalculatorLogicProps) {
    const { t, language } = useLanguage();
    const { showToast } = useToast();

    // Data State
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

    const [allTeams, setAllTeams] = useState<TeamStats[]>(normalizedTeams);
    const [allMatches, setAllMatches] = useState<Match[]>(normalizedMatches);

    useEffect(() => {
        const sortedMatches = [...normalizedMatches].sort((a, b) => {
            const dateA = a.matchDate ? new Date(a.matchDate).getTime() : 0;
            const dateB = b.matchDate ? new Date(b.matchDate).getTime() : 0;
            return dateA - dateB;
        });
        setAllTeams(normalizedTeams);
        setAllMatches(sortedMatches);
    }, [normalizedTeams, normalizedMatches]);

    const pools = ["A", "B", "C", "D", "E"].map(l => l + (language === 'tr' ? ' GRUBU' : ' POOL'));
    const [selectedPool, setSelectedPool] = useState<string>("A" + (language === 'tr' ? ' GRUBU' : ' POOL'));

    // Handle language switch for selected pool
    useEffect(() => {
        const letter = selectedPool.split(' ')[0];
        setSelectedPool(letter + (language === 'tr' ? ' GRUBU' : ' POOL'));
    }, [language]);

    // UI/Game State
    const [overrides, setOverrides] = useState<Record<string, string>>({});
    const [setScoreOverrides, setSetScoreOverrides] = useState<Record<string, string[]>>({});
    const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);
    const [showAchievements, setShowAchievements] = useState(false);
    const [highlightedTeam, setHighlightedTeam] = useState<string | null>(null); // [NEW] Shared highlight state

    const [isLoaded, setIsLoaded] = useState(false); // [FIX] Prevent overwriting localStorage on mount

    const { gameState, addXP, recordPrediction, unlockAchievement, hasAchievement } = useGameState();

    // Load saved scenarios on mount
    useEffect(() => {
        const saved = localStorage.getItem('cevclGroupScenarios');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setOverrides(parsed);
            } catch (e) { console.error(e); }
        }

        const savedSets = localStorage.getItem('cevclGroupSetScenarios');
        if (savedSets) {
            try {
                const parsed = JSON.parse(savedSets);
                setSetScoreOverrides(parsed);
            } catch (e) { console.error(e); }
        }
        setIsLoaded(true); // Mark as loaded
    }, []);

    // Persist overrides
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('cevclGroupScenarios', JSON.stringify(overrides));
        }
    }, [overrides, isLoaded]);

    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('cevclGroupSetScenarios', JSON.stringify(setScoreOverrides));
        }
    }, [setScoreOverrides, isLoaded]);


    // Derived Data
    const poolTeams = useMemo(() =>
        allTeams.filter((t: TeamStats) => t.groupName === selectedPool),
        [allTeams, selectedPool]
    );

    const poolMatches = useMemo(() =>
        allMatches.filter((m: Match) => m.groupName === selectedPool),
        [allMatches, selectedPool]
    );

    const liveStandings = useMemo(() =>
        calculateLiveStandings(poolTeams, poolMatches, overrides, setScoreOverrides),
        [poolTeams, poolMatches, overrides, setScoreOverrides]
    );

    const initialStandings = useMemo(() =>
        calculateLiveStandings(poolTeams, poolMatches, {}),
        [poolTeams, poolMatches]
    );

    const initialRanks = useMemo(() => {
        const ranks = new Map<string, number>();
        initialStandings.forEach((team: TeamStats, idx: number) => ranks.set(team.name, idx + 1));
        return ranks;
    }, [initialStandings]);

    const currentRanks = useMemo(() => {
        const ranks = new Map<string, number>();
        liveStandings.forEach((team: TeamStats, idx: number) => ranks.set(team.name, idx + 1));
        return ranks;
    }, [liveStandings]);


    // Handlers
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

    const handleSetScoresChange = (matchId: string, scores: string[]) => {
        setSetScoreOverrides((prev: Record<string, string[]>) => {
            const next = { ...prev };
            if (scores.length === 0 || scores.every(s => !s)) {
                delete next[matchId];
            } else {
                next[matchId] = scores;
            }
            return next;
        });

        const homeSets = scores.filter(s => {
            const [h, a] = s.split('-').map(Number);
            return h > a;
        }).length;
        const awaySets = scores.filter(s => {
            const [h, a] = s.split('-').map(Number);
            return a > h;
        }).length;

        if (homeSets === 3 || awaySets === 3) {
            const newOverrides = { ...overrides };
            newOverrides[matchId] = `${homeSets}-${awaySets}`;
            setOverrides(newOverrides);
        }
    };

    const handleAutoFill = (mode: 'favorites' | 'random') => {
        const newOverrides = { ...overrides };
        const unplayedMatches = allMatches.filter((m: Match) => !m.isPlayed && !overrides[`${m.homeTeam}-${m.awayTeam}`]);

        if (unplayedMatches.length === 0) {
            showToast(t('status.groupIncomplete'), "info");
            return;
        }

        unplayedMatches.forEach((match: Match) => {
            const matchId = `${match.homeTeam}-${match.awayTeam}`;

            if (mode === 'favorites') {
                const homeRank = liveStandings.findIndex((t: TeamStats) => t.name === match.homeTeam);
                const awayRank = liveStandings.findIndex((t: TeamStats) => t.name === match.awayTeam);
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

    const resetSimulation = () => {
        if (confirm(t('group.resetConfirm'))) {
            setOverrides({});
            setSetScoreOverrides({});
            localStorage.removeItem('cevclGroupScenarios');
            localStorage.removeItem('cevclGroupSetScenarios');
        }
    };

    return {
        pools,
        selectedPool,
        setSelectedPool,
        poolMatches,
        overrides,
        setScoreOverrides,
        handleScoreChange,
        handleSetScoresChange,
        handleAutoFill,
        liveStandings,
        initialRanks,
        currentRanks,
        newAchievement,
        setNewAchievement,
        showAchievements,
        setShowAchievements,
        resetSimulation,
        allTeams,
        allMatches,
        highlightedTeam,
        setHighlightedTeam // Exported if needed by other components
    };
}
