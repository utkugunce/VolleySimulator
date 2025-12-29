import { useState } from "react";
import { Match } from "../../types";
import { SCORES, normalizeTeamName } from "../../utils/calculatorUtils";

interface FixtureListProps {
    matches: Match[];
    overrides: Record<string, string>;
    onScoreChange: (matchId: string, score: string) => void;
    teamRanks?: Map<string, number>;
}

export default function FixtureList({ matches, overrides, onScoreChange, teamRanks }: FixtureListProps) {
    const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

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

    // Parse date from DD.MM.YYYY format
    const parseDate = (dateStr: string | undefined): Date | null => {
        if (!dateStr) return null;
        const parts = dateStr.split('.');
        if (parts.length === 3) {
            return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
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

    // Format date for display
    const formatDateDisplay = (dateStr: string): string => {
        if (dateStr === 'Tarih Belirtilmemiş') return dateStr;
        const parts = dateStr.split('.');
        if (parts.length !== 3) return dateStr;
        const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
        return `${parseInt(parts[0])} ${months[parseInt(parts[1]) - 1]} ${parts[2]}`;
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
                        <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px]">{upcomingMatches.length}</span>
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
                    sortedDateGroups.map(([dateStr, dateMatches]) => (
                        <div key={dateStr} className="space-y-2">
                            <div className="sticky top-0 z-5 bg-slate-950/90 backdrop-blur-sm py-2 px-3 rounded-lg border border-slate-800 flex items-center justify-between">
                                <span className="text-sm font-bold text-indigo-400">📆 {formatDateDisplay(dateStr)}</span>
                                <span className="text-xs text-slate-500 bg-slate-800/50 px-2 py-0.5 rounded">{dateMatches.length} maç</span>
                            </div>

                            {dateMatches.map((match) => {
                                const matchId = `${match.homeTeam}-${match.awayTeam}`;
                                const currentScore = overrides[matchId];
                                const isPlayed = match.isPlayed;
                                const homeRank = getTeamRank(match.homeTeam);
                                const awayRank = getTeamRank(match.awayTeam);

                                return (
                                    <div
                                        key={matchId}
                                        className={`p-3 rounded-lg border transition-all ${isPlayed
                                            ? 'bg-slate-950/50 border-slate-800/50'
                                            : currentScore
                                                ? 'bg-slate-800 border-indigo-500/50 shadow-md ring-1 ring-indigo-500/20'
                                                : 'bg-slate-800 border-slate-700 hover:border-slate-600'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between text-xs mb-2">
                                            <div className={`flex-1 text-right font-semibold truncate pr-2 flex items-center justify-end gap-1 ${currentScore && getScoreWinner(currentScore) === 'home' ? 'text-emerald-400' : 'text-slate-300'}`}>
                                                {homeRank && (
                                                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${homeRank <= 2 ? 'bg-emerald-500/20 text-emerald-400' : homeRank <= 4 ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-700 text-slate-500'}`}>
                                                        {homeRank}.
                                                    </span>
                                                )}
                                                <span className="truncate">{match.homeTeam}</span>
                                            </div>
                                            <div className="text-[10px] text-slate-600 font-mono shrink-0 px-1">v</div>
                                            <div className={`flex-1 text-left font-semibold truncate pl-2 flex items-center gap-1 ${currentScore && getScoreWinner(currentScore) === 'away' ? 'text-emerald-400' : 'text-slate-300'}`}>
                                                <span className="truncate">{match.awayTeam}</span>
                                                {awayRank && (
                                                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${awayRank <= 2 ? 'bg-emerald-500/20 text-emerald-400' : awayRank <= 4 ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-700 text-slate-500'}`}>
                                                        {awayRank}.
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {isPlayed ? (
                                            <div className="flex justify-center">
                                                <span className="px-3 py-1 bg-slate-900 font-mono font-bold text-slate-400 rounded border border-slate-800 text-sm">
                                                    {match.resultScore || "Oynandı"}
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
                                                            className={`w-10 h-7 flex items-center justify-center rounded text-xs font-bold transition-all border ${isSelected
                                                                ? homeWin
                                                                    ? 'bg-emerald-600 border-emerald-500 text-white shadow-emerald-500/30 shadow-md'
                                                                    : 'bg-rose-600 border-rose-500 text-white shadow-rose-500/30 shadow-md'
                                                                : 'bg-slate-950 border-slate-700 text-slate-500 hover:bg-slate-800 hover:text-slate-300'
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
                    ))
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
