"use client";

import { useEffect, useState, useMemo } from "react";
import { TeamStats, Match } from "../../types";
import Link from "next/link";
import { sortStandings, calculateLiveStandings } from "../../utils/calculatorUtils";
import PageHeader from "../../components/PageHeader";

interface PlayoffBracketMatch {
    id: string;
    homeTeam: string | null;
    awayTeam: string | null;
    homeScore: number | null;
    awayScore: number | null;
    matchNumber: number;
    round: 'semi' | 'final' | '3rd' | '5-8-semi' | '5-8-final' | '7th';
    winnerTo?: string;
}

export default function PlayoffsVSLPage() {
    const [loading, setLoading] = useState(true);
    const [baseTeams, setBaseTeams] = useState<TeamStats[]>([]);
    const [allMatches, setAllMatches] = useState<Match[]>([]);
    const [groupOverrides, setGroupOverrides] = useState<Record<string, string>>({});
    const [remainingMatches, setRemainingMatches] = useState(0);
    const [playoffOverrides, setPlayoffOverrides] = useState<Record<string, string>>({});
    const [isLoaded, setIsLoaded] = useState(false);

    // Tab states
    const [activeTab1_4, setActiveTab1_4] = useState<'semi' | 'final' | '3rd'>('semi');
    const [activeTab5_8, setActiveTab5_8] = useState<'semi' | 'final' | '7th'>('semi');

    // 1. Load Overrides
    useEffect(() => {
        const savedPlayoff = localStorage.getItem('vslPlayoffScenarios');
        if (savedPlayoff) {
            try {
                setPlayoffOverrides(JSON.parse(savedPlayoff));
            } catch (e) { console.error(e); }
        }

        const savedGroup = localStorage.getItem('vslGroupScenarios');
        if (savedGroup) {
            try {
                setGroupOverrides(JSON.parse(savedGroup));
            } catch (e) { console.error(e); }
        }

        setIsLoaded(true);
    }, []);

    // 2. Fetch Base Data
    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                const res = await fetch("/api/vsl");
                if (!res.ok) throw new Error("Veri çekilemedi");
                const data = await res.json();

                setBaseTeams(data.teams || []);
                const matches = (data.fixture || []).map((m: any) => ({
                    ...m,
                    matchDate: m.date
                }));
                setAllMatches(matches);

                // Check remaining matches
                let remaining = matches.filter((m: Match) => !m.isPlayed).length;
                const savedScenarios = localStorage.getItem('vslGroupScenarios');
                if (savedScenarios) {
                    try {
                        const allScenarios = JSON.parse(savedScenarios);
                        remaining = Math.max(0, remaining - Object.keys(allScenarios).length);
                    } catch (e) { }
                }
                setRemainingMatches(remaining);

            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    // Calculate live standings using predictions
    const teams = useMemo(() => {
        if (!baseTeams.length || !allMatches.length) return [];
        return calculateLiveStandings(baseTeams, allMatches, groupOverrides);
    }, [baseTeams, allMatches, groupOverrides]);

    // Save overrides when changed
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('vslPlayoffScenarios', JSON.stringify(playoffOverrides));
        }
    }, [playoffOverrides, isLoaded]);

    const isGroupsComplete = remainingMatches === 0;

    // Get playoff teams from calculated standings
    const top4 = teams.slice(0, 4);
    const teams5to8 = teams.slice(4, 8);

    const handleScoreChange = (matchId: string, score: string) => {
        const newOverrides = { ...playoffOverrides };
        if (score) {
            newOverrides[matchId] = score;
        } else {
            delete newOverrides[matchId];
        }
        setPlayoffOverrides(newOverrides);
    };

    // seriesType: 5 = best of 5 (wins 3), 3 = best of 3 (wins 2)
    const renderBracketMatch = (matchId: string, homeTeam: string | null, awayTeam: string | null, label: string, seriesType: 5 | 3 = 5) => {
        const score = playoffOverrides[matchId];
        const [homeScore, awayScore] = score ? score.split('-').map(Number) : [null, null];
        const homeWin = homeScore !== null && awayScore !== null && homeScore > awayScore;
        const awayWin = homeScore !== null && awayScore !== null && awayScore > homeScore;

        // Score options based on series type
        const scoreOptions = seriesType === 5
            ? [
                { value: '3-0', label: '3-0' },
                { value: '3-1', label: '3-1' },
                { value: '3-2', label: '3-2' },
                { value: '2-3', label: '2-3' },
                { value: '1-3', label: '1-3' },
                { value: '0-3', label: '0-3' },
            ]
            : [
                { value: '2-0', label: '2-0' },
                { value: '2-1', label: '2-1' },
                { value: '1-2', label: '1-2' },
                { value: '0-2', label: '0-2' },
            ];

        return (
            <div className="bg-slate-800 rounded-lg p-3 border border-slate-700 space-y-2 min-w-[200px]">
                <div className="text-[10px] text-rose-400 font-bold uppercase tracking-wider">{label}</div>
                <div className={`flex items-center justify-between p-2 rounded ${homeWin ? 'bg-emerald-500/20 border border-emerald-500/30' : 'bg-slate-900/50'}`}>
                    <span className={`text-sm truncate flex-1 ${homeWin ? 'text-emerald-400 font-bold' : 'text-slate-300'}`}>
                        {homeTeam || 'TBD'}
                    </span>
                    <span className={`text-sm ml-2 ${homeWin ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}>{homeScore ?? '-'}</span>
                </div>
                <div className={`flex items-center justify-between p-2 rounded ${awayWin ? 'bg-emerald-500/20 border border-emerald-500/30' : 'bg-slate-900/50'}`}>
                    <span className={`text-sm truncate flex-1 ${awayWin ? 'text-emerald-400 font-bold' : 'text-slate-300'}`}>
                        {awayTeam || 'TBD'}
                    </span>
                    <span className={`text-sm ml-2 ${awayWin ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}>{awayScore ?? '-'}</span>
                </div>
                {homeTeam && awayTeam && (
                    <select
                        value={score || ''}
                        onChange={(e) => handleScoreChange(matchId, e.target.value)}
                        className="w-full mt-2 p-2 bg-slate-900 border border-slate-600 rounded text-xs text-white"
                    >
                        <option value="">Seri Sonucu Seç ({seriesType} Maç)</option>
                        {scoreOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                )}
            </div>
        );
    };

    // Calculate winners for progression
    const getWinner = (matchId: string, homeTeam: string | null, awayTeam: string | null): string | null => {
        const score = playoffOverrides[matchId];
        if (!score || !homeTeam || !awayTeam) return null;
        const [homeScore, awayScore] = score.split('-').map(Number);
        return homeScore > awayScore ? homeTeam : awayTeam;
    };

    const getLoser = (matchId: string, homeTeam: string | null, awayTeam: string | null): string | null => {
        const score = playoffOverrides[matchId];
        if (!score || !homeTeam || !awayTeam) return null;
        const [homeScore, awayScore] = score.split('-').map(Number);
        return homeScore > awayScore ? awayTeam : homeTeam;
    };

    // 1-4 Playoff bracket
    // Semi 1: 1 vs 4, Semi 2: 2 vs 3
    // Final: Winner S1 vs Winner S2
    // 3/4'lük: Loser S1 vs Loser S2
    const semi1Home = top4[0]?.name || null;
    const semi1Away = top4[3]?.name || null;
    const semi2Home = top4[1]?.name || null;
    const semi2Away = top4[2]?.name || null;

    const semi1Winner = getWinner('vsl-semi-1', semi1Home, semi1Away);
    const semi1Loser = getLoser('vsl-semi-1', semi1Home, semi1Away);
    const semi2Winner = getWinner('vsl-semi-2', semi2Home, semi2Away);
    const semi2Loser = getLoser('vsl-semi-2', semi2Home, semi2Away);

    const finalWinner = getWinner('vsl-final', semi1Winner, semi2Winner);
    const thirdPlaceWinner = getWinner('vsl-3rd', semi1Loser, semi2Loser);

    // 5-8 Playoff bracket
    // Semi 5-8: 5 vs 8, 6 vs 7
    // 5/6'lık (Final): Winner S1 vs Winner S2
    // 7/8'lik: Loser S1 vs Loser S2
    const semi58_1Home = teams5to8[0]?.name || null;
    const semi58_1Away = teams5to8[3]?.name || null;
    const semi58_2Home = teams5to8[1]?.name || null;
    const semi58_2Away = teams5to8[2]?.name || null;

    const semi58_1Winner = getWinner('vsl-58-semi-1', semi58_1Home, semi58_1Away);
    const semi58_1Loser = getLoser('vsl-58-semi-1', semi58_1Home, semi58_1Away);
    const semi58_2Winner = getWinner('vsl-58-semi-2', semi58_2Home, semi58_2Away);
    const semi58_2Loser = getLoser('vsl-58-semi-2', semi58_2Home, semi58_2Away);

    if (loading) {
        return (
            <main className="min-h-screen bg-slate-950 text-slate-100 p-8 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
            <div className="max-w-7xl mx-auto space-y-8">
                <PageHeader
                    title="Sultanlar Ligi Play-Off"
                    subtitle="Şampiyonluk ve sıralama mücadelesi 2025-2026"
                />

                {!isGroupsComplete && (
                    <div className="bg-rose-500/10 border border-rose-500/20 text-rose-200 p-4 rounded-lg flex items-center gap-3">
                        <span className="text-2xl">⚠️</span>
                        <div>
                            <p className="font-bold text-sm">Lig Etabı Henüz Tamamlanmadı</p>
                            <p className="text-xs opacity-70">
                                Play-Off senaryoları mevcut sıralamaya göre hesaplanmaktadır.
                                Kesin sonuçlar için önce lig maçlarını tamamlayın.
                            </p>
                        </div>
                    </div>
                )}

                <div className="relative">
                    {!isGroupsComplete && (
                        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-20 flex flex-col items-center justify-start pt-16 rounded-xl">
                            <div className="text-6xl mb-4">🔒</div>
                            <h3 className="text-xl font-bold text-white mb-2">Play-Off Kilitli</h3>
                            <p className="text-slate-400 text-sm text-center max-w-md mb-4">
                                Play-Off senaryolarını düzenleyebilmek için önce tüm lig maçlarını tahmin etmeniz gerekmektedir.
                            </p>
                            <p className="text-rose-400 font-medium">
                                {remainingMatches} maç eksik
                            </p>
                            <Link href="/vsl/tahminoyunu" className="mt-4 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg transition-colors">
                                Tahminleri Tamamla →
                            </Link>
                        </div>
                    )}

                    <div className={`${!isGroupsComplete ? 'opacity-30 pointer-events-none select-none' : ''} space-y-12`}>

                        {/* 1-4 PLAYOFF */}
                        <div className="bg-gradient-to-br from-rose-900/30 to-slate-900/50 border border-rose-500/20 rounded-xl p-6">
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                                Play-Off 1. Etap (1-4)
                                <span className="text-xs text-rose-400 ml-auto">Şampiyonluk Mücadelesi</span>
                            </h2>

                            <div className="flex gap-2 border-b border-rose-500/20 mb-6 overflow-x-auto pb-2">
                                <button
                                    onClick={() => setActiveTab1_4('semi')}
                                    className={`px-4 py-2 text-sm font-bold rounded-t-lg transition-colors whitespace-nowrap ${activeTab1_4 === 'semi' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                                >
                                    Yarı Final
                                </button>
                                <button
                                    onClick={() => setActiveTab1_4('final')}
                                    className={`px-4 py-2 text-sm font-bold rounded-t-lg transition-colors whitespace-nowrap ${activeTab1_4 === 'final' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                                >
                                    Final
                                </button>
                                <button
                                    onClick={() => setActiveTab1_4('3rd')}
                                    className={`px-4 py-2 text-sm font-bold rounded-t-lg transition-colors whitespace-nowrap ${activeTab1_4 === '3rd' ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                                >
                                    3.lük Maçı
                                </button>
                            </div>

                            <div className="min-h-[300px]">
                                {activeTab1_4 === 'semi' && (
                                    <div className="space-y-6">
                                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Yarı Final (3 Maç Üzerinden)</div>
                                        <div className="grid md:grid-cols-2 gap-6">
                                            {renderBracketMatch('vsl-semi-1', semi1Home, semi1Away, '1. vs 4. (Yarı Final 1)')}
                                            {renderBracketMatch('vsl-semi-2', semi2Home, semi2Away, '2. vs 3. (Yarı Final 2)')}
                                        </div>
                                        <div className="text-[10px] text-slate-500 bg-slate-900/50 p-2 rounded">
                                            ℹ️ İlk maç alt sırada tamamlayan takımın evinde, ikinci maç ve gerekirse üçüncü maç üst sırada tamamlayan takımın evinde oynanır. İki maç kazanan takım finale yükselir.
                                        </div>
                                    </div>
                                )}

                                {activeTab1_4 === 'final' && (
                                    <div className="space-y-6">
                                        <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">Şampiyonluk Finali (5 Maç Üzerinden)</div>
                                        <div className="max-w-md">
                                            {renderBracketMatch('vsl-final', semi1Winner, semi2Winner, 'FİNAL', 5)}
                                        </div>

                                        {finalWinner && (
                                            <div className="bg-gradient-to-r from-amber-500/20 to-amber-600/10 border border-amber-500/30 rounded-lg p-6 text-center max-w-md animate-in fade-in zoom-in duration-500">
                                                <div className="text-5xl mb-2">🏆</div>
                                                <div className="text-sm text-amber-400 uppercase tracking-wider font-bold">2025-2026 Şampiyonu</div>
                                                <div className="text-3xl font-black text-white mt-1">{finalWinner}</div>
                                            </div>
                                        )}

                                        <div className="text-[10px] text-slate-500 bg-slate-900/50 p-2 rounded">
                                            ℹ️ Final maçlarında ilk maç ligi alt sırada tamamlayan takımın evinde, ikinci ve üçüncü maç ligi üst sırada tamamlayan takımın evinde oynanır. Gerekirse dördüncü maç ligi alt sırada tamamlayan takımın, beşinci maç üst sırada tamamlayan takımın evinde oynanır. 3 maç kazanan takım lig şampiyonu olur.
                                        </div>
                                    </div>
                                )}

                                {activeTab1_4 === '3rd' && (
                                    <div className="space-y-6">
                                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">3.lük Mücadelesi (3 Maç Üzerinden)</div>
                                        <div className="max-w-md">
                                            {renderBracketMatch('vsl-3rd', semi1Loser, semi2Loser, '3.lük Maçı', 3)}
                                        </div>

                                        {thirdPlaceWinner && (
                                            <div className="bg-slate-800/50 border border-slate-600/30 rounded-lg p-4 text-center max-w-md">
                                                <div className="text-2xl mb-1">🥉</div>
                                                <div className="text-xs text-slate-400">3. Sıra</div>
                                                <div className="text-xl font-bold text-white">{thirdPlaceWinner}</div>
                                            </div>
                                        )}
                                        <div className="text-[10px] text-slate-500 bg-slate-900/50 p-2 rounded">
                                            ℹ️ 3.'lük maçlarında ilk maç ligi alt sırada tamamlayan takımın evinde, ikinci maç ve gerekirse üçüncü maç ligi üst sırada tamamlayan takımın evinde oynanır. 2 maç kazanan takım ligi 3. sırada tamamlar.
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 5-8 PLAYOFF */}
                        <div className="bg-gradient-to-br from-amber-900/30 to-slate-900/50 border border-amber-500/20 rounded-xl p-6">
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                                Play-Off 2. Etap (5-8)
                                <span className="text-xs text-amber-400 ml-auto">Sıralama Mücadelesi</span>
                            </h2>

                            <div className="flex gap-2 border-b border-amber-500/20 mb-6 overflow-x-auto pb-2">
                                <button
                                    onClick={() => setActiveTab5_8('semi')}
                                    className={`px-4 py-2 text-sm font-bold rounded-t-lg transition-colors whitespace-nowrap ${activeTab5_8 === 'semi' ? 'bg-amber-700 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                                >
                                    Yarı Final
                                </button>
                                <button
                                    onClick={() => setActiveTab5_8('final')}
                                    className={`px-4 py-2 text-sm font-bold rounded-t-lg transition-colors whitespace-nowrap ${activeTab5_8 === 'final' ? 'bg-emerald-700 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                                >
                                    5.lik Maçı
                                </button>
                                <button
                                    onClick={() => setActiveTab5_8('7th')}
                                    className={`px-4 py-2 text-sm font-bold rounded-t-lg transition-colors whitespace-nowrap ${activeTab5_8 === '7th' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                                >
                                    7.lik Maçı
                                </button>
                            </div>

                            <div className="min-h-[300px]">
                                {activeTab5_8 === 'semi' && (
                                    <div className="space-y-6">
                                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Yarı Final (3 Maç Üzerinden)</div>
                                        <div className="grid md:grid-cols-2 gap-6">
                                            {renderBracketMatch('vsl-58-semi-1', semi58_1Home, semi58_1Away, '5. vs 8.')}
                                            {renderBracketMatch('vsl-58-semi-2', semi58_2Home, semi58_2Away, '6. vs 7.')}
                                        </div>
                                        <div className="text-[10px] text-slate-500 bg-slate-900/50 p-2 rounded">
                                            ℹ️ 5.'lik maçları, ilk maç ligi alt sırada tamamlayan takımın evinde, ikinci maç ve gerekirse üçüncü maç ligi üst sırada tamamlayan takımın evinde oynanır. 2 maç kazanan takım 5. sırada tamamlar.
                                        </div>
                                    </div>
                                )}

                                {activeTab5_8 === 'final' && (
                                    <div className="space-y-6">
                                        <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">5.lik Mücadelesi (3 Maç Üzerinden)</div>
                                        <div className="max-w-md">
                                            {renderBracketMatch('vsl-58-final', semi58_1Winner, semi58_2Winner, '5.lik Maçı', 3)}
                                        </div>
                                        <div className="text-[10px] text-slate-500 bg-slate-900/50 p-2 rounded">
                                            ℹ️ 2 maç kazanan takım ligi 5. sırada tamamlar.
                                        </div>
                                    </div>
                                )}

                                {activeTab5_8 === '7th' && (
                                    <div className="space-y-6">
                                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">7.lik Mücadelesi (3 Maç Üzerinden)</div>
                                        <div className="max-w-md">
                                            {renderBracketMatch('vsl-58-7th', semi58_1Loser, semi58_2Loser, '7.lik Maçı', 3)}
                                        </div>
                                        <div className="text-[10px] text-slate-500 bg-slate-900/50 p-2 rounded">
                                            ℹ️ 7.'lik maçları, ilk maç ligi alt sırada tamamlayan takımın evinde, ikinci maç ve gerekirse üçüncü maç ligi üst sırada tamamlayan takımın evinde oynanır. 2 maç kazanan takım ligi 7. sırada tamamlar.
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* European Competitions Info */}
                        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
                            <h2 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
                                <span>🌍</span> Avrupa Kupaları Katılımı
                            </h2>
                            <p className="text-sm text-slate-300">
                                Avrupa Kupalarına katılım (Şampiyonlar Ligi, CEV Cup, Challenge Cup ve Balkan Kupası),
                                Play-Off 1. ve 2. Etap maçları sonucunda belirlenen sıralamaya göre yapılır.
                                CEV Kontenjanına göre takımlar belirlenir.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
