import fs from 'fs';
import path from 'path';
import { Metadata } from "next";
import CEVChallengeStatsClient from './CEVChallengeStatsClient';

export const metadata: Metadata = {
    title: "CEV Challenge Cup İstatistikler",
    description: "CEV Challenge Cup takım istatistikleri ve performans analizleri.",
    openGraph: {
        title: "CEV Challenge Cup İstatistikler | VolleySimulator",
        description: "Challenge Cup takım istatistikleri.",
    },
};

export default async function CEVChallengeStatsPage() {
    const filePath = path.join(process.cwd(), 'data', 'cev-challenge-cup-data.json');
    let teams: any[] = [];
    let fixture: any[] = [];

    try {
        if (fs.existsSync(filePath)) {
            const fileContent = fs.readFileSync(filePath, 'utf8');
            const sourceData = JSON.parse(fileContent);

            const teamsMap = new Map();
            let matchCounter = 1;

            const parseScore = (scoreStr: string | null) => {
                if (!scoreStr || !scoreStr.includes('-')) return { home: null, away: null };
                const parts = scoreStr.split('-').map(p => parseInt(p.trim()));
                return { home: isNaN(parts[0]) ? null : parts[0], away: isNaN(parts[1]) ? null : parts[1] };
            };

            if (sourceData.phases) {
                sourceData.phases.forEach((phase: any) => {
                    const roundName = phase.name;
                    phase.matches.forEach((m: any) => {
                        const { home, away } = parseScore(m.score);
                        if (!teamsMap.has(m.homeTeam)) teamsMap.set(m.homeTeam, { name: m.homeTeam, country: '' });
                        if (!teamsMap.has(m.awayTeam)) teamsMap.set(m.awayTeam, { name: m.awayTeam, country: '' });

                        fixture.push({
                            id: matchCounter++,
                            round: roundName,
                            homeTeam: m.homeTeam,
                            awayTeam: m.awayTeam,
                            homeScore: home,
                            awayScore: away,
                            isPlayed: m.isPlayed
                        });
                    });
                });
            }
            teams = Array.from(teamsMap.values());
        }
    } catch (error) {
        console.error('Error reading CEV Challenge data:', error);
    }

    return (
        <CEVChallengeStatsClient teams={teams} fixture={fixture} />
    );
}
