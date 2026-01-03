"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { TeamStats, Match, Achievement } from "../../types";

import { useToast, AchievementToast, AchievementsPanel } from "..";
import StandingsTable from "../Calculator/StandingsTable";
import FixtureList from "../Calculator/FixtureList";
import ShareButton from "../ShareButton";
import { calculateLiveStandings } from "../../utils/calculatorUtils";
import { useGameState, ACHIEVEMENTS } from "../../utils/gameState";
import { sounds } from "../../utils/sounds";
import { LeagueConfig, THEME_COLORS } from "./types";
import LeagueActionBar from "./LeagueActionBar";

interface CalculatorTemplateProps {
    config: LeagueConfig;
    initialTeams: TeamStats[];
    initialMatches: Match[];
}

export default function CalculatorTemplate({ config, initialTeams, initialMatches }: CalculatorTemplateProps) {
    const { showToast, showUndoToast } = useToast();
    const theme = THEME_COLORS[config.theme];
    const standingsRef = useRef<HTMLDivElement>(null);

    // Data State
    const [allTeams, setAllTeams] = useState<TeamStats[]>(initialTeams);
    const [allMatches, setAllMatches] = useState<Match[]>(initialMatches);
    const [activeGroup, setActiveGroup] = useState<string>(config.groups?.[0] || "");

    // UI State
    const [overrides, setOverrides] = useState<Record<string, string>>({});
    const [showAchievements, setShowAchievements] = useState(false);
    const [showAutoMenu, setShowAutoMenu] = useState(false);
    const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);

    // Game State
    const { gameState, addXP, recordPrediction, unlockAchievement, hasAchievement } = useGameState();

    // Update state when props change (needed for some edge cases)
    useEffect(() => {
        setAllTeams(initialTeams);
        setAllMatches(initialMatches);
    }, [initialTeams, initialMatches]);

    // Load saved scenarios on mount
    useEffect(() => {
        const saved = localStorage.getItem(config.storageKey);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setOverrides(parsed);
            } catch (e) { console.error(e); }
        }
    }, [config.storageKey]);

    // Derived Data based on active group (if hasGroups)
    const currentMatches = useMemo(() => {
        if (!config.hasGroups) return allMatches;
        return allMatches.filter(m => !activeGroup || (m as any).groupName === activeGroup); // Type cast for groupName as it might not be on standard Match interface strictly? Actually Match usually has it
    }, [allMatches, config.hasGroups, activeGroup]);

    const currentTeams = useMemo(() => {
        if (!config.hasGroups) return allTeams;
        return allTeams.filter(t => !activeGroup || (t as any).groupName === activeGroup);
    }, [allTeams, config.hasGroups, activeGroup]);


    // Handle Predictions
    const handleScoreChange = (matchId: string, score: string) => {
        const newOverrides = { ...overrides };
        const wasNew = !overrides[matchId];

        if (score) {
            newOverrides[matchId] = score;

            if (wasNew) {
                addXP(10);
                sounds.scoreSelect();

                // Achievement: First Prediction
                if (!hasAchievement('first_prediction')) {
                    const wasUnlocked = unlockAchievement('first_prediction');
                    if (wasUnlocked) {
                        setNewAchievement(ACHIEVEMENTS.first_prediction as Achievement);
                        sounds.achievement();
                    }
                }

                // Achievement: Game Addict
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

    // Save Scenarios
    useEffect(() => {
        localStorage.setItem(config.storageKey, JSON.stringify(overrides));
    }, [overrides, config.storageKey]);

    // Reset Logic
    const handleReset = () => {
        const previousOverrides = { ...overrides };
        setOverrides({});
        localStorage.removeItem(config.storageKey);
        showUndoToast(`${config.name} tahminleri sıfırlandı`, () => {
            setOverrides(previousOverrides);
            localStorage.setItem(config.storageKey, JSON.stringify(previousOverrides));
        });
    };

    const handleRandomize = () => {
        if (!confirm("Oynanmamış maçlar rastgele skorlarla doldurulacak. Onaylıyor musunuz?")) return;
        const newOverrides = { ...overrides };
        const scores = ["3-0", "3-1", "3-2", "2-3", "1-3", "0-3"];
        let count = 0;

        currentMatches.forEach(match => {
            const matchId = `match-${match.id}`;
            if (!match.isPlayed && !newOverrides[matchId]) {
                const randomScore = scores[Math.floor(Math.random() * scores.length)];
                newOverrides[matchId] = randomScore;
                count++;
            }
        });

        if (count > 0) {
            setOverrides(newOverrides);
            sounds.levelUp();
            showToast(`${count} maç rastgele tahmin edildi!`, "success");
            addXP(count * 5); // 5xp per random match
        }
    };

    // Calculations
    const standings = useMemo(() =>
        calculateLiveStandings(currentTeams, currentMatches, overrides),
        [currentTeams, currentMatches, overrides]
    );

    // Initial Standings for comparison (rank changes)
    const initialRanks = useMemo(() => {
        const baseStandings = calculateLiveStandings(currentTeams, currentMatches, {});
        // Sort by points/wins etc to get rank
        // Re-sorting logic usually inside calculateLiveStandings but let's assume it returns derived structure
        // Actually calculateLiveStandings returns sorted array
        const map = new Map<string, number>();
        baseStandings.forEach((t, i) => map.set(t.name, i + 1));
        return map;
    }, [currentTeams, currentMatches]);

    const completedMatches = currentMatches.filter(m => m.isPlayed || overrides[`match-${m.id}`]).length;
    const progress = (completedMatches / currentMatches.length) * 100 || 0;


    return (
        <main className="min-h-screen bg-slate-950 text-slate-100 p-2 sm:p-4 font-sans pb-20 sm:pb-4">
            <div className="w-full max-w-[1600px] mx-auto flex flex-col h-[calc(100vh-2rem)] gap-4">

                <LeagueActionBar
                    config={config}
                    title={config.name}
                    subtitle="Tahmin Oyunu & Puan Durumu Hesaplayıcı"
                    selectorLabel={config.hasGroups ? "Grup" : undefined}
                    selectorValue={activeGroup}
                    selectorOptions={config.hasGroups ? (config.groups || []) : []}
                    onSelectorChange={config.hasGroups ? setActiveGroup : undefined}
                    progress={progress}
                    progressLabel={`${completedMatches}/${currentMatches.length} Maç`}
                >
                    <button
                        onClick={handleRandomize}
                        className={`px-3 py-1.5 bg-${config.theme}-600 hover:bg-${config.theme}-500 text-white text-xs font-bold rounded-lg transition-all shadow-lg shadow-${config.theme}-900/20`}
                    >
                        🎲 Rastgele
                    </button>
                    <button
                        onClick={handleReset}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-rose-900/50 text-slate-400 hover:text-rose-400 text-xs font-bold rounded-lg transition-all border border-slate-700"
                    >
                        Sıfırla
                    </button>
                    <ShareButton
                        standingsRef={standingsRef}
                        leagueName={config.name}
                        season={config.subtitle}
                    />
                </LeagueActionBar>

                {/* Content Grid */}
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0 overflow-hidden">
                    {/* Left: Fixture */}
                    <div className="lg:col-span-8 h-full min-h-0 flex flex-col bg-slate-900/50 rounded-xl border border-slate-800 overflow-hidden order-2 lg:order-1">
                        <FixtureList
                            matches={currentMatches}
                            overrides={overrides}
                            onScoreChange={handleScoreChange}
                            title={config.hasGroups ? `${activeGroup} Fikstürü` : "Fikstür"}
                        />
                    </div>

                    {/* Right: Standings */}
                    <div className="lg:col-span-4 h-full min-h-0 flex flex-col order-1 lg:order-2" ref={standingsRef}>
                        <StandingsTable
                            teams={standings}
                            playoffSpots={config.playoffSpots}
                            secondaryPlayoffSpots={config.secondaryPlayoffSpots}
                            relegationSpots={config.relegationSpots}
                            initialRanks={initialRanks}
                        />

                        {/* Achievements Panel if needed */}
                        {showAchievements && (
                            <div className="absolute inset-0 bg-slate-950/90 z-50 flex items-center justify-center p-4">
                                <AchievementsPanel
                                    onClose={() => setShowAchievements(false)}
                                    userStats={gameState.stats}
                                    achievements={Object.values(ACHIEVEMENTS) as Achievement[]}
                                    unlockedAchievements={gameState.unlockedAchievements}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Achievement Toast */}
            {newAchievement && (
                <AchievementToast
                    achievement={newAchievement}
                    onClose={() => setNewAchievement(null)}
                />
            )}
        </main>
    );
}
