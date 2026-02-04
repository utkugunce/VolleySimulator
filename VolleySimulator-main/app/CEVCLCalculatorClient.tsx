"use client";

import { useCalculatorLogic } from "@/app/hooks/useCalculatorLogic";
import { TeamStats, Match } from "@/app/types";
import { AchievementToast, AchievementsPanel } from "./components";
import StandingsTable from "./components/Calculator/StandingsTable";
import FixtureList from "./components/Calculator/FixtureList";
import CalculatorHeader from "./components/Calculator/CalculatorHeader";
import PoolSelector from "./components/Calculator/PoolSelector";
import AutoFillControls from "./components/Calculator/AutoFillControls";
import Link from "next/link";
import { useLanguage } from "./context/LanguageContext";
import { RankingsData } from "./utils/serverData";

interface CEVCLCalculatorClientProps {
    initialTeams: TeamStats[];
    initialMatches: Match[];
    rankings?: RankingsData;
}

export default function CEVCLCalculatorClient({ initialTeams, initialMatches, rankings }: CEVCLCalculatorClientProps) {
    const { t } = useLanguage();

    // Use the custom hook for all logic
    const {
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
        currentRanks,
        initialRanks,
        newAchievement,
        setNewAchievement,
        showAchievements,
        setShowAchievements,
        resetSimulation,
        highlightedTeam,
        setHighlightedTeam
    } = useCalculatorLogic({ initialTeams, initialMatches });

    return (
        <main className="min-h-screen bg-background text-foreground p-2 sm:p-4 font-sans transition-colors duration-300 relative overflow-hidden">
            {/* Background Decor */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] animate-pulse-glow"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/5 rounded-full blur-[120px] animate-pulse-glow"></div>
            </div>

            <div className="w-full max-w-7xl mx-auto flex flex-col h-full gap-4 relative z-10">

                {/* Header Section */}
                <CalculatorHeader
                    onReset={resetSimulation}
                />

                {/* Controls & Navigation */}
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border border-slate-200 dark:border-slate-800 rounded-xl p-2 pl-4 shadow-sm">

                        {/* Pool Tabs */}
                        <PoolSelector
                            pools={pools}
                            selectedPool={selectedPool}
                            onSelectPool={setSelectedPool}
                        />

                        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end pr-2">
                            {/* Selected Group Label & Link */}
                            <div className="flex flex-col items-end mr-2">
                                <span className="text-sm font-bold text-slate-900 dark:text-white animate-fade-in">{selectedPool}</span>
                                <Link href="/siralama" className="text-[10px] text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 underline decoration-blue-500/30 underline-offset-2 transition-colors">
                                    {t('guidance.rankings')}
                                </Link>
                            </div>

                            {/* Autofill */}
                            <AutoFillControls onAutoFill={handleAutoFill} />
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slide-up">

                    {/* Standings Table */}
                    <div className="flex flex-col h-auto min-h-[400px] glass-panel rounded-xl overflow-hidden shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50">
                        <StandingsTable
                            teams={liveStandings}
                            playoffSpots={2}
                            secondaryPlayoffSpots={0}
                            relegationSpots={0}
                            initialRanks={initialRanks}
                            compact={true}
                            highlightedTeam={highlightedTeam}
                            onTeamHover={setHighlightedTeam}
                        />
                    </div>

                    {/* Fixture List */}
                    <div className="flex flex-col h-[500px] glass-panel rounded-xl overflow-hidden shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50">
                        <FixtureList
                            matches={poolMatches}
                            overrides={overrides}
                            onScoreChange={handleScoreChange}
                            teamRanks={currentRanks}
                            totalTeams={liveStandings.length}
                            relegationSpots={0}
                            relegationSpots={0}
                            setOverrides={setScoreOverrides}
                            onSetScoresChange={handleSetScoresChange}
                            highlightedTeam={highlightedTeam}
                        />
                    </div>
                </div>

                {/* Achievement Components */}
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
            </div>
        </main>
    );
}
