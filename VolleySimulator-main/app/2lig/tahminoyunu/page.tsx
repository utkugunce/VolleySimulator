"use client";

import { useEffect, useState, useRef, Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { TeamStats, Match, Achievement } from "../../types";
import PageHeader from "../../components/PageHeader";
import { useToast, AchievementToast, AchievementsPanel } from "../../components";
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

    // Load saved scenarios on mount
    useEffect(() => {
        const saved = localStorage.getItem('groupScenarios');
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
            const res = await fetch("/api/scrape");
            if (!res.ok) throw new Error("Veri çekilemedi");
            const data = await res.json();

            // Robust handling for potential mixed data or missing keys
            let teamsData: any[] = [];
            let matchesData: any[] = [];

            if (data.teams && Array.isArray(data.teams)) {
                // Check if matches are mixed in teams array
                const mixed = data.teams;
                teamsData = mixed.filter((item: any) => item.name && !item.homeTeam);
                matchesData = mixed.filter((item: any) => item.homeTeam && item.awayTeam);
            }

            // If data.matches or data.fixture exists explicitly, use it
            if (data.matches && Array.isArray(data.matches) && data.matches.length > 0) {
                matchesData = data.matches;
            } else if (data.fixture && Array.isArray(data.fixture) && data.fixture.length > 0) {
                matchesData = data.fixture;
            }

            setAllTeams(teamsData);
            setAllMatches(matchesData);

            const uniqueGroups = [...new Set(teamsData.map((t: TeamStats) => t.groupName))].sort((a: any, b: any) => {
                const numA = parseInt(a.match(/\d+/)?.[0] || "0");
                const numB = parseInt(b.match(/\d+/)?.[0] || "0");
                return numA - numB;
            });
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

    // Persist overrides to localStorage compatible format
    useEffect(() => {
        if (!selectedGroup) return;

        const saved = localStorage.getItem('groupScenarios');
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

        localStorage.setItem('groupScenarios', JSON.stringify(newGlobalObj));

    }, [overrides, groups, allMatches, selectedGroup]);


    const handleReset = () => {
        if (!confirm("Tüm tahminleriniz silinecek (Grup + Playoff). Emin misiniz?")) return;
        setOverrides({});
        localStorage.removeItem('groupScenarios');
        localStorage.removeItem('playoffScenarios');
        showToast("Tüm tahminler sıfırlandı", "success");
    };

    const activeGroup = selectedGroup || groups[0];

    // Memoize filtered data to prevent recalculation
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

    // Export / Import Handlers
    const handleSaveAllScenarios = () => {
        try {
            const exportData = {
                league: '2. Lig',
                groupScenarios: JSON.parse(localStorage.getItem('groupScenarios') || '{}'),
                date: new Date().toISOString()
            };
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
            const a = document.createElement('a');
            a.href = dataStr;
            a.download = `senaryo-${new Date().toLocaleDateString('tr-TR')}.json`;
            a.click();
            showToast("Senaryo indirildi", "success");
        } catch (e) { console.error(e); }
    };

    const handleScrollToNextMatch = () => {
        // Find the first match that is NOT played and does NOT have an override.
        // Or finding the first match where the user needs to input?
        // User said "son tahmin ettiğim maçtan bir sonraki mac".
        // If I have predictions 1, 2, 3... 4th is empty. Go to 4.

        // Find index of first incomplete match (not played and no override)
        // AND ensure it's in the current activeMatches list.
        const nextMatch = activeMatches.find(m => !m.isPlayed && !overrides[`${m.homeTeam}-${m.awayTeam}`]);

        if (nextMatch) {
            const id = `match-${nextMatch.homeTeam}-${nextMatch.awayTeam}`;
            const el = document.getElementById(id);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // Optional: Flash the element?
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
                    // Convert ||| separator to - separator (for compatibility with old format)
                    const convertedScenarios: Record<string, Record<string, string>> = {};
                    for (const [groupName, groupData] of Object.entries(json.groupScenarios)) {
                        convertedScenarios[groupName] = {};
                        for (const [matchKey, score] of Object.entries(groupData as Record<string, string>)) {
                            // Convert "homeTeam|||awayTeam" to "homeTeam-awayTeam"
                            const newKey = matchKey.includes('|||')
                                ? matchKey.replace('|||', '-')
                                : matchKey;
                            convertedScenarios[groupName][newKey] = score;
                        }
                    }

                    localStorage.setItem('groupScenarios', JSON.stringify(convertedScenarios));
                    let flat: Record<string, string> = {};
                    Object.values(convertedScenarios).forEach((obj: any) => flat = { ...flat, ...obj });
                    setOverrides(flat);
                }

                // Also import playoff scenarios if present
                if (json.playoffScenarios) {
                    localStorage.setItem('playoffScenarios', JSON.stringify(json.playoffScenarios));
                }

                showToast("Senaryo Yüklendi (Grup + Playoff)", "success");
            } catch (err) { console.error(err); }
        }
        reader.readAsText(file);
        e.target.value = '';
    }


    if (loading) {
        return (
            <div className="h-[calc(100vh-64px)] flex items-center justify-center text-slate-400">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-slate-950 text-slate-100 p-1 sm:p-2 font-sans">
            <div className="w-full max-w-7xl mx-auto flex flex-col h-full gap-2">

                {/* Header */}
                <PageHeader
                    title="Kadınlar 2. Lig"
                    subtitle="Tahmin Oyunu"
                    onExport={handleSaveAllScenarios}
                    onImport={handleImportAllScenarios}
                />

                {/* Action Bar (Group Selection + Reset/Share) */}
                <div className="flex items-center justify-between gap-2 p-2 bg-slate-900/40 rounded-xl border border-slate-800">
                    {/* Group Selection */}
                    <div className="flex gap-1 items-center flex-wrap flex-1 justify-start">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest hidden sm:inline mr-1 whitespace-nowrap">GRUP:</span>
                        {groups.map(groupName => (
                            <button
                                key={groupName}
                                onClick={() => setSelectedGroup(groupName)}
                                className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase transition-all whitespace-nowrap border ${activeGroup === groupName
                                    ? 'bg-emerald-600 text-white shadow shadow-emerald-600/20 border-emerald-500'
                                    : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 border-slate-700'
                                    }`}
                            >
                                {groupName.replace(' Grubu', '')}
                            </button>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                            onClick={handleScrollToNextMatch}
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-bold rounded-lg transition-all border border-slate-700"
                            title="Son kaldığım maça git"
                        >
                            Kaldığım Yer
                        </button>
                        <button
                            onClick={handleReset}
                            className="px-2 py-1 bg-slate-800 hover:bg-rose-900/50 text-slate-400 hover:text-rose-400 text-xs font-bold rounded-lg transition-all border border-slate-700"
                        >
                            Sıfırla
                        </button>
                        <ShareButton
                            targetRef={standingsRef}
                            championName={liveStandings[0]?.name}
                        />
                    </div>
                </div>

                {/* Split Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                    {/* Left Column: Standings (Sticky) */}
                    <div className="flex flex-col gap-4 relative">
                        <div ref={standingsRef} className="sticky top-14 z-10">
                            <StandingsTable teams={liveStandings} initialRanks={initialRanks} compact={true} />
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

export default function TwoLigAnasayfaPage() {
    return (
        <Suspense fallback={
            <div className="h-[calc(100vh-64px)] flex items-center justify-center text-slate-400">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            </div>
        }>
            <CalculatorContent />
        </Suspense>
    );
}
