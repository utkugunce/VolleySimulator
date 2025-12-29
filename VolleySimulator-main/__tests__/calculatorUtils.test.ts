import { calculateLiveStandings } from '../app/utils/calculatorUtils';
import { Match, TeamStats } from '../app/types';

describe('calculateLiveStandings', () => {
    const mockTeams: TeamStats[] = [
        { name: 'Team A', played: 0, wins: 0, points: 0, setsWon: 0, setsLost: 0, groupName: 'A' },
        { name: 'Team B', played: 0, wins: 0, points: 0, setsWon: 0, setsLost: 0, groupName: 'A' },
    ];

    const mockFixture: Match[] = [
        { homeTeam: 'Team A', awayTeam: 'Team B', matchDate: '2025-01-01', matchTime: '12:00', isPlayed: false, groupName: 'A' }
    ];

    it('should return initial standings when no matches played', () => {
        const standings = calculateLiveStandings(mockTeams, mockFixture, {});
        expect(standings).toHaveLength(2);
        expect(standings[0].points).toBe(0);
    });

    it('should update standings with 3-0 win override', () => {
        const overrides = {
            'Team A|||Team B': '3-0'
        };
        const standings = calculateLiveStandings(mockTeams, mockFixture, overrides);

        const winner = standings.find(t => t.name === 'Team A');
        const loser = standings.find(t => t.name === 'Team B');

        expect(winner?.points).toBe(3);
        expect(winner?.wins).toBe(1);
        expect(winner?.setsWon).toBe(3);
        expect(loser?.points).toBe(0);
    });

    it('should update standings with 3-2 win override', () => {
        const overrides = {
            'Team A|||Team B': '3-2'
        };
        const standings = calculateLiveStandings(mockTeams, mockFixture, overrides);

        const winner = standings.find(t => t.name === 'Team A');
        const loser = standings.find(t => t.name === 'Team B');

        expect(winner?.points).toBe(2);
        expect(loser?.points).toBe(1);
    });
});
