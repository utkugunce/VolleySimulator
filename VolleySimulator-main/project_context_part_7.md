# Project Application Context - Part 7

## File: app\cev-cl\tahminoyunu\CEVCLCalculatorClient.tsx
```
"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { TeamStats, Match, Achievement } from "../../types";

import { useToast, AchievementToast, AchievementsPanel } from "../../components";
import StandingsTable from "../../components/Calculator/StandingsTable";
import FixtureList from "../../components/Calculator/FixtureList";
import ShareButton from "../../components/ShareButton";
import { calculateLiveStandings } from "../../utils/calculatorUtils";
import { calculateElo } from "../../utils/eloCalculator";
import { useGameState, ACHIEVEMENTS } from "../../utils/gameState";
import { sounds } from "../../utils/sounds";

interface CEVCLCalculatorClientProps {
    initialTeams: TeamStats[];
    initialMatches: Match[];
}

export default function CEVCLCalculatorClient({ initialTeams, initialMatches }: CEVCLCalculatorClientProps) {
    const { showToast, showUndoToast } = useToast();
    const standingsRef = useRef<HTMLDivElement>(null);

    // Normalize data (Matching original fetchData logic)
    const normalizedTeams = useMemo(() => initialTeams.map((t: any) => ({
        ...t,
        name: t.name.toLocaleUpperCase('tr-TR'),
        groupName: t.groupName.replace('Pool ', '') + ' GRUBU'
    })), [initialTeams]);

    const normalizedMatches = useMemo(() => initialMatches.map((m: any) => ({
        ...m,
        matchDate: m.date || m.matchDate,
        homeTeam: m.homeTeam.toLocaleUpperCase('tr-TR'),
        awayTeam: m.awayTeam.toLocaleUpperCase('tr-TR'),
        groupName: m.groupName.replace('Pool ', '') + ' GRUBU'
    })), [initialMatches]);

    // Data State
    const [allTeams] = useState<TeamStats[]>(normalizedTeams);
    const [allMatches] = useState<Match[]>(normalizedMatches);
    const [selectedPool, setSelectedPool] = useState<string>("A GRUBU");

    // UI State
    const [overrides, setOverrides] = useState<Record<string, string>>({});
    const [showAchievements, setShowAchievements] = useState(false);
    const [showAutoMenu, setShowAutoMenu] = useState(false);
    const [showResetMenu, setShowResetMenu] = useState(false);
    const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);

    // Game State
    const { gameState, addXP, recordPrediction, unlockAchievement, hasAchievement } = useGameState();

    const pools = ["A GRUBU", "B GRUBU", "C GRUBU", "D GRUBU", "E GRUBU"];

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
        localStorage.setItem('cevclGroupScenarios', JSON.stringify(overrides));
    }, [overrides]);

    const handleResetGroup = () => {
        if (!confirm(`${selectedPool} tahminleriniz silinecek. Emin misiniz?`)) return;
        const newOverrides = { ...overrides };
        const groupMatches = allMatches
            .filter(m => m.groupName === selectedPool)
            .map(m => `${m.homeTeam}-${m.awayTeam}`);
        groupMatches.forEach(matchId => {
            delete newOverrides[matchId];
        });
        setOverrides(newOverrides);
        showToast(`${selectedPool} tahminleri sıfırlandı`, "success");
    };

    const handleResetAll = () => {
        const previousOverrides = { ...overrides };
        setOverrides({});
        localStorage.removeItem('cevclGroupScenarios');
        showUndoToast("Şampiyonlar Ligi tahminleri sıfırlandı", () => {
            setOverrides(previousOverrides);
            localStorage.setItem('cevclGroupScenarios', JSON.stringify(previousOverrides));
        });
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

    // Export / Import Handlers
    const handleSaveAllScenarios = () => {
        try {
            const exportData = {
                league: 'CEV Şampiyonlar Ligi',
                groupScenarios: overrides,
                date: new Date().toISOString()
            };
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
            const a = document.createElement('a');
            a.href = dataStr;
            a.download = `cevcl-tahmin-${new Date().toLocaleDateString('tr-TR')}.json`;
            a.click();
            showToast("Şampiyonlar Ligi senaryosu indirildi", "success");
        } catch (e) { console.error(e); }
    };

    const handleScrollToNextMatch = () => {
        const nextMatch = poolMatches.find(m => !m.isPlayed && !overrides[`${m.homeTeam}-${m.awayTeam}`]);
        if (nextMatch) {
            const id = `match-${nextMatch.homeTeam}-${nextMatch.awayTeam}`;
            const el = document.getElementById(id);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                el.classList.add('ring-2', 'ring-blue-500');
                setTimeout(() => el.classList.remove('ring-2', 'ring-blue-500'), 2000);
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
                    localStorage.setItem('cevclGroupScenarios', JSON.stringify(json.groupScenarios));
                    setOverrides(json.groupScenarios);
                }
                showToast("Şampiyonlar Ligi senaryosu yüklendi", "success");
            } catch (err) { console.error(err); }
        }
        reader.readAsText(file);
        e.target.value = '';
    }

    // Auto Simulation Logic
    const handleSimulateSmart = () => {
        if (!confirm("Oynanmamış tüm maçlar güncel güç dengelerine göre otomatik doldurulacak. Onaylıyor musunuz?")) return;
        const newOverrides = { ...overrides };
        let count = 0;
        const eloRatings = calculateElo(poolTeams, poolMatches.filter(m => m.isPlayed));
        poolMatches.forEach(match => {
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
            showToast(`${count} maç güç dengelerine göre tahmin edildi!`, "success");
            addXP(count * 2);
        }
    };

    const handleSimulateRandom = () => {
        if (!confirm("Oynanmamış tüm maçlar RASTGELE skorlarla doldurulacak. Onaylıyor musunuz?")) return;
        const newOverrides = { ...overrides };
        let count = 0;
        const scores = ["3-0", "3-1", "3-2", "2-3", "1-3", "0-3"];
        poolMatches.forEach(match => {
            if (match.isPlayed || newOverrides[`${match.homeTeam}-${match.awayTeam}`]) return;
            const randomScore = scores[Math.floor(Math.random() * scores.length)];
            newOverrides[`${match.homeTeam}-${match.awayTeam}`] = randomScore;
            count++;
        });
        setOverrides(newOverrides);
        if (count > 0) {
            sounds.levelUp();
            showToast(`${count} maç rastgele tahmin edildi!`, "success");
            addXP(count * 2);
        }
    };

    return (
        <main className="min-h-screen bg-slate-950 text-slate-100 p-1 sm:p-2 font-sans">
            <div className="w-full max-w-7xl mx-auto flex flex-col h-full gap-2">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-2 bg-slate-900/40 rounded-xl border border-slate-800">
                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                        <div className="text-center sm:text-left">
                            <h1 className="font-bold text-white text-lg tracking-tight leading-none hidden sm:block">CEV Şampiyonlar Ligi</h1>
                            <p className="text-[10px] text-slate-400 hidden sm:block">Tahmin Oyunu</p>
                        </div>
                        <div className="flex gap-2 items-center w-full sm:w-auto">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest hidden sm:inline whitespace-nowrap">GRUP:</span>
                            <select
                                value={selectedPool}
                                onChange={(e) => setSelectedPool(e.target.value)}
                                title="Havuz Seçin"
                                className="appearance-none bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg px-4 py-2 border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none cursor-pointer min-w-[120px]"
                            >
                                {pools.map(pool => (
                                    <option key={pool} value={pool} className="bg-slate-900">
                                        {pool}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto pb-1 sm:pb-0 justify-end flex-wrap sm:flex-nowrap">
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
                                        <div className="absolute top-full right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
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
                                id="import-upload-cevcl"
                            />
                            <label
                                htmlFor="import-upload-cevcl"
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
                                                    <div className="text-[9px] text-slate-400">Sadece {selectedPool} silinir</div>
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
                    <div className="flex flex-col">
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

```

## File: app\cev-cl\tahminoyunu\page.tsx
```
import { Suspense } from "react";
import { Metadata } from "next";
import { getLeagueData } from "../../utils/serverData";
import CEVCLCalculatorClient from "./CEVCLCalculatorClient";
import ErrorBoundary from "../../components/ErrorBoundary";
import { SkeletonPage } from "../../components/Skeleton";

export const metadata: Metadata = {
    title: "CEV Şampiyonlar Ligi Tahmin Oyunu",
    description: "CEV Kadınlar Şampiyonlar Ligi maç sonuçlarını tahmin edin. Avrupa'nın en iyi takımlarının maçlarını tahmin ederek puan kazanın.",
    openGraph: {
        title: "CEV Şampiyonlar Ligi Tahmin Oyunu | VolleySimulator",
        description: "Şampiyonlar Ligi maç sonuçlarını tahmin edin ve liderlik tablosunda yerinizi alın.",
    },
};

export default async function CEVCLTahminOyunuPage() {
    const { teams, fixture } = await getLeagueData("cev-cl");

    return (
        <ErrorBoundary>
            <Suspense fallback={<SkeletonPage />}>
                <CEVCLCalculatorClient
                    initialTeams={teams}
                    initialMatches={fixture}
                />
            </Suspense>
        </ErrorBoundary>
    );
}

```

## File: app\cev-cup\page.tsx
```
import { redirect } from "next/navigation";

export default function CEVCupPage() {
    redirect("/cev-cup/gunceldurum");
}

```

## File: app\cev-cup\anasayfa\page.tsx
```
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import TeamAvatar from "@/app/components/TeamAvatar";

interface Match {
    id: number;
    round: string;
    leg?: number;
    date: string;
    homeTeam: string;
    awayTeam: string;
    homeScore: number | null;
    awayScore: number | null;
    setScores?: string;
    isPlayed: boolean;
}

interface Team {
    name: string;
    country: string;
}

interface CEVCupData {
    league: string;
    season: string;
    currentStage: string;
    teams: Team[];
    fixture: Match[];
}

const TURKISH_TEAMS = ["Galatasaray Daikin ISTANBUL", "THY ISTANBUL"];
const ROUND_LABELS: Record<string, string> = {
    "16th Finals": "Son 32",
    "8th Finals": "Son 16",
    "Play Off": "Play-Off",
    "4th Finals": "Çeyrek Final",
    "Semi Finals": "Yarı Final",
    "Finals": "Final"
};

export default function CEVCupAnasayfa() {
    const [data, setData] = useState<CEVCupData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/cev-cup")
            .then(res => res.json())
            .then(data => setData(data))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="min-h-screen flex items-center justify-center text-red-500">
                Veri yüklenemedi
            </div>
        );
    }

    const playedMatches = data.fixture.filter(m => m.isPlayed);
    const upcomingMatches = data.fixture.filter(m => !m.isPlayed).slice(0, 8);
    const turkishTeamMatches = data.fixture.filter(m =>
        TURKISH_TEAMS.includes(m.homeTeam) || TURKISH_TEAMS.includes(m.awayTeam)
    );

    // Get Turkish teams progress
    const getTurkishTeamStats = (teamName: string) => {
        const matches = data.fixture.filter(m => m.homeTeam === teamName || m.awayTeam === teamName);
        const played = matches.filter(m => m.isPlayed);
        let wins = 0;
        played.forEach(m => {
            if (m.homeTeam === teamName && (m.homeScore || 0) > (m.awayScore || 0)) wins++;
            if (m.awayTeam === teamName && (m.awayScore || 0) > (m.homeScore || 0)) wins++;
        });
        return { played: played.length, wins };
    };

    return (
        <div className="min-h-screen bg-slate-950">
            {/* Hero Header */}
            <div className="bg-gradient-to-br from-amber-600 via-orange-600 to-amber-800 px-4 py-4 relative overflow-hidden">
                <div className="relative max-w-4xl mx-auto">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-bold text-white mb-1">CEV Cup</h1>
                            <p className="text-white/70 text-sm">Kadınlar • 2025-2026</p>
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-bold text-white">{playedMatches.length}</div>
                            <div className="text-xs text-white/60">Oynanan Maç</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 mt-4 space-y-4 pb-6">
                {/* Current Stage Badge */}
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-center">
                    <div className="text-xs text-amber-400/70 uppercase tracking-wider mb-1">Mevcut Aşama</div>
                    <div className="text-2xl font-bold text-amber-400">
                        {ROUND_LABELS[data.currentStage] || data.currentStage}
                    </div>
                </div>

                {/* Turkish Teams Overview */}
                <div className="bg-slate-900 border border-red-500/30 rounded-2xl overflow-hidden">
                    <div className="bg-red-900/20 px-4 py-3 border-b border-red-500/20">
                        <h3 className="font-bold text-white flex items-center gap-2">
                            <span>🇹🇷</span> Türk Takımları
                        </h3>
                    </div>
                    <div className="divide-y divide-slate-800/50">
                        {TURKISH_TEAMS.map(teamName => {
                            const stats = getTurkishTeamStats(teamName);
                            const nextMatch = data.fixture.find(m =>
                                !m.isPlayed && (m.homeTeam === teamName || m.awayTeam === teamName)
                            );
                            const opponent = nextMatch ?
                                (nextMatch.homeTeam === teamName ? nextMatch.awayTeam : nextMatch.homeTeam) : null;

                            return (
                                <div key={teamName} className="px-4 py-3 flex items-center gap-3">
                                    <TeamAvatar name={teamName} size="sm" />
                                    <div className="flex-1">
                                        <div className="font-medium text-sm text-white">{teamName}</div>
                                        <div className="text-xs text-slate-500">
                                            {stats.wins}G / {stats.played}M
                                            {opponent && (
                                                <span className="text-amber-400 ml-2">
                                                    → vs {opponent}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs text-amber-400 font-bold">
                                            {ROUND_LABELS[data.currentStage]}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Recent Results */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                    <div className="bg-slate-800/50 px-4 py-3 border-b border-slate-800 flex justify-between items-center">
                        <h3 className="font-bold text-white flex items-center gap-2">
                            <span className="text-emerald-400">✓</span> Son Sonuçlar
                        </h3>
                    </div>
                    <div className="divide-y divide-slate-800/50 max-h-64 overflow-y-auto">
                        {playedMatches.slice(-6).reverse().map((match, i) => {
                            const hasTurkish = TURKISH_TEAMS.includes(match.homeTeam) || TURKISH_TEAMS.includes(match.awayTeam);
                            return (
                                <div key={match.id} className={`px-4 py-3 ${hasTurkish ? "bg-red-900/10" : ""}`}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="flex-1 text-right text-sm text-slate-300 truncate flex items-center justify-end gap-1">
                                            {match.homeTeam}
                                            {TURKISH_TEAMS.includes(match.homeTeam) && <span>🇹🇷</span>}
                                        </div>
                                        <div className="px-2 py-0.5 rounded text-xs font-mono bg-emerald-500/20 text-emerald-400">
                                            {match.homeScore} - {match.awayScore}
                                        </div>
                                        <div className="flex-1 text-sm text-slate-300 truncate flex items-center gap-1">
                                            {TURKISH_TEAMS.includes(match.awayTeam) && <span>🇹🇷</span>}
                                            {match.awayTeam}
                                        </div>
                                    </div>
                                    <div className="text-center text-[10px] text-slate-500">
                                        {ROUND_LABELS[match.round] || match.round} • {match.leg === 1 ? "1. Maç" : "2. Maç"}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Upcoming Matches */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                    <div className="bg-slate-800/50 px-4 py-3 border-b border-slate-800">
                        <h3 className="font-bold text-white flex items-center gap-2">
                            <span className="text-amber-400">📅</span> Gelecek Maçlar
                        </h3>
                    </div>
                    <div className="divide-y divide-slate-800/50">
                        {upcomingMatches.map((match, i) => {
                            const hasTurkish = TURKISH_TEAMS.includes(match.homeTeam) || TURKISH_TEAMS.includes(match.awayTeam);
                            return (
                                <div key={match.id} className={`px-4 py-3 ${hasTurkish ? "bg-red-900/10" : ""}`}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="flex-1 text-right text-sm text-slate-300 truncate flex items-center justify-end gap-1">
                                            {match.homeTeam}
                                            {TURKISH_TEAMS.includes(match.homeTeam) && <span>🇹🇷</span>}
                                        </div>
                                        <div className="px-2 py-0.5 rounded text-xs font-mono bg-slate-800 text-slate-500">
                                            vs
                                        </div>
                                        <div className="flex-1 text-sm text-slate-300 truncate flex items-center gap-1">
                                            {TURKISH_TEAMS.includes(match.awayTeam) && <span>🇹🇷</span>}
                                            {match.awayTeam}
                                        </div>
                                    </div>
                                    <div className="text-center text-[10px] text-slate-500">
                                        {ROUND_LABELS[match.round] || match.round} • {match.date?.split('-').reverse().join('.')}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Quick Links */}
                <div className="grid grid-cols-2 gap-3">
                    <Link
                        href="/cev-cup/gunceldurum"
                        className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:bg-slate-800 transition-colors group"
                    >
                        <div className="text-2xl mb-2">📊</div>
                        <div className="font-bold text-white text-sm group-hover:text-amber-400 transition-colors">Güncel Durum</div>
                        <div className="text-xs text-slate-500">Tüm eşleşmeleri gör</div>
                    </Link>
                    <Link
                        href="/cev-cup/stats"
                        className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:bg-slate-800 transition-colors group"
                    >
                        <div className="text-2xl mb-2">📈</div>
                        <div className="font-bold text-white text-sm group-hover:text-amber-400 transition-colors">İstatistikler</div>
                        <div className="text-xs text-slate-500">Takım performansları</div>
                    </Link>
                </div>
            </div>
        </div>
    );
}

```

## File: app\cev-cup\gunceldurum\CEVCupGuncelDurumClient.tsx
```
"use client";

import { useState, useMemo } from "react";

import TeamAvatar from "@/app/components/TeamAvatar";
import LeagueActionBar from "../../components/LeagueTemplate/LeagueActionBar";
import { LEAGUE_CONFIGS } from "../../components/LeagueTemplate/types";

interface CEVCupMatch {
    id: number;
    round: string;
    leg?: number;
    date: string;
    homeTeam: string;
    awayTeam: string;
    homeScore: number | null;
    awayScore: number | null;
    setScores?: string;
    isPlayed: boolean;
}

interface CEVCupTeam {
    name: string;
    country: string;
}

interface CEVCupData {
    league: string;
    season: string;
    currentStage: string;
    teams: CEVCupTeam[];
    fixture: CEVCupMatch[];
}

interface CEVCupGuncelDurumClientProps {
    initialData: CEVCupData;
}

const ROUNDS = ["16th Finals", "8th Finals", "Play Off", "4th Finals", "Semi Finals", "Finals"];
const ROUND_LABELS: Record<string, string> = {
    "16th Finals": "Son 32",
    "8th Finals": "Son 16",
    "Play Off": "Play-Off",
    "4th Finals": "Çeyrek Final",
    "Semi Finals": "Yarı Final",
    "Finals": "Final"
};

const TURKISH_TEAMS = ["Galatasaray Daikin ISTANBUL", "THY ISTANBUL"];

export default function CEVCupGuncelDurumClient({ initialData }: CEVCupGuncelDurumClientProps) {
    const [activeRound, setActiveRound] = useState<string>(initialData.currentStage || "8th Finals");

    const availableRounds = useMemo(() => {
        const roundsInData = new Set(initialData.fixture.map(m => m.round));
        return ROUNDS.filter(r => roundsInData.has(r));
    }, [initialData.fixture]);

    const roundMatches = useMemo(() => {
        return initialData.fixture.filter(m => m.round === activeRound);
    }, [initialData.fixture, activeRound]);

    // Group matches by matchup (leg 1 and leg 2 together)
    const matchups = useMemo(() => {
        const grouped: Record<string, CEVCupMatch[]> = {};
        roundMatches.forEach(match => {
            const key = [match.homeTeam, match.awayTeam].sort().join(" vs ");
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(match);
        });
        return Object.values(grouped).map(matches => matches.sort((a, b) => (a.leg || 1) - (b.leg || 1)));
    }, [roundMatches]);

    const playedCount = roundMatches.filter(m => m.isPlayed).length;
    const totalCount = roundMatches.length;
    const completionRate = totalCount > 0 ? Math.round((playedCount / totalCount) * 100) : 0;

    const isTurkishTeam = (team: string) => TURKISH_TEAMS.includes(team);

    return (
        <main className="min-h-screen bg-slate-950 text-slate-100 p-0 sm:p-2 font-sans overflow-hidden">
            <div className="max-w-7xl mx-auto space-y-1 h-full flex flex-col">
                <div className="space-y-3 bg-slate-900/40 p-3 rounded-2xl border border-slate-800/60 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
                    {/* Action Bar using LeagueTemplate */}
                    <LeagueActionBar
                        config={LEAGUE_CONFIGS['cev-cup']}
                        title={`${LEAGUE_CONFIGS['cev-cup'].name} - ${ROUND_LABELS[activeRound]}`}
                        subtitle="CEV Cup • Güncel Durum"
                        selectorLabel="Tur"
                        selectorValue={activeRound}
                        selectorOptions={availableRounds.map(r => ({ label: ROUND_LABELS[r], value: r }))}
                        onSelectorChange={setActiveRound}
                        progress={completionRate}
                        progressLabel={`%${completionRate}`}
                    >
                        {/* Live Badge */}
                        <div className="px-3 h-8 bg-emerald-950/50 rounded-lg border border-emerald-800/50 flex items-center gap-2">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                            <span className="text-[10px] font-bold text-emerald-400 uppercase hidden sm:inline">Otomatik Güncelleme</span>
                            <span className="text-[10px] font-bold text-emerald-400 uppercase sm:hidden">CANLI</span>
                        </div>
                        <div className="bg-slate-950/50 px-3 py-1.5 rounded-lg border border-slate-800 text-center flex flex-col justify-center">
                            <div className="text-[9px] font-bold text-slate-500 uppercase leading-none mb-0.5">Format</div>
                            <div className="text-xs font-bold text-white leading-none">Eleme (İç-Dış)</div>
                        </div>
                        <div className="px-3 py-1.5 bg-amber-950/50 rounded-lg border border-amber-800/50 flex items-center gap-2">
                            <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                            <span className="text-[10px] font-bold text-amber-400 uppercase">{matchups.length} Eşleşme</span>
                        </div>
                    </LeagueActionBar>

                    {/* Matchups Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {matchups.map((matchup, idx) => {
                            const team1 = matchup[0]?.homeTeam;
                            const team2 = matchup[0]?.awayTeam;

                            // Calculate aggregate score
                            let team1Total = 0;
                            let team2Total = 0;
                            let allPlayed = true;

                            matchup.forEach(m => {
                                if (m.isPlayed && m.homeScore !== null && m.awayScore !== null) {
                                    if (m.homeTeam === team1) {
                                        team1Total += m.homeScore;
                                        team2Total += m.awayScore;
                                    } else {
                                        team1Total += m.awayScore;
                                        team2Total += m.homeScore;
                                    }
                                } else {
                                    allPlayed = false;
                                }
                            });

                            const hasTurkish = isTurkishTeam(team1) || isTurkishTeam(team2);

                            return (
                                <div
                                    key={idx}
                                    className={`bg-slate-950/60 rounded-xl border p-3 space-y-2 ${hasTurkish ? 'border-amber-700/50 ring-1 ring-amber-500/20' : 'border-slate-800/50'
                                        }`}
                                >
                                    {/* Matchup Header */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 flex-1 overflow-hidden">
                                            <TeamAvatar name={team1} size="sm" />
                                            <div className="overflow-hidden">
                                                <span className="text-sm font-bold text-slate-200 truncate block">
                                                    {team1}
                                                    {isTurkishTeam(team1) && <span className="ml-1">🇹🇷</span>}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="px-3 flex flex-col items-center shrink-0">
                                            {allPlayed ? (
                                                <div className="flex items-center gap-1">
                                                    <span className={`text-lg font-black ${team1Total > team2Total ? 'text-green-400' : 'text-slate-400'}`}>
                                                        {team1Total}
                                                    </span>
                                                    <span className="text-slate-600">-</span>
                                                    <span className={`text-lg font-black ${team2Total > team1Total ? 'text-green-400' : 'text-slate-400'}`}>
                                                        {team2Total}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-xs font-bold text-slate-600 bg-slate-900 px-2 py-1 rounded">VS</span>
                                            )}
                                            <span className="text-[9px] text-slate-500 uppercase">Toplam</span>
                                        </div>
                                        <div className="flex items-center gap-2 flex-1 justify-end overflow-hidden">
                                            <div className="overflow-hidden text-right">
                                                <span className="text-sm font-bold text-slate-200 truncate block">
                                                    {isTurkishTeam(team2) && <span className="mr-1">🇹🇷</span>}
                                                    {team2}
                                                </span>
                                            </div>
                                            <TeamAvatar name={team2} size="sm" />
                                        </div>
                                    </div>

                                    {/* Individual Legs */}
                                    <div className="space-y-1.5 pt-1 border-t border-slate-800/50">
                                        {matchup.map((match, mIdx) => (
                                            <div key={match.id} className="flex items-center justify-between text-xs bg-slate-900/50 rounded-lg px-2 py-1.5">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-bold text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">
                                                        {match.leg === 1 ? "1. Maç" : "2. Maç"}
                                                    </span>
                                                    <span className="text-[10px] text-slate-500">
                                                        {match.date?.split('-').reverse().join('.')}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <span className="text-slate-400 text-[10px] truncate max-w-[60px]">{match.homeTeam.split(' ')[0]}</span>
                                                    {match.isPlayed ? (
                                                        <span className="font-bold text-white px-2">
                                                            {match.homeScore} - {match.awayScore}
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-600 px-2">-</span>
                                                    )}
                                                    <span className="text-slate-400 text-[10px] truncate max-w-[60px]">{match.awayTeam.split(' ')[0]}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {matchups.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                            <span className="text-4xl mb-2">🏐</span>
                            <p className="text-sm">Bu tur için henüz maç planlanmadı.</p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}

```

## File: app\cev-cup\gunceldurum\page.tsx
```
import fs from 'fs';
import path from 'path';
import { Metadata } from "next";
import CEVCupGuncelDurumClient from './CEVCupGuncelDurumClient';

export const metadata: Metadata = {
    title: "CEV Cup Güncel Durum",
    description: "CEV Kadınlar Kupası puan durumu, tur sıralamaları ve maç sonuçları. Avrupa kupası güncel tablo.",
    openGraph: {
        title: "CEV Cup Güncel Durum | VolleySimulator",
        description: "CEV Cup tur sıralamaları ve maç sonuçları.",
    },
};

interface CEVCupMatch {
    id: number;
    round: string;
    leg?: number;
    date: string;
    homeTeam: string;
    awayTeam: string;
    homeScore: number | null;
    awayScore: number | null;
    setScores?: string;
    isPlayed: boolean;
}

interface CEVCupTeam {
    name: string;
    country: string;
}

interface CEVCupData {
    league: string;
    season: string;
    currentStage: string;
    teams: CEVCupTeam[];
    fixture: CEVCupMatch[];
}

export default async function CEVCupGuncelDurumPage() {
    const dataPath = path.join(process.cwd(), 'data', 'cev-cup-data.json');
    let data: CEVCupData | null = null;

    try {
        const jsonData = fs.readFileSync(dataPath, 'utf-8');
        data = JSON.parse(jsonData);
    } catch (error) {
        console.error('Error reading CEV Cup data:', error);
    }

    if (!data) {
        return (
            <main className="min-h-screen bg-slate-950 text-slate-100 p-4 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-500">Veri Yüklenemedi</h1>
                    <p className="text-slate-400 mt-2">CEV Cup verileri yüklenirken bir hata oluştu.</p>
                </div>
            </main>
        );
    }

    return (
        <CEVCupGuncelDurumClient
            initialData={data}
        />
    );
}

```

## File: app\cev-cup\playoffs\CEVCupPlayoffsClient.tsx
```
"use client";

import { useEffect, useState } from "react";
import TeamAvatar from "../../components/TeamAvatar";
import { SCORES } from "../../utils/calculatorUtils";

interface Match {
    id: number;
    round: string;
    leg?: number;
    date: string;
    homeTeam: string;
    awayTeam: string;
    homeScore: number | null;
    awayScore: number | null;
    isPlayed: boolean;
    setScores?: string;
}

interface CEVCupData {
    league: string;
    season: string;
    currentStage: string;
    teams: string[];
    fixture: Match[];
}

const ROUND_LABELS: Record<string, string> = {
    "16th Finals": "Son 32 Turu",
    "8th Finals": "Son 16 Turu",
    "Play Off": "Play-Off Turu",
    "4th Finals": "Çeyrek Final",
    "Semi Finals": "Yarı Final",
    "Finals": "Final"
};

const TURKISH_TEAMS = ["Galatasaray Daikin ISTANBUL", "THY ISTANBUL", "Kuzeyboru AKSARAY"];

export default function CEVCupPlayoffsClient({ initialData }: { initialData: CEVCupData }) {
    const [overrides, setOverrides] = useState<Record<string, string>>(() => {
        try {
            const saved = localStorage.getItem('cevCupPredictions');
            return saved ? JSON.parse(saved) : {};
        } catch (e) {
            console.error(e);
            return {};
        }
    });
    // Save predictions
    useEffect(() => {
        localStorage.setItem('cevCupPredictions', JSON.stringify(overrides));
    }, [overrides]);

    const handleScoreChange = (matchId: number, score: string) => {
        setOverrides(prev => {
            const next = { ...prev };
            if (score) next[`match-${matchId}`] = score;
            else delete next[`match-${matchId}`];
            return next;
        });
    };

    const handlePredictAll = () => {
        const newOverrides = { ...overrides };
        const possibleScores = ['3-0', '3-1', '3-2', '2-3', '1-3', '0-3'];
        let changed = false;

        initialData.fixture.forEach(m => {
            if (!m.isPlayed && !newOverrides[`match-${m.id}`]) {
                const randomScore = possibleScores[Math.floor(Math.random() * possibleScores.length)];
                newOverrides[`match-${m.id}`] = randomScore;
                changed = true;
            }
        });

        if (changed) setOverrides(newOverrides);
    };

    // Group matches by matchup (leg 1 + leg 2)
    const getMatchups = (round: string) => {
        const roundMatches = initialData.fixture.filter(m => m.round === round);
        const grouped: Record<string, Match[]> = {};

        roundMatches.forEach(match => {
            const key = [match.homeTeam, match.awayTeam].sort().join(" vs ");
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(match);
        });

        return Object.values(grouped).map(matches => {
            const sorted = matches.sort((a, b) => (a.leg || 1) - (b.leg || 1));
            const leg1 = sorted[0];
            const leg2 = sorted[1];

            // Determine team1 and team2 based on leg 1 (Team 1 = Home of Leg 1 usually)
            // But strict alphabetical sort earlier might confuse.
            // Let's stick to Leg 1 Home as Team A vs Leg 1 Away as Team B for visual consistency
            const team1 = leg1.homeTeam;
            const team2 = leg1.awayTeam;

            // Calculate aggregate
            let team1Points = 0;
            let team2Points = 0;
            let allPlayedOrPredicted = true;

            const processMatch = (m: Match) => {
                const isPlayed = m.isPlayed && m.homeScore !== null && m.awayScore !== null;
                const pred = overrides[`match-${m.id}`];
                let hScore = 0, aScore = 0;

                if (isPlayed) {
                    hScore = m.homeScore!;
                    aScore = m.awayScore!;
                } else if (pred) {
                    [hScore, aScore] = pred.split('-').map(Number);
                } else {
                    allPlayedOrPredicted = false;
                    return;
                }

                // Points Calculation logic (3-0/3-1 = 3pts, 3-2 = 2pts)
                let hPts = 0, aPts = 0;
                if (hScore === 3) {
                    if (aScore <= 1) { hPts = 3; aPts = 0; }
                    else { hPts = 2; aPts = 1; }
                } else {
                    if (hScore <= 1) { hPts = 0; aPts = 3; }
                    else { hPts = 1; aPts = 2; }
                }

                if (m.homeTeam === team1) {
                    team1Points += hPts;
                    team2Points += aPts;
                } else {
                    team1Points += aPts;
                    team2Points += hPts;
                }
            };

            if (leg1) processMatch(leg1);
            if (leg2) processMatch(leg2);

            let winner = null;
            let goldenSetNeeded = false;

            if (allPlayedOrPredicted) {
                if (team1Points > team2Points) winner = team1;
                else if (team2Points > team1Points) winner = team2;
                else goldenSetNeeded = true;
            }

            // Golden Set Override?
            // Since we don't have a specific match ID for golden set in fixture usually,
            // we simulate it or check if fixture has a "Leg 3" or golden set entry? 
            // Data usually doesn't have it. We'll use a virtual ID: "golden-{leg1.id}"
            const goldenKey = `golden-${leg1.id}`;
            const goldenPred = overrides[goldenKey];

            if (goldenSetNeeded) {
                if (goldenPred === 'team1') winner = team1;
                else if (goldenPred === 'team2') winner = team2;
            }

            return { matches: sorted, team1, team2, team1Points, team2Points, allPlayedOrPredicted, winner, goldenSetNeeded, goldenKey, goldenPred };
        });
    };

    const rounds = ["16th Finals", "8th Finals", "Play Off", "4th Finals", "Semi Finals", "Finals"];
    const availableRounds = rounds.filter(r => initialData.fixture.some(m => m.round === r));

    // Render a single inputs row
    const renderScoreInput = (match: Match) => {
        const isPlayed = match.isPlayed && match.homeScore !== null;
        const pred = overrides[`match-${match.id}`];

        if (isPlayed) {
            return (
                <span className="font-mono font-bold text-slate-300 bg-slate-900 px-2 py-1 rounded border border-slate-700">
                    {match.homeScore}-{match.awayScore}
                </span>
            );
        }

        return (
            <select
                aria-label={`Match ${match.id} score prediction`}
                value={pred || ''}
                onChange={(e) => handleScoreChange(match.id, e.target.value)}
                className={`bg-slate-900 border text-xs rounded px-1 py-1 font-mono w-16 text-center appearance-none cursor-pointer hover:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all ${pred ? 'border-blue-500 text-white' : 'border-slate-700 text-slate-500'}`}
            >
                <option value="">v</option>
                {SCORES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
        );
    };

    const renderBracketCard = (round: string) => {
        const matchups = getMatchups(round);
        if (matchups.length === 0) return null;

        return (
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 animate-in fade-in slide-in-from-bottom-4 duration-500" key={round}>
                <h3 className="text-lg font-bold text-amber-400 mb-4 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                    {ROUND_LABELS[round] || round}
                    <span className="text-xs text-slate-500 ml-auto bg-slate-900 px-2 py-1 rounded border border-slate-800">{matchups.length} Eşleşme</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {matchups.map((matchup, idx) => {
                        const hasTurkish = TURKISH_TEAMS.includes(matchup.team1) || TURKISH_TEAMS.includes(matchup.team2);
                        const leg1 = matchup.matches[0];
                        const leg2 = matchup.matches[1];

                        return (
                            <div
                                key={idx}
                                className={`relative bg-slate-950/80 rounded-xl border overflow-hidden group ${hasTurkish ? 'border-amber-600/40' : 'border-slate-800'}`}
                            >
                                {/* Status Header / Golden Set Indicator */}
                                {(matchup.winner || matchup.goldenSetNeeded) && (
                                    <div className={`text-[10px] uppercase font-bold text-center py-1 ${matchup.winner ? 'bg-emerald-900/20 text-emerald-400 border-b border-emerald-500/20' : 'bg-amber-900/20 text-amber-400 border-b border-amber-500/20'
                                        }`}>
                                        {matchup.winner ? `Tur Atladı: ${matchup.winner}` : 'ALTIN SET GEREKLİ'}
                                    </div>
                                )}

                                {/* Match Content */}
                                <div className="p-3 space-y-3">
                                    {/* Team 1 Row */}
                                    <div className={`flex items-center justify-between gap-3 p-2 rounded-lg transition-colors ${matchup.winner === matchup.team1 ? 'bg-emerald-900/20 border border-emerald-500/20' : 'bg-slate-900/40 border border-transparent'}`}>
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <TeamAvatar name={matchup.team1} size="sm" />
                                            <div className="flex flex-col min-w-0">
                                                <span className={`text-xs font-bold truncate ${matchup.winner === matchup.team1 ? 'text-emerald-400' : 'text-slate-200'}`}>
                                                    {matchup.team1}
                                                </span>
                                                {TURKISH_TEAMS.includes(matchup.team1) && <span className="text-[9px] text-amber-500 font-bold tracking-wider">TEMSİLCİMİZ</span>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Middle Section: Scores */}
                                    <div className="flex flex-col gap-2 bg-slate-900/30 rounded p-2 border border-slate-800/50">
                                        {/* Leg 1 */}
                                        <div className="flex items-center justify-center gap-3 text-xs">
                                            <span className="text-slate-500 w-8 text-right">Maç 1</span>
                                            {renderScoreInput(leg1)}
                                            <span className="text-slate-600 text-[10px] w-24 text-center truncate opacity-50">{leg1.date}</span>
                                        </div>

                                        {/* Leg 2 */}
                                        {leg2 && (
                                            <div className="flex items-center justify-center gap-3 text-xs">
                                                <span className="text-slate-500 w-8 text-right">Maç 2</span>
                                                {/* Leg 2 usually has swapped home/away relative to Team1/Team2, logic handled inside renderScoreInput by match ID */}
                                                {renderScoreInput(leg2)}
                                                <span className="text-slate-600 text-[10px] w-24 text-center truncate opacity-50">{leg2.date}</span>
                                            </div>
                                        )}

                                        {/* Golden Set Selection */}
                                        {matchup.goldenSetNeeded && (
                                            <div className="flex items-center justify-center gap-2 mt-1 animate-pulse">
                                                <span className="text-amber-500 font-bold text-[10px]">ALTIN SET:</span>
                                                <div className="flex gap-1">
                                                    <button
                                                        type="button"
                                                        title={`Golden set winner: ${matchup.team1}`}
                                                        onClick={() => setOverrides(prev => ({ ...prev, [matchup.goldenKey]: 'team1' }))}
                                                        className={`px-2 py-0.5 text-[9px] rounded border ${matchup.goldenPred === 'team1' ? 'bg-amber-500 text-slate-900 border-amber-500' : 'bg-slate-800 text-slate-400 border-slate-600'}`}
                                                    >
                                                        {matchup.team1.substring(0, 3)}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        title={`Golden set winner: ${matchup.team2}`}
                                                        onClick={() => setOverrides(prev => ({ ...prev, [matchup.goldenKey]: 'team2' }))}
                                                        className={`px-2 py-0.5 text-[9px] rounded border ${matchup.goldenPred === 'team2' ? 'bg-amber-500 text-slate-900 border-amber-500' : 'bg-slate-800 text-slate-400 border-slate-600'}`}
                                                    >
                                                        {matchup.team2.substring(0, 3)}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Team 2 Row */}
                                    <div className={`flex items-center justify-between gap-3 p-2 rounded-lg transition-colors ${matchup.winner === matchup.team2 ? 'bg-emerald-900/20 border border-emerald-500/20' : 'bg-slate-900/40 border border-transparent'}`}>
                                        <div className="flex items-center gap-3 flex-1 min-w-0 flex-row-reverse text-right">
                                            <TeamAvatar name={matchup.team2} size="sm" />
                                            <div className="flex flex-col min-w-0 items-end">
                                                <span className={`text-xs font-bold truncate ${matchup.winner === matchup.team2 ? 'text-emerald-400' : 'text-slate-200'}`}>
                                                    {matchup.team2}
                                                </span>
                                                {TURKISH_TEAMS.includes(matchup.team2) && <span className="text-[9px] text-amber-500 font-bold tracking-wider">TEMSİLCİMİZ</span>}
                                            </div>
                                        </div>
                                    </div>


                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const totalMatches = initialData.fixture.length;
    const completedMatches = initialData.fixture.filter(m => m.isPlayed || overrides[`match-${m.id}`]).length;
    const progress = Math.round((completedMatches / totalMatches) * 100) || 0;

    return (
        <main className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                        <h1 className="font-bold text-white text-lg tracking-tight leading-none hidden sm:block">{initialData.league || 'CEV Cup'}</h1>
                        <p className="text-[10px] text-slate-400 hidden sm:block">Eleme Tablosu {initialData.season}</p>
                    </div>

                    <button
                        onClick={handlePredictAll}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-lg shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2 text-xs"
                    >
                        <span>🎲</span>
                        <span>Tümünü Tahmin Et</span>
                    </button>
                </div>

                {/* Info Banner */}
                {progress < 100 && (
                    <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between gap-4">
                        <div className="flex flex-col gap-1">
                            <span className="text-xs font-bold text-slate-300">İlerleme Durumu</span>
                            <div className="w-32 sm:w-64 h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-500"
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-lg font-black text-white">{completedMatches}/{totalMatches}</div>
                            <div className="text-[10px] text-slate-500 uppercase font-bold">Maç Tahmin Edildi</div>
                        </div>
                    </div>
                )}

                {/* Bracket by Rounds */}
                <div className="space-y-8">
                    {availableRounds.map(round => renderBracketCard(round))}
                </div>

                {/* Tournament Flow / Legend */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 mt-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-center">
                        <div className="p-2 border border-slate-800 rounded flex flex-col items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            <span className="text-slate-400">Tur Atlayan</span>
                        </div>
                        <div className="p-2 border border-slate-800 rounded flex flex-col items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                            <span className="text-slate-400">Altın Set/Temsilcimiz</span>
                        </div>
                        <div className="p-2 border border-slate-800 rounded flex flex-col items-center gap-1">
                            <span className="border border-blue-500 text-blue-500 px-1 rounded text-[10px]">3-0</span>
                            <span className="text-slate-400">Tahmin Edilen Skor</span>
                        </div>
                        <div className="p-2 border border-slate-800 rounded flex flex-col items-center gap-1">
                            <span className="bg-slate-900 text-slate-300 border border-slate-700 px-1 rounded text-[10px]">3-0</span>
                            <span className="text-slate-400">Resmi Sonuç</span>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

```

## File: app\cev-cup\playoffs\page.tsx
```
import fs from 'fs';
import path from 'path';
import { Metadata } from "next";
import CEVCupPlayoffsClient from './CEVCupPlayoffsClient';

export const metadata: Metadata = {
    title: "CEV Cup Playoff Simülasyonu",
    description: "CEV Kadınlar Kupası playoff simülasyonu. Eleme turlarını simüle edin.",
    openGraph: {
        title: "CEV Cup Playoff Simülasyonu | VolleySimulator",
        description: "CEV Cup playoff eşleşmelerini simüle edin.",
    },
};

export default async function CEVCupPlayoffsPage() {
    const dataPath = path.join(process.cwd(), 'data', 'cev-cup-data.json');
    let data = null;

    try {
        const jsonData = fs.readFileSync(dataPath, 'utf-8');
        data = JSON.parse(jsonData);
    } catch (error) {
        console.error('Error reading CEV Cup data:', error);
    }

    if (!data) {
        return (
            <main className="min-h-screen bg-slate-950 text-slate-100 p-4 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-500">Veri Yüklenemedi</h1>
                    <p className="text-slate-400 mt-2">CEV Cup verileri yüklenirken bir hata oluştu.</p>
                </div>
            </main>
        );
    }

    return (
        <CEVCupPlayoffsClient initialData={data} />
    );
}

```

## File: app\cev-cup\stats\CEVCupStatsClient.tsx
```
"use client";

import { useMemo } from "react";

import TeamAvatar from "@/app/components/TeamAvatar";

interface Team {
    name: string;
    country: string;
}

interface Match {
    id: number;
    round: string;
    homeTeam: string;
    awayTeam: string;
    homeScore: number | null;
    awayScore: number | null;
    isPlayed: boolean;
}

interface CEVCupStatsClientProps {
    teams: Team[];
    fixture: Match[];
}

interface TeamStats {
    name: string;
    country: string;
    played: number;
    wins: number;
    losses: number;
    setsWon: number;
    setsLost: number;
    winRate: number;
}

export default function CEVCupStatsClient({ teams, fixture }: CEVCupStatsClientProps) {
    const teamsWithStats = useMemo(() => {
        const statsMap = new Map<string, TeamStats>();

        // Initialize all teams
        teams.forEach(team => {
            statsMap.set(team.name, {
                name: team.name,
                country: team.country,
                played: 0,
                wins: 0,
                losses: 0,
                setsWon: 0,
                setsLost: 0,
                winRate: 0
            });
        });

        // Calculate stats from matches
        fixture.filter(m => m.isPlayed).forEach(match => {
            const homeStats = statsMap.get(match.homeTeam);
            const awayStats = statsMap.get(match.awayTeam);

            if (homeStats && match.homeScore !== null && match.awayScore !== null) {
                homeStats.played++;
                homeStats.setsWon += match.homeScore;
                homeStats.setsLost += match.awayScore;
                if (match.homeScore > match.awayScore) {
                    homeStats.wins++;
                } else {
                    homeStats.losses++;
                }
            }

            if (awayStats && match.homeScore !== null && match.awayScore !== null) {
                awayStats.played++;
                awayStats.setsWon += match.awayScore;
                awayStats.setsLost += match.homeScore;
                if (match.awayScore > match.homeScore) {
                    awayStats.wins++;
                } else {
                    awayStats.losses++;
                }
            }
        });

        // Calculate win rates
        statsMap.forEach(stats => {
            stats.winRate = stats.played > 0 ? Math.round((stats.wins / stats.played) * 100) : 0;
        });

        return Array.from(statsMap.values()).filter(t => t.played > 0);
    }, [teams, fixture]);

    const totalMatches = useMemo(() => fixture.filter(m => m.isPlayed).length, [fixture]);
    const totalSets = useMemo(() => teamsWithStats.reduce((sum, t) => sum + t.setsWon, 0), [teamsWithStats]);

    const mostWins = useMemo(() => [...teamsWithStats].sort((a, b) => b.wins - a.wins).slice(0, 5), [teamsWithStats]);
    const mostSets = useMemo(() => [...teamsWithStats].sort((a, b) => b.setsWon - a.setsWon).slice(0, 5), [teamsWithStats]);
    const bestWinRate = useMemo(() => [...teamsWithStats].filter(t => t.played >= 2).sort((a, b) => b.winRate - a.winRate).slice(0, 5), [teamsWithStats]);
    const leastLosses = useMemo(() => [...teamsWithStats].sort((a, b) => a.losses - b.losses || b.wins - a.wins).slice(0, 5), [teamsWithStats]);

    const BarChart = ({ value, max, color }: { value: number; max: number; color: string }) => (
        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden flex-1">
            <div
                className={`h-full ${color} transition-all duration-500`}
                // eslint-disable-next-line
                style={{ width: `${Math.min((value / (max || 1)) * 100, 100)}%` }}
            />
        </div>
    );

    const StatCard = ({ title, icon, teamStats, statKey, color, gradient, suffix = "" }: {
        title: string; icon: string;
        teamStats: TeamStats[];
        statKey: 'losses' | 'wins' | 'setsWon' | 'setsLost' | 'winRate';
        color: string;
        gradient: string;
        suffix?: string;
    }) => {
        const maxValue = Math.max(...teamStats.map(t => Number(t[statKey])), 1);

        return (
            <div className="bg-slate-950/50 backdrop-blur-md rounded-xl border border-slate-800/60 overflow-hidden hover:border-slate-700/80 transition-all duration-300 group shadow-md hover:shadow-lg">
                <div className={`${gradient} px-2.5 py-2 border-b border-white/10 relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="flex items-center justify-between relative z-10">
                        <h3 className="font-bold text-white text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                            <span className="text-sm">{icon}</span> {title}
                        </h3>
                        <span className="text-[9px] font-bold text-white/70 bg-black/20 px-1.5 py-0.5 rounded-full border border-white/10">TOP 5</span>
                    </div>
                </div>

                <div className="p-1.5 space-y-1">
                    {teamStats.map((t, idx) => (
                        <div
                            key={t.name}
                            className={`flex items-center gap-2 p-1.5 rounded-lg transition-all ${idx === 0 ? 'bg-gradient-to-r from-white/5 to-transparent border border-white/10' : 'hover:bg-white/5'
                                }`}
                        >
                            <div className={`w-5 h-5 rounded flex items-center justify-center font-bold text-[10px] shadow-sm ${idx === 0 ? 'bg-amber-400 text-amber-950' :
                                idx === 1 ? 'bg-slate-300 text-slate-800' :
                                    idx === 2 ? 'bg-amber-700 text-amber-100' :
                                        'bg-slate-800 text-slate-500'
                                }`}>
                                {idx + 1}
                            </div>
                            <TeamAvatar name={t.name} size="xs" />

                            <div className="flex-1 min-w-0">
                                <span className={`text-[11px] font-bold truncate block ${idx === 0 ? 'text-white' : 'text-slate-300'}`} title={t.name}>
                                    {t.name}
                                </span>
                            </div>

                            <div className="flex items-center gap-1.5 w-16 justify-end">
                                <div className="h-1 bg-slate-800/50 rounded-full overflow-hidden flex-1 max-w-[30px]">
                                    <div className={`h-full ${color} opacity-80`} style={{ width: `${Math.min((Number(t[statKey]) / maxValue) * 100, 100)}%` }}></div>
                                </div>
                                <span className={`text-[11px] font-bold min-w-[24px] text-right ${idx === 0 ? 'text-white' : 'text-slate-400'}`}>
                                    {t[statKey]}{suffix}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <main className="min-h-screen bg-slate-950 text-slate-100 p-2 sm:p-4 font-sans">
            <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
                <div className="flex flex-col gap-1 px-1">
                    <h1 className="font-bold text-white text-lg tracking-tight leading-none hidden sm:block">CEV Cup İstatistikleri</h1>
                    <p className="text-[10px] text-slate-400 hidden sm:block">Kadınlar • 2025-2026</p>
                </div>

                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                    <div className="bg-gradient-to-br from-amber-600/20 to-amber-900/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-amber-600/30 text-center">
                        <div className="text-2xl sm:text-4xl font-bold text-amber-400">{totalMatches}</div>
                        <div className="text-[10px] sm:text-xs text-amber-400/70 uppercase tracking-wider mt-1">Oynanan Maç</div>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-600/20 to-emerald-900/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-emerald-600/30 text-center">
                        <div className="text-2xl sm:text-4xl font-bold text-emerald-400">{totalSets}</div>
                        <div className="text-[10px] sm:text-xs text-emerald-400/70 uppercase tracking-wider mt-1">Toplam Set</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-600/20 to-purple-900/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-purple-600/30 text-center">
                        <div className="text-2xl sm:text-4xl font-bold text-purple-400">{teamsWithStats.length}</div>
                        <div className="text-[10px] sm:text-xs text-purple-400/70 uppercase tracking-wider mt-1">Aktif Takım</div>
                    </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3 sm:gap-4 pb-8">
                    <StatCard
                        title="En Çok Galibiyet"
                        icon="🏆"
                        teamStats={mostWins}
                        statKey="wins"
                        color="bg-amber-500"
                        gradient="bg-gradient-to-r from-amber-600 to-orange-600"
                        suffix="G"
                    />
                    <StatCard
                        title="En Yüksek Galibiyet %"
                        icon="📈"
                        teamStats={bestWinRate}
                        statKey="winRate"
                        color="bg-teal-500"
                        gradient="bg-gradient-to-r from-teal-600 to-cyan-600"
                        suffix="%"
                    />
                    <StatCard
                        title="En Çok Set Alan"
                        icon="🏐"
                        teamStats={mostSets}
                        statKey="setsWon"
                        color="bg-purple-500"
                        gradient="bg-gradient-to-r from-purple-600 to-pink-600"
                    />
                    <StatCard
                        title="En Az Mağlubiyet"
                        icon="🛡️"
                        teamStats={leastLosses}
                        statKey="losses"
                        color="bg-emerald-500"
                        gradient="bg-gradient-to-r from-emerald-600 to-green-600"
                        suffix="M"
                    />
                </div>
            </div>
        </main>
    );
}

```

## File: app\cev-cup\stats\page.tsx
```
import fs from 'fs';
import path from 'path';
import { Metadata } from "next";
import CEVCupStatsClient from './CEVCupStatsClient';

export const metadata: Metadata = {
    title: "CEV Cup İstatistikler",
    description: "CEV Kadınlar Kupası takım istatistikleri ve performans analizleri.",
    openGraph: {
        title: "CEV Cup İstatistikler | VolleySimulator",
        description: "CEV Cup takım istatistikleri.",
    },
};

export default async function CEVCupStatsPage() {
    const dataPath = path.join(process.cwd(), 'data', 'cev-cup-data.json');
    let teams: any[] = [];
    let fixture: any[] = [];

    try {
        const jsonData = fs.readFileSync(dataPath, 'utf-8');
        const data = JSON.parse(jsonData);
        teams = data.teams || [];
        fixture = data.fixture || [];
    } catch (error) {
        console.error('Error reading CEV Cup data:', error);
    }

    return (
        <CEVCupStatsClient teams={teams} fixture={fixture} />
    );
}

```

## File: app\cev-cup\tahminoyunu\CEVCupTahminOyunuClient.tsx
```
"use client";

import { useEffect, useState, useMemo } from "react";

import TeamAvatar from "@/app/components/TeamAvatar";
import { useToast } from "../../components";
import { useGameState, ACHIEVEMENTS } from "../../utils/gameState";
import { sounds } from "../../utils/sounds";

interface Match {
    id: number;
    round: string;
    leg?: number;
    date: string;
    homeTeam: string;
    awayTeam: string;
    homeScore: number | null;
    awayScore: number | null;
    isPlayed: boolean;
}

interface CEVCupData {
    league: string;
    season: string;
    currentStage: string;
    teams: any[];
    fixture: Match[];
}

const ROUNDS = ["16th Finals", "8th Finals", "Play Off", "4th Finals", "Semi Finals", "Finals"];
const ROUND_LABELS: Record<string, string> = {
    "16th Finals": "Son 32",
    "8th Finals": "Son 16",
    "Play Off": "Play-Off",
    "4th Finals": "Çeyrek Final",
    "Semi Finals": "Yarı Final",
    "Finals": "Final"
};

const TURKISH_TEAMS = ["Galatasaray Daikin ISTANBUL", "THY ISTANBUL"];

export default function CEVCupTahminOyunuClient({ initialData }: { initialData: CEVCupData }) {
    const { showToast, showUndoToast } = useToast();
    const { addXP, recordPrediction, unlockAchievement, hasAchievement, gameState } = useGameState();

    const [activeRound, setActiveRound] = useState<string>(initialData.currentStage || "8th Finals");
    const [overrides, setOverrides] = useState<Record<string, string>>({});

    const availableRounds = useMemo(() => {
        const roundsInData = new Set(initialData.fixture.map(m => m.round));
        return ROUNDS.filter(r => roundsInData.has(r));
    }, [initialData.fixture]);

    const roundMatches = useMemo(() => {
        return initialData.fixture.filter(m => m.round === activeRound);
    }, [initialData.fixture, activeRound]);

    // Load saved predictions
    useEffect(() => {
        const saved = localStorage.getItem('cevCupPredictions');
        if (saved) {
            try {
                setOverrides(JSON.parse(saved));
            } catch (e) { console.error(e); }
        }
    }, []);

    // Save predictions
    useEffect(() => {
        localStorage.setItem('cevCupPredictions', JSON.stringify(overrides));
    }, [overrides]);

    const handleScoreChange = (matchId: string, score: string) => {
        const newOverrides = { ...overrides };
        const wasNew = !overrides[matchId];

        if (score) {
            newOverrides[matchId] = score;

            if (wasNew) {
                addXP(10);
                sounds.scoreSelect();

                if (!hasAchievement('first_prediction')) {
                    unlockAchievement('first_prediction');
                    sounds.achievement();
                }

                if (gameState.stats.totalPredictions >= 49 && !hasAchievement('game_addict')) {
                    unlockAchievement('game_addict');
                    sounds.achievement();
                }

                recordPrediction(true);
            }
        } else {
            delete newOverrides[matchId];
        }
        setOverrides(newOverrides);
    };

    const handleResetRound = () => {
        if (!confirm(`${ROUND_LABELS[activeRound]} tahminleriniz silinecek. Emin misiniz?`)) return;
        const newOverrides = { ...overrides };
        roundMatches.forEach(m => {
            delete newOverrides[`match-${m.id}`];
        });
        setOverrides(newOverrides);
        showToast(`${ROUND_LABELS[activeRound]} tahminleri sıfırlandı`, "success");
    };

    const handleResetAll = () => {
        const previousOverrides = { ...overrides };
        setOverrides({});
        localStorage.removeItem('cevCupPredictions');
        showUndoToast("CEV Cup tahminleri sıfırlandı", () => {
            setOverrides(previousOverrides);
        });
    };

    const handleRandomize = () => {
        if (!confirm("Oynanmamış maçlar rastgele skorlarla doldurulacak. Onaylıyor musunuz?")) return;
        const newOverrides = { ...overrides };
        const scores = ["3-0", "3-1", "3-2", "2-3", "1-3", "0-3"];
        let count = 0;

        roundMatches.forEach(match => {
            if (match.isPlayed || newOverrides[`match-${match.id}`]) return;
            const randomScore = scores[Math.floor(Math.random() * scores.length)];
            newOverrides[`match-${match.id}`] = randomScore;
            count++;
        });

        setOverrides(newOverrides);
        if (count > 0) {
            sounds.levelUp();
            showToast(`${count} maç rastgele tahmin edildi!`, "success");
            addXP(count * 2);
        }
    };

    const predictedCount = roundMatches.filter(m => overrides[`match-${m.id}`]).length;
    const totalUnplayed = roundMatches.filter(m => !m.isPlayed).length;

    return (
        <main className="min-h-screen bg-slate-950 text-slate-100 p-1 sm:p-2 font-sans">
            <div className="w-full max-w-7xl mx-auto flex flex-col h-full gap-2">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-2 bg-slate-900/40 rounded-xl border border-slate-800">
                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                        <div className="text-center sm:text-left">
                            <h1 className="font-bold text-white text-lg tracking-tight leading-none hidden sm:block">CEV Cup</h1>
                            <p className="text-[10px] text-slate-400 hidden sm:block">Tahmin Oyunu</p>
                        </div>
                        <div className="flex gap-2 items-center w-full sm:w-auto">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest hidden sm:inline whitespace-nowrap">TUR:</span>
                            <div className="flex gap-1 p-1 bg-slate-950/50 rounded-lg border border-slate-800 items-center">
                                <select
                                    value={activeRound}
                                    onChange={(e) => setActiveRound(e.target.value)}
                                    title="Tur Seçin"
                                    className="px-3 py-1 bg-amber-600/20 text-amber-500 text-[10px] uppercase font-black rounded-md border border-amber-500/30 outline-none cursor-pointer transition-all focus:ring-2 focus:ring-amber-500/50"
                                >
                                    {availableRounds.map(r => (
                                        <option key={r} value={r} className="bg-slate-900 text-white">
                                            {ROUND_LABELS[r] || r}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                        <div className="flex items-center gap-2 sm:mr-2">
                            <span className="text-xs text-slate-500 hidden lg:inline">
                                {predictedCount}/{totalUnplayed} tahmin
                            </span>
                            <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-amber-500 transition-all"
                                    // eslint-disable-next-line
                                    style={{ width: `${totalUnplayed > 0 ? (predictedCount / totalUnplayed) * 100 : 0}%` }}
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleRandomize}
                                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-lg transition-all"
                            >
                                🎲 Rastgele
                            </button>
                            <button
                                onClick={handleResetRound}
                                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-bold rounded-lg transition-all border border-slate-700"
                            >
                                Turu Sıfırla
                            </button>
                            <button
                                onClick={handleResetAll}
                                className="px-3 py-1.5 bg-slate-800 hover:bg-rose-900/50 text-slate-400 hover:text-rose-400 text-xs font-bold rounded-lg transition-all border border-slate-700"
                            >
                                Tümünü Sıfırla
                            </button>
                        </div>
                    </div>
                </div>

                {/* Matches Grid */}
                <div className="bg-slate-900/40 rounded-2xl border border-slate-800/60 p-3 space-y-3">
                    <h2 className="text-xl font-black italic uppercase tracking-tighter text-amber-500">
                        {ROUND_LABELS[activeRound] || activeRound}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {roundMatches.map(match => {
                            const matchId = `match-${match.id}`;
                            const prediction = overrides[matchId];
                            const hasTurkish = TURKISH_TEAMS.includes(match.homeTeam) || TURKISH_TEAMS.includes(match.awayTeam);

                            return (
                                <div
                                    key={match.id}
                                    id={matchId}
                                    className={`bg-slate-950/60 rounded-xl border p-3 space-y-2 ${hasTurkish ? 'border-amber-700/50 ring-1 ring-amber-500/20' : 'border-slate-800/50'
                                        }`}
                                >
                                    {/* Match Header */}
                                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                                        <span>{match.leg === 1 ? "1. Maç" : match.leg === 2 ? "2. Maç" : ""}</span>
                                        <span>{match.date?.split('-').reverse().join('.')}</span>
                                    </div>

                                    {/* Teams */}
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-2 flex-1 overflow-hidden">
                                            <TeamAvatar name={match.homeTeam} size="sm" />
                                            <span className="text-sm font-bold text-slate-200 truncate">
                                                {match.homeTeam}
                                                {TURKISH_TEAMS.includes(match.homeTeam) && <span className="ml-1">🇹🇷</span>}
                                            </span>
                                        </div>
                                        <div className="px-2">
                                            {match.isPlayed ? (
                                                <span className="text-sm font-bold text-emerald-400">
                                                    {match.homeScore} - {match.awayScore}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-slate-600">VS</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 flex-1 justify-end overflow-hidden">
                                            <span className="text-sm font-bold text-slate-200 truncate text-right">
                                                {TURKISH_TEAMS.includes(match.awayTeam) && <span className="mr-1">🇹🇷</span>}
                                                {match.awayTeam}
                                            </span>
                                            <TeamAvatar name={match.awayTeam} size="sm" />
                                        </div>
                                    </div>

                                    {/* Score Selection */}
                                    {!match.isPlayed && (
                                        <div className="flex flex-wrap gap-1 pt-2 border-t border-slate-800/50">
                                            {["3-0", "3-1", "3-2", "2-3", "1-3", "0-3"].map(score => {
                                                const isSelected = prediction === score;
                                                return (
                                                    <button
                                                        key={score}
                                                        onClick={() => handleScoreChange(matchId, isSelected ? "" : score)}
                                                        className={`
                                                            px-2 py-1 text-xs rounded border transition-all
                                                            ${isSelected
                                                                ? 'bg-amber-600 border-amber-400 text-white font-bold shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                                                                : 'bg-slate-900 border-slate-700 text-slate-500 hover:bg-slate-800 hover:border-slate-500'}
                                                        `}
                                                    >
                                                        {score}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {roundMatches.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                            <span className="text-4xl mb-2">🏐</span>
                            <p className="text-sm">Bu tur için henüz maç planlanmadı.</p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}

```

## File: app\cev-cup\tahminoyunu\page.tsx
```
import fs from 'fs';
import path from 'path';
import { Metadata } from "next";
import CEVCupTahminOyunuClient from './CEVCupTahminOyunuClient';

export const metadata: Metadata = {
    title: "CEV Cup Tahmin Oyunu",
    description: "CEV Kadınlar Kupası maç sonuçlarını tahmin edin. Avrupa'nın prestijli kupa turnuvasının maçlarını tahmin ederek puan kazanın.",
    openGraph: {
        title: "CEV Cup Tahmin Oyunu | VolleySimulator",
        description: "CEV Cup maç sonuçlarını tahmin edin ve liderlik tablosunda yerinizi alın.",
    },
};

export default async function CEVCupTahminOyunuPage() {
    const dataPath = path.join(process.cwd(), 'data', 'cev-cup-data.json');
    let data = null;

    try {
        const jsonData = fs.readFileSync(dataPath, 'utf-8');
        data = JSON.parse(jsonData);
    } catch (error) {
        console.error('Error reading CEV Cup data:', error);
    }

    if (!data) {
        return (
            <main className="min-h-screen bg-slate-950 text-slate-100 p-4 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-500">Veri Yüklenemedi</h1>
                    <p className="text-slate-400 mt-2">CEV Cup verileri yüklenirken bir hata oluştu.</p>
                </div>
            </main>
        );
    }

    return (
        <CEVCupTahminOyunuClient initialData={data} />
    );
}

```

## File: app\components\AccessiBeWidget.tsx
```
'use client';

import Script from 'next/script';

export default function AccessiBeWidget() {
    return (
        <Script
            src="https://acsbapp.com/apps/app/dist/js/app.js"
            strategy="lazyOnload"
            onLoad={() => {
                // @ts-ignore
                if (typeof acsbJS !== 'undefined') {
                    // @ts-ignore
                    acsbJS.init({
                        statementLink: '',
                        footerHtml: '',
                        hideMobile: false,
                        hideTrigger: false,
                        disableBgProcess: false,
                        language: 'tr',
                        position: 'right',
                        leadColor: '#146FF8',
                        triggerColor: '#146FF8',
                        triggerRadius: '50%',
                        triggerPositionX: 'right',
                        triggerPositionY: 'bottom',
                        triggerIcon: 'people',
                        triggerSize: 'medium',
                        triggerOffsetX: 20,
                        triggerOffsetY: 20,
                        mobile: {
                            triggerSize: 'small',
                            triggerPositionX: 'right',
                            triggerPositionY: 'bottom',
                            triggerOffsetX: 10,
                            triggerOffsetY: 10,
                            triggerRadius: '50%'
                        }
                    });
                }
            }}
        />
    );
}

```

