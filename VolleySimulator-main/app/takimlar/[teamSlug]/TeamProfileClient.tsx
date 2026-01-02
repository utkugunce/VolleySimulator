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
    group?: string;
    standings: TeamStats[];
    fixtures: Match[];
}

// Turkish character normalization for matching
const normalizeTurkish = (str: string): string => {
    const map: Record<string, string> = {
        'ş': 's', 'Ş': 's', 'ğ': 'g', 'Ğ': 'g',
        'ü': 'u', 'Ü': 'u', 'ö': 'o', 'Ö': 'o',
        'ç': 'c', 'Ç': 'c', 'ı': 'i', 'İ': 'i',
    };
    return str.split('').map(char => map[char] || char).join('').toLowerCase();
};

// Match function that handles Turkish characters
const matchesTeam = (name1: string, name2: string): boolean => {
    const n1 = normalizeTurkish(name1);
    const n2 = normalizeTurkish(name2);
    return n1.includes(n2) || n2.includes(n1);
};

export default function TeamProfileClient({ teamSlug }: TeamProfileClientProps) {
    const [loading, setLoading] = useState(true);
    const [teamName, setTeamName] = useState<string>("");
    const [leagueData, setLeagueData] = useState<LeagueData[]>([]);
    const [error, setError] = useState<string | null>(null);

    // Decode team name from slug
    useEffect(() => {
        const decoded = decodeURIComponent(teamSlug)
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
        setTeamName(decoded);
    }, [teamSlug]);

    // Fetch league data
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

                        // Check if team exists in this league
                        const hasTeam = data.standings?.some((team: TeamStats) =>
                            matchesTeam(team.name, teamName)
                        );

                        if (hasTeam || data.fixtures?.some((m: Match) =>
                            matchesTeam(m.homeTeam || '', teamName) ||
                            matchesTeam(m.awayTeam || '', teamName)
                        )) {
                            results.push({
                                league,
                                leagueName: getLeagueName(league),
                                standings: data.standings || [],
                                fixtures: data.fixtures || [],
                            });
                        }
                    } catch {
                        // Skip this league on error
                    }
                }

                setLeagueData(results);
            } catch (err) {
                setError("Takım verileri yüklenirken hata oluştu");
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [teamName]);

    function getLeagueName(league: string): string {
        const names: Record<string, string> = {
            'vsl': 'Vodafone Sultanlar Ligi',
            '1lig': 'Arabica Coffee House 1. Lig',
            '2lig': 'Kadınlar 2. Lig',
            'cev-cl': 'CEV Şampiyonlar Ligi'
        };
        return names[league] || league;
    }

    // Get team stats from first league where found
    const teamStats = leagueData.length > 0
        ? leagueData[0].standings.find(t => matchesTeam(t.name, teamName))
        : null;

    // Get all matches for this team
    const teamMatches = leagueData.flatMap(ld =>
        ld.fixtures.filter(m =>
            matchesTeam(m.homeTeam || '', teamName) ||
            matchesTeam(m.awayTeam || '', teamName)
        )
    );

    // Separate past and upcoming matches
    const now = new Date();
    const pastMatches = teamMatches
        .filter(m => m.homeScore !== undefined && m.awayScore !== undefined)
        .slice(-5);
    const upcomingMatches = teamMatches
        .filter(m => m.homeScore === undefined || m.awayScore === undefined)
        .slice(0, 5);

    if (loading) {
        return (
            <main className="min-h-screen bg-background pt-16 pb-20">
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <div className="animate-pulse space-y-6">
                        <div className="h-32 bg-surface rounded-2xl"></div>
                        <div className="h-24 bg-surface rounded-xl"></div>
                        <div className="h-48 bg-surface rounded-xl"></div>
                    </div>
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="min-h-screen bg-background pt-16 pb-20">
                <div className="max-w-4xl mx-auto px-4 py-8 text-center">
                    <div className="text-rose-500 text-lg">{error}</div>
                    <Link href="/ligler" className="text-emerald-400 mt-4 inline-block">
                        ← Liglere Dön
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-background pt-16 pb-20">
            <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

                {/* Back Button */}
                <Link
                    href="/ligler"
                    className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
                >
                    ← Liglere Dön
                </Link>

                {/* Hero Section */}
                <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700 rounded-3xl p-6 md:p-8">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="relative">
                            <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full"></div>
                            <TeamAvatar name={teamStats?.name || teamName} size="lg" />
                        </div>
                        <div className="text-center md:text-left">
                            <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
                                {teamStats?.name || teamName}
                            </h1>
                            {leagueData.length > 0 && (
                                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                                    {leagueData.map(ld => (
                                        <span
                                            key={ld.league}
                                            className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-sm rounded-full"
                                        >
                                            {ld.leagueName}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Statistics Card */}
                {teamStats && (
                    <div className="bg-surface border border-border-main rounded-2xl p-6">
                        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <span>📊</span> İstatistikler
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-surface-secondary rounded-xl p-4 text-center">
                                <div className="text-2xl font-black text-amber-400">{teamStats.points}</div>
                                <div className="text-xs text-slate-400 uppercase tracking-wider">Puan</div>
                            </div>
                            <div className="bg-surface-secondary rounded-xl p-4 text-center">
                                <div className="text-2xl font-black text-emerald-400">{teamStats.wins}</div>
                                <div className="text-xs text-slate-400 uppercase tracking-wider">Galibiyet</div>
                            </div>
                            <div className="bg-surface-secondary rounded-xl p-4 text-center">
                                <div className="text-2xl font-black text-rose-400">{teamStats.played - teamStats.wins}</div>
                                <div className="text-xs text-slate-400 uppercase tracking-wider">Mağlubiyet</div>
                            </div>
                            <div className="bg-surface-secondary rounded-xl p-4 text-center">
                                <div className="text-2xl font-black text-cyan-400">
                                    {teamStats.setsWon}-{teamStats.setsLost}
                                </div>
                                <div className="text-xs text-slate-400 uppercase tracking-wider">Set</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Recent Matches */}
                {pastMatches.length > 0 && (
                    <div className="bg-surface border border-border-main rounded-2xl p-6">
                        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <span>📅</span> Son Maçlar
                        </h2>
                        <div className="space-y-3">
                            {pastMatches.map((match, idx) => (
                                <MatchCard key={idx} match={match} teamName={teamName} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Upcoming Matches */}
                {upcomingMatches.length > 0 && (
                    <div className="bg-surface border border-border-main rounded-2xl p-6">
                        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <span>⏳</span> Gelecek Maçlar
                        </h2>
                        <div className="space-y-3">
                            {upcomingMatches.map((match, idx) => (
                                <MatchCard key={idx} match={match} teamName={teamName} isPending />
                            ))}
                        </div>
                    </div>
                )}

                {/* Tournaments Section */}
                {leagueData.length > 0 && (
                    <div className="bg-surface border border-border-main rounded-2xl p-6">
                        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <span>🏆</span> Turnuvalar
                        </h2>
                        <div className="space-y-3">
                            {leagueData.map(ld => {
                                const rank = ld.standings.findIndex(t =>
                                    matchesTeam(t.name, teamName)
                                ) + 1;

                                return (
                                    <Link
                                        key={ld.league}
                                        href={`/${ld.league}/tahminoyunu`}
                                        className="flex items-center justify-between p-4 bg-surface-secondary hover:bg-surface-secondary/70 rounded-xl transition-colors group"
                                    >
                                        <div>
                                            <div className="font-bold text-white group-hover:text-emerald-400 transition-colors">
                                                {ld.leagueName}
                                            </div>
                                            {ld.group && (
                                                <div className="text-sm text-slate-400">Grup {ld.group}</div>
                                            )}
                                        </div>
                                        {rank > 0 && (
                                            <div className="flex items-center gap-2">
                                                <span className={`text-sm font-bold ${rank === 1 ? 'text-amber-400' :
                                                    rank <= 4 ? 'text-emerald-400' :
                                                        'text-slate-400'
                                                    }`}>
                                                    {rank}. sıra
                                                </span>
                                                <span className="text-slate-500 group-hover:translate-x-1 transition-transform">→</span>
                                            </div>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* No Data State */}
                {leagueData.length === 0 && !loading && (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">🔍</div>
                        <h2 className="text-xl font-bold text-white mb-2">Takım Bulunamadı</h2>
                        <p className="text-slate-400 mb-6">
                            "{teamName}" takımı hiçbir ligde bulunamadı.
                        </p>
                        <Link
                            href="/ligler"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                        >
                            Liglere Göz At
                        </Link>
                    </div>
                )}
            </div>
        </main>
    );
}

// Match Card Component
function MatchCard({ match, teamName, isPending = false }: { match: Match; teamName: string; isPending?: boolean }) {
    const isHome = matchesTeam(match.homeTeam || '', teamName);

    const won = match.homeScore != null && match.awayScore != null &&
        ((isHome && match.homeScore > match.awayScore) || (!isHome && match.awayScore > match.homeScore));

    const lost = match.homeScore != null && match.awayScore != null &&
        ((isHome && match.homeScore < match.awayScore) || (!isHome && match.awayScore < match.homeScore));

    return (
        <div className={`flex items-center justify-between p-3 rounded-xl border ${isPending ? 'bg-surface-secondary/50 border-slate-700' :
            won ? 'bg-emerald-500/10 border-emerald-500/30' :
                lost ? 'bg-rose-500/10 border-rose-500/30' :
                    'bg-surface-secondary border-slate-700'
            }`}>
            <div className="flex items-center gap-3 flex-1 min-w-0">
                <TeamAvatar name={match.homeTeam || ''} size="sm" />
                <span className={`text-sm truncate ${isHome ? 'font-bold text-white' : 'text-slate-300'}`}>
                    {match.homeTeam}
                </span>
            </div>

            <div className="px-4 flex-shrink-0">
                {isPending ? (
                    <span className="text-xs text-slate-500 uppercase">vs</span>
                ) : (
                    <span className={`font-mono font-bold ${won ? 'text-emerald-400' : lost ? 'text-rose-400' : 'text-slate-400'
                        }`}>
                        {match.homeScore} - {match.awayScore}
                    </span>
                )}
            </div>

            <div className="flex items-center gap-3 flex-1 min-w-0 justify-end">
                <span className={`text-sm truncate ${!isHome ? 'font-bold text-white' : 'text-slate-300'}`}>
                    {match.awayTeam}
                </span>
                <TeamAvatar name={match.awayTeam || ''} size="sm" />
            </div>
        </div>
    );
}
