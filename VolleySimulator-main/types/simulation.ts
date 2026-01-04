/**
 * Simulation Types - Worker ve Main Thread arasında paylaşılan tipler
 * 
 * Bu dosya hem client hem de worker tarafından kullanılır.
 * Simülasyona özel basitleştirilmiş tipler içerir.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Simülasyon için Basitleştirilmiş Tipler
// (DB tiplerinden bağımsız, Worker'da çalışabilir)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Simülasyon için takım tipi
 */
export interface SimTeam {
  id: string;
  name: string;
  shortName?: string;
  leagueId: string;
  groupId?: string | null;
  strengthRating: number;
  logoUrl?: string | null;
}

/**
 * Simülasyon için maç tipi
 */
export interface SimMatch {
  id: string;
  leagueId: string;
  homeTeamId: string;
  awayTeamId: string;
  homeTeamName: string;
  awayTeamName: string;
  homeScore: number | null;
  awayScore: number | null;
  status: 'scheduled' | 'live' | 'finished';
  matchDate?: string | null;
  week?: number | null;
  round?: string | null;
  groupId?: string | null;
}

/**
 * Simülasyon için puan durumu tipi
 */
export interface SimStanding {
  id: string;
  teamId: string;
  teamName: string;
  leagueId: string;
  position: number;
  played: number;
  won: number;
  lost: number;
  setsWon: number;
  setsLost: number;
  points: number;
  groupId?: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Simülasyon Input/Output Tipleri
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Simülasyon motoruna gidecek input
 */
export interface SimulationInput {
  /** Ligdeki tüm takımlar */
  teams: SimTeam[];
  /** Henüz oynanmamış maçlar (status !== 'finished') */
  matches: SimMatch[];
  /** Mevcut puan durumu */
  currentStandings: SimStanding[];
  /** Simülasyon konfigürasyonu */
  config?: SimulationConfig;
}

/**
 * Simülasyon konfigürasyonu
 */
export interface SimulationConfig {
  /** Takım gücü faktörü (0-1 arası, 1 = tam etki) */
  strengthFactor: number;
  /** Ev sahibi avantajı faktörü */
  homeAdvantage: number;
  /** Form durumu etkisi */
  formImpact: number;
  /** Rastgelelik seviyesi (0 = deterministik, 1 = tam rastgele) */
  randomness: number;
}

/**
 * Simülasyon motorundan dönecek output
 */
export interface SimulationResult {
  /** Sonuçları tahmin edilmiş maçlar */
  simulatedMatches: SimulatedMatch[];
  /** Güncellenmiş puan durumu */
  finalStandings: SimulatedStanding[];
  /** Simülasyon meta verileri */
  meta: SimulationMeta;
}

/**
 * Simülasyon meta verileri
 */
export interface SimulationMeta {
  /** Simülasyon süresi (ms) */
  duration: number;
  /** Simüle edilen maç sayısı */
  matchCount: number;
  /** Kullanılan config */
  config: SimulationConfig;
  /** Timestamp */
  timestamp: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Simüle Edilmiş Veri Tipleri
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Simüle edilmiş maç (orijinal maç + tahmin edilen sonuç)
 */
export interface SimulatedMatch extends SimMatch {
  /** Bu maç simüle mi edildi yoksa gerçek sonuç mu? */
  isSimulated: boolean;
  /** Ev sahibi kazanma olasılığı (0-1) */
  homeWinProbability?: number;
  /** Tahmin güvenilirliği (0-1) */
  confidence?: number;
}

/**
 * Simüle edilmiş puan durumu
 */
export interface SimulatedStanding extends SimStanding {
  /** Pozisyon değişimi (örn: +2, -1, 0) */
  positionChange: number;
  /** Önceki pozisyon */
  previousPosition: number;
  /** Playoff olasılığı (0-100) */
  playoffProbability?: number;
  /** Şampiyonluk olasılığı (0-100) */
  championProbability?: number;
  /** Küme düşme olasılığı (0-100) */
  relegationProbability?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Worker İletişim Mesajları
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Main Thread → Worker mesajları
 */
export type WorkerMessage =
  | { type: 'START_SIMULATION'; payload: SimulationInput }
  | { type: 'UPDATE_CONFIG'; payload: Partial<SimulationConfig> }
  | { type: 'CANCEL_SIMULATION' }
  | { type: 'RUN_MONTE_CARLO'; payload: { input: SimulationInput; iterations: number } };

/**
 * Worker → Main Thread mesajları
 */
export type WorkerResponse =
  | { type: 'SIMULATION_COMPLETE'; payload: SimulationResult }
  | { type: 'SIMULATION_PROGRESS'; payload: { progress: number; currentMatch?: string } }
  | { type: 'MONTE_CARLO_COMPLETE'; payload: MonteCarloResult }
  | { type: 'ERROR'; error: string }
  | { type: 'READY' };

// ─────────────────────────────────────────────────────────────────────────────
// Monte Carlo Simülasyonu
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Monte Carlo simülasyon sonucu
 * Birden fazla simülasyon çalıştırıp istatistiksel sonuçlar üretir
 */
export interface MonteCarloResult {
  /** Çalıştırılan iterasyon sayısı */
  iterations: number;
  /** Her takımın pozisyon dağılımı */
  positionDistributions: Map<string, PositionDistribution>;
  /** Playoff olasılıkları */
  playoffProbabilities: TeamProbability[];
  /** Şampiyonluk olasılıkları */
  championProbabilities: TeamProbability[];
  /** Küme düşme olasılıkları */
  relegationProbabilities: TeamProbability[];
}

/**
 * Takımın pozisyon dağılımı
 */
export interface PositionDistribution {
  teamId: string;
  teamName: string;
  /** Pozisyon -> Olasılık (0-100) */
  positions: Record<number, number>;
  /** Ortalama pozisyon */
  averagePosition: number;
  /** Standart sapma */
  standardDeviation: number;
}

/**
 * Takım olasılık verisi
 */
export interface TeamProbability {
  teamId: string;
  teamName: string;
  probability: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Default Değerler
// ─────────────────────────────────────────────────────────────────────────────

export const DEFAULT_SIMULATION_CONFIG: SimulationConfig = {
  strengthFactor: 0.7,
  homeAdvantage: 0.1,
  formImpact: 0.2,
  randomness: 0.3,
};
