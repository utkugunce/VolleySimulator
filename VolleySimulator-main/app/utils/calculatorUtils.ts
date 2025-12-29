import { Match, MatchOutcome, TeamStats } from "../types";

export const SCORES = ['3-0', '3-1', '3-2', '2-3', '1-3', '0-3'];

export function getOutcomeFromScore(score: string): MatchOutcome | null {
    const [h, a] = score.split('-').map(Number);
    if (isNaN(h) || isNaN(a)) return null;

    if (h === 3) {
        if (a === 0 || a === 1) return { homeSets: 3, awaySets: a, homePoints: 3, awayPoints: 0, homeWin: true };
        if (a === 2) return { homeSets: 3, awaySets: 2, homePoints: 2, awayPoints: 1, homeWin: true };
    }
    if (a === 3) {
        if (h === 0 || h === 1) return { homeSets: h, awaySets: 3, homePoints: 0, awayPoints: 3, homeWin: false };
        if (h === 2) return { homeSets: 2, awaySets: 3, homePoints: 1, awayPoints: 2, homeWin: false };
    }
    return null;
}

export function sortStandings(teams: TeamStats[]): TeamStats[] {
    return [...teams].sort((a, b) => {
        // 1. Wins (most wins first)
        if (b.wins !== a.wins) return b.wins - a.wins;
        // 2. Points
        if (b.points !== a.points) return b.points - a.points;
        // 3. Set Average (ratio)
        const setAvgB = (b.setsWon === 0 && b.setsLost === 0) ? 0 : (b.setsWon / (b.setsLost || 1));
        const setAvgA = (a.setsWon === 0 && a.setsLost === 0) ? 0 : (a.setsWon / (a.setsLost || 1));
        return setAvgB - setAvgA;
    });
}

export const normalizeTeamName = (name: string) => {
    return name
        .replace(/İ/g, 'I')
        .replace(/ı/g, 'I') // Standardize Turkish I
        .replace(/i/g, 'I') // Uppercase i becomes I
        .toUpperCase()
        .replace(/\s+/g, '') // remove spaces
        .replace(/[^A-Z0-9]/g, '') // Keep only alphanumeric
        .trim();
};

export function calculateLiveStandings(
    initialTeams: TeamStats[],
    matches: Match[],
    overrides: Record<string, string> // matchId -> "3-0"
): TeamStats[] {
    // Deep clone teams to simulate changes, indexed by normalized name
    const teamsMap = new Map<string, TeamStats>();
    initialTeams.forEach(t => {
        const key = normalizeTeamName(t.name);
        teamsMap.set(key, { ...t });
    });

    matches.forEach(m => {
        // Normalize match team names for lookup
        const homeKey = normalizeTeamName(m.homeTeam);
        const awayKey = normalizeTeamName(m.awayTeam);

        // Check for override with both separator formats for compatibility
        const matchId1 = `${m.homeTeam}|||${m.awayTeam}`;
        const matchId2 = `${m.homeTeam}-${m.awayTeam}`;
        const overriddenScore = overrides[matchId1] || overrides[matchId2];

        if (overriddenScore && !m.isPlayed) {
            const outcome = getOutcomeFromScore(overriddenScore);
            if (outcome) {
                const home = teamsMap.get(homeKey);
                const away = teamsMap.get(awayKey);

                if (home && away) {
                    home.played += 1;
                    home.points += outcome.homePoints;
                    home.setsWon += outcome.homeSets;
                    home.setsLost += outcome.awaySets;
                    if (outcome.homeWin) home.wins += 1;

                    away.played += 1;
                    away.points += outcome.awayPoints;
                    away.setsWon += outcome.awaySets;
                    away.setsLost += outcome.homeSets;
                    if (!outcome.homeWin) away.wins += 1;
                }
            }
        }
    });

    return sortStandings(Array.from(teamsMap.values()));
}
