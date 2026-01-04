'use client';

import { TeamStats, Match } from '@/app/types';
import { LeagueConfig } from '@/lib/config/leagues';
import StatsTemplate from '@/app/components/LeagueTemplate/StatsTemplate';

interface LeagueStatsClientProps {
  leagueConfig: LeagueConfig;
  teams: TeamStats[];
  matches: Match[];
}

export default function LeagueStatsClient({
  leagueConfig,
  teams,
  matches,
}: LeagueStatsClientProps) {
  // LeagueConfig'i StatsTemplate'in beklediği formata dönüştür
  const templateConfig = {
    id: leagueConfig.id,
    name: leagueConfig.name,
    shortName: leagueConfig.shortName,
    subtitle: leagueConfig.subtitle,
    theme: leagueConfig.theme,
    apiEndpoint: leagueConfig.apiEndpoint,
    storageKey: leagueConfig.storageKey,
    hasGroups: leagueConfig.hasGroups,
    groups: leagueConfig.groups,
    hasRounds: leagueConfig.hasRounds,
    rounds: leagueConfig.rounds,
    playoffSpots: leagueConfig.playoffSpots,
    secondaryPlayoffSpots: leagueConfig.secondaryPlayoffSpots,
    relegationSpots: leagueConfig.relegationSpots,
  };

  return (
    <StatsTemplate
      config={templateConfig}
      initialTeams={teams}
      initialMatches={matches}
    />
  );
}
