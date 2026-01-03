import { NextRequest, NextResponse } from 'next/server';

// GET /api/ai/analysis - Get AI match analysis
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const homeTeam = searchParams.get('homeTeam');
    const awayTeam = searchParams.get('awayTeam');

    if (!homeTeam || !awayTeam) {
      return NextResponse.json({ error: 'Home and away teams are required' }, { status: 400 });
    }

    // In production, fetch real data and run analysis
    const analysis = {
      homeTeam,
      awayTeam,
      headToHead: {
        totalMatches: 15,
        homeWins: 9,
        awayWins: 6,
        lastFiveResults: [
          { date: '2024-01-15', homeScore: 3, awayScore: 1, winner: 'home' },
          { date: '2023-12-20', homeScore: 2, awayScore: 3, winner: 'away' },
          { date: '2023-11-10', homeScore: 3, awayScore: 0, winner: 'home' },
          { date: '2023-10-05', homeScore: 3, awayScore: 2, winner: 'home' },
          { date: '2023-09-15', homeScore: 1, awayScore: 3, winner: 'away' },
        ],
        averageSetsPerMatch: 4.2,
        averagePointDiff: 3.5,
      },
      homeTeamForm: {
        lastFiveMatches: ['W', 'W', 'L', 'W', 'W'],
        formPercentage: 80,
        goalsScored: 78,
        goalsConceded: 65,
        winStreak: 2,
        recentOpponents: ['Team A', 'Team B', 'Team C', 'Team D', 'Team E'],
      },
      awayTeamForm: {
        lastFiveMatches: ['L', 'W', 'W', 'L', 'W'],
        formPercentage: 60,
        goalsScored: 71,
        goalsConceded: 68,
        winStreak: 1,
        recentOpponents: ['Team F', 'Team G', 'Team H', 'Team I', 'Team J'],
      },
      keyPlayers: {
        home: [
          { name: 'Melissa Vargas', position: 'Outside Hitter', rating: 95 },
          { name: 'Arina Fedorovtseva', position: 'Opposite', rating: 92 },
        ],
        away: [
          { name: 'Tijana Bošković', position: 'Opposite', rating: 96 },
          { name: 'Kim Yeon-koung', position: 'Outside Hitter', rating: 91 },
        ],
      },
      statisticalInsights: [
        {
          category: 'Servis',
          home: { value: 4.2, label: 'As/Maç' },
          away: { value: 3.8, label: 'As/Maç' },
          advantage: 'home',
        },
        {
          category: 'Blok',
          home: { value: 8.5, label: 'Blok/Maç' },
          away: { value: 9.2, label: 'Blok/Maç' },
          advantage: 'away',
        },
        {
          category: 'Hücum',
          home: { value: 48.2, label: '%' },
          away: { value: 45.8, label: '%' },
          advantage: 'home',
        },
        {
          category: 'Resepsiyon',
          home: { value: 52.1, label: '%' },
          away: { value: 54.3, label: '%' },
          advantage: 'away',
        },
      ],
      venueAnalysis: {
        venue: 'Burhan Felek Voleybol Salonu',
        capacity: 5000,
        homeWinRate: 72,
        averageAttendance: 3500,
      },
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('Error generating analysis:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
