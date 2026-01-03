"use client";

import { useQuests } from '../context/QuestsContext';

export default function StreakWidget() {
  const { streakData, isLoading } = useQuests();

  if (isLoading || !streakData) {
    return (
      <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-xl p-4 animate-pulse">
        <div className="h-8 bg-slate-700 rounded w-16 mx-auto" />
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-xl p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Fire Icon with animation */}
          <div className="relative">
            <span className="text-3xl animate-pulse">🔥</span>
            {streakData.currentStreak >= 7 && (
              <span className="absolute -top-1 -right-1 text-lg">⚡</span>
            )}
          </div>
          
          <div>
            <div className="text-2xl font-black text-white">
              {streakData.currentStreak}
            </div>
            <div className="text-xs text-slate-400">
              Günlük Seri
            </div>
          </div>
        </div>

        {/* Best streak */}
        <div className="text-right">
          <div className="text-sm text-slate-400">En İyi</div>
          <div className="text-lg font-bold text-orange-400">
            {streakData.longestStreak} 🏆
          </div>
        </div>
      </div>

      {/* Freeze tokens */}
      {streakData.streakFreezeAvailable > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-800">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Seri Koruma</span>
            <div className="flex gap-1">
              {Array.from({ length: streakData.streakFreezeAvailable }).map((_, i) => (
                <span key={i} className="text-lg">❄️</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Streak bonus message */}
      {streakData.currentStreak >= 3 && (
        <div className="mt-3 bg-orange-500/20 rounded-lg px-3 py-2 text-center">
          <span className="text-sm text-orange-300">
            {streakData.currentStreak >= 30 ? '🌟 Efsanevi Seri! 2x puan' :
             streakData.currentStreak >= 14 ? '💪 Süper Seri! 1.75x puan' :
             streakData.currentStreak >= 7 ? '🔥 Ateşli Seri! 1.5x puan' :
             '✨ Başarılı Seri! 1.25x puan'}
          </span>
        </div>
      )}
    </div>
  );
}

// Compact version for navbar
export function StreakBadge() {
  const { streakData, isLoading } = useQuests();

  if (isLoading || !streakData || streakData.currentStreak === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-1 bg-gradient-to-r from-orange-500/20 to-red-500/20 px-2 py-1 rounded-lg">
      <span className="text-sm">🔥</span>
      <span className="text-sm font-bold text-orange-400">{streakData.currentStreak}</span>
    </div>
  );
}
