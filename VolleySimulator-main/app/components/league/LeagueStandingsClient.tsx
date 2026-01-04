'use client';

import { useMemo } from 'react';
import { TeamStats, Match } from '@/app/types';
import { LeagueConfig, getLeagueThemeColors, THEME_COLORS } from '@/lib/config/leagues';
import StandingsTable from '@/app/components/Calculator/StandingsTable';
import { sortStandings } from '@/app/utils/calculatorUtils';
import LeagueActionBar from '@/app/components/LeagueTemplate/LeagueActionBar';
import TeamAvatar from '@/app/components/TeamAvatar';

interface LeagueStandingsClientProps {
  leagueConfig: LeagueConfig;
  initialTeams: TeamStats[];
  initialMatches: Match[];
}

export default function LeagueStandingsClient({
  leagueConfig,
  initialTeams,
  initialMatches,
}: LeagueStandingsClientProps) {
  const themeColors = THEME_COLORS[leagueConfig.theme];
  
  const teams = useMemo(() => sortStandings(initialTeams), [initialTeams]);
  const matches = useMemo(
    () =>
      initialMatches.map((m: Match & { date?: string }) => ({
        ...m,
        matchDate: m.date || m.matchDate,
      })),
    [initialMatches]
  );

  const playedCount = matches.filter((m) => m.isPlayed).length;
  const totalCount = matches.length;
  const completionRate = totalCount > 0 ? Math.round((playedCount / totalCount) * 100) : 0;

  // Grupları belirle
  const groups = useMemo(() => {
    if (!leagueConfig.hasGroups) return [];
    const uniqueGroups = [...new Set(teams.map((t) => t.groupName))];
    return uniqueGroups.sort();
  }, [teams, leagueConfig.hasGroups]);

  // Gruba göre takımları filtrele
  const getTeamsByGroup = (groupName: string) => {
    return teams.filter((t) => t.groupName === groupName);
  };

  // Yaklaşan maçları grupla
  const dayNames = ['PAZAR', 'PAZARTESİ', 'SALI', 'ÇARŞAMBA', 'PERŞEMBE', 'CUMA', 'CUMARTESİ'];

  const formatDate = (dateStr?: string) => {
    if (!dateStr || dateStr.trim() === '') return { formatted: 'TARİH BELİRSİZ', sortKey: '9999-99-99' };
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return { formatted: 'TARİH BELİRSİZ', sortKey: '9999-99-99' };
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const dayName = dayNames[date.getDay()];
      return { formatted: `${day}/${month}/${year} ${dayName}`, sortKey: dateStr };
    } catch {
      return { formatted: 'TARİH BELİRSİZ', sortKey: '9999-99-99' };
    }
  };

  const groupedMatches = useMemo(() => {
    const matchesByDate: Record<string, { formatted: string; matches: Match[] }> = {};
    const upcomingMatches = matches.filter((m) => !m.isPlayed);

    upcomingMatches.forEach((match) => {
      const { formatted, sortKey } = formatDate(match.matchDate);
      if (!matchesByDate[sortKey]) {
        matchesByDate[sortKey] = { formatted, matches: [] };
      }
      matchesByDate[sortKey].matches.push(match);
    });

    const sortedDates = Object.keys(matchesByDate).sort();
    return sortedDates.reduce(
      (acc, dateKey) => {
        acc[matchesByDate[dateKey].formatted] = matchesByDate[dateKey].matches;
        return acc;
      },
      {} as Record<string, Match[]>
    );
  }, [matches]);

  return (
    <main className="min-h-screen text-slate-100 p-0 sm:p-2 font-sans overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-1 h-full flex flex-col">
        <div className="space-y-3 bg-slate-900/40 p-3 rounded-2xl border border-slate-800/60 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Action Bar */}
          <LeagueActionBar
            config={{
              id: leagueConfig.id,
              name: leagueConfig.name,
              shortName: leagueConfig.shortName,
              subtitle: leagueConfig.subtitle,
              theme: leagueConfig.theme,
              apiEndpoint: leagueConfig.apiEndpoint,
              storageKey: leagueConfig.storageKey,
              hasGroups: leagueConfig.hasGroups,
              hasRounds: leagueConfig.hasRounds,
            }}
            title={leagueConfig.name}
            subtitle={`${leagueConfig.subtitle} - Puan Durumu`}
            progress={completionRate}
            progressLabel={`%${completionRate}`}
          >
            {/* Leader Badge */}
            {teams[0] && (
              <div className="hidden sm:flex bg-slate-950/50 px-3 py-1.5 rounded-lg border border-slate-800 text-center flex-col justify-center h-full min-h-[32px]">
                <div className="text-[9px] font-bold text-slate-500 uppercase leading-none mb-0.5">
                  Lider
                </div>
                <div className="text-xs font-bold text-white truncate max-w-[100px] leading-none">
                  {teams[0]?.name}
                </div>
              </div>
            )}
            {/* Live Badge */}
            <div className="px-3 h-8 bg-emerald-950/50 rounded-lg border border-emerald-800/50 flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-bold text-emerald-400 uppercase hidden sm:inline">
                Otomatik Güncelleme
              </span>
              <span className="text-[10px] font-bold text-emerald-400 uppercase sm:hidden">CANLI</span>
            </div>
          </LeagueActionBar>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
            {/* Puan Tablosu */}
            <div className="lg:col-span-2 space-y-4 flex flex-col h-full">
              {leagueConfig.hasGroups && groups.length > 0 ? (
                // Gruplu ligler için her grubu ayrı göster
                groups.map((groupName) => (
                  <div key={groupName} className="space-y-2">
                    <h3 className={`text-sm font-bold ${themeColors.text} uppercase tracking-widest flex items-center gap-2 px-1`}>
                      <span>📋</span> {groupName}
                    </h3>
                    <div className="bg-slate-950/40 rounded-xl overflow-hidden border border-slate-800/50">
                      <StandingsTable
                        teams={getTeamsByGroup(groupName)}
                        playoffSpots={leagueConfig.playoffSpots || 4}
                        secondaryPlayoffSpots={leagueConfig.secondaryPlayoffSpots || 0}
                        relegationSpots={leagueConfig.relegationSpots || 2}
                      />
                    </div>
                  </div>
                ))
              ) : (
                // Tek gruplu ligler
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                    <span>📋</span> Puan Durumu
                  </h3>
                  <div className="bg-slate-950/40 rounded-xl overflow-hidden border border-slate-800/50 flex-1 max-h-[calc(100vh-200px)]">
                    <StandingsTable
                      teams={teams}
                      playoffSpots={leagueConfig.playoffSpots || 4}
                      secondaryPlayoffSpots={leagueConfig.secondaryPlayoffSpots || 0}
                      relegationSpots={leagueConfig.relegationSpots || 2}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Yaklaşan Maçlar */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                <span>📅</span> Yaklaşan Maçlar
              </h3>
              <div className="bg-slate-950/40 rounded-xl border border-slate-800/50 p-3 max-h-[calc(100vh-200px)] overflow-y-auto">
                {Object.keys(groupedMatches).length === 0 ? (
                  <p className="text-slate-500 text-sm text-center py-8">
                    Yaklaşan maç bulunmuyor
                  </p>
                ) : (
                  Object.entries(groupedMatches)
                    .slice(0, 5)
                    .map(([dateStr, dateMatches]) => (
                      <div key={dateStr} className="mb-4 last:mb-0">
                        <div className="text-[10px] font-bold text-slate-500 uppercase mb-2 flex items-center gap-2">
                          <div className={`w-1 h-3 ${themeColors.solid} rounded-full`}></div>
                          {dateStr}
                        </div>
                        <div className="space-y-2">
                          {dateMatches.map((match, idx) => (
                            <div
                              key={`${match.homeTeam}-${match.awayTeam}-${idx}`}
                              className="bg-slate-900/50 rounded-lg p-2 border border-slate-800/50 hover:border-slate-700 transition-colors"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  <TeamAvatar name={match.homeTeam} size="sm" />
                                  <span className="text-xs font-medium text-white truncate">
                                    {match.homeTeam}
                                  </span>
                                </div>
                                <span className="text-[10px] text-slate-500 px-2">vs</span>
                                <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                                  <span className="text-xs font-medium text-white truncate text-right">
                                    {match.awayTeam}
                                  </span>
                                  <TeamAvatar name={match.awayTeam} size="sm" />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
