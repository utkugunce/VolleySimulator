import { NextRequest, NextResponse } from 'next/server';

// POST /api/ai/prediction - Get AI prediction for a match
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { matchId, homeTeam, awayTeam, league } = body;

    if (!homeTeam || !awayTeam) {
      return NextResponse.json({ error: 'Home and away teams are required' }, { status: 400 });
    }

    // In production, this would call an ML model or prediction service
    // For now, generate a mock prediction based on team names

    // Simulate some AI processing time
    await new Promise(resolve => setTimeout(resolve, 500));

    // Generate prediction probabilities (mock)
    const homeStrength = getTeamStrength(homeTeam);
    const awayStrength = getTeamStrength(awayTeam);
    const total = homeStrength + awayStrength;

    const homeWinProb = Math.round((homeStrength / total) * 100);
    const awayWinProb = 100 - homeWinProb;

    // Generate predicted score (mock)
    const predictedSets = homeWinProb > awayWinProb 
      ? generateSetScore(true) 
      : generateSetScore(false);

    const prediction = {
      matchId: matchId || `${homeTeam}-vs-${awayTeam}`,
      homeTeam,
      awayTeam,
      prediction: {
        homeWinProbability: homeWinProb,
        awayWinProbability: awayWinProb,
        predictedWinner: homeWinProb > awayWinProb ? 'home' : 'away',
        predictedScore: predictedSets.join('-'),
        confidence: Math.abs(homeWinProb - 50) + 50,
        reasoning: generateReasoning(homeTeam, awayTeam, homeWinProb > awayWinProb),
      },
      factors: {
        recentForm: {
          home: Math.floor(Math.random() * 30) + 60,
          away: Math.floor(Math.random() * 30) + 60,
        },
        headToHead: {
          home: Math.floor(Math.random() * 5),
          away: Math.floor(Math.random() * 5),
        },
        homeAdvantage: 5 + Math.floor(Math.random() * 10),
        injuries: Math.random() > 0.7 ? 'minor' : 'none',
      },
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json({ prediction });
  } catch (error) {
    console.error('Error generating AI prediction:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper functions
function getTeamStrength(teamName: string): number {
  // Mock team strengths based on known teams
  const strengths: Record<string, number> = {
    'FENERBAHÇE MEDICANA': 95,
    'ECZACIBAŞI DYNAVİT': 93,
    'VAKIFBANK': 94,
    'GALATASARAY DAIKIN': 88,
    'THY': 82,
    'NİLÜFER BELEDİYESPOR': 78,
    'BEŞİKTAŞ': 75,
    'ARAS KARGO': 72,
    'KUZEYBORUİSTANBUL': 68,
    'SIGORTA SHOP': 65,
    'PTT': 62,
    'TOKAT BELEDİYE PLEVNE': 58,
  };

  return strengths[teamName] || 70 + Math.floor(Math.random() * 20);
}

function generateSetScore(homeWins: boolean): number[] {
  const outcomes = [
    [3, 0], [3, 1], [3, 2],
    [0, 3], [1, 3], [2, 3]
  ];
  
  const homeOutcomes = outcomes.filter(o => homeWins ? o[0] > o[1] : o[0] < o[1]);
  return homeOutcomes[Math.floor(Math.random() * homeOutcomes.length)];
}

function generateReasoning(homeTeam: string, awayTeam: string, homeWins: boolean): string[] {
  const winner = homeWins ? homeTeam : awayTeam;
  const loser = homeWins ? awayTeam : homeTeam;

  const reasons = [
    `${winner} son 5 maçta 4 galibiyet aldı`,
    `${winner} takımı ev sahibi avantajını kullanıyor`,
    `${winner} servis istatistiklerinde üstün`,
    `${loser} takımında sakat oyuncular var`,
    `${winner} head-to-head istatistiklerinde önde`,
    `${winner} blok etkinliğinde daha başarılı`,
    `${winner} takımı hücum etkinliğinde %5 daha iyi`,
  ];

  // Return 3-4 random reasons
  const shuffled = reasons.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3 + Math.floor(Math.random() * 2));
}
