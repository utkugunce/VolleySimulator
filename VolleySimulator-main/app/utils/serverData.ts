import fs from 'fs';
import path from 'path';
import { TeamStats, Match } from '@/app/types';

export interface LeagueData {
    teams: TeamStats[];
    fixture: Match[];
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

        // Rename CEV CL teams
        if (league === 'cev-cl') {
            const teamNameMapping: Record<string, string> = {
                'VakifBank ISTANBUL': 'VAKIFBANK',
                'Fenerbahçe Medicana ISTANBUL': 'FENERBAHÇE MEDICANA',
                'Eczacibasi ISTANBUL': 'ECZACIBAŞI DYNAVİT',
                'ANKARA Zeren Spor Kulübü': 'ZEREN SPOR'
            };

            const renameTeam = (name: string) => teamNameMapping[name] || name;

            if (data.teams) {
                data.teams = data.teams.map((t: any) => ({
                    ...t,
                    name: renameTeam(t.name)
                }));
            }

            const renameMatches = (matches: any[]) => matches.map((m: any) => ({
                ...m,
                homeTeam: renameTeam(m.homeTeam),
                awayTeam: renameTeam(m.awayTeam)
            }));

            if (data.fixture) data.fixture = renameMatches(data.fixture);
            if (data.matches) data.matches = renameMatches(data.matches);
        }

        // Normalize fixture data
        const fixture = (data.fixture || data.matches || []).map((m: any) => ({
            ...m,
            matchDate: m.matchDate || m.date
        }));

        return {
            teams: data.teams || [],
            fixture: fixture
        };
    } catch (error) {
        console.error(`Error reading ${league} data:`, error);
        return { teams: [], fixture: [] };
    }
}
