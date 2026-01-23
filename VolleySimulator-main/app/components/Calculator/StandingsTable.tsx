import { TeamStats } from "@/app/types";
import TeamAvatar from "../TeamAvatar";
import { useLanguage } from "../../context/LanguageContext";

interface TeamDiff {
    name: string;
    rankDiff: number;
    pointDiff: number;
}

interface StandingsTableProps {
    teams: TeamStats[];
    playoffSpots?: number;
    secondaryPlayoffSpots?: number;
    relegationSpots?: number;
    initialRanks?: Map<string, number>;
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
    const { t } = useLanguage();

    const rowClass = compact ? "px-2 py-4 text-xs sm:text-sm" : "px-4 py-3 text-sm sm:text-base";
    const headClass = compact ? "px-2 py-2 text-[11px] uppercase" : "px-4 py-3 text-xs uppercase sm:text-sm";
    const rankSize = compact ? "w-6 h-6 text-[11px]" : "w-8 h-8 text-sm";

    if (loading) {
        return (
            <div className={`bg-surface border border-border-main rounded-lg overflow-hidden shadow-sm h-full p-4 space-y-4`}>
                <div className="h-6 bg-surface-secondary rounded w-1/3 animate-pulse"></div>
                <div className="space-y-2">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="h-8 bg-surface-secondary/50 rounded animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-surface border border-border-main rounded-lg overflow-hidden shadow-sm flex flex-col h-full ${compact ? 'text-xs' : ''}`}>
            {!compact && (
                <div className="bg-surface-secondary px-4 py-3 border-b border-border-main">
                    <h3 className="font-bold text-foreground flex items-center gap-2">
                        <span>📊</span> {t('table.title')}
                    </h3>
                </div>
            )}

            {!compact && (
                <div className="px-4 py-2 bg-surface/50 border-b border-border-main flex gap-4 text-[10px] flex-wrap">
                    <div className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                        <span className="text-text-secondary">{t('table.playoff')} ({t('table.playoffDesc')} {playoffSpots})</span>
                    </div>
                    {secondaryPlayoffSpots > 0 && (
                        <div className="flex items-center gap-1">
                            <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                            <span className="text-text-secondary">5-8 {t('table.playoff')} ({playoffSpots + 1}-{playoffSpots + secondaryPlayoffSpots})</span>
                        </div>
                    )}
                    {relegationSpots > 0 && (
                        <div className="flex items-center gap-1">
                            <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                            <span className="text-text-secondary">{t('table.relegation')} ({t('table.relegationDesc')} {relegationSpots})</span>
                        </div>
                    )}
                </div>
            )}

            <div className="overflow-x-auto flex-1 custom-scrollbar pb-2">
                <table className={`w-full text-left ${compact ? 'text-xs' : 'text-xs sm:text-sm'}`}>
                    <thead className="bg-surface-secondary text-text-secondary tracking-wider font-semibold border-b border-border-main sticky top-0">
                        <tr>
                            <th scope="col" className={`${headClass} w-10 text-left pl-2 whitespace-nowrap`}>#</th>
                            <th scope="col" className={`${headClass} whitespace-nowrap`}>{t('table.team')}</th>
                            <th scope="col" className={`${headClass} w-6 text-center whitespace-nowrap`} title="Oynanan Maç">{t('table.played')}</th>
                            <th scope="col" className={`${headClass} w-6 text-center text-emerald-500 whitespace-nowrap`} title="Galibiyet">{t('table.won')}</th>
                            <th scope="col" className={`${headClass} w-6 text-center text-rose-500 whitespace-nowrap`} title="Mağlubiyet">{t('table.lost')}</th>
                            <th scope="col" className={`${headClass} w-8 text-center text-amber-500 font-bold whitespace-nowrap`} title="Puan">{t('table.points')}</th>
                            <th scope="col" className={`${headClass} w-6 text-center hidden sm:table-cell whitespace-nowrap`} title="Alınan Set">{t('table.setsWon')}</th>
                            <th scope="col" className={`${headClass} w-6 text-center hidden sm:table-cell whitespace-nowrap`} title="Verilen Set">{t('table.setsLost')}</th>
                            <th scope="col" className={`${headClass} w-8 text-center hidden md:table-cell whitespace-nowrap`} title="Alınan Sayı">{t('table.pointsWon')}</th>
                            <th scope="col" className={`${headClass} w-8 text-center hidden md:table-cell whitespace-nowrap`} title="Verilen Sayı">{t('table.pointsLost')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border-subtle">
                        {teams.map((team, idx) => {
                            const currentRank = idx + 1;
                            const isChampion = idx === 0;
                            const isPlayoff = idx < playoffSpots;
                            const isSecondaryPlayoff = secondaryPlayoffSpots > 0 && idx >= playoffSpots && idx < playoffSpots + secondaryPlayoffSpots;
                            const isRelegation = relegationSpots > 0 && idx >= teams.length - relegationSpots;
                            const losses = team.played - team.wins;

                            let rankChangeIcon = null;
                            let pointDiffIcon = null;

                            if (comparisonDiffs) {
                                const diff = comparisonDiffs.find(d => d.name === team.name);
                                if (diff) {
                                    if (diff.rankDiff > 0) rankChangeIcon = <span className="text-emerald-500 text-[10px] font-bold flex items-center gap-0.5">▲{diff.rankDiff}</span>;
                                    else if (diff.rankDiff < 0) rankChangeIcon = <span className="text-rose-500 text-[10px] font-bold flex items-center gap-0.5">▼{Math.abs(diff.rankDiff)}</span>;

                                    if (diff.pointDiff > 0) pointDiffIcon = <span className="text-emerald-500 text-[10px] ml-1">+{diff.pointDiff}</span>;
                                    else if (diff.pointDiff < 0) pointDiffIcon = <span className="text-rose-500 text-[10px] ml-1">{diff.pointDiff}</span>;
                                }
                            } else if (initialRanks && initialRanks.has(team.name)) {
                                const oldRank = initialRanks.get(team.name)!;
                                const diff = oldRank - currentRank;
                                if (diff > 0) {
                                    rankChangeIcon = <span className="text-emerald-500 text-[10px] font-bold flex items-center gap-0.5">▲{diff}</span>;
                                } else if (diff < 0) {
                                    rankChangeIcon = <span className="text-rose-500 text-[10px] font-bold flex items-center gap-0.5">▼{Math.abs(diff)}</span>;
                                }
                            }

                            return (
                                <tr key={team.name} className={`hover:bg-surface-secondary/50 transition-colors ${isChampion ? 'bg-amber-500/10 dark:bg-amber-900/20' : isPlayoff ? 'bg-emerald-500/10 dark:bg-emerald-900/20' : isSecondaryPlayoff ? 'bg-amber-500/5 dark:bg-amber-900/10' : isRelegation ? 'bg-rose-500/10 dark:bg-rose-900/20' : ''}`}>
                                    <td className={`${rowClass} text-center font-mono whitespace-nowrap`}>
                                        <div className="flex items-center justify-start gap-1 pl-1">
                                            <div className={`${rankSize} flex-shrink-0 flex items-center justify-center rounded-full font-bold ${isChampion ? 'bg-gradient-to-b from-amber-400 to-amber-600 text-white shadow-lg' :
                                                isPlayoff ? 'bg-emerald-500 text-white shadow-lg' :
                                                    isSecondaryPlayoff ? 'bg-amber-500 text-white shadow-lg' :
                                                        isRelegation ? 'bg-rose-500 text-white shadow-lg' :
                                                            'bg-surface-secondary text-text-secondary'
                                                }`}>
                                                {isChampion ? '👑' : currentRank}
                                            </div>
                                            {rankChangeIcon}
                                        </div>
                                    </td>
                                    <td className={`${rowClass} font-medium whitespace-nowrap`}>
                                        <div className="flex items-center gap-2">
                                            <TeamAvatar name={team.name} size={compact ? 'md' : 'lg'} priority={idx < 5} />
                                            <span className={`block truncate max-w-[120px] sm:max-w-[200px] ${isPlayoff ? 'text-emerald-600 dark:text-emerald-400' : isSecondaryPlayoff ? 'text-amber-600 dark:text-amber-400' : isRelegation ? 'text-rose-600 dark:text-rose-400' : 'text-text-primary'}`}>{team.name}</span>
                                        </div>
                                    </td>
                                    <td className={`${rowClass} text-center text-text-secondary whitespace-nowrap`}>{team.played}</td>
                                    <td className={`${rowClass} text-center text-emerald-500 font-medium whitespace-nowrap`}>{team.wins}</td>
                                    <td className={`${rowClass} text-center text-rose-500 font-medium whitespace-nowrap`}>{losses}</td>
                                    <td className={`${rowClass} text-center font-bold text-amber-500 bg-surface-secondary/30 whitespace-nowrap`}>
                                        {team.points}
                                        {pointDiffIcon}
                                    </td>
                                    <td className={`${rowClass} text-center text-text-secondary hidden sm:table-cell whitespace-nowrap`}>{team.setsWon}</td>
                                    <td className={`${rowClass} text-center text-text-secondary hidden sm:table-cell whitespace-nowrap`}>{team.setsLost}</td>
                                    <td className={`${rowClass} text-center text-text-secondary hidden md:table-cell whitespace-nowrap font-mono text-[10px]`}>{team.setPointsWon}</td>
                                    <td className={`${rowClass} text-center text-text-secondary hidden md:table-cell whitespace-nowrap font-mono text-[10px]`}>{team.setPointsLost}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
