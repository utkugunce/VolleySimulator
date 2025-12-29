"use client";

import { useEffect, useState, useRef, Suspense, useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { TeamStats, Match, Achievement } from "../../types";
import PageHeader from "../../components/PageHeader";
import { useToast, XPBar, AchievementToast, AchievementsPanel, TeamLoyaltySelector, QuestPanel } from "../../components";
import StandingsTable from "../../components/Calculator/StandingsTable";
import FixtureList from "../../components/Calculator/FixtureList";
import ShareButton from "../../components/ShareButton";
import { calculateLiveStandings } from "../../utils/calculatorUtils";
import { useGameState, ACHIEVEMENTS } from "../../utils/gameState";
import { sounds } from "../../utils/sounds";

function CalculatorContent() {
    const { showToast } = useToast();
    const searchParams = useSearchParams();
    const groupParam = searchParams.get("group");

    const [loading, setLoading] = useState(true);
    const standingsRef = useRef<HTMLDivElement>(null);

    // Data State
    const [allTeams, setAllTeams] = useState<TeamStats[]>([]);
    const [allMatches, setAllMatches] = useState<Match[]>([]);
    const [groups, setGroups] = useState<string[]>([]);

    // UI State
    const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
    const [overrides, setOverrides] = useState<Record<string, string>>({});
    const [showAchievements, setShowAchievements] = useState(false);
    const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);

    // Game State
    const { gameState, addXP, recordPrediction, unlockAchievement, hasAchievement } = useGameState();

    useEffect(() => {
        fetchData();
    }, []);

    // Load saved scenarios on mount (separate storage key for 1. Lig)
    useEffect(() => {
        const saved = localStorage.getItem('1ligGroupScenarios');
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

    async function fetchData() {
        try {
            setLoading(true);
            const res = await fetch("/api/1lig"); // Different API endpoint for 1. Lig
            if (!res.ok) throw new Error("Veri çekilemedi");
            const data = await res.json();

            let teamsData: any[] = [];
            let matchesData: any[] = [];

            if (data.teams && Array.isArray(data.teams)) {
                teamsData = data.teams;
            }

            if (data.fixture && Array.isArray(data.fixture)) {
                matchesData = data.fixture;
            }

            setAllTeams(teamsData);
            setAllMatches(matchesData);

            const uniqueGroups = [...new Set(teamsData.map((t: TeamStats) => t.groupName))].sort();
            setGroups(uniqueGroups as string[]);

            // Handle group selection from query param
            if (groupParam && uniqueGroups.includes(groupParam)) {
                setSelectedGroup(groupParam);
            } else if (uniqueGroups.length > 0) {
                setSelectedGroup(uniqueGroups[0] as string);
            }

        } catch (err) {
            console.error(err);
            showToast("Veri yüklenirken hata oluştu", "error");
        } finally {
            setLoading(false);
        }
    }

    const handleScoreChange = (matchId: string, score: string) => {
        const newOverrides = { ...overrides };
        const wasNew = !overrides[matchId]; // Track if this is a new prediction

        if (score) {
            newOverrides[matchId] = score;

            // Award XP for new predictions
            if (wasNew) {
                addXP(10); // Base XP for making a prediction
                sounds.scoreSelect();

                // Check for first prediction achievement
                if (!hasAchievement('first_prediction')) {
                    const wasUnlocked = unlockAchievement('first_prediction');
                    if (wasUnlocked) {
                        setNewAchievement(ACHIEVEMENTS.first_prediction as Achievement);
                        sounds.achievement();
                    }
                }

                // Check for game addict achievement (50+ predictions)
                if (gameState.stats.totalPredictions >= 49 && !hasAchievement('game_addict')) {
                    const wasUnlocked = unlockAchievement('game_addict');
                    if (wasUnlocked) {
                        setNewAchievement(ACHIEVEMENTS.game_addict as Achievement);
                        sounds.achievement();
                    }
                }

                recordPrediction(true); // Record as prediction made
            }
        } else {
            delete newOverrides[matchId];
        }
        setOverrides(newOverrides);
    };

    // Persist overrides to localStorage (separate key for 1. Lig)
    useEffect(() => {
        if (!selectedGroup) return;

        const saved = localStorage.getItem('1ligGroupScenarios');
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

        localStorage.setItem('1ligGroupScenarios', JSON.stringify(newGlobalObj));

    }, [overrides, groups, allMatches, selectedGroup]);


    const handleReset = () => {
        if (!confirm("Tüm 1. Lig tahminleriniz silinecek. Emin misiniz?")) return;
        setOverrides({});
        localStorage.removeItem('1ligGroupScenarios');
        showToast("1. Lig tahminleri sıfırlandı", "success");
    };

    const activeGroup = selectedGroup || groups[0];

    // Memoize filtered data to prevent recalculation on every render
    const activeTeams = useMemo(() =>
        allTeams.filter(t => t.groupName === activeGroup),
        [allTeams, activeGroup]
    );

    const activeMatches = useMemo(() =>
        allMatches.filter(m => m.groupName === activeGroup),
        [allMatches, activeGroup]
    );

    // Memoize standings calculations (expensive operations)
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

    // Export / Import Handlers (for 1. Lig)
    const handleSaveAllScenarios = () => {
        try {
            const exportData = {
                league: '1. Lig',
                groupScenarios: JSON.parse(localStorage.getItem('1ligGroupScenarios') || '{}'),
                date: new Date().toISOString()
            };
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
            const a = document.createElement('a');
            a.href = dataStr;
            a.download = `1lig-tahmin-${new Date().toLocaleDateString('tr-TR')}.json`;
            a.click();
            showToast("1. Lig senaryosu indirildi", "success");
        } catch (e) { console.error(e); }
    };

    const handleScrollToNextMatch = () => {
        const nextMatch = activeMatches.find(m => !m.isPlayed && !overrides[`${m.homeTeam}-${m.awayTeam}`]);
        if (nextMatch) {
            const id = `match-${nextMatch.homeTeam}-${nextMatch.awayTeam}`;
            const el = document.getElementById(id);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                el.classList.add('ring-2', 'ring-amber-500');
                setTimeout(() => el.classList.remove('ring-2', 'ring-amber-500'), 2000);
            } else {
                showToast("Maç görünümde bulunamadı.", "error");
            }
        } else {
            showToast("Tüm maçlar tamamlandı veya tahmin edildi!", "success");
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
                            const newKey = matchKey.includes('|||')
                                ? matchKey.replace('|||', '-')
                                : matchKey;
                            convertedScenarios[groupName][newKey] = score;
                        }
                    }

                    localStorage.setItem('1ligGroupScenarios', JSON.stringify(convertedScenarios));
                    let flat: Record<string, string> = {};
                    Object.values(convertedScenarios).forEach((obj: any) => flat = { ...flat, ...obj });
                    setOverrides(flat);
                }

                showToast("1. Lig senaryosu yüklendi", "success");
            } catch (err) { console.error(err); }
        }
        reader.readAsText(file);
        e.target.value = '';
    }


    if (loading) {
        return (
            <div className="h-[calc(100vh-64px)] flex items-center justify-center text-slate-400">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-slate-950 text-slate-100 p-1 sm:p-2 font-sans">
            <div className="w-full max-w-7xl mx-auto flex flex-col h-full gap-2">

                <PageHeader
                    title="Tahmin Oyunu"
                    subtitle="Kadınlar 1. Ligi Simülasyonu"
                    onExport={handleSaveAllScenarios}
                    onImport={handleImportAllScenarios}
                />

                {/* Action Bar (Group Selection + Reset/Share + XP) */}
                <div className="flex flex-wrap items-center justify-between gap-4 p-2 bg-slate-900/40 rounded-xl border border-slate-800">
                    {/* Group Selection */}
                    <div className="flex gap-1 items-center">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest hidden sm:inline mr-1">GRUP:</span>
                        {groups.map(groupName => (
                            <button
                                key={groupName}
                                onClick={() => setSelectedGroup(groupName)}
                                className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase transition-all ${activeGroup === groupName
                                    ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20 scale-105'
                                    : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                                    }`}
                            >
                                {groupName}
                            </button>
                        ))}
                    </div>

                    {/* XP Bar + Actions */}
                    <div className="flex items-center gap-3">
                        <XPBar compact />
                        <button
                            onClick={() => setShowAchievements(true)}
                            className="px-2 py-1 bg-amber-900/40 hover:bg-amber-800/60 text-amber-500 hover:text-amber-200 text-[10px] sm:text-xs font-bold rounded-lg transition-all border border-amber-900/50 flex items-center gap-1"
                            title="Başarılar"
                        >
                            <span>🏆</span>
                            <span className="hidden sm:inline">{gameState.achievements.length}</span>
                        </button>
                        <button
                            onClick={handleScrollToNextMatch}
                            className="px-2 py-1 bg-amber-900/40 hover:bg-amber-800/60 text-amber-500 hover:text-amber-200 text-[10px] sm:text-xs font-bold rounded-lg transition-all border border-amber-900/50 flex items-center gap-1"
                            title="Son kaldığım maça git"
                        >
                            <span>📍</span>
                            <span className="hidden sm:inline">Kaldığım Yer</span>
                        </button>
                        <button
                            onClick={handleReset}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-rose-900/50 text-slate-400 hover:text-rose-400 text-[10px] sm:text-xs font-bold rounded-lg transition-all border border-slate-700 flex items-center gap-2"
                        >
                            <span>🗑️</span>
                            <span className="hidden sm:inline">Sıfırla</span>
                        </button>
                        <ShareButton
                            targetRef={standingsRef}
                            championName={liveStandings[0]?.name}
                        />
                        <TeamLoyaltySelector teams={activeTeams} />
                    </div>
                </div>

                {/* Split Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                    {/* Left Column: Standings (Sticky) */}
                    <div className="flex flex-col gap-4 relative">
                        <div ref={standingsRef} className="sticky top-14 z-10">
                            <StandingsTable teams={liveStandings} playoffSpots={4} relegationSpots={0} initialRanks={initialRanks} compact={true} />
                        </div>
                    </div>

                    {/* Right Column: Fixtures */}
                    <div className="flex flex-col">
                        <FixtureList
                            matches={activeMatches}
                            overrides={overrides}
                            onScoreChange={handleScoreChange}
                            teamRanks={currentRanks}
                        />
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

            {/* Achievements Panel Modal */}
            <AchievementsPanel
                isOpen={showAchievements}
                onClose={() => setShowAchievements(false)}
            />
        </main>
    );
}

export default function OneLigAnasayfaPage() {
    return (
        <Suspense fallback={
            <div className="h-[calc(100vh-64px)] flex items-center justify-center text-slate-400">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
            </div>
        }>
            <CalculatorContent />
        </Suspense>
    );
}
