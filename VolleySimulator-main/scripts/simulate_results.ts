
import fs from 'fs';
import path from 'path';

// Types (simplified from app/types.ts)
interface TeamStats {
    name: string;
    groupName: string;
    played: number;
    wins: number;
    points: number;
    setsWon: number;
    setsLost: number;
    // ... potentially other fields we preserve
    [key: string]: any;
}

interface Match {
    id: number | string;
    date: string;
    matchTime: string;
    homeTeam: string;
    awayTeam: string;
    homeScore?: number;
    awayScore?: number;
    isPlayed: boolean;
    resultScore?: string;
    // ... potentially other fields
    [key: string]: any;
}

interface LeagueData {
    league: string;
    season: string;
    teams: TeamStats[];
    fixture: Match[];
}

const FILES = [
    'data/vsl-data.json',
    'data/1lig-data.json',
    'data/2lig-data.json',
    'data/cev-cl-data.json',
    'data/cev-cup-data.json',
    'data/cev-challenge-cup-data.json'
];

const TARGET_DATE = new Date('2026-01-05T21:46:00');
const SCORES = ['3-0', '3-1', '3-2', '2-3', '1-3', '0-3'];

function getOutcome(score: string) {
    const [h, a] = score.split('-').map(Number);
    if (h === 3) {
        return { homePoints: a < 2 ? 3 : 2, awayPoints: a < 2 ? 0 : 1, homeWin: true };
    } else {
        return { homePoints: h < 2 ? 0 : 1, awayPoints: h < 2 ? 3 : 2, homeWin: false };
    }
}

function normalize(name: string) {
    return name.toUpperCase().replace(/\s+/g, '').trim();
}

async function processFile(filePath: string) {
    const fullPath = path.resolve(process.cwd(), filePath);
    if (!fs.existsSync(fullPath)) {
        console.warn(`File not found: ${filePath}`);
        return;
    }

    try {
        const data: LeagueData = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
        let updatedCount = 0;

        // Map teams for quick lookup update
        const teamsMap = new Map<string, TeamStats>();
        data.teams.forEach(t => teamsMap.set(normalize(t.name), t));

        data.fixture.forEach(match => {
            // Check Date
            const matchDateTimeStr = `${match.date}T${match.matchTime}:00`;
            const matchDate = new Date(matchDateTimeStr);

            // If invalid date, fallback to just date (assume meant waiting for result)
            const validDate = isNaN(matchDate.getTime()) ? new Date(match.date) : matchDate;

            if (validDate < TARGET_DATE && !match.isPlayed) {
                // Simulate Result
                const randomScore = SCORES[Math.floor(Math.random() * SCORES.length)];
                const outcome = getOutcome(randomScore);
                const [hScore, aScore] = randomScore.split('-').map(Number);

                // Update Match
                match.isPlayed = true;
                match.resultScore = randomScore;
                match.homeScore = hScore;
                match.awayScore = aScore;

                // Update Teams
                const homeTeam = teamsMap.get(normalize(match.homeTeam));
                const awayTeam = teamsMap.get(normalize(match.awayTeam));

                if (homeTeam && awayTeam) {
                    homeTeam.played++;
                    homeTeam.setsWon += hScore;
                    homeTeam.setsLost += aScore;
                    homeTeam.points += outcome.homePoints;
                    if (outcome.homeWin) homeTeam.wins++;

                    awayTeam.played++;
                    awayTeam.setsWon += aScore;
                    awayTeam.setsLost += hScore;
                    awayTeam.points += outcome.awayPoints;
                    if (!outcome.homeWin) awayTeam.wins++;
                }

                updatedCount++;
            }
        });

        if (updatedCount > 0) {
            fs.writeFileSync(fullPath, JSON.stringify(data, null, 2), 'utf8');
            console.log(`✅ Updated ${updatedCount} matches in ${filePath}`);
        } else {
            console.log(`ℹ️  No updates needed for ${filePath}`);
        }

    } catch (error) {
        console.error(`Error processing ${filePath}:`, error);
    }
}

async function run() {
    console.log(`Starting simulation for matches before ${TARGET_DATE.toLocaleString()}...`);
    for (const file of FILES) {
        await processFile(file);
    }
    console.log("Simulation complete.");
}

run();
