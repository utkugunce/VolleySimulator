import { TeamStats } from "../types";

export interface TeamDiff {
    name: string;
    rankDiff: number;   // e.g. +2 (rose 2 spots), -1 (fell 1 spot)
    pointDiff: number;  // e.g. +3 points
    winDiff: number;
}

export function compareStandings(baseStandings: TeamStats[], targetStandings: TeamStats[]): TeamDiff[] {
    const baseMap = new Map<string, { rank: number, stats: TeamStats }>();
    baseStandings.forEach((t, i) => baseMap.set(t.name, { rank: i + 1, stats: t }));

    const diffs: TeamDiff[] = [];

    targetStandings.forEach((t, i) => {
        const currentRank = i + 1;
        const base = baseMap.get(t.name);

        if (base) {
            // Rank Diff: oldRank - newRank. 
            // If old was 5 and new is 3, diff is 5-3 = 2 (Positive means improvement)
            const rankDiff = base.rank - currentRank;
            const pointDiff = t.points - base.stats.points;
            const winDiff = t.wins - base.stats.wins;

            diffs.push({
                name: t.name,
                rankDiff,
                pointDiff,
                winDiff
            });
        }
    });

    return diffs;
}
