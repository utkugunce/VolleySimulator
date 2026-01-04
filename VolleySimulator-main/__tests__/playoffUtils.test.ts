import { generateQuarterGroups, GroupStanding } from '../app/lib/calculation/playoffUtils';
import { TeamStats } from '../app/types';

// Mock calculateElo
jest.mock('../app/lib/calculation/eloCalculator', () => ({
    calculateElo: jest.fn().mockReturnValue(new Map()),
}));

describe('playoffUtils', () => {
    describe('generateQuarterGroups', () => {
        it('should generate 8 groups (A-H)', () => {
            // Mock standings
            const standings: GroupStanding[] = [];
            for (let i = 1; i <= 16; i++) {
                standings.push({
                    groupName: `${i}. GR`,
                    first: { name: `Team ${i}A`, points: 10 } as TeamStats,
                    second: { name: `Team ${i}B`, points: 5 } as TeamStats,
                    teams: []
                });
            }

            const groups = generateQuarterGroups(standings, []);
            expect(groups).toHaveLength(8);
            expect(groups.map(g => g.groupName)).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']);
        });

        it('should assign correct teams to Group A', () => {
             // Group A: 1st of Gr 1, 1st of Gr 16, 2nd of Gr 8, 2nd of Gr 9
             const standings: GroupStanding[] = [];
             for (let i = 1; i <= 16; i++) {
                 standings.push({
                     groupName: `${i}. GR`,
                     first: { name: `Team ${i}A`, points: 10 } as TeamStats,
                     second: { name: `Team ${i}B`, points: 5 } as TeamStats,
                     teams: []
                 });
             }
 
             const groups = generateQuarterGroups(standings, []);
             const groupA = groups.find(g => g.groupName === 'A');
             
             expect(groupA).toBeDefined();
             const teamNames = groupA!.teams.map(t => t.name);
             expect(teamNames).toContain('Team 1A');
             expect(teamNames).toContain('Team 16A');
             expect(teamNames).toContain('Team 8B');
             expect(teamNames).toContain('Team 9B');
        });
    });
});
