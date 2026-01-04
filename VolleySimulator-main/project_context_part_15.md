# Project Application Context - Part 15

## File: app\takimlar\[teamSlug]\TeamProfileClient.tsx
```
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

```

## File: app\tournament-predictions\page.tsx
```
"use client";

import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Link from "next/link";

interface TournamentPrediction {
  id: string;
  tournament: string;
  seasonPredictions: {
    champion: string;
    runnerUp: string;
    thirdPlace: string;
    relegated: string[];
    topScorer: string;
  };
  playoffPredictions?: {
    semifinal1: { home: string; away: string; winner: string };
    semifinal2: { home: string; away: string; winner: string };
    final: { home: string; away: string; winner: string };
    thirdPlace: { home: string; away: string; winner: string };
  };
  createdAt: string;
  locked: boolean;
}

const LEAGUES = [
  { id: 'vsl', name: 'Sultanlar Ligi', icon: '👑', color: 'from-amber-600 to-orange-600' },
  { id: '1lig', name: '1. Lig', icon: '🥈', color: 'from-slate-500 to-slate-600' },
  { id: '2lig', name: '2. Lig', icon: '🥉', color: 'from-amber-700 to-amber-800' },
  { id: 'cev-cl', name: 'CEV Şampiyonlar Ligi', icon: '🌟', color: 'from-blue-600 to-indigo-600' },
];

const SAMPLE_TEAMS: Record<string, string[]> = {
  vsl: [
    "FENERBAHÇE MEDICANA", "ECZACIBAŞI DYNAVİT", "VAKIFBANK", "GALATASARAY DAIKIN",
    "THY", "NİLÜFER BELEDİYESPOR", "BEŞİKTAŞ", "ARAS KARGO",
    "KUZEYBORUİSTANBUL", "SIGORTA SHOP", "PTT", "TOKAT BELEDİYE PLEVNE"
  ],
  '1lig': [
    "BURSA BÜYÜKŞEHIR", "AYDIN B.ŞEHİR BEL", "MERSİN", "KARAYOLLARI",
    "ÇANKAYA ÜNİV", "GAZİANTEP", "AKDENİZ ÜNİ", "ANTALYA 07"
  ],
  '2lig': [
    "SAKARYA", "MUĞLA", "İZMİR", "ESKİŞEHİR",
    "KONYA", "TRABZON", "ADANA", "BURSA"
  ],
  'cev-cl': [
    "VAKIFBANK", "ECZACIBAŞI", "FENERBAHÇE", "IMOCO VOLLEY",
    "VERO VOLLEY", "MARITZA PLOVDIV", "DEVELOPRES", "PROSTEJOV"
  ]
};

export default function TournamentPredictionsPage() {
  const { user } = useAuth();
  const [selectedLeague, setSelectedLeague] = useState<string | null>(null);
  const [predictions, setPredictions] = useState<Record<string, TournamentPrediction>>({});
  const [activeTab, setActiveTab] = useState<'season' | 'playoff'>('season');
  
  // Form state
  const [champion, setChampion] = useState("");
  const [runnerUp, setRunnerUp] = useState("");
  const [thirdPlace, setThirdPlace] = useState("");
  const [relegated, setRelegated] = useState<string[]>([]);
  const [topScorer, setTopScorer] = useState("");

  const handleSavePrediction = () => {
    if (!selectedLeague || !champion || !runnerUp || !thirdPlace) return;
    
    const newPrediction: TournamentPrediction = {
      id: `${selectedLeague}-${Date.now()}`,
      tournament: selectedLeague,
      seasonPredictions: {
        champion,
        runnerUp,
        thirdPlace,
        relegated,
        topScorer,
      },
      createdAt: new Date().toISOString(),
      locked: false,
    };
    
    setPredictions(prev => ({
      ...prev,
      [selectedLeague]: newPrediction
    }));
    
    // Reset form
    setChampion("");
    setRunnerUp("");
    setThirdPlace("");
    setRelegated([]);
    setTopScorer("");
    setSelectedLeague(null);
  };

  const toggleRelegated = (team: string) => {
    setRelegated(prev => 
      prev.includes(team) 
        ? prev.filter(t => t !== team)
        : prev.length < 2 ? [...prev, team] : prev
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 mb-4">Bu sayfayı görüntülemek için giriş yapmalısınız.</p>
          <Link href="/" className="text-emerald-400 hover:underline">Giriş Yap</Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-white">Turnuva Tahminleri</h1>
          <p className="text-white/70 text-sm mt-1">
            Sezon sonu tahminlerini yap ve büyük ödüller kazan!
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Info Card */}
        <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <h3 className="font-bold text-white">Nasıl Çalışır?</h3>
              <p className="text-sm text-slate-300 mt-1">
                Her lig için sezon sonu tahminlerini yap. Şampiyon, ikincilik, üçüncülük ve küme düşecek takımları tahmin et. 
                Playoff aşamasına geçildiğinde playoff tahminleri de yapabilirsin. Doğru tahminler için yüksek puanlar kazan!
              </p>
            </div>
          </div>
        </div>

        {/* League Selection */}
        {!selectedLeague ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {LEAGUES.map(league => {
              const hasPrediction = predictions[league.id];
              return (
                <button
                  key={league.id}
                  onClick={() => setSelectedLeague(league.id)}
                  className={`relative bg-gradient-to-br ${league.color} rounded-2xl p-6 text-left transition-all hover:scale-[1.02] active:scale-[0.98]`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-4xl">{league.icon}</span>
                      <h3 className="font-bold text-white text-xl mt-3">{league.name}</h3>
                    </div>
                    {hasPrediction && (
                      <span className="bg-white/20 px-2 py-1 rounded-lg text-xs font-medium">
                        ✓ Tahmin Yapıldı
                      </span>
                    )}
                  </div>
                  
                  {hasPrediction ? (
                    <div className="mt-4 space-y-1 text-sm text-white/80">
                      <p>🥇 {hasPrediction.seasonPredictions.champion}</p>
                      <p>🥈 {hasPrediction.seasonPredictions.runnerUp}</p>
                      <p>🥉 {hasPrediction.seasonPredictions.thirdPlace}</p>
                    </div>
                  ) : (
                    <p className="mt-4 text-white/70 text-sm">
                      Henüz tahmin yapılmadı
                    </p>
                  )}
                  
                  <div className="absolute bottom-4 right-4 text-white/50 text-2xl">→</div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Back Button */}
            <button
              onClick={() => setSelectedLeague(null)}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              ← Geri Dön
            </button>

            {/* Selected League Header */}
            <div className={`bg-gradient-to-r ${LEAGUES.find(l => l.id === selectedLeague)?.color} rounded-xl p-6`}>
              <div className="flex items-center gap-4">
                <span className="text-4xl">{LEAGUES.find(l => l.id === selectedLeague)?.icon}</span>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {LEAGUES.find(l => l.id === selectedLeague)?.name}
                  </h2>
                  <p className="text-white/70">2024-2025 Sezonu Tahminleri</p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('season')}
                className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                  activeTab === 'season'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                📊 Sezon Sonu
              </button>
              <button
                onClick={() => setActiveTab('playoff')}
                className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                  activeTab === 'playoff'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                🏆 Playoff
              </button>
            </div>

            {/* Season Predictions */}
            {activeTab === 'season' && (
              <div className="space-y-6">
                {/* Champion */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                  <h3 className="flex items-center gap-2 font-bold text-white mb-4">
                    <span className="text-2xl">🥇</span> Şampiyon
                    <span className="ml-auto text-emerald-400 text-sm">+500 puan</span>
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {SAMPLE_TEAMS[selectedLeague]?.map(team => (
                      <button
                        key={team}
                        onClick={() => setChampion(team)}
                        disabled={team === runnerUp || team === thirdPlace || relegated.includes(team)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          champion === team
                            ? 'bg-amber-500 text-white scale-105'
                            : team === runnerUp || team === thirdPlace || relegated.includes(team)
                              ? 'bg-slate-800/50 text-slate-600 cursor-not-allowed'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {team}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Runner Up */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                  <h3 className="flex items-center gap-2 font-bold text-white mb-4">
                    <span className="text-2xl">🥈</span> İkinci
                    <span className="ml-auto text-emerald-400 text-sm">+300 puan</span>
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {SAMPLE_TEAMS[selectedLeague]?.map(team => (
                      <button
                        key={team}
                        onClick={() => setRunnerUp(team)}
                        disabled={team === champion || team === thirdPlace || relegated.includes(team)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          runnerUp === team
                            ? 'bg-slate-400 text-slate-900 scale-105'
                            : team === champion || team === thirdPlace || relegated.includes(team)
                              ? 'bg-slate-800/50 text-slate-600 cursor-not-allowed'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {team}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Third Place */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                  <h3 className="flex items-center gap-2 font-bold text-white mb-4">
                    <span className="text-2xl">🥉</span> Üçüncü
                    <span className="ml-auto text-emerald-400 text-sm">+200 puan</span>
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {SAMPLE_TEAMS[selectedLeague]?.map(team => (
                      <button
                        key={team}
                        onClick={() => setThirdPlace(team)}
                        disabled={team === champion || team === runnerUp || relegated.includes(team)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          thirdPlace === team
                            ? 'bg-amber-700 text-white scale-105'
                            : team === champion || team === runnerUp || relegated.includes(team)
                              ? 'bg-slate-800/50 text-slate-600 cursor-not-allowed'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {team}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Relegated Teams */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                  <h3 className="flex items-center gap-2 font-bold text-white mb-4">
                    <span className="text-2xl">⬇️</span> Küme Düşecekler (2 takım seç)
                    <span className="ml-auto text-emerald-400 text-sm">+150 puan</span>
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {SAMPLE_TEAMS[selectedLeague]?.map(team => (
                      <button
                        key={team}
                        onClick={() => toggleRelegated(team)}
                        disabled={team === champion || team === runnerUp || team === thirdPlace}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          relegated.includes(team)
                            ? 'bg-red-500 text-white scale-105'
                            : team === champion || team === runnerUp || team === thirdPlace
                              ? 'bg-slate-800/50 text-slate-600 cursor-not-allowed'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {team}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Top Scorer */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                  <h3 className="flex items-center gap-2 font-bold text-white mb-4">
                    <span className="text-2xl">⭐</span> Gol Kralı
                    <span className="ml-auto text-emerald-400 text-sm">+100 puan</span>
                  </h3>
                  <input
                    type="text"
                    value={topScorer}
                    onChange={(e) => setTopScorer(e.target.value)}
                    placeholder="Oyuncu adı girin..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Save Button */}
                <button
                  onClick={handleSavePrediction}
                  disabled={!champion || !runnerUp || !thirdPlace}
                  className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold text-lg transition-all"
                >
                  💾 Tahmini Kaydet
                </button>
              </div>
            )}

            {/* Playoff Predictions */}
            {activeTab === 'playoff' && (
              <div className="space-y-6">
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🔒</span>
                    <div>
                      <h3 className="font-bold text-amber-400">Playoff Henüz Başlamadı</h3>
                      <p className="text-sm text-slate-400 mt-1">
                        Playoff eşleşmeleri belli olduğunda burada tahmin yapabileceksiniz.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Playoff Bracket Preview */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                  <h3 className="font-bold text-white mb-6">Playoff Şeması</h3>
                  
                  <div className="flex items-center justify-center gap-8">
                    {/* Semifinals */}
                    <div className="space-y-4">
                      <div className="text-xs text-slate-500 text-center mb-2">Yarı Final</div>
                      <div className="bg-slate-800 rounded-lg p-3 w-40">
                        <div className="text-sm text-slate-400 border-b border-slate-700 pb-2 mb-2">---</div>
                        <div className="text-sm text-slate-400">---</div>
                      </div>
                      <div className="bg-slate-800 rounded-lg p-3 w-40">
                        <div className="text-sm text-slate-400 border-b border-slate-700 pb-2 mb-2">---</div>
                        <div className="text-sm text-slate-400">---</div>
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="text-slate-600 text-2xl">→</div>

                    {/* Final */}
                    <div className="space-y-4">
                      <div className="text-xs text-slate-500 text-center mb-2">Final</div>
                      <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-lg p-3 w-40">
                        <div className="text-sm text-slate-400 border-b border-amber-500/30 pb-2 mb-2">---</div>
                        <div className="text-sm text-slate-400">---</div>
                      </div>
                      <div className="bg-slate-800 rounded-lg p-3 w-40">
                        <div className="text-xs text-slate-500 text-center">3. lük Maçı</div>
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="text-slate-600 text-2xl">→</div>

                    {/* Champion */}
                    <div className="text-center">
                      <div className="text-xs text-slate-500 mb-2">Şampiyon</div>
                      <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                        <span className="text-3xl">🏆</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Point Values Info */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <h3 className="font-bold text-white mb-4">Puan Değerleri</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Şampiyon', points: 500, icon: '🥇' },
              { label: 'İkinci', points: 300, icon: '🥈' },
              { label: 'Üçüncü', points: 200, icon: '🥉' },
              { label: 'Küme Düşen', points: 150, icon: '⬇️' },
              { label: 'Gol Kralı', points: 100, icon: '⭐' },
              { label: 'Yarı Final', points: 100, icon: '🏟️' },
              { label: 'Final', points: 200, icon: '🏆' },
              { label: 'Tam İsabet', points: 1000, icon: '🎯' },
            ].map(item => (
              <div key={item.label} className="bg-slate-800/50 rounded-lg p-3 text-center">
                <span className="text-2xl">{item.icon}</span>
                <div className="text-sm text-slate-400 mt-1">{item.label}</div>
                <div className="text-emerald-400 font-bold">+{item.points}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

```

## File: app\utils\apiValidation.ts
```
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';

// Validation schemas for API routes
export const ScoreSchema = z.string()
    .regex(/^[0-3]-[0-3]$/, 'Geçerli skor formatı: "X-Y" (örn: "3-0")');

export const PredictionSchema = z.object({
    matchId: z.string().min(1),
    score: ScoreSchema,
    leagueId: z.string().min(1),
});

export const LeagueIdSchema = z.enum([
    'vsl',
    '1lig',
    '2lig',
    'cev-cl',
    'cev-cup',
    'cev-challenge',
    'tvf'
]);

/**
 * Validate JSON body with Zod schema
 * @param req - NextRequest
 * @param schema - Zod schema
 * @returns Validated data or error response
 */
export async function validateBody<T>(
    req: NextRequest,
    schema: z.ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; error: string }> {
    try {
        const body = await req.json();
        const validated = schema.parse(body);
        return { success: true, data: validated as T };
    } catch (error) {
        if (error instanceof z.ZodError) {
            const message = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
            return { success: false, error: message };
        }
        return { success: false, error: 'Invalid request body' };
    }
}

/**
 * Create error response
 */
export function errorResponse(message: string, status: number = 400) {
    return NextResponse.json({ error: message }, { status });
}

/**
 * Create success response
 */
export function successResponse<T>(data: T, status: number = 200) {
    return NextResponse.json(data, { status });
}

/**
 * Validate if a score string is a valid volleyball score
 */
export function isValidScore(score: string): boolean {
    const result = ScoreSchema.safeParse(score);
    if (!result.success) return false;

    const [home, away] = score.split('-').map(Number);
    // Valid volleyball scores: one team must have 3, other must have 0-2
    return (home === 3 && away >= 0 && away <= 2) || (away === 3 && home >= 0 && home <= 2);
}

/**
 * Validate score format
 */
export function validateScore(score: unknown): { valid: boolean; error?: string } {
    const result = ScoreSchema.safeParse(score);
    if (!result.success) {
        return { valid: false, error: result.error.errors[0]?.message || 'Invalid score' };
    }
    if (!isValidScore(score as string)) {
        return { valid: false, error: 'Invalid volleyball score (one team must win 3 sets)' };
    }
    return { valid: true };
}

/**
 * Validate match ID format
 */
export function validateMatchId(matchId: unknown): { valid: boolean; error?: string } {
    if (typeof matchId !== 'string' || matchId.length === 0) {
        return { valid: false, error: 'Match ID is required' };
    }
    return { valid: true };
}

```

## File: app\utils\calculatorUtils.ts
```
import { Match, MatchOutcome, TeamStats } from "../types";

export const SCORES = ['3-0', '3-1', '3-2', '2-3', '1-3', '0-3'];

export function getOutcomeFromScore(score: string): MatchOutcome | null {
    const [h, a] = score.split('-').map(Number);
    if (isNaN(h) || isNaN(a)) return null;

    if (h === 3) {
        if (a === 0 || a === 1) return { homeSets: 3, awaySets: a, homePoints: 3, awayPoints: 0, homeWin: true };
        if (a === 2) return { homeSets: 3, awaySets: 2, homePoints: 2, awayPoints: 1, homeWin: true };
    }
    if (a === 3) {
        if (h === 0 || h === 1) return { homeSets: h, awaySets: 3, homePoints: 0, awayPoints: 3, homeWin: false };
        if (h === 2) return { homeSets: 2, awaySets: 3, homePoints: 1, awayPoints: 2, homeWin: false };
    }
    return null;
}

export function sortStandings(teams: TeamStats[]): TeamStats[] {
    return [...teams].sort((a, b) => {
        // 1. Wins (most wins first)
        if (b.wins !== a.wins) return b.wins - a.wins;
        // 2. Points
        if (b.points !== a.points) return b.points - a.points;
        // 3. Set Average (ratio)
        const setAvgB = (b.setsWon === 0 && b.setsLost === 0) ? 0 : (b.setsWon / (b.setsLost || 1));
        const setAvgA = (a.setsWon === 0 && a.setsLost === 0) ? 0 : (a.setsWon / (a.setsLost || 1));
        return setAvgB - setAvgA;
    });
}

export const normalizeTeamName = (name: string) => {
    return name
        .replace(/İ/g, 'I')
        .replace(/ı/g, 'I')
        .replace(/Ş/g, 'S')
        .replace(/ş/g, 'S')
        .replace(/Ğ/g, 'G')
        .replace(/ğ/g, 'G')
        .replace(/Ü/g, 'U')
        .replace(/ü/g, 'U')
        .replace(/Ö/g, 'O')
        .replace(/ö/g, 'O')
        .replace(/Ç/g, 'C')
        .replace(/ç/g, 'C')
        .replace(/i/g, 'I')
        .toUpperCase()
        .replace(/\s+/g, '')
        .replace(/[^A-Z0-9]/g, '')
        .trim();
};

export function calculateLiveStandings(
    initialTeams: TeamStats[],
    matches: Match[],
    overrides: Record<string, string> // matchId -> "3-0"
): TeamStats[] {
    // Deep clone teams to simulate changes, indexed by normalized name
    const teamsMap = new Map<string, TeamStats>();
    initialTeams.forEach(t => {
        const key = normalizeTeamName(t.name);
        teamsMap.set(key, { ...t });
    });

    matches.forEach(m => {
        // Normalize match team names for lookup
        const homeKey = normalizeTeamName(m.homeTeam);
        const awayKey = normalizeTeamName(m.awayTeam);

        // Check for override with both separator formats for compatibility
        const matchId1 = `${m.homeTeam}|||${m.awayTeam}`;
        const matchId2 = `${m.homeTeam}-${m.awayTeam}`;
        const overriddenScore = overrides[matchId1] || overrides[matchId2];

        if (overriddenScore && !m.isPlayed) {
            const outcome = getOutcomeFromScore(overriddenScore);
            if (outcome) {
                const home = teamsMap.get(homeKey);
                const away = teamsMap.get(awayKey);

                if (home && away) {
                    home.played += 1;
                    home.points += outcome.homePoints;
                    home.setsWon += outcome.homeSets;
                    home.setsLost += outcome.awaySets;
                    if (outcome.homeWin) home.wins += 1;

                    away.played += 1;
                    away.points += outcome.awayPoints;
                    away.setsWon += outcome.awaySets;
                    away.setsLost += outcome.homeSets;
                    if (!outcome.homeWin) away.wins += 1;
                }
            }
        }
    });

    return sortStandings(Array.from(teamsMap.values()));
}

```

## File: app\utils\eloCalculator.ts
```
import { Match, TeamStats } from "../types";

export function calculateElo(teams: TeamStats[], matches: Match[]): Map<string, number> {
    const ratings = new Map<string, number>();
    
    // Initialize all teams with 1200
    teams.forEach(t => ratings.set(t.name, 1200));

    // Sort matches by date if possible to ensure chronological order calculation
    // Assuming matches are roughly in order or we want to process played matches
    const playedMatches = matches.filter(m => m.isPlayed && m.resultScore).sort((a, b) => {
        // Simple date sort if available
        if (a.matchDate && b.matchDate) return a.matchDate.localeCompare(b.matchDate);
        return 0;
    });

    playedMatches.forEach(m => {
        const homeName = m.homeTeam;
        const awayName = m.awayTeam;
        
        const homeRating = ratings.get(homeName) || 1200;
        const awayRating = ratings.get(awayName) || 1200;
        
        const [hSets, aSets] = (m.resultScore || '0-0').split('-').map(Number);
        
        // Skip invalid scores
        if (isNaN(hSets) || isNaN(aSets)) return;

        // Determine actual score (1 for win, 0 for loss)
        // Advanced: We could use 0.9 for 3-2 wins etc, but standard Elo is 1/0
        const actualHome = hSets > aSets ? 1 : 0;
        const actualAway = 1 - actualHome;

        // K-Factor - using 32 as standard for many sports
        const K = 32;

        // Expected score
        // Ea = 1 / (1 + 10 ^ ((Rb - Ra) / 400))
        const expectedHome = 1 / (1 + Math.pow(10, (awayRating - homeRating) / 400));
        const expectedAway = 1 / (1 + Math.pow(10, (homeRating - awayRating) / 400));

        // Margin of victory Multiplier (Optional but good for Volleyball 3-0 vs 3-2)
        // Multiplier = ln(abs(PD) + 1) * (2.2 / ((ELOW - ELOL) * 0.001 + 2.2))
        // Simplified multiplier: 
        // 3-0: 1.5x
        // 3-1: 1.25x
        // 3-2: 1.0x
        let multiplier = 1;
        const setDiff = Math.abs(hSets - aSets);
        if (setDiff === 3) multiplier = 1.3; // Dominant win
        else if (setDiff === 2) multiplier = 1.1; // Solid win
        else multiplier = 1.0; // Tie-break win

        // Update ratings
        const newHomeRating = homeRating + K * multiplier * (actualHome - expectedHome);
        const newAwayRating = awayRating + K * multiplier * (actualAway - expectedAway);

        ratings.set(homeName, newHomeRating);
        ratings.set(awayName, newAwayRating);
    });

    return ratings;
}

```

## File: app\utils\gameState.ts
```
"use client";

import { useState, useEffect, useCallback } from 'react';
import {
    GameState,
    Achievement,
    AchievementId,
    Quest,
    QuestId,
    LEVEL_THRESHOLDS,
    LEVEL_TITLES
} from '../types';

// ============================================
// ACHIEVEMENT DEFINITIONS
// ============================================
export const ACHIEVEMENTS: Record<AchievementId, Omit<Achievement, 'unlockedAt'>> = {
    first_prediction: {
        id: 'first_prediction',
        name: 'İlk Adım',
        description: 'İlk tahminini yaptın!',
        icon: '🎯',
        xpReward: 50
    },
    streak_3: {
        id: 'streak_3',
        name: '3\'lü Seri',
        description: '3 maç üst üste doğru tahmin',
        icon: '🔥',
        xpReward: 100
    },
    streak_5: {
        id: 'streak_5',
        name: '5\'li Seri',
        description: '5 maç üst üste doğru tahmin',
        icon: '💥',
        xpReward: 200
    },
    champion_predictor: {
        id: 'champion_predictor',
        name: 'Şampiyon Tahmincisi',
        description: 'Sezon şampiyonunu doğru tahmin ettin',
        icon: '🏆',
        xpReward: 500
    },
    perfect_week: {
        id: 'perfect_week',
        name: 'Mükemmel Hafta',
        description: 'Bir haftada 5/5 doğru tahmin',
        icon: '💯',
        xpReward: 300
    },
    underdog_hero: {
        id: 'underdog_hero',
        name: 'Underdog Kahramanı',
        description: 'Sürpriz bir sonucu doğru tahmin ettin',
        icon: '🦸',
        xpReward: 150
    },
    game_addict: {
        id: 'game_addict',
        name: 'Oyun Bağımlısı',
        description: '50+ tahmin yaptın',
        icon: '🎮',
        xpReward: 250
    },
    loyal_fan: {
        id: 'loyal_fan',
        name: 'Sadık Taraftar',
        description: 'Favori takım seçtin ve 10 maçını tahmin ettin',
        icon: '❤️',
        xpReward: 150
    }
};

// ============================================
// INITIAL STATE
// ============================================
const getInitialGameState = (): GameState => ({
    xp: 0,
    level: 1,
    favoriteTeam: null,
    achievements: [],
    quests: [],
    stats: {
        totalPredictions: 0,
        correctPredictions: 0,
        currentStreak: 0,
        bestStreak: 0,
        predictedChampions: []
    },
    soundEnabled: true,
    lastActiveDate: new Date().toISOString().split('T')[0]
});

// ============================================
// HELPER FUNCTIONS
// ============================================
export function calculateLevel(xp: number): number {
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
        if (xp >= LEVEL_THRESHOLDS[i]) {
            return i + 1;
        }
    }
    return 1;
}

export function getXPForNextLevel(level: number): number {
    if (level >= LEVEL_THRESHOLDS.length) {
        return LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1] + 3000 * (level - LEVEL_THRESHOLDS.length + 1);
    }
    return LEVEL_THRESHOLDS[level] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
}

export function getLevelTitle(level: number): string {
    const titles = Object.entries(LEVEL_TITLES)
        .map(([lvl, title]) => ({ level: parseInt(lvl), title }))
        .sort((a, b) => b.level - a.level);

    for (const { level: reqLevel, title } of titles) {
        if (level >= reqLevel) return title;
    }
    return 'Çaylak';
}

// ============================================
// GAME STATE HOOK
// ============================================
const STORAGE_KEY = 'volleySimGameState';

export function useGameState() {
    const [gameState, setGameState] = useState<GameState>(getInitialGameState);
    const [isLoaded, setIsLoaded] = useState(false);
    const [showLevelUp, setShowLevelUp] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        const loadState = () => {
            try {
                const saved = localStorage.getItem(STORAGE_KEY);
                if (saved) {
                    const parsed = JSON.parse(saved);
                    setGameState(prev => ({ ...prev, ...parsed }));
                }
            } catch (e) {
                console.error('Failed to load game state:', e);
            }
            setIsLoaded(true);
        };

        Promise.resolve().then(loadState);
    }, []);

    // Save to localStorage on change
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
        }
    }, [gameState, isLoaded]);

    // Add XP
    const addXP = useCallback((amount: number) => {
        setGameState(prev => {
            const newXP = prev.xp + amount;
            const newLevel = calculateLevel(newXP);
            if (newLevel > prev.level) {
                setShowLevelUp(true);
            }
            return {
                ...prev,
                xp: newXP,
                level: newLevel
            };
        });
    }, []);

    // Record prediction
    const recordPrediction = useCallback((isCorrect: boolean) => {
        setGameState(prev => {
            const newStats = { ...prev.stats };
            newStats.totalPredictions++;

            if (isCorrect) {
                newStats.correctPredictions++;
                newStats.currentStreak++;
                if (newStats.currentStreak > newStats.bestStreak) {
                    newStats.bestStreak = newStats.currentStreak;
                }
            } else {
                newStats.currentStreak = 0;
            }

            return { ...prev, stats: newStats };
        });
    }, []);

    // Unlock achievement
    const unlockAchievement = useCallback((id: AchievementId): boolean => {
        let wasUnlocked = false;

        setGameState(prev => {
            // Check if already unlocked
            if (prev.achievements.some(a => a.id === id)) {
                return prev;
            }

            const achievementDef = ACHIEVEMENTS[id];
            if (!achievementDef) return prev;

            const newAchievement: Achievement = {
                ...achievementDef,
                unlockedAt: new Date().toISOString()
            };

            wasUnlocked = true;
            const newXP = prev.xp + achievementDef.xpReward;

            return {
                ...prev,
                xp: newXP,
                level: calculateLevel(newXP),
                achievements: [...prev.achievements, newAchievement]
            };
        });

        return wasUnlocked;
    }, []);

    // Set favorite team
    const setFavoriteTeam = useCallback((teamName: string | null) => {
        setGameState(prev => ({ ...prev, favoriteTeam: teamName }));
    }, []);

    // Toggle sound
    const toggleSound = useCallback(() => {
        setGameState(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }));
    }, []);

    // Check if achievement is unlocked
    const hasAchievement = useCallback((id: AchievementId): boolean => {
        return gameState.achievements.some(a => a.id === id);
    }, [gameState.achievements]);

    return {
        gameState,
        isLoaded,
        showLevelUp,
        clearLevelUp: () => setShowLevelUp(false),
        addXP,
        recordPrediction,
        unlockAchievement,
        setFavoriteTeam,
        toggleSound,
        hasAchievement,
        getLevelTitle: () => getLevelTitle(gameState.level),
        getXPProgress: () => {
            const currentLevelXP = LEVEL_THRESHOLDS[gameState.level - 1] || 0;
            const nextLevelXP = getXPForNextLevel(gameState.level);
            const progress = gameState.xp - currentLevelXP;
            const required = nextLevelXP - currentLevelXP;
            return { progress, required, percentage: (progress / required) * 100 };
        }
    };
}

```

## File: app\utils\index.ts
```
// Utility functions barrel export
export * from './apiValidation';
export * from './rateLimit';
export * from './validation';
export * from './performance';

// Re-export commonly used utilities
export { calculateLiveStandings, normalizeTeamName } from './calculatorUtils';
export { createClient } from './supabase';
export { generateTeamSlug, getTeamNameFromSlug, registerTeamSlug, isSlugRegistered } from './teamSlug';

```

## File: app\utils\performance.ts
```
/**
 * Performance utilities for throttling, debouncing, and optimization
 */

type AnyFunction = (...args: never[]) => void;

/**
 * Throttle function execution to at most once per wait period
 */
export function throttle<T extends AnyFunction>(
    func: T,
    wait: number
): T & { cancel: () => void } {
    let timeout: NodeJS.Timeout | null = null;
    let lastArgs: Parameters<T> | null = null;
    let lastCallTime = 0;

    const throttled = function (this: unknown, ...args: Parameters<T>) {
        const now = Date.now();
        const remaining = wait - (now - lastCallTime);

        if (remaining <= 0 || remaining > wait) {
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }
            lastCallTime = now;
            func.apply(this, args);
        } else {
            lastArgs = args;
            if (!timeout) {
                timeout = setTimeout(() => {
                    lastCallTime = Date.now();
                    timeout = null;
                    if (lastArgs) {
                        func.apply(this, lastArgs);
                        lastArgs = null;
                    }
                }, remaining);
            }
        }
    } as T & { cancel: () => void };

    throttled.cancel = () => {
        if (timeout) {
            clearTimeout(timeout);
            timeout = null;
        }
        lastArgs = null;
    };

    return throttled;
}

/**
 * Debounce function execution until after wait period has elapsed since last call
 */
export function debounce<T extends AnyFunction>(
    func: T,
    wait: number,
    options: { leading?: boolean } = {}
): T & { cancel: () => void } {
    let timeout: NodeJS.Timeout | null = null;
    let lastArgs: Parameters<T> | null = null;

    const debounced = function (this: unknown, ...args: Parameters<T>) {
        lastArgs = args;

        if (options.leading && !timeout) {
            func.apply(this, args);
        }

        if (timeout) {
            clearTimeout(timeout);
        }

        timeout = setTimeout(() => {
            timeout = null;
            if (!options.leading && lastArgs) {
                func.apply(this, lastArgs);
            }
            lastArgs = null;
        }, wait);
    } as T & { cancel: () => void };

    debounced.cancel = () => {
        if (timeout) {
            clearTimeout(timeout);
            timeout = null;
        }
        lastArgs = null;
    };

    return debounced;
}

/**
 * Request animation frame based throttle for scroll/resize handlers
 */
export function rafThrottle<T extends AnyFunction>(
    func: T
): T & { cancel: () => void } {
    let rafId: number | null = null;
    let lastArgs: Parameters<T> | null = null;

    const throttled = function (this: unknown, ...args: Parameters<T>) {
        lastArgs = args;

        if (rafId === null) {
            rafId = requestAnimationFrame(() => {
                rafId = null;
                if (lastArgs) {
                    func.apply(this, lastArgs);
                }
            });
        }
    } as T & { cancel: () => void };

    throttled.cancel = () => {
        if (rafId !== null) {
            cancelAnimationFrame(rafId);
            rafId = null;
        }
        lastArgs = null;
    };

    return throttled;
}

type AnyReturnFunction = (...args: never[]) => unknown;

/**
 * Memoize function results based on arguments
 */
export function memoize<T extends AnyReturnFunction>(
    func: T,
    keyResolver?: (...args: Parameters<T>) => string
): T {
    const cache = new Map<string, unknown>();

    return function (this: unknown, ...args: Parameters<T>) {
        const key = keyResolver ? keyResolver(...args) : JSON.stringify(args);

        if (cache.has(key)) {
            return cache.get(key) as ReturnType<T>;
        }

        const result = func.apply(this, args) as ReturnType<T>;
        cache.set(key, result);
        return result;
    } as T;
}

```

## File: app\utils\playoffUtils.ts
```
import { Match, TeamStats, MatchOverride } from "../types";
import { normalizeTeamName } from "./calculatorUtils";
import { calculateElo } from "./eloCalculator";

export interface PlayoffTeam extends TeamStats {
    elo: number;
    sourceGroup: string;
    position: string;
    initialSeed?: number; // 0-3 for 1st-4th
    scenarioWins?: number;
    scenarioLosses?: number;
    scenarioPlayed?: number;
    scenarioPoints?: number;
    scenarioSetsWon?: number;
    scenarioSetsLost?: number;
}

export interface PlayoffGroup {
    groupName: string;
    teams: PlayoffTeam[];
}

export const SCORES = ['3-0', '3-1', '3-2', '2-3', '1-3', '0-3'];

export interface PlayoffMatch {
    id: string; // e.g., "quarter-A-Team1-Team2"
    homeTeam: string;
    awayTeam: string;
    date: string;
    stage: 'quarter' | 'semi' | 'final';
}

export interface GroupStanding {
    groupName: string;
    first: TeamStats | null;
    second: TeamStats | null;
    teams: TeamStats[]; // Full sorted list for flexible selection (e.g. 1. Lig needs Top 4)
}

// Calculate regular season standings to find 1st and 2nd of each group
export function calculateGroupStandings(teams: TeamStats[]): GroupStanding[] {
    const groups: Record<string, TeamStats[]> = {};
    teams.forEach(t => {
        const gName = t.groupName || "Unknown";
        if (!groups[gName]) groups[gName] = [];
        groups[gName].push(t);
    });

    const standings: GroupStanding[] = [];
    Object.keys(groups).sort().forEach(gName => {
        const sorted = groups[gName].sort((a, b) => b.points - a.points); // Simply points for now
        standings.push({
            groupName: gName,
            first: sorted[0] || null,
            second: sorted[1] || null,
            teams: sorted
        });
    });
    return standings;
}

// Generate Quarter Final Groups (A-H)
export function generateQuarterGroups(standings: GroupStanding[], fixture: Match[]): PlayoffGroup[] {
    const allTeams = standings.flatMap(s => [s.first, s.second].filter(Boolean)) as TeamStats[];
    // Calculate Elo for seeding
    const eloMap = calculateElo(allTeams, fixture);
    const ratings = Object.fromEntries(eloMap);


    const playoffGroupDefs = [
        { name: "A", teamDefs: [{ group: 1, position: 1 }, { group: 16, position: 1 }, { group: 8, position: 2 }, { group: 9, position: 2 }] },
        { name: "B", teamDefs: [{ group: 2, position: 1 }, { group: 15, position: 1 }, { group: 7, position: 2 }, { group: 10, position: 2 }] },
        { name: "C", teamDefs: [{ group: 3, position: 1 }, { group: 14, position: 1 }, { group: 6, position: 2 }, { group: 11, position: 2 }] },
        { name: "D", teamDefs: [{ group: 4, position: 1 }, { group: 13, position: 1 }, { group: 5, position: 2 }, { group: 12, position: 2 }] },
        { name: "E", teamDefs: [{ group: 5, position: 1 }, { group: 12, position: 1 }, { group: 4, position: 2 }, { group: 13, position: 2 }] },
        { name: "F", teamDefs: [{ group: 6, position: 1 }, { group: 11, position: 1 }, { group: 3, position: 2 }, { group: 14, position: 2 }] },
        { name: "G", teamDefs: [{ group: 7, position: 1 }, { group: 10, position: 1 }, { group: 2, position: 2 }, { group: 15, position: 2 }] },
        { name: "H", teamDefs: [{ group: 8, position: 1 }, { group: 9, position: 1 }, { group: 1, position: 2 }, { group: 16, position: 2 }] },
    ];

    const getTeam = (def: { group: number; position: number }): PlayoffTeam | null => {
        const grp = standings.find(s => parseInt(s.groupName.match(/\d+/)?.[0] || "0") === def.group);
        const team = def.position === 1 ? grp?.first : grp?.second;
        if (!team) return null;
        return {
            ...team,
            elo: ratings[team.name] || 1200,
            sourceGroup: `${def.group}. GR`,
            position: `${def.position}.`
        };
    };

    return playoffGroupDefs.map(pg => {
        const teams = pg.teamDefs.map(getTeam).filter(Boolean) as PlayoffTeam[];
        // Assign initial seeds based on the definition order (assuming definitions are ordered 1-4seeds)
        // Actually, teamDefs is just an array. We need to set initialSeed 0..3
        teams.forEach((t, i) => { if (t) t.initialSeed = i; });
        return { groupName: pg.name, teams };
    });
}

// Generate Semi Final Groups (A-D)
export function generateSemiGroups(quarterGroups: PlayoffGroup[]): PlayoffGroup[] {
    const semiDefs = [
        { name: "A", sources: [{ grp: "A", pos: 1 }, { grp: "E", pos: 1 }, { grp: "D", pos: 2 }, { grp: "H", pos: 2 }] },
        { name: "B", sources: [{ grp: "B", pos: 1 }, { grp: "F", pos: 1 }, { grp: "C", pos: 2 }, { grp: "G", pos: 2 }] },
        { name: "C", sources: [{ grp: "C", pos: 1 }, { grp: "G", pos: 1 }, { grp: "B", pos: 2 }, { grp: "F", pos: 2 }] },
        { name: "D", sources: [{ grp: "D", pos: 1 }, { grp: "H", pos: 1 }, { grp: "A", pos: 2 }, { grp: "E", pos: 2 }] },
    ];

    const getTeam = (grpName: string, position: number): PlayoffTeam | null => {
        const qGroup = quarterGroups.find(g => g.groupName === grpName);
        if (!qGroup) return null;
        // IMPORTANT: The caller is responsible for ensuring quarterGroups are sorted by standings!
        const team = qGroup.teams[position - 1];
        if (!team) return null;
        return { ...team, sourceGroup: `ÇF ${grpName}`, position: `${position}.` };
    };

    return semiDefs.map(sd => {
        const teams = sd.sources.map(s => getTeam(s.grp, s.pos)).filter(Boolean) as PlayoffTeam[];
        // Sort removed: Respect definition order for fixture generation
        return { groupName: sd.name, teams };
    });
}

// Generate Final Groups (1-2)
export function generateFinalGroups(semiGroups: PlayoffGroup[]): PlayoffGroup[] {
    const finalDefs = [
        { name: "1", sources: [{ grp: "A", pos: 1 }, { grp: "C", pos: 1 }, { grp: "B", pos: 2 }, { grp: "D", pos: 2 }] },
        { name: "2", sources: [{ grp: "B", pos: 1 }, { grp: "D", pos: 1 }, { grp: "A", pos: 2 }, { grp: "C", pos: 2 }] },
    ];

    const getTeam = (grpName: string, position: number): PlayoffTeam | null => {
        const sGroup = semiGroups.find(g => g.groupName === grpName);
        if (!sGroup) return null;
        const team = sGroup.teams[position - 1];
        if (!team) return null;
        return { ...team, sourceGroup: `YF ${grpName}`, position: `${position}.` };
    };

    return finalDefs.map(fd => {
        const teams = fd.sources.map(s => getTeam(s.grp, s.pos)).filter(Boolean) as PlayoffTeam[];
        // Sort removed: Respect definition order for fixture generation
        return { groupName: fd.name, teams };
    });
}

// ----------------------------------------------------------------------
// 1. LIG SPECIAL LOGIC
// ----------------------------------------------------------------------

// 1. Lig Semi-Finals (I. Group, II. Group)
// I. GRUP: A1, B4, A3, B2
// II. GRUP: B1, A4, B3, A2
export function generate1LigSemiGroups(standings: GroupStanding[]): PlayoffGroup[] {
    const getTeam = (groupName: string, pos: number): PlayoffTeam | null => {
        const grp = standings.find(s => s.groupName === groupName);
        if (!grp || !grp.teams || !grp.teams[pos - 1]) return null;
        const team = grp.teams[pos - 1];
        return { ...team, elo: 1200 + team.points, sourceGroup: `${groupName.charAt(0)}.${pos}`, position: `${pos}.` };
    };

    const semiDefs = [
        { name: "I", sources: [{ grp: "A. Grup", pos: 1 }, { grp: "B. Grup", pos: 4 }, { grp: "A. Grup", pos: 3 }, { grp: "B. Grup", pos: 2 }] },
        { name: "II", sources: [{ grp: "B. Grup", pos: 1 }, { grp: "A. Grup", pos: 4 }, { grp: "B. Grup", pos: 3 }, { grp: "A. Grup", pos: 2 }] },
    ];

    return semiDefs.map(sd => {
        const teams = sd.sources.map(s => getTeam(s.grp, s.pos)).filter(Boolean) as PlayoffTeam[];
        return { groupName: sd.name, teams };
    });
}

// 1. Lig Final (One Group of 4)
// Sources: I. Group 1st, I. Group 2nd, II. Group 1st, II. Group 2nd
export function generate1LigFinalGroups(semiGroups: PlayoffGroup[]): PlayoffGroup[] {
    const getTeam = (grpName: string, position: number): PlayoffTeam | null => {
        const sGroup = semiGroups.find(g => g.groupName === grpName);
        if (!sGroup || !sGroup.teams[position - 1]) return null;
        const team = sGroup.teams[position - 1];
        return { ...team, sourceGroup: `${grpName}. Grup`, position: `${position}.` };
    };

    const finalSources = [
        { grp: "I", pos: 1 },
        { grp: "I", pos: 2 },
        { grp: "II", pos: 1 },
        { grp: "II", pos: 2 }
    ];

    const teams = finalSources.map(s => getTeam(s.grp, s.pos)).filter(Boolean) as PlayoffTeam[];
    return [{ groupName: "Final", teams }];
}

export function generateGroupFixture(groups: PlayoffGroup[], stage: 'quarter' | 'semi' | 'final'): PlayoffMatch[] {
    const matches: PlayoffMatch[] = [];

    groups.forEach(group => {
        // Use initialSeed if available to find the "original" 1st, 2nd, 3rd, 4th team of the group
        // If not available (old data?), fall back to current index, but that's risky if sorted.
        // We will sort by initialSeed to be safe.
        const sorted = [...group.teams].sort((a, b) => (a.initialSeed ?? 0) - (b.initialSeed ?? 0));

        // Ensure we have 4 teams for standard fixture
        // If < 4, we might skip matches. 
        if (sorted.length !== 4) return;

        const [t1, t2, t3, t4] = sorted;

        // Custom seeding/pairing logic 1-4, 2-3
        // Day 1
        matches.push({ id: `${stage}-${group.groupName}-${t1.name}-${t4.name}`, homeTeam: t1.name, awayTeam: t4.name, date: 'G�n 1', stage });
        matches.push({ id: `${stage}-${group.groupName}-${t2.name}-${t3.name}`, homeTeam: t2.name, awayTeam: t3.name, date: 'G�n 1', stage });
        // Day 2
        matches.push({ id: `${stage}-${group.groupName}-${t4.name}-${t2.name}`, homeTeam: t4.name, awayTeam: t2.name, date: 'G�n 2', stage });
        matches.push({ id: `${stage}-${group.groupName}-${t3.name}-${t1.name}`, homeTeam: t3.name, awayTeam: t1.name, date: 'G�n 2', stage });
        // Day 3
        matches.push({ id: `${stage}-${group.groupName}-${t3.name}-${t4.name}`, homeTeam: t3.name, awayTeam: t4.name, date: 'G�n 3', stage });
        matches.push({ id: `${stage}-${group.groupName}-${t1.name}-${t2.name}`, homeTeam: t1.name, awayTeam: t2.name, date: 'G�n 3', stage });
    });

    return matches;
}

// Apply Overrides and Calculate Standings for Playoff Groups
export function applyOverridesToGroups(
    groups: PlayoffGroup[],
    overrides: Record<string, string>,
    stage: string
): PlayoffGroup[] {
    // Generate authoritative fixture to validate overrides
    const validMatches = generateGroupFixture(groups, stage as 'quarter' | 'semi' | 'final');
    const validMatchIds = new Set(validMatches.map(m => m.id));

    return groups.map(group => {
        const teamPoints: Record<string, { wins: number; lost: number; points: number; setsWon: number; setsLost: number; played: number }> = {};

        group.teams.forEach(t => {
            teamPoints[normalizeTeamName(t.name)] = { wins: 0, lost: 0, points: 0, setsWon: 0, setsLost: 0, played: 0 };
        });

        // Loop through all overrides to find matches for this group
        Object.entries(overrides).forEach(([matchId, score]) => {
            // Strict Validation: Ignore any override not in the current valid fixture
            if (!validMatchIds.has(matchId)) return;

            if (!matchId.startsWith(`${stage}-${group.groupName}-`)) return;

            const parts = matchId.split('-');
            const homeTeam = parts[2];
            const awayTeam = parts[3];

            // Normalize names for lookup
            const hKey = normalizeTeamName(homeTeam);
            const aKey = normalizeTeamName(awayTeam);

            if (!teamPoints[hKey] || !teamPoints[aKey]) return;

            const [hSets, aSets] = score.split('-').map(Number);
            const homeWin = hSets > aSets;

            teamPoints[hKey].setsWon += hSets;
            teamPoints[hKey].setsLost += aSets;
            teamPoints[hKey].played += 1;

            teamPoints[aKey].setsWon += aSets;
            teamPoints[aKey].setsLost += hSets;
            teamPoints[aKey].played += 1;

            if (homeWin) {
                teamPoints[hKey].wins++;
                teamPoints[aKey].lost++;
                teamPoints[hKey].points += hSets === 3 && aSets <= 1 ? 3 : 2;
                if (aSets === 2) teamPoints[aKey].points += 1;
            } else {
                teamPoints[aKey].wins++;
                teamPoints[hKey].lost++;
                teamPoints[aKey].points += aSets === 3 && hSets <= 1 ? 3 : 2;
                if (hSets === 2) teamPoints[hKey].points += 1;
            }
        });

        // Update team stats from calculated points
        const updatedTeams = group.teams.map(t => {
            const tKey = normalizeTeamName(t.name);
            return {
                ...t,
                scenarioWins: teamPoints[tKey]?.wins || 0,
                scenarioLosses: teamPoints[tKey]?.lost || 0,
                scenarioPlayed: teamPoints[tKey]?.played || 0,
                scenarioPoints: teamPoints[tKey]?.points || 0,
                scenarioSetsWon: teamPoints[tKey]?.setsWon || 0,
                scenarioSetsLost: teamPoints[tKey]?.setsLost || 0,
            };
        });

        updatedTeams.sort((a, b) => {
            // 1. Total Wins (Galibiyet Say�s�)
            if ((b.scenarioWins || 0) !== (a.scenarioWins || 0)) return (b.scenarioWins || 0) - (a.scenarioWins || 0);

            // 2. Total Points (Puan)
            if ((b.scenarioPoints || 0) !== (a.scenarioPoints || 0)) return (b.scenarioPoints || 0) - (a.scenarioPoints || 0);

            // 3. Set Ratio (Set Averaj�)
            // Calculate ratios - handle 0 division safely
            const getRatio = (won: number, lost: number) => {
                if (lost === 0 && won === 0) return 0; // No games played -> 0 ratio
                if (lost === 0) return 10000; // Infinite ratio (played but never lost set)
                return won / lost;
            };

            const ratioA = getRatio(a.scenarioSetsWon || 0, a.scenarioSetsLost || 0);
            const ratioB = getRatio(b.scenarioSetsWon || 0, b.scenarioSetsLost || 0);

            if (Math.abs(ratioB - ratioA) > 0.0001) return ratioB - ratioA;

            // Fallback to Elo if everything else is tied (Initial state or perfect tie)
            return (b.elo || 0) - (a.elo || 0);
        });

        return { ...group, teams: updatedTeams };
    });
}
// Apply Overrides and Calculate Standings for a linear list of Teams (e.g. Regular Season Group)
export function applyOverridesToTeams(
    teams: TeamStats[],
    overrides: MatchOverride[]
): TeamStats[] {
    // If overrides is empty, return teams as is
    if (!overrides || !Array.isArray(overrides) || overrides.length === 0) {
        return teams;
    }

    const teamPoints: Record<string, { wins: number; lost: number; points: number; setsWon: number; setsLost: number; played: number }> = {};

    // Initialize with existing stats
    teams.forEach(t => {
        teamPoints[t.name] = {
            wins: t.wins,
            lost: t.played - t.wins,
            points: t.points,
            setsWon: t.setsWon,
            setsLost: t.setsLost,
            played: t.played
        };
    });

    // Apply Overrides
    // Expecting overrides to be an array of objects like { home: string, away: string, homeScore: number, awayScore: number }
    // Or simpler if coming from localStorage

    // Assuming the user wants to add 'extra' matches or simulate unplayed matches.
    // However, the `scenarios` from `localStorage` in `GroupPage` are stored as a list of modified Match objects.

    overrides.forEach((match: MatchOverride) => {
        // We only care if the match has a score
        if (!match.homeScore && match.homeScore !== 0) return;

        const homeTeam = match.homeTeam;
        const awayTeam = match.awayTeam;
        const hSets = Number(match.homeScore);
        const aSets = Number(match.awayScore);

        if (!teamPoints[homeTeam] || !teamPoints[awayTeam]) return;

        // Check if this match was already "played" in real life?
        // For simplicity in this "Scenario Page", we might be double counting if we are not careful.
        // But the prompt said "Oyundan gelen puan durumu". usually means "Standings derived from the game inputs".
        // Use case: The user enters predictions for *future* matches.
        // So we should strictly ADD these to the current stats.

        const homeWin = hSets > aSets;

        teamPoints[homeTeam].setsWon += hSets;
        teamPoints[homeTeam].setsLost += aSets;
        teamPoints[homeTeam].played += 1;

        teamPoints[awayTeam].setsWon += aSets;
        teamPoints[awayTeam].setsLost += hSets;
        teamPoints[awayTeam].played += 1;

        if (homeWin) {
            teamPoints[homeTeam].wins++;
            teamPoints[awayTeam].lost++;
            teamPoints[homeTeam].points += hSets === 3 && aSets <= 1 ? 3 : 2;
            if (aSets === 2) teamPoints[awayTeam].points += 1;
        } else {
            teamPoints[awayTeam].wins++;
            teamPoints[homeTeam].lost++;
            teamPoints[awayTeam].points += aSets === 3 && hSets <= 1 ? 3 : 2;
            if (hSets === 2) teamPoints[homeTeam].points += 1;
        }
    });

    return teams.map(t => ({
        ...t,
        wins: teamPoints[t.name]?.wins || t.wins,
        // losses isn't on TeamStats directly, logic handles it via played - wins
        points: teamPoints[t.name]?.points || t.points,
        setsWon: teamPoints[t.name]?.setsWon || t.setsWon,
        setsLost: teamPoints[t.name]?.setsLost || t.setsLost,
        played: teamPoints[t.name]?.played || t.played,
    }));
}

```

## File: app\utils\rateLimit.ts
```
import { NextRequest, NextResponse } from 'next/server';

interface RateLimitConfig {
    requests: number;
    windowMs: number; // in milliseconds
}

const rateLimits = new Map<string, { count: number; resetTime: number }>();

/**
 * Simple in-memory rate limiter
 * For production, use external service like Upstash Redis
 */
export function createRateLimiter(config: RateLimitConfig) {
    return function rateLimit(req: NextRequest): NextResponse | null {
        const identifier = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'anonymous';
        const key = `${identifier}:${req.nextUrl.pathname}`;
        const now = Date.now();

        const limit = rateLimits.get(key);

        if (!limit || now > limit.resetTime) {
            // New window or expired
            rateLimits.set(key, {
                count: 1,
                resetTime: now + config.windowMs
            });
            return null; // Allow
        }

        if (limit.count >= config.requests) {
            return NextResponse.json(
                { error: 'Çok fazla istek. Lütfen daha sonra tekrar deneyin.' },
                {
                    status: 429,
                    headers: {
                        'Retry-After': String(Math.ceil((limit.resetTime - now) / 1000))
                    }
                }
            );
        }

        limit.count++;
        return null; // Allow
    };
}

/**
 * API route rate limiting middleware
 * Usage in API routes:
 * 
 * const rateLimiter = createRateLimiter({ requests: 10, windowMs: 60000 });
 * 
 * export async function POST(req) {
 *     const limitResponse = rateLimiter(req);
 *     if (limitResponse) return limitResponse;
 *     
 *     // ... rest of handler
 * }
 */

// Auto-cleanup interval reference
let cleanupInterval: NodeJS.Timeout | null = null;

/**
 * Cleanup old entries periodically
 * Automatically starts on first rateLimiter use
 */
export function startRateLimitCleanup(intervalMs = 60000) {
    // Prevent multiple intervals
    if (cleanupInterval) return;

    cleanupInterval = setInterval(() => {
        const now = Date.now();
        for (const [key, limit] of rateLimits.entries()) {
            if (now > limit.resetTime) {
                rateLimits.delete(key);
            }
        }
    }, intervalMs);

    // Don't block Node.js from exiting
    if (cleanupInterval.unref) {
        cleanupInterval.unref();
    }
}

// Auto-start cleanup when module is loaded
// Auto-start cleanup when module is loaded
if (typeof window === 'undefined') {
    startRateLimitCleanup();
}

// Export a direct check function for use in middleware
export async function checkRateLimit(identifier: string, limit: number, windowMs: number): Promise<{ success: boolean; retryAfter?: number }> {
    const key = `${identifier}`;
    const now = Date.now();
    const entry = rateLimits.get(key);

    if (!entry || now > entry.resetTime) {
        rateLimits.set(key, {
            count: 1,
            resetTime: now + windowMs
        });
        return { success: true };
    }

    if (entry.count >= limit) {
        return {
            success: false,
            retryAfter: Math.ceil((entry.resetTime - now) / 1000)
        };
    }

    entry.count++;
    return { success: true };
}


```

## File: app\utils\scenarioUtils.ts
```
import { TeamStats } from "../types";

export interface TeamDiff {
    name: string;
    rankDiff: number;   // e.g. +2 (rose 2 spots), -1 (fell 1 spot)
    pointDiff: number;  // e.g. +3 points
    winDiff: number;
}

export function compareStandings(baseStandings: TeamStats[], targetStandings: TeamStats[]): TeamDiff[] {
    const baseMap = new Map<string, { rank: number, stats: TeamStats }>();
    baseStandings.forEach((t, i) => baseMap.set(t.name, { rank: i + 1, stats: t }));

    const diffs: TeamDiff[] = [];

    targetStandings.forEach((t, i) => {
        const currentRank = i + 1;
        const base = baseMap.get(t.name);

        if (base) {
            // Rank Diff: oldRank - newRank. 
            // If old was 5 and new is 3, diff is 5-3 = 2 (Positive means improvement)
            const rankDiff = base.rank - currentRank;
            const pointDiff = t.points - base.stats.points;
            const winDiff = t.wins - base.stats.wins;

            diffs.push({
                name: t.name,
                rankDiff,
                pointDiff,
                winDiff
            });
        }
    });

    return diffs;
}

```

## File: app\utils\serverData.ts
```
import fs from 'fs';
import path from 'path';
import { TeamStats, Match } from '../types';
import { createServiceRoleClient } from './supabase-server';
import { getOutcomeFromScore, sortStandings } from './calculatorUtils';

export interface LeagueData {
    teams: TeamStats[];
    fixture: Match[];
}

export async function getLeagueData(league: string): Promise<LeagueData> {
    try {
        const filePath = path.join(process.cwd(), 'data', `${league}-data.json`);
        if (!fs.existsSync(filePath)) {
            console.error(`Data file not found: ${filePath}`);
            return { teams: [], fixture: [] };
        }

        const content = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(content);

        // Filter out withdrawn teams (ligden çekilen takımlar)
        // Filter out withdrawn teams (ligden çekilen takımlar)
        if (league === '1lig') {
            const withdrawnTeams = ['Edremit Bld. Altınoluk', 'İzmirspor'];
            if (data.teams) {
                data.teams = data.teams.filter((t: TeamStats) => !withdrawnTeams.includes(t.name));
            }
            const filterMatches = (matches: Match[]) => matches.filter((m: Match) =>
                !withdrawnTeams.includes(m.homeTeam) && !withdrawnTeams.includes(m.awayTeam)
            );
            if (data.fixture) data.fixture = filterMatches(data.fixture);
            if (data.matches) data.matches = filterMatches(data.matches);
        }

        // Rename CEV CL teams
        if (league === 'cev-cl') {
            const teamNameMapping: Record<string, string> = {
                'VakifBank ISTANBUL': 'VAKIFBANK',
                'Fenerbahçe Medicana ISTANBUL': 'FENERBAHÇE MEDICANA',
                'Eczacibasi ISTANBUL': 'ECZACIBAŞI DYNAVİT',
                'ANKARA Zeren Spor Kulübü': 'ZEREN SPOR'
            };

            const renameTeam = (name: string) => teamNameMapping[name] || name;

            if (data.teams) {
                data.teams = data.teams.map((t: TeamStats) => ({
                    ...t,
                    name: renameTeam(t.name)
                }));
            }

            const renameMatches = (matches: Match[]) => matches.map((m: Match) => ({
                ...m,
                homeTeam: renameTeam(m.homeTeam),
                awayTeam: renameTeam(m.awayTeam)
            }));

            if (data.fixture) data.fixture = renameMatches(data.fixture);
            if (data.matches) data.matches = renameMatches(data.matches);
        }

        // Normalize fixture data
        let fixture = (data.fixture || data.matches || []).map((m: Match & { date?: string }) => ({
            ...m,
            matchDate: m.matchDate || m.date
        }));

        // 2. Fetch database overrides (Admin verified results)
        try {
            const supabase = createServiceRoleClient();

            // Map league names to match how they are stored in DB (Sultanlar Ligi vs vsl)
            const leagueDbMap: Record<string, string> = {
                'vsl': 'Sultanlar Ligi',
                '1lig': '1. Lig',
                '2lig': '2. Lig',
                'cev-cl': 'Şampiyonlar Ligi'
            };

            const dbLeagueName = leagueDbMap[league] || league;

            const { data: dbResults } = await supabase
                .from('match_results')
                .select('*')
                .eq('league', dbLeagueName)
                .eq('is_verified', true);

            if (dbResults && dbResults.length > 0) {
                // console.log(`[getLeagueData] Found ${dbResults.length} database overrides for ${league}`);

                // Create a map for easy lookup
                const overridesMap = new Map();
                // We use homeTeam-awayTeam or other consistent key
                dbResults.forEach(res => {
                    const key = `${res.home_team}-${res.away_team}`;
                    overridesMap.set(key, res.result_score);
                });

                // Apply overrides to fixture
                let statsChanged = false;
                fixture = fixture.map((m: Match) => {
                    const key = `${m.homeTeam}-${m.awayTeam}`;
                    if (overridesMap.has(key)) {
                        const newScore = overridesMap.get(key);
                        if (m.resultScore !== newScore) {
                            statsChanged = true;
                            return {
                                ...m,
                                isPlayed: true,
                                resultScore: newScore
                            };
                        }
                    }
                    return m;
                });

                // 3. Recalculate standings if overrides applied
                if (statsChanged) {
                    // Start from scratch for correctness
                    const newTeams: Record<string, TeamStats> = {};
                    (data.teams || []).forEach((t: TeamStats) => {
                        newTeams[t.name] = { ...t, played: 0, wins: 0, points: 0, setsWon: 0, setsLost: 0 };
                    });

                    fixture.forEach((m: Match) => {
                        if (m.isPlayed && m.resultScore) {
                            const outcome = getOutcomeFromScore(m.resultScore);
                            if (outcome && newTeams[m.homeTeam] && newTeams[m.awayTeam]) {
                                const h = newTeams[m.homeTeam];
                                const a = newTeams[m.awayTeam];

                                h.played++;
                                h.points += outcome.homePoints;
                                h.setsWon += outcome.homeSets;
                                h.setsLost += outcome.awaySets;
                                if (outcome.homeWin) h.wins++;

                                a.played++;
                                a.points += outcome.awayPoints;
                                a.setsWon += outcome.awaySets;
                                a.setsLost += outcome.homeSets;
                                if (!outcome.homeWin) a.wins++;
                            }
                        }
                    });

                    // Update teams and sort (preserve group structure if possible, though calculateStandings might need to know groups)
                    // For now, let's just return the recalculated list sorted
                    const finalTeams = sortStandings(Object.values(newTeams));
                    return { teams: finalTeams, fixture };
                }
            }
        } catch (dbError) {
            console.error(`[getLeagueData] Database override fetch failed for ${league}:`, dbError);
            // Fallback to JSON only
        }

        // console.log(`[getLeagueData] Returning ${data.teams?.length} teams for ${league} (Fallback/Normal)`);
        return {
            teams: data.teams || [],
            fixture: fixture
        };
    } catch (error) {
        console.error(`Error reading ${league} data:`, error);
        return { teams: [], fixture: [] };
    }
}

```

## File: app\utils\sounds.ts
```
// Sound effect utilities for gamification
"use client";

// Sound file paths
const SOUNDS = {
    click: '/sounds/click.mp3',
    scoreSelect: '/sounds/score-select.mp3',
    achievement: '/sounds/achievement.mp3',
    levelUp: '/sounds/levelup.mp3',
    victory: '/sounds/victory.mp3',
} as const;

type SoundName = keyof typeof SOUNDS;

// Audio cache to prevent reloading
const audioCache: Map<SoundName, HTMLAudioElement> = new Map();

// Check if sound is enabled from localStorage
function isSoundEnabled(): boolean {
    if (typeof window === 'undefined') return true;
    try {
        const state = localStorage.getItem('volleySimGameState');
        if (state) {
            const parsed = JSON.parse(state);
            return parsed.soundEnabled !== false;
        }
    } catch {
        return true;
    }
    return true;
}

// Preload all sounds
export function preloadSounds(): void {
    if (typeof window === 'undefined') return;

    Object.entries(SOUNDS).forEach(([name, path]) => {
        const audio = new Audio(path);
        audio.preload = 'auto';
        audio.volume = 0.5;
        audioCache.set(name as SoundName, audio);
    });
}

// Play a sound effect
export function playSound(name: SoundName, volume = 0.5): void {
    if (typeof window === 'undefined') return;
    if (!isSoundEnabled()) return;

    try {
        // Get cached audio or create new
        let audio = audioCache.get(name);

        if (!audio) {
            const path = SOUNDS[name];
            if (!path) return;
            audio = new Audio(path);
            audioCache.set(name, audio);
        }

        // Clone to allow overlapping sounds
        const clone = audio.cloneNode() as HTMLAudioElement;
        clone.volume = volume;
        clone.play().catch(() => {
            // Silently fail if autoplay is blocked
        });
    } catch {
        // Silently fail
    }
}

// Specific sound functions for convenience
export const sounds = {
    click: () => playSound('click', 0.3),
    scoreSelect: () => playSound('scoreSelect', 0.4),
    achievement: () => playSound('achievement', 0.6),
    levelUp: () => playSound('levelUp', 0.7),
    victory: () => playSound('victory', 0.5),
};

```

## File: app\utils\supabase-server.ts
```
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export async function createServerSupabaseClient() {
    const cookieStore = await cookies();

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
                set(name: string, value: string, options: CookieOptions) {
                    try {
                        cookieStore.set({ name, value, ...options });
                    } catch (error) {
                        // Handle errors in server components
                    }
                },
                remove(name: string, options: CookieOptions) {
                    try {
                        cookieStore.set({ name, value: '', ...options });
                    } catch (error) {
                        // Handle errors in server components
                    }
                },
            },
        }
    );
}

// Service role client for admin operations (bypasses RLS)
// Service role client for admin operations (bypasses RLS)
export function createServiceRoleClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
        throw new Error('Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) are missing.');
    }

    return createClient(url, key, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
    );
}

```

## File: app\utils\supabase.ts
```
import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

// Check if Supabase is properly configured
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

let supabaseClient: SupabaseClient | null = null;

export function createClient(): SupabaseClient | null {
    // Only create client in browser environment
    if (typeof window === 'undefined') {
        return null;
    }

    if (!isSupabaseConfigured) {
        return null;
    }

    if (!supabaseClient) {
        supabaseClient = createBrowserClient(supabaseUrl!, supabaseAnonKey!);
    }

    return supabaseClient;
}

```

## File: app\utils\team-themes.ts
```
export interface TeamTheme {
    primary: string;
    secondary: string;
    accent: string;
    logo?: string;
}

export const TEAM_THEMES: Record<string, TeamTheme> = {
    "VakıfBank": {
        primary: "#ffcc00", // Gold
        secondary: "#000000", // Black
        accent: "#ffdd44"
    },
    "Eczacıbaşı Dynavit": {
        primary: "#ff6600", // Orange
        secondary: "#ffffff",
        accent: "#ff8844"
    },
    "Fenerbahçe Medicana": {
        primary: "#003366", // Navy
        secondary: "#ffed00", // Yellow
        accent: "#004488"
    },
    "Türk Hava Yolları": {
        primary: "#cc0000", // Red
        secondary: "#ffffff",
        accent: "#ee0000"
    },
    "Galatasaray Daikin": {
        primary: "#800000", // Maroon
        secondary: "#ffcc00", // Gold
        accent: "#a00000"
    },
    "Kuzeyboru": {
        primary: "#000000",
        secondary: "#ffffff",
        accent: "#333333"
    },
    "Zeren Spor": {
        primary: "#004488",
        secondary: "#ffffff",
        accent: "#0066aa"
    },
    "Aydın B.Ş.B.": {
        primary: "#003399",
        secondary: "#ffffff",
        accent: "#0055bb"
    },
    "Aras Kargo": {
        primary: "#ee3322",
        secondary: "#ffffff",
        accent: "#ff4433"
    },
    "Beşiktaş": {
        primary: "#000000",
        secondary: "#ffffff",
        accent: "#333333"
    },
    "Nilüfer Bld.": {
        primary: "#0066ff",
        secondary: "#ffffff",
        accent: "#3388ff"
    },
    "Sigorta Shop": {
        primary: "#ff0066",
        secondary: "#ffffff",
        accent: "#ff3388"
    },
    "Sarıyer Bld.": {
        primary: "#22aa44",
        secondary: "#ffffff",
        accent: "#33bb55"
    },
    "Bahçelievler Bld.": {
        primary: "#0088cc",
        secondary: "#ffffff",
        accent: "#22aacc"
    }
};

export const DEFAULT_THEME: TeamTheme = {
    primary: "#10b981", // Emerald
    secondary: "#0f172a", // Slate 900
    accent: "#34d399"
};

export function getTeamTheme(teamName: string | null): TeamTheme {
    if (!teamName) return DEFAULT_THEME;
    return TEAM_THEMES[teamName] || DEFAULT_THEME;
}

```

## File: app\utils\teamIds.ts (SKIPPED - TOO LARGE)

## File: app\utils\teamSlug.ts
```
/**
 * Team Slug Utility
 * Generates URL-safe slugs from team names and provides reverse lookup
 */

// Turkish character normalization map
const turkishCharMap: Record<string, string> = {
    'ş': 's', 'Ş': 'S',
    'ğ': 'g', 'Ğ': 'G',
    'ü': 'u', 'Ü': 'U',
    'ö': 'o', 'Ö': 'O',
    'ç': 'c', 'Ç': 'C',
    'ı': 'i', 'İ': 'I',
};

// Store for reverse lookup (populated as teams are encountered)
const slugToNameMap = new Map<string, string>();

/**
 * Normalize Turkish characters to ASCII equivalents
 */
function normalizeTurkish(str: string): string {
    return str.split('').map(char => turkishCharMap[char] || char).join('');
}

/**
 * Generate a URL-safe slug from a team name
 * Example: "Fenerbahçe Medicana" -> "fenerbahce-medicana"
 */
export function generateTeamSlug(teamName: string): string {
    const normalized = normalizeTurkish(teamName);
    const slug = normalized
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
        .replace(/\s+/g, '-')          // Replace spaces with hyphens
        .replace(/-+/g, '-')           // Remove consecutive hyphens
        .replace(/^-|-$/g, '');        // Remove leading/trailing hyphens

    // Store for reverse lookup
    slugToNameMap.set(slug, teamName);

    return slug;
}

/**
 * Get the original team name from a slug
 * Returns null if the slug hasn't been registered
 */
export function getTeamNameFromSlug(slug: string): string | null {
    return slugToNameMap.get(slug) || null;
}

/**
 * Register a team name for reverse lookup without generating a new slug
 * Useful for pre-populating the map with known teams
 */
export function registerTeamSlug(teamName: string): void {
    generateTeamSlug(teamName);
}

/**
 * Check if a slug is registered
 */
export function isSlugRegistered(slug: string): boolean {
    return slugToNameMap.has(slug);
}

```

## File: app\utils\useFetch.ts
```
"use client";

import { useCallback, useState } from "react";

interface FetchOptions extends RequestInit {
    retries?: number;
    retryDelay?: number;
}

interface UseFetchReturn<T> {
    data: T | null;
    error: string | null;
    loading: boolean;
    execute: (url: string, options?: FetchOptions) => Promise<T | null>;
    retry: () => Promise<T | null>;
}

/**
 * Custom hook for data fetching with automatic retry and error handling.
 * 
 * @example
 * const { data, error, loading, execute, retry } = useFetch<TeamStats[]>();
 * 
 * useEffect(() => {
 *   execute('/api/scrape');
 * }, []);
 */
export function useFetch<T>(): UseFetchReturn<T> {
    const [data, setData] = useState<T | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [lastRequest, setLastRequest] = useState<{ url: string; options?: FetchOptions } | null>(null);

    const execute = useCallback(async (url: string, options?: FetchOptions): Promise<T | null> => {
        const { retries = 3, retryDelay = 1000, ...fetchOptions } = options || {};

        setLoading(true);
        setError(null);
        setLastRequest({ url, options });

        let lastError: Error | null = null;

        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const fullUrl = (apiUrl && url.startsWith('/api'))
            ? url.replace('/api', apiUrl)
            : url;

        for (let attempt = 0; attempt <= retries; attempt++) {
            try {
                const response = await fetch(fullUrl, fetchOptions);

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const result = await response.json();
                setData(result);
                setLoading(false);
                return result;
            } catch (err) {
                lastError = err instanceof Error ? err : new Error(String(err));

                if (attempt < retries) {
                    // Wait before retrying
                    await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
                }
            }
        }

        // All retries failed
        const errorMessage = lastError?.message || "Bilinmeyen hata";
        setError(errorMessage);
        setLoading(false);
        return null;
    }, []);

    const retry = useCallback(async (): Promise<T | null> => {
        if (!lastRequest) return null;
        return execute(lastRequest.url, lastRequest.options);
    }, [lastRequest, execute]);

    return { data, error, loading, execute, retry };
}

/**
 * Simple fetch wrapper with retry logic.
 * For use outside of React components.
 */
export async function fetchWithRetry<T>(
    url: string,
    options?: FetchOptions
): Promise<{ data: T | null; error: string | null }> {
    const { retries = 3, retryDelay = 1000, ...fetchOptions } = options || {};

    let lastError: Error | null = null;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const fullUrl = (apiUrl && url.startsWith('/api'))
        ? url.replace('/api', apiUrl)
        : url;

    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const response = await fetch(fullUrl, fetchOptions);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            return { data, error: null };
        } catch (err) {
            lastError = err instanceof Error ? err : new Error(String(err));

            if (attempt < retries) {
                await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
            }
        }
    }

    return { data: null, error: lastError?.message || "Bilinmeyen hata" };
}

```

