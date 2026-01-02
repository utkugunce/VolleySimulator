"use client";

import { useEffect, useState, useMemo } from "react";
import { TeamStats, Match } from "../../types";
import Link from "next/link";
import { calculateLiveStandings } from "../../utils/calculatorUtils";
import PageHeader from "../../components/PageHeader";
import TeamAvatar from "../../components/TeamAvatar";

interface VSLPlayoffsClientProps {
    initialTeams: TeamStats[];
    initialMatches: Match[];
}

export default function VSLPlayoffsClient({ initialTeams, initialMatches }: VSLPlayoffsClientProps) {
    const [groupOverrides, setGroupOverrides] = useState<Record<string, string>>({});
    const [playoffOverrides, setPlayoffOverrides] = useState<Record<string, string>>({});
    const [isLoaded, setIsLoaded] = useState(false);

    // Tab states
    const [activeTab1_4, setActiveTab1_4] = useState<'semi' | 'final' | '3rd'>('semi');
    const [activeTab5_8, setActiveTab5_8] = useState<'semi' | 'final' | '7th'>('semi');

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

    const teams = useMemo(() => {
        return calculateLiveStandings(initialTeams, initialMatches, groupOverrides);
    }, [initialTeams, initialMatches, groupOverrides]);

    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('vslPlayoffScenarios', JSON.stringify(playoffOverrides));
        }
    }, [playoffOverrides, isLoaded]);

    const remainingMatchesCount = useMemo(() => {
        let remaining = initialMatches.filter((m: Match) => !m.isPlayed).length;
        remaining = Math.max(0, remaining - Object.keys(groupOverrides).length);
        return remaining;
    }, [initialMatches, groupOverrides]);

    const isGroupsComplete = remainingMatchesCount === 0;

    const top4 = useMemo(() => teams.slice(0, 4), [teams]);
    const teams5to8 = useMemo(() => teams.slice(4, 8), [teams]);

    const handleScoreChange = (matchId: string, score: string) => {
        const newOverrides = { ...playoffOverrides };
        if (score) {
            newOverrides[matchId] = score;
        } else {
            delete newOverrides[matchId];
        }
        setPlayoffOverrides(newOverrides);
    };

    const calculateSeriesResult = (matchId: string, homeTeam: string | null, awayTeam: string | null, seriesLength: 3 | 5) => {
        if (!homeTeam || !awayTeam) return { winner: null, loser: null, homeWins: 0, awayWins: 0 };

        let homeWins = 0;
        let awayWins = 0;
        const requiredWins = seriesLength === 3 ? 2 : 3;

        for (let i = 1; i <= seriesLength; i++) {
            const score = playoffOverrides[`${matchId}-m${i}`];
            if (score) {
                const [h, a] = score.split('-').map(Number);
                if (h > a) homeWins++;
                else if (a > h) awayWins++;
            }
        }

        let winner = null;
        let loser = null;

        if (homeWins >= requiredWins) {
            winner = homeTeam;
            loser = awayTeam;
        } else if (awayWins >= requiredWins) {
            winner = awayTeam;
            loser = homeTeam;
        }

        return { winner, loser, homeWins, awayWins };
    };

    const renderBracketMatch = (matchId: string, homeTeam: string | null, awayTeam: string | null, label: string, seriesType: 5 | 3 = 5) => {
        const result = calculateSeriesResult(matchId, homeTeam, awayTeam, seriesType);
        const homeSeriesWin = result.winner === homeTeam;
        const awaySeriesWin = result.winner === awayTeam;

        const matchInputs = [];
        for (let i = 1; i <= seriesType; i++) {
            let isHigherSeedHome = true;
            if (i === 1) isHigherSeedHome = false;
            if (i === 4) isHigherSeedHome = false;

            const matchHomeTeam = isHigherSeedHome ? homeTeam : awayTeam;
            const matchAwayTeam = isHigherSeedHome ? awayTeam : homeTeam;

            matchInputs.push(
                <div key={i} className="flex flex-col gap-1 mb-2">
                    <label htmlFor={`score-select-${matchId}-${i}`} className="text-xs text-slate-500 uppercase font-bold pl-1 block">
                        {i}. Maç: {matchHomeTeam || 'Ev'} vs {matchAwayTeam || 'Deplasman'}
                    </label>
                    <select
                        id={`score-select-${matchId}-${i}`}
                        value={playoffOverrides[`${matchId}-m${i}`] || ''}
                        onChange={(e) => handleScoreChange(`${matchId}-m${i}`, e.target.value)}
                        className="w-full p-2 bg-slate-900 border border-slate-700/50 rounded text-xs text-white focus:border-rose-500 transition-colors"
                    >
                        <option value="">Oynanmadı</option>
                        <option value="3-0">3-0</option>
                        <option value="3-1">3-1</option>
                        <option value="3-2">3-2</option>
                        <option value="2-3">2-3</option>
                        <option value="1-3">1-3</option>
                        <option value="0-3">0-3</option>
                    </select>
                </div>
            );
        }

        return (
            <div className="bg-slate-800 rounded-lg p-3 border border-slate-700 space-y-3 min-w-[240px]">
                <div className="flex justify-between items-center border-b border-slate-700/50 pb-2">
                    <div className="text-xs text-rose-400 font-bold uppercase tracking-wider">{label}</div>
                    <div className="text-xs font-bold text-slate-400 bg-slate-900 px-2 py-0.5 rounded">
                        Seri: {result.homeWins}-{result.awayWins}
                    </div>
                </div>

                <div className={`flex items-center justify-between p-2 rounded transition-colors ${homeSeriesWin ? 'bg-emerald-500/20 border border-emerald-500/30' : 'bg-slate-900/30'}`}>
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        <TeamAvatar name={homeTeam || ''} size="xs" />
                        <span className={`text-sm truncate ${homeSeriesWin ? 'text-emerald-400 font-bold' : 'text-slate-300'}`}>
                            {homeTeam || 'TBD (Üst Sıra)'}
                        </span>
                    </div>
                    {homeSeriesWin && <span className="text-xs text-emerald-400">🏆</span>}
                </div>

                <div className={`flex items-center justify-between p-2 rounded transition-colors ${awaySeriesWin ? 'bg-emerald-500/20 border border-emerald-500/30' : 'bg-slate-900/30'}`}>
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        <TeamAvatar name={awayTeam || ''} size="xs" />
                        <span className={`text-sm truncate ${awaySeriesWin ? 'text-emerald-400 font-bold' : 'text-slate-300'}`}>
                            {awayTeam || 'TBD (Alt Sıra)'}
                        </span>
                    </div>
                    {awaySeriesWin && <span className="text-xs text-emerald-400">🏆</span>}
                </div>

                {homeTeam && awayTeam && (
                    <div className="bg-slate-900/50 p-2 rounded border border-slate-800 mt-2">
                        <div className="text-xs text-slate-500 mb-2 font-bold text-center border-b border-slate-700 pb-1">MAÇ SKORLARI</div>
                        <div className="grid grid-cols-2 gap-2">
                            {matchInputs}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const getWinner = (matchId: string, homeTeam: string | null, awayTeam: string | null, seriesLength: 3 | 5 = 3): string | null => {
        return calculateSeriesResult(matchId, homeTeam, awayTeam, seriesLength).winner;
    };

    const getLoser = (matchId: string, homeTeam: string | null, awayTeam: string | null, seriesLength: 3 | 5 = 3): string | null => {
        return calculateSeriesResult(matchId, homeTeam, awayTeam, seriesLength).loser;
    };

    const semi1Home = top4[0]?.name || null;
    const semi1Away = top4[3]?.name || null;
    const semi2Home = top4[1]?.name || null;
    const semi2Away = top4[2]?.name || null;

    const semi1Winner = getWinner('vsl-semi-1', semi1Home, semi1Away, 3);
    const semi1Loser = getLoser('vsl-semi-1', semi1Home, semi1Away, 3);
    const semi2Winner = getWinner('vsl-semi-2', semi2Home, semi2Away, 3);
    const semi2Loser = getLoser('vsl-semi-2', semi2Home, semi2Away, 3);

    const finalWinner = getWinner('vsl-final', semi1Winner, semi2Winner, 5);
    const finalLoser = getLoser('vsl-final', semi1Winner, semi2Winner, 5);

    const thirdPlaceWinner = getWinner('vsl-3rd', semi1Loser, semi2Loser, 3);
    const thirdPlaceLoser = getLoser('vsl-3rd', semi1Loser, semi2Loser, 3);

    const semi58_1Home = teams5to8[0]?.name || null;
    const semi58_1Away = teams5to8[3]?.name || null;
    const semi58_2Home = teams5to8[1]?.name || null;
    const semi58_2Away = teams5to8[2]?.name || null;

    const semi58_1Winner = getWinner('vsl-58-semi-1', semi58_1Home, semi58_1Away, 3);
    const semi58_1Loser = getLoser('vsl-58-semi-1', semi58_1Home, semi58_1Away, 3);
    const semi58_2Winner = getWinner('vsl-58-semi-2', semi58_2Home, semi58_2Away, 3);
    const semi58_2Loser = getLoser('vsl-58-semi-2', semi58_2Home, semi58_2Away, 3);

    const fifthPlaceWinner = getWinner('vsl-58-final', semi58_1Winner, semi58_2Winner, 3);
    const fifthPlaceLoser = getLoser('vsl-58-final', semi58_1Winner, semi58_2Winner, 3);
    const seventhPlaceWinner = getWinner('vsl-58-7th', semi58_1Loser, semi58_2Loser, 3);
    const seventhPlaceLoser = getLoser('vsl-58-7th', semi58_1Loser, semi58_2Loser, 3);

    const allPlayoffsComplete = Boolean(
        finalWinner && finalLoser &&
        thirdPlaceWinner && thirdPlaceLoser &&
        fifthPlaceWinner && fifthPlaceLoser &&
        seventhPlaceWinner && seventhPlaceLoser
    );

    const finalStandings = allPlayoffsComplete ? [
        { rank: 1, team: finalWinner, badge: '🏆', color: 'text-amber-400', bgColor: 'bg-amber-500/20', borderColor: 'border-amber-500/30' },
        { rank: 2, team: finalLoser, badge: '🥈', color: 'text-amber-300', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/20' },
        { rank: 3, team: thirdPlaceWinner, badge: '🥉', color: 'text-amber-200', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/20' },
        { rank: 4, team: thirdPlaceLoser, badge: '', color: 'text-blue-400', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/20' },
        { rank: 5, team: fifthPlaceWinner, badge: '', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/20' },
        { rank: 6, team: fifthPlaceLoser, badge: '', color: 'text-purple-400', bgColor: 'bg-purple-500/10', borderColor: 'border-purple-500/20' },
        { rank: 7, team: seventhPlaceWinner, badge: '', color: 'text-slate-400', bgColor: 'bg-slate-800/50', borderColor: 'border-slate-700/50' },
        { rank: 8, team: seventhPlaceLoser, badge: '', color: 'text-slate-400', bgColor: 'bg-slate-800/50', borderColor: 'border-slate-700/50' },
    ] : [];

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
                            <h2 className="text-xl font-bold text-white mb-2">Play-Off Kilitli</h2>
                            <p className="text-slate-400 text-sm text-center max-w-md mb-4">
                                Play-Off senaryolarını düzenleyebilmek için önce tüm lig maçlarını tahmin etmeniz gerekmektedir.
                            </p>
                            <p className="text-rose-400 font-medium">
                                {remainingMatchesCount} maç eksik
                            </p>
                            <Link href="/vsl/tahminoyunu" className="mt-4 px-4 py-2 bg-rose-700 hover:bg-rose-600 text-white font-bold rounded-lg transition-colors">
                                Tahminleri Tamamla →
                            </Link>
                        </div>
                    )}

                    <div className={`${!isGroupsComplete ? 'opacity-30 pointer-events-none select-none' : ''} space-y-12`}>
                        <div className="bg-gradient-to-br from-rose-900/30 to-slate-900/50 border border-rose-500/20 rounded-xl p-6">
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                                Play-Off 1. Etap (1-4)
                                <span className="text-xs text-rose-400 ml-auto">Şampiyonluk Mücadelesi</span>
                            </h2>

                            <div className="flex gap-2 border-b border-rose-500/20 mb-6 overflow-x-auto pb-2">
                                <button
                                    onClick={() => setActiveTab1_4('semi')}
                                    className={`px-4 py-2 text-sm font-bold rounded-t-lg transition-colors whitespace-nowrap ${activeTab1_4 === 'semi' ? 'bg-rose-700 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                                >
                                    Yarı Final
                                </button>
                                <button
                                    onClick={() => setActiveTab1_4('final')}
                                    className={`px-4 py-2 text-sm font-bold rounded-t-lg transition-colors whitespace-nowrap ${activeTab1_4 === 'final' ? 'bg-amber-700 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                                >
                                    Final
                                </button>
                                <button
                                    onClick={() => setActiveTab1_4('3rd')}
                                    className={`px-4 py-2 text-sm font-bold rounded-t-lg transition-colors whitespace-nowrap ${activeTab1_4 === '3rd' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                                >
                                    3.lük Maçı
                                </button>
                            </div>

                            <div className="min-h-[300px]">
                                {activeTab1_4 === 'semi' && (
                                    <div className="space-y-6">
                                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Yarı Final (3 Maç Üzerinden)</div>
                                        <div className="grid md:grid-cols-2 gap-6">
                                            {renderBracketMatch('vsl-semi-1', semi1Home, semi1Away, '1. vs 4. (Yarı Final 1)', 3)}
                                            {renderBracketMatch('vsl-semi-2', semi2Home, semi2Away, '2. vs 3. (Yarı Final 2)', 3)}
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
                                    </div>
                                )}
                            </div>
                        </div>

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
                                            {renderBracketMatch('vsl-58-semi-1', semi58_1Home, semi58_1Away, '5. vs 8.', 3)}
                                            {renderBracketMatch('vsl-58-semi-2', semi58_2Home, semi58_2Away, '6. vs 7.', 3)}
                                        </div>
                                    </div>
                                )}

                                {activeTab5_8 === 'final' && (
                                    <div className="space-y-6">
                                        <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">5.lik Mücadelesi (3 Maç Üzerinden)</div>
                                        <div className="max-w-md">
                                            {renderBracketMatch('vsl-58-final', semi58_1Winner, semi58_2Winner, '5.lik Maçı', 3)}
                                        </div>
                                    </div>
                                )}

                                {activeTab5_8 === '7th' && (
                                    <div className="space-y-6">
                                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">7.lik Mücadelesi (3 Maç Üzerinden)</div>
                                        <div className="max-w-md">
                                            {renderBracketMatch('vsl-58-7th', semi58_1Loser, semi58_2Loser, '7.lik Maçı', 3)}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {allPlayoffsComplete && (
                            <div className="bg-gradient-to-br from-amber-900/20 via-slate-900/50 to-emerald-900/20 border border-amber-500/30 rounded-xl p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                                    <span className="text-3xl">🏅</span>
                                    <div>
                                        <div>Final Sıralaması</div>
                                        <div className="text-xs font-normal text-slate-400">2025-2026 Sultanlar Ligi</div>
                                    </div>
                                </h2>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                    {finalStandings.map((item) => (
                                        <div
                                            key={item.rank}
                                            className={`${item.bgColor} ${item.borderColor} border rounded-xl p-4 flex items-center gap-3 transition-all hover:scale-[1.02]`}
                                        >
                                            <div className={`text-3xl font-black ${item.color} min-w-[40px] text-center`}>
                                                {item.badge || `${item.rank}.`}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-xs text-slate-500 uppercase tracking-wider">
                                                    {item.rank}. Sıra
                                                </div>
                                                <div className={`font-bold truncate ${item.color}`}>
                                                    {item.team}
                                                </div>
                                            </div>
                                            {item.rank <= 3 && (
                                                <TeamAvatar name={item.team || ''} size="sm" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
