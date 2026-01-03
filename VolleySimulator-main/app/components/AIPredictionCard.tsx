"use client";

import { useState } from 'react';
import { AIPrediction } from '../types';

interface AIPredictionCardProps {
  homeTeam: string;
  awayTeam: string;
  prediction?: AIPrediction | null;
  isLoading?: boolean;
  onRequestPrediction?: () => void;
  compact?: boolean;
}

export default function AIPredictionCard({
  homeTeam,
  awayTeam,
  prediction,
  isLoading = false,
  onRequestPrediction,
  compact = false,
}: AIPredictionCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  if (isLoading) {
    return (
      <div className="bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/30 rounded-xl p-4 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-violet-500/30 rounded-full" />
          <div className="flex-1">
            <div className="h-4 bg-slate-700 rounded w-32 mb-2" />
            <div className="h-3 bg-slate-700 rounded w-24" />
          </div>
        </div>
      </div>
    );
  }

  if (!prediction) {
    return (
      <button
        onClick={onRequestPrediction}
        className="w-full bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/30 hover:border-violet-500/50 rounded-xl p-4 transition-all group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
            <span className="text-xl">🤖</span>
          </div>
          <div className="text-left">
            <h4 className="font-bold text-white">AI Tahmin Al</h4>
            <p className="text-xs text-slate-400">Yapay zeka analizi iste</p>
          </div>
          <span className="ml-auto text-violet-400 text-xl group-hover:translate-x-1 transition-transform">→</span>
        </div>
      </button>
    );
  }

  // Determine winner
  const homeWins = prediction.homeWinProbability > prediction.awayWinProbability;
  const winProb = homeWins ? prediction.homeWinProbability : prediction.awayWinProbability;
  const winner = homeWins ? homeTeam : awayTeam;

  if (compact) {
    return (
      <div className="bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/30 rounded-xl p-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">🤖</span>
          <span className="text-sm text-white font-medium">{winner}</span>
          <span className="ml-auto text-sm font-bold text-violet-400">%{winProb}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/30 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-violet-500/20 flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-500 rounded-full flex items-center justify-center">
          <span className="text-xl">🤖</span>
        </div>
        <div>
          <h4 className="font-bold text-white">AI Tahmin Asistanı</h4>
          <p className="text-xs text-slate-400">Yapay zeka analizi</p>
        </div>
        <div className="ml-auto">
          <div className={`px-2 py-1 rounded-lg text-xs font-bold ${
            prediction.confidence >= 80 ? 'bg-emerald-500/20 text-emerald-400' :
            prediction.confidence >= 60 ? 'bg-amber-500/20 text-amber-400' :
            'bg-red-500/20 text-red-400'
          }`}>
            Güven: %{prediction.confidence}
          </div>
        </div>
      </div>

      {/* Prediction */}
      <div className="p-4">
        {/* Win Probabilities */}
        <div className="space-y-3 mb-4">
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className={homeWins ? 'text-white font-bold' : 'text-slate-400'}>{homeTeam}</span>
              <span className={homeWins ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                %{prediction.homeWinProbability}
              </span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all ${homeWins ? 'bg-emerald-500' : 'bg-slate-600'}`}
                style={{ width: `${prediction.homeWinProbability}%` }}
              />
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className={!homeWins ? 'text-white font-bold' : 'text-slate-400'}>{awayTeam}</span>
              <span className={!homeWins ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                %{prediction.awayWinProbability}
              </span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all ${!homeWins ? 'bg-emerald-500' : 'bg-slate-600'}`}
                style={{ width: `${prediction.awayWinProbability}%` }}
              />
            </div>
          </div>
        </div>

        {/* Predicted Score */}
        <div className="bg-slate-900/50 rounded-lg p-3 text-center mb-4">
          <div className="text-xs text-slate-500 mb-1">Tahmini Skor</div>
          <div className="text-2xl font-black text-white">{prediction.predictedScore}</div>
        </div>

        {/* Show Details Toggle */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full text-sm text-violet-400 hover:text-violet-300 transition-colors"
        >
          {showDetails ? 'Detayları Gizle ↑' : 'Detayları Göster ↓'}
        </button>

        {/* Details */}
        {showDetails && prediction.factors && prediction.factors.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-800">
            <h5 className="text-sm font-medium text-slate-300 mb-2">Analiz Faktörleri:</h5>
            <ul className="space-y-2">
              {prediction.factors.map((factor, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-slate-400">
                  <span className={factor.impact === 'positive' ? 'text-green-400' : factor.impact === 'negative' ? 'text-red-400' : 'text-violet-400'}>•</span>
                  <span><strong>{factor.name}:</strong> {factor.description}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 bg-slate-900/50 text-xs text-slate-500 text-center">
        Oluşturulma: {new Date(prediction.lastUpdated).toLocaleTimeString('tr-TR')}
      </div>
    </div>
  );
}
