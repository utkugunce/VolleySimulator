import {
    SCORES,
    getOutcomeFromScore,
    sortStandings,
    normalizeTeamName,
    calculateLiveStandings
} from '../calculatorUtils';
import { TeamStats, Match } from '../../types';

describe('calculatorUtils', () => {
    describe('SCORES', () => {
        it('should contain all valid volleyball scores', () => {
            expect(SCORES).toEqual(['3-0', '3-1', '3-2', '2-3', '1-3', '0-3']);
        });
    });

    describe('getOutcomeFromScore', () => {
        it('should return correct outcome for 3-0 (home win)', () => {
            const outcome = getOutcomeFromScore('3-0');
            expect(outcome).toEqual({
                homeSets: 3,
                awaySets: 0,
                homePoints: 3,
                awayPoints: 0,
                homeWin: true
            });
        });

        it('should return correct outcome for 3-1 (home win)', () => {
            const outcome = getOutcomeFromScore('3-1');
            expect(outcome).toEqual({
                homeSets: 3,
                awaySets: 1,
                homePoints: 3,
                awayPoints: 0,
                homeWin: true
            });
        });

        it('should return correct outcome for 3-2 (home win with bonus)', () => {
            const outcome = getOutcomeFromScore('3-2');
            expect(outcome).toEqual({
                homeSets: 3,
                awaySets: 2,
                homePoints: 2,
                awayPoints: 1,
                homeWin: true
            });
        });

        it('should return correct outcome for 2-3 (away win with bonus)', () => {
            const outcome = getOutcomeFromScore('2-3');
            expect(outcome).toEqual({
                homeSets: 2,
                awaySets: 3,
                homePoints: 1,
                awayPoints: 2,
                homeWin: false
            });
        });

        it('should return correct outcome for 1-3 (away win)', () => {
            const outcome = getOutcomeFromScore('1-3');
            expect(outcome).toEqual({
                homeSets: 1,
                awaySets: 3,
                homePoints: 0,
                awayPoints: 3,
                homeWin: false
            });
        });

        it('should return correct outcome for 0-3 (away win)', () => {
            const outcome = getOutcomeFromScore('0-3');
            expect(outcome).toEqual({
                homeSets: 0,
                awaySets: 3,
                homePoints: 0,
                awayPoints: 3,
                homeWin: false
            });
        });

        it('should return null for invalid scores', () => {
            expect(getOutcomeFromScore('2-2')).toBeNull();
            expect(getOutcomeFromScore('4-0')).toBeNull();
            expect(getOutcomeFromScore('invalid')).toBeNull();
            expect(getOutcomeFromScore('')).toBeNull();
        });
    });

    describe('normalizeTeamName', () => {
        it('should normalize Turkish characters', () => {
            expect(normalizeTeamName('İstanbul')).toBe('ISTANBUL');
            expect(normalizeTeamName('Fenerbahçe')).toBe('FENERBAHE');
        });

        it('should remove spaces and special characters', () => {
            expect(normalizeTeamName('Team A B')).toBe('TEAMAB');
            expect(normalizeTeamName('Team-Name')).toBe('TEAMNAME');
        });

        it('should uppercase all characters', () => {
            expect(normalizeTeamName('vakifbank')).toBe('VAKIFBANK');
        });
    });

    describe('sortStandings', () => {
        const createTeam = (name: string, wins: number, points: number, setsWon: number, setsLost: number): TeamStats => ({
            name,
            groupName: 'A',
            played: wins + 1,
            wins,
            points,
            setsWon,
            setsLost
        });

        it('should sort by wins first', () => {
            const teams = [
                createTeam('Team B', 5, 15, 15, 5),
                createTeam('Team A', 10, 30, 30, 10),
            ];
            const sorted = sortStandings(teams);
            expect(sorted[0].name).toBe('Team A');
            expect(sorted[1].name).toBe('Team B');
        });

        it('should sort by points when wins are equal', () => {
            const teams = [
                createTeam('Team B', 5, 12, 15, 5),
                createTeam('Team A', 5, 15, 15, 5),
            ];
            const sorted = sortStandings(teams);
            expect(sorted[0].name).toBe('Team A');
        });

        it('should sort by set ratio when wins and points are equal', () => {
            const teams = [
                createTeam('Team B', 5, 15, 15, 10), // ratio: 1.5
                createTeam('Team A', 5, 15, 20, 10), // ratio: 2.0
            ];
            const sorted = sortStandings(teams);
            expect(sorted[0].name).toBe('Team A');
        });
    });

    describe('calculateLiveStandings', () => {
        const initialTeams: TeamStats[] = [
            { name: 'Team A', groupName: 'G1', played: 0, wins: 0, points: 0, setsWon: 0, setsLost: 0 },
            { name: 'Team B', groupName: 'G1', played: 0, wins: 0, points: 0, setsWon: 0, setsLost: 0 },
        ];

        const matches: Match[] = [
            { homeTeam: 'Team A', awayTeam: 'Team B', groupName: 'G1', isPlayed: false }
        ];

        it('should apply overrides to unplayed matches', () => {
            const overrides = { 'Team A|||Team B': '3-0' };
            const standings = calculateLiveStandings(initialTeams, matches, overrides);

            const teamA = standings.find(t => t.name === 'Team A');
            const teamB = standings.find(t => t.name === 'Team B');

            expect(teamA?.wins).toBe(1);
            expect(teamA?.points).toBe(3);
            expect(teamA?.setsWon).toBe(3);
            expect(teamA?.setsLost).toBe(0);

            expect(teamB?.wins).toBe(0);
            expect(teamB?.points).toBe(0);
            expect(teamB?.setsWon).toBe(0);
            expect(teamB?.setsLost).toBe(3);
        });

        it('should not apply overrides to played matches', () => {
            const playedMatches: Match[] = [
                { homeTeam: 'Team A', awayTeam: 'Team B', groupName: 'G1', isPlayed: true }
            ];
            const overrides = { 'Team A|||Team B': '3-0' };
            const standings = calculateLiveStandings(initialTeams, playedMatches, overrides);

            const teamA = standings.find(t => t.name === 'Team A');
            expect(teamA?.wins).toBe(0); // Should remain unchanged
        });

        it('should return sorted standings', () => {
            const standings = calculateLiveStandings(initialTeams, matches, { 'Team A|||Team B': '3-0' });
            expect(standings[0].name).toBe('Team A'); // Winner should be first
        });
    });
});
