'use client';

import { useState, useMemo } from 'react';
import { TeamStats, Match } from '@/app/types';
import { LeagueConfig } from '@/lib/config/leagues';
import StatsTemplate from '@/app/components/LeagueTemplate/StatsTemplate';
import { useSimulationEngine, useSimulationConfig } from '@/hooks/useSimulationEngine';
import type { SimTeam, SimMatch, SimStanding, SimulatedStanding } from '@/types/simulation';

interface LeagueStatsClientProps {
  leagueConfig: LeagueConfig;
  teams: TeamStats[];
  matches: Match[];
}

export default function LeagueStatsClient({
  leagueConfig,
  teams,
  matches,
}: LeagueStatsClientProps) {
  const { runSimulation, isSimulating, result, error, reset } = useSimulationEngine();
  const { config } = useSimulationConfig();
  const [viewMode, setViewMode] = useState<'real' | 'simulated'>('real');

  // LeagueConfig'i StatsTemplate'in beklediği formata dönüştür
  const templateConfig = {
    id: leagueConfig.id,
    name: leagueConfig.name,
    shortName: leagueConfig.shortName,
    subtitle: leagueConfig.subtitle,
    theme: leagueConfig.theme,
    apiEndpoint: leagueConfig.apiEndpoint,
    storageKey: leagueConfig.storageKey,
    hasGroups: leagueConfig.hasGroups,
    groups: leagueConfig.groups,
    hasRounds: leagueConfig.hasRounds,
    rounds: leagueConfig.rounds,
    playoffSpots: leagueConfig.playoffSpots,
    secondaryPlayoffSpots: leagueConfig.secondaryPlayoffSpots,
    relegationSpots: leagueConfig.relegationSpots,
  };

  // Teams ve Matches'i simülasyon formatına dönüştür
  const simulationData = useMemo(() => {
    const simTeams: SimTeam[] = teams.map((t, idx) => ({
      id: `team-${idx}`,
      leagueId: leagueConfig.id,
      name: t.name,
      shortName: t.name.substring(0, 3).toUpperCase(),
      strengthRating: 1000, // Default strength
      groupId: t.groupName || null,
    }));

    const simMatches: SimMatch[] = matches.map((m, idx) => ({
      id: `match-${idx}`,
      leagueId: leagueConfig.id,
      homeTeamId: simTeams.find(team => team.name === m.homeTeam)?.id || '',
      awayTeamId: simTeams.find(team => team.name === m.awayTeam)?.id || '',
      homeTeamName: m.homeTeam,
      awayTeamName: m.awayTeam,
      homeScore: m.homeScore ?? null,
      awayScore: m.awayScore ?? null,
      matchDate: m.matchDate || null,
      week: null,
      round: null,
      groupId: m.groupName || null,
      status: m.isPlayed ? 'finished' : 'scheduled',
    }));

    // Mevcut puan durumunu hesapla
    const currentStandings: SimStanding[] = teams.map((t, idx) => ({
      id: `standing-${idx}`,
      leagueId: leagueConfig.id,
      teamId: simTeams[idx].id,
      teamName: t.name,
      position: idx + 1,
      played: t.played || 0,
      won: t.wins || 0,
      lost: (t.played || 0) - (t.wins || 0),
      setsWon: t.setsWon || 0,
      setsLost: t.setsLost || 0,
      points: t.points || 0,
      groupId: t.groupName || null,
    }));

    return { teams: simTeams, matches: simMatches, currentStandings };
  }, [teams, matches, leagueConfig.id]);

  const handleSimulate = () => {
    runSimulation({
      ...simulationData,
      config,
    });
    setViewMode('simulated');
  };

  const handleReset = () => {
    reset();
    setViewMode('real');
  };

  return (
    <div className="space-y-6">
      {/* Simülasyon Kontrol Paneli */}
      <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              🎮 Sezon Simülasyonu
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Kalan maçları simüle ederek sezon sonunu tahmin edin
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {viewMode === 'simulated' && result && (
              <button
                onClick={handleReset}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
              >
                ↩ Gerçek Veriye Dön
              </button>
            )}
            <button
              onClick={handleSimulate}
              disabled={isSimulating}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSimulating ? (
                <>
                  <span className="animate-spin">⚡</span>
                  Hesaplanıyor...
                </>
              ) : (
                <>
                  🎲 Sezonu Simüle Et
                </>
              )}
            </button>
          </div>
        </div>

        {/* Simülasyon Sonuç Özeti */}
        {result && viewMode === 'simulated' && (
          <div className="mt-4 pt-4 border-t border-indigo-200 dark:border-indigo-800">
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="bg-white dark:bg-gray-800 px-3 py-1 rounded-full">
                <span className="text-gray-500">⏱️</span>{' '}
                <span className="font-medium">{result.meta.duration}ms</span>
              </div>
              <div className="bg-white dark:bg-gray-800 px-3 py-1 rounded-full">
                <span className="text-gray-500">🎯</span>{' '}
                <span className="font-medium">{result.meta.matchCount} maç simüle edildi</span>
              </div>
              <div className="bg-white dark:bg-gray-800 px-3 py-1 rounded-full">
                <span className="text-gray-500">📅</span>{' '}
                <span className="font-medium">
                  {new Date(result.meta.timestamp).toLocaleTimeString('tr-TR')}
                </span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-sm text-red-600 dark:text-red-400">❌ {error}</p>
          </div>
        )}
      </div>

      {/* Simülasyon Sonuç Tablosu */}
      {viewMode === 'simulated' && result && (
        <div className="bg-white dark:bg-gray-900 border rounded-lg overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3">
            <h3 className="text-white font-semibold">📊 Tahmini Sezon Sonu Puan Durumu</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">#</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Takım</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-500 dark:text-gray-400">O</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-500 dark:text-gray-400">G</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-500 dark:text-gray-400">M</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-500 dark:text-gray-400">Set</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-500 dark:text-gray-400">P</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-500 dark:text-gray-400">Δ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {result.finalStandings.map((standing, idx) => {
                  const change = (standing as SimulatedStanding).positionChange;
                  return (
                    <tr key={standing.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-4 py-3 font-medium">{idx + 1}</td>
                      <td className="px-4 py-3 font-medium">{standing.teamName}</td>
                      <td className="px-4 py-3 text-center">{standing.played}</td>
                      <td className="px-4 py-3 text-center text-green-600">{standing.won}</td>
                      <td className="px-4 py-3 text-center text-red-600">{standing.lost}</td>
                      <td className="px-4 py-3 text-center text-gray-500">
                        {standing.setsWon}-{standing.setsLost}
                      </td>
                      <td className="px-4 py-3 text-center font-bold">{standing.points}</td>
                      <td className="px-4 py-3 text-center">
                        {change > 0 && <span className="text-green-600">↑{change}</span>}
                        {change < 0 && <span className="text-red-600">↓{Math.abs(change)}</span>}
                        {change === 0 && <span className="text-gray-400">-</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Normal Stats Template */}
      {viewMode === 'real' && (
        <StatsTemplate
          config={templateConfig}
          initialTeams={teams}
          initialMatches={matches}
        />
      )}
    </div>
  );
}
