import { notFound } from 'next/navigation';
import { getLeagueConfig, LEAGUE_IDS } from '@/lib/config/leagues';
import LeaguePlayoffsClient from '@/app/components/league/LeaguePlayoffsClient';
import { promises as fs } from 'fs';
import path from 'path';

export function generateStaticParams() {
  return LEAGUE_IDS.filter((id) => {
    const config = getLeagueConfig(id);
    return config?.hasPlayoffs;
  }).map((leagueId) => ({ leagueId }));
}

async function getLeagueData(dataFile: string) {
  const filePath = path.join(process.cwd(), 'data', dataFile);
  const fileContents = await fs.readFile(filePath, 'utf8');
  return JSON.parse(fileContents);
}

export default async function PlayoffsPage({
  params,
}: {
  params: Promise<{ leagueId: string }>;
}) {
  const { leagueId } = await params;
  const config = getLeagueConfig(leagueId);

  if (!config || !config.hasPlayoffs) {
    notFound();
  }

  const data = await getLeagueData(config.dataFile);

  return (
    <LeaguePlayoffsClient 
      leagueConfig={config}
      teams={data.teams || []}
      playoffs={data.playoffs}
    />
  );
}
