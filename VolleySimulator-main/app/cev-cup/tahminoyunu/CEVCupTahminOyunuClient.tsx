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
