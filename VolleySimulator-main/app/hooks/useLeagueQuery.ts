"use client";

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { TeamStats, Match } from '../types';

interface LeagueData {
    teams: TeamStats[];
    fixture: Match[];
    groups?: string[];
    rounds?: any[];
    pools?: any[];
}

interface LeagueConfig {
    hasGroups: boolean;
    apiEndpoint: string;
    name: string;
}

export function useLeagueQuery(
    leagueId: string,
    config: LeagueConfig,
    options?: {
        enabled?: boolean;
    }
) {
    return useQuery({
        queryKey: ['league', leagueId],
        queryFn: async () => {
            const res = await fetch(config.apiEndpoint);
            if (!res.ok) throw new Error(`Failed to fetch ${leagueId} data`);

            const json = await res.json();

            // Normalize data structure
            const normalizedData: LeagueData = {
                teams: json.teams || [],
                fixture: json.fixture || json.matches || [],
                groups: json.groups || (config.hasGroups ? extractGroups(json.teams) : undefined),
                rounds: json.rounds || undefined,
                pools: json.pools || undefined
            };

            return normalizedData;
        },
        staleTime: 1000 * 60 * 10, // 10 minutes
        gcTime: 1000 * 60 * 30, // 30 minutes
        retry: 2,
        enabled: options?.enabled !== false,
    });
}

export function useLeagueData(leagueId: string, config: LeagueConfig) {
    const queryClient = useQueryClient();

    return useQuery({
        queryKey: ['league', leagueId, 'data'],
        queryFn: async () => {
            const res = await fetch(config.apiEndpoint);
            if (!res.ok) throw new Error(`Failed to fetch ${leagueId} data`);
            return res.json();
        },
        staleTime: 1000 * 60 * 10,
        gcTime: 1000 * 60 * 30,
        retry: 2,
    });
}

export function useInvalidateLeague(leagueId: string) {
    const queryClient = useQueryClient();
    
    return {
        invalidate: () => {
            queryClient.invalidateQueries({
                queryKey: ['league', leagueId]
            });
        },
        refetch: () => {
            queryClient.refetchQueries({
                queryKey: ['league', leagueId]
            });
        }
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
