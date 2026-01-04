/**
 * Simulation Worker - Voleybol Lig Simülasyon Motoru
 * 
 * Bu worker, main thread'den bağımsız çalışarak UI'ı bloklamadan
 * 100+ maçı milisaniyeler içinde simüle eder.
 * 
 * Pure Functions - Hiçbir dış bağımlılık yok (API, DB, DOM)
 */

import type {
  WorkerMessage,
  WorkerResponse,
  SimulationInput,
  SimulationResult,
  SimulatedMatch,
  SimulatedStanding,
  SimulationConfig,
  SimTeam,
  SimMatch,
  SimStanding,
} from '@/types/simulation';

// ─────────────────────────────────────────────────────────────────────────────
// Yardımcı Fonksiyonlar
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Gaussian dağılımlı rastgele sayı üreteci (Box-Muller transform)
 */
function gaussianRandom(mean: number = 0, stdDev: number = 1): number {
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return z0 * stdDev + mean;
}

/**
 * Takım gücünü normalize et (0-100 arası)
 */
function normalizeStrength(strength: number | null): number {
  if (!strength) return 50;
  // Strength 800-1200 arasında varsayalım, 0-100'e normalize et
  return Math.max(0, Math.min(100, ((strength - 800) / 400) * 100));
}

/**
 * Kazanma olasılığını hesapla (Bradley-Terry modeli benzeri)
 */
function calculateWinProbability(
  homeStrength: number,
  awayStrength: number,
  config: SimulationConfig
): number {
  const homeAdvantageBonus = config.homeAdvantage * 10; // 0-10 puan bonus
  const adjustedHomeStrength = homeStrength + homeAdvantageBonus;
  
  // Logistic function
  const strengthDiff = (adjustedHomeStrength - awayStrength) * config.strengthFactor;
  const probability = 1 / (1 + Math.exp(-strengthDiff / 20));
  
  // Rastgelelik ekle
  const noise = (Math.random() - 0.5) * config.randomness * 0.4;
  
  return Math.max(0.05, Math.min(0.95, probability + noise));
}

/**
 * Set skorunu simüle et (3-0, 3-1, 3-2)
 */
function simulateSetScore(winProbability: number): { homeScore: number; awayScore: number } {
  const homeWins = Math.random() < winProbability;
  
  // Dominant kazanma olasılığı güce bağlı
  const dominance = Math.abs(winProbability - 0.5) * 2; // 0-1 arası
  
  let setScore: [number, number];
  
  if (homeWins) {
    const rand = Math.random();
    if (rand < 0.3 + dominance * 0.3) {
      setScore = [3, 0]; // Dominant kazanma
    } else if (rand < 0.6 + dominance * 0.2) {
      setScore = [3, 1];
    } else {
      setScore = [3, 2]; // Yakın maç
    }
  } else {
    const rand = Math.random();
    if (rand < 0.3 + dominance * 0.3) {
      setScore = [0, 3];
    } else if (rand < 0.6 + dominance * 0.2) {
      setScore = [1, 3];
    } else {
      setScore = [2, 3];
    }
  }
  
  return { homeScore: setScore[0], awayScore: setScore[1] };
}

// ─────────────────────────────────────────────────────────────────────────────
// Maç Simülasyonu
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Tek bir maçı simüle et
 */
function simulateMatch(
  match: SimMatch,
  homeTeam: SimTeam,
  awayTeam: SimTeam,
  config: SimulationConfig
): SimulatedMatch {
  const homeStrength = normalizeStrength(homeTeam.strengthRating);
  const awayStrength = normalizeStrength(awayTeam.strengthRating);
  
  const winProbability = calculateWinProbability(homeStrength, awayStrength, config);
  const { homeScore, awayScore } = simulateSetScore(winProbability);
  
  return {
    ...match,
    homeScore: homeScore,
    awayScore: awayScore,
    status: 'finished',
    isSimulated: true,
    homeWinProbability: winProbability,
    confidence: 1 - config.randomness,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Puan Durumu Hesaplama
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Maç sonucuna göre puan hesapla (TVF kuralları)
 */
function calculatePoints(homeScore: number, awayScore: number): { homePoints: number; awayPoints: number } {
  if (homeScore === 3) {
    if (awayScore === 0 || awayScore === 1) {
      return { homePoints: 3, awayPoints: 0 }; // 3-0 veya 3-1
    } else {
      return { homePoints: 2, awayPoints: 1 }; // 3-2
    }
  } else {
    if (homeScore === 0 || homeScore === 1) {
      return { homePoints: 0, awayPoints: 3 }; // 0-3 veya 1-3
    } else {
      return { homePoints: 1, awayPoints: 2 }; // 2-3
    }
  }
}

/**
 * Tüm maçlardan puan durumunu hesapla
 */
function calculateStandings(
  teams: SimTeam[],
  matches: SimulatedMatch[],
  currentStandings: SimStanding[]
): SimulatedStanding[] {
  // Takım istatistiklerini başlat
  const statsMap = new Map<string, {
    played: number;
    won: number;
    lost: number;
    setsWon: number;
    setsLost: number;
    points: number;
  }>();
  
  teams.forEach(team => {
    statsMap.set(team.id, {
      played: 0,
      won: 0,
      lost: 0,
      setsWon: 0,
      setsLost: 0,
      points: 0,
    });
  });
  
  // Tüm maçları işle
  matches.forEach(match => {
    if (match.status !== 'finished' || match.homeScore === null || match.awayScore === null) return;
    
    const homeStats = statsMap.get(match.homeTeamId || '');
    const awayStats = statsMap.get(match.awayTeamId || '');
    
    if (!homeStats || !awayStats) return;
    
    const { homePoints, awayPoints } = calculatePoints(match.homeScore, match.awayScore);
    
    homeStats.played++;
    awayStats.played++;
    homeStats.setsWon += match.homeScore;
    homeStats.setsLost += match.awayScore;
    awayStats.setsWon += match.awayScore;
    awayStats.setsLost += match.homeScore;
    homeStats.points += homePoints;
    awayStats.points += awayPoints;
    
    if (match.homeScore > match.awayScore) {
      homeStats.won++;
      awayStats.lost++;
    } else {
      awayStats.won++;
      homeStats.lost++;
    }
  });
  
  // Önceki pozisyonları kaydet
  const previousPositions = new Map<string, number>();
  currentStandings.forEach(s => {
    previousPositions.set(s.teamId || '', s.position || 0);
  });
  
  // Sıralama yap
  const sortedTeams = teams
    .map(team => {
      const stats = statsMap.get(team.id) || { played: 0, won: 0, lost: 0, setsWon: 0, setsLost: 0, points: 0 };
      return { team, stats };
    })
    .sort((a, b) => {
      // 1. Puana göre
      if (b.stats.points !== a.stats.points) return b.stats.points - a.stats.points;
      // 2. Set averajına göre
      const aSetRatio = a.stats.setsLost > 0 ? a.stats.setsWon / a.stats.setsLost : a.stats.setsWon;
      const bSetRatio = b.stats.setsLost > 0 ? b.stats.setsWon / b.stats.setsLost : b.stats.setsWon;
      return bSetRatio - aSetRatio;
    });
  
  // SimulatedStanding oluştur
  return sortedTeams.map((item, index) => {
    const position = index + 1;
    const previousPos = previousPositions.get(item.team.id) || position;
    
    const currentStanding = currentStandings.find(s => s.teamId === item.team.id);
    
    return {
      id: currentStanding?.id || `sim-${item.team.id}`,
      leagueId: currentStanding?.leagueId || '',
      teamId: item.team.id,
      teamName: item.team.name,
      position,
      played: item.stats.played,
      won: item.stats.won,
      lost: item.stats.lost,
      setsWon: item.stats.setsWon,
      setsLost: item.stats.setsLost,
      points: item.stats.points,
      groupId: currentStanding?.groupId || null,
      // Simülasyon-spesifik alanlar
      positionChange: previousPos - position,
      previousPosition: previousPos,
    } as SimulatedStanding;
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Ana Simülasyon Fonksiyonu
// ─────────────────────────────────────────────────────────────────────────────

function runSimulation(input: SimulationInput): SimulationResult {
  const startTime = performance.now();
  
  const config: SimulationConfig = {
    strengthFactor: input.config?.strengthFactor ?? 0.7,
    homeAdvantage: input.config?.homeAdvantage ?? 0.1,
    formImpact: input.config?.formImpact ?? 0.2,
    randomness: input.config?.randomness ?? 0.3,
  };
  
  const { teams, matches, currentStandings } = input;
  
  // Takım haritası oluştur (hızlı lookup için)
  const teamMap = new Map(teams.map(t => [t.id, t]));
  
  // Maçları simüle et
  const simulatedMatches: SimulatedMatch[] = matches.map(match => {
    // Zaten bitmiş maçları olduğu gibi bırak
    if (match.status === 'finished') {
      return { ...match, isSimulated: false } as SimulatedMatch;
    }
    
    const homeTeam = teamMap.get(match.homeTeamId || '');
    const awayTeam = teamMap.get(match.awayTeamId || '');
    
    if (!homeTeam || !awayTeam) {
      return { ...match, isSimulated: false } as SimulatedMatch;
    }
    
    return simulateMatch(match, homeTeam, awayTeam, config);
  });
  
  // Puan durumunu hesapla
  const finalStandings = calculateStandings(teams, simulatedMatches, currentStandings);
  
  const endTime = performance.now();
  
  return {
    simulatedMatches,
    finalStandings,
    meta: {
      duration: Math.round(endTime - startTime),
      matchCount: simulatedMatches.filter(m => m.isSimulated).length,
      config,
      timestamp: new Date().toISOString(),
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Worker Event Handler
// ─────────────────────────────────────────────────────────────────────────────

self.onmessage = (event: MessageEvent<WorkerMessage>) => {
  const { type } = event.data;
  
  switch (type) {
    case 'START_SIMULATION': {
      try {
        const result = runSimulation(event.data.payload);
        
        const response: WorkerResponse = {
          type: 'SIMULATION_COMPLETE',
          payload: result,
        };
        
        self.postMessage(response);
      } catch (error) {
        const errorResponse: WorkerResponse = {
          type: 'ERROR',
          error: error instanceof Error ? error.message : 'Simulation failed',
        };
        self.postMessage(errorResponse);
      }
      break;
    }
    
    case 'CANCEL_SIMULATION': {
      // Şu an için basit implementasyon
      // İleriki versiyonlarda AbortController kullanılabilir
      break;
    }
    
    default:
      console.warn('Unknown message type:', type);
  }
};

// Worker hazır olduğunu bildir
self.postMessage({ type: 'READY' } as WorkerResponse);
