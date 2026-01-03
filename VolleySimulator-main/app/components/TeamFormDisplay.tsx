"use client";

import { TeamForm, HeadToHeadStats } from '../types';

interface TeamFormDisplayProps {
  form: TeamForm;
  teamName: string;
}

export function TeamFormDisplay({ form, teamName }: TeamFormDisplayProps) {
  const formResults = form.lastFiveMatches || form.last5Results || [];
  const formPercentage = form.formPercentage ?? form.winRate ?? 0;
  const goalsScored = form.goalsScored ?? form.avgPointsScored ?? 0;
  const goalsConceded = form.goalsConceded ?? form.avgPointsConceded ?? 0;
  const winStreak = form.winStreak ?? 0;
  
  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-bold text-white">{teamName}</h4>
        <span className={`text-sm font-bold ${
          formPercentage >= 70 ? 'text-emerald-400' :
          formPercentage >= 50 ? 'text-amber-400' :
          'text-red-400'
        }`}>
          Form: %{formPercentage}
        </span>
      </div>

      {/* Last 5 Results */}
      <div className="flex items-center gap-1.5 mb-3">
        <span className="text-xs text-slate-500 mr-2">Son 5:</span>
        {formResults.map((result, index) => (
          <span 
            key={index}
            className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${
              result === 'W' ? 'bg-emerald-500/30 text-emerald-400' :
              result === 'D' ? 'bg-amber-500/30 text-amber-400' :
              'bg-red-500/30 text-red-400'
            }`}
          >
            {result === 'W' ? 'G' : result === 'D' ? 'B' : 'M'}
          </span>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-slate-800/50 rounded-lg p-2">
          <div className="text-lg font-bold text-white">{Math.round(goalsScored)}</div>
          <div className="text-xs text-slate-500">Atılan</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-2">
          <div className="text-lg font-bold text-white">{Math.round(goalsConceded)}</div>
          <div className="text-xs text-slate-500">Yenen</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-2">
          <div className="text-lg font-bold text-white">{winStreak}</div>
          <div className="text-xs text-slate-500">Seri</div>
        </div>
      </div>
    </div>
  );
}

interface HeadToHeadDisplayProps {
  stats: HeadToHeadStats;
  homeTeam: string;
  awayTeam: string;
}

export function HeadToHeadDisplay({ stats, homeTeam, awayTeam }: HeadToHeadDisplayProps) {
  const total = stats.totalMatches || 0;
  const homeWinPercent = total > 0 ? Math.round((stats.homeWins / total) * 100) : 0;
  const awayWinPercent = total > 0 ? Math.round((stats.awayWins / total) * 100) : 0;

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
      <h4 className="font-bold text-white mb-4 text-center">Karşılaşma Geçmişi</h4>

      {/* Stats Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-blue-400 font-bold">{stats.homeWins}</span>
          <span className="text-slate-500">{total} maç</span>
          <span className="text-orange-400 font-bold">{stats.awayWins}</span>
        </div>
        <div className="h-3 bg-slate-800 rounded-full overflow-hidden flex">
          <div 
            className="bg-blue-500 transition-all"
            style={{ width: `${homeWinPercent}%` }}
          />
          <div 
            className="bg-orange-500 transition-all"
            style={{ width: `${awayWinPercent}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs mt-2 text-slate-500">
          <span>{homeTeam}</span>
          <span>{awayTeam}</span>
        </div>
      </div>

      {/* Last Results */}
      {stats.lastMeetings && stats.lastMeetings.length > 0 && (
        <div>
          <h5 className="text-xs text-slate-500 mb-2">Son Karşılaşmalar</h5>
          <div className="space-y-2">
            {stats.lastMeetings.slice(0, 3).map((result, index) => (
              <div 
                key={index}
                className="flex items-center justify-between text-sm bg-slate-800/50 rounded-lg px-3 py-2"
              >
                <span className="text-slate-500 text-xs">
                  {new Date(result.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                </span>
                <span className="font-bold text-slate-300">
                  {result.score}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Average Stats */}
      <div className="grid grid-cols-2 gap-2 mt-4 text-center">
        <div className="bg-slate-800/50 rounded-lg p-2">
          <div className="text-sm font-bold text-white">{stats.homeSetWins || 0}</div>
          <div className="text-xs text-slate-500">Set (Ev)</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-2">
          <div className="text-sm font-bold text-white">{stats.awaySetWins || 0}</div>
          <div className="text-xs text-slate-500">Set (Dış)</div>
        </div>
      </div>
    </div>
  );
}

// Compact version for match cards
export function FormBadge({ form }: { form: TeamForm }) {
  const percentage = form.formPercentage ?? form.winRate ?? 0;
  const color = percentage >= 70 ? 'emerald' :
                percentage >= 50 ? 'amber' : 'red';

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 bg-${color}-500/20 rounded-lg`}>
      <span className={`text-xs font-bold text-${color}-400`}>
        {percentage}%
      </span>
      <div className="flex gap-0.5">
        {form.lastFiveMatches?.slice(0, 3).map((result, i) => (
          <span 
            key={i}
            className={`w-1.5 h-1.5 rounded-full ${
              result === 'W' ? 'bg-emerald-400' :
              result === 'D' ? 'bg-amber-400' :
              'bg-red-400'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
