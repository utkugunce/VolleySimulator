"use client";

import { useEffect, useState } from "react";

import TeamAvatar from "../../components/TeamAvatar";
import Link from "next/link";

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

interface CEVChallengeData {
    league: string;
    season: string;
    currentStage: string;
    teams: any[];
    fixture: Match[];
}

const ROUND_LABELS: Record<string, string> = {
    "Qualification Rounds": "Eleme Turları",
    "Main Round": "Ana Tablo",
    "16th Finals": "Son 32",
    "8th Finals": "Son 16",
    "Play Off": "Play-Off",
    "4th Finals": "Çeyrek Final",
    "Semi Finals": "Yarı Final",
    "Finals": "Final"
};

const TURKISH_TEAMS = ["Galatasaray Daikin ISTANBUL", "Kuzeyboru", "THY ISTANBUL"];

export default function CEVChallengePlayoffsClient({ initialData }: { initialData: CEVChallengeData }) {
    const [overrides, setOverrides] = useState<Record<string, string>>({});
    const [isLoaded, setIsLoaded] = useState(false);

    // Load saved predictions
    useEffect(() => {
        const saved = localStorage.getItem('cevChallengePredictions');
        if (saved) {
            try {
                setOverrides(JSON.parse(saved));
            } catch (e) { console.error(e); }
        }
        setIsLoaded(true);
    }, []);

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
            const team1 = sorted[0]?.homeTeam;
            const team2 = sorted[0]?.awayTeam;

            // Calculate aggregate from both legs
            let team1Total = 0;
            let team2Total = 0;
            let allPlayed = true;

            sorted.forEach(m => {
                const isActuallyPlayed = m.isPlayed && m.homeScore !== null && m.awayScore !== null;
                const prediction = overrides[`match-${m.id}`];

                if (isActuallyPlayed) {
                    if (m.homeTeam === team1) {
                        team1Total += m.homeScore!;
                        team2Total += m.awayScore!;
                    } else {
                        team1Total += m.awayScore!;
                        team2Total += m.homeScore!;
                    }
                } else if (prediction) {
                    const [h, a] = prediction.split('-').map(Number);
                    if (m.homeTeam === team1) {
                        team1Total += h;
                        team2Total += a;
                    } else {
                        team1Total += a;
                        team2Total += h;
                    }
                } else {
                    allPlayed = false;
                }
            });

            const winner = allPlayed ? (team1Total > team2Total ? team1 : team2) : null;

            return { matches: sorted, team1, team2, team1Total, team2Total, allPlayed, winner };
        });
    };

    const rounds = ["Qualification Rounds", "Main Round", "4th Finals", "Semi Finals", "Finals"];
    const availableRounds = rounds.filter(r => initialData.fixture.some(m => m.round === r));

    const renderBracketCard = (round: string) => {
        const matchups = getMatchups(round);
        if (matchups.length === 0) return null;

        return (
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4" key={round}>
                <h3 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                    {ROUND_LABELS[round] || round}
                    <span className="text-xs text-slate-500 ml-auto">{matchups.length} eşleşme</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {matchups.map((matchup, idx) => {
                        const hasTurkish = TURKISH_TEAMS.some(t => matchup.team1.includes(t)) || TURKISH_TEAMS.some(t => matchup.team2.includes(t));

                        return (
                            <div
                                key={idx}
                                className={`bg-slate-950/60 rounded-lg border p-3 ${hasTurkish ? 'border-emerald-700/50' : 'border-slate-800'
                                    }`}
                            >
                                {/* Team 1 */}
                                <div className={`flex items-center justify-between p-2 rounded ${matchup.winner === matchup.team1 ? 'bg-emerald-900/30 border border-emerald-500/30' : 'bg-slate-900/50'
                                    }`}>
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <TeamAvatar name={matchup.team1} size="xs" />
                                        <span className={`text-xs truncate ${matchup.winner === matchup.team1 ? 'text-emerald-400 font-bold' : 'text-slate-300'
                                            }`}>
                                            {matchup.team1}
                                            {TURKISH_TEAMS.some(t => matchup.team1.includes(t)) && <span className="ml-1">🇹🇷</span>}
                                        </span>
                                    </div>
                                    <span className={`text-sm font-bold ${matchup.winner === matchup.team1 ? 'text-emerald-400' : 'text-slate-400'
                                        }`}>
                                        {matchup.allPlayed ? matchup.team1Total : '-'}
                                    </span>
                                </div>

                                {/* Team 2 */}
                                <div className={`flex items-center justify-between p-2 rounded mt-1 ${matchup.winner === matchup.team2 ? 'bg-emerald-900/30 border border-emerald-500/30' : 'bg-slate-900/50'
                                    }`}>
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <TeamAvatar name={matchup.team2} size="xs" />
                                        <span className={`text-xs truncate ${matchup.winner === matchup.team2 ? 'text-emerald-400 font-bold' : 'text-slate-300'
                                            }`}>
                                            {matchup.team2}
                                            {TURKISH_TEAMS.some(t => matchup.team2.includes(t)) && <span className="ml-1">🇹🇷</span>}
                                        </span>
                                    </div>
                                    <span className={`text-sm font-bold ${matchup.winner === matchup.team2 ? 'text-emerald-400' : 'text-slate-400'
                                        }`}>
                                        {matchup.allPlayed ? matchup.team2Total : '-'}
                                    </span>
                                </div>

                                {/* Status */}
                                <div className="mt-2 text-center">
                                    {matchup.winner ? (
                                        <span className="text-[10px] text-emerald-400 font-bold">✓ Tur Atladı</span>
                                    ) : (
                                        <span className="text-[10px] text-slate-500">Tahmin bekleniyor</span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const totalPredictions = Object.keys(overrides).length;
    const unplayedMatches = initialData.fixture.filter(m => !m.isPlayed).length;

    return (
        <main className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex flex-col gap-1">
                    <h1 className="font-bold text-white text-lg tracking-tight leading-none hidden sm:block">CEV Challenge Cup</h1>
                    <p className="text-[10px] text-slate-400 hidden sm:block">Eleme Tablosu 2025-2026</p>
                </div>

                {/* Info Banner */}
                {totalPredictions < unplayedMatches && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 p-4 rounded-lg flex items-center gap-3">
                        <span className="text-2xl">💡</span>
                        <div>
                            <p className="font-bold text-sm">Tahminlerinizi Yapın!</p>
                            <p className="text-xs opacity-70">
                                Eleme tablosunu görmek için <Link href="/cev-challenge/tahminoyunu" className="underline">Tahmin Oyunu</Link> sayfasından maç sonuçlarını tahmin edin.
                            </p>
                        </div>
                    </div>
                )}

                {/* Bracket by Rounds */}
                <div className="space-y-6">
                    {availableRounds.map(round => renderBracketCard(round))}
                </div>

                {/* Tournament Flow Note */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
                    <h2 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
                        <span>📋</span> Turnuva Formatı
                    </h2>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                        {rounds.map(r => (
                            <div key={r} className="bg-slate-800 rounded-lg p-3 text-center">
                                <div className="font-bold text-emerald-400 mb-1">{ROUND_LABELS[r] || r}</div>
                                <div className="text-slate-400">Eleme Usulü</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}
