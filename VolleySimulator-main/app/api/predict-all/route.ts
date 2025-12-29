import { NextRequest, NextResponse } from 'next/server';
import { calculateElo } from '../../utils/eloCalculator';
import { Match } from '../../types';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { teams, upcomingMatches, allMatches } = body;

        if (!upcomingMatches || !allMatches) {
            return NextResponse.json({ error: "Missing match data" }, { status: 400 });
        }

        // 1. Calculate Base Elo from History
        const eloMap = calculateElo(teams, allMatches);

        const predictions: Record<string, string> = {};

        // 2. Predict each upcoming match
        (upcomingMatches as Match[]).forEach(m => {
            const hElo = eloMap.get(m.homeTeam) || 1200;
            const aElo = eloMap.get(m.awayTeam) || 1200;

            const expectedHome = 1 / (1 + Math.pow(10, (aElo - hElo) / 400));

            // Logic for score prediction based on probability
            // > 0.85 -> 3-0
            // > 0.70 -> 3-1
            // > 0.55 -> 3-2
            // < 0.45 -> Away Wins (reversed logic)
            // 0.45 - 0.55 -> Close match 3-2 or 2-3

            let score = "3-2"; // default close

            if (expectedHome > 0.85) score = "3-0";
            else if (expectedHome > 0.70) score = "3-1";
            else if (expectedHome > 0.55) score = "3-2";
            else if (expectedHome < 0.15) score = "0-3";
            else if (expectedHome < 0.30) score = "1-3";
            else if (expectedHome < 0.45) score = "2-3";
            else {
                // Toss up for 3-2 or 2-3
                score = expectedHome >= 0.5 ? "3-2" : "2-3";
            }

            const matchId = `${m.homeTeam}|||${m.awayTeam}`;
            predictions[matchId] = score;
        });

        return NextResponse.json(predictions);

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
