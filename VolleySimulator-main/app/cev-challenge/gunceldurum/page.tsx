import fs from 'fs';
import path from 'path';
import { Metadata } from "next";
import CEVChallengeGuncelDurumClient from './CEVChallengeGuncelDurumClient';

export const metadata: Metadata = {
    title: "CEV Challenge Cup Güncel Durum",
    description: "CEV Challenge Cup puan durumu, tur sıralamaları ve maç sonuçları. Avrupa kupası güncel tablo.",
    openGraph: {
        title: "CEV Challenge Cup Güncel Durum | VolleySimulator",
        description: "Challenge Cup tur sıralamaları ve maç sonuçları.",
    },
};

interface Match {
    id: number;
    round: string;
    leg?: number;
    date: string;
    homeTeam: string;
    awayTeam: string;
    homeScore: number | null;
    awayScore: number | null;
    setScores?: string;
    isPlayed: boolean;
}

interface Team {
    name: string;
    country: string;
}

interface CEVChallengeData {
    league: string;
    season: string;
    currentStage: string;
    teams: Team[];
    fixture: Match[];
}

export default async function CEVChallengeGuncelDurumPage() {
    // We fetch from the API endpoint locally or read the JSON directly and transform it.
    // Since we created a route that transforms it, we can reuse that transformation logic here 
    // OR just call the API URL if full URL is known.
    // Better: Read JSON and Transform here to avoid self-fetch issues during build/runtime.

    // Copying transformation logic from API route for Server Component efficiency
    const filePath = path.join(process.cwd(), 'data', 'cev-challenge-cup-data.json');
    let data: CEVChallengeData | null = null;

    try {
        if (fs.existsSync(filePath)) {
            const fileContent = fs.readFileSync(filePath, 'utf8');
            const sourceData = JSON.parse(fileContent);

            const fixture: Match[] = [];
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
                            leg: 1,
                            date: m.date || 'TBD',
                            homeTeam: m.homeTeam,
                            awayTeam: m.awayTeam,
                            homeScore: home,
                            awayScore: away,
                            setScores: m.sets,
                            isPlayed: m.isPlayed
                        });
                    });
                });
            }

            data = {
                league: "CEV Challenge Cup",
                season: "2025-2026",
                currentStage: "Main Round",
                teams: Array.from(teamsMap.values()),
                fixture: fixture
            };
        }
    } catch (error) {
        console.error('Error reading CEV Challenge data:', error);
    }

    if (!data) {
        return (
            <main className="min-h-screen bg-slate-950 text-slate-100 p-4 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-emerald-500">Veri Yüklenemedi</h1>
                    <p className="text-slate-400 mt-2">CEV Challenge Cup verileri yüklenirken bir hata oluştu.</p>
                </div>
            </main>
        );
    }

    return (
        <CEVChallengeGuncelDurumClient
            initialData={data}
        />
    );
}
