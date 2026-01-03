"use client";

import { useState, useMemo } from "react";

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

interface CEVChallengeData {
    league: string;
    season: string;
    currentStage: string;
    teams: Team[];
    fixture: Match[];
}

interface CEVChallengeGuncelDurumClientProps {
    initialData: CEVChallengeData;
}

const ROUNDS = ["Qualification Rounds", "Main Round", "4th Finals", "Semi Finals", "Finals"];
const ROUND_LABELS: Record<string, string> = {
    "Qualification Rounds": "Eleme Turları",
    "Main Round": "Ana Tablo",
    "4th Finals": "Çeyrek Final",
    "Semi Finals": "Yarı Final",
    "Finals": "Final"
};

const TURKISH_TEAMS = ["Galatasaray Daikin ISTANBUL", "Kuzeyboru"]; // Updating based on assumption, can be refined

export default function CEVChallengeGuncelDurumClient({ initialData }: CEVChallengeGuncelDurumClientProps) {
    // Default to first available round if currentStage mapping fails
    const [activeRound, setActiveRound] = useState<string>(
        ROUND_LABELS[initialData.currentStage] ? initialData.currentStage : (initialData.fixture.length > 0 ? initialData.fixture[0].round : "Main Round")
    );

    const availableRounds = useMemo(() => {
        const roundsInData = new Set(initialData.fixture.map(m => m.round));
        return ROUNDS.filter(r => roundsInData.has(r)).concat(Array.from(roundsInData).filter(r => !ROUNDS.includes(r)));
    }, [initialData.fixture]);

    const roundMatches = useMemo(() => {
        return initialData.fixture.filter(m => m.round === activeRound);
    }, [initialData.fixture, activeRound]);

    // Group matches by matchup
    const matchups = useMemo(() => {
        const grouped: Record<string, Match[]> = {};
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

    const isTurkishTeam = (team: string) => TURKISH_TEAMS.some(t => team.includes(t)) || team.includes("ISTANBUL") || team.includes("ANKARA");

    return (
        <main className="min-h-screen bg-slate-950 text-slate-100 p-0 sm:p-2 font-sans overflow-hidden">
            <div className="max-w-7xl mx-auto space-y-1 h-full flex flex-col">
                <div className="space-y-3 bg-slate-900/40 p-3 rounded-2xl border border-slate-800/60 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-2 border-b border-slate-800 pb-2">
                        <div className="space-y-0.5">
                            <p className="text-[10px] text-slate-400 font-medium mb-1 hidden sm:block">CEV Challenge Cup • Güncel Durum</p>
                            <h2 className="text-2xl font-black italic uppercase tracking-tighter text-emerald-500 leading-none">
                                {ROUND_LABELS[activeRound] || activeRound}
                            </h2>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">İlerleme</span>
                                <div className="w-24 h-1 bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${completionRate}%` }}></div>
                                </div>
                                <span className="text-[9px] font-bold text-emerald-400">%{completionRate}</span>
                            </div>
                        </div>
                        <div className="flex gap-2 items-center flex-wrap">
                            <div className="flex gap-1 p-1 bg-slate-950/50 rounded-lg border border-slate-800 h-full items-center">
                                <select
                                    value={activeRound}
                                    onChange={(e) => setActiveRound(e.target.value)}
                                    title="Tur Seçin"
                                    className="px-3 py-1 bg-emerald-600/20 text-emerald-500 text-[10px] uppercase font-black rounded-md border border-emerald-500/30 outline-none cursor-pointer transition-all focus:ring-2 focus:ring-emerald-500/50"
                                >
                                    {availableRounds.map(r => (
                                        <option key={r} value={r} className="bg-slate-900 text-white">
                                            {ROUND_LABELS[r] || r}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="bg-slate-950/50 px-3 py-1.5 rounded-lg border border-slate-800 text-center flex flex-col justify-center">
                                <div className="text-[9px] font-bold text-slate-500 uppercase leading-none mb-0.5">Format</div>
                                <div className="text-xs font-bold text-white leading-none">Eleme (İç-Dış)</div>
                            </div>
                            <div className="px-3 py-1.5 bg-emerald-950/50 rounded-lg border border-emerald-800/50 flex items-center gap-2">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                                <span className="text-[10px] font-bold text-emerald-400 uppercase">{matchups.length} Eşleşme</span>
                            </div>
                        </div>
                    </div>

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
                                    className={`bg-slate-950/60 rounded-xl border p-3 space-y-2 ${hasTurkish ? 'border-emerald-700/50 ring-1 ring-emerald-500/20' : 'border-slate-800/50'
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
