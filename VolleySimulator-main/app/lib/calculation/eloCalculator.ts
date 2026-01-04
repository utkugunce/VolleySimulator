import { Match, TeamStats } from "../../types";

export function calculateElo(teams: TeamStats[], matches: Match[]): Map<string, number> {
    const ratings = new Map<string, number>();

    // Initialize all teams with 1200
    teams.forEach(t => ratings.set(t.name, 1200));

    // Sort matches by date if possible to ensure chronological order calculation
    // Assuming matches are roughly in order or we want to process played matches
    const playedMatches = matches.filter(m => m.isPlayed && m.resultScore).sort((a, b) => {
        // Simple date sort if available
        if (a.matchDate && b.matchDate) return a.matchDate.localeCompare(b.matchDate);
        return 0;
    });

    playedMatches.forEach(m => {
        const homeName = m.homeTeam;
        const awayName = m.awayTeam;

        const homeRating = ratings.get(homeName) || 1200;
        const awayRating = ratings.get(awayName) || 1200;

        const [hSets, aSets] = (m.resultScore || '0-0').split('-').map(Number);

        // Skip invalid scores
        if (isNaN(hSets) || isNaN(aSets)) return;

        // Determine actual score (1 for win, 0 for loss)
        // Advanced: We could use 0.9 for 3-2 wins etc, but standard Elo is 1/0
        const actualHome = hSets > aSets ? 1 : 0;
        const actualAway = 1 - actualHome;

        // K-Factor - using 32 as standard for many sports
        const K = 32;

        // Expected score
        // Ea = 1 / (1 + 10 ^ ((Rb - Ra) / 400))
        const expectedHome = 1 / (1 + Math.pow(10, (awayRating - homeRating) / 400));
        const expectedAway = 1 / (1 + Math.pow(10, (homeRating - awayRating) / 400));

        // Margin of victory Multiplier (Optional but good for Volleyball 3-0 vs 3-2)
        // Multiplier = ln(abs(PD) + 1) * (2.2 / ((ELOW - ELOL) * 0.001 + 2.2))
        // Simplified multiplier: 
        // 3-0: 1.5x
        // 3-1: 1.25x
        // 3-2: 1.0x
        let multiplier = 1;
        const setDiff = Math.abs(hSets - aSets);
        if (setDiff === 3) multiplier = 1.3; // Dominant win
        else if (setDiff === 2) multiplier = 1.1; // Solid win
        else multiplier = 1.0; // Tie-break win

        // Update ratings
        const newHomeRating = homeRating + K * multiplier * (actualHome - expectedHome);
        const newAwayRating = awayRating + K * multiplier * (actualAway - expectedAway);

        ratings.set(homeName, newHomeRating);
        ratings.set(awayName, newAwayRating);
    });

    return ratings;
}
