'use client';

import { TeamStats, Match } from '@/app/types';
import { LeagueConfig, THEME_COLORS } from '@/lib/config/leagues';
import CalculatorTemplate from '@/app/components/LeagueTemplate/CalculatorTemplate';

interface LeagueCalculatorClientProps {
  leagueConfig: LeagueConfig;
  initialTeams: TeamStats[];
  initialMatches: Match[];
}

export default function LeagueCalculatorClient({
  leagueConfig,
  initialTeams,
  initialMatches,
}: LeagueCalculatorClientProps) {
  // LeagueConfig'i CalculatorTemplate'in beklediği formata dönüştür
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
    <CalculatorTemplate
      config={templateConfig}
      initialTeams={initialTeams}
      initialMatches={initialMatches}
    />
  );
}
