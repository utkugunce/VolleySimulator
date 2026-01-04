"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { createClient } from "../utils/supabase";
import { useAuth } from "../context/AuthContext";

// Types
export interface Prediction {
    id?: string;
    user_id: string;
    league: "vsl" | "1lig" | "2lig" | "cev-cl";
    group_name?: string;
    match_id: string;
    score: string;
    created_at?: string;
    updated_at?: string;
}

export type PredictionOverrides = Record<string, string>;

const SYNC_QUEUE_KEY = 'prediction_sync_queue';

interface SyncItem {
    userId: string;
    league: string;
    matchId: string;
    score: string;
    groupName?: string;
    timestamp: number;
}

function addToSyncQueue(item: SyncItem) {
    if (typeof window === 'undefined') return;
    const queue = JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) || '[]');
    queue.push(item);
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
}

async function processSyncQueue() {
    if (typeof window === 'undefined') return;
    const queue: SyncItem[] = JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) || '[]');
    if (queue.length === 0) return;

    const supabase = createClient();
    if (!supabase) return;

    const remaining: SyncItem[] = [];

    for (const item of queue) {
        try {
            if (!item.score) {
                 await supabase
                    .from("predictions")
                    .delete()
                    .eq("user_id", item.userId)
                    .eq("league", item.league)
                    .eq("match_id", item.matchId);
            } else {
                await supabase.from("predictions").upsert(
                    {
                        user_id: item.userId,
                        league: item.league,
                        group_name: item.groupName || null,
                        match_id: item.matchId,
                        score: item.score,
                    },
                    { onConflict: "user_id,league,match_id" }
                );
            }
        } catch (e) {
            console.error("Sync failed for item", item, e);
            remaining.push(item);
        }
    }

    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(remaining));
}


// ============================================
// FETCH PREDICTIONS
// ============================================
async function fetchPredictions(
    userId: string,
    league: string,
    groupName?: string
): Promise<PredictionOverrides> {
    const supabase = createClient();
    if (!supabase) {
        // Fallback to localStorage if Supabase is not configured
        const storageKey = getStorageKey(league);
        const saved = localStorage.getItem(storageKey);
        if (saved) {
            const parsed = JSON.parse(saved);
            if (groupName && parsed[groupName]) {
                return parsed[groupName];
            }
            return parsed;
        }
        return {};
    }

    let query = supabase
        .from("predictions")
        .select("match_id, score")
        .eq("user_id", userId)
        .eq("league", league);

    if (groupName) {
        query = query.eq("group_name", groupName);
    }

    const { data, error } = await query;

    if (error) {
        console.error("Error fetching predictions:", error);
        return {};
    }

    // Convert array to Record<matchId, score>
    const overrides: PredictionOverrides = {};
    data?.forEach((p) => {
        overrides[p.match_id] = p.score;
    });

    return overrides;
}

// ============================================
// SAVE PREDICTION
// ============================================
async function savePrediction(
    userId: string,
    league: string,
    matchId: string,
    score: string,
    groupName?: string
): Promise<void> {
    const supabase = createClient();

    // Helper to save to local storage
    const saveToLocal = () => {
        const storageKey = getStorageKey(league);
        const saved = localStorage.getItem(storageKey);
        const existing = saved ? JSON.parse(saved) : {};

        if (groupName) {
            if (!existing[groupName]) existing[groupName] = {};
            if (score) {
                existing[groupName][matchId] = score;
            } else {
                delete existing[groupName][matchId];
            }
        } else {
            if (score) {
                existing[matchId] = score;
            } else {
                delete existing[matchId];
            }
        }

        localStorage.setItem(storageKey, JSON.stringify(existing));
    };

    if (!supabase) {
        saveToLocal();
        return;
    }

    try {
        if (!score) {
            // Delete prediction
            await supabase
                .from("predictions")
                .delete()
                .eq("user_id", userId)
                .eq("league", league)
                .eq("match_id", matchId);
        } else {
            // Upsert prediction
            await supabase.from("predictions").upsert(
                {
                    user_id: userId,
                    league,
                    group_name: groupName || null,
                    match_id: matchId,
                    score,
                },
                { onConflict: "user_id,league,match_id" }
            );
        }
    } catch (error) {
        console.error("Supabase save failed, falling back to local + sync queue", error);
        saveToLocal();
        addToSyncQueue({ userId, league, matchId, score, groupName, timestamp: Date.now() });
    }
}

// ============================================
// BULK SAVE PREDICTIONS
// ============================================
async function bulkSavePredictions(
    userId: string,
    league: string,
    overrides: PredictionOverrides,
    groupName?: string
): Promise<void> {
    const supabase = createClient();
    if (!supabase) {
        // Fallback to localStorage
        const storageKey = getStorageKey(league);
        const saved = localStorage.getItem(storageKey);
        const existing = saved ? JSON.parse(saved) : {};

        if (groupName) {
            existing[groupName] = overrides;
        } else {
            Object.assign(existing, overrides);
        }

        localStorage.setItem(storageKey, JSON.stringify(existing));
        return;
    }

    // Convert overrides to array of predictions
    const predictions = Object.entries(overrides).map(([matchId, score]) => ({
        user_id: userId,
        league,
        group_name: groupName || null,
        match_id: matchId,
        score,
    }));

    if (predictions.length > 0) {
        await supabase
            .from("predictions")
            .upsert(predictions, { onConflict: "user_id,league,match_id" });
    }
}

// ============================================
// CLEAR PREDICTIONS
// ============================================
async function clearPredictions(
    userId: string,
    league: string,
    groupName?: string
): Promise<void> {
    const supabase = createClient();
    if (!supabase) {
        const storageKey = getStorageKey(league);
        if (groupName) {
            const saved = localStorage.getItem(storageKey);
            const existing = saved ? JSON.parse(saved) : {};
            delete existing[groupName];
            localStorage.setItem(storageKey, JSON.stringify(existing));
        } else {
            localStorage.removeItem(storageKey);
        }
        return;
    }

    let query = supabase
        .from("predictions")
        .delete()
        .eq("user_id", userId)
        .eq("league", league);

    if (groupName) {
        query = query.eq("group_name", groupName);
    }

    await query;
}

// ============================================
// STORAGE KEY HELPER
// ============================================
function getStorageKey(league: string): string {
    switch (league) {
        case "1lig":
            return "1ligGroupScenarios";
        case "2lig":
            return "groupScenarios";
        case "cev-cl":
            return "cevclGroupScenarios";
        case "vsl":
            return "vslGroupScenarios";
        default:
            return `${league}Scenarios`;
    }
}

// ============================================
// REACT QUERY HOOKS
// ============================================

/**
 * Hook to fetch and manage predictions for a specific league
 */
export function usePredictions(league: string, groupName?: string) {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const userId = user?.id || "anonymous";

    useEffect(() => {
        const handleOnline = () => {
            processSyncQueue();
        };
        window.addEventListener('online', handleOnline);
        // Try processing on mount too
        processSyncQueue();
        return () => window.removeEventListener('online', handleOnline);
    }, []);

    const query = useQuery({
        queryKey: ["predictions", league, groupName, userId],
        queryFn: () => fetchPredictions(userId, league, groupName),
        enabled: true, // Always enabled, will use localStorage fallback
    });

    const saveMutation = useMutation({
        mutationFn: ({
            matchId,
            score,
        }: {
            matchId: string;
            score: string;
        }) => savePrediction(userId, league, matchId, score, groupName),
        onMutate: async ({ matchId, score }) => {
            // Optimistic update
            await queryClient.cancelQueries({
                queryKey: ["predictions", league, groupName, userId],
            });
            const previousData = queryClient.getQueryData<PredictionOverrides>([
                "predictions",
                league,
                groupName,
                userId,
            ]);

            queryClient.setQueryData<PredictionOverrides>(
                ["predictions", league, groupName, userId],
                (old = {}) => {
                    const newData = { ...old };
                    if (score) {
                        newData[matchId] = score;
                    } else {
                        delete newData[matchId];
                    }
                    return newData;
                }
            );

            return { previousData };
        },
        onError: (err, variables, context) => {
            if (context?.previousData) {
                queryClient.setQueryData(
                    ["predictions", league, groupName, userId],
                    context.previousData
                );
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({
                queryKey: ["predictions", league, groupName, userId],
            });
        },
    });

    const bulkSaveMutation = useMutation({
        mutationFn: (overrides: PredictionOverrides) =>
            bulkSavePredictions(userId, league, overrides, groupName),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["predictions", league, groupName, userId],
            });
        },
    });

    const clearMutation = useMutation({
        mutationFn: () => clearPredictions(userId, league, groupName),
        onSuccess: () => {
            queryClient.setQueryData(
                ["predictions", league, groupName, userId],
                {}
            );
        },
    });

    return {
        overrides: query.data || {},
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        // Actions
        setPrediction: (matchId: string, score: string) =>
            saveMutation.mutate({ matchId, score }),
        bulkSave: (overrides: PredictionOverrides) =>
            bulkSaveMutation.mutate(overrides),
        clear: () => clearMutation.mutate(),
        // Mutation states
        isSaving: saveMutation.isPending,
        isClearing: clearMutation.isPending,
    };
}
