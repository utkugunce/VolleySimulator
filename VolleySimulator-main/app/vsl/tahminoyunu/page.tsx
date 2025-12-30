"use client";

import { useEffect, useState, useRef, Suspense, useMemo } from "react";
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

    const [loading, setLoading] = useState(true);
    const standingsRef = useRef<HTMLDivElement>(null);

    // Data State
    const [allTeams, setAllTeams] = useState<TeamStats[]>([]);
    const [allMatches, setAllMatches] = useState<Match[]>([]);

    // UI State
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
        const saved = localStorage.getItem('vslGroupScenarios');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setOverrides(parsed);
            } catch (e) { console.error(e); }
        }
    }, []);

    async function fetchData() {
        try {
            setLoading(true);
            const res = await fetch("/api/vsl");
            if (!res.ok) throw new Error("Veri çekilemedi");
            const data = await res.json();

            let teamsData: any[] = [];
            let matchesData: any[] = [];

            if (data.teams && Array.isArray(data.teams)) {
                teamsData = data.teams;
            }

            if (data.fixture && Array.isArray(data.fixture)) {
                matchesData = data.fixture.map((m: any) => ({
                    ...m,
                    matchDate: m.date
                }));
            }

            setAllTeams(teamsData);
            setAllMatches(matchesData);

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

    // Persist overrides to localStorage
    useEffect(() => {
        localStorage.setItem('vslGroupScenarios', JSON.stringify(overrides));
    }, [overrides]);

    const handleReset = () => {
        if (!confirm("Tüm Sultanlar Ligi tahminleriniz silinecek. Emin misiniz?")) return;
        setOverrides({});
        localStorage.removeItem('vslGroupScenarios');
        showToast("Sultanlar Ligi tahminleri sıfırlandı", "success");
    };

    // Memoize standings calculations
    const initialStandings = useMemo(() =>
        calculateLiveStandings(allTeams, allMatches, {}),
        [allTeams, allMatches]
    );

    const initialRanks = useMemo(() => {
        const ranks = new Map<string, number>();
        initialStandings.forEach((team, idx) => ranks.set(team.name, idx + 1));
        return ranks;
    }, [initialStandings]);

    const liveStandings = useMemo(() =>
        calculateLiveStandings(allTeams, allMatches, overrides),
        [allTeams, allMatches, overrides]
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
                league: 'Sultanlar Ligi',
                groupScenarios: overrides,
                date: new Date().toISOString()
            };
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
            const a = document.createElement('a');
            a.href = dataStr;
            a.download = `vsl-tahmin-${new Date().toLocaleDateString('tr-TR')}.json`;
            a.click();
            showToast("Sultanlar Ligi senaryosu indirildi", "success");
        } catch (e) { console.error(e); }
    };

    const handleScrollToNextMatch = () => {
        const nextMatch = allMatches.find(m => !m.isPlayed && !overrides[`${m.homeTeam}-${m.awayTeam}`]);
        if (nextMatch) {
            const id = `match-${nextMatch.homeTeam}-${nextMatch.awayTeam}`;
            const el = document.getElementById(id);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                el.classList.add('ring-2', 'ring-red-500');
                setTimeout(() => el.classList.remove('ring-2', 'ring-red-500'), 2000);
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
                    localStorage.setItem('vslGroupScenarios', JSON.stringify(json.groupScenarios));
                    setOverrides(json.groupScenarios);
                }
                showToast("Sultanlar Ligi senaryosu yüklendi", "success");
            } catch (err) { console.error(err); }
        }
        reader.readAsText(file);
        e.target.value = '';
    }

    if (loading) {
        return (
            <div className="h-[calc(100vh-64px)] flex items-center justify-center text-slate-400">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-slate-950 text-slate-100 p-1 sm:p-2 font-sans">
            <div className="w-full max-w-7xl mx-auto flex flex-col h-full gap-2">

                <PageHeader
                    title="Vodafone Sultanlar Ligi"
                    subtitle="Tahmin Oyunu"
                />

                {/* Action Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-end gap-3 p-2 bg-slate-900/40 rounded-xl border border-slate-800">
                    {/* Actions */}
                    <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar pb-1 sm:pb-0 justify-end">
                        {/* Import/Export buttons */}
                        <div className="flex items-center gap-2 shrink-0">
                            <input
                                type="file"
                                accept=".json"
                                onChange={handleImportAllScenarios}
                                className="hidden"
                                id="import-upload-vsl"
                            />
                            <label
                                htmlFor="import-upload-vsl"
                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1"
                                title="Senaryo Yükle"
                            >
                                <span>📂</span>
                                <span className="hidden sm:inline">Yükle</span>
                            </label>
                            <button
                                onClick={handleSaveAllScenarios}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1"
                                title="Senaryoyu Kaydet"
                            >
                                <span>💾</span>
                                <span className="hidden sm:inline">Kaydet</span>
                            </button>
                        </div>

                        <div className="w-px h-4 bg-slate-700 hidden sm:block shrink-0"></div>

                        <div className="flex items-center gap-2 shrink-0">
                            <button
                                onClick={handleScrollToNextMatch}
                                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-bold rounded-lg transition-all border border-slate-700 flex items-center gap-1"
                                title="Son kaldığım maça git"
                            >
                                <span>📍</span>
                                <span className="hidden sm:inline">Kaldığım Yer</span>
                            </button>
                            <button
                                onClick={handleReset}
                                className="px-3 py-1.5 bg-slate-800 hover:bg-rose-900/50 text-slate-400 hover:text-rose-400 text-xs font-bold rounded-lg transition-all border border-slate-700 flex items-center gap-1"
                            >
                                <span>🗑️</span>
                                <span className="hidden sm:inline">Sıfırla</span>
                            </button>
                            <ShareButton
                                targetRef={standingsRef}
                                championName={liveStandings[0]?.name}
                            />
                        </div>
                    </div>
                </div>

                {/* Split Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                    {/* Left Column: Standings (Sticky) */}
                    <div className="flex flex-col gap-4 relative">
                        <div ref={standingsRef} className="sticky top-14 z-10">
                            <StandingsTable
                                teams={liveStandings}
                                playoffSpots={4}
                                relegationSpots={2}
                                initialRanks={initialRanks}
                                compact={true}
                            />
                        </div>
                    </div>

                    {/* Right Column: Fixtures */}
                    <div className="flex flex-col">
                        <FixtureList
                            matches={allMatches}
                            overrides={overrides}
                            onScoreChange={handleScoreChange}
                            teamRanks={currentRanks}
                            totalTeams={allTeams.length}
                            relegationSpots={2}
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

export default function VSLTahminOyunuPage() {
    return (
        <Suspense fallback={
            <div className="h-[calc(100vh-64px)] flex items-center justify-center text-slate-400">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            </div>
        }>
            <CalculatorContent />
        </Suspense>
    );
}
