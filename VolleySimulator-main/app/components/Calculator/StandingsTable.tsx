import { TeamStats } from "../../types";
import { TeamDiff } from "../../utils/scenarioUtils";

interface StandingsTableProps {
    teams: TeamStats[];
    playoffSpots?: number;
    secondaryPlayoffSpots?: number; // For 5-8 playoff zone (VSL)
    relegationSpots?: number;
    initialRanks?: Map<string, number>; // For showing rank changes
    compact?: boolean;
    loading?: boolean;
    comparisonDiffs?: TeamDiff[];
}

export default function StandingsTable({
    teams,
    playoffSpots = 2,
    secondaryPlayoffSpots = 0,
    relegationSpots = 2,
    initialRanks,
    compact = false,
    loading = false,
    comparisonDiffs
}: StandingsTableProps) {
    const rowClass = compact ? "px-2 py-1 text-xs" : "px-2 py-2 text-xs sm:text-sm";
    const headClass = compact ? "px-2 py-1 text-xs uppercase" : "px-2 py-2 text-xs uppercase sm:text-sm";
    const rankSize = compact ? "w-5 h-5 text-[10px]" : "w-6 h-6 text-[10px]";

    if (loading) {
        return (
            <div className={`bg-bg-surface border border-white/10 rounded-lg overflow-hidden shadow-xl h-full p-4 space-y-4`}>
                <div className="h-6 bg-bg-base/50 rounded w-1/3 animate-pulse"></div>
                <div className="space-y-2">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="h-8 bg-bg-base/30 rounded animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-bg-surface border border-white/10 rounded-lg overflow-hidden shadow-xl flex flex-col h-full ${compact ? 'text-xs' : ''}`}>
            {!compact && (
                <div className="bg-bg-base/30 px-4 py-3 border-b border-white/10">
                    <h3 className="font-bold text-text-main flex items-center gap-2">
                        <span>📊</span> Puan Durumu
                    </h3>
                </div>
            )}

            {/* Legend - Only show if not compact, or show simplified */}
            {!compact && (
                <div className="px-4 py-2 bg-bg-base/30 border-b border-white/10 flex gap-4 text-[10px] text-text-muted flex-wrap">
                    <div className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                        <span className="opacity-80">Play-off (İlk {playoffSpots})</span>
                    </div>
                    {secondaryPlayoffSpots > 0 && (
                        <div className="flex items-center gap-1">
                            <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                            <span className="text-slate-400">5-8 Play-off ({playoffSpots + 1}-{playoffSpots + secondaryPlayoffSpots})</span>
                        </div>
                    )}
                    <div className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                        <span className="text-slate-400">Küme Düşme (Son {relegationSpots})</span>
                    </div>
                </div>
            )}

            <div className="overflow-x-auto flex-1">
                <table className={`w-full text-left ${compact ? 'text-xs' : 'text-xs sm:text-sm'}`}>
                    <thead className="bg-bg-base/50 text-text-muted tracking-wider font-semibold border-b border-white/10 sticky top-0">
                        <tr>
                            <th className={`${headClass} w-8 text-center`}>#</th>
                            <th className={headClass}>Takım</th>
                            <th className={`${headClass} w-8 text-center`} title="Oynanan Maç">OM</th>
                            <th className={`${headClass} w-8 text-center text-emerald-400`} title="Galibiyet">G</th>
                            <th className={`${headClass} w-8 text-center text-rose-400`} title="Mağlubiyet">M</th>
                            <th className={`${headClass} w-10 text-center text-amber-300 font-bold`} title="Puan">P</th>
                            <th className={`${headClass} w-8 text-center hidden sm:table-cell`} title="Alınan Set">AS</th>
                            <th className={`${headClass} w-8 text-center hidden sm:table-cell`} title="Verilen Set">VS</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {teams.map((team, idx) => {
                            const currentRank = idx + 1;
                            const isChampion = idx === 0;
                            const isPlayoff = idx < playoffSpots;
                            const isSecondaryPlayoff = secondaryPlayoffSpots > 0 && idx >= playoffSpots && idx < playoffSpots + secondaryPlayoffSpots;
                            const isRelegation = idx >= teams.length - relegationSpots;
                            const losses = team.played - team.wins;

                            // Calculate rank change
                            let rankChange = 0;
                            let pointDiff = 0;
                            let rankChangeIcon = null;
                            let pointDiffIcon = null;

                            if (comparisonDiffs) {
                                const diff = comparisonDiffs.find(d => d.name === team.name);
                                if (diff) {
                                    // Rank Diff
                                    rankChange = diff.rankDiff;
                                    if (rankChange > 0) rankChangeIcon = <span className="text-emerald-400 text-[9px] font-bold flex items-center gap-0.5">▲{rankChange}</span>;
                                    else if (rankChange < 0) rankChangeIcon = <span className="text-rose-400 text-[9px] font-bold flex items-center gap-0.5">▼{Math.abs(rankChange)}</span>;

                                    // Point Diff
                                    pointDiff = diff.pointDiff;
                                    if (pointDiff > 0) pointDiffIcon = <span className="text-emerald-400 text-[9px] ml-1">+{pointDiff}</span>;
                                    else if (pointDiff < 0) pointDiffIcon = <span className="text-rose-400 text-[9px] ml-1">{pointDiff}</span>;
                                }
                            } else if (initialRanks && initialRanks.has(team.name)) {
                                const oldRank = initialRanks.get(team.name)!;
                                rankChange = oldRank - currentRank;
                                if (rankChange > 0) {
                                    rankChangeIcon = <span className="text-emerald-400 text-[9px] font-bold flex items-center gap-0.5">▲{rankChange}</span>;
                                } else if (rankChange < 0) {
                                    rankChangeIcon = <span className="text-rose-400 text-[9px] font-bold flex items-center gap-0.5">▼{Math.abs(rankChange)}</span>;
                                }
                            }

                            return (
                                <tr key={team.name} className={`hover:bg-white/5 transition-colors ${isChampion ? 'bg-gradient-to-r from-amber-900/20 to-amber-800/10' : isPlayoff ? 'bg-emerald-900/10' : isSecondaryPlayoff ? 'bg-amber-900/10' : isRelegation ? 'bg-rose-900/10' : ''}`}>
                                    <td className={`${rowClass} text-center font-mono`}>
                                        <div className="flex items-center justify-center gap-0.5">
                                            <div className={`${rankSize} flex items-center justify-center rounded-full font-bold ${isChampion ? 'bg-gradient-to-b from-amber-400 to-amber-600 text-white shadow-amber-500/50 shadow-lg' :
                                                isPlayoff ? 'bg-emerald-500 text-white shadow-emerald-500/30 shadow-lg' :
                                                    isSecondaryPlayoff ? 'bg-amber-500 text-white shadow-amber-500/30 shadow-lg' :
                                                        isRelegation ? 'bg-rose-500 text-white shadow-rose-500/30 shadow-lg' :
                                                            'bg-bg-base text-text-muted'
                                                }`}>
                                                {isChampion ? '👑' : currentRank}
                                            </div>
                                            {rankChangeIcon}
                                        </div>
                                    </td>
                                    <td className={`${rowClass} font-medium`}>
                                        <span className={`block ${isPlayoff ? 'text-emerald-400' : isSecondaryPlayoff ? 'text-amber-400' : isRelegation ? 'text-rose-400' : 'text-text-main'}`}>{team.name}</span>
                                    </td>
                                    <td className={`${rowClass} text-center text-text-muted`}>{team.played}</td>
                                    <td className={`${rowClass} text-center text-emerald-400 font-medium`}>{team.wins}</td>
                                    <td className={`${rowClass} text-center text-rose-400 font-medium`}>{losses}</td>
                                    <td className={`${rowClass} text-center font-bold text-amber-300 bg-bg-base/30`}>
                                        {team.points}
                                        {pointDiffIcon}
                                    </td>
                                    <td className={`${rowClass} text-center text-text-muted hidden sm:table-cell`}>{team.setsWon}</td>
                                    <td className={`${rowClass} text-center text-text-muted hidden sm:table-cell`}>{team.setsLost}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
