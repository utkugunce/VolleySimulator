import { NextRequest, NextResponse } from 'next/server';
import { calculateElo } from '../../../utils/eloCalculator';
import { TeamStats, Match } from '../../../types';

export async function POST(req: NextRequest) {
    try {
        // No Authentication Required (Public Simulation)

        const body = await req.json();
        const { teams, upcomingMatches, allMatches } = body;

        if (!teams || teams.length === 0) {
            return NextResponse.json({ error: 'Missing match data' }, { status: 400 });
        }

        // Calculate Elo using the utility function
        const eloMap = calculateElo(teams as TeamStats[], allMatches as Match[]);
        const predictions: Record<string, string> = {};

        for (const m of (upcomingMatches as Match[])) {
            let hElo = eloMap.get(m.homeTeam) || 1200;
            let aElo = eloMap.get(m.awayTeam) || 1200;

            const expectedHome = 1.0 / (1.0 + Math.pow(10, (aElo - hElo) / 400.0));
            let score = "3-2";

            if (expectedHome > 0.85) {
                score = "3-0";
            } else if (expectedHome > 0.70) {
                score = "3-1";
            } else if (expectedHome > 0.55) {
                score = "3-2";
            } else if (expectedHome < 0.15) {
                score = "0-3";
            } else if (expectedHome < 0.30) {
                score = "1-3";
            } else if (expectedHome < 0.45) {
                score = "2-3";
            } else {
                if (expectedHome >= 0.5) {
                    score = "3-2";
                } else {
                    score = "2-3";
                }
            }

            const matchID = m.homeTeam + "|||" + m.awayTeam;
            predictions[matchID] = score;
        }

        return NextResponse.json(predictions);

    } catch (error) {
        console.error('Error in predict-all:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
