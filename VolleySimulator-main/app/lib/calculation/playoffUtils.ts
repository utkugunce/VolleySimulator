import { Match, TeamStats, MatchOverride } from "../../types";
import { normalizeTeamName } from "./calculatorUtils";
import { calculateElo } from "./eloCalculator";

export interface PlayoffTeam extends TeamStats {
    elo: number;
    sourceGroup: string;
    position: string;
    initialSeed?: number; // 0-3 for 1st-4th
    scenarioWins?: number;
    scenarioLosses?: number;
    scenarioPlayed?: number;
    scenarioPoints?: number;
    scenarioSetsWon?: number;
    scenarioSetsLost?: number;
}

export interface PlayoffGroup {
    groupName: string;
    teams: PlayoffTeam[];
}

export const SCORES = ['3-0', '3-1', '3-2', '2-3', '1-3', '0-3'];

export interface PlayoffMatch {
    id: string; // e.g., "quarter-A-Team1-Team2"
    homeTeam: string;
    awayTeam: string;
    date: string;
    stage: 'quarter' | 'semi' | 'final';
}

export interface GroupStanding {
    groupName: string;
    first: TeamStats | null;
    second: TeamStats | null;
    teams: TeamStats[]; // Full sorted list for flexible selection (e.g. 1. Lig needs Top 4)
}

// Calculate regular season standings to find 1st and 2nd of each group
export function calculateGroupStandings(teams: TeamStats[]): GroupStanding[] {
    const groups: Record<string, TeamStats[]> = {};
    teams.forEach(t => {
        const gName = t.groupName || "Unknown";
        if (!groups[gName]) groups[gName] = [];
        groups[gName].push(t);
    });

    const standings: GroupStanding[] = [];
    Object.keys(groups).sort().forEach(gName => {
        const sorted = groups[gName].sort((a, b) => b.points - a.points); // Simply points for now
        standings.push({
            groupName: gName,
            first: sorted[0] || null,
            second: sorted[1] || null,
            teams: sorted
        });
    });
    return standings;
}

// Generate Quarter Final Groups (A-H)
export function generateQuarterGroups(standings: GroupStanding[], fixture: Match[]): PlayoffGroup[] {
    const allTeams = standings.flatMap(s => [s.first, s.second].filter(Boolean)) as TeamStats[];
    // Calculate Elo for seeding
    const eloMap = calculateElo(allTeams, fixture);
    const ratings = Object.fromEntries(eloMap);


    const playoffGroupDefs = [
        { name: "A", teamDefs: [{ group: 1, position: 1 }, { group: 16, position: 1 }, { group: 8, position: 2 }, { group: 9, position: 2 }] },
        { name: "B", teamDefs: [{ group: 2, position: 1 }, { group: 15, position: 1 }, { group: 7, position: 2 }, { group: 10, position: 2 }] },
        { name: "C", teamDefs: [{ group: 3, position: 1 }, { group: 14, position: 1 }, { group: 6, position: 2 }, { group: 11, position: 2 }] },
        { name: "D", teamDefs: [{ group: 4, position: 1 }, { group: 13, position: 1 }, { group: 5, position: 2 }, { group: 12, position: 2 }] },
        { name: "E", teamDefs: [{ group: 5, position: 1 }, { group: 12, position: 1 }, { group: 4, position: 2 }, { group: 13, position: 2 }] },
        { name: "F", teamDefs: [{ group: 6, position: 1 }, { group: 11, position: 1 }, { group: 3, position: 2 }, { group: 14, position: 2 }] },
        { name: "G", teamDefs: [{ group: 7, position: 1 }, { group: 10, position: 1 }, { group: 2, position: 2 }, { group: 15, position: 2 }] },
        { name: "H", teamDefs: [{ group: 8, position: 1 }, { group: 9, position: 1 }, { group: 1, position: 2 }, { group: 16, position: 2 }] },
    ];

    const getTeam = (def: { group: number; position: number }): PlayoffTeam | null => {
        const grp = standings.find(s => parseInt(s.groupName.match(/\d+/)?.[0] || "0") === def.group);
        const team = def.position === 1 ? grp?.first : grp?.second;
        if (!team) return null;
        return {
            ...team,
            elo: ratings[team.name] || 1200,
            sourceGroup: `${def.group}. GR`,
            position: `${def.position}.`
        };
    };

    return playoffGroupDefs.map(pg => {
        const teams = pg.teamDefs.map(getTeam).filter(Boolean) as PlayoffTeam[];
        // Assign initial seeds based on the definition order (assuming definitions are ordered 1-4seeds)
        // Actually, teamDefs is just an array. We need to set initialSeed 0..3
        teams.forEach((t, i) => { if (t) t.initialSeed = i; });
        return { groupName: pg.name, teams };
    });
}

// Generate Semi Final Groups (A-D)
export function generateSemiGroups(quarterGroups: PlayoffGroup[]): PlayoffGroup[] {
    const semiDefs = [
        { name: "A", sources: [{ grp: "A", pos: 1 }, { grp: "E", pos: 1 }, { grp: "D", pos: 2 }, { grp: "H", pos: 2 }] },
        { name: "B", sources: [{ grp: "B", pos: 1 }, { grp: "F", pos: 1 }, { grp: "C", pos: 2 }, { grp: "G", pos: 2 }] },
        { name: "C", sources: [{ grp: "C", pos: 1 }, { grp: "G", pos: 1 }, { grp: "B", pos: 2 }, { grp: "F", pos: 2 }] },
        { name: "D", sources: [{ grp: "D", pos: 1 }, { grp: "H", pos: 1 }, { grp: "A", pos: 2 }, { grp: "E", pos: 2 }] },
    ];

    const getTeam = (grpName: string, position: number): PlayoffTeam | null => {
        const qGroup = quarterGroups.find(g => g.groupName === grpName);
        if (!qGroup) return null;
        // IMPORTANT: The caller is responsible for ensuring quarterGroups are sorted by standings!
        const team = qGroup.teams[position - 1];
        if (!team) return null;
        return { ...team, sourceGroup: `ÇF ${grpName}`, position: `${position}.` };
    };

    return semiDefs.map(sd => {
        const teams = sd.sources.map(s => getTeam(s.grp, s.pos)).filter(Boolean) as PlayoffTeam[];
        // Sort removed: Respect definition order for fixture generation
        return { groupName: sd.name, teams };
    });
}

// Generate Final Groups (1-2)
export function generateFinalGroups(semiGroups: PlayoffGroup[]): PlayoffGroup[] {
    const finalDefs = [
        { name: "1", sources: [{ grp: "A", pos: 1 }, { grp: "C", pos: 1 }, { grp: "B", pos: 2 }, { grp: "D", pos: 2 }] },
        { name: "2", sources: [{ grp: "B", pos: 1 }, { grp: "D", pos: 1 }, { grp: "A", pos: 2 }, { grp: "C", pos: 2 }] },
    ];

    const getTeam = (grpName: string, position: number): PlayoffTeam | null => {
        const sGroup = semiGroups.find(g => g.groupName === grpName);
        if (!sGroup) return null;
        const team = sGroup.teams[position - 1];
        if (!team) return null;
        return { ...team, sourceGroup: `YF ${grpName}`, position: `${position}.` };
    };

    return finalDefs.map(fd => {
        const teams = fd.sources.map(s => getTeam(s.grp, s.pos)).filter(Boolean) as PlayoffTeam[];
        // Sort removed: Respect definition order for fixture generation
        return { groupName: fd.name, teams };
    });
}

// ----------------------------------------------------------------------
// 1. LIG SPECIAL LOGIC
// ----------------------------------------------------------------------

// 1. Lig Semi-Finals (I. Group, II. Group)
// I. GRUP: A1, B4, A3, B2
// II. GRUP: B1, A4, B3, A2
export function generate1LigSemiGroups(standings: GroupStanding[]): PlayoffGroup[] {
    const getTeam = (groupName: string, pos: number): PlayoffTeam | null => {
        const grp = standings.find(s => s.groupName === groupName);
        if (!grp || !grp.teams || !grp.teams[pos - 1]) return null;
        const team = grp.teams[pos - 1];
        return { ...team, elo: 1200 + team.points, sourceGroup: `${groupName.charAt(0)}.${pos}`, position: `${pos}.` };
    };

    const semiDefs = [
        { name: "I", sources: [{ grp: "A. Grup", pos: 1 }, { grp: "B. Grup", pos: 4 }, { grp: "A. Grup", pos: 3 }, { grp: "B. Grup", pos: 2 }] },
        { name: "II", sources: [{ grp: "B. Grup", pos: 1 }, { grp: "A. Grup", pos: 4 }, { grp: "B. Grup", pos: 3 }, { grp: "A. Grup", pos: 2 }] },
    ];

    return semiDefs.map(sd => {
        const teams = sd.sources.map(s => getTeam(s.grp, s.pos)).filter(Boolean) as PlayoffTeam[];
        return { groupName: sd.name, teams };
    });
}

// 1. Lig Final (One Group of 4)
// Sources: I. Group 1st, I. Group 2nd, II. Group 1st, II. Group 2nd
export function generate1LigFinalGroups(semiGroups: PlayoffGroup[]): PlayoffGroup[] {
    const getTeam = (grpName: string, position: number): PlayoffTeam | null => {
        const sGroup = semiGroups.find(g => g.groupName === grpName);
        if (!sGroup || !sGroup.teams[position - 1]) return null;
        const team = sGroup.teams[position - 1];
        return { ...team, sourceGroup: `${grpName}. Grup`, position: `${position}.` };
    };

    const finalSources = [
        { grp: "I", pos: 1 },
        { grp: "I", pos: 2 },
        { grp: "II", pos: 1 },
        { grp: "II", pos: 2 }
    ];

    const teams = finalSources.map(s => getTeam(s.grp, s.pos)).filter(Boolean) as PlayoffTeam[];
    return [{ groupName: "Final", teams }];
}

export function generateGroupFixture(groups: PlayoffGroup[], stage: 'quarter' | 'semi' | 'final'): PlayoffMatch[] {
    const matches: PlayoffMatch[] = [];

    groups.forEach(group => {
        // Use initialSeed if available to find the "original" 1st, 2nd, 3rd, 4th team of the group
        // If not available (old data?), fall back to current index, but that's risky if sorted.
        // We will sort by initialSeed to be safe.
        const sorted = [...group.teams].sort((a, b) => (a.initialSeed ?? 0) - (b.initialSeed ?? 0));

        // Ensure we have 4 teams for standard fixture
        // If < 4, we might skip matches. 
        if (sorted.length !== 4) return;

        const [t1, t2, t3, t4] = sorted;

        // Custom seeding/pairing logic 1-4, 2-3
        // Day 1
        matches.push({ id: `${stage}-${group.groupName}-${t1.name}-${t4.name}`, homeTeam: t1.name, awayTeam: t4.name, date: 'G�n 1', stage });
        matches.push({ id: `${stage}-${group.groupName}-${t2.name}-${t3.name}`, homeTeam: t2.name, awayTeam: t3.name, date: 'G�n 1', stage });
        // Day 2
        matches.push({ id: `${stage}-${group.groupName}-${t4.name}-${t2.name}`, homeTeam: t4.name, awayTeam: t2.name, date: 'G�n 2', stage });
        matches.push({ id: `${stage}-${group.groupName}-${t3.name}-${t1.name}`, homeTeam: t3.name, awayTeam: t1.name, date: 'G�n 2', stage });
        // Day 3
        matches.push({ id: `${stage}-${group.groupName}-${t3.name}-${t4.name}`, homeTeam: t3.name, awayTeam: t4.name, date: 'G�n 3', stage });
        matches.push({ id: `${stage}-${group.groupName}-${t1.name}-${t2.name}`, homeTeam: t1.name, awayTeam: t2.name, date: 'G�n 3', stage });
    });

    return matches;
}

// Apply Overrides and Calculate Standings for Playoff Groups
export function applyOverridesToGroups(
    groups: PlayoffGroup[],
    overrides: Record<string, string>,
    stage: string
): PlayoffGroup[] {
    // Generate authoritative fixture to validate overrides
    const validMatches = generateGroupFixture(groups, stage as 'quarter' | 'semi' | 'final');
    const validMatchIds = new Set(validMatches.map(m => m.id));

    return groups.map(group => {
        const teamPoints: Record<string, { wins: number; lost: number; points: number; setsWon: number; setsLost: number; played: number }> = {};

        group.teams.forEach(t => {
            teamPoints[normalizeTeamName(t.name)] = { wins: 0, lost: 0, points: 0, setsWon: 0, setsLost: 0, played: 0 };
        });

        // Loop through all overrides to find matches for this group
        Object.entries(overrides).forEach(([matchId, score]) => {
            // Strict Validation: Ignore any override not in the current valid fixture
            if (!validMatchIds.has(matchId)) return;

            if (!matchId.startsWith(`${stage}-${group.groupName}-`)) return;

            const parts = matchId.split('-');
            const homeTeam = parts[2];
            const awayTeam = parts[3];

            // Normalize names for lookup
            const hKey = normalizeTeamName(homeTeam);
            const aKey = normalizeTeamName(awayTeam);

            if (!teamPoints[hKey] || !teamPoints[aKey]) return;

            const [hSets, aSets] = score.split('-').map(Number);
            const homeWin = hSets > aSets;

            teamPoints[hKey].setsWon += hSets;
            teamPoints[hKey].setsLost += aSets;
            teamPoints[hKey].played += 1;

            teamPoints[aKey].setsWon += aSets;
            teamPoints[aKey].setsLost += hSets;
            teamPoints[aKey].played += 1;

            if (homeWin) {
                teamPoints[hKey].wins++;
                teamPoints[aKey].lost++;
                teamPoints[hKey].points += hSets === 3 && aSets <= 1 ? 3 : 2;
                if (aSets === 2) teamPoints[aKey].points += 1;
            } else {
                teamPoints[aKey].wins++;
                teamPoints[hKey].lost++;
                teamPoints[aKey].points += aSets === 3 && hSets <= 1 ? 3 : 2;
                if (hSets === 2) teamPoints[hKey].points += 1;
            }
        });

        // Update team stats from calculated points
        const updatedTeams = group.teams.map(t => {
            const tKey = normalizeTeamName(t.name);
            return {
                ...t,
                scenarioWins: teamPoints[tKey]?.wins || 0,
                scenarioLosses: teamPoints[tKey]?.lost || 0,
                scenarioPlayed: teamPoints[tKey]?.played || 0,
                scenarioPoints: teamPoints[tKey]?.points || 0,
                scenarioSetsWon: teamPoints[tKey]?.setsWon || 0,
                scenarioSetsLost: teamPoints[tKey]?.setsLost || 0,
            };
        });

        updatedTeams.sort((a, b) => {
            // 1. Total Wins (Galibiyet Say�s�)
            if ((b.scenarioWins || 0) !== (a.scenarioWins || 0)) return (b.scenarioWins || 0) - (a.scenarioWins || 0);

            // 2. Total Points (Puan)
            if ((b.scenarioPoints || 0) !== (a.scenarioPoints || 0)) return (b.scenarioPoints || 0) - (a.scenarioPoints || 0);

            // 3. Set Ratio (Set Averaj�)
            // Calculate ratios - handle 0 division safely
            const getRatio = (won: number, lost: number) => {
                if (lost === 0 && won === 0) return 0; // No games played -> 0 ratio
                if (lost === 0) return 10000; // Infinite ratio (played but never lost set)
                return won / lost;
            };

            const ratioA = getRatio(a.scenarioSetsWon || 0, a.scenarioSetsLost || 0);
            const ratioB = getRatio(b.scenarioSetsWon || 0, b.scenarioSetsLost || 0);

            if (Math.abs(ratioB - ratioA) > 0.0001) return ratioB - ratioA;

            // Fallback to Elo if everything else is tied (Initial state or perfect tie)
            return (b.elo || 0) - (a.elo || 0);
        });

        return { ...group, teams: updatedTeams };
    });
}
// Apply Overrides and Calculate Standings for a linear list of Teams (e.g. Regular Season Group)
export function applyOverridesToTeams(
    teams: TeamStats[],
    overrides: MatchOverride[]
): TeamStats[] {
    // If overrides is empty, return teams as is
    if (!overrides || !Array.isArray(overrides) || overrides.length === 0) {
        return teams;
    }

    const teamPoints: Record<string, { wins: number; lost: number; points: number; setsWon: number; setsLost: number; played: number }> = {};

    // Initialize with existing stats
    teams.forEach(t => {
        teamPoints[t.name] = {
            wins: t.wins,
            lost: t.played - t.wins,
            points: t.points,
            setsWon: t.setsWon,
            setsLost: t.setsLost,
            played: t.played
        };
    });

    // Apply Overrides
    // Expecting overrides to be an array of objects like { home: string, away: string, homeScore: number, awayScore: number }
    // Or simpler if coming from localStorage

    // Assuming the user wants to add 'extra' matches or simulate unplayed matches.
    // However, the `scenarios` from `localStorage` in `GroupPage` are stored as a list of modified Match objects.

    overrides.forEach((match: MatchOverride) => {
        // We only care if the match has a score
        if (!match.homeScore && match.homeScore !== 0) return;

        const homeTeam = match.homeTeam;
        const awayTeam = match.awayTeam;
        const hSets = Number(match.homeScore);
        const aSets = Number(match.awayScore);

        if (!teamPoints[homeTeam] || !teamPoints[awayTeam]) return;

        // Check if this match was already "played" in real life?
        // For simplicity in this "Scenario Page", we might be double counting if we are not careful.
        // But the prompt said "Oyundan gelen puan durumu". usually means "Standings derived from the game inputs".
        // Use case: The user enters predictions for *future* matches.
        // So we should strictly ADD these to the current stats.

        const homeWin = hSets > aSets;

        teamPoints[homeTeam].setsWon += hSets;
        teamPoints[homeTeam].setsLost += aSets;
        teamPoints[homeTeam].played += 1;

        teamPoints[awayTeam].setsWon += aSets;
        teamPoints[awayTeam].setsLost += hSets;
        teamPoints[awayTeam].played += 1;

        if (homeWin) {
            teamPoints[homeTeam].wins++;
            teamPoints[awayTeam].lost++;
            teamPoints[homeTeam].points += hSets === 3 && aSets <= 1 ? 3 : 2;
            if (aSets === 2) teamPoints[awayTeam].points += 1;
        } else {
            teamPoints[awayTeam].wins++;
            teamPoints[homeTeam].lost++;
            teamPoints[awayTeam].points += aSets === 3 && hSets <= 1 ? 3 : 2;
            if (hSets === 2) teamPoints[homeTeam].points += 1;
        }
    });

    return teams.map(t => ({
        ...t,
        wins: teamPoints[t.name]?.wins || t.wins,
        // losses isn't on TeamStats directly, logic handles it via played - wins
        points: teamPoints[t.name]?.points || t.points,
        setsWon: teamPoints[t.name]?.setsWon || t.setsWon,
        setsLost: teamPoints[t.name]?.setsLost || t.setsLost,
        played: teamPoints[t.name]?.played || t.played,
    }));
}
