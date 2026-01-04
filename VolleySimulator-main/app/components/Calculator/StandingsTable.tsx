import { memo } from "react";
import Link from "next/link";
import { TeamStats } from "../../types";
import { TeamDiff } from "../../utils/scenarioUtils";
import { generateTeamSlug } from "../../utils/teamSlug";
import TeamAvatar from "../TeamAvatar";
import { Card, CardHeader, CardTitle } from "../ui/Card";
import { StandingsTableSkeleton } from "../ui/Skeleton";
import { Badge } from "../ui/Badge";
import { cn } from "@/lib/utils";

interface StandingsTableProps {
    teams: TeamStats[];
    playoffSpots?: number;
    secondaryPlayoffSpots?: number; // For 5-8 playoff zone (VSL)
    relegationSpots?: number;
    initialRanks?: Map<string, number>; // For showing rank changes
    compact?: boolean;
    loading?: boolean;
    comparisonDiffs?: TeamDiff[];
    recentForm?: Map<string, ('W' | 'L')[]>; // Last 5 match results per team
}

function StandingsTable({
    teams,
    playoffSpots = 2,
    secondaryPlayoffSpots = 0,
    relegationSpots = 2,
    initialRanks,
    compact = false,
    loading = false,
    comparisonDiffs,
    recentForm
}: StandingsTableProps) {
    if (loading) {
        return <StandingsTableSkeleton />;
    }

    const headClass = "px-2 py-3 text-[10px] sm:text-xs uppercase tracking-wider font-bold text-text-secondary border-b border-border-main bg-surface-secondary sticky top-0 z-20";
    const cellClass = "px-2 py-3 text-xs sm:text-sm border-b border-border-subtle transition-colors";

    return (
        <Card className={cn("flex flex-col h-full overflow-hidden", compact && "shadow-none border-none bg-transparent")}>
            {!compact && (
                <CardHeader className="bg-surface-secondary/50 py-3 border-b border-border-main">
                    <CardTitle className="text-base flex items-center gap-2">
                        <span className="text-lg">📊</span> Puan Durumu
                    </CardTitle>
                </CardHeader>
            )}

            {!compact && (
                <div className="px-4 py-2 bg-surface-secondary/30 border-b border-border-main flex gap-3 text-[10px] flex-wrap">
                    <div className="flex items-center gap-1.5">
                        <Badge variant="success" className="w-2 h-2 p-0 rounded-full" />
                        <span className="text-text-secondary">Play-off (İlk {playoffSpots})</span>
                    </div>
                    {secondaryPlayoffSpots > 0 && (
                        <div className="flex items-center gap-1.5">
                            <Badge variant="warning" className="w-2 h-2 p-0 rounded-full" />
                            <span className="text-text-secondary">{playoffSpots + 1}-{playoffSpots + secondaryPlayoffSpots} Bölgesi</span>
                        </div>
                    )}
                    <div className="flex items-center gap-1.5">
                        <Badge variant="destructive" className="w-2 h-2 p-0 rounded-full" />
                        <span className="text-text-secondary">Küme Düşme</span>
                    </div>
                </div>
            )}

            <div className="overflow-x-auto flex-1 custom-scrollbar relative">
                <table className="w-full text-left border-separate border-spacing-0">
                    <thead>
                        <tr>
                            <th scope="col" className={cn(headClass, "sticky left-0 z-30 w-12 text-center pl-4")} aria-label="Sıralama">#</th>
                            <th scope="col" className={cn(headClass, "sticky left-12 z-30 min-w-[140px]")}>Takım</th>
                            <th scope="col" className={cn(headClass, "w-10 text-center")} title="Oynanan Maç" aria-label="Oynanan Maç">OM</th>
                            <th scope="col" className={cn(headClass, "w-10 text-center text-emerald-500")} title="Galibiyet" aria-label="Galibiyet">G</th>
                            <th scope="col" className={cn(headClass, "w-10 text-center text-rose-500")} title="Mağlubiyet" aria-label="Mağlubiyet">M</th>
                            <th scope="col" className={cn(headClass, "w-12 text-center text-amber-500 font-bold")} title="Puan" aria-label="Puan">P</th>
                            <th scope="col" className={cn(headClass, "w-10 text-center hidden md:table-cell")} title="Alınan Set" aria-label="Alınan Set">AS</th>
                            <th scope="col" className={cn(headClass, "w-10 text-center hidden md:table-cell")} title="Verilen Set" aria-label="Verilen Set">VS</th>
                            {recentForm && (
                                <th scope="col" className={cn(headClass, "w-20 text-center hidden sm:table-cell")} title="Son 5 Maç" aria-label="Son 5 Maç">FORM</th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {teams.map((team, idx) => {
                            const currentRank = idx + 1;
                            const isChampion = idx === 0;
                            const isPlayoff = idx < playoffSpots;
                            const isSecondaryPlayoff = secondaryPlayoffSpots > 0 && idx >= playoffSpots && idx < playoffSpots + secondaryPlayoffSpots;
                            const isRelegation = idx >= teams.length - relegationSpots;
                            const losses = team.played - team.wins;

                            let rankChangeIcon = null;
                            let pointDiffIcon = null;

                            if (comparisonDiffs) {
                                const diff = comparisonDiffs.find(d => d.name === team.name);
                                if (diff) {
                                    if (diff.rankDiff > 0) rankChangeIcon = <span className="text-emerald-500 text-[10px] ml-1">▲{diff.rankDiff}</span>;
                                    else if (diff.rankDiff < 0) rankChangeIcon = <span className="text-rose-500 text-[10px] ml-1">▼{Math.abs(diff.rankDiff)}</span>;

                                    if (diff.pointDiff > 0) pointDiffIcon = <span className="text-emerald-500 text-[10px] ml-0.5">+{diff.pointDiff}</span>;
                                    else if (diff.pointDiff < 0) pointDiffIcon = <span className="text-rose-500 text-[10px] ml-0.5">{diff.pointDiff}</span>;
                                }
                            } else if (initialRanks && initialRanks.has(team.name)) {
                                const oldRank = initialRanks.get(team.name)!;
                                const diff = oldRank - currentRank;
                                if (diff > 0) rankChangeIcon = <span className="text-emerald-500 text-[10px] ml-1">▲{diff}</span>;
                                else if (diff < 0) rankChangeIcon = <span className="text-rose-500 text-[10px] ml-1">▼{Math.abs(diff)}</span>;
                            }

                            const zoneBg = isChampion ? 'bg-amber-500/5 hover:bg-amber-500/10' :
                                isPlayoff ? 'bg-emerald-500/5 hover:bg-emerald-500/10' :
                                    isSecondaryPlayoff ? 'bg-amber-500/5 hover:bg-amber-500/10' :
                                        isRelegation ? 'bg-rose-500/5 hover:bg-rose-500/10' :
                                            'hover:bg-surface-secondary/50';

                            return (
                                <tr
                                    key={team.name}
                                    className={cn("group group/row transition-colors", zoneBg)}
                                    aria-label={`${currentRank}. sırada olan ${team.name}, ${team.points} puan`}
                                >
                                    <td className={cn(cellClass, "sticky left-0 z-10 text-center font-mono pl-4",
                                        isChampion ? 'bg-amber-50 dark:bg-amber-900/20' :
                                            isPlayoff ? 'bg-emerald-50 dark:bg-emerald-900/20' :
                                                isSecondaryPlayoff ? 'bg-amber-50/50 dark:bg-amber-900/10' :
                                                    isRelegation ? 'bg-rose-50 dark:bg-rose-900/20' :
                                                        'bg-surface-primary group-hover/row:bg-surface-secondary/50'
                                    )}>
                                        <div className="flex items-center justify-center gap-0.5">
                                            <span className={cn(
                                                "w-6 h-6 flex items-center justify-center rounded-full text-[11px] font-bold shadow-sm",
                                                isChampion ? 'bg-amber-500 text-white' :
                                                    isPlayoff ? 'bg-emerald-500 text-white' :
                                                        isSecondaryPlayoff ? 'bg-amber-500 text-white' :
                                                            isRelegation ? 'bg-rose-500 text-white' :
                                                                'bg-surface-secondary text-text-secondary'
                                            )}>
                                                {isChampion ? '1' : currentRank}
                                            </span>
                                            {rankChangeIcon}
                                        </div>
                                    </td>
                                    <td className={cn(cellClass, "sticky left-12 z-10 font-semibold",
                                        isChampion ? 'bg-amber-50 dark:bg-amber-900/20' :
                                            isPlayoff ? 'bg-emerald-50 dark:bg-emerald-900/20' :
                                                isSecondaryPlayoff ? 'bg-amber-50/50 dark:bg-amber-900/10' :
                                                    isRelegation ? 'bg-rose-50 dark:bg-rose-900/20' :
                                                        'bg-surface-primary group-hover/row:bg-surface-secondary/50'
                                    )}>
                                        <Link href={`/takimlar/${generateTeamSlug(team.name)}`} className="flex items-center gap-2 group/link">
                                            <TeamAvatar name={team.name} size="sm" />
                                            <span className={cn(
                                                "truncate max-w-[120px] sm:max-w-none group-hover/link:underline",
                                                isPlayoff ? 'text-emerald-700 dark:text-emerald-400' :
                                                    isSecondaryPlayoff ? 'text-amber-700 dark:text-amber-400' :
                                                        isRelegation ? 'text-rose-700 dark:text-rose-400' :
                                                            'text-text-primary'
                                            )}>
                                                {team.name}
                                            </span>
                                        </Link>
                                    </td>
                                    <td className={cn(cellClass, "text-center text-text-secondary")}>{team.played}</td>
                                    <td className={cn(cellClass, "text-center text-emerald-600 dark:text-emerald-400 font-medium")}>{team.wins}</td>
                                    <td className={cn(cellClass, "text-center text-rose-600 dark:text-rose-400 font-medium")}>{losses}</td>
                                    <td className={cn(cellClass, "text-center font-bold text-amber-600 dark:text-amber-400 bg-surface-secondary/20")}>
                                        {team.points}
                                        {pointDiffIcon}
                                    </td>
                                    <td className={cn(cellClass, "text-center text-text-secondary hidden md:table-cell")}>{team.setsWon}</td>
                                    <td className={cn(cellClass, "text-center text-text-secondary hidden md:table-cell")}>{team.setsLost}</td>
                                    {recentForm && (
                                        <td className={cn(cellClass, "text-center hidden sm:table-cell")}>
                                            <div className="flex items-center justify-center gap-1">
                                                {(recentForm.get(team.name) || []).slice(-5).map((result, i) => (
                                                    <span
                                                        key={i}
                                                        className={cn(
                                                            "w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white",
                                                            result === 'W' ? 'bg-emerald-500' : 'bg-rose-500'
                                                        )}
                                                        title={result === 'W' ? 'Galibiyet' : 'Mağlubiyet'}
                                                    >
                                                        {result}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </Card>
    );
}

export default memo(StandingsTable);
