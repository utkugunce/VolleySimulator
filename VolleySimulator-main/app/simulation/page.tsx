"use client";

import { useState, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { useMatchSimulation, getSimulationState } from "../hooks/useMatchSimulation";
import Link from "next/link";

// Sample teams for simulation
const SAMPLE_TEAMS = [
  "FENERBAHÇE MEDICANA",
  "ECZACIBAŞI DYNAVİT",
  "VAKIFBANK",
  "GALATASARAY DAIKIN",
  "THY",
  "NİLÜFER BELEDİYESPOR",
  "BEŞİKTAŞ",
  "ARAS KARGO",
];

export default function SimulationPage() {
  const { user } = useAuth();
  const { 
    simulation, 
    isSimulating, 
    isPlaying,
    currentSet,
    currentPoint,
    progress,
    startSimulation,
    play,
    pause,
    reset,
    skipToEnd,
    setSpeed,
  } = useMatchSimulation({ autoPlay: false });
  
  const [homeTeam, setHomeTeam] = useState(SAMPLE_TEAMS[0]);
  const [awayTeam, setAwayTeam] = useState(SAMPLE_TEAMS[1]);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    setSpeed(speed);
  };

  const simulationState = useMemo(() => {
    if (!simulation) return null;
    return getSimulationState(simulation, currentSet, currentPoint);
  }, [simulation, currentSet, currentPoint]);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-white">Maç Simülasyonu</h1>
          <p className="text-white/70 text-sm mt-1">
            Takımları seç ve maçın nasıl oynanabileceğini izle
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Team Selection */}
        {!simulation && (
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <h2 className="font-bold text-white mb-4">Takımları Seç</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Home Team */}
              <div>
                <label className="block text-sm text-slate-400 mb-2">Ev Sahibi</label>
                <select
                  value={homeTeam}
                  onChange={(e) => setHomeTeam(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500"
                >
                  {SAMPLE_TEAMS.map(team => (
                    <option key={team} value={team} disabled={team === awayTeam}>
                      {team}
                    </option>
                  ))}
                </select>
              </div>

              {/* Away Team */}
              <div>
                <label className="block text-sm text-slate-400 mb-2">Deplasman</label>
                <select
                  value={awayTeam}
                  onChange={(e) => setAwayTeam(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500"
                >
                  {SAMPLE_TEAMS.map(team => (
                    <option key={team} value={team} disabled={team === homeTeam}>
                      {team}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={() => startSimulation(homeTeam, awayTeam)}
              disabled={isSimulating}
              className="w-full mt-6 px-6 py-4 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 disabled:opacity-50 rounded-xl font-bold text-lg transition-all"
            >
              {isSimulating ? 'Simülasyon Hazırlanıyor...' : '🎮 Simülasyonu Başlat'}
            </button>
          </div>
        )}

        {/* Simulation Display */}
        {simulation && simulationState && (
          <>
            {/* Scoreboard */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl p-8">
              <div className="flex items-center justify-between">
                {/* Home Team */}
                <div className="flex-1 text-center">
                  <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-4xl mb-4 shadow-lg">
                    🏐
                  </div>
                  <h3 className="font-bold text-white text-xl">{simulation.homeTeam}</h3>
                </div>

                {/* Score */}
                <div className="px-12 text-center">
                  <div className="text-6xl font-black text-white mb-4">
                    {simulationState.setScore.home} - {simulationState.setScore.away}
                  </div>
                  <div className="text-sm text-slate-400">Set Skoru</div>
                  
                  {!simulationState.isComplete && (
                    <div className="mt-6 bg-violet-500/20 border border-violet-500/30 rounded-xl px-8 py-4">
                      <div className="text-3xl font-bold text-white">
                        {simulationState.currentSetScore.home} - {simulationState.currentSetScore.away}
                      </div>
                      <div className="text-sm text-violet-400 mt-1">
                        {currentSet + 1}. Set
                      </div>
                    </div>
                  )}

                  {simulationState.isComplete && (
                    <div className="mt-6 bg-emerald-500/20 border border-emerald-500/30 rounded-xl px-8 py-4">
                      <div className="text-lg font-bold text-emerald-400">
                        🏆 {simulation.winner} Kazandı!
                      </div>
                    </div>
                  )}
                </div>

                {/* Away Team */}
                <div className="flex-1 text-center">
                  <div className="w-24 h-24 mx-auto bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center text-4xl mb-4 shadow-lg">
                    🏐
                  </div>
                  <h3 className="font-bold text-white text-xl">{simulation.awayTeam}</h3>
                </div>
              </div>

              {/* Last Point Animation */}
              {simulationState.lastPoint && !simulationState.isComplete && (
                <div className="mt-6 text-center">
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm ${
                    simulationState.lastPoint.scorer === 'home'
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-orange-500/20 text-orange-400'
                  }`}>
                    {getPointTypeIcon(simulationState.lastPoint.type)}
                    <span>
                      {simulationState.lastPoint.scorer === 'home' ? simulation.homeTeam : simulation.awayTeam}
                      {' - '}
                      {getPointTypeText(simulationState.lastPoint.type)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Progress Bar */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-100"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
                <span>Başlangıç</span>
                <span>Bitiş</span>
              </div>
            </div>

            {/* Controls */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={reset}
                  className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
                  title="Başa Sar"
                >
                  ⏮️
                </button>
                
                <button
                  onClick={isPlaying ? pause : play}
                  className="p-4 bg-violet-600 hover:bg-violet-700 rounded-xl transition-colors"
                >
                  {isPlaying ? '⏸️' : '▶️'}
                </button>
                
                <button
                  onClick={skipToEnd}
                  className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
                  title="Sonuca Atla"
                >
                  ⏭️
                </button>
              </div>

              {/* Speed Control */}
              <div className="flex items-center justify-center gap-2 mt-4">
                <span className="text-xs text-slate-500">Hız:</span>
                {[0.5, 1, 2, 4].map(speed => (
                  <button
                    key={speed}
                    onClick={() => handleSpeedChange(speed)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                      playbackSpeed === speed
                        ? 'bg-violet-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            </div>

            {/* Set Details */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
              <h3 className="font-bold text-white mb-4">Set Detayları</h3>
              <div className="grid grid-cols-5 gap-4">
                {simulation.simulatedSets.map((set, index) => {
                  const isCurrentSet = index === currentSet && !simulationState.isComplete;
                  const isPastSet = index < currentSet || simulationState.isComplete;
                  
                  return (
                    <div 
                      key={index}
                      className={`text-center p-4 rounded-xl border transition-all ${
                        isCurrentSet 
                          ? 'bg-violet-500/20 border-violet-500/50 animate-pulse'
                          : isPastSet
                            ? set.winner === 'home'
                              ? 'bg-blue-500/20 border-blue-500/30'
                              : 'bg-orange-500/20 border-orange-500/30'
                            : 'bg-slate-800/50 border-slate-700'
                      }`}
                    >
                      <div className="text-xs text-slate-400 mb-2">{index + 1}. Set</div>
                      <div className={`text-xl font-bold ${
                        isPastSet 
                          ? 'text-white' 
                          : isCurrentSet 
                            ? 'text-violet-400'
                            : 'text-slate-600'
                      }`}>
                        {isPastSet 
                          ? `${set.homePoints}-${set.awayPoints}`
                          : isCurrentSet
                            ? `${simulationState.currentSetScore.home}-${simulationState.currentSetScore.away}`
                            : '-'
                        }
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Key Moments */}
            {simulation.keyMoments.length > 0 && (
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                <h3 className="font-bold text-white mb-4">Önemli Anlar</h3>
                <div className="space-y-3">
                  {simulation.keyMoments.map((moment, index) => (
                    <div 
                      key={index}
                      className={`flex items-center gap-3 p-3 rounded-lg ${
                        moment.type === 'match_point'
                          ? 'bg-emerald-500/20 border border-emerald-500/30'
                          : 'bg-slate-800/50'
                      }`}
                    >
                      <span className="text-xl">
                        {moment.type === 'match_point' ? '🏆' : 
                         moment.type === 'set_point' ? '📍' : '⚡'}
                      </span>
                      <span className={
                        moment.type === 'match_point' ? 'text-emerald-400' : 'text-slate-300'
                      }>
                        {moment.description}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Simulation Button */}
            <button
              onClick={() => {
                reset();
                startSimulation(homeTeam, awayTeam);
              }}
              className="w-full px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-medium transition-colors"
            >
              🔄 Yeni Simülasyon
            </button>
          </>
        )}
      </div>
    </main>
  );
}

function getPointTypeIcon(type: string): string {
  switch (type) {
    case 'attack': return '💥';
    case 'block': return '🛡️';
    case 'ace': return '🎯';
    case 'error': return '❌';
    default: return '🏐';
  }
}

function getPointTypeText(type: string): string {
  switch (type) {
    case 'attack': return 'Hücum Sayısı';
    case 'block': return 'Blok Sayısı';
    case 'ace': return 'As Servis';
    case 'error': return 'Rakip Hata';
    default: return 'Sayı';
  }
}
