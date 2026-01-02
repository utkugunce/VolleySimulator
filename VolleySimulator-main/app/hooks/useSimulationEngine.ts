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
