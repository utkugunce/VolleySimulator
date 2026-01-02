import fs from 'fs';
import path from 'path';
import { TeamStats, Match } from '../types';
import { createServiceRoleClient } from './supabase-server';
import { getOutcomeFromScore, sortStandings } from './calculatorUtils';

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

        // Normalize fixture data
        let fixture = (data.fixture || data.matches || []).map((m: any) => ({
            ...m,
            matchDate: m.matchDate || m.date
        }));

        // 2. Fetch database overrides (Admin verified results)
        try {
            const supabase = createServiceRoleClient();

            // Map league names to match how they are stored in DB (Sultanlar Ligi vs vsl)
            const leagueDbMap: Record<string, string> = {
                'vsl': 'Sultanlar Ligi',
                '1lig': '1. Lig',
                '2lig': '2. Lig',
                'cev-cl': 'Şampiyonlar Ligi'
            };

            const dbLeagueName = leagueDbMap[league] || league;

            const { data: dbResults } = await supabase
                .from('match_results')
                .select('*')
                .eq('league', dbLeagueName)
                .eq('is_verified', true);

            if (dbResults && dbResults.length > 0) {
                console.log(`[getLeagueData] Found ${dbResults.length} database overrides for ${league}`);

                // Create a map for easy lookup
                const overridesMap = new Map();
                // We use homeTeam-awayTeam or other consistent key
                dbResults.forEach(res => {
                    const key = `${res.home_team}-${res.away_team}`;
                    overridesMap.set(key, res.result_score);
                });

                // Apply overrides to fixture
                let statsChanged = false;
                fixture = fixture.map((m: Match) => {
                    const key = `${m.homeTeam}-${m.awayTeam}`;
                    if (overridesMap.has(key)) {
                        const newScore = overridesMap.get(key);
                        if (m.resultScore !== newScore) {
                            statsChanged = true;
                            return {
                                ...m,
                                isPlayed: true,
                                resultScore: newScore
                            };
                        }
                    }
                    return m;
                });

                // 3. Recalculate standings if overrides applied
                if (statsChanged) {
                    // Start from scratch for correctness
                    const newTeams: Record<string, TeamStats> = {};
                    (data.teams || []).forEach((t: TeamStats) => {
                        newTeams[t.name] = { ...t, played: 0, wins: 0, points: 0, setsWon: 0, setsLost: 0 };
                    });

                    fixture.forEach((m: Match) => {
                        if (m.isPlayed && m.resultScore) {
                            const outcome = getOutcomeFromScore(m.resultScore);
                            if (outcome && newTeams[m.homeTeam] && newTeams[m.awayTeam]) {
                                const h = newTeams[m.homeTeam];
                                const a = newTeams[m.awayTeam];

                                h.played++;
                                h.points += outcome.homePoints;
                                h.setsWon += outcome.homeSets;
                                h.setsLost += outcome.awaySets;
                                if (outcome.homeWin) h.wins++;

                                a.played++;
                                a.points += outcome.awayPoints;
                                a.setsWon += outcome.awaySets;
                                a.setsLost += outcome.homeSets;
                                if (!outcome.homeWin) a.wins++;
                            }
                        }
                    });

                    // Update teams and sort (preserve group structure if possible, though calculateStandings might need to know groups)
                    // For now, let's just return the recalculated list sorted
                    const finalTeams = sortStandings(Object.values(newTeams));
                    return { teams: finalTeams, fixture };
                }
            }
        } catch (dbError) {
            console.error(`[getLeagueData] Database override fetch failed for ${league}:`, dbError);
            // Fallback to JSON only
        }

        return {
            teams: data.teams || [],
            fixture: fixture
        };
    } catch (error) {
        console.error(`Error reading ${league} data:`, error);
        return { teams: [], fixture: [] };
    }
}
