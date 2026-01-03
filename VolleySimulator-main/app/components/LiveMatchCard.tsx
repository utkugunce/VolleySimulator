"use client";

import { LiveMatch } from '../types';
import { useState, useEffect } from 'react';

interface LiveMatchCardProps {
  match: LiveMatch;
  onClick?: () => void;
  showChat?: boolean;
}

export default function LiveMatchCard({ match, onClick, showChat = true }: LiveMatchCardProps) {
  const [pulseKey, setPulseKey] = useState(0);

  // Pulse animation every few seconds to show "live" status
  useEffect(() => {
    const interval = setInterval(() => {
      setPulseKey(prev => prev + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      onClick={onClick}
      className={`bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-xl overflow-hidden transition-all ${
        onClick ? 'cursor-pointer hover:border-red-500/50 hover:scale-[1.02]' : ''
      }`}
    >
      {/* Live Badge */}
      <div className="flex items-center justify-between px-4 py-2 bg-red-500/10 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span 
            key={pulseKey} 
            className="w-2 h-2 bg-red-500 rounded-full animate-pulse"
          />
          <span className="text-xs font-bold text-red-400 uppercase">Canlı</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>👁 {match.viewers?.toLocaleString() || '-'}</span>
          <span>Set {match.currentSet}</span>
        </div>
      </div>

      {/* Teams and Score */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          {/* Home Team */}
          <div className="flex-1 text-center">
            <div className="w-12 h-12 mx-auto bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-2xl mb-2 shadow-lg">
              🏐
            </div>
            <h3 className="font-bold text-white text-sm truncate">{match.homeTeam}</h3>
          </div>

          {/* Score */}
          <div className="px-4 text-center">
            <div className="text-3xl font-black text-white">
              {match.setWins?.home || 0} - {match.setWins?.away || 0}
            </div>
            <div className="text-sm text-slate-400 mt-1">Set</div>
            
            {/* Current Set Score */}
            <div className="mt-3 bg-red-500/20 border border-red-500/30 rounded-lg px-4 py-2">
              <div className="text-lg font-bold text-white">
                {match.currentSetScore?.home || 0} - {match.currentSetScore?.away || 0}
              </div>
              <div className="text-xs text-red-400">{match.currentSet}. Set</div>
            </div>
          </div>

          {/* Away Team */}
          <div className="flex-1 text-center">
            <div className="w-12 h-12 mx-auto bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center text-2xl mb-2 shadow-lg">
              🏐
            </div>
            <h3 className="font-bold text-white text-sm truncate">{match.awayTeam}</h3>
          </div>
        </div>

        {/* Set Scores */}
        {match.homeScore && match.homeScore.length > 0 && (
          <div className="mt-4 flex justify-center gap-2">
            {match.homeScore.map((homePoints, index) => (
              <div 
                key={index}
                className={`px-2 py-1 rounded text-xs font-medium ${
                  index === match.currentSet - 1
                    ? 'bg-red-500/30 text-red-300 animate-pulse'
                    : homePoints > (match.awayScore?.[index] || 0)
                      ? 'bg-blue-500/30 text-blue-300'
                      : 'bg-orange-500/30 text-orange-300'
                }`}
              >
                {homePoints}-{match.awayScore?.[index] || 0}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 bg-slate-900/50 flex items-center justify-between text-xs text-slate-500">
        <span>{match.league?.toUpperCase()}</span>
        <span>{match.venue}</span>
      </div>
    </div>
  );
}

// Mini version for sidebar/navbar
export function LiveMatchMini({ match }: { match: LiveMatch }) {
  return (
    <div className="flex items-center gap-3 px-3 py-2 bg-slate-800/50 rounded-lg">
      <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-300 truncate">{match.homeTeam}</span>
          <span className="font-bold text-white mx-2">
            {match.setWins?.home || 0}-{match.setWins?.away || 0}
          </span>
          <span className="text-slate-300 truncate text-right">{match.awayTeam}</span>
        </div>
        <div className="text-xs text-slate-500 text-center mt-0.5">
          Set {match.currentSet}: {match.currentSetScore?.home || 0}-{match.currentSetScore?.away || 0}
        </div>
      </div>
    </div>
  );
}

// Live Match Counter for Navbar
export function LiveMatchCounter({ count }: { count: number }) {
  if (count === 0) return null;

  return (
    <div className="flex items-center gap-1.5 bg-red-500/20 px-2 py-1 rounded-lg">
      <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
      <span className="text-xs font-bold text-red-400">{count} Canlı</span>
    </div>
  );
}
