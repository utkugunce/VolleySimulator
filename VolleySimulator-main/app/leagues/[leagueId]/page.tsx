import { notFound } from 'next/navigation';
import { getLeagueConfig, LEAGUE_IDS } from '@/lib/config/leagues';
import LeagueStandingsClient from '@/app/components/league/LeagueStandingsClient';
import { promises as fs } from 'fs';
import path from 'path';

export function generateStaticParams() {
  return LEAGUE_IDS.map((leagueId) => ({ leagueId }));
}

async function getLeagueData(dataFile: string) {
  const filePath = path.join(process.cwd(), 'data', dataFile);
  const fileContents = await fs.readFile(filePath, 'utf8');
  return JSON.parse(fileContents);
}

export default async function LeagueDashboardPage({
  params,
}: {
  params: Promise<{ leagueId: string }>;
}) {
  const { leagueId } = await params;
  const config = getLeagueConfig(leagueId);

  if (!config) {
    notFound();
  }

  const data = await getLeagueData(config.dataFile);

  return (
    <LeagueStandingsClient 
      leagueConfig={config}
      initialTeams={data.teams || []}
      initialMatches={data.fixture || []}
    />
  );
}
