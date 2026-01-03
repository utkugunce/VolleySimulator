import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
    try {
        const filePath = path.join(process.cwd(), 'data', 'cev-challenge-cup-data.json');

        if (!fs.existsSync(filePath)) {
            return NextResponse.json({ league: 'CEV Challenge Cup', fixture: [], teams: [] });
        }

        const fileContent = fs.readFileSync(filePath, 'utf8');
        const sourceData = JSON.parse(fileContent);

        // Transform to CEV Cup format
        // Transform to CEV Cup format
        interface Match {
            id: number;
            round: string;
            leg: number;
            date: string;
            matchTime: string;
            homeTeam: string;
            awayTeam: string;
            homeScore: number | null;
            awayScore: number | null;
            setScores: string;
            isPlayed: boolean;
            venue: string;
        }
        const fixture: Match[] = [];
        const teamsMap = new Map();

        // Helper to parse score "3-0" -> { home: 3, away: 0 }
        const parseScore = (scoreStr: string | null) => {
            if (!scoreStr || !scoreStr.includes('-')) return { home: null, away: null };
            const parts = scoreStr.split('-').map(p => parseInt(p.trim()));
            return { home: isNaN(parts[0]) ? null : parts[0], away: isNaN(parts[1]) ? null : parts[1] };
        };

        let matchCounter = 1;

        if (sourceData.phases) {
            sourceData.phases.forEach((phase: { name: string; matches: any[] }) => {
                const roundName = phase.name; // e.g., "Qualification Rounds", "Main Round"
                // Map generic phase names to CEV Cup expected rounds if needed, or update the UI constants.
                // For now, let's keep original names but might need mapping for bracket logic.

                phase.matches.forEach((m: { score: string; date: string; homeTeam: string; awayTeam: string; sets: string; isPlayed: boolean }) => {
                    const { home, away } = parseScore(m.score);

                    // Add teams
                    if (!teamsMap.has(m.homeTeam)) teamsMap.set(m.homeTeam, { name: m.homeTeam, country: '' });
                    if (!teamsMap.has(m.awayTeam)) teamsMap.set(m.awayTeam, { name: m.awayTeam, country: '' });

                    fixture.push({
                        id: matchCounter++,
                        round: roundName,
                        leg: 1, // Challenge Cup scraper doesn't detect leg yet, default to 1 or logic needed
                        date: m.date || 'TBD',
                        matchTime: '', // Scraper didn't separate time
                        homeTeam: m.homeTeam,
                        awayTeam: m.awayTeam,
                        homeScore: home,
                        awayScore: away,
                        setScores: m.sets,
                        isPlayed: m.isPlayed,
                        venue: ''
                    });
                });
            });
        }

        return NextResponse.json({
            league: "CEV Challenge Cup",
            season: "2025-2026",
            currentStage: "Main Round", // Default or derive
            teams: Array.from(teamsMap.values()),
            fixture: fixture
        });
    } catch (error) {
        console.error('Error reading CEV Challenge Cup data:', error);
        return NextResponse.json({ error: 'Failed to load data' }, { status: 500 });
    }
}
