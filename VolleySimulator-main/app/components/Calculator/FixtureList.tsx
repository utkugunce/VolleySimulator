import { useState } from "react";
import Link from "next/link";
import { Match } from "../../types";
import { SCORES, normalizeTeamName } from "../../utils/calculatorUtils";
import { generateTeamSlug } from "../../utils/teamSlug";
import TeamAvatar from "../TeamAvatar";

interface FixtureListProps {
    matches: Match[];
    overrides: Record<string, string>;
    onScoreChange: (matchId: string, score: string) => void;
    teamRanks?: Map<string, number>;
    totalTeams?: number; // Total teams in group for relegation calculation
    relegationSpots?: number; // Number of teams to be relegated
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

    // Helper to get team rank
    const getTeamRank = (teamName: string): number | null => {
        if (!teamRanks) return null;
        if (teamRanks.has(teamName)) return teamRanks.get(teamName)!;
        const normalized = normalizeTeamName(teamName);
        for (const [key, rank] of teamRanks.entries()) {
            if (normalizeTeamName(key) === normalized) return rank;
        }
        return null;
    };

    // Determine match importance based on team positions
    const getMatchImportance = (homeRank: number | null, awayRank: number | null): { label: string; color: string } | null => {
        if (!homeRank || !awayRank) return null;
        if (relegationSpots === 0) return null; // No relegation warning if spots is 0

        const playoffBoundary = 4; // Top 4 go to playoff usually (adjusted based on needs)
        const relegationBoundary = totalTeams - relegationSpots + 1; // e.g. 10 teams, 2 spots -> 9 and 10 are relegated. Boundary is 9.

        // Both in playoff zone
        if (homeRank <= playoffBoundary && awayRank <= playoffBoundary) {
            return { label: 'Playoff Karşılaşması', color: 'from-emerald-600/80 to-emerald-500/60 text-emerald-200' };
        }
        // One in playoff, one fighting for it
        if ((homeRank <= playoffBoundary && awayRank <= playoffBoundary + 1) || (awayRank <= playoffBoundary && homeRank <= playoffBoundary + 1)) {
            return { label: 'Playoff Mücadelesi', color: 'from-blue-600/80 to-blue-500/60 text-blue-200' };
        }
        // Both in relegation zone
        if (homeRank >= relegationBoundary && awayRank >= relegationBoundary) {
            return { label: '⚠️ KÜME DÜŞME HATTINDA KRİTİK MAÇ', color: 'from-rose-600/80 to-rose-500/60 text-rose-200' };
        }
        // One in relegation zone
        if (homeRank >= relegationBoundary || awayRank >= relegationBoundary) {
            return { label: '⚠️ KÜME DÜŞME TEHLİKESİ', color: 'from-orange-600/80 to-orange-500/60 text-orange-200' };
        }
        // Mid-table clash
        if (homeRank > playoffBoundary && homeRank < relegationBoundary && awayRank > playoffBoundary && awayRank < relegationBoundary) {
            return { label: 'Orta Sıra', color: 'from-slate-600/60 to-slate-500/40 text-slate-300' };
        }
        return null;
    };

    // Parse date from DD.MM.YYYY or YYYY-MM-DD format
    const parseDate = (dateStr: string | undefined): Date | null => {
        if (!dateStr) return null;

        // Try DD.MM.YYYY
        if (dateStr.includes('.')) {
            const parts = dateStr.split('.');
            if (parts.length === 3) {
                return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
            }
        }

        // Try YYYY-MM-DD
        if (dateStr.includes('-')) {
            const parts = dateStr.split('-');
            if (parts.length === 3) {
                return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
            }
        }

        return null;
    };

    // Split matches into upcoming and past
    const upcomingMatches = matches.filter(m => !m.isPlayed);
    const pastMatches = matches.filter(m => m.isPlayed);
    const currentMatches = activeTab === 'upcoming' ? upcomingMatches : pastMatches;

    // Group matches by date
    const groupedMatches = currentMatches.reduce((acc, match) => {
        const matchDate = match.matchDate || (match as any).date || 'Tarih Belirtilmemiş';
        if (!acc[matchDate]) acc[matchDate] = [];
        acc[matchDate].push(match);
        return acc;
    }, {} as Record<string, Match[]>);

    // Sort date groups
    const sortedDateGroups = Object.entries(groupedMatches).sort((a, b) => {
        const dateA = parseDate(a[0]);
        const dateB = parseDate(b[0]);
        if (!dateA && !dateB) return 0;
        if (!dateA) return 1;
        if (!dateB) return -1;
        return activeTab === 'upcoming'
            ? dateA.getTime() - dateB.getTime()  // Nearest first
            : dateB.getTime() - dateA.getTime(); // Most recent first
    });

    // Format date for display with day name
    const formatDateDisplay = (dateStr: string): string => {
        if (dateStr === 'Tarih Belirtilmemiş') return dateStr;

        const date = parseDate(dateStr);
        if (!date) return dateStr;

        const days = ['PAZAR', 'PAZARTESİ', 'SALI', 'ÇARŞAMBA', 'PERŞEMBE', 'CUMA', 'CUMARTESİ'];
        const dayName = days[date.getDay()];

        // Format as DD/MM/YYYY
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();

        return `${day}/${month}/${year} ${dayName}`;
    };

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow-xl flex flex-col h-full">
            {/* Tabs */}
            <div className="bg-slate-800/50 px-2 py-2 border-b border-slate-800 sticky top-0 z-10">
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
                            <div key={dateStr} className="space-y-2">
                                <button
                                    onClick={() => toggleDateCollapse(dateStr)}
                                    className="sticky top-0 z-5 w-full bg-slate-950/90 backdrop-blur-sm py-1.5 px-3 rounded-lg border border-slate-800 flex items-center justify-between hover:bg-slate-900/90 transition-colors cursor-pointer"
                                >
                                    <span className="text-[10px] font-bold text-indigo-400 flex items-center gap-2">
                                        <span className={`transition-transform duration-200 ${isCollapsed ? '' : 'rotate-90'}`}>▶</span>
                                        📆 {formatDateDisplay(dateStr)}
                                    </span>
                                    <span className="text-[9px] text-slate-400 bg-slate-800/50 px-2 py-0.5 rounded">{dateMatches.length} maç</span>
                                </button>

                                {!isCollapsed && dateMatches.map((match) => {
                                    const matchId = `${match.homeTeam}-${match.awayTeam}`;
                                    const currentScore = overrides[matchId];
                                    const isPlayed = match.isPlayed;
                                    const homeRank = getTeamRank(match.homeTeam);
                                    const awayRank = getTeamRank(match.awayTeam);
                                    const matchImportance = getMatchImportance(homeRank, awayRank);

                                    return (
                                        <div
                                            key={matchId}
                                            id={`match-${match.homeTeam}-${match.awayTeam}`}
                                            className={`p-2 rounded-lg border transition-all ${isPlayed
                                                ? 'bg-slate-950/50 border-slate-800/50'
                                                : currentScore
                                                    ? 'bg-slate-800 border-indigo-500/50 shadow-md ring-1 ring-indigo-500/20'
                                                    : 'bg-slate-800 border-slate-700 hover:border-slate-600'
                                                }`}
                                        >
                                            {/* Match Importance Badge */}
                                            {matchImportance && !isPlayed && (
                                                <div className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-t-md -mx-3 -mt-3 mb-2 text-center bg-gradient-to-r ${matchImportance.color}`}>
                                                    {matchImportance.label}
                                                </div>
                                            )}

                                            <div className="flex items-center justify-between text-[10px] mb-1.5">
                                                <div className={`flex-1 text-right font-semibold truncate pr-2 flex items-center justify-end gap-1 ${currentScore && getScoreWinner(currentScore) === 'home' ? 'text-emerald-400' : 'text-slate-300'}`}>
                                                    {homeRank && (
                                                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${homeRank <= 2 ? 'bg-emerald-500/20 text-emerald-400' : homeRank <= 4 ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-700 text-slate-300'}`}>
                                                            {homeRank}.
                                                        </span>
                                                    )}
                                                    <Link href={`/takimlar/${generateTeamSlug(match.homeTeam)}`} className="truncate hover:underline">{match.homeTeam}</Link>
                                                    <TeamAvatar name={match.homeTeam} size="sm" />
                                                </div>
                                                <div className="text-[10px] text-slate-600 font-mono shrink-0 px-1">v</div>
                                                <div className={`flex-1 text-left font-semibold truncate pl-2 flex items-center gap-1 ${currentScore && getScoreWinner(currentScore) === 'away' ? 'text-emerald-400' : 'text-slate-300'}`}>
                                                    <TeamAvatar name={match.awayTeam} size="sm" />
                                                    <Link href={`/takimlar/${generateTeamSlug(match.awayTeam)}`} className="truncate hover:underline">{match.awayTeam}</Link>
                                                    {awayRank && (
                                                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${awayRank <= 2 ? 'bg-emerald-500/20 text-emerald-400' : awayRank <= 4 ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-700 text-slate-300'}`}>
                                                            {awayRank}.
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {isPlayed ? (
                                                <div className="flex justify-center">
                                                    <span className="px-3 py-1 bg-slate-900 font-mono font-bold text-slate-400 rounded border border-slate-800 text-sm">
                                                        {match.homeScore !== undefined && match.awayScore !== undefined
                                                            ? `${match.homeScore} - ${match.awayScore}`
                                                            : match.resultScore || "Oynandı"}
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="flex justify-center gap-1 flex-wrap">
                                                    {SCORES.map(score => {
                                                        const isSelected = currentScore === score;
                                                        const [h, a] = score.split('-').map(Number);
                                                        const homeWin = h > a;
                                                        return (
                                                            <button
                                                                key={score}
                                                                onClick={() => onScoreChange(matchId, isSelected ? '' : score)}
                                                                className={`w-8 h-6 flex items-center justify-center rounded text-[10px] font-bold transition-all border ${isSelected
                                                                    ? homeWin
                                                                        ? 'bg-emerald-700 border-emerald-600 text-white shadow-emerald-600/30 shadow-md'
                                                                        : 'bg-rose-700 border-rose-600 text-white shadow-rose-600/30 shadow-md'
                                                                    : 'bg-slate-950 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-300'
                                                                    }`}
                                                            >
                                                                {score}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            )}

                                            {!isPlayed && currentScore && (
                                                <div className="flex justify-center text-[10px] text-indigo-400 font-medium mt-2">✓ Tahmin Girildi</div>
                                            )}
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
