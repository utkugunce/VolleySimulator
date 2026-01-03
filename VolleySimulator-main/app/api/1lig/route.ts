import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Revalidate every 5 minutes
export const revalidate = 300;

export async function GET(req: NextRequest) {
    try {
        // Read the 1. Lig data from local JSON file
        const dataPath = path.join(process.cwd(), 'data', '1lig-data.json');
        const jsonData = fs.readFileSync(dataPath, 'utf-8');
        const data = JSON.parse(jsonData);

        // Filter out withdrawn teams (ligden çekilen takımlar)
        const withdrawnTeams = ['Edremit Bld. Altınoluk', 'İzmirspor'];

        data.teams = data.teams.filter((team: any) => !withdrawnTeams.includes(team.name));
        data.fixture = data.fixture.filter((match: any) =>
            !withdrawnTeams.includes(match.homeTeam) && !withdrawnTeams.includes(match.awayTeam)
        );

        // Return with cache headers
        return NextResponse.json(data, {
            headers: {
                'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
            }
        });
    } catch (error) {
        console.error('Error reading 1. Lig data:', error);
        return NextResponse.json(
            { error: 'Failed to load 1. Lig data' },
            { status: 500 }
        );
    }
}
