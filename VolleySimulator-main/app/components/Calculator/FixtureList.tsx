import { useState, memo, useMemo } from "react";
import Link from "next/link";
import { Match } from "../../types";
import { SCORES, normalizeTeamName } from "../../utils/calculatorUtils";
import { generateTeamSlug } from "../../utils/teamSlug";
import TeamAvatar from "../TeamAvatar";
import { Card, CardHeader, CardTitle } from "../ui/Card";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { EmptyState } from "../ui/EmptyState";
import { BottomSheet } from "../ui/BottomSheet";
import { TeamStatsRadar } from "./TeamStatsRadar";
import { cn } from "@/lib/utils";
import { Calendar, ChevronRight, Zap, Trophy, History, Search, Edit2, BarChart2 } from "lucide-react";

interface FixtureListProps {
    matches: Match[];
    overrides: Record<string, string>;
    onScoreChange: (matchId: string, score: string) => void;
    teamRanks?: Map<string, number>;
    totalTeams?: number;
    relegationSpots?: number;
}

function FixtureList({ matches, overrides, onScoreChange, teamRanks, totalTeams = 16, relegationSpots = 2 }: FixtureListProps) {
    const [view, setView] = useState<'upcoming' | 'all' | 'past'>('upcoming');
    const [quickPredictMode, setQuickPredictMode] = useState(false);
    const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
    const [selectedMatchForPredict, setSelectedMatchForPredict] = useState<Match | null>(null);
    const [predictTab, setPredictTab] = useState<'predict' | 'stats'>('predict');

    const toggleGroupCollapse = (groupName: string) => {
        setCollapsedGroups(prev => {
            const newSet = new Set(prev);
            if (newSet.has(groupName)) newSet.delete(groupName);
            else newSet.add(groupName);
            return newSet;
        });
    };

    const isMatchPlayed = (m: Match) => {
        return m.isPlayed || (m.homeScore !== undefined && m.homeScore !== null && m.awayScore !== undefined && m.awayScore !== null);
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

    const getMatchImportance = (homeRank: number | null, awayRank: number | null): { label: string; variant: "success" | "warning" | "destructive" | "secondary" | "default" } | null => {
        if (!homeRank || !awayRank || relegationSpots === 0) return null;
        const playoffBoundary = 4;
        const relegationBoundary = totalTeams - relegationSpots + 1;

        if (homeRank <= playoffBoundary && awayRank <= playoffBoundary) return { label: 'Zirve Mücadelesi', variant: 'success' };
        if (homeRank >= relegationBoundary && awayRank >= relegationBoundary) return { label: 'Kritik Düşme Hattı', variant: 'destructive' };
        if (homeRank >= relegationBoundary || awayRank >= relegationBoundary) return { label: 'Düşme Potası Etkisi', variant: 'warning' };
        if (homeRank <= playoffBoundary || awayRank <= playoffBoundary) return { label: 'Play-off Yolunda', variant: 'secondary' };
        return null;
    };

    const parseDate = (dateStr: string | undefined): Date | null => {
        if (!dateStr) return null;
        if (dateStr.includes('.')) {
            const parts = dateStr.split('.');
            if (parts.length === 3) return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        }
        if (dateStr.includes('-')) {
            const parts = dateStr.split('-');
            if (parts.length === 3) return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        }
        return null;
    };

    const filteredMatches = useMemo(() => {
        if (view === 'upcoming') return matches.filter(m => !isMatchPlayed(m));
        if (view === 'past') return matches.filter(m => isMatchPlayed(m));
        return matches;
    }, [matches, view]);

    const groupedMatches = useMemo(() => {
        const groups: Record<string, Match[]> = {};
        filteredMatches.forEach(match => {
            const dateStr = match.matchDate || (match as any).date || 'Belirsiz Tarih';
            if (!groups[dateStr]) groups[dateStr] = [];
            groups[dateStr].push(match);
        });
        return groups;
    }, [filteredMatches]);

    const sortedGroups = useMemo(() => {
        return Object.entries(groupedMatches).sort((a, b) => {
            const dateA = parseDate(a[0]);
            const dateB = parseDate(b[0]);
            if (!dateA || !dateB) return 0;
            return view === 'past' ? dateB.getTime() - dateA.getTime() : dateA.getTime() - dateB.getTime();
        });
    }, [groupedMatches, view]);

    const formatDateDisplay = (dateStr: string): string => {
        if (dateStr === 'Belirsiz Tarih') return dateStr;
        const date = parseDate(dateStr);
        if (!date) return dateStr;
        const days = ['PAZAR', 'PAZARTESİ', 'SALI', 'ÇARŞAMBA', 'PERŞEMBE', 'CUMA', 'CUMARTESİ'];
        return `${date.toLocaleDateString('tr-TR')} ${days[date.getDay()]}`;
    };

    return (
        <Card className="flex flex-col h-full bg-surface-primary/50 backdrop-blur-sm border-border-main/50">
            <CardHeader className="p-2 sm:p-4 bg-surface-secondary/30 border-b border-border-main">
                <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <div className="flex gap-1 bg-surface-primary p-1 rounded-xl">
                            <Button
                                variant={view === 'upcoming' ? 'primary' : 'ghost'}
                                size="sm"
                                className="rounded-lg text-[11px] h-8 px-3"
                                onClick={() => setView('upcoming')}
                            >
                                <Calendar className="w-3.5 h-3.5 mr-1.5" />
                                Gelecek
                            </Button>
                            <Button
                                variant={view === 'past' ? 'secondary' : 'ghost'}
                                size="sm"
                                className="rounded-lg text-[11px] h-8 px-3"
                                onClick={() => setView('past')}
                            >
                                <History className="w-3.5 h-3.5 mr-1.5" />
                                Geçmiş
                            </Button>
                            <Button
                                variant={view === 'all' ? 'outline' : 'ghost'}
                                size="sm"
                                className="rounded-lg text-[11px] h-8 px-3"
                                onClick={() => setView('all')}
                            >
                                Hepsi
                            </Button>
                        </div>

                        <Button
                            variant={quickPredictMode ? 'primary' : 'outline'}
                            size="sm"
                            className={cn("rounded-lg text-[11px] h-8 shadow-premium-sm transition-all")}
                            onClick={() => setQuickPredictMode(!quickPredictMode)}
                        >
                            <Zap className={cn("w-3.5 h-3.5 mr-1.5", quickPredictMode && "fill-current")} />
                            Hızlı Tahmin
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <div className="flex-1 overflow-y-auto p-3 space-y-6 custom-scrollbar">
                {sortedGroups.length === 0 ? (
                    <EmptyState
                        title="Maç Bulunamadı"
                        description={`${view === 'upcoming' ? 'Gelecek' : view === 'past' ? 'Geçmiş' : ''} maç listesi boş görünüyor. Lütfen daha sonra tekrar kontrol edin.`}
                        icon={Search}
                        className="min-h-[300px] border-none bg-transparent"
                    />
                ) : (
                    sortedGroups.map(([dateStr, dateMatches]) => {
                        const isCollapsed = collapsedGroups.has(dateStr);
                        return (
                            <div key={dateStr} className="space-y-3">
                                <button
                                    onClick={() => toggleGroupCollapse(dateStr)}
                                    className="w-full flex items-center justify-between group py-1 border-b border-border-subtle hover:border-text-muted transition-colors"
                                >
                                    <h3 className="text-[11px] font-bold text-text-secondary uppercase tracking-widest flex items-center gap-2">
                                        <ChevronRight className={cn("w-3.5 h-3.5 transition-transform duration-300", !isCollapsed && "rotate-90")} />
                                        {formatDateDisplay(dateStr)}
                                    </h3>
                                    <Badge variant="secondary" className="px-2 py-0 h-5 text-[9px] font-bold">
                                        {dateMatches.length} Maç
                                    </Badge>
                                </button>

                                {!isCollapsed && (
                                    <div className="grid grid-cols-1 gap-3">
                                        {dateMatches.map((match) => {
                                            const matchId = `${match.homeTeam}-${match.awayTeam}`;
                                            const currentScore = overrides[matchId];
                                            const isPlayed = isMatchPlayed(match);
                                            const homeRank = getTeamRank(match.homeTeam);
                                            const awayRank = getTeamRank(match.awayTeam);
                                            const importance = getMatchImportance(homeRank, awayRank);
                                            const matchTime = match.matchTime || (match as any).time;

                                            return (
                                                <Card
                                                    key={matchId}
                                                    onClick={() => !isPlayed && setSelectedMatchForPredict(match)}
                                                    className={cn(
                                                        "relative overflow-hidden group/m transition-all duration-300 p-0 shadow-sm cursor-pointer sm:cursor-default",
                                                        !isPlayed && currentScore ? "ring-1 ring-primary/50 bg-primary/5" : "hover:shadow-md"
                                                    )}
                                                >
                                                    {importance && !isPlayed && (
                                                        <div className={cn(
                                                            "w-full text-[9px] font-bold py-0.5 text-center uppercase tracking-tighter bg-gradient-to-r",
                                                            importance.variant === 'success' ? 'from-emerald-600 to-emerald-400 text-white' :
                                                                importance.variant === 'destructive' ? 'from-rose-600 to-rose-400 text-white' :
                                                                    importance.variant === 'warning' ? 'from-amber-600 to-amber-400 text-white' :
                                                                        'from-slate-600 to-slate-400 text-white'
                                                        )}>
                                                            {importance.label}
                                                        </div>
                                                    )}

                                                    <div className="p-3 pt-4 sm:p-4">
                                                        <div className="flex justify-between items-center mb-4">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[10px] bg-surface-secondary px-2 py-0.5 rounded-full font-mono text-text-muted border border-border-subtle">
                                                                    {matchTime || '--:--'}
                                                                </span>
                                                                {isPlayed && <Badge variant="secondary" className="text-[9px] h-5">Oynandı</Badge>}
                                                                {!isPlayed && (
                                                                    <div className="sm:hidden text-[10px] text-primary flex items-center gap-1 font-bold">
                                                                        <Edit2 className="w-3 h-3" />
                                                                        TAHMİN YAP
                                                                    </div>
                                                                )}
                                                            </div>
                                                            {!isPlayed && currentScore && (
                                                                <Badge variant="success" className="text-[9px] h-5">Tahmin Girildi</Badge>
                                                            )}
                                                        </div>

                                                        <div className="flex items-center justify-between gap-2 mb-6">
                                                            <TeamInfo
                                                                name={match.homeTeam}
                                                                rank={homeRank}
                                                                align="end"
                                                                winner={isPlayed ? match.homeScore! > match.awayScore! : currentScore ? getScoreWinner(currentScore) === 'home' : false}
                                                            />
                                                            <div className="flex flex-col items-center justify-center px-4">
                                                                <span className="text-xs text-text-secondary font-bold opacity-30 italic">VS</span>
                                                                {isPlayed && (
                                                                    <div className="mt-2 text-xl font-black font-mono tracking-tighter">
                                                                        {match.homeScore}-{match.awayScore}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <TeamInfo
                                                                name={match.awayTeam}
                                                                rank={awayRank}
                                                                align="start"
                                                                winner={isPlayed ? match.awayScore! > match.homeScore! : currentScore ? getScoreWinner(currentScore) === 'away' : false}
                                                            />
                                                        </div>

                                                        {/* Prediction Area - Hidden on small screens unless QuickPredict is ON */}
                                                        {!isPlayed && (
                                                            <div className={cn(
                                                                "hidden sm:flex overflow-x-auto gap-1.5 pb-1 custom-scrollbar",
                                                                quickPredictMode ? "grid grid-cols-4 sm:flex sm:justify-center" : "justify-center"
                                                            )}>
                                                                {SCORES.map(score => {
                                                                    const isSelected = currentScore === score;
                                                                    const [h, a] = score.split('-').map(Number);
                                                                    const isHomeWin = h > a;
                                                                    return (
                                                                        <button
                                                                            key={score}
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                onScoreChange(matchId, isSelected ? '' : score);
                                                                                if (isSelected) navigator.vibrate?.(10);
                                                                                else navigator.vibrate?.(50);
                                                                            }}
                                                                            className={cn(
                                                                                "h-8 min-w-[36px] flex items-center justify-center rounded-lg text-[10px] font-black transition-all border shrink-0",
                                                                                isSelected
                                                                                    ? isHomeWin
                                                                                        ? "bg-emerald-600 border-emerald-500 text-white shadow-lg scale-105 z-10"
                                                                                        : "bg-rose-600 border-rose-500 text-white shadow-lg scale-105 z-10"
                                                                                    : "bg-surface-secondary/50 border-border-subtle text-text-muted hover:border-text-secondary hover:bg-surface-secondary"
                                                                            )}
                                                                        >
                                                                            {score}
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                        )}
                                                    </div>
                                                </Card>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {/* Mobile Prediction Bottom Sheet */}
            <BottomSheet
                isOpen={!!selectedMatchForPredict}
                onClose={() => {
                    setSelectedMatchForPredict(null);
                    setPredictTab('predict');
                }}
                title={predictTab === 'predict' ? "Tahmin Gir" : "Takım Analizi"}
            >
                {selectedMatchForPredict && (
                    <div className="space-y-6">
                        {/* Tab Switcher */}
                        <div className="flex p-1 bg-surface-secondary rounded-xl">
                            <button
                                onClick={() => setPredictTab('predict')}
                                className={cn(
                                    "flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                                    predictTab === 'predict'
                                        ? "bg-surface-primary text-primary shadow-premium-sm"
                                        : "text-text-muted hover:text-text-primary"
                                )}
                            >
                                <Zap className={cn("w-3.5 h-3.5", predictTab === 'predict' && "fill-primary")} />
                                Tahmin
                            </button>
                            <button
                                onClick={() => setPredictTab('stats')}
                                className={cn(
                                    "flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                                    predictTab === 'stats'
                                        ? "bg-surface-primary text-primary shadow-premium-sm"
                                        : "text-text-muted hover:text-text-primary"
                                )}
                            >
                                <BarChart2 className="w-3.5 h-3.5" />
                                İstatistik
                            </button>
                        </div>

                        {predictTab === 'predict' ? (
                            <>
                                <div className="flex items-center justify-between gap-4 p-4 bg-surface-secondary/50 rounded-2xl">
                                    <div className="flex flex-col items-center gap-2 flex-1">
                                        <TeamAvatar name={selectedMatchForPredict.homeTeam} size="md" />
                                        <span className="text-xs font-black text-center">{selectedMatchForPredict.homeTeam}</span>
                                    </div>
                                    <div className="text-xl font-black italic opacity-20">VS</div>
                                    <div className="flex flex-col items-center gap-2 flex-1">
                                        <TeamAvatar name={selectedMatchForPredict.awayTeam} size="md" />
                                        <span className="text-xs font-black text-center">{selectedMatchForPredict.awayTeam}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-4 gap-2">
                                    {SCORES.map(score => {
                                        const matchId = `${selectedMatchForPredict.homeTeam}-${selectedMatchForPredict.awayTeam}`;
                                        const isSelected = overrides[matchId] === score;
                                        const [h, a] = score.split('-').map(Number);
                                        const isHomeWin = h > a;

                                        return (
                                            <button
                                                key={score}
                                                onClick={() => {
                                                    onScoreChange(matchId, isSelected ? '' : score);
                                                    navigator.vibrate?.(isSelected ? 10 : 50);
                                                    if (!isSelected) {
                                                        // Small delay for UX feel then close
                                                        setTimeout(() => {
                                                            setSelectedMatchForPredict(null);
                                                            setPredictTab('predict');
                                                        }, 150);
                                                    }
                                                }}
                                                className={cn(
                                                    "h-12 flex flex-col items-center justify-center rounded-xl text-xs font-black transition-all border",
                                                    isSelected
                                                        ? isHomeWin
                                                            ? "bg-emerald-600 border-emerald-500 text-white shadow-glow-primary scale-105"
                                                            : "bg-rose-600 border-rose-500 text-white shadow-lg scale-105"
                                                        : "bg-surface-secondary border-border-subtle text-text-primary hocus:bg-surface-dark"
                                                )}
                                            >
                                                {score}
                                            </button>
                                        );
                                    })}
                                </div>
                            </>
                        ) : (
                            <div className="py-2">
                                <TeamStatsRadar
                                    homeTeam={selectedMatchForPredict.homeTeam}
                                    awayTeam={selectedMatchForPredict.awayTeam}
                                />
                                <p className="mt-4 text-[10px] text-text-muted text-center italic leading-relaxed">
                                    * İstatistikler son 5 maçlık form ve genel sezon verilerine dayalı tahmini değerlerdir.
                                </p>
                            </div>
                        )}

                        <Button
                            variant="ghost"
                            className="w-full h-12 rounded-xl text-text-muted"
                            onClick={() => {
                                setSelectedMatchForPredict(null);
                                setPredictTab('predict');
                            }}
                        >
                            İptal
                        </Button>
                    </div>
                )}
            </BottomSheet>
        </Card>
    );
}

const TeamInfo = ({ name, rank, align, winner }: { name: string; rank: number | null; align: 'start' | 'end'; winner?: boolean }) => (
    <div className={cn("flex flex-1 items-center gap-3", align === 'end' ? 'flex-row' : 'flex-row-reverse')}>
        <div className={cn("flex flex-col min-w-0", align === 'end' ? 'items-end' : 'items-start')}>
            <div className="flex items-center gap-1.5 overflow-hidden">
                {align === 'start' && rank && <RankBadge rank={rank} />}
                <Link
                    href={`/takimlar/${generateTeamSlug(name)}`}
                    className={cn(
                        "text-xs sm:text-sm font-black truncate hover:underline",
                        winner ? "text-text-primary" : "text-text-secondary opacity-70"
                    )}
                >
                    {name}
                </Link>
                {align === 'end' && rank && <RankBadge rank={rank} />}
            </div>
            {winner && (
                <Badge variant="success" className="h-4 px-1 py-0 text-[8px] font-black uppercase mt-0.5">Kazanır</Badge>
            )}
        </div>
        <div className={cn(
            "relative shrink-0 p-1 rounded-full",
            winner ? "bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-md ring-2 ring-emerald-500/20" : "bg-surface-secondary border border-border-subtle"
        )}>
            <TeamAvatar name={name} size="sm" />
        </div>
    </div>
);

const RankBadge = ({ rank }: { rank: number }) => (
    <span className={cn(
        "text-[9px] px-1.5 py-0.5 rounded font-black shrink-0",
        rank <= 2 ? "bg-emerald-500/20 text-emerald-400" :
            rank <= 4 ? "bg-primary/20 text-primary" :
                rank >= 13 ? "bg-rose-500/20 text-rose-400" :
                    "bg-surface-secondary text-text-muted"
    )}>
        {rank}.
    </span>
);

function getScoreWinner(score: string) {
    const [h, a] = score.split('-').map(Number);
    if (h > a) return 'home';
    if (a > h) return 'away';
    return null;
}

export default memo(FixtureList);
