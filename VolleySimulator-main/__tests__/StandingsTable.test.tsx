import React from 'react';
import { render, screen } from '@testing-library/react';
import StandingsTable from '../app/components/Calculator/StandingsTable';
import { TeamStats } from '../app/types';

// Mock TeamAvatar to avoid complexity with images/next
jest.mock('../app/components/TeamAvatar', () => {
    return function MockTeamAvatar({ name }: { name: string }) {
        return <div data-testid="team-avatar">{name}</div>;
    };
});

describe('StandingsTable', () => {
    const mockTeams: TeamStats[] = [
        { name: 'Team A', played: 10, wins: 8, points: 24, setsWon: 24, setsLost: 6, groupName: 'A' },
        { name: 'Team B', played: 10, wins: 7, points: 21, setsWon: 21, setsLost: 9, groupName: 'A' },
        { name: 'Team C', played: 10, wins: 2, points: 6, setsWon: 6, setsLost: 24, groupName: 'A' },
    ];

    it('renders teams correctly', () => {
        render(<StandingsTable teams={mockTeams} />);

        // Team names appear multiple times (avatar and span), so use getAllByText
        expect(screen.getAllByText(/Team A/).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/Team B/).length).toBeGreaterThan(0);
        // Points column for Team A (24) should exist, possibly multiple times
        expect(screen.getAllByText('24').length).toBeGreaterThan(0);
    });

    it('highlights champion correctly', () => {
        render(<StandingsTable teams={mockTeams} />);

        // Champion is first index. 
        // We can check for the crown icon we know is in the code
        expect(screen.getByText('👑')).toBeInTheDocument();
    });

    it('displays comparison diffs when provided', () => {
        const diffs = [
            { name: 'Team A', rankDiff: 1, pointDiff: 3, winDiff: 1 }
        ];

        render(<StandingsTable teams={mockTeams} comparisonDiffs={diffs} />);

        // Expect to see rank change icon
        expect(screen.getByText('▲1')).toBeInTheDocument();
        // Expect to see point diff
        expect(screen.getByText('+3')).toBeInTheDocument();
    });
});
