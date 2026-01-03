"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import TeamAvatar from "../../components/TeamAvatar";
import { Match, TeamStats } from "../../types";

interface TeamProfileClientProps {
    teamSlug: string;
}

interface LeagueData {
    league: string;
    leagueName: string;
    shortName: string;
    group?: string;
    standings: TeamStats[];
    fixtures: Match[];
    color: string;
}

// Turkish character normalization
const normalizeTurkish = (str: string): string => {
    const map: Record<string, string> = {
        'ş': 's', 'Ş': 's', 'ğ': 'g', 'Ğ': 'g',
        'ü': 'u', 'Ü': 'u', 'ö': 'o', 'Ö': 'o',
        'ç': 'c', 'Ç': 'c', 'ı': 'i', 'İ': 'i',
    };
    return str.split('').map(char => map[char] || char).join('').toLowerCase();
};

// Strict match - only exact team, not sub-teams
const matchesTeamExact = (name1: string, name2: string): boolean => {
    const n1 = normalizeTurkish(name1).replace(/\s+/g, '');
    const n2 = normalizeTurkish(name2).replace(/\s+/g, '');
    return n1 === n2 || n1.includes(n2) || n2.includes(n1);
};

const LEAGUE_CONFIG: Record<string, { name: string; short: string; color: string }> = {
    'vsl': { name: 'Vodafone Sultanlar Ligi', short: 'VSL', color: 'rose' },
    '1lig': { name: 'Arabica Coffee House 1. Lig', short: '1. Lig', color: 'amber' },
    '2lig': { name: 'Kadınlar 2. Lig', short: '2. Lig', color: 'emerald' },
    'cev-cl': { name: 'CEV Şampiyonlar Ligi', short: 'CEV CL', color: 'blue' }
};

export default function TeamProfileClient({ teamSlug }: TeamProfileClientProps) {
    const [loading, setLoading] = useState(true);
    const [teamName, setTeamName] = useState<string>("");
    const [leagueData, setLeagueData] = useState<LeagueData[]>([]);

    useEffect(() => {
        const decoded = decodeURIComponent(teamSlug)
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
        setTeamName(decoded);
    }, [teamSlug]);

    useEffect(() => {
        async function fetchData() {
            if (!teamName) return;
            setLoading(true);

            try {
                const leagues = ['vsl', '1lig', '2lig', 'cev-cl'];
                const results: LeagueData[] = [];

                for (const league of leagues) {
                    try {
                        const res = await fetch(`/api/${league}`);
                        if (!res.ok) continue;
                        const data = await res.json();

                        const hasTeam = data.teams?.some((team: TeamStats) =>
                            matchesTeamExact(team.name, teamName)
                        );

                        if (hasTeam || data.fixture?.some((m: Match) =>
                            matchesTeamExact(m.homeTeam || '', teamName) ||
                            matchesTeamExact(m.awayTeam || '', teamName)
                        )) {
                            const config = LEAGUE_CONFIG[league];
                            results.push({
                                league,
                                leagueName: config.name,
                                shortName: config.short,
                                color: config.color,
                                standings: data.teams || [],
                                fixtures: data.fixture || [],
                            });
                        }
                    } catch { /* Skip */ }
                }

                setLeagueData(results);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [teamName]);

    // Get primary league stats
    const primaryLeague = leagueData[0];
    const teamStats = primaryLeague?.standings.find(t => matchesTeamExact(t.name, teamName));
    const actualTeamName = teamStats?.name || teamName;

    // Group matches by league
    const getMatchesByLeague = (played: boolean) => {
        return leagueData.map(ld => {
            const matches = ld.fixtures
                .filter(m =>
                    matchesTeamExact(m.homeTeam || '', teamName) ||
                    matchesTeamExact(m.awayTeam || '', teamName)
                )
                .filter(m => played
                    ? (m.homeScore !== undefined && m.awayScore !== undefined)
                    : (m.homeScore === undefined || m.awayScore === undefined)
                )
                .slice(played ? -3 : 0, played ? undefined : 3);

            return { ...ld, matches };
        }).filter(ld => ld.matches.length > 0);
    };

    const pastByLeague = getMatchesByLeague(true);
    const upcomingByLeague = getMatchesByLeague(false);

    if (loading) {
        return (
            <main className="min-h-screen bg-slate-950 pt-16 pb-20">
                <div className="max-w-3xl mx-auto px-3 py-6">
                    <div className="animate-pulse space-y-4">
                        <div className="h-24 bg-slate-900 rounded-2xl"></div>
                        <div className="h-16 bg-slate-900 rounded-xl"></div>
                        <div className="h-32 bg-slate-900 rounded-xl"></div>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-slate-950 pt-16 pb-20">
            <div className="max-w-3xl mx-auto px-3 py-4 space-y-3">

                {/* Compact Hero */}
                <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 rounded-2xl p-4">
                    <div className="flex items-center gap-4">
                        <div className="relative shrink-0">
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/30 to-cyan-500/30 blur-lg rounded-full"></div>
                            <TeamAvatar name={actualTeamName} size="lg" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h1 className="text-xl font-black text-white truncate mb-1">
                                {actualTeamName}
                            </h1>
                            <div className="flex flex-wrap gap-1.5">
                                {leagueData.map(ld => (
                                    <span
                                        key={ld.league}
                                        className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full
                                            bg-${ld.color}-500/20 text-${ld.color}-400 border border-${ld.color}-500/30`}
                                    >
                                        {ld.shortName}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <Link
                            href="/ligler"
                            className="text-slate-500 hover:text-white text-xs shrink-0"
                        >
                            ✕
                        </Link>
                    </div>
                </div>

                {/* Stats Row */}
                {teamStats && (
                    <div className="grid grid-cols-4 gap-2">
                        <StatBox value={teamStats.points} label="Puan" color="amber" />
                        <StatBox value={teamStats.wins} label="Galibiyet" color="emerald" />
                        <StatBox value={teamStats.played - teamStats.wins} label="Mağlubiyet" color="rose" />
                        <StatBox value={`${teamStats.setsWon}/${teamStats.setsLost}`} label="Set" color="cyan" />
                    </div>
                )}

                {/* Standing Position */}
                {primaryLeague && teamStats && (
                    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-lg">🏆</span>
                                <span className="text-sm text-slate-400">{primaryLeague.leagueName}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                {(() => {
                                    const rank = primaryLeague.standings.findIndex(t =>
                                        matchesTeamExact(t.name, teamName)
                                    ) + 1;
                                    return (
                                        <span className={`text-lg font-black ${rank === 1 ? 'text-amber-400' :
                                            rank <= 4 ? 'text-emerald-400' :
                                                'text-slate-400'
                                            }`}>
                                            {rank}. sıra
                                        </span>
                                    );
                                })()}
                                <Link
                                    href={`/${primaryLeague.league}/tahminoyunu`}
                                    className="text-xs text-emerald-400 hover:underline"
                                >
                                    Görüntüle →
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                {/* Past Matches - Grouped by League */}
                {pastByLeague.length > 0 && (
                    <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
                        <div className="px-3 py-2 border-b border-slate-800 flex items-center gap-2">
                            <span>📅</span>
                            <span className="text-sm font-bold text-white">Son Maçlar</span>
                        </div>
                        <div className="divide-y divide-slate-800/50">
                            {pastByLeague.map(ld => (
                                <div key={ld.league}>
                                    <div className={`px-3 py-1.5 bg-${ld.color}-500/10 border-l-2 border-${ld.color}-500`}>
                                        <span className={`text-[10px] font-bold text-${ld.color}-400 uppercase tracking-wider`}>
                                            {ld.shortName}
                                        </span>
                                    </div>
                                    {ld.matches.map((match, idx) => (
                                        <CompactMatchRow
                                            key={idx}
                                            match={match}
                                            teamName={teamName}
                                        />
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Upcoming Matches - Grouped by League */}
                {upcomingByLeague.length > 0 && (
                    <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
                        <div className="px-3 py-2 border-b border-slate-800 flex items-center gap-2">
                            <span>⏳</span>
                            <span className="text-sm font-bold text-white">Gelecek Maçlar</span>
                        </div>
                        <div className="divide-y divide-slate-800/50">
                            {upcomingByLeague.map(ld => (
                                <div key={ld.league}>
                                    <div className={`px-3 py-1.5 bg-${ld.color}-500/10 border-l-2 border-${ld.color}-500`}>
                                        <span className={`text-[10px] font-bold text-${ld.color}-400 uppercase tracking-wider`}>
                                            {ld.shortName}
                                        </span>
                                    </div>
                                    {ld.matches.map((match, idx) => (
                                        <CompactMatchRow
                                            key={idx}
                                            match={match}
                                            teamName={teamName}
                                            isPending
                                        />
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Other Leagues */}
                {leagueData.length > 1 && (
                    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
                        <div className="text-xs text-slate-500 mb-2">Diğer Turnuvalar</div>
                        <div className="flex flex-wrap gap-2">
                            {leagueData.slice(1).map(ld => {
                                const rank = ld.standings.findIndex(t =>
                                    matchesTeamExact(t.name, teamName)
                                ) + 1;
                                return (
                                    <Link
                                        key={ld.league}
                                        href={`/${ld.league}/tahminoyunu`}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg
                                            bg-${ld.color}-500/10 border border-${ld.color}-500/30 hover:bg-${ld.color}-500/20 transition-colors`}
                                    >
                                        <span className={`text-xs font-bold text-${ld.color}-400`}>{ld.shortName}</span>
                                        {rank > 0 && (
                                            <span className="text-[10px] text-slate-400">{rank}.</span>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {leagueData.length === 0 && (
                    <div className="text-center py-12">
                        <div className="text-5xl mb-3">🔍</div>
                        <h2 className="text-lg font-bold text-white mb-1">Takım Bulunamadı</h2>
                        <p className="text-sm text-slate-400 mb-4">
                            &quot;{teamName}&quot; aktif liglerde bulunamadı.
                        </p>
                        <Link
                            href="/ligler"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700"
                        >
                            Liglere Göz At
                        </Link>
                    </div>
                )}
            </div>
        </main>
    );
}

// Compact stat box
function StatBox({ value, label, color }: { value: string | number; label: string; color: string }) {
    return (
        <div className={`bg-${color}-500/10 border border-${color}-500/20 rounded-xl p-2 text-center`}>
            <div className={`text-lg font-black text-${color}-400`}>{value}</div>
            <div className="text-[9px] text-slate-500 uppercase tracking-wider">{label}</div>
        </div>
    );
}

// Compact match row
function CompactMatchRow({ match, teamName, isPending = false }: {
    match: Match;
    teamName: string;
    isPending?: boolean;
}) {
    const isHome = matchesTeamExact(match.homeTeam || '', teamName);
    const opponent = isHome ? match.awayTeam : match.homeTeam;
    const won = !isPending && (
        (isHome && (match.homeScore || 0) > (match.awayScore || 0)) ||
        (!isHome && (match.awayScore || 0) > (match.homeScore || 0))
    );

    return (
        <div className="flex items-center gap-2 px-3 py-2 hover:bg-slate-800/30">
            <TeamAvatar name={opponent || ''} size="xs" />
            <div className="flex-1 min-w-0">
                <span className="text-xs text-slate-300 truncate block">{opponent}</span>
                <span className="text-[10px] text-slate-500">{isHome ? 'Ev Sahibi' : 'Deplasman'}</span>
            </div>
            {isPending ? (
                <span className="text-[10px] text-slate-500">{match.matchDate || 'TBD'}</span>
            ) : (
                <div className={`text-xs font-bold px-2 py-0.5 rounded ${won ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                    }`}>
                    {isHome ? `${match.homeScore}-${match.awayScore}` : `${match.awayScore}-${match.homeScore}`}
                </div>
            )}
        </div>
    );
}
