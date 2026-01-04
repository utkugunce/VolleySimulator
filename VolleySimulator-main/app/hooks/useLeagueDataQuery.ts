'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { LeagueId, getLeagueConfig } from '@/lib/config/leagues';
import type { TeamStats, Match } from '@/app/types';

export interface LeagueDataResponse {
  league: {
    id: string;
    name: string;
    short_name: string;
    season: string;
  } | null;
  teams: TeamStats[];
  fixture: Match[];
  groups: string[];
  stats: {
    totalTeams: number;
    totalMatches: number;
    playedMatches: number;
    upcomingMatches: number;
  };
  lastUpdated: string;
}

interface UseLeagueDataOptions {
  /** Veri ne kadar süre fresh kabul edilsin (ms) */
  staleTime?: number;
  /** Başlangıç verisi (SSR'dan gelen) */
  initialData?: LeagueDataResponse;
  /** Otomatik fetch */
  enabled?: boolean;
}

/**
 * Dinamik lig verisi hook'u
 * 
 * Veritabanından veya cache'den lig verilerini çeker.
 * React Query ile otomatik cache, refetch ve optimistic updates.
 * 
 * @example
 * ```tsx
 * const { data, isLoading, error, refetch } = useLeagueDataQuery('vsl');
 * ```
 */
export function useLeagueDataQuery(
  leagueId: LeagueId,
  options: UseLeagueDataOptions = {}
) {
  const {
    staleTime = 1000 * 60 * 5, // 5 dakika
    initialData,
    enabled = true,
  } = options;

  const config = getLeagueConfig(leagueId);

  return useQuery<LeagueDataResponse>({
    queryKey: ['leagueData', leagueId],
    queryFn: async () => {
      const response = await fetch(`/api/leagues/${leagueId}/data`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch league data: ${response.statusText}`);
      }
      
      return response.json();
    },
    staleTime,
    initialData,
    enabled: enabled && !!config,
    refetchOnWindowFocus: false,
    retry: 2,
  });
}

/**
 * Lig verilerini önceden yükle (prefetch)
 */
export function usePrefetchLeagueData() {
  const queryClient = useQueryClient();

  return async (leagueId: LeagueId) => {
    await queryClient.prefetchQuery({
      queryKey: ['leagueData', leagueId],
      queryFn: async () => {
        const response = await fetch(`/api/leagues/${leagueId}/data`);
        if (!response.ok) throw new Error('Prefetch failed');
        return response.json();
      },
      staleTime: 1000 * 60 * 5,
    });
  };
}

/**
 * Lig cache'ini invalidate et
 */
export function useInvalidateLeagueData() {
  const queryClient = useQueryClient();

  return (leagueId?: LeagueId) => {
    if (leagueId) {
      queryClient.invalidateQueries({ queryKey: ['leagueData', leagueId] });
    } else {
      // Tüm lig verilerini invalidate et
      queryClient.invalidateQueries({ queryKey: ['leagueData'] });
    }
  };
}

/**
 * Tüm liglerin özet istatistiklerini çek
 */
export function useAllLeaguesStats() {
  return useQuery({
    queryKey: ['allLeaguesStats'],
    queryFn: async () => {
      const response = await fetch('/api/leagues/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    },
    staleTime: 1000 * 60 * 10, // 10 dakika
  });
}
