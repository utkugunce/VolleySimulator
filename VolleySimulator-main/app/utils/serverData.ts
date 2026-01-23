import fs from 'fs';
import path from 'path';
import { TeamStats, Match } from '@/app/types';

export interface RankingEntry {
    pos: number;
    team: string;
    pool: string;
    pld: number;
    w: number;
    l: number;
    pts: number;
    sw: number;
    sl: number;
    sr: number;
    spw: number;
    spl: number;
    spr: number;
}

export interface RankingsData {
    firstPlace: RankingEntry[];
    secondPlace: RankingEntry[];
    thirdPlace: RankingEntry[];
}

export interface LeagueData {
    teams: TeamStats[];
    fixture: Match[];
    rankings?: RankingsData;
}

export async function getLeagueData(league: string): Promise<LeagueData> {
    try {
        const filePath = path.join(process.cwd(), 'data', `${league}-data.json`);
        if (!fs.existsSync(filePath)) {
            console.error(`Data file not found: ${filePath}`);
            return { teams: [], fixture: [] };
        }

        const content = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(content);

        // Normalize fixture data
        const fixture = (data.fixture || data.matches || []).map((m: any) => ({
            ...m,
            matchDate: m.matchDate || m.date
        }));

        return {
            teams: data.teams || [],
            fixture: fixture,
            rankings: data.rankings || undefined
        };
    } catch (error) {
        console.error(`Error reading ${league} data:`, error);
        return { teams: [], fixture: [] };
    }
}

