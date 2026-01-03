"use client";

import { useState, useEffect, useCallback } from 'react';
import { LeagueConfig, LeagueData, LEAGUE_CONFIGS } from './types';
import { TeamStats, Match } from '../../types';

interface UseLeagueDataOptions {
    leagueId: string;
    autoFetch?: boolean;
}

interface UseLeagueDataReturn {
    data: LeagueData | null;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    config: LeagueConfig;
}

export function useLeagueData({ leagueId, autoFetch = true }: UseLeagueDataOptions): UseLeagueDataReturn {
    const [data, setData] = useState<LeagueData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const config = LEAGUE_CONFIGS[leagueId];

    const fetchData = useCallback(async () => {
        if (!config) {
            setError(`Unknown league: ${leagueId}`);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const res = await fetch(config.apiEndpoint);
            if (!res.ok) throw new Error('Veri çekilemedi');

            const json = await res.json();

            // Normalize data structure
            const normalizedData: LeagueData = {
                teams: json.teams || [],
                fixture: json.fixture || json.matches || [],
                groups: json.groups || (config.hasGroups ? extractGroups(json.teams) : undefined),
                rounds: json.rounds || undefined,
                pools: json.pools || undefined
            };

            setData(normalizedData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Bilinmeyen hata');
        } finally {
            setLoading(false);
        }
    }, [config, leagueId]);

    useEffect(() => {
        if (autoFetch) {
            fetchData();
        }
    }, [autoFetch, fetchData]);

    return {
        data,
        loading,
        error,
        refetch: fetchData,
        config
    };
}

// Helper to extract unique groups from teams
function extractGroups(teams: TeamStats[]): string[] {
    const groups = [...new Set(teams.map(t => t.groupName))].filter(Boolean);
    return groups.sort((a, b) => {
        const numA = parseInt(a.match(/\d+/)?.[0] || '0');
        const numB = parseInt(b.match(/\d+/)?.[0] || '0');
        return numA - numB;
    });
}

export default useLeagueData;
