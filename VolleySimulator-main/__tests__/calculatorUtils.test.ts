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

    it('should calculate set ratio correctly', () => {
        const teams: TeamStats[] = [
            { name: 'Team A', played: 1, wins: 1, points: 3, setsWon: 3, setsLost: 0, groupName: 'A' },
            { name: 'Team B', played: 1, wins: 1, points: 2, setsWon: 3, setsLost: 2, groupName: 'A' }
        ];

        // Mock sorting function call via sortStandings
        // But here calculateLiveStandings calls sortStandings internally.
        // Let's test the sorting logic via calculateLiveStandings return order.

        const standings = calculateLiveStandings(teams, [], {});
        // Team A (Ratio MAX/3.0) should be above Team B (Ratio 1.5)
        expect(standings[0].name).toBe('Team A');
        expect(standings[1].name).toBe('Team B');
    });

    it('should sort by Wins first, then Points, then Set Ratio', () => {
        const teams: TeamStats[] = [
            { name: 'Team Wins', played: 5, wins: 4, points: 10, setsWon: 12, setsLost: 5, groupName: 'A' },  // 4 wins
            { name: 'Team Points', played: 5, wins: 3, points: 11, setsWon: 12, setsLost: 5, groupName: 'A' }, // 3 wins, but more points
            { name: 'Team Ratio', played: 5, wins: 3, points: 9, setsWon: 12, setsLost: 5, groupName: 'A' }
        ];

        const standings = calculateLiveStandings(teams, [], {});

        expect(standings[0].name).toBe('Team Wins'); // Most wins
        expect(standings[1].name).toBe('Team Points'); // Fewer wins, but more points than remaining
        expect(standings[2].name).toBe('Team Ratio');
    });

    it('should handle turkish characters in team names correctly', () => {
        const turkishTeams: TeamStats[] = [
            { name: 'VakıfBank', played: 0, wins: 0, points: 0, setsWon: 0, setsLost: 0, groupName: 'A' },
            { name: 'Fenerbahçe', played: 0, wins: 0, points: 0, setsWon: 0, setsLost: 0, groupName: 'A' },
        ];

        const turkishFixture: Match[] = [
            { homeTeam: 'VakifBank', awayTeam: 'Fenerbahce', matchDate: '2025-01-01', matchTime: '12:00', isPlayed: false, groupName: 'A' }
        ];

        // Override must match the fixture's string exactly for lookup
        const overrides = {
            'VakifBank|||Fenerbahce': '3-0'
        };

        const standings = calculateLiveStandings(turkishTeams, turkishFixture, overrides);
        const winner = standings.find(t => t.name === 'VakıfBank');

        // Should find match and apply score despite potential minor string diffs if normalization works
        expect(winner?.points).toBe(3);
    });
});
