'use client';

import { TeamStats } from '@/app/types';
import { LeagueConfig, THEME_COLORS } from '@/lib/config/leagues';
import { useMemo } from 'react';
import TeamAvatar from '@/app/components/TeamAvatar';
import { Trophy, Medal, AlertCircle } from 'lucide-react';

interface PlayoffData {
  stage?: string;
  matches?: Array<{
    homeTeam: string;
    awayTeam: string;
    homeScore?: number;
    awayScore?: number;
  }>;
}

interface LeaguePlayoffsClientProps {
  leagueConfig: LeagueConfig;
  teams: TeamStats[];
  playoffs?: PlayoffData;
}

export default function LeaguePlayoffsClient({
  leagueConfig,
  teams,
  playoffs,
}: LeaguePlayoffsClientProps) {
  const themeColors = THEME_COLORS[leagueConfig.theme];

  // İlk 4 ve 5-8 takımları belirle
  const top4 = useMemo(() => {
    const sorted = [...teams].sort((a, b) => b.points - a.points);
    return sorted.slice(0, 4);
  }, [teams]);

  const teams5to8 = useMemo(() => {
    const sorted = [...teams].sort((a, b) => b.points - a.points);
    return sorted.slice(4, 8);
  }, [teams]);

  // Playoff eşleşmeleri
  const semifinalMatches = useMemo(() => {
    if (top4.length < 4) return [];
    return [
      { home: top4[0], away: top4[3], label: 'Yarı Final 1' },
      { home: top4[1], away: top4[2], label: 'Yarı Final 2' },
    ];
  }, [top4]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Trophy className={`w-6 h-6 ${themeColors.text}`} />
          <h1 className="text-2xl font-bold text-white">
            {leagueConfig.name} Playoff
          </h1>
        </div>
        <div className={`px-3 py-1 rounded-full ${themeColors.bg} ${themeColors.text} text-sm font-medium`}>
          {leagueConfig.subtitle}
        </div>
      </div>

      {/* Playoff Bracket */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1-4 Playoff */}
        <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <h2 className="text-lg font-bold text-white">Şampiyonluk Playoff (1-4)</h2>
          </div>

          {top4.length >= 4 ? (
            <div className="space-y-4">
              {semifinalMatches.map((match, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950/50 rounded-lg p-3 border border-slate-800"
                >
                  <div className="text-xs text-slate-500 mb-2">{match.label}</div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1">
                      <TeamAvatar name={match.home.name} size="md" />
                      <div>
                        <div className="text-sm font-medium text-white">{match.home.name}</div>
                        <div className="text-xs text-slate-500">{match.home.points} puan</div>
                      </div>
                    </div>
                    <div className="px-4 py-2 bg-slate-800 rounded-lg">
                      <span className="text-lg font-bold text-slate-400">vs</span>
                    </div>
                    <div className="flex items-center gap-2 flex-1 justify-end">
                      <div className="text-right">
                        <div className="text-sm font-medium text-white">{match.away.name}</div>
                        <div className="text-xs text-slate-500">{match.away.points} puan</div>
                      </div>
                      <TeamAvatar name={match.away.name} size="md" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-slate-500">
              <AlertCircle className="w-8 h-8 mb-2" />
              <p>Playoff takımları henüz belli değil</p>
            </div>
          )}
        </div>

        {/* 5-8 Playoff */}
        <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
          <div className="flex items-center gap-2 mb-4">
            <Medal className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-bold text-white">5-8 Playoff</h2>
          </div>

          {teams5to8.length >= 4 ? (
            <div className="space-y-4">
              {[
                { home: teams5to8[0], away: teams5to8[3], label: '5-8 Yarı Final 1' },
                { home: teams5to8[1], away: teams5to8[2], label: '5-8 Yarı Final 2' },
              ].map((match, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950/50 rounded-lg p-3 border border-slate-800"
                >
                  <div className="text-xs text-slate-500 mb-2">{match.label}</div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1">
                      <TeamAvatar name={match.home.name} size="md" />
                      <div>
                        <div className="text-sm font-medium text-white">{match.home.name}</div>
                        <div className="text-xs text-slate-500">{match.home.points} puan</div>
                      </div>
                    </div>
                    <div className="px-4 py-2 bg-slate-800 rounded-lg">
                      <span className="text-lg font-bold text-slate-400">vs</span>
                    </div>
                    <div className="flex items-center gap-2 flex-1 justify-end">
                      <div className="text-right">
                        <div className="text-sm font-medium text-white">{match.away.name}</div>
                        <div className="text-xs text-slate-500">{match.away.points} puan</div>
                      </div>
                      <TeamAvatar name={match.away.name} size="md" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-slate-500">
              <AlertCircle className="w-8 h-8 mb-2" />
              <p>5-8 takımları henüz belli değil</p>
            </div>
          )}
        </div>
      </div>

      {/* Puan Durumu Özeti */}
      <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
        <h3 className="text-lg font-bold text-white mb-4">Playoff Sıralaması</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
          {teams.slice(0, 8).map((team, idx) => (
            <div
              key={team.name}
              className={`p-3 rounded-lg border ${
                idx < 4
                  ? 'bg-emerald-950/30 border-emerald-800/50'
                  : 'bg-amber-950/30 border-amber-800/50'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-bold ${idx < 4 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  #{idx + 1}
                </span>
                <TeamAvatar name={team.name} size="sm" />
              </div>
              <div className="text-xs font-medium text-white truncate">{team.name}</div>
              <div className="text-[10px] text-slate-500">{team.points} puan</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
