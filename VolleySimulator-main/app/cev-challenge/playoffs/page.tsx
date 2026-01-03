import fs from 'fs';
import path from 'path';
import CEVChallengePlayoffsClient from './CEVChallengePlayoffsClient';

export default async function CEVChallengePlayoffsPage() {
    const filePath = path.join(process.cwd(), 'data', 'cev-challenge-cup-data.json');
    let data = null;

    try {
        if (fs.existsSync(filePath)) {
            const fileContent = fs.readFileSync(filePath, 'utf8');
            const sourceData = JSON.parse(fileContent);

            const fixture: any[] = [];
            const teamsMap = new Map();
            let matchCounter = 1;

            const parseScore = (scoreStr: string | null) => {
                if (!scoreStr || !scoreStr.includes('-')) return { home: null, away: null };
                const parts = scoreStr.split('-').map(p => parseInt(p.trim()));
                return { home: isNaN(parts[0]) ? null : parts[0], away: isNaN(parts[1]) ? null : parts[1] };
            };

            if (sourceData.phases) {
                // Track leg numbers for matchups
                const matchupLegs = new Map<string, number>();

                sourceData.phases.forEach((phase: any) => {
                    const roundName = phase.name;
                    phase.matches.forEach((m: any) => {
                        const { home, away } = parseScore(m.score);
                        if (!teamsMap.has(m.homeTeam)) teamsMap.set(m.homeTeam, { name: m.homeTeam, country: '' });
                        if (!teamsMap.has(m.awayTeam)) teamsMap.set(m.awayTeam, { name: m.awayTeam, country: '' });

                        // Determine leg
                        const matchupKey = [m.homeTeam, m.awayTeam].sort().join(' vs ');
                        const currentLeg = (matchupLegs.get(matchupKey) || 0) + 1;
                        matchupLegs.set(matchupKey, currentLeg);

                        fixture.push({
                            id: matchCounter++,
                            round: roundName,
                            leg: currentLeg,
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
        <CEVChallengePlayoffsClient initialData={data} />
    );
}
