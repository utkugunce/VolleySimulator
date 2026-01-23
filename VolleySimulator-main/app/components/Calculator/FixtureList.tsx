import { useState } from "react";
import { Match } from "@/app/types";
import { SCORES, normalizeTeamName } from "../../utils/calculatorUtils";
import TeamAvatar from "../TeamAvatar";

interface FixtureListProps {
    matches: Match[];
    overrides: Record<string, string>;
    onScoreChange: (matchId: string, score: string) => void;
    teamRanks?: Map<string, number>;
    totalTeams?: number;
    relegationSpots?: number;
}

export default function FixtureList({ matches, overrides, onScoreChange, teamRanks, totalTeams = 16, relegationSpots = 2 }: FixtureListProps) {
    const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
    const [collapsedDates, setCollapsedDates] = useState<Set<string>>(new Set());

    const toggleDateCollapse = (dateStr: string) => {
        setCollapsedDates(prev => {
            const newSet = new Set(prev);
            if (newSet.has(dateStr)) {
                newSet.delete(dateStr);
            } else {
                newSet.add(dateStr);
            }
            return newSet;
        });
    };

    const getTeamRank = (teamName: string): number | null => {
        if (!teamRanks) return null;
        if (teamRanks.has(teamName)) return teamRanks.get(teamName)!;
        const normalized = normalizeTeamName(teamName);
        for (const [key, rank] of teamRanks.entries()) {
            if (normalizeTeamName(key) === normalized) return rank;
        }
        return null;
    };

    const parseDate = (dateStr: string | undefined): Date | null => {
        if (!dateStr) return null;

        if (dateStr.includes('.')) {
            const parts = dateStr.split('.');
            if (parts.length === 3) {
                return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
            }
        }

        if (dateStr.includes('-')) {
            const parts = dateStr.split('-');
            if (parts.length === 3) {
                return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
            }
        }

        return null;
    };

    const isMatchPlayed = (m: Match) => {
        return m.isPlayed || (m.homeScore !== undefined && m.homeScore !== null && m.awayScore !== undefined && m.awayScore !== null);
    };

    const upcomingMatches = matches.filter(m => !isMatchPlayed(m));
    const pastMatches = matches.filter(m => isMatchPlayed(m));
    const currentMatches = activeTab === 'upcoming' ? upcomingMatches : pastMatches;

    const groupedMatches = currentMatches.reduce((acc, match) => {
        const matchDate = match.matchDate || (match as any).date || 'Tarih Belirtilmemiş';
        if (!acc[matchDate]) acc[matchDate] = [];
        acc[matchDate].push(match);
        return acc;
    }, {} as Record<string, Match[]>);

    const sortedDateGroups = Object.entries(groupedMatches).sort((a, b) => {
        const dateA = parseDate(a[0]);
        const dateB = parseDate(b[0]);
        if (!dateA && !dateB) return 0;
        if (!dateA) return 1;
        if (!dateB) return -1;
        const dateDiff = activeTab === 'upcoming'
            ? dateA.getTime() - dateB.getTime()
            : dateB.getTime() - dateA.getTime();
        return dateDiff;
    }).map(([dateStr, matches]) => {
        const sortedMatches = [...matches].sort((m1, m2) => {
            const t1 = m1.matchTime || (m1 as any).time || "00:00";
            const t2 = m2.matchTime || (m2 as any).time || "00:00";
            return t1.localeCompare(t2);
        });
        return [dateStr, sortedMatches] as [string, Match[]];
    });

    const formatDateDisplay = (dateStr: string): string => {
        if (dateStr === 'Tarih Belirtilmemiş') return dateStr;
        const date = parseDate(dateStr);
        if (!date) return dateStr;
        const days = ['PAZAR', 'PAZARTESİ', 'SALI', 'ÇARŞAMBA', 'PERŞEMBE', 'CUMA', 'CUMARTESİ'];
        const dayName = days[date.getDay()];
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year} ${dayName}`;
    };

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow-xl flex flex-col h-full">
            <div className="bg-slate-800/50 px-2 py-2 border-b border-slate-800 sticky top-0 z-10 font-sans">
                <div className="flex gap-1">
                    <button
                        onClick={() => setActiveTab('upcoming')}
                        className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${activeTab === 'upcoming'
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                            }`}
                    >
                        <span>📅</span>
                        <span>Gelecek</span>
                        <span className="bg-white/20 px-1.5 py-0.5 rounded text-[9px]">{upcomingMatches.length}</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('past')}
                        className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${activeTab === 'past'
                            ? 'bg-slate-600 text-white shadow-lg'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                            }`}
                    >
                        <span>✅</span>
                        <span>Geçmiş</span>
                        <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px]">{pastMatches.length}</span>
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-3 custom-scrollbar">
                {sortedDateGroups.length === 0 ? (
                    <div className="flex items-center justify-center h-32 text-slate-500 text-sm">
                        {activeTab === 'upcoming' ? 'Gelecek maç bulunamadı' : 'Geçmiş maç bulunamadı'}
                    </div>
                ) : (
                    sortedDateGroups.map(([dateStr, dateMatches]) => {
                        const isCollapsed = collapsedDates.has(dateStr);
                        return (
                            <div key={dateStr} className="space-y-1">
                                <button
                                    onClick={() => toggleDateCollapse(dateStr)}
                                    className="sticky top-0 z-5 w-full bg-slate-950/95 backdrop-blur-sm py-1 px-2 rounded-md border border-slate-800 flex items-center justify-between hover:bg-slate-900/90 transition-colors cursor-pointer shadow-sm"
                                >
                                    <span className="text-[10px] font-bold text-indigo-400 flex items-center gap-2">
                                        <span className={`transition-transform duration-200 text-[8px] ${isCollapsed ? '' : 'rotate-90'}`}>▶</span>
                                        {formatDateDisplay(dateStr)}
                                    </span>
                                    <span className="text-[9px] text-slate-400 bg-slate-800/50 px-1.5 py-px rounded">{dateMatches.length} maç</span>
                                </button>

                                {!isCollapsed && dateMatches.map((match) => {
                                    const matchId = `${match.homeTeam}-${match.awayTeam}`;
                                    const currentScore = overrides[matchId];
                                    const isPlayed = isMatchPlayed(match);

                                    const homeRank = getTeamRank(match.homeTeam);
                                    const awayRank = getTeamRank(match.awayTeam);
                                    const matchTime = match.matchTime || (match as any).time;

                                    const isHomeRelegation = homeRank ? homeRank >= (totalTeams - relegationSpots + 1) : false;
                                    const isAwayRelegation = awayRank ? awayRank >= (totalTeams - relegationSpots + 1) : false;

                                    return (
                                        <div
                                            key={matchId}
                                            id={`match-${match.homeTeam}-${match.awayTeam}`}
                                            className={`p-1.5 rounded-lg border transition-all flex items-center gap-2 ${isPlayed
                                                ? 'bg-slate-950/50 border-slate-800/50'
                                                : currentScore
                                                    ? 'bg-slate-800 border-indigo-500/50 shadow-md ring-1 ring-indigo-500/20'
                                                    : 'bg-slate-800 border-slate-700 hover:border-slate-600'
                                                }`}
                                        >
                                            <div className="flex flex-col items-center justify-center min-w-[32px] shrink-0 border-r border-slate-700/50 pr-2 mr-1">
                                                <span className="text-[10px] font-mono font-bold text-slate-300">
                                                    {matchTime || '--:--'}
                                                </span>
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between text-[10px] mb-1.5">
                                                    <div className={`flex-1 text-right font-semibold truncate pr-2 flex items-center justify-end gap-1 ${currentScore && getScoreWinner(currentScore) === 'home' ? 'text-emerald-400' : 'text-slate-300'}`}>
                                                        {isHomeRelegation && relegationSpots > 0 && <span className="bg-rose-500/20 text-rose-400 text-[8px] px-1 rounded font-bold whitespace-nowrap">DÜŞME</span>}
                                                        {homeRank && homeRank <= 4 && !isHomeRelegation && <span className="bg-blue-500/20 text-blue-400 text-[8px] px-1 rounded font-bold whitespace-nowrap">PO</span>}
                                                        {homeRank && (
                                                            <span className={`text-[9px] px-1 rounded font-bold ${homeRank <= 2 ? 'bg-emerald-500/20 text-emerald-400' : homeRank <= 4 ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-700 text-slate-400'}`}>
                                                                {homeRank}.
                                                            </span>
                                                        )}
                                                        <span className="truncate" title={match.homeTeam}>{match.homeTeam}</span>
                                                        <TeamAvatar name={match.homeTeam} size="xs" />
                                                    </div>

                                                    <div className="text-[9px] text-slate-600 font-mono shrink-0 px-0.5">v</div>

                                                    <div className={`flex-1 text-left font-semibold truncate pl-2 flex items-center gap-1 ${currentScore && getScoreWinner(currentScore) === 'away' ? 'text-emerald-400' : 'text-slate-300'}`}>
                                                        <TeamAvatar name={match.awayTeam} size="xs" />
                                                        <span className="truncate" title={match.awayTeam}>{match.awayTeam}</span>
                                                        {awayRank && (
                                                            <span className={`text-[9px] px-1 rounded font-bold ${awayRank <= 2 ? 'bg-emerald-500/20 text-emerald-400' : awayRank <= 4 ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-700 text-slate-400'}`}>
                                                                {awayRank}.
                                                            </span>
                                                        )}
                                                        {isAwayRelegation && relegationSpots > 0 && <span className="bg-rose-500/20 text-rose-400 text-[8px] px-1 rounded font-bold whitespace-nowrap">DÜŞME</span>}
                                                        {awayRank && awayRank <= 4 && !isAwayRelegation && <span className="bg-blue-500/20 text-blue-400 text-[8px] px-1 rounded font-bold whitespace-nowrap">PO</span>}
                                                    </div>
                                                </div>

                                                {isPlayed ? (
                                                    <div className="flex justify-center">
                                                        <span className="px-2 py-0.5 bg-slate-900 font-mono font-bold text-slate-400 rounded border border-slate-800 text-xs">
                                                            {match.homeScore !== undefined && match.homeScore !== null && match.awayScore !== undefined && match.awayScore !== null
                                                                ? `${match.homeScore} - ${match.awayScore}`
                                                                : match.resultScore || "Oynandı"}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <div className="flex justify-center gap-1.5 flex-wrap">
                                                        {SCORES.map(score => {
                                                            const isSelected = currentScore === score;
                                                            const [h, a] = score.split('-').map(Number);
                                                            const homeWin = h > a;
                                                            return (
                                                                <button
                                                                    key={score}
                                                                    onClick={() => onScoreChange(matchId, isSelected ? '' : score)}
                                                                    className={`w-9 h-7 sm:w-8 sm:h-6 flex items-center justify-center rounded-md text-[11px] sm:text-[10px] font-bold transition-all border ${isSelected
                                                                        ? homeWin
                                                                            ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-600/30 scale-110'
                                                                            : 'bg-rose-600 border-rose-500 text-white shadow-lg shadow-rose-600/30 scale-110'
                                                                        : 'bg-slate-950 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-300 hover:scale-105 active:scale-95'
                                                                        }`}
                                                                >
                                                                    {score}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                )}

                                                {!isPlayed && currentScore && (
                                                    <div className="flex justify-center mt-1">
                                                        <div className="h-0.5 w-8 bg-indigo-500/50 rounded-full"></div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

function getScoreWinner(score: string) {
    const [h, a] = score.split('-').map(Number);
    if (h > a) return 'home';
    if (a > h) return 'away';
    return null;
}
