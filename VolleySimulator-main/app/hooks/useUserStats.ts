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
