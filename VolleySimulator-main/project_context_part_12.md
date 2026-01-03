# Project Application Context - Part 12

## File: app\hooks\usePushNotifications.ts
```
'use client';

import { useState, useEffect, useCallback } from 'react';

interface PushSubscriptionState {
  isSupported: boolean;
  isSubscribed: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook for managing push notification subscriptions
 */
export function usePushNotifications() {
  const [state, setState] = useState<PushSubscriptionState>({
    isSupported: false,
    isSubscribed: false,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    // Check if push notifications are supported
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setState(prev => ({ ...prev, isSupported: false, isLoading: false }));
      return;
    }

    setState(prev => ({ ...prev, isSupported: true }));

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      setState(prev => ({
        ...prev,
        isSubscribed: !!subscription,
        isLoading: false,
      }));
    } catch {
      setState(prev => ({
        ...prev,
        error: 'Bildirim durumu kontrol edilemedi',
        isLoading: false,
      }));
    }
  };

  const subscribe = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Request notification permission
      const permission = await Notification.requestPermission();
      
      if (permission !== 'granted') {
        setState(prev => ({
          ...prev,
          error: 'Bildirim izni reddedildi',
          isLoading: false,
        }));
        return false;
      }

      const registration = await navigator.serviceWorker.ready;
      
      // Get VAPID public key from environment
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      
      if (!vapidPublicKey) {
        setState(prev => ({
          ...prev,
          error: 'VAPID key bulunamadı',
          isLoading: false,
        }));
        return false;
      }

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      // Send subscription to server
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription),
      });

      if (!response.ok) {
        throw new Error('Sunucu aboneliği kaydedemedi');
      }

      setState(prev => ({
        ...prev,
        isSubscribed: true,
        isLoading: false,
      }));

      return true;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Abonelik başarısız',
        isLoading: false,
      }));
      return false;
    }
  }, []);

  const unsubscribe = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
        
        // Notify server
        await fetch('/api/push/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });
      }

      setState(prev => ({
        ...prev,
        isSubscribed: false,
        isLoading: false,
      }));

      return true;
    } catch {
      setState(prev => ({
        ...prev,
        error: 'Abonelik iptal edilemedi',
        isLoading: false,
      }));
      return false;
    }
  }, []);

  return {
    ...state,
    subscribe,
    unsubscribe,
  };
}

/**
 * Convert VAPID public key from base64 to Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray.buffer;
}

```

## File: app\hooks\useSimulationEngine.ts
```
"use client";

import { useMemo, useCallback } from "react";
import { Match, TeamStats } from "../types";
import { calculateLiveStandings, getOutcomeFromScore, SCORES } from "../utils/calculatorUtils";
import { calculateElo } from "../utils/eloCalculator";

// Types
export type SimulationMode = "smart" | "random";

export interface SimulationResult {
    standings: TeamStats[];
    eloRatings: Map<string, number>;
    completedMatches: number;
    totalMatches: number;
    progress: number;
}

export interface UseSimulationEngineOptions {
    teams: TeamStats[];
    matches: Match[];
    overrides: Record<string, string>;
}

export interface UseSimulationEngineReturn {
    // Computed data
    standings: TeamStats[];
    eloRatings: Map<string, number>;
    teamRanks: Map<string, number>;
    progress: { completed: number; total: number; percentage: number };

    // Actions
    simulateMatch: (matchId: string, score: string) => Record<string, string>;
    autoSimulate: (mode: SimulationMode, unplayedMatches: Match[]) => Record<string, string>;
    clearPredictions: () => Record<string, string>;

    // Utilities
    getTeamElo: (teamName: string) => number;
    predictMatchScore: (homeTeam: string, awayTeam: string) => string;
    getRandomScore: () => string;
}

/**
 * useSimulationEngine - Encapsulates all simulation business logic
 * 
 * This hook separates the calculation/simulation logic from UI concerns,
 * making it testable and reusable across different prediction pages.
 */
export function useSimulationEngine({
    teams,
    matches,
    overrides,
}: UseSimulationEngineOptions): UseSimulationEngineReturn {

    // ============================================
    // COMPUTED VALUES (Memoized)
    // ============================================

    /**
     * Calculate live standings based on current overrides
     */
    const standings = useMemo(() => {
        return calculateLiveStandings(teams, matches, overrides);
    }, [teams, matches, overrides]);

    /**
     * Calculate ELO ratings from played matches
     */
    const eloRatings = useMemo(() => {
        return calculateElo(teams, matches);
    }, [teams, matches]);

    /**
     * Map team names to their current rank
     */
    const teamRanks = useMemo(() => {
        const ranks = new Map<string, number>();
        standings.forEach((team, index) => {
            ranks.set(team.name, index + 1);
        });
        return ranks;
    }, [standings]);

    /**
     * Calculate match completion progress
     */
    const progress = useMemo(() => {
        const unplayedMatches = matches.filter(m => !m.isPlayed);
        const predictedCount = unplayedMatches.filter(m => {
            const matchId = `${m.homeTeam}-${m.awayTeam}`;
            return overrides[matchId] !== undefined;
        }).length;

        return {
            completed: predictedCount,
            total: unplayedMatches.length,
            percentage: unplayedMatches.length > 0
                ? Math.round((predictedCount / unplayedMatches.length) * 100)
                : 100,
        };
    }, [matches, overrides]);

    // ============================================
    // UTILITY FUNCTIONS
    // ============================================

    /**
     * Get ELO rating for a team
     */
    const getTeamElo = useCallback((teamName: string): number => {
        return eloRatings.get(teamName) || 1200;
    }, [eloRatings]);

    /**
     * Predict match score based on ELO difference
     */
    const predictMatchScore = useCallback((homeTeam: string, awayTeam: string): string => {
        const homeElo = getTeamElo(homeTeam);
        const awayElo = getTeamElo(awayTeam);
        const eloDiff = homeElo - awayElo;

        // Calculate win probability using ELO formula
        const homeWinProb = 1 / (1 + Math.pow(10, -eloDiff / 400));

        // Determine score based on probability
        const rand = Math.random();

        if (homeWinProb > 0.65) {
            // Strong home favorite
            return rand < 0.5 ? "3-0" : "3-1";
        } else if (homeWinProb > 0.55) {
            // Slight home favorite
            return rand < 0.4 ? "3-1" : rand < 0.7 ? "3-2" : "3-0";
        } else if (homeWinProb > 0.45) {
            // Toss-up
            return rand < 0.5
                ? (rand < 0.25 ? "3-2" : "3-1")
                : (rand < 0.75 ? "2-3" : "1-3");
        } else if (homeWinProb > 0.35) {
            // Slight away favorite
            return rand < 0.4 ? "1-3" : rand < 0.7 ? "2-3" : "0-3";
        } else {
            // Strong away favorite
            return rand < 0.5 ? "0-3" : "1-3";
        }
    }, [getTeamElo]);

    /**
     * Get a random valid score
     */
    const getRandomScore = useCallback((): string => {
        return SCORES[Math.floor(Math.random() * SCORES.length)];
    }, []);

    // ============================================
    // SIMULATION ACTIONS
    // ============================================

    /**
     * Simulate a single match with a given score
     * Returns new overrides object (immutable)
     */
    const simulateMatch = useCallback((matchId: string, score: string): Record<string, string> => {
        if (!score) {
            // Remove prediction
            const newOverrides = { ...overrides };
            delete newOverrides[matchId];
            return newOverrides;
        }

        // Validate score
        const outcome = getOutcomeFromScore(score);
        if (!outcome) {
            console.warn(`Invalid score: ${score}`);
            return overrides;
        }

        return { ...overrides, [matchId]: score };
    }, [overrides]);

    /**
     * Auto-simulate all unplayed matches
     */
    const autoSimulate = useCallback((
        mode: SimulationMode,
        unplayedMatches: Match[]
    ): Record<string, string> => {
        const newOverrides = { ...overrides };

        unplayedMatches.forEach(match => {
            const matchId = `${match.homeTeam}-${match.awayTeam}`;

            if (mode === "smart") {
                newOverrides[matchId] = predictMatchScore(match.homeTeam, match.awayTeam);
            } else {
                newOverrides[matchId] = getRandomScore();
            }
        });

        return newOverrides;
    }, [overrides, predictMatchScore, getRandomScore]);

    /**
     * Clear all predictions
     */
    const clearPredictions = useCallback((): Record<string, string> => {
        return {};
    }, []);

    // ============================================
    // RETURN
    // ============================================

    return {
        // Computed data
        standings,
        eloRatings,
        teamRanks,
        progress,

        // Actions
        simulateMatch,
        autoSimulate,
        clearPredictions,

        // Utilities
        getTeamElo,
        predictMatchScore,
        getRandomScore,
    };
}

// ============================================
// PURE FUNCTIONS (For Unit Testing)
// ============================================

/**
 * Pure function to calculate win probability from ELO ratings
 */
export function calculateWinProbability(homeElo: number, awayElo: number): number {
    return 1 / (1 + Math.pow(10, -(homeElo - awayElo) / 400));
}

/**
 * Pure function to determine score based on win probability
 */
export function scoreFromProbability(winProb: number, randomValue: number): string {
    if (winProb > 0.65) {
        return randomValue < 0.5 ? "3-0" : "3-1";
    } else if (winProb > 0.55) {
        return randomValue < 0.4 ? "3-1" : randomValue < 0.7 ? "3-2" : "3-0";
    } else if (winProb > 0.45) {
        return randomValue < 0.5
            ? (randomValue < 0.25 ? "3-2" : "3-1")
            : (randomValue < 0.75 ? "2-3" : "1-3");
    } else if (winProb > 0.35) {
        return randomValue < 0.4 ? "1-3" : randomValue < 0.7 ? "2-3" : "0-3";
    } else {
        return randomValue < 0.5 ? "0-3" : "1-3";
    }
}

```

## File: app\hooks\useUndoableAction.ts
```
"use client";

import { useState, useCallback, useRef } from 'react';
import { useToast } from '../components/Toast';

interface UseUndoableActionOptions<T> {
    /** Message to show in the toast */
    message: string;
    /** Duration in ms before undo expires (default: 5000) */
    duration?: number;
    /** Callback when the action is executed */
    onExecute: () => T;
    /** Callback to restore previous state (receives the stored state) */
    onUndo: (previousState: T) => void;
}

/**
 * Hook for creating undoable actions
 * 
 * Usage:
 * ```tsx
 * const { execute } = useUndoableAction({
 *   message: 'Tahminler temizlendi',
 *   onExecute: () => {
 *     const prev = predictions;
 *     setPredictions({});
 *     return prev; // Return state to restore
 *   },
 *   onUndo: (prev) => setPredictions(prev)
 * });
 * 
 * // In button:
 * <button onClick={execute}>Sıfırla</button>
 * ```
 */
export function useUndoableAction<T>({
    message,
    duration = 5000,
    onExecute,
    onUndo,
}: UseUndoableActionOptions<T>) {
    const { showUndoToast } = useToast();
    const previousStateRef = useRef<T | null>(null);
    const [isUndoable, setIsUndoable] = useState(false);

    const execute = useCallback(() => {
        // Store previous state
        const previousState = onExecute();
        previousStateRef.current = previousState;
        setIsUndoable(true);

        // Show undo toast
        showUndoToast(message, () => {
            if (previousStateRef.current !== null) {
                onUndo(previousStateRef.current);
                previousStateRef.current = null;
            }
            setIsUndoable(false);
        }, duration);

        // Clear undo ability after duration
        setTimeout(() => {
            previousStateRef.current = null;
            setIsUndoable(false);
        }, duration);
    }, [message, duration, onExecute, onUndo, showUndoToast]);

    const undo = useCallback(() => {
        if (previousStateRef.current !== null) {
            onUndo(previousStateRef.current);
            previousStateRef.current = null;
            setIsUndoable(false);
        }
    }, [onUndo]);

    return {
        execute,
        undo,
        isUndoable,
    };
}

```

## File: app\hooks\useUserStats.ts
```
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "../utils/supabase";
import { useAuth } from "../context/AuthContext";
import { GameState, AchievementId, LEVEL_THRESHOLDS } from "../types";
import { ACHIEVEMENTS, calculateLevel, getXPForNextLevel, getLevelTitle } from "../utils/gameState";

// Types
interface UserStats {
    user_id: string;
    xp: number;
    level: number;
    favorite_team: string | null;
    achievements: string[];
    stats: {
        totalPredictions: number;
        correctPredictions: number;
        currentStreak: number;
        bestStreak: number;
        predictedChampions: string[];
    };
    sound_enabled: boolean;
    last_active_date: string;
}

const STORAGE_KEY = "volleySimGameState";

// ============================================
// FETCH USER STATS
// ============================================
async function fetchUserStats(userId: string): Promise<GameState> {
    const supabase = createClient();

    // Default state
    const defaultState: GameState = {
        xp: 0,
        level: 1,
        favoriteTeam: null,
        achievements: [],
        quests: [],
        stats: {
            totalPredictions: 0,
            correctPredictions: 0,
            currentStreak: 0,
            bestStreak: 0,
            predictedChampions: [],
        },
        soundEnabled: true,
        lastActiveDate: new Date().toISOString().split("T")[0],
    };

    if (!supabase || userId === "anonymous") {
        // Fallback to localStorage
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            return { ...defaultState, ...JSON.parse(saved) };
        }
        return defaultState;
    }

    const { data, error } = await supabase
        .from("user_stats")
        .select("*")
        .eq("user_id", userId)
        .single();

    if (error || !data) {
        // Try localStorage as fallback
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            return { ...defaultState, ...JSON.parse(saved) };
        }
        return defaultState;
    }

    // Map database fields to GameState
    return {
        xp: data.xp,
        level: data.level,
        favoriteTeam: data.favorite_team,
        achievements: data.achievements.map((id: string) => {
            const def = ACHIEVEMENTS[id as AchievementId];
            return def ? { ...def, unlockedAt: new Date().toISOString() } : null;
        }).filter(Boolean),
        quests: [],
        stats: data.stats,
        soundEnabled: data.sound_enabled,
        lastActiveDate: data.last_active_date,
    };
}

// ============================================
// SAVE USER STATS
// ============================================
async function saveUserStats(userId: string, state: Partial<GameState>): Promise<void> {
    const supabase = createClient();

    if (!supabase || userId === "anonymous") {
        // Fallback to localStorage
        const saved = localStorage.getItem(STORAGE_KEY);
        const existing = saved ? JSON.parse(saved) : {};
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...existing, ...state }));
        return;
    }

    const updateData: Partial<UserStats> = {};

    if (state.xp !== undefined) updateData.xp = state.xp;
    if (state.level !== undefined) updateData.level = state.level;
    if (state.favoriteTeam !== undefined) updateData.favorite_team = state.favoriteTeam;
    if (state.achievements !== undefined) {
        updateData.achievements = state.achievements.map(a => a.id);
    }
    if (state.stats !== undefined) updateData.stats = state.stats;
    if (state.soundEnabled !== undefined) updateData.sound_enabled = state.soundEnabled;

    await supabase
        .from("user_stats")
        .upsert({ user_id: userId, ...updateData }, { onConflict: "user_id" });
}

// ============================================
// REACT QUERY HOOK
// ============================================
export function useUserStats() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const userId = user?.id || "anonymous";

    const query = useQuery({
        queryKey: ["userStats", userId],
        queryFn: () => fetchUserStats(userId),
    });

    const updateMutation = useMutation({
        mutationFn: (updates: Partial<GameState>) => saveUserStats(userId, updates),
        onMutate: async (updates) => {
            await queryClient.cancelQueries({ queryKey: ["userStats", userId] });
            const previous = queryClient.getQueryData<GameState>(["userStats", userId]);

            queryClient.setQueryData<GameState>(["userStats", userId], (old) => ({
                ...old!,
                ...updates,
            }));

            return { previous };
        },
        onError: (err, variables, context) => {
            if (context?.previous) {
                queryClient.setQueryData(["userStats", userId], context.previous);
            }
        },
    });

    const gameState = query.data;

    // Add XP
    const addXP = (amount: number) => {
        if (!gameState) return;
        const newXP = gameState.xp + amount;
        const newLevel = calculateLevel(newXP);
        updateMutation.mutate({ xp: newXP, level: newLevel });
    };

    // Record prediction
    const recordPrediction = (isCorrect: boolean) => {
        if (!gameState) return;
        const newStats = { ...gameState.stats };
        newStats.totalPredictions++;

        if (isCorrect) {
            newStats.correctPredictions++;
            newStats.currentStreak++;
            if (newStats.currentStreak > newStats.bestStreak) {
                newStats.bestStreak = newStats.currentStreak;
            }
        } else {
            newStats.currentStreak = 0;
        }

        updateMutation.mutate({ stats: newStats });
    };

    // Unlock achievement
    const unlockAchievement = (id: AchievementId): boolean => {
        if (!gameState) return false;
        if (gameState.achievements.some(a => a.id === id)) return false;

        const def = ACHIEVEMENTS[id];
        if (!def) return false;

        const newAchievement = { ...def, unlockedAt: new Date().toISOString() };
        const newXP = gameState.xp + def.xpReward;

        updateMutation.mutate({
            xp: newXP,
            level: calculateLevel(newXP),
            achievements: [...gameState.achievements, newAchievement],
        });

        return true;
    };

    // Set favorite team
    const setFavoriteTeam = (teamName: string | null) => {
        updateMutation.mutate({ favoriteTeam: teamName });
    };

    // Toggle sound
    const toggleSound = () => {
        if (!gameState) return;
        updateMutation.mutate({ soundEnabled: !gameState.soundEnabled });
    };

    return {
        gameState: gameState || {
            xp: 0,
            level: 1,
            favoriteTeam: null,
            achievements: [],
            quests: [],
            stats: { totalPredictions: 0, correctPredictions: 0, currentStreak: 0, bestStreak: 0, predictedChampions: [] },
            soundEnabled: true,
            lastActiveDate: new Date().toISOString().split("T")[0],
        },
        isLoaded: !query.isLoading,
        isLoading: query.isLoading,
        addXP,
        recordPrediction,
        unlockAchievement,
        setFavoriteTeam,
        toggleSound,
        hasAchievement: (id: AchievementId) => gameState?.achievements.some(a => a.id === id) || false,
        getLevelTitle: () => getLevelTitle(gameState?.level || 1),
        getXPProgress: () => {
            const level = gameState?.level || 1;
            const xp = gameState?.xp || 0;
            const currentLevelXP = LEVEL_THRESHOLDS[level - 1] || 0;
            const nextLevelXP = getXPForNextLevel(level);
            const progress = xp - currentLevelXP;
            const required = nextLevelXP - currentLevelXP;
            return { progress, required, percentage: (progress / required) * 100 };
        },
    };
}

```

## File: app\leaderboard\LeaderboardClient.tsx
```
"use client";

import { useState, useEffect } from "react";

import { useAuth } from "../context/AuthContext";

interface LeaderboardEntry {
    rank: number;
    user_id: string;
    display_name: string;
    total_points: number;
    correct_predictions: number;
    total_predictions: number;
    current_streak: number;
    best_streak: number;
    weekly_points: number;
    monthly_points: number;
}

type LeaderboardType = 'total' | 'weekly' | 'monthly';

interface LeaderboardClientProps {
    initialLeaderboard: LeaderboardEntry[];
    initialUserEntry: LeaderboardEntry | null;
    initialUserRank: number | null;
}

export default function LeaderboardClient({
    initialLeaderboard,
    initialUserEntry,
    initialUserRank
}: LeaderboardClientProps) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(initialLeaderboard);
    const [userEntry, setUserEntry] = useState<LeaderboardEntry | null>(initialUserEntry);
    const [userRank, setUserRank] = useState<number | null>(initialUserRank);
    const [type, setType] = useState<LeaderboardType>('total');

    // Only fetch if type changes (initial load is served by SSR)
    useEffect(() => {
        if (type !== 'total' || leaderboard !== initialLeaderboard) {
            fetchLeaderboard();
        }
    }, [type]);

    async function fetchLeaderboard() {
        try {
            setLoading(true);
            const res = await fetch(`/api/leaderboard?type=${type}&limit=50`);
            if (res.ok) {
                const data = await res.json();
                setLeaderboard(data.leaderboard || []);
                setUserEntry(data.userEntry);
                setUserRank(data.userRank);
            }
        } catch (err) {
            console.error("Leaderboard fetch error:", err);
        } finally {
            setLoading(false);
        }
    }

    const typeLabels: Record<LeaderboardType, string> = {
        total: 'Tüm Zamanlar',
        weekly: 'Bu Hafta',
        monthly: 'Bu Ay'
    };

    return (
        <main className="min-h-screen bg-slate-950 text-slate-100 p-2 sm:p-4 font-sans">
            <div className="max-w-4xl mx-auto space-y-4">
                <div className="flex flex-col gap-1 px-1">
                    <h1 className="font-bold text-white text-lg tracking-tight leading-none hidden sm:block">Sıralama Tablosu</h1>
                    <p className="text-[10px] text-slate-400 hidden sm:block">En iyi tahmin uzmanları</p>
                </div>

                {/* Type Selector */}
                <div className="flex gap-2 p-1 bg-slate-900 rounded-xl border border-slate-800">
                    {(['total', 'weekly', 'monthly'] as LeaderboardType[]).map((t) => (
                        <button
                            key={t}
                            onClick={() => setType(t)}
                            className={`flex-1 px-4 py-2 rounded-lg text-sm font-bold transition-all ${type === t
                                ? 'bg-emerald-700 text-white shadow-lg'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                }`}
                        >
                            {typeLabels[t]}
                        </button>
                    ))}
                </div>

                {/* User's Position (if not in top 50) */}
                {userEntry && userRank && userRank > 50 && (
                    <div className="bg-gradient-to-r from-emerald-900/30 to-teal-900/30 rounded-xl border border-emerald-600/30 p-4">
                        <div className="text-xs text-emerald-400 mb-2">Senin Sıran</div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center font-bold text-white">
                                    #{userRank}
                                </div>
                                <div>
                                    <div className="font-bold text-white">{userEntry.display_name || 'Anonim'}</div>
                                    <div className="text-xs text-slate-400">
                                        {userEntry.correct_predictions}/{userEntry.total_predictions} doğru
                                    </div>
                                </div>
                            </div>
                            <div className="text-2xl font-bold text-emerald-400">
                                {type === 'weekly' ? userEntry.weekly_points :
                                    type === 'monthly' ? userEntry.monthly_points :
                                        userEntry.total_points}
                                <span className="text-xs ml-1">P</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Leaderboard Table */}
                <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl relative">
                    {loading && (
                        <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm z-10 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                        </div>
                    )}

                    {leaderboard.length === 0 && !loading ? (
                        <div className="p-12 text-center text-slate-500">
                            <div className="text-4xl mb-3">😴</div>
                            Henüz sıralama verisi yok
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-800">
                            {leaderboard.map((entry) => {
                                const isCurrentUser = user?.id === entry.user_id;
                                const points = type === 'weekly' ? entry.weekly_points :
                                    type === 'monthly' ? entry.monthly_points :
                                        entry.total_points;

                                return (
                                    <div
                                        key={entry.user_id}
                                        className={`flex items-center justify-between p-3 sm:p-4 transition-colors ${isCurrentUser ? 'bg-emerald-900/20' : 'hover:bg-slate-800/50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3 sm:gap-4">
                                            {/* Rank */}
                                            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center font-bold text-sm ${entry.rank === 1 ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/30' :
                                                entry.rank === 2 ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-slate-800' :
                                                    entry.rank === 3 ? 'bg-gradient-to-br from-amber-600 to-amber-700 text-white' :
                                                        'bg-slate-800 text-slate-500'
                                                }`}>
                                                {entry.rank === 1 ? '👑' : entry.rank}
                                            </div>

                                            {/* Avatar Fallback / Decoration */}
                                            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-slate-400 font-bold border border-slate-700">
                                                {(entry.display_name || 'A').slice(0, 1).toUpperCase()}
                                            </div>

                                            {/* Name & Stats */}
                                            <div>
                                                <div className={`font-bold flex items-center gap-2 ${isCurrentUser ? 'text-emerald-400' : 'text-white'}`}>
                                                    <span className="truncate max-w-[120px] sm:max-w-none">{entry.display_name || 'Anonim'}</span>
                                                    {isCurrentUser && <span className="text-[9px] px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded uppercase tracking-wider">Sen</span>}
                                                </div>
                                                <div className="text-[10px] sm:text-xs text-slate-500 flex gap-2">
                                                    <span>✓ {entry.correct_predictions} Doğru</span>
                                                    <span>🔥 {entry.best_streak} Seri</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Points */}
                                        <div className={`text-lg sm:text-xl font-bold ${entry.rank <= 3 ? 'text-amber-400' : 'text-slate-300'
                                            }`}>
                                            {points}
                                            <span className="text-xs text-slate-500 ml-1">P</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Stats Info */}
                <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800/50">
                    <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 text-center tracking-widest">Sistem Bilgisi</h4>
                    <div className="flex flex-wrap gap-x-8 gap-y-3 text-[10px] text-slate-500 justify-center">
                        <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            <span>Doğru Tahmin: +10 Puan</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                            <span>Seri Bonusu: Her 3 maçta +5 Puan</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                            <span>Sıralama her 15 dakikada bir güncellenir</span>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

```

## File: app\leaderboard\loading.tsx
```
import { SkeletonTable, SkeletonStats } from "../components/Skeleton";

export default function LeaderboardLoading() {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-4">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header skeleton */}
                <div className="text-center space-y-2">
                    <div className="h-10 w-64 bg-slate-800 rounded animate-pulse mx-auto" />
                    <div className="h-4 w-96 bg-slate-800/50 rounded animate-pulse mx-auto" />
                </div>

                {/* Stats skeleton */}
                <SkeletonStats count={4} />

                {/* Table skeleton */}
                <SkeletonTable rows={10} columns={5} />
            </div>
        </div>
    );
}

```

## File: app\leaderboard\page.tsx
```
import { createServerSupabaseClient } from "../utils/supabase-server";
import LeaderboardClient from "./LeaderboardClient";

export const metadata = {
    title: "Sıralama Tablosu | VolleySimulator",
    description: "VolleySimulator sıralama tablosu ile en iyi tahmincileri görün.",
};

export default async function LeaderboardPage() {
    const supabase = await createServerSupabaseClient();

    // Fetch initial total leaderboard
    const { data: leaderboardData, error } = await supabase
        .from('leaderboard')
        .select('*')
        .order('total_points', { ascending: false })
        .limit(50);

    const rankedData = leaderboardData?.map((entry, index) => ({
        ...entry,
        rank: index + 1
    })) || [];

    // Get current user details
    const { data: { user } } = await supabase.auth.getUser();
    let userEntry = null;
    let userRank = null;

    if (user) {
        // Find user rank
        const { data: allData } = await supabase
            .from('leaderboard')
            .select('user_id')
            .order('total_points', { ascending: false });

        if (allData) {
            const userIndex = allData.findIndex(e => e.user_id === user.id);
            if (userIndex !== -1) {
                userRank = userIndex + 1;
                userEntry = rankedData.find(e => e.user_id === user.id) || null;

                if (!userEntry) {
                    const { data: userData } = await supabase
                        .from('leaderboard')
                        .select('*')
                        .eq('user_id', user.id)
                        .single();

                    if (userData) {
                        userEntry = { ...userData, rank: userRank };
                    }
                }
            }
        }
    }

    return (
        <LeaderboardClient
            initialLeaderboard={rankedData}
            initialUserEntry={userEntry}
            initialUserRank={userRank}
        />
    );
}

```

## File: app\ligler\loading.tsx
```
import { SkeletonCard } from "../components/Skeleton";

export default function LiglerLoading() {
    return (
        <div className="min-h-screen bg-slate-950">
            <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
                <div className="flex flex-col gap-1 items-center md:items-start text-center md:text-left">
                    <div className="h-8 w-32 bg-slate-800 rounded animate-pulse" />
                    <div className="h-4 w-64 bg-slate-800/50 rounded animate-pulse mt-2" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <SkeletonCard key={i} className="h-48" />
                    ))}
                </div>
            </div>
        </div>
    );
}

```

## File: app\ligler\page.tsx
```
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Ligler - Türkiye Kadınlar Voleybol Ligleri",
    description: "Sultanlar Ligi, 1. Lig, 2. Lig ve CEV Avrupa turnuvaları. 2025-2026 sezonu maç tahminleri ve puan durumları.",
    openGraph: {
        title: "Ligler - Türkiye Kadınlar Voleybol Ligleri",
        description: "Sultanlar Ligi, 1. Lig, 2. Lig ve CEV Avrupa turnuvaları. 2025-2026 sezonu maç tahminleri ve puan durumları.",
    },
};

export default function LiglerPage() {
    return (
        <div className="min-h-screen bg-slate-950">
            <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
                <div className="flex flex-col gap-1 items-center md:items-start text-center md:text-left">
                    <h1 className="font-bold text-white text-2xl tracking-tight leading-none">Ligler</h1>
                    <p className="text-sm text-slate-400">Türkiye Kadınlar Voleybol Ligleri • 2025-2026 Sezonu</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Vodafone Sultanlar Ligi */}
                    <Link href="/vsl/tahminoyunu" className="group bg-slate-900 border border-red-500/30 rounded-2xl p-8 hover:bg-slate-800 hover:border-red-500/60 transition-all flex flex-col items-center text-center gap-4 shadow-lg hover:shadow-red-900/20">
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-2">Vodafone Sultanlar Ligi</h2>
                            <p className="text-slate-400">Türkiye'nin en üst düzey kadınlar voleybol ligi</p>
                        </div>
                        <div className="mt-2 px-4 py-2 bg-red-600/20 text-red-400 rounded-full text-sm font-bold group-hover:bg-red-700 group-hover:text-white transition-colors">
                            Lige Git →
                        </div>
                    </Link>

                    {/* Arabica Coffee House 1. Lig */}
                    <Link href="/1lig/tahminoyunu" className="group bg-slate-900 border border-amber-500/30 rounded-2xl p-8 hover:bg-slate-800 hover:border-amber-500/60 transition-all flex flex-col items-center text-center gap-4 shadow-lg hover:shadow-amber-900/20">
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-2">Arabica Coffee House 1. Lig</h2>
                            <p className="text-slate-400">2 Gruplu 1. Lig Sistemi</p>
                        </div>
                        <div className="mt-2 px-4 py-2 bg-amber-600/20 text-amber-400 rounded-full text-sm font-bold group-hover:bg-amber-600 group-hover:text-white transition-colors">
                            Lige Git →
                        </div>
                    </Link>

                    {/* Kadınlar 2. Lig */}
                    <Link href="/2lig/tahminoyunu" className="group bg-slate-900 border border-emerald-500/30 rounded-2xl p-8 hover:bg-slate-800 hover:border-emerald-500/60 transition-all flex flex-col items-center text-center gap-4 shadow-lg hover:shadow-emerald-900/20">
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-2">Kadınlar 2. Lig</h2>
                            <p className="text-slate-400">5 Gruplu 2. Lig Sistemi</p>
                        </div>
                        <div className="mt-2 px-4 py-2 bg-emerald-600/20 text-emerald-400 rounded-full text-sm font-bold group-hover:bg-emerald-700 group-hover:text-white transition-colors">
                            Lige Git →
                        </div>
                    </Link>

                    {/* Şampiyonlar Ligi */}
                    <Link href="/cev-cl/tahminoyunu" className="group bg-slate-900 border border-blue-500/30 rounded-2xl p-8 hover:bg-slate-800 hover:border-blue-500/60 transition-all flex flex-col items-center text-center gap-4 shadow-lg hover:shadow-blue-900/20">
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-2">CEV Şampiyonlar Ligi</h2>
                            <p className="text-slate-400">Avrupa'nın en iyi takımları</p>
                        </div>
                        <div className="mt-2 px-4 py-2 bg-blue-600/20 text-blue-400 rounded-full text-sm font-bold group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            Lige Git →
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}

```

## File: app\live\page.tsx
```
"use client";

import { useState, useEffect } from "react";
import { useLiveMatch } from "../context/LiveMatchContext";
import { useAuth } from "../context/AuthContext";
import { LiveMatch, SetScore } from "../types";
import Link from "next/link";

export default function LivePage() {
  const { user } = useAuth();
  const { 
    liveMatches, 
    currentMatch,
    comments,
    chatMessages,
    isConnected,
    selectMatch,
    addComment,
    likeComment,
    sendChatMessage,
    subscribeToMatch,
    unsubscribeFromMatch,
    refreshLiveMatches,
    isLoading
  } = useLiveMatch();
  
  const [newComment, setNewComment] = useState('');
  const [newChatMessage, setNewChatMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'matches' | 'chat' | 'comments'>('matches');

  useEffect(() => {
    if (currentMatch) {
      subscribeToMatch(currentMatch.id);
    }
    
    return () => {
      unsubscribeFromMatch();
    };
  }, [currentMatch?.id]);

  const handleSendComment = async () => {
    if (!currentMatch || !newComment.trim()) return;
    
    await addComment(currentMatch.id, newComment.trim());
    setNewComment('');
  };

  const handleSendChat = async () => {
    if (!currentMatch || !newChatMessage.trim()) return;
    
    await sendChatMessage(currentMatch.id, newChatMessage.trim());
    setNewChatMessage('');
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <span className="animate-pulse">🔴</span> Canlı Maçlar
              </h1>
              <p className="text-white/70 text-sm mt-1">
                {liveMatches.filter(m => m.status === 'live').length} canlı maç
              </p>
            </div>
            <button
              onClick={refreshLiveMatches}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-medium transition-colors"
            >
              🔄 Yenile
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Live Matches Grid */}
        {!currentMatch ? (
          <div className="space-y-4">
            {liveMatches.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">📺</div>
                <p className="text-slate-400">Şu anda canlı maç bulunmuyor</p>
                <p className="text-sm text-slate-500 mt-2">
                  Yaklaşan maçlar için tahminlerinizi yapmayı unutmayın!
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {liveMatches.map(match => (
                  <LiveMatchCard 
                    key={match.id} 
                    match={match} 
                    onClick={() => selectMatch(match.id)}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          // Match Detail View
          <div className="space-y-4">
            {/* Back Button */}
            <button
              onClick={() => selectMatch('')}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              ← Geri
            </button>

            {/* Match Score Board */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl p-6">
              {/* Connection Status */}
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                <span className="text-xs text-slate-500">
                  {isConnected ? 'Canlı Bağlantı' : 'Bağlantı Bekleniyor...'}
                </span>
              </div>

              {/* Teams and Score */}
              <div className="flex items-center justify-between">
                <div className="flex-1 text-center">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-3xl mb-3">
                    🏐
                  </div>
                  <h3 className="font-bold text-white text-lg">{currentMatch.homeTeam}</h3>
                </div>

                <div className="px-8 text-center">
                  <div className="text-5xl font-black text-white">
                    {currentMatch.homeSetScore} - {currentMatch.awaySetScore}
                  </div>
                  <div className="text-sm text-slate-400 mt-2">Set Skoru</div>
                  
                  {currentMatch.status === 'live' && (
                    <div className="mt-4 bg-red-500/20 border border-red-500/30 rounded-lg px-4 py-2">
                      <div className="text-2xl font-bold text-white">
                        {currentMatch.currentSetHomePoints} - {currentMatch.currentSetAwayPoints}
                      </div>
                      <div className="text-xs text-red-400">{currentMatch.currentSet}. Set</div>
                    </div>
                  )}
                </div>

                <div className="flex-1 text-center">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center text-3xl mb-3">
                    🏐
                  </div>
                  <h3 className="font-bold text-white text-lg">{currentMatch.awayTeam}</h3>
                </div>
              </div>

              {/* Set Scores */}
              {currentMatch.setScores.length > 0 && (
                <div className="mt-6 flex justify-center gap-4">
                  {currentMatch.setScores.map((set, index) => (
                    <div 
                      key={index}
                      className={`px-4 py-2 rounded-lg text-center ${
                        set.winner === 'home' 
                          ? 'bg-blue-500/20 border border-blue-500/30' 
                          : 'bg-orange-500/20 border border-orange-500/30'
                      }`}
                    >
                      <div className="text-xs text-slate-400">{index + 1}. Set</div>
                      <div className="font-bold text-white">{set.homePoints}-{set.awayPoints}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-slate-800 pb-4">
              {[
                { key: 'chat', label: 'Canlı Sohbet', icon: '💬' },
                { key: 'comments', label: 'Yorumlar', icon: '📝' },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as typeof activeTab)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    activeTab === tab.key
                      ? 'bg-white/10 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Chat */}
            {activeTab === 'chat' && (
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl">
                <div className="h-64 overflow-y-auto p-4 space-y-3">
                  {chatMessages.length === 0 ? (
                    <div className="text-center text-slate-500 py-8">
                      Henüz mesaj yok. İlk mesajı sen yaz!
                    </div>
                  ) : (
                    chatMessages.map(msg => (
                      <div key={msg.id} className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                          {msg.user?.displayName?.charAt(0) || '?'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">
                              {msg.user?.displayName}
                            </span>
                            <span className="text-xs text-slate-500">
                              {new Date(msg.timestamp).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-slate-300 text-sm">{msg.message}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {user && (
                  <div className="border-t border-slate-800 p-4">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newChatMessage}
                        onChange={(e) => setNewChatMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendChat()}
                        placeholder="Mesaj yaz..."
                        className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                      <button
                        onClick={handleSendChat}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-medium transition-colors"
                      >
                        Gönder
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Comments */}
            {activeTab === 'comments' && (
              <div className="space-y-4">
                {user && (
                  <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Maç hakkında yorumunuzu yazın..."
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 resize-none h-20"
                    />
                    <div className="flex justify-end mt-2">
                      <button
                        onClick={handleSendComment}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-sm font-medium transition-colors"
                      >
                        Yorum Yap
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {comments.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      Henüz yorum yok
                    </div>
                  ) : (
                    comments.map(comment => (
                      <div 
                        key={comment.id}
                        className="bg-slate-900/50 border border-slate-800 rounded-xl p-4"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold">
                            {comment.user?.displayName?.charAt(0) || '?'}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white">{comment.user?.displayName}</span>
                              <span className="text-xs text-slate-500">
                                {new Date(comment.createdAt).toLocaleString('tr-TR')}
                              </span>
                            </div>
                            <p className="text-slate-300 mt-1">{comment.message}</p>
                            <button
                              onClick={() => likeComment(comment.id)}
                              className="flex items-center gap-1 text-sm text-slate-500 hover:text-red-400 mt-2 transition-colors"
                            >
                              ❤️ {comment.likes}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

// Live Match Card Component
function LiveMatchCard({ match, onClick }: { match: LiveMatch; onClick: () => void }) {
  const isLive = match.status === 'live';
  
  return (
    <button
      onClick={onClick}
      className={`w-full bg-slate-900/50 border rounded-xl p-4 text-left transition-all hover:border-slate-600 ${
        isLive ? 'border-red-500/50' : 'border-slate-800'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          {/* Home Team */}
          <div className="flex-1 text-right">
            <span className="font-bold text-white">{match.homeTeam}</span>
          </div>

          {/* Score */}
          <div className="text-center px-4">
            {isLive ? (
              <div>
                <div className="flex items-center gap-2 justify-center">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-xs text-red-400 font-medium">CANLI</span>
                </div>
                <div className="text-2xl font-black text-white mt-1">
                  {match.homeSetScore} - {match.awaySetScore}
                </div>
                <div className="text-xs text-slate-400">
                  {match.currentSetHomePoints}-{match.currentSetAwayPoints} ({match.currentSet}. Set)
                </div>
              </div>
            ) : match.status === 'finished' ? (
              <div>
                <span className="text-xs text-slate-500">Bitti</span>
                <div className="text-2xl font-black text-white mt-1">
                  {match.homeSetScore} - {match.awaySetScore}
                </div>
              </div>
            ) : (
              <div>
                <span className="text-xs text-slate-500">
                  {new Date(match.startTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                </span>
                <div className="text-lg font-bold text-slate-400 mt-1">vs</div>
              </div>
            )}
          </div>

          {/* Away Team */}
          <div className="flex-1 text-left">
            <span className="font-bold text-white">{match.awayTeam}</span>
          </div>
        </div>

        <span className="text-slate-400 ml-4">→</span>
      </div>

      <div className="mt-3 text-xs text-slate-500 text-center">
        {match.league} {match.venue && `• ${match.venue}`}
      </div>
    </button>
  );
}

```

## File: app\login\layout.tsx
```
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Giriş Yap",
    description: "VolleySimulator hesabınıza giriş yapın. Maç tahminleri yapın, puan kazanın ve liderlik tablosunda yerinizi alın.",
    openGraph: {
        title: "Giriş Yap | VolleySimulator",
        description: "VolleySimulator hesabınıza giriş yapın ve tahmin oyununa katılın.",
    },
    robots: {
        index: false,
        follow: true,
    },
};

export default function LoginLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}

```

## File: app\login\page.tsx
```
"use client";

// Prevent static prerendering - this page requires auth context
export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Loader2, ArrowRight, AlertCircle } from "lucide-react";

import LoginBackground from "../components/LoginBackground";

export default function LoginPage() {
    const router = useRouter();
    const { signIn, signInWithGoogle, user } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    // Redirect if already logged in
    useEffect(() => {
        if (user) {
            router.push('/ligler');
        }
    }, [user, router]);

    if (user) {
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        const { error } = await signIn(email, password);

        if (error) {
            setError(error.message === "Invalid login credentials"
                ? "E-posta veya şifre hatalı"
                : error.message
            );
            setIsLoading(false);
        } else {
            router.push('/ligler');
        }
    };

    const handleGoogleLogin = async () => {
        await signInWithGoogle();
    };

    return (
        <main className="min-h-screen relative flex flex-col items-center justify-center p-4 overflow-hidden">
            <LoginBackground />

            <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">

                {/* Left Side: Brand & Features (Desktop) */}
                <div className="hidden lg:block space-y-8 animate-fade-in-left">
                    <div className="space-y-2">
                        <Link href="/" className="inline-block">
                            <span className="text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
                                VolleySimulator
                            </span>
                        </Link>
                        <h1 className="text-2xl font-light text-slate-300">
                            Voleybol Tutkunları İçin <br />
                            <span className="font-semibold text-white">Yeni Nesil Simülasyon</span>
                        </h1>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-700/50 p-4 rounded-2xl">
                            <div className="text-3xl mb-2">🏆</div>
                            <h3 className="font-bold text-white mb-1">Tahmin Oyunu</h3>
                            <p className="text-sm text-slate-400">Maç skorlarını tahmin et, puanları topla ve liderliğe yüksel.</p>
                        </div>
                        <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-700/50 p-4 rounded-2xl">
                            <div className="text-3xl mb-2">📊</div>
                            <h3 className="font-bold text-white mb-1">Detaylı Analiz</h3>
                            <p className="text-sm text-slate-400">Takım form durumları ve yapay zeka destekli maç analizleri.</p>
                        </div>
                        <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-700/50 p-4 rounded-2xl">
                            <div className="text-3xl mb-2">⚡</div>
                            <h3 className="font-bold text-white mb-1">Canlı Skor</h3>
                            <p className="text-sm text-slate-400">Maç sonuçlarını anlık takip et, ligdeki gelişmeleri kaçırma.</p>
                        </div>
                        <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-700/50 p-4 rounded-2xl">
                            <div className="text-3xl mb-2">🌍</div>
                            <h3 className="font-bold text-white mb-1">Topluluk</h3>
                            <p className="text-sm text-slate-400">Diğer voleybol severlerle yarış ve sıralamada yerini al.</p>
                        </div>
                    </div>
                </div>

                {/* Right Side: Login Card */}
                <div className="w-full max-w-md mx-auto lg:ml-auto">
                    <Card className="bg-background/60 backdrop-blur-xl border-border/50 shadow-2xl">
                        <CardHeader className="text-center">
                            {/* Mobile Header (Visible only on mobile) */}
                            <div className="lg:hidden mb-4">
                                <Link href="/" className="inline-block mb-2">
                                    <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-200">
                                        VolleySimulator
                                    </span>
                                </Link>
                            </div>
                            <CardTitle className="text-2xl">Giriş Yap</CardTitle>
                            <CardDescription>Hesabınıza erişmek için bilgilerinizi girin</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {/* Login Form */}
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {error && (
                                    <Alert variant="destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                )}

                                <div className="space-y-2">
                                    <Label htmlFor="email">E-posta</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="ornek@email.com"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="password">Şifre</Label>
                                        <Link href="#" className="text-xs text-primary hover:underline">
                                            Unuttum?
                                        </Link>
                                    </div>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500"
                                >
                                    {isLoading ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <>
                                            Giriş Yap
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </>
                                    )}
                                </Button>
                            </form>

                            <div className="relative my-6">
                                <Separator />
                                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                                    veya
                                </span>
                            </div>

                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleGoogleLogin}
                                className="w-full"
                            >
                                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Google ile devam et
                            </Button>

                            <p className="mt-6 text-center text-sm text-muted-foreground">
                                Hesabın yok mu?{" "}
                                <Link href="/register" className="text-primary font-medium hover:underline">
                                    Hemen Kayıt Ol
                                </Link>
                            </p>
                        </CardContent>
                    </Card>

                    {/* Skip Link (Subtle) */}
                    <div className="text-center mt-6">
                        <Link href="/1lig/tahminoyunu" className="text-muted-foreground text-xs hover:text-foreground transition-colors flex items-center justify-center gap-1 group">
                            Giriş yapmadan siteye göz at
                            <span className="group-hover:translate-x-1 transition-transform">→</span>
                        </Link>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fade-in-left {
                    from { opacity: 0; transform: translateX(-20px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.6s ease-out forwards;
                }
                .animate-fade-in-left {
                    animation: fade-in-left 0.6s ease-out forwards;
                    animation-delay: 0.2s;
                    opacity: 0;
                }
            `}</style>
        </main>
    );
}

```

## File: app\notifications\page.tsx
```
"use client";

import { useState, useMemo } from "react";
import { useNotifications } from "../context/NotificationsContext";
import { useAuth } from "../context/AuthContext";
import { Notification, NotificationType } from "../types";
import Link from "next/link";

export default function NotificationsPage() {
  const { user } = useAuth();
  const { 
    notifications, 
    unreadCount,
    preferences,
    markAsRead, 
    markAllAsRead,
    deleteNotification,
    clearAll,
    updatePreferences,
    requestPushPermission,
    isLoading 
  } = useNotifications();
  
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'settings'>('all');
  const [filter, setFilter] = useState<NotificationType | 'all'>('all');

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    let filtered = notifications;
    
    if (activeTab === 'unread') {
      filtered = filtered.filter(n => !n.isRead);
    }
    
    if (filter !== 'all') {
      filtered = filtered.filter(n => n.type === filter);
    }
    
    return filtered;
  }, [notifications, activeTab, filter]);

  // Group notifications by date
  const groupedNotifications = useMemo(() => {
    const groups: Record<string, Notification[]> = {};
    
    filteredNotifications.forEach(notification => {
      const date = new Date(notification.createdAt).toLocaleDateString('tr-TR');
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(notification);
    });
    
    return groups;
  }, [filteredNotifications]);

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 mb-4">Bu sayfayı görüntülemek için giriş yapmalısınız.</p>
          <Link href="/" className="text-emerald-400 hover:underline">Giriş Yap</Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Bildirimler</h1>
              <p className="text-white/70 text-sm mt-1">
                {unreadCount > 0 ? `${unreadCount} okunmamış bildirim` : 'Tüm bildirimler okundu'}
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-medium transition-colors"
              >
                Tümünü Okundu İşaretle
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex gap-2 py-4 border-b border-slate-800">
          {[
            { key: 'all', label: 'Tümü', icon: '📬', count: notifications.length },
            { key: 'unread', label: 'Okunmamış', icon: '🔔', count: unreadCount },
            { key: 'settings', label: 'Ayarlar', icon: '⚙️' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-white/10 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span className="bg-cyan-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="py-6">
          {/* Notification List */}
          {(activeTab === 'all' || activeTab === 'unread') && (
            <div className="space-y-6">
              {/* Filter */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {[
                  { key: 'all', label: 'Tümü' },
                  { key: 'match_reminder', label: 'Maç Hatırlatma' },
                  { key: 'match_result', label: 'Sonuçlar' },
                  { key: 'friend_request', label: 'Arkadaşlık' },
                  { key: 'achievement', label: 'Başarımlar' },
                  { key: 'leaderboard_change', label: 'Sıralama' },
                ].map(f => (
                  <button
                    key={f.key}
                    onClick={() => setFilter(f.key as typeof filter)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                      filter === f.key
                        ? 'bg-cyan-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Notifications */}
              {Object.keys(groupedNotifications).length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">🔔</div>
                  <p className="text-slate-400">Bildirim yok</p>
                </div>
              ) : (
                Object.entries(groupedNotifications).map(([date, notifs]) => (
                  <div key={date}>
                    <h3 className="text-sm font-medium text-slate-500 mb-3">{date}</h3>
                    <div className="space-y-2">
                      {notifs.map(notification => (
                        <NotificationItem
                          key={notification.id}
                          notification={notification}
                          onRead={() => markAsRead(notification.id)}
                          onDelete={() => deleteNotification(notification.id)}
                        />
                      ))}
                    </div>
                  </div>
                ))
              )}

              {notifications.length > 0 && (
                <div className="text-center pt-4">
                  <button
                    onClick={clearAll}
                    className="text-sm text-slate-500 hover:text-red-400 transition-colors"
                  >
                    Tüm Bildirimleri Temizle
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Settings */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              {/* Push Notifications */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-white">Push Bildirimleri</h3>
                    <p className="text-sm text-slate-400 mt-1">
                      Tarayıcı bildirimleri alın
                    </p>
                  </div>
                  {preferences.pushEnabled ? (
                    <span className="text-emerald-400 text-sm">✓ Aktif</span>
                  ) : (
                    <button
                      onClick={requestPushPermission}
                      className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-sm font-medium transition-colors"
                    >
                      Etkinleştir
                    </button>
                  )}
                </div>
              </div>

              {/* Notification Types */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-slate-800">
                  <h3 className="font-bold text-white">Bildirim Türleri</h3>
                </div>
                
                <div className="divide-y divide-slate-800">
                  {[
                    { key: 'matchReminders', label: 'Maç Hatırlatmaları', icon: '⏰', desc: 'Tahmin edilmemiş maçlar için hatırlatma' },
                    { key: 'matchResults', label: 'Maç Sonuçları', icon: '⚽', desc: 'Tahmin edilen maçların sonuçları' },
                    { key: 'friendRequests', label: 'Arkadaşlık İstekleri', icon: '👥', desc: 'Yeni arkadaşlık istekleri' },
                    { key: 'friendActivity', label: 'Arkadaş Aktiviteleri', icon: '📊', desc: 'Arkadaşların tahminleri ve başarımları' },
                    { key: 'achievements', label: 'Başarımlar', icon: '🏆', desc: 'Yeni rozetler ve başarımlar' },
                    { key: 'leaderboardChanges', label: 'Sıralama Değişiklikleri', icon: '📈', desc: 'Liderlik tablosu güncellemeleri' },
                    { key: 'dailyQuests', label: 'Günlük Görevler', icon: '📋', desc: 'Günlük görev hatırlatmaları' },
                    { key: 'weeklyDigest', label: 'Haftalık Özet', icon: '📰', desc: 'Haftalık performans özeti' },
                  ].map(setting => (
                    <div key={setting.key} className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{setting.icon}</span>
                        <div>
                          <h4 className="font-medium text-white">{setting.label}</h4>
                          <p className="text-xs text-slate-500">{setting.desc}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => updatePreferences({ 
                          [setting.key]: !preferences[setting.key as keyof typeof preferences]
                        })}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          preferences[setting.key as keyof typeof preferences]
                            ? 'bg-cyan-600'
                            : 'bg-slate-700'
                        }`}
                      >
                        <span 
                          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                            preferences[setting.key as keyof typeof preferences]
                              ? 'left-7'
                              : 'left-1'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quiet Hours */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                <h3 className="font-bold text-white mb-4">Sessiz Saatler</h3>
                <p className="text-sm text-slate-400 mb-4">
                  Bu saatler arasında bildirim almayın
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-500 mb-2">Başlangıç</label>
                    <input
                      type="time"
                      value={preferences.quietHoursStart || '23:00'}
                      onChange={(e) => updatePreferences({ quietHoursStart: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-2">Bitiş</label>
                    <input
                      type="time"
                      value={preferences.quietHoursEnd || '08:00'}
                      onChange={(e) => updatePreferences({ quietHoursEnd: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Email Notifications */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-white">E-posta Bildirimleri</h3>
                    <p className="text-sm text-slate-400 mt-1">
                      Önemli güncellemeler için e-posta alın
                    </p>
                  </div>
                  <button
                    onClick={() => updatePreferences({ emailEnabled: !preferences.emailEnabled })}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      preferences.emailEnabled ? 'bg-cyan-600' : 'bg-slate-700'
                    }`}
                  >
                    <span 
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                        preferences.emailEnabled ? 'left-7' : 'left-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

// Notification Item Component
function NotificationItem({ 
  notification, 
  onRead, 
  onDelete 
}: { 
  notification: Notification; 
  onRead: () => void;
  onDelete: () => void;
}) {
  const icon = getNotificationIcon(notification.type);
  
  return (
    <div 
      className={`bg-slate-900/50 border rounded-xl p-4 transition-all ${
        notification.isRead 
          ? 'border-slate-800 opacity-70' 
          : 'border-cyan-500/30 bg-cyan-500/5'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="text-2xl">{icon}</div>
        <div className="flex-1">
          <h4 className={`font-medium ${notification.isRead ? 'text-slate-300' : 'text-white'}`}>
            {notification.title}
          </h4>
          <p className="text-sm text-slate-400 mt-1">{notification.message}</p>
          <div className="flex items-center gap-4 mt-2">
            <span className="text-xs text-slate-500">
              {new Date(notification.createdAt).toLocaleTimeString('tr-TR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
            {notification.link && (
              <Link 
                href={notification.link}
                className="text-xs text-cyan-400 hover:underline"
              >
                Görüntüle →
              </Link>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!notification.isRead && (
            <button
              onClick={onRead}
              className="p-1 text-slate-400 hover:text-white transition-colors"
              title="Okundu işaretle"
            >
              ✓
            </button>
          )}
          <button
            onClick={onDelete}
            className="p-1 text-slate-400 hover:text-red-400 transition-colors"
            title="Sil"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}

function getNotificationIcon(type: NotificationType): string {
  switch (type) {
    case 'match_reminder': return '⏰';
    case 'match_result': return '⚽';
    case 'prediction_result': return '🎯';
    case 'friend_request': return '👥';
    case 'friend_activity': return '📊';
    case 'achievement': return '🏆';
    case 'level_up': return '⬆️';
    case 'leaderboard_change': return '📈';
    case 'daily_quest': return '📋';
    case 'weekly_challenge': return '🏅';
    case 'system': return '📢';
    default: return '🔔';
  }
}

```

## File: app\oauth\consent\page.tsx
```
"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "../../utils/supabase";
import Link from "next/link";
import { Suspense } from "react";

function ConsentContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const supabase = createClient();

    useEffect(() => {
        // Check if there's an auth code to exchange
        const code = searchParams.get('code');
        if (code && supabase) {
            supabase.auth.exchangeCodeForSession(code).then(() => {
                router.push('/profile');
            });
        }
    }, [searchParams, router, supabase]);

    return (
        <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md text-center">
                {/* Header */}
                <div className="mb-8">
                    <Link href="/" className="inline-block mb-6">
                        <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-200">
                            VolleySimulator
                        </span>
                    </Link>
                </div>

                {/* Consent Card */}
                <div className="bg-slate-900/80 rounded-2xl border border-slate-700 p-8 space-y-6">
                    <div className="w-16 h-16 mx-auto bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                        <span className="text-3xl">🔐</span>
                    </div>

                    <div>
                        <h1 className="text-2xl font-black text-white mb-2">Giriş Onayı</h1>
                        <p className="text-slate-400 text-sm">
                            VolleySimulator uygulamasına erişim izni verin
                        </p>
                    </div>

                    <div className="bg-slate-800/50 rounded-xl p-4 text-left space-y-3">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                            İzin Verilen Erişimler:
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-300">
                            <span className="text-emerald-400">✓</span>
                            <span>Profil bilgileriniz</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-300">
                            <span className="text-emerald-400">✓</span>
                            <span>E-posta adresiniz</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-300">
                            <span className="text-emerald-400">✓</span>
                            <span>Tahmin ve oyun ilerlemeniz</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Link
                            href="/profile"
                            className="block w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all text-center"
                        >
                            ✓ İzin Ver ve Devam Et
                        </Link>
                        <Link
                            href="/"
                            className="block w-full py-3 bg-slate-800 border border-slate-700 text-slate-400 font-medium rounded-xl hover:bg-slate-700 transition-all text-center"
                        >
                            İptal
                        </Link>
                    </div>
                </div>

                <p className="mt-6 text-xs text-slate-500">
                    Giriş yaparak{" "}
                    <a href="#" className="text-emerald-400 hover:underline">Kullanım Koşulları</a>
                    {" "}ve{" "}
                    <a href="#" className="text-emerald-400 hover:underline">Gizlilik Politikası</a>
                    &apos;nı kabul etmiş olursunuz.
                </p>
            </div>
        </main>
    );
}

export default function OAuthConsentPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
            </div>
        }>
            <ConsentContent />
        </Suspense>
    );
}

```

## File: app\offline\page.tsx
```
'use client';

import Link from 'next/link';

export default function OfflinePage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 flex flex-col items-center justify-center p-4">
            <div className="text-center space-y-6 max-w-md">
                {/* Icon */}
                <div className="text-6xl">📡</div>

                {/* Title */}
                <h1 className="text-3xl font-bold text-white">
                    İnternet Bağlantısı Yok
                </h1>

                {/* Description */}
                <p className="text-slate-400 text-lg">
                    Şu anda çevrimdışısınız. Lütfen internet bağlantınızı kontrol edin.
                </p>

                {/* Cached Content Info */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 text-sm text-slate-300">
                    <p className="mb-2">✓ Kacak sayfa önbellekte saklanmıştır</p>
                    <p className="mb-2">✓ Tahminleriniz yerel olarak kaydedilmiştir</p>
                    <p>✓ Bağlantı sağlandığında senkronize olacaktır</p>
                </div>

                {/* Actions */}
                <div className="space-y-3 pt-4">
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-colors"
                    >
                        Yenile
                    </button>

                    <Link
                        href="/"
                        className="block w-full px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg transition-colors text-center"
                    >
                        Ana Sayfaya Dön
                    </Link>
                </div>

                {/* Tips */}
                <div className="text-xs text-slate-500 space-y-1 pt-4 border-t border-slate-800">
                    <p>💡 WiFi bağlantınızı kontrol edin</p>
                    <p>💡 Mobil veri bağlantınızı açmayı deneyin</p>
                    <p>💡 Uçak modu kapalı olduğundan emin olun</p>
                </div>
            </div>
        </div>
    );
}

```

