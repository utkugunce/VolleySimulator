"use client";

import { useEffect, useState, useRef, useMemo } from "react";
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

interface TwoLigCalculatorClientProps {
    initialTeams: TeamStats[];
    initialMatches: Match[];
}

export default function TwoLigCalculatorClient({ initialTeams, initialMatches }: TwoLigCalculatorClientProps) {
    const { showToast, showUndoToast } = useToast();
    const searchParams = useSearchParams();
    const groupParam = searchParams.get("group");
    const standingsRef = useRef<HTMLDivElement>(null);

    // Normalize data (Matching original fetchData logic)
    const normalizedData = useMemo(() => {
        let teamsData: any[] = initialTeams.filter((item: any) => item.name && !item.homeTeam);
        let matchesData: any[] = initialMatches;

        return { teams: teamsData, matches: matchesData };
    }, [initialTeams, initialMatches]);

    // Data State
    const [allTeams] = useState<TeamStats[]>(normalizedData.teams);
    const [allMatches] = useState<Match[]>(normalizedData.matches);
    const groups = useMemo(() => [...new Set(normalizedData.teams.map(t => t.groupName))].sort((a: any, b: any) => {
        const numA = parseInt(a.match(/\d+/)?.[0] || "0");
        const numB = parseInt(b.match(/\d+/)?.[0] || "0");
        return numA - numB;
    }), [normalizedData.teams]);

    // UI State
    const [selectedGroup, setSelectedGroup] = useState<string>(groupParam && groups.includes(groupParam) ? groupParam : (groups[0] || "1. GRUP"));
    const [overrides, setOverrides] = useState<Record<string, string>>({});
    const [showAchievements, setShowAchievements] = useState(false);
    const [showAutoMenu, setShowAutoMenu] = useState(false);
    const [showResetMenu, setShowResetMenu] = useState(false);
    const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);

    // Game State
    const { gameState, addXP, recordPrediction, unlockAchievement, hasAchievement } = useGameState();

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

    const activeGroup = selectedGroup || groups[0];

    const activeTeams = useMemo(() =>
        allTeams.filter(t => t.groupName === activeGroup),
        [allTeams, activeGroup]
    );

    const activeMatches = useMemo(() =>
        allMatches.filter(m => m.groupName === activeGroup),
        [allMatches, activeGroup]
    );

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
        localStorage.removeItem('groupScenarios');
        showUndoToast("Tüm 2. Lig tahminleri sıfırlandı", () => {
            setOverrides(previousOverrides);
            localStorage.setItem('groupScenarios', JSON.stringify(previousOverrides));
        });
    };

    // Memoize standings calculations
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
        const nextMatch = activeMatches.find(m => !m.isPlayed && !overrides[`${m.homeTeam}-${m.awayTeam}`]);
        if (nextMatch) {
            const id = `match-${nextMatch.homeTeam}-${nextMatch.awayTeam}`;
            const el = document.getElementById(id);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                el.classList.add('ring-2', 'ring-emerald-500');
                setTimeout(() => el.classList.remove('ring-2', 'ring-emerald-500'), 2000);
            }
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
                            const newKey = matchKey.includes('|||') ? matchKey.replace('|||', '-') : matchKey;
                            convertedScenarios[groupName][newKey] = score;
                        }
                    }
                    localStorage.setItem('groupScenarios', JSON.stringify(convertedScenarios));
                    let flat: Record<string, string> = {};
                    Object.values(convertedScenarios).forEach((obj: any) => flat = { ...flat, ...obj });
                    setOverrides(flat);
                }
                showToast("Senaryo yüklendi", "success");
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
        const eloRatings = calculateElo(activeTeams, activeMatches.filter(m => m.isPlayed));
        activeMatches.forEach(match => {
            if (match.isPlayed || newOverrides[`${match.homeTeam}-${match.awayTeam}`]) return;
            const homeElo = eloRatings.get(match.homeTeam) || 1200;
            const awayElo = eloRatings.get(match.awayTeam) || 1200;
            const winProb = 1 / (1 + Math.pow(10, (awayElo - homeElo) / 400));
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
        }
    };

    return (
        <main className="min-h-screen bg-slate-950 text-slate-100 p-1 sm:p-2 font-sans">
            <div className="w-full max-w-7xl mx-auto flex flex-col h-full gap-2">
                <PageHeader
                    title="Kadınlar 2. Lig"
                    subtitle="Tahmin Oyunu"
                />

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-2 bg-slate-900/40 rounded-xl border border-slate-800">
                    <div className="flex gap-2 items-center w-full sm:w-auto">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest hidden sm:inline whitespace-nowrap">GRUP:</span>
                        <select
                            value={activeGroup}
                            onChange={(e) => setSelectedGroup(e.target.value)}
                            className="flex-1 sm:flex-none px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg border border-slate-700 hover:border-slate-600 outline-none cursor-pointer transition-all focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                        >
                            {groups.map(groupName => (
                                <option key={groupName} value={groupName} className="bg-slate-900 text-white py-2">
                                    {groupName}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto pb-1 sm:pb-0 justify-between sm:justify-end flex-wrap sm:flex-nowrap">
                        <div className="flex items-center gap-2 shrink-0">
                            <div className="relative">
                                <button
                                    onClick={() => setShowAutoMenu(!showAutoMenu)}
                                    className={`px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1 shadow-lg shadow-amber-500/20 ${showAutoMenu ? 'ring-2 ring-amber-400' : ''}`}
                                >
                                    <span className="hidden sm:inline">Otomatik</span>
                                    <span className="text-[8px] ml-0.5">▼</span>
                                </button>
                                {showAutoMenu && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setShowAutoMenu(false)}></div>
                                        <div className="absolute top-full right-0 sm:left-auto sm:right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                            <button
                                                onClick={() => { handleSimulateSmart(); setShowAutoMenu(false); }}
                                                className="w-full text-left px-4 py-3 hover:bg-slate-800 transition-colors flex items-center gap-3 border-b border-slate-800"
                                            >
                                                <div>
                                                    <div className="text-xs font-bold text-white">Güç Dengelerine Göre</div>
                                                    <div className="text-[9px] text-slate-400">Takım güçlerine göre gerçekçi tahmin</div>
                                                </div>
                                            </button>
                                            <button
                                                onClick={() => { handleSimulateRandom(); setShowAutoMenu(false); }}
                                                className="w-full text-left px-4 py-3 hover:bg-slate-800 transition-colors flex items-center gap-3"
                                            >
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
                                id="import-upload-2lig"
                            />
                            <label
                                htmlFor="import-upload-2lig"
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

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-4 relative">
                        <div ref={standingsRef} className="sticky top-14 z-10 max-h-[calc(100vh-120px)] overflow-auto custom-scrollbar">
                            <StandingsTable teams={liveStandings} initialRanks={initialRanks} compact={true} />
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <FixtureList
                            matches={activeMatches}
                            overrides={overrides}
                            onScoreChange={handleScoreChange}
                            teamRanks={currentRanks}
                            totalTeams={activeTeams.length}
                            relegationSpots={2}
                        />
                    </div>
                </div>
            </div>

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
        </main>
    );
}
