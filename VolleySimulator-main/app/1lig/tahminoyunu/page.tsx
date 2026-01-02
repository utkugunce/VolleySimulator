"use client";

import { useEffect, useState, useRef, Suspense, useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { TeamStats, Match, Achievement } from "../../types";
import PageHeader from "../../components/PageHeader";
import { useToast, AchievementToast, AchievementsPanel } from "../../components";
import StandingsTable from "../../components/Calculator/StandingsTable";
import FixtureList from "../../components/Calculator/FixtureList";
import ShareButton from "../../components/ShareButton";
import { calculateLiveStandings } from "../../utils/calculatorUtils";
import { calculateElo } from "../../utils/eloCalculator";
import { useGameState, ACHIEVEMENTS } from "../../utils/gameState";
import { sounds } from "../../utils/sounds";

function CalculatorContent() {
    const { showToast, showUndoToast } = useToast();
    const searchParams = useSearchParams();
    const groupParam = searchParams.get("group");

    const [loading, setLoading] = useState(true);
    const standingsRef = useRef<HTMLDivElement>(null);

    // Data State
    const [allTeams, setAllTeams] = useState<TeamStats[]>([]);
    const [allMatches, setAllMatches] = useState<Match[]>([]);
    const [groups, setGroups] = useState<string[]>([]);

    // UI State
    const [selectedGroup, setSelectedGroup] = useState<string>("A GRUBU");
    const [overrides, setOverrides] = useState<Record<string, string>>({});
    const [showAchievements, setShowAchievements] = useState(false);
    const [showAutoMenu, setShowAutoMenu] = useState(false);
    const [showResetMenu, setShowResetMenu] = useState(false);
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
                teamsData = data.teams.map((t: any) => ({
                    ...t,
                    name: t.name.toLocaleUpperCase('tr-TR'),
                    groupName: t.groupName.includes('A') ? 'A GRUBU' : 'B GRUBU'
                }));
            }

            if (data.fixture && Array.isArray(data.fixture)) {
                matchesData = data.fixture.map((m: any) => ({
                    ...m,
                    homeTeam: m.homeTeam.toLocaleUpperCase('tr-TR'),
                    awayTeam: m.awayTeam.toLocaleUpperCase('tr-TR'),
                    matchDate: m.date,
                    groupName: m.groupName.includes('A') ? 'A GRUBU' : 'B GRUBU'
                }));
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


    const handleResetGroup = () => {
        if (!confirm(`${activeGroup} grubundaki tahminleriniz silinecek. Emin misiniz?`)) return;

        const newOverrides = { ...overrides };
        const groupMatches = allMatches.filter(m => m.groupName === activeGroup);

        groupMatches.forEach(m => {
            const id = `${m.homeTeam}-${m.awayTeam}`;
            delete newOverrides[id];
        });

        setOverrides(newOverrides);
        showToast(`${activeGroup} tahminleri sıfırlandı`, "success");
    };

    const handleResetAll = () => {
        const previousOverrides = { ...overrides };
        setOverrides({});
        localStorage.removeItem('1ligGroupScenarios');
        showUndoToast("Tüm 1. Lig tahminleri sıfırlandı", () => {
            setOverrides(previousOverrides);
            localStorage.setItem('1ligGroupScenarios', JSON.stringify(previousOverrides));
        });
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

    // Auto Simulation Logic
    const handleSimulateSmart = () => {
        if (!confirm(`${activeGroup} grubu için oynanmamış maçlar güncel güç dengelerine göre doldurulacak. Onaylıyor musunuz?`)) return;

        const newOverrides = { ...overrides };
        let count = 0;

        // Calculate Elo ratings for this group based on played matches
        const eloRatings = calculateElo(activeTeams, activeMatches.filter(m => m.isPlayed));

        activeMatches.forEach(match => {
            if (match.isPlayed || newOverrides[`${match.homeTeam}-${match.awayTeam}`]) return;

            const homeElo = eloRatings.get(match.homeTeam) || 1200;
            const awayElo = eloRatings.get(match.awayTeam) || 1200;

            const winProb = 1 / (1 + Math.pow(10, (awayElo - homeElo) / 400));

            // Add randomness to avoid identical results for close teams (±7.5%)
            // This prevents "all 3-2" scenarios when teams have similar Elo
            const randomFactor = (Math.random() * 0.15) - 0.075;
            const finalProb = winProb + randomFactor;

            let score = "0-0";
            if (finalProb > 0.60) score = "3-0";
            else if (finalProb > 0.55) score = "3-1";
            else if (finalProb > 0.50) score = "3-2";
            else if (finalProb > 0.45) score = "2-3";
            else if (finalProb > 0.40) score = "1-3";
            else score = "0-3";

            newOverrides[`${match.homeTeam}-${match.awayTeam}`] = score;
            count++;
        });

        setOverrides(newOverrides);
        if (count > 0) {
            sounds.levelUp();
            showToast(`${count} maç güç dengelerine göre tahmin edildi! 🧠`, "success");
            addXP(count * 2);
        } else {
            showToast("Doldurulacak maç bulunamadı.", "info");
        }
    };

    const handleSimulateRandom = () => {
        if (!confirm(`${activeGroup} grubu için oynanmamış maçlar RASTGELE skorlarla doldurulacak. Onaylıyor musunuz?`)) return;

        const newOverrides = { ...overrides };
        let count = 0;
        const scores = ["3-0", "3-1", "3-2", "2-3", "1-3", "0-3"];

        activeMatches.forEach(match => {
            if (match.isPlayed || newOverrides[`${match.homeTeam}-${match.awayTeam}`]) return;
            const randomScore = scores[Math.floor(Math.random() * scores.length)];
            newOverrides[`${match.homeTeam}-${match.awayTeam}`] = randomScore;
            count++;
        });

        setOverrides(newOverrides);
        if (count > 0) {
            sounds.levelUp();
            showToast(`${count} maç rastgele tahmin edildi! 🎲`, "success");
            addXP(count * 2);
        } else {
            showToast("Doldurulacak maç bulunamadı.", "info");
        }
    };


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
                    title="Arabica Coffee House"
                    subtitle="Kadınlar Voleybol 1.Ligi"
                />

                {/* Action Bar (Group Selection + Actions) */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-2 bg-slate-900/40 rounded-xl border border-slate-800">
                    {/* Group Selection */}
                    <div className="flex gap-2 items-center w-full sm:w-auto">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest hidden sm:inline whitespace-nowrap">GRUP:</span>
                        <select
                            value={activeGroup}
                            onChange={(e) => setSelectedGroup(e.target.value)}
                            className="appearance-none bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg px-4 py-2 border border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all outline-none cursor-pointer min-w-[120px]"
                        >
                            {groups.map(groupName => (
                                <option key={groupName} value={groupName} className="bg-slate-900">
                                    {groupName}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Actions - Removed overflow-x-auto to prevent clipping */}
                    <div className="flex items-center gap-2 w-full sm:w-auto pb-1 sm:pb-0 justify-between sm:justify-end flex-wrap sm:flex-nowrap">
                        {/* Import/Export buttons moved here */}
                        <div className="flex items-center gap-2 shrink-0">
                            {/* Auto Simulate Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowAutoMenu(!showAutoMenu)}
                                    className={`px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1 shadow-lg shadow-amber-500/20 ${showAutoMenu ? 'ring-2 ring-amber-400' : ''}`}
                                >
                                    <span>⚡</span>
                                    <span className="hidden sm:inline">Otomatik</span>
                                    <span className="text-[8px] ml-0.5">▼</span>
                                </button>

                                {showAutoMenu && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setShowAutoMenu(false)}></div>
                                        <div className="absolute top-full left-0 sm:left-auto sm:right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                            <button
                                                onClick={() => { handleSimulateSmart(); setShowAutoMenu(false); }}
                                                className="w-full text-left px-4 py-3 hover:bg-slate-800 transition-colors flex items-center gap-3 border-b border-slate-800"
                                            >
                                                <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-lg">🧠</div>
                                                <div>
                                                    <div className="text-xs font-bold text-white">Güç Dengelerine Göre</div>
                                                    <div className="text-[9px] text-slate-400">Takım güçlerine göre gerçekçi tahmin</div>
                                                </div>
                                            </button>
                                            <button
                                                onClick={() => { handleSimulateRandom(); setShowAutoMenu(false); }}
                                                className="w-full text-left px-4 py-3 hover:bg-slate-800 transition-colors flex items-center gap-3"
                                            >
                                                <div className="w-8 h-8 rounded-full bg-fuchsia-500/20 text-fuchsia-400 flex items-center justify-center text-lg">🎲</div>
                                                <div>
                                                    <div className="text-xs font-bold text-white">Rastgele Dağıt</div>
                                                    <div className="text-[9px] text-slate-400">Tamamen şansa dayalı sonuçlar</div>
                                                </div>
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>

                            <input
                                type="file"
                                accept=".json"
                                onChange={handleImportAllScenarios}
                                className="hidden"
                                id="import-upload-1lig"
                            />
                            <label
                                htmlFor="import-upload-1lig"
                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1"
                                title="Senaryo Yükle"
                            >
                                <span className="hidden sm:inline">Yükle</span>
                            </label>
                            <button
                                onClick={handleSaveAllScenarios}
                                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1"
                                title="Senaryoyu Kaydet"
                            >
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
                                <span className="hidden sm:inline">Kaldığım Yer</span>
                            </button>
                            {/* Reset Dropdown */}
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
                                                    <div className="text-[9px] text-slate-400">Sadece {activeGroup} silinir</div>
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

                {/* Split Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                    {/* Left Column: Standings (Sticky) */}
                    <div className="flex flex-col gap-4 relative">
                        <div ref={standingsRef} className="sticky top-14 z-10">
                            <StandingsTable
                                teams={liveStandings}
                                playoffSpots={4}
                                relegationSpots={activeGroup.includes('B') ? 2 : 0}
                                initialRanks={initialRanks}
                            />
                        </div>
                    </div>

                    {/* Right Column: Fixtures */}
                    <div className="flex flex-col">
                        <FixtureList
                            matches={activeMatches}
                            overrides={overrides}
                            onScoreChange={handleScoreChange}
                            teamRanks={currentRanks}
                            totalTeams={activeTeams.length}
                            relegationSpots={activeGroup.includes('B') ? 2 : 0}
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
