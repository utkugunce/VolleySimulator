"use client";

import { useEffect, useState, useMemo } from "react";
import { TeamStats, Match } from "../../types";
import Link from "next/link";
import PageHeader from "../../components/PageHeader";
import TeamAvatar from "../../components/TeamAvatar";
import { calculateLiveStandings } from "../../utils/calculatorUtils";

interface PoolData {
    poolName: string;
    teams: TeamStats[];
}

export default function CEVCLPlayoffsPage() {
    const [loading, setLoading] = useState(true);
    const [baseTeams, setBaseTeams] = useState<TeamStats[]>([]);
    const [allMatches, setAllMatches] = useState<Match[]>([]);
    const [groupOverrides, setGroupOverrides] = useState<Record<string, string>>({});
    const [remainingMatches, setRemainingMatches] = useState(0);
    const [playoffOverrides, setPlayoffOverrides] = useState<Record<string, string>>({});
    const [isLoaded, setIsLoaded] = useState(false);

    // Tab state
    const [activeTabFF, setActiveTabFF] = useState<'semi' | 'final' | '3rd'>('semi');

    // Load Overrides
    useEffect(() => {
        const savedPlayoff = localStorage.getItem('cevclPlayoffScenarios');
        if (savedPlayoff) {
            try {
                setPlayoffOverrides(JSON.parse(savedPlayoff));
            } catch (e) { console.error(e); }
        }

        const savedGroup = localStorage.getItem('cevclGroupScenarios');
        if (savedGroup) {
            try {
                setGroupOverrides(JSON.parse(savedGroup));
            } catch (e) { console.error(e); }
        }

        setIsLoaded(true);
    }, []);

    // Fetch Base Data
    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                const res = await fetch("/api/cev-cl");
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
                const savedScenarios = localStorage.getItem('cevclGroupScenarios');
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

    // Calculate live standings using predictions and group by pool
    const pools = useMemo(() => {
        if (!baseTeams.length) return [];

        const poolNames = ["Pool A", "Pool B", "Pool C", "Pool D", "Pool E"];
        const calculatedTeams = calculateLiveStandings(baseTeams, allMatches, groupOverrides);

        return poolNames.map(poolName => {
            const poolTeams = calculatedTeams
                .filter((t: TeamStats) => t.groupName === poolName)
                .sort((a: TeamStats, b: TeamStats) => {
                    if (b.points !== a.points) return b.points - a.points;
                    const aRatio = a.setsLost > 0 ? a.setsWon / a.setsLost : a.setsWon;
                    const bRatio = b.setsLost > 0 ? b.setsWon / b.setsLost : b.setsWon;
                    return bRatio - aRatio;
                });
            return { poolName, teams: poolTeams };
        });
    }, [baseTeams, allMatches, groupOverrides]);

    // Save overrides when changed
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('cevclPlayoffScenarios', JSON.stringify(playoffOverrides));
        }
    }, [playoffOverrides, isLoaded]);

    const isGroupsComplete = remainingMatches === 0;

    const handleScoreChange = (matchId: string, score: string) => {
        const newOverrides = { ...playoffOverrides };
        if (score) {
            newOverrides[matchId] = score;
        } else {
            delete newOverrides[matchId];
        }
        setPlayoffOverrides(newOverrides);
    };

    // Get pool winners and runners-up
    const poolWinners = pools.map(p => p.teams[0]?.name || null);
    const poolRunnersUp = pools.map(p => p.teams[1]?.name || null);
    const poolThirds = pools.map(p => p.teams[2]?.name || null);

    // Rank pool winners (simplified - based on points)
    const rankedWinners = pools
        .map((p, idx) => ({ name: p.teams[0]?.name, points: p.teams[0]?.points || 0, poolIdx: idx }))
        .sort((a, b) => b.points - a.points);

    // Rank runners-up
    const rankedRunnersUp = pools
        .map((p, idx) => ({ name: p.teams[1]?.name, points: p.teams[1]?.points || 0, poolIdx: idx }))
        .sort((a, b) => b.points - a.points);

    // Best 3rd placed team
    const rankedThirds = pools
        .map((p, idx) => ({ name: p.teams[2]?.name, points: p.teams[2]?.points || 0, poolIdx: idx }))
        .sort((a, b) => b.points - a.points);
    const bestThird = rankedThirds[0]?.name || null;

    // Calculate points for a match score
    const getMatchPoints = (score: string | undefined): { home: number, away: number } | null => {
        if (!score) return null;
        const [h, a] = score.split('-').map(Number);

        if (h === 3 && (a === 0 || a === 1)) return { home: 3, away: 0 };
        if (h === 3 && a === 2) return { home: 2, away: 1 };
        if (h === 2 && a === 3) return { home: 1, away: 2 };
        if ((h === 0 || h === 1) && a === 3) return { home: 0, away: 3 };
        return { home: 0, away: 0 }; // Should be unreachable for valid volleyball scores
    };

    const calculateLegacyResult = (matchId: string, homeTeam: string | null, awayTeam: string | null, matchFormat: '2leg' | '1match') => {
        if (!homeTeam || !awayTeam) return { winner: null, loser: null, goldenSetNeeded: false };

        if (matchFormat === '1match') {
            const score = playoffOverrides[`${matchId}-m1`];
            if (!score) return { winner: null, loser: null };
            const [h, a] = score.split('-').map(Number);
            return h > a ? { winner: homeTeam, loser: awayTeam } : { winner: awayTeam, loser: homeTeam };
        }

        // 2 Leg Logic
        const score1 = playoffOverrides[`${matchId}-m1`];
        const score2 = playoffOverrides[`${matchId}-m2`];
        const golden = playoffOverrides[`${matchId}-golden`];

        if (!score1 || !score2) return { winner: null, loser: null, goldenSetNeeded: false };

        const p1 = getMatchPoints(score1);
        const p2 = getMatchPoints(score2);

        if (!p1 || !p2) return { winner: null, loser: null };

        const totalHome = p1.home + p2.home;
        const totalAway = p1.away + p2.away;

        if (totalHome > totalAway) return { winner: homeTeam, loser: awayTeam, goldenSetNeeded: false };
        if (totalAway > totalHome) return { winner: awayTeam, loser: homeTeam, goldenSetNeeded: false };

        // Equal points -> Golden Set
        if (golden === 'home') return { winner: homeTeam, loser: awayTeam, goldenSetNeeded: true };
        if (golden === 'away') return { winner: awayTeam, loser: homeTeam, goldenSetNeeded: true };

        return { winner: null, loser: null, goldenSetNeeded: true };
    };

    const getWinner = (matchId: string, homeTeam: string | null, awayTeam: string | null, matchFormat: '2leg' | '1match' = '2leg'): string | null => {
        return calculateLegacyResult(matchId, homeTeam, awayTeam, matchFormat).winner;
    };

    const getLoser = (matchId: string, homeTeam: string | null, awayTeam: string | null, matchFormat: '2leg' | '1match' = '2leg'): string | null => {
        return calculateLegacyResult(matchId, homeTeam, awayTeam, matchFormat).loser;
    };

    // Randomize for CEV CL
    const randomizeCEVMatch = (matchId: string, matchFormat: '2leg' | '1match') => {
        const newOverrides = { ...playoffOverrides };
        const possibleScores = ['3-0', '3-1', '3-2', '2-3', '1-3', '0-3'];

        const s1 = possibleScores[Math.floor(Math.random() * possibleScores.length)];
        newOverrides[`${matchId}-m1`] = s1;

        if (matchFormat === '2leg') {
            const s2 = possibleScores[Math.floor(Math.random() * possibleScores.length)];
            newOverrides[`${matchId}-m2`] = s2;

            // Should we add a golden set?
            // Simple logic: check if randomized scores trigger it
            const p1 = getMatchPoints(s1);
            const p2 = getMatchPoints(s2);
            if (p1 && p2) {
                const totalHome = p1.home + p2.home;
                const totalAway = p1.away + p2.away;
                if (totalHome === totalAway) {
                    newOverrides[`${matchId}-golden`] = Math.random() > 0.5 ? 'home' : 'away';
                } else {
                    delete newOverrides[`${matchId}-golden`];
                }
            }
        }
        setPlayoffOverrides(newOverrides);
    };

    // matchFormat: '2leg' = 2-leg knockout (home & away), '1match' = single match
    const renderBracketMatch = (matchId: string, homeTeam: string | null, awayTeam: string | null, label: string, matchFormat: '2leg' | '1match' = '2leg') => {
        const result = calculateLegacyResult(matchId, homeTeam, awayTeam, matchFormat);
        const homeSeriesWin = result.winner === homeTeam;
        const awaySeriesWin = result.winner === awayTeam;
        const showGoldenSet = result.goldenSetNeeded;

        const formatLabel = matchFormat === '2leg' ? '2 Leg' : 'Tek Maç';

        return (
            <div className="bg-slate-800 rounded-lg p-3 border border-slate-700 space-y-3 min-w-[200px]">
                <div className="flex items-center justify-between border-b border-slate-700/50 pb-2">
                    <div className="text-[10px] text-blue-400 font-bold uppercase tracking-wider flex items-center gap-2">
                        {label}
                        {homeTeam && awayTeam && (
                            <button
                                onClick={() => randomizeCEVMatch(matchId, matchFormat)}
                                className="text-base hover:scale-110 transition-transform"
                                title="Rastgele Oynat"
                            >
                                🎲
                            </button>
                        )}
                    </div>
                    <span className="text-[9px] text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded">{formatLabel}</span>
                </div>

                <div className={`flex items-center justify-between p-2 rounded ${homeSeriesWin ? 'bg-emerald-500/20 border border-emerald-500/30' : 'bg-slate-900/50'}`}>
                    <span className={`text-xs truncate flex-1 ${homeSeriesWin ? 'text-emerald-400 font-bold' : 'text-slate-300'}`}>
                        {homeTeam || 'TBD'}
                    </span>
                    {homeSeriesWin && <span className="text-xs text-emerald-400 font-bold">Tur Atladı</span>}
                </div>

                <div className={`flex items-center justify-between p-2 rounded ${awaySeriesWin ? 'bg-emerald-500/20 border border-emerald-500/30' : 'bg-slate-900/50'}`}>
                    <span className={`text-xs truncate flex-1 ${awaySeriesWin ? 'text-emerald-400 font-bold' : 'text-slate-300'}`}>
                        {awayTeam || 'TBD'}
                    </span>
                    {awaySeriesWin && <span className="text-xs text-emerald-400 font-bold">Tur Atladı</span>}
                </div>

                {homeTeam && awayTeam && (
                    <div className="bg-slate-900/50 p-2 rounded border border-slate-800 mt-2 space-y-3">
                        {/* Match 1 */}
                        <div className="flex flex-col gap-1">
                            <span className="text-[9px] text-slate-500 uppercase font-bold pl-1">
                                {matchFormat === '1match' ? 'Maç Sonucu' : '1. Maç'}
                            </span>
                            <div className="flex flex-wrap gap-1">
                                {['3-0', '3-1', '3-2', '2-3', '1-3', '0-3'].map(score => {
                                    const isSelected = playoffOverrides[`${matchId}-m1`] === score;
                                    return (
                                        <button
                                            key={score}
                                            onClick={() => handleScoreChange(`${matchId}-m1`, isSelected ? '' : score)}
                                            className={`
                                                px-1.5 py-0.5 text-[10px] rounded border transition-all
                                                ${isSelected
                                                    ? 'bg-blue-600 border-blue-400 text-white font-bold shadow-[0_0_10px_rgba(37,99,235,0.5)]'
                                                    : 'bg-slate-900 border-slate-700 text-slate-500 hover:bg-slate-800 hover:border-slate-500'}
                                            `}
                                        >
                                            {score}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Match 2 (Only for 2leg) */}
                        {matchFormat === '2leg' && (
                            <div className="flex flex-col gap-1">
                                <span className="text-[9px] text-slate-500 uppercase font-bold pl-1">2. Maç</span>
                                <div className="flex flex-wrap gap-1">
                                    {['3-0', '3-1', '3-2', '2-3', '1-3', '0-3'].map(score => {
                                        const isSelected = playoffOverrides[`${matchId}-m2`] === score;
                                        return (
                                            <button
                                                key={score}
                                                onClick={() => handleScoreChange(`${matchId}-m2`, isSelected ? '' : score)}
                                                className={`
                                                    px-1.5 py-0.5 text-[10px] rounded border transition-all
                                                    ${isSelected
                                                        ? 'bg-blue-600 border-blue-400 text-white font-bold shadow-[0_0_10px_rgba(37,99,235,0.5)]'
                                                        : 'bg-slate-900 border-slate-700 text-slate-500 hover:bg-slate-800 hover:border-slate-500'}
                                                `}
                                            >
                                                {score}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Golden Set Input */}
                        {showGoldenSet && (
                            <div className="flex flex-col gap-1 animate-in fade-in slide-in-from-top-2">
                                <span className="text-[9px] text-amber-500 uppercase font-bold pl-1 flex items-center gap-1">
                                    <span>🏆</span> Altın Set Kazananı
                                </span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleScoreChange(`${matchId}-golden`, 'home')}
                                        className={`flex-1 py-1.5 text-[10px] rounded border ${playoffOverrides[`${matchId}-golden`] === 'home' ? 'bg-amber-500/20 border-amber-500 text-amber-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}
                                    >
                                        Ev Sahibi
                                    </button>
                                    <button
                                        onClick={() => handleScoreChange(`${matchId}-golden`, 'away')}
                                        className={`flex-1 py-1.5 text-[10px] rounded border ${playoffOverrides[`${matchId}-golden`] === 'away' ? 'bg-amber-500/20 border-amber-500 text-amber-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}
                                    >
                                        Deplasman
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    // Playoff 6 pairings (6 teams: 5 runners-up + best 3rd)
    const playoff6_1_home = bestThird;
    const playoff6_1_away = rankedRunnersUp[0]?.name || null;
    const playoff6_2_home = rankedRunnersUp[4]?.name || null;
    const playoff6_2_away = rankedRunnersUp[1]?.name || null;
    const playoff6_3_home = rankedRunnersUp[3]?.name || null;
    const playoff6_3_away = rankedRunnersUp[2]?.name || null;

    const playoff6_1_winner = getWinner('cevcl-po6-1', playoff6_1_home, playoff6_1_away);
    const playoff6_2_winner = getWinner('cevcl-po6-2', playoff6_2_home, playoff6_2_away);
    const playoff6_3_winner = getWinner('cevcl-po6-3', playoff6_3_home, playoff6_3_away);

    // Quarterfinals pairings
    const qf1_home = playoff6_1_winner;
    const qf1_away = rankedWinners[2]?.name || null;
    const qf2_home = playoff6_2_winner;
    const qf2_away = rankedWinners[1]?.name || null;
    const qf3_home = rankedWinners[4]?.name || null;
    const qf3_away = rankedWinners[3]?.name || null;
    const qf4_home = playoff6_3_winner;
    const qf4_away = rankedWinners[0]?.name || null;

    const qf1_winner = getWinner('cevcl-qf-1', qf1_home, qf1_away);
    const qf2_winner = getWinner('cevcl-qf-2', qf2_home, qf2_away);
    const qf3_winner = getWinner('cevcl-qf-3', qf3_home, qf3_away);
    const qf4_winner = getWinner('cevcl-qf-4', qf4_home, qf4_away);

    // Final Four
    const sf1_winner = getWinner('cevcl-sf-1', qf1_winner, qf2_winner, '1match');
    const sf2_winner = getWinner('cevcl-sf-2', qf3_winner, qf4_winner, '1match');
    const sf1_loser = getLoser('cevcl-sf-1', qf1_winner, qf2_winner, '1match');
    const sf2_loser = getLoser('cevcl-sf-2', qf3_winner, qf4_winner, '1match');

    const finalWinner = getWinner('cevcl-final', sf1_winner, sf2_winner, '1match');
    const thirdPlaceWinner = getWinner('cevcl-3rd', sf1_loser, sf2_loser, '1match');

    if (loading) {
        return (
            <main className="min-h-screen bg-slate-950 text-slate-100 p-8 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
            <div className="max-w-7xl mx-auto space-y-6">
                <PageHeader
                    title="CEV Şampiyonlar Ligi"
                    subtitle="Playoff ve Final Four 2025-2026"
                />

                {!isGroupsComplete && (
                    <div className="bg-blue-500/10 border border-blue-500/20 text-blue-200 p-4 rounded-lg flex items-center gap-3">
                        <span className="text-2xl">⚠️</span>
                        <div>
                            <p className="font-bold text-sm">Havuz Etabı Henüz Tamamlanmadı</p>
                            <p className="text-xs opacity-70">
                                Play-Off senaryoları mevcut sıralamaya göre hesaplanmaktadır.
                                Kesin sonuçlar için önce tüm havuz maçlarını tahmin edin.
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
                                Play-Off senaryolarını düzenleyebilmek için önce tüm havuz maçlarını tahmin etmeniz gerekmektedir.
                            </p>
                            <p className="text-blue-400 font-medium">
                                {remainingMatches} maç eksik
                            </p>
                            <Link href="/cev-cl/tahminoyunu" className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors">
                                Tahminleri Tamamla →
                            </Link>
                        </div>
                    )}

                    <div className={`${!isGroupsComplete ? 'opacity-30 pointer-events-none select-none' : ''} space-y-6`}>

                        {/* Pool Qualification Status */}
                        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
                            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <span>📊</span> Havuz Durumu ve Kalifikasyon
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                                {pools.map((pool) => (
                                    <div key={pool.poolName} className="bg-slate-800 rounded-lg p-3 border border-slate-700">
                                        <div className="text-xs font-bold text-blue-400 mb-2">{pool.poolName}</div>
                                        <div className="space-y-1">
                                            {pool.teams.slice(0, 3).map((team, tIdx) => (
                                                <div key={team.name} className={`text-xs flex items-center gap-1 ${tIdx === 0 ? 'text-emerald-400' :
                                                    tIdx === 1 ? 'text-amber-400' :
                                                        'text-slate-400'
                                                    }`}>
                                                    <span className="w-4 text-center">{tIdx + 1}.</span>
                                                    <span className="truncate flex-1">{team.name}</span>
                                                    <span className="text-slate-500">{team.points}P</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded p-2 text-emerald-400 text-center">
                                    🏆 Havuz Birincileri → Çeyrek Final (Direkt)
                                </div>
                                <div className="bg-amber-500/10 border border-amber-500/20 rounded p-2 text-amber-400 text-center">
                                    📈 Havuz İkincileri + En İyi 3. → Playoff 6
                                </div>
                                <div className="bg-slate-500/10 border border-slate-500/20 rounded p-2 text-slate-400 text-center">
                                    📉 Diğer 3.'ler → CEV Cup'a Transfer
                                </div>
                            </div>
                        </div>

                        {/* PLAYOFF 6 */}
                        <div className="bg-gradient-to-br from-amber-900/30 to-slate-900/50 border border-amber-500/20 rounded-xl p-6">
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                                Playoff 6
                                <span className="text-xs text-amber-400 ml-auto">Şubat 2026</span>
                            </h2>
                            <p className="text-xs text-slate-400 mb-4">
                                5 havuz ikincisi + en iyi havuz 3.'sü (6 takım). Kazananlar Çeyrek Finale yükselir.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {renderBracketMatch('cevcl-po6-1', playoff6_1_home, playoff6_1_away, 'Tie 1: En İyi 3. vs 1. İkinci')}
                                {renderBracketMatch('cevcl-po6-2', playoff6_2_home, playoff6_2_away, 'Tie 2: 5. İkinci vs 2. İkinci')}
                                {renderBracketMatch('cevcl-po6-3', playoff6_3_home, playoff6_3_away, 'Tie 3: 4. İkinci vs 3. İkinci')}
                            </div>
                            <div className="text-[10px] text-slate-500 mt-3 bg-slate-900/50 p-2 rounded">
                                ℹ️ 2 ayaklı (home & away) eleme turu. Berabere kalınırsa Golden Set oynanır.
                            </div>
                        </div>

                        {/* QUARTERFINALS */}
                        <div className="bg-gradient-to-br from-blue-900/30 to-slate-900/50 border border-blue-500/20 rounded-xl p-6">
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                                Çeyrek Final
                                <span className="text-xs text-blue-400 ml-auto">Mart 2026</span>
                            </h2>
                            <p className="text-xs text-slate-400 mb-4">
                                5 havuz birincisi + 3 Playoff 6 kazananı (8 takım)
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {renderBracketMatch('cevcl-qf-1', qf1_home, qf1_away, 'QF1: PO6-1 K. vs 3. Birinci')}
                                {renderBracketMatch('cevcl-qf-2', qf2_home, qf2_away, 'QF2: PO6-2 K. vs 2. Birinci')}
                                {renderBracketMatch('cevcl-qf-3', qf3_home, qf3_away, 'QF3: 5. Birinci vs 4. Birinci')}
                                {renderBracketMatch('cevcl-qf-4', qf4_home, qf4_away, 'QF4: PO6-3 K. vs 1. Birinci')}
                            </div>
                            <div className="text-[10px] text-slate-500 mt-3 bg-slate-900/50 p-2 rounded">
                                ℹ️ 2 ayaklı (home & away) eleme turu. Berabere kalınırsa Golden Set oynanır.
                            </div>
                        </div>

                        {/* FINAL FOUR */}
                        <div className="bg-gradient-to-br from-purple-900/30 to-slate-900/50 border border-purple-500/20 rounded-xl p-6">
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                                Final Four
                                <span className="text-xs text-purple-400 ml-auto">2-3 Mayıs 2026</span>
                            </h2>
                            <p className="text-xs text-slate-400 mb-4">
                                Tek lokasyonda tekli maç formatında Yarı Final, 3.'lük ve Final
                            </p>

                            <div className="flex gap-2 border-b border-purple-500/20 mb-6 overflow-x-auto pb-2">
                                <button
                                    onClick={() => setActiveTabFF('semi')}
                                    className={`px-4 py-2 text-sm font-bold rounded-t-lg transition-colors whitespace-nowrap ${activeTabFF === 'semi' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                                >
                                    Yarı Final
                                </button>
                                <button
                                    onClick={() => setActiveTabFF('final')}
                                    className={`px-4 py-2 text-sm font-bold rounded-t-lg transition-colors whitespace-nowrap ${activeTabFF === 'final' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                                >
                                    Super Final
                                </button>
                                <button
                                    onClick={() => setActiveTabFF('3rd')}
                                    className={`px-4 py-2 text-sm font-bold rounded-t-lg transition-colors whitespace-nowrap ${activeTabFF === '3rd' ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                                >
                                    3.'lük Maçı
                                </button>
                            </div>

                            <div className="min-h-[250px]">
                                {activeTabFF === 'semi' && (
                                    <div className="space-y-6">
                                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Yarı Final (2 Mayıs - Tek Maç)</div>
                                        <div className="grid md:grid-cols-2 gap-6">
                                            {renderBracketMatch('cevcl-sf-1', qf1_winner, qf2_winner, 'SF1: QF1 K. vs QF2 K.', '1match')}
                                            {renderBracketMatch('cevcl-sf-2', qf3_winner, qf4_winner, 'SF2: QF3 K. vs QF4 K.', '1match')}
                                        </div>
                                    </div>
                                )}

                                {activeTabFF === 'final' && (
                                    <div className="space-y-6">
                                        <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">Super Final (3 Mayıs - Tek Maç)</div>
                                        <div className="max-w-md">
                                            {renderBracketMatch('cevcl-final', sf1_winner, sf2_winner, '🏆 ŞAMPİYONLUK FİNALİ', '1match')}
                                        </div>

                                        {finalWinner && (
                                            <div className="bg-gradient-to-r from-amber-500/20 to-amber-600/10 border border-amber-500/30 rounded-lg p-6 text-center max-w-md animate-in fade-in zoom-in duration-500">
                                                <div className="text-5xl mb-2">🏆</div>
                                                <div className="text-sm text-amber-400 uppercase tracking-wider font-bold">CEV Şampiyonlar Ligi Kazananı</div>
                                                <div className="text-3xl font-black text-white mt-1">{finalWinner}</div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTabFF === '3rd' && (
                                    <div className="space-y-6">
                                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">3.'lük Maçı (3 Mayıs - Tek Maç)</div>
                                        <div className="max-w-md">
                                            {renderBracketMatch('cevcl-3rd', sf1_loser, sf2_loser, '🥉 3. lük Mücadelesi', '1match')}
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

                        {/* Tournament Flow Info */}
                        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
                            <h2 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
                                <span>📋</span> Turnuva Formatı
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                                <div className="bg-slate-800 rounded-lg p-3">
                                    <div className="font-bold text-amber-400 mb-1">Playoff 6</div>
                                    <div className="text-slate-400">6 takım • 2 ayaklı</div>
                                    <div className="text-slate-500 mt-1">Şubat 2026</div>
                                </div>
                                <div className="bg-slate-800 rounded-lg p-3">
                                    <div className="font-bold text-blue-400 mb-1">Çeyrek Final</div>
                                    <div className="text-slate-400">8 takım • 2 ayaklı</div>
                                    <div className="text-slate-500 mt-1">Mart 2026</div>
                                </div>
                                <div className="bg-slate-800 rounded-lg p-3">
                                    <div className="font-bold text-purple-400 mb-1">Yarı Final</div>
                                    <div className="text-slate-400">4 takım • Tek maç</div>
                                    <div className="text-slate-500 mt-1">2 Mayıs 2026</div>
                                </div>
                                <div className="bg-slate-800 rounded-lg p-3">
                                    <div className="font-bold text-amber-400 mb-1">Super Final</div>
                                    <div className="text-slate-400">2 takım • Tek maç</div>
                                    <div className="text-slate-500 mt-1">3 Mayıs 2026</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
