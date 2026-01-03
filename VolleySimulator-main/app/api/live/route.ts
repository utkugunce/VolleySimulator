import { NextRequest, NextResponse } from 'next/server';

// GET /api/live - Get live matches
export async function GET(request: NextRequest) {
  try {
    // In production, fetch live matches from external API or WebSocket
    const mockLiveMatches = [
      {
        id: 'live-1',
        homeTeam: 'FENERBAHÇE MEDICANA',
        awayTeam: 'ECZACIBAŞI DYNAVİT',
        homeScore: [25, 23, 18],
        awayScore: [21, 25, 15],
        currentSet: 3,
        currentSetScore: { home: 18, away: 15 },
        status: 'live',
        startTime: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
        league: 'vsl',
        venue: 'Burhan Felek Voleybol Salonu',
        viewers: 1245,
        isHighlighted: true,
        setWins: { home: 1, away: 1 },
      },
      {
        id: 'live-2',
        homeTeam: 'VAKIFBANK',
        awayTeam: 'GALATASARAY DAIKIN',
        homeScore: [25, 22],
        awayScore: [19, 25],
        currentSet: 3,
        currentSetScore: { home: 12, away: 10 },
        status: 'live',
        startTime: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
        league: 'vsl',
        venue: 'Vakıf Spor Salonu',
        viewers: 892,
        isHighlighted: false,
        setWins: { home: 1, away: 1 },
      },
    ];

    const mockUpcomingMatches = [
      {
        id: 'upcoming-1',
        homeTeam: 'THY',
        awayTeam: 'NİLÜFER BELEDİYESPOR',
        status: 'upcoming',
        startTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        league: 'vsl',
        venue: 'THY Spor Salonu',
      },
      {
        id: 'upcoming-2',
        homeTeam: 'BEŞİKTAŞ',
        awayTeam: 'ARAS KARGO',
        status: 'upcoming',
        startTime: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
        league: 'vsl',
        venue: 'Beşiktaş Spor Salonu',
      },
    ];

    return NextResponse.json({
      liveMatches: mockLiveMatches,
      upcomingMatches: mockUpcomingMatches,
    });
  } catch (error) {
    console.error('Error fetching live matches:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
