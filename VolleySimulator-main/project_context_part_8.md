# Project Application Context - Part 8

## File: app\components\Achievements.tsx
```
"use client";

import { useEffect, useState } from "react";
import { Achievement } from "../types";
import { useGameState, ACHIEVEMENTS } from "../utils/gameState";

interface AchievementToastProps {
    achievement: Achievement;
    onClose: () => void;
}

function AchievementToast({ achievement, onClose }: AchievementToastProps) {
    useEffect(() => {
        const timer = setTimeout(onClose, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-bounce-in">
            <div className="bg-gradient-to-r from-amber-900/95 to-orange-900/95 backdrop-blur-lg rounded-2xl border-2 border-amber-500 shadow-2xl shadow-amber-500/30 p-4 min-w-[300px]">
                <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl text-4xl shadow-lg" aria-hidden="true">
                        {achievement.icon}
                    </div>
                    <div className="flex-1">
                        <div className="text-xs text-amber-400 font-bold uppercase tracking-wider mb-1">
                            🎉 Başarı Açıldı!
                        </div>
                        <div className="text-lg font-black text-white">{achievement.name}</div>
                        <div className="text-xs text-slate-300">{achievement.description}</div>
                        <div className="text-sm font-bold text-amber-400 mt-1">
                            +{achievement.xpReward} XP
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

interface AchievementsPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AchievementsPanel({ isOpen, onClose }: AchievementsPanelProps) {
    const { gameState, hasAchievement } = useGameState();

    if (!isOpen) return null;

    const allAchievements = Object.values(ACHIEVEMENTS);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl max-w-lg w-full mx-4 max-h-[80vh] overflow-hidden"
                onClick={e => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="achievements-title"
            >
                <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                    <h2 id="achievements-title" className="text-xl font-black text-white flex items-center gap-2">
                        <span>🏆</span> Başarılar
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white text-xl">✕</button>
                </div>

                <div className="p-4 overflow-y-auto max-h-[60vh]">
                    <div className="grid grid-cols-2 gap-3">
                        {allAchievements.map(achievement => {
                            const isUnlocked = hasAchievement(achievement.id);
                            const unlockedData = gameState.achievements.find(a => a.id === achievement.id);

                            return (
                                <div
                                    key={achievement.id}
                                    className={`p-3 rounded-xl border transition-all ${isUnlocked
                                        ? 'bg-gradient-to-br from-amber-900/30 to-orange-900/30 border-amber-600/50'
                                        : 'bg-slate-800/50 border-slate-700/50 opacity-60'
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`text-3xl ${!isUnlocked && 'grayscale opacity-50'}`}>
                                            {achievement.icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-bold text-white text-sm truncate">
                                                {achievement.name}
                                            </div>
                                            <div className="text-[10px] text-slate-400 line-clamp-2">
                                                {achievement.description}
                                            </div>
                                            <div className="text-xs font-bold text-amber-400 mt-1">
                                                +{achievement.xpReward} XP
                                            </div>
                                            {isUnlocked && unlockedData?.unlockedAt && (
                                                <div className="text-[10px] text-slate-500 mt-0.5">
                                                    ✓ {new Date(unlockedData.unlockedAt).toLocaleDateString('tr-TR')}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="p-4 border-t border-slate-700 bg-slate-800/50">
                    <div className="text-center text-sm text-slate-400">
                        {gameState.achievements.length} / {allAchievements.length} başarı açıldı
                    </div>
                </div>
            </div>
        </div>
    );
}

// Export the toast component
export { AchievementToast };

```

## File: app\components\AIPredictionCard.tsx
```
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

```

## File: app\components\AuthGuard.tsx
```
"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";

interface AuthGuardProps {
    children: React.ReactNode;
}

// Public paths that don't require authentication
const PUBLIC_PATHS = ["/", "/login", "/register", "/auth/callback", "/oauth", "/1lig/tahminoyunu", "/2lig/tahminoyunu", "/1lig/gunceldurum", "/2lig/gunceldurum", "/1lig/stats", "/2lig/stats"];

export default function AuthGuard({ children }: AuthGuardProps) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const isPublicPath = PUBLIC_PATHS.some(
        (path) => pathname === path || pathname?.startsWith("/auth/") || pathname?.startsWith("/oauth")
    );

    useEffect(() => {
        if (!loading && !user && !isPublicPath) {
            router.push("/login");
        }
    }, [user, loading, isPublicPath, router]);

    // Show loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    // If not authenticated and trying to access protected route, show nothing (will redirect)
    if (!user && !isPublicPath) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    return <>{children}</>;
}

```

## File: app\components\BadgeDisplay.tsx
```
"use client";

import { Badge, BadgeRarity } from '../types';

interface BadgeDisplayProps {
  badge: Badge;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
}

const rarityColors: Record<BadgeRarity, { bg: string; border: string; text: string }> = {
  common: {
    bg: 'from-slate-600 to-slate-700',
    border: 'border-slate-500',
    text: 'text-slate-300',
  },
  uncommon: {
    bg: 'from-green-600 to-emerald-700',
    border: 'border-green-500',
    text: 'text-green-300',
  },
  rare: {
    bg: 'from-blue-600 to-indigo-700',
    border: 'border-blue-500',
    text: 'text-blue-300',
  },
  epic: {
    bg: 'from-purple-600 to-violet-700',
    border: 'border-purple-500',
    text: 'text-purple-300',
  },
  legendary: {
    bg: 'from-amber-500 to-orange-600',
    border: 'border-amber-400',
    text: 'text-amber-300',
  },
};

const rarityLabels: Record<BadgeRarity, string> = {
  common: 'Yaygın',
  uncommon: 'Nadir',
  rare: 'Epik',
  epic: 'Efsanevi',
  legendary: 'Efsane',
};

const sizeClasses = {
  sm: 'w-10 h-10 text-xl',
  md: 'w-14 h-14 text-2xl',
  lg: 'w-20 h-20 text-4xl',
};

export default function BadgeDisplay({ badge, size = 'md', showDetails = true }: BadgeDisplayProps) {
  const colors = rarityColors[badge.rarity];
  const sizeClass = sizeClasses[size];

  return (
    <div className="flex flex-col items-center">
      {/* Badge Icon */}
      <div 
        className={`relative ${sizeClass} bg-gradient-to-br ${colors.bg} border-2 ${colors.border} rounded-xl flex items-center justify-center shadow-lg transition-transform hover:scale-110`}
      >
        <span>{badge.icon}</span>
        
        {/* Legendary glow effect */}
        {badge.rarity === 'legendary' && (
          <div className="absolute inset-0 bg-gradient-to-br from-amber-400/30 to-orange-500/30 rounded-xl animate-pulse" />
        )}
        
        {/* Epic shimmer effect */}
        {badge.rarity === 'epic' && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-xl animate-shimmer" />
        )}
      </div>

      {showDetails && (
        <>
          {/* Badge Name */}
          <h4 className={`mt-2 font-bold text-sm ${colors.text}`}>
            {badge.name}
          </h4>

          {/* Rarity Label */}
          <span className={`text-xs ${colors.text} opacity-70`}>
            {rarityLabels[badge.rarity]}
          </span>
        </>
      )}
    </div>
  );
}

// Badge Grid Component
export function BadgeGrid({ badges, maxDisplay = 6 }: { badges: Badge[]; maxDisplay?: number }) {
  const displayBadges = badges.slice(0, maxDisplay);
  const remaining = badges.length - maxDisplay;

  return (
    <div className="flex flex-wrap gap-2">
      {displayBadges.map(badge => (
        <BadgeDisplay 
          key={badge.id} 
          badge={badge} 
          size="sm" 
          showDetails={false} 
        />
      ))}
      {remaining > 0 && (
        <div className="w-10 h-10 bg-slate-800 border border-slate-700 rounded-xl flex items-center justify-center text-sm text-slate-400">
          +{remaining}
        </div>
      )}
    </div>
  );
}

// Badge Tooltip Component
export function BadgeWithTooltip({ badge }: { badge: Badge }) {
  return (
    <div className="group relative inline-block">
      <BadgeDisplay badge={badge} size="sm" showDetails={false} />
      
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-slate-900 border border-slate-700 rounded-lg p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 shadow-xl">
        <h5 className="font-bold text-white text-sm">{badge.name}</h5>
        <p className="text-xs text-slate-400 mt-1">{badge.description}</p>
        {badge.unlockedAt && (
          <p className="text-xs text-slate-500 mt-2">
            Kazanıldı: {new Date(badge.unlockedAt).toLocaleDateString('tr-TR')}
          </p>
        )}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-slate-900 border-r border-b border-slate-700" />
      </div>
    </div>
  );
}

```

## File: app\components\BracketView.tsx
```
"use client";

import TeamAvatar from "./TeamAvatar";

interface BracketTeam {
    name: string;
    sourceGroup: string;
    position: number;
    eliminated?: boolean;
}

interface BracketMatch {
    team1: BracketTeam | null;
    team2: BracketTeam | null;
    winner?: 1 | 2;
}

interface BracketViewProps {
    quarterGroups: { name: string; teams: { name: string; sourceGroup: string; position: string }[] }[];
    semiGroups: { name: string; teams: { name: string; sourceGroup: string; position: string }[] }[];
    finalGroups: { name: string; teams: { name: string; sourceGroup: string; position: string }[] }[];
}

interface GroupTeam {
    name: string;
    sourceGroup: string;
    position: string;
}

interface GroupData {
    name: string;
    teams: GroupTeam[];
}

export default function BracketView({ quarterGroups, semiGroups, finalGroups }: BracketViewProps) {
    const getWinners = (groups: GroupData[]) => {
        return groups.map(g => ({
            name: g.name,
            first: g.teams[0],
            second: g.teams[1]
        }));
    };

    const quarterWinners = getWinners(quarterGroups);
    const semiWinners = getWinners(semiGroups);
    const finalWinners = getWinners(finalGroups);

    return (
        <div className="overflow-x-auto pb-4">
            <div className="min-w-[800px] flex items-center gap-4 p-4">

                {/* Quarter Finals */}
                <div className="flex flex-col gap-4">
                    <h3 className="text-xs font-bold text-amber-400 text-center mb-2">ÇEYREK FİNAL</h3>
                    {quarterWinners.slice(0, 4).map((group, idx) => (
                        <BracketCard
                            key={group.name}
                            groupName={`Grup ${group.name}`}
                            team1={group.first?.name || '?'}
                            team2={group.second?.name || '?'}
                            color="amber"
                        />
                    ))}
                </div>

                {/* Connector Lines 1 */}
                <div className="flex flex-col gap-4 items-center self-stretch justify-around py-16">
                    <ConnectorLine />
                    <ConnectorLine />
                </div>

                {/* Semi Finals Left */}
                <div className="flex flex-col gap-4 self-center">
                    <h3 className="text-xs font-bold text-blue-400 text-center mb-2">YARI FİNAL</h3>
                    {semiWinners.slice(0, 2).map((group) => (
                        <BracketCard
                            key={group.name}
                            groupName={`Grup ${group.name}`}
                            team1={group.first?.name || '?'}
                            team2={group.second?.name || '?'}
                            color="blue"
                        />
                    ))}
                </div>

                {/* Connector Lines 2 */}
                <div className="flex flex-col gap-4 items-center self-center">
                    <ConnectorLine />
                </div>

                {/* Final */}
                <div className="flex flex-col gap-4 self-center">
                    <h3 className="text-xs font-bold text-emerald-400 text-center mb-2">FİNAL</h3>
                    {finalWinners.map((group) => (
                        <BracketCard
                            key={group.name}
                            groupName={`Grup ${group.name}`}
                            team1={group.first?.name || '?'}
                            team2={group.second?.name || '?'}
                            color="emerald"
                            isChampion
                        />
                    ))}
                </div>

                {/* Right Side Mirror */}
                <div className="flex flex-col gap-4 items-center self-center">
                    <ConnectorLine />
                </div>

                <div className="flex flex-col gap-4 self-center">
                    <h3 className="text-xs font-bold text-blue-400 text-center mb-2 opacity-0">.</h3>
                    {semiWinners.slice(2, 4).map((group) => (
                        <BracketCard
                            key={group.name}
                            groupName={`Grup ${group.name}`}
                            team1={group.first?.name || '?'}
                            team2={group.second?.name || '?'}
                            color="blue"
                        />
                    ))}
                </div>

                <div className="flex flex-col gap-4 items-center self-stretch justify-around py-16">
                    <ConnectorLine />
                    <ConnectorLine />
                </div>

                <div className="flex flex-col gap-4">
                    <h3 className="text-xs font-bold text-amber-400 text-center mb-2 opacity-0">.</h3>
                    {quarterWinners.slice(4, 8).map((group) => (
                        <BracketCard
                            key={group.name}
                            groupName={`Grup ${group.name}`}
                            team1={group.first?.name || '?'}
                            team2={group.second?.name || '?'}
                            color="amber"
                        />
                    ))}
                </div>
            </div>

            {/* Legend */}
            <div className="flex justify-center gap-6 mt-4 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-amber-600"></span> Çeyrek Final
                </span>
                <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-blue-600"></span> Yarı Final
                </span>
                <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-emerald-700"></span> Final
                </span>
            </div>
        </div>
    );
}

function BracketCard({
    groupName,
    team1,
    team2,
    color = 'slate',
    isChampion = false
}: {
    groupName: string;
    team1: string;
    team2: string;
    color?: 'amber' | 'blue' | 'emerald' | 'slate';
    isChampion?: boolean;
}) {
    const colors = {
        amber: 'border-amber-600 bg-amber-950/30',
        blue: 'border-blue-600 bg-blue-950/30',
        emerald: 'border-emerald-600 bg-emerald-950/30',
        slate: 'border-slate-700 bg-slate-900'
    };

    return (
        <div className={`rounded-lg border-2 ${colors[color]} p-2 w-40 transition-all hover:scale-105 ${isChampion ? 'glow-emerald' : ''}`}>
            <div className="text-[10px] text-center opacity-50 mb-1">{groupName}</div>
            <div className="space-y-1">
                <TeamSlot name={team1} isWinner />
                <TeamSlot name={team2} />
            </div>
        </div>
    );
}

function TeamSlot({ name, isWinner = false }: { name: string; isWinner?: boolean }) {
    return (
        <div className={`text-xs px-2 py-1 rounded truncate flex items-center gap-2 ${isWinner
            ? 'bg-emerald-900/50 text-emerald-300 border border-emerald-700'
            : 'bg-slate-800/50 text-slate-400'
            }`}>
            <TeamAvatar name={name} size="sm" />
            <span className="truncate">{name}</span>
        </div>
    );
}

function ConnectorLine() {
    return (
        <div className="w-8 h-px bg-gradient-to-r from-slate-600 to-slate-700"></div>
    );
}

```

## File: app\components\Confetti.tsx
```
"use client";

import { useEffect, useState } from 'react';

interface ConfettiProps {
    trigger: boolean;
    onComplete?: () => void;
}

export default function Confetti({ trigger, onComplete }: ConfettiProps) {
    const [particles, setParticles] = useState<Array<{
        id: number;
        x: number;
        color: string;
        delay: number;
        size: number;
    }>>([]);

    useEffect(() => {
        if (trigger) {
            const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
            const newParticles = Array.from({ length: 50 }, (_, i) => ({
                id: i,
                x: Math.random() * 100,
                color: colors[Math.floor(Math.random() * colors.length)],
                delay: Math.random() * 0.5,
                size: Math.random() * 8 + 4
            }));
            setParticles(newParticles);

            const timer = setTimeout(() => {
                setParticles([]);
                onComplete?.();
            }, 2000);

            return () => clearTimeout(timer);
        }
    }, [trigger, onComplete]);

    if (particles.length === 0) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {particles.map(p => (
                <div
                    key={p.id}
                    className="absolute animate-confetti"
                    // eslint-disable-next-line react-dom/no-unsafe-target-blank
                    style={{
                        left: `${p.x}%`,
                        top: '-20px',
                        width: p.size,
                        height: p.size,
                        backgroundColor: p.color,
                        borderRadius: Math.random() > 0.5 ? '50%' : '0',
                        animationDelay: `${p.delay}s`,
                        animationDuration: `${1 + Math.random()}s`
                    }}
                />
            ))}
        </div>
    );
}

```

## File: app\components\ErrorBoundary.tsx
```
"use client";

import React, { Component, ReactNode, ErrorInfo } from 'react';

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.props.onError?.(error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-[200px] flex flex-col items-center justify-center p-6 bg-slate-900/50 rounded-xl border border-red-500/30">
                    <div className="text-4xl mb-4">😔</div>
                    <h3 className="text-lg font-bold text-white mb-2">Bir şeyler yanlış gitti</h3>
                    <p className="text-sm text-slate-400 text-center mb-4 max-w-md">
                        Beklenmeyen bir hata oluştu. Sayfayı yenileyerek tekrar deneyebilirsiniz.
                    </p>
                    {process.env.NODE_ENV === 'development' && this.state.error && (
                        <details className="w-full max-w-md">
                            <summary className="text-xs text-red-400 cursor-pointer hover:text-red-300">
                                Hata Detayları (Geliştirici)
                            </summary>
                            <pre className="mt-2 p-3 bg-red-900/20 rounded-lg text-xs text-red-300 overflow-auto max-h-32">
                                {this.state.error.message}
                                {'\n\n'}
                                {this.state.error.stack}
                            </pre>
                        </details>
                    )}
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-bold rounded-lg transition-colors"
                    >
                        Sayfayı Yenile
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

// Functional wrapper for easier use
export function withErrorBoundary<P extends object>(
    WrappedComponent: React.ComponentType<P>,
    fallback?: ReactNode
) {
    return function WithErrorBoundaryWrapper(props: P) {
        return (
            <ErrorBoundary fallback={fallback}>
                <WrappedComponent {...props} />
            </ErrorBoundary>
        );
    };
}

export default ErrorBoundary;

```

## File: app\components\ErrorFallback.tsx
```
"use client";

import { ReactNode } from "react";

interface ErrorFallbackProps {
    error: string;
    onRetry?: () => void;
    className?: string;
}

/**
 * Reusable error fallback component with retry button.
 */
export default function ErrorFallback({ error, onRetry, className = "" }: ErrorFallbackProps) {
    return (
        <div className={`flex flex-col items-center justify-center p-8 bg-slate-900/50 rounded-xl border border-rose-900/30 ${className}`}>
            <div className="text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-rose-400 mb-2">Bir Hata Oluştu</h3>
            <p className="text-sm text-slate-400 text-center mb-4 max-w-md">{error}</p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="flex items-center gap-2 px-4 py-2 bg-rose-700 hover:bg-rose-600 text-white text-sm font-medium rounded-lg transition-all"
                >
                    <span>🔄</span>
                    <span>Tekrar Dene</span>
                </button>
            )}
        </div>
    );
}

interface DataLoaderProps<T> {
    data: T | null;
    error: string | null;
    loading: boolean;
    onRetry?: () => void;
    loadingFallback?: ReactNode;
    errorFallback?: ReactNode;
    children: (data: T) => ReactNode;
}

/**
 * Generic data loader component that handles loading, error, and success states.
 * 
 * @example
 * <DataLoader data={teams} error={error} loading={loading} onRetry={retry}>
 *   {(teams) => <TeamList teams={teams} />}
 * </DataLoader>
 */
export function DataLoader<T>({
    data,
    error,
    loading,
    onRetry,
    loadingFallback,
    errorFallback,
    children
}: DataLoaderProps<T>) {
    if (loading) {
        return loadingFallback || (
            <div className="flex items-center justify-center p-8">
                <div className="w-8 h-8 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error) {
        return errorFallback || <ErrorFallback error={error} onRetry={onRetry} />;
    }

    if (!data) {
        return null;
    }

    return <>{children(data)}</>;
}

```

## File: app\components\index.ts
```
// Re-export all components for easy importing
export { default as BracketView } from './BracketView';
export { default as Confetti } from './Confetti';
export { default as ProgressRing } from './ProgressRing';
export { default as TeamCompareModal } from './TeamCompareModal';
export { default as MiniBarChart } from './MiniBarChart';
export { default as TeamAvatar } from './TeamAvatar';
export { default as Tooltip } from './Tooltip';
export { default as StatsCard } from './StatsCard';
export { default as ShareButton } from './ShareButton';
export { default as ErrorFallback, DataLoader } from './ErrorFallback';
export { default as XPBar } from './XPBar';
export { default as TeamLoyaltySelector } from './TeamLoyaltySelector';
export { default as QuestPanel } from './QuestPanel';
export { AchievementToast, AchievementsPanel } from './Achievements';
export { ToastProvider, useToast } from './Toast';

// New components
export { default as ErrorBoundary, withErrorBoundary } from './ErrorBoundary';
export * from './Skeleton';
export * from './LeagueTemplate';

```

## File: app\components\LanguageSwitcher.tsx
```
'use client';

import { useLocale } from '@/app/context/LocaleContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Globe className="h-4 w-4" />
          <span className="sr-only">Dil değiştir</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => setLocale('tr')}
          className={locale === 'tr' ? 'bg-accent' : ''}
        >
          🇹🇷 Türkçe
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setLocale('en')}
          className={locale === 'en' ? 'bg-accent' : ''}
        >
          🇬🇧 English
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

```

## File: app\components\LiveMatchCard.tsx
```
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

```

## File: app\components\LoginBackground.tsx
```
import { memo } from 'react';

const LoginBackground = memo(function LoginBackground() {
    return (
        <>
            {/* Background with Modern Gradient & Pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0a1a] to-black -z-20"></div>
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20 -z-10"></div>

            {/* Ambient Light Effects */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-[128px] -z-10"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-[128px] -z-10"></div>
        </>
    );
});

export default LoginBackground;

```

## File: app\components\Logo.tsx
```
export default function Logo({ className = "", size = "md" }: { className?: string; size?: "sm" | "md" | "lg" | "xl" }) {
    const sizeClasses = {
        sm: "w-9 h-8 text-sm",
        md: "w-12 h-10 text-base",
        lg: "w-20 h-16 text-2xl",
        xl: "w-40 h-32 text-5xl"
    };

    return (
        <div className={`relative flex items-center justify-center bg-slate-900 rounded-xl overflow-hidden border border-white/10 shadow-[0_0_15px_rgba(16,185,129,0.3)] ${sizeClasses[size]} ${className}`}>
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-indigo-500/20"></div>

            {/* Shiny Reflection */}
            <div className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-gradient-to-br from-transparent via-white/10 to-transparent rotate-45 animate-pulse"></div>

            {/* Letters */}
            <div className="relative z-10 font-black italic leading-none flex items-center justify-center pl-1 pr-2">
                <span className="bg-clip-text text-transparent bg-gradient-to-br from-emerald-400 to-cyan-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                    VS
                </span>
            </div>
        </div>
    );
}


```

## File: app\components\MiniBarChart.tsx
```
"use client";

interface MiniBarChartProps {
    data: number[];
    labels?: string[];
    height?: number;
    color?: string;
    showValues?: boolean;
}

export default function MiniBarChart({
    data,
    labels,
    height = 40,
    color = '#10b981',
    showValues = false
}: MiniBarChartProps) {
    const max = Math.max(...data, 1);
    const barWidth = 100 / data.length;

    return (
        // eslint-disable-next-line react-dom/no-unsafe-target-blank
        <div className="w-full" style={{ height }}>
            <div className="flex items-end justify-between h-full gap-0.5">
                {data.map((value, i) => (
                    <div
                        key={i}
                        className="flex-1 flex flex-col items-center justify-end"
                        title={labels?.[i] ? `${labels[i]}: ${value}` : `${value}`}
                    >
                        {showValues && (
                            <span className="text-[8px] text-slate-400 mb-0.5">{value}</span>
                        )}
                        <div
                            className="w-full rounded-t transition-all duration-300 hover:opacity-80"
                            // eslint-disable-next-line react-dom/no-unsafe-target-blank
                            style={{
                                height: `${(value / max) * 100}%`,
                                backgroundColor: color,
                                minHeight: value > 0 ? '2px' : '0'
                            }}
                        />
                    </div>
                ))}
            </div>
            {labels && (
                <div className="flex justify-between mt-1">
                    {labels.map((label, i) => (
                        <span key={i} className="text-[8px] text-slate-500 flex-1 text-center truncate">
                            {label}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}

```

## File: app\components\Navbar.tsx
```
"use client";

import Link from "next/link";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useGameState, getLevelTitle, getXPForNextLevel } from "../utils/gameState";
import { useAuth } from "../context/AuthContext";
import { LEVEL_THRESHOLDS } from "../types";
import NotificationBell from "./NotificationBell";
import { StreakBadge } from "./StreakWidget";
import { LiveMatchCounter } from "./LiveMatchCard";


export default function Navbar() {
    const pathname = usePathname();
    const { gameState } = useGameState();
    const { user, loading, signOut } = useAuth();
    const [showLeagueModal, setShowLeagueModal] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    // Track scroll position for navbar background
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Calculate XP progress
    const currentLevelXP = LEVEL_THRESHOLDS[gameState.level - 1] || 0;
    const nextLevelXP = getXPForNextLevel(gameState.level);
    const progress = gameState.xp - currentLevelXP;
    const required = nextLevelXP - currentLevelXP;
    const xpProgress = Math.min((progress / required) * 100, 100);

    const isInLeague = pathname?.startsWith('/1lig') || pathname?.startsWith('/2lig') || pathname?.startsWith('/vsl') || pathname?.startsWith('/cev-cl') || pathname?.startsWith('/cev-cup') || pathname?.startsWith('/cev-challenge');
    const isAnasayfa = pathname === '/' || pathname === '/anasayfa';
    const isAyarlar = pathname === '/ayarlar';
    const isProfile = pathname === '/profile' || pathname === '/login' || pathname === '/register';

    // Generate league URL preserving current page path
    const getLeagueUrl = (targetLeague: string) => {
        if (!pathname) return `/${targetLeague}/tahminoyunu`;

        const pathParts = pathname.split('/');
        if (pathParts[1] === '1lig' || pathParts[1] === '2lig') {
            pathParts[1] = targetLeague;
            return pathParts.join('/');
        }
        return `/${targetLeague}/tahminoyunu`;
    };

    // Get user display name
    const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Oyuncu';

    return (
        <>
            {/* Top Header */}
            <nav className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b h-14 transition-all duration-300 ${scrolled
                ? 'bg-slate-900/95 border-slate-700 shadow-lg'
                : 'bg-slate-900/80 border-slate-800'
                }`}>
                <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between gap-4">
                    {/* Brand & Context Navigation */}
                    <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
                        <Link href="/" className="flex items-center gap-2 group shrink-0" prefetch={true}>
                            <Logo size="md" className="group-hover:scale-110 transition-transform duration-300" />
                            <span className={`text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400 ${isInLeague ? 'hidden xl:inline' : 'hidden sm:inline'}`}>
                                VolleySimulator
                            </span>
                        </Link>

                        {/* Context Navigation (Moved from PageHeader) */}
                        {isInLeague && (
                            <div className="flex items-center gap-4">
                                {/* League Switcher */}
                                <div className="flex items-center bg-slate-800/50 rounded-lg p-1 border border-slate-700/50">
                                    <Link href={getLeagueUrl('vsl')} className={`px-2 py-1 rounded text-[10px] font-bold transition-all flex items-center gap-1.5 ${pathname?.includes('/vsl') ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}>
                                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                                        VSL
                                    </Link>
                                    <Link href={getLeagueUrl('1lig')} className={`px-2 py-1 rounded text-[10px] font-bold transition-all flex items-center gap-1.5 ${pathname?.includes('/1lig') ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}>
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                                        1.Lig
                                    </Link>
                                    <Link href={getLeagueUrl('2lig')} className={`px-2 py-1 rounded text-[10px] font-bold transition-all flex items-center gap-1.5 ${pathname?.includes('/2lig') ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}>
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                        2.Lig
                                    </Link>
                                    <Link href={getLeagueUrl('cev-cl')} className={`px-2 py-1 rounded text-[10px] font-bold transition-all flex items-center gap-1.5 ${pathname?.includes('/cev-cl') ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}>
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                        ŞL
                                    </Link>
                                    <Link href={getLeagueUrl('cev-cup')} className={`px-2 py-1 rounded text-[10px] font-bold transition-all flex items-center gap-1.5 ${pathname?.includes('/cev-cup') ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}>
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                        Cup
                                    </Link>
                                    <Link href={getLeagueUrl('cev-challenge')} className={`px-2 py-1 rounded text-[10px] font-bold transition-all flex items-center gap-1.5 ${pathname?.includes('/cev-challenge') ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}>
                                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                                        Chall
                                    </Link>
                                </div>

                                {/* Divider */}
                                <div className="w-px h-4 bg-slate-800 hidden lg:block"></div>

                                {/* Page Switcher */}
                                <div className="hidden lg:flex items-center gap-1">
                                    <Link
                                        href={pathname?.replace(/\/(gunceldurum|stats|playoffs|tahminoyunu)/, '/tahminoyunu') || '#'}
                                        className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${pathname?.includes('/tahminoyunu') ? 'bg-gradient-to-r from-slate-700 to-slate-600 text-white shadow-md border border-slate-600' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                                    >
                                        Tahmin
                                    </Link>
                                    <Link
                                        href={pathname?.replace(/\/(gunceldurum|stats|playoffs|tahminoyunu)/, '/gunceldurum') || '#'}
                                        className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${pathname?.includes('/gunceldurum') ? 'bg-gradient-to-r from-slate-700 to-slate-600 text-white shadow-md border border-slate-600' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                                    >
                                        Durum
                                    </Link>
                                    <Link
                                        href={pathname?.replace(/\/(gunceldurum|stats|playoffs|tahminoyunu)/, '/stats') || '#'}
                                        className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${pathname?.includes('/stats') ? 'bg-gradient-to-r from-slate-700 to-slate-600 text-white shadow-md border border-slate-600' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                                    >
                                        İstatistik
                                    </Link>
                                    <Link
                                        href={pathname?.replace(/\/(gunceldurum|stats|playoffs|tahminoyunu)/, '/playoffs') || '#'}
                                        className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${pathname?.includes('/playoffs') ? 'bg-gradient-to-r from-amber-600 to-orange-500 text-white shadow-md' : 'text-amber-500/80 hover:text-amber-400 hover:bg-amber-900/10'}`}
                                    >
                                        Play-Off
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right: User & Actions */}
                    <div className="flex items-center gap-2">
                        {/* Live Match Counter */}
                        <Link href="/live" className="hidden md:block">
                            <LiveMatchCounter count={2} />
                        </Link>
                        
                        {/* Streak Badge */}
                        {user && (
                            <Link href="/quests" className="hidden sm:block">
                                <StreakBadge />
                            </Link>
                        )}
                        
                        {/* Notification Bell */}
                        {user && <NotificationBell />}
                        
                        <ThemeToggle />

                        {!loading && (
                            user ? (
                                <div className="flex items-center gap-3">
                                    {/* Achievements Badge */}
                                    <div className="hidden sm:flex items-center gap-1 text-xs text-amber-400 bg-amber-500/20 px-2 py-1 rounded-full border border-amber-500/30">
                                        <span className="font-bold">{gameState.achievements.length}</span>
                                    </div>

                                    {/* Level + XP Bar */}
                                    <div className="flex items-center gap-2">
                                        <div className="hidden sm:block">
                                            <div className="w-20 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-amber-400 to-orange-400 transition-all"
                                                    // eslint-disable-next-line
                                                    style={{ width: `${xpProgress}%` }}
                                                />
                                            </div>
                                        </div>
                                        <span className="text-xs font-bold text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
                                            Lv.{gameState.level}
                                        </span>
                                    </div>

                                    {/* User Name */}
                                    <Link
                                        href="/profile"
                                        className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-sm font-medium rounded-lg transition-all"
                                        prefetch={true}
                                    >
                                        <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                            {userName[0].toUpperCase()}
                                        </div>
                                        <span className="hidden md:inline max-w-[100px] truncate">{userName}</span>
                                    </Link>

                                    {/* Logout Button */}
                                    <button
                                        onClick={() => signOut()}
                                        className="px-2 py-1.5 bg-slate-800 hover:bg-rose-900/50 border border-slate-700 hover:border-rose-600/50 text-slate-400 hover:text-rose-400 text-xs font-medium rounded-lg transition-all"
                                        title="Çıkış Yap"
                                    >
                                        Çıkış
                                    </button>
                                </div>
                            ) : (
                                <Link
                                    href="/login"
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-bold rounded-lg shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-105 active:scale-95 transition-all duration-200"
                                    prefetch={true}
                                >
                                    <span>Giriş Yap</span>
                                </Link>
                            )
                        )}
                    </div>
                </div>
            </nav>

            {/* Bottom Navigation Bar */}
            <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 h-14 shadow-[0_-4px_20px_rgba(0,0,0,0.3)]">
                <div className="max-w-lg mx-auto h-full flex items-center justify-around px-2">
                    {/* Anasayfa */}
                    <Link
                        href={user ? "/anasayfa" : "/"}
                        className={`relative flex flex-col items-center gap-0.5 px-5 py-2 rounded-xl transition-all duration-200 active:scale-95 ${isAnasayfa
                            ? 'text-emerald-400'
                            : 'text-slate-400 hover:text-white'
                            }`}
                        prefetch={true}
                    >
                        {isAnasayfa && (
                            <div className="absolute inset-0 bg-emerald-500/15 rounded-xl border border-emerald-500/30"></div>
                        )}
                        <span className="text-xs font-bold relative z-10">Anasayfa</span>
                    </Link>



                    {/* Ligler */}
                    <Link
                        href="/ligler"
                        className={`relative flex flex-col items-center gap-0.5 px-5 py-2 rounded-xl transition-all duration-200 active:scale-95 ${isInLeague || pathname === '/ligler'
                            ? 'text-indigo-400'
                            : 'text-slate-400 hover:text-white'
                            }`}
                        prefetch={true}
                    >
                        {(isInLeague || pathname === '/ligler') && (
                            <div className="absolute inset-0 bg-indigo-500/15 rounded-xl border border-indigo-500/30"></div>
                        )}
                        <span className="text-xs font-bold relative z-10">Ligler</span>
                    </Link>

                    {/* Ayarlar */}
                    <Link
                        href="/ayarlar"
                        className={`relative flex flex-col items-center gap-0.5 px-5 py-2 rounded-xl transition-all duration-200 active:scale-95 ${isAyarlar
                            ? 'text-cyan-400'
                            : 'text-slate-400 hover:text-white'
                            }`}
                        prefetch={true}
                    >
                        {isAyarlar && (
                            <div className="absolute inset-0 bg-cyan-500/15 rounded-xl border border-cyan-500/30"></div>
                        )}
                        <span className="text-xs font-bold relative z-10">Ayarlar</span>
                    </Link>

                    {/* Profil */}
                    <Link
                        href={user ? "/profile" : "/login"}
                        className={`relative flex flex-col items-center gap-0.5 px-5 py-2 rounded-xl transition-all duration-200 active:scale-95 ${isProfile
                            ? 'text-amber-400'
                            : 'text-slate-400 hover:text-white'
                            }`}
                        prefetch={true}
                    >
                        {isProfile && (
                            <div className="absolute inset-0 bg-amber-500/15 rounded-xl border border-amber-500/30"></div>
                        )}
                        <span className="text-xs font-bold relative z-10">Profil</span>
                    </Link>
                </div>
            </nav>

            {/* League Selection Modal */}
            {showLeagueModal && (
                <div
                    className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
                    onClick={() => setShowLeagueModal(false)}
                >
                    <div
                        className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-700/50 rounded-3xl w-full max-w-md shadow-2xl shadow-black/50 animate-scale-in overflow-hidden"
                        onClick={e => e.stopPropagation()}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="league-modal-title"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-emerald-600/20 via-transparent to-amber-600/20 p-6 border-b border-slate-800">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 id="league-modal-title" className="text-xl font-bold text-white">Lig Seçin</h2>
                                    <p className="text-xs text-slate-400 mt-1">Takip etmek istediğiniz ligi seçin</p>
                                </div>
                                <button
                                    onClick={() => setShowLeagueModal(false)}
                                    className="w-8 h-8 bg-slate-800 hover:bg-slate-700 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-4 max-h-[60vh] overflow-y-auto">
                            {/* Turkey Section */}
                            <div className="mb-4">
                                <div className="flex items-center gap-2 mb-3 px-1">
                                    <span className="text-sm font-bold text-slate-300 uppercase tracking-wider">Türkiye</span>
                                    <div className="flex-1 h-px bg-gradient-to-r from-slate-700 to-transparent"></div>
                                </div>

                                <div className="space-y-2">
                                    {/* Vodafone Sultanlar Ligi */}
                                    <Link
                                        href="/vsl/tahminoyunu"
                                        onClick={() => setShowLeagueModal(false)}
                                        className="group flex items-center gap-4 p-4 bg-gradient-to-r from-red-900/30 to-red-800/10 hover:from-red-800/40 hover:to-red-700/20 rounded-2xl border border-red-600/30 hover:border-red-500/50 transition-all duration-300"
                                    >
                                        <div className="flex-1">
                                            <div className="font-bold text-white group-hover:text-red-300 transition-colors">Vodafone Sultanlar Ligi</div>
                                            <div className="text-xs text-red-400/70">Kadınlar Voleybol • 2025-26</div>
                                        </div>
                                        <div className="text-red-500/50 group-hover:text-red-400 group-hover:translate-x-1 transition-all">→</div>
                                    </Link>

                                    {/* 1. Lig */}
                                    <Link
                                        href={getLeagueUrl('1lig')}
                                        onClick={() => setShowLeagueModal(false)}
                                        className="group flex items-center gap-4 p-4 bg-gradient-to-r from-amber-900/30 to-amber-800/10 hover:from-amber-800/40 hover:to-amber-700/20 rounded-2xl border border-amber-600/30 hover:border-amber-500/50 transition-all duration-300"
                                    >
                                        <div className="flex-1">
                                            <div className="font-bold text-white group-hover:text-amber-300 transition-colors">Arabica Coffee House 1. Lig</div>
                                            <div className="text-xs text-amber-400/70">Kadınlar Voleybol • 2025-26</div>
                                        </div>
                                        <div className="text-amber-500/50 group-hover:text-amber-400 group-hover:translate-x-1 transition-all">→</div>
                                    </Link>

                                    {/* 2. Lig */}
                                    <Link
                                        href={getLeagueUrl('2lig')}
                                        onClick={() => setShowLeagueModal(false)}
                                        className="group flex items-center gap-4 p-4 bg-gradient-to-r from-emerald-900/30 to-emerald-800/10 hover:from-emerald-800/40 hover:to-emerald-700/20 rounded-2xl border border-emerald-600/30 hover:border-emerald-500/50 transition-all duration-300"
                                    >
                                        <div className="flex-1">
                                            <div className="font-bold text-white group-hover:text-emerald-300 transition-colors">Kadınlar 2. Lig</div>
                                            <div className="text-xs text-emerald-400/70">Kadınlar Voleybol • 2025-26</div>
                                        </div>
                                        <div className="text-emerald-500/50 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all">→</div>
                                    </Link>
                                </div>
                            </div>

                            {/* Europe Section */}
                            <div className="mt-6 pt-4 border-t border-slate-800">
                                <div className="flex items-center gap-2 mb-3 px-1">
                                    <span className="text-sm font-bold text-slate-300 uppercase tracking-wider">Avrupa</span>
                                    <div className="flex-1 h-px bg-gradient-to-r from-slate-700 to-transparent"></div>
                                </div>

                                <div className="space-y-2">
                                    {/* CEV Champions League */}
                                    <Link
                                        href="/cev-cl/anasayfa"
                                        onClick={() => setShowLeagueModal(false)}
                                        className="group flex items-center gap-4 p-4 bg-gradient-to-r from-blue-900/30 to-indigo-800/10 hover:from-blue-800/40 hover:to-indigo-700/20 rounded-2xl border border-blue-600/30 hover:border-blue-500/50 transition-all duration-300"
                                    >
                                        <div className="flex-1">
                                            <div className="font-bold text-white group-hover:text-blue-300 transition-colors">CEV Şampiyonlar Ligi</div>
                                            <div className="text-xs text-blue-400/70">Kadınlar • Grup Aşaması 2025-26</div>
                                        </div>
                                        <div className="text-blue-500/50 group-hover:text-blue-400 group-hover:translate-x-1 transition-all">→</div>
                                    </Link>

                                    {/* CEV Cup */}
                                    <Link
                                        href="/cev-cup/gunceldurum"
                                        onClick={() => setShowLeagueModal(false)}
                                        className="group flex items-center gap-4 p-4 bg-gradient-to-r from-amber-900/30 to-orange-800/10 hover:from-amber-800/40 hover:to-orange-700/20 rounded-2xl border border-amber-600/30 hover:border-amber-500/50 transition-all duration-300"
                                    >
                                        <div className="flex-1">
                                            <div className="font-bold text-white group-hover:text-amber-300 transition-colors">CEV Cup</div>
                                            <div className="text-xs text-amber-400/70">Kadınlar • Eleme Aşaması 2025-26</div>
                                        </div>
                                        <div className="text-amber-500/50 group-hover:text-amber-400 group-hover:translate-x-1 transition-all">→</div>
                                    </Link>

                                    {/* CEV Challenge Cup */}
                                    <Link
                                        href="/cev-challenge/gunceldurum"
                                        onClick={() => setShowLeagueModal(false)}
                                        className="group flex items-center gap-4 p-4 bg-gradient-to-r from-purple-900/30 to-violet-800/10 hover:from-purple-800/40 hover:to-violet-700/20 rounded-2xl border border-purple-600/30 hover:border-purple-500/50 transition-all duration-300"
                                    >
                                        <div className="flex-1">
                                            <div className="font-bold text-white group-hover:text-purple-300 transition-colors">CEV Challenge Cup</div>
                                            <div className="text-xs text-purple-400/70">Kadınlar • 2025-26</div>
                                        </div>
                                        <div className="text-purple-500/50 group-hover:text-purple-400 group-hover:translate-x-1 transition-all">→</div>
                                    </Link>
                                </div>
                            </div>

                            {/* Coming Soon Section */}
                            <div className="mt-6 pt-4 border-t border-slate-800">
                                <div className="flex items-center gap-2 mb-3 px-1">
                                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Yakında Eklenecek</span>
                                </div>

                                <div className="grid grid-cols-3 gap-2">
                                    <div className="flex flex-col items-center gap-1 p-3 bg-slate-800/30 rounded-xl opacity-50">
                                        <span className="text-[10px] text-slate-500">İtalya</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-1 p-3 bg-slate-800/30 rounded-xl opacity-50">
                                        <span className="text-[10px] text-slate-500">Polonya</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-1 p-3 bg-slate-800/30 rounded-xl opacity-50">
                                        <span className="text-[10px] text-slate-500">Brezilya</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
                            <p className="text-center text-xs text-slate-500">
                                Daha fazla lig için takipte kalın!
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes slide-up {
                    from {
                        transform: translateY(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }
                .animate-slide-up {
                    animation: slide-up 0.3s ease-out forwards;
                }
                @keyframes scale-in {
                    from {
                        transform: scale(0.9);
                        opacity: 0;
                    }
                    to {
                        transform: scale(1);
                        opacity: 1;
                    }
                }
                .animate-scale-in {
                    animation: scale-in 0.25s ease-out forwards;
                }
            `}</style>
        </>
    );
}

```

## File: app\components\NotificationBell.tsx
```
"use client";

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useNotifications } from '../context/NotificationsContext';
import { Notification, NotificationType } from '../types';

export default function NotificationBell() {
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const recentNotifications = notifications.slice(0, 5);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-400 hover:text-white transition-colors"
        aria-label={`Bildirimler ${unreadCount > 0 ? `(${unreadCount} okunmamış)` : ''}`}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-6 w-6" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
          />
        </svg>
        
        {/* Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden z-50">
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-white">Bildirimler</h3>
            {unreadCount > 0 && (
              <span className="text-xs text-cyan-400">{unreadCount} yeni</span>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-80 overflow-y-auto">
            {recentNotifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-slate-500">
                <span className="text-3xl block mb-2">🔔</span>
                Bildirim yok
              </div>
            ) : (
              recentNotifications.map(notification => (
                <NotificationItem 
                  key={notification.id} 
                  notification={notification}
                  onRead={() => markAsRead(notification.id)}
                  onClose={() => setIsOpen(false)}
                />
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-slate-800">
            <Link 
              href="/notifications"
              onClick={() => setIsOpen(false)}
              className="block text-center text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              Tümünü Gör →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function NotificationItem({ 
  notification, 
  onRead,
  onClose 
}: { 
  notification: Notification;
  onRead: () => void;
  onClose: () => void;
}) {
  const icon = getNotificationIcon(notification.type);
  
  const handleClick = () => {
    if (!notification.isRead) {
      onRead();
    }
    onClose();
  };

  return (
    <Link
      href={notification.link || '/notifications'}
      onClick={handleClick}
      className={`block px-4 py-3 hover:bg-slate-800/50 transition-colors ${
        !notification.isRead ? 'bg-cyan-500/5' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="text-xl">{icon}</span>
        <div className="flex-1 min-w-0">
          <p className={`text-sm ${notification.isRead ? 'text-slate-400' : 'text-white font-medium'}`}>
            {notification.title}
          </p>
          <p className="text-xs text-slate-500 mt-0.5 truncate">
            {notification.message}
          </p>
          <p className="text-xs text-slate-600 mt-1">
            {formatTimeAgo(notification.createdAt)}
          </p>
        </div>
        {!notification.isRead && (
          <span className="w-2 h-2 bg-cyan-400 rounded-full flex-shrink-0 mt-2" />
        )}
      </div>
    </Link>
  );
}

function getNotificationIcon(type: NotificationType): string {
  switch (type) {
    case 'match_reminder': return '⏰';
    case 'match_result': return '⚽';
    case 'prediction_result': return '🎯';
    case 'friend_request': return '👥';
    case 'friend_activity': return '📊';
    case 'achievement': return '🏆';
    case 'level_up': return '⬆️';
    case 'leaderboard_change': return '📈';
    case 'daily_quest': return '📋';
    case 'weekly_challenge': return '🏅';
    case 'system': return '📢';
    default: return '🔔';
  }
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return 'Az önce';
  if (minutes < 60) return `${minutes} dk önce`;
  if (hours < 24) return `${hours} saat önce`;
  if (days < 7) return `${days} gün önce`;
  
  return date.toLocaleDateString('tr-TR');
}

```

## File: app\components\NotificationToggle.tsx
```
'use client';

import { usePushNotifications } from '@/app/hooks/usePushNotifications';

interface NotificationToggleProps {
  className?: string;
}

export function NotificationToggle({ className = '' }: NotificationToggleProps) {
  const { isSupported, isSubscribed, isLoading, error, subscribe, unsubscribe } = usePushNotifications();

  if (!isSupported) {
    return (
      <div className={`text-slate-500 text-sm ${className}`}>
        Tarayıcınız bildirimleri desteklemiyor
      </div>
    );
  }

  const handleToggle = async () => {
    if (isSubscribed) {
      await unsubscribe();
    } else {
      await subscribe();
    }
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-white font-medium">Maç Bildirimleri</h3>
          <p className="text-sm text-slate-400">
            Maçlar başlamadan önce hatırlatma al
          </p>
        </div>
        <button
          onClick={handleToggle}
          disabled={isLoading}
          aria-label={isSubscribed ? 'Bildirimleri kapat' : 'Bildirimleri aç'}
          role="switch"
          aria-checked={isSubscribed ? 'true' : 'false'}
          className={`relative w-14 h-8 rounded-full transition-colors ${
            isSubscribed ? 'bg-emerald-600' : 'bg-slate-700'
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <span
            className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-transform ${
              isSubscribed ? 'left-7' : 'left-1'
            }`}
          />
        </button>
      </div>
      
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
      
      {isSubscribed && (
        <p className="text-sm text-emerald-400">
          ✓ Bildirimler aktif
        </p>
      )}
    </div>
  );
}

```

## File: app\components\OptimizedImage.tsx
```
'use client';

import Image, { ImageProps } from 'next/image';
import { useState, memo } from 'react';

interface OptimizedImageProps extends Omit<ImageProps, 'onError'> {
  fallbackSrc?: string;
  fallbackText?: string;
}

/**
 * Optimized Image component with:
 * - Blur placeholder
 * - Error fallback
 * - Lazy loading by default
 * - Proper sizing
 */
function OptimizedImageComponent({
  src,
  alt,
  fallbackSrc,
  fallbackText,
  className = '',
  ...props
}: OptimizedImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  if (hasError) {
    if (fallbackSrc) {
      return (
        <Image
          src={fallbackSrc}
          alt={alt}
          className={className}
          {...props}
        />
      );
    }
    
    if (fallbackText) {
      return (
        <div 
          className={`flex items-center justify-center bg-slate-800 text-white font-bold ${className}`}
          style={{ width: props.width, height: props.height }}
        >
          {fallbackText}
        </div>
      );
    }

    return null;
  }

  return (
    <Image
      src={src}
      alt={alt}
      className={`${className} ${!isLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
      onError={() => setHasError(true)}
      onLoad={() => setIsLoaded(true)}
      placeholder="blur"
      blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjMWUyOTNiIi8+PC9zdmc+"
      loading="lazy"
      {...props}
    />
  );
}

export const OptimizedImage = memo(OptimizedImageComponent);

```

## File: app\components\ProgressRing.tsx
```
"use client";

interface ProgressRingProps {
    progress: number; // 0-100
    size?: number;
    strokeWidth?: number;
    color?: string;
    bgColor?: string;
    showValue?: boolean;
    label?: string;
}

export default function ProgressRing({
    progress,
    size = 80,
    strokeWidth = 6,
    color = '#10b981',
    bgColor = '#1e293b',
    showValue = true,
    label
}: ProgressRingProps) {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <div className="relative inline-flex items-center justify-center">
            <svg width={size} height={size} className="-rotate-90">
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={bgColor}
                    strokeWidth={strokeWidth}
                />
                {/* Progress circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className="transition-all duration-500 ease-out"
                />
            </svg>
            {showValue && (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-lg font-bold text-white">{Math.round(progress)}%</span>
                    {label && <span className="text-[10px] text-slate-400">{label}</span>}
                </div>
            )}
        </div>
    );
}

```

## File: app\components\QuestPanel.tsx
```
"use client";

import { useState, useEffect, useMemo } from "react";
import { Quest, QuestId } from "../types";
import { useGameState } from "../utils/gameState";

// Quest definitions
const DAILY_QUESTS: Record<QuestId, Omit<Quest, 'progress' | 'expiresAt' | 'completed'>> = {
    daily_3_predictions: {
        id: 'daily_3_predictions',
        name: 'Günün Tahminleri',
        description: 'Bugün 3 maç tahmini yap',
        icon: '🎯',
        target: 3,
        xpReward: 50
    },
    daily_underdog: {
        id: 'daily_underdog',
        name: 'Cesur Tahmin',
        description: 'Alt sıradaki takımın kazanacağını tahmin et',
        icon: '🦸',
        target: 1,
        xpReward: 30
    },
    daily_complete_group: {
        id: 'daily_complete_group',
        name: 'Grup Tamamla',
        description: 'Bir grubun tüm maçlarını tahmin et',
        icon: '✅',
        target: 1,
        xpReward: 100
    }
};

interface QuestPanelProps {
    dailyPredictions?: number;
    underdogPredictions?: number;
    completedGroups?: number;
}

export default function QuestPanel({
    dailyPredictions = 0,
    underdogPredictions = 0,
    completedGroups = 0
}: QuestPanelProps) {
    const { addXP } = useGameState();
    const [completedQuests, setCompletedQuests] = useState<Set<QuestId>>(new Set());
    const [lastResetDate, setLastResetDate] = useState<string>('');

    // Get today's date string
    const today = new Date().toISOString().split('T')[0];

    // Reset quests at midnight
    useEffect(() => {
        const saved = localStorage.getItem('questLastReset');
        if (saved !== today) {
            setCompletedQuests(new Set());
            localStorage.setItem('questLastReset', today);
            localStorage.removeItem('completedQuests');
        } else {
            const savedCompleted = localStorage.getItem('completedQuests');
            if (savedCompleted) {
                setCompletedQuests(new Set(JSON.parse(savedCompleted)));
            }
        }
        setLastResetDate(today);
    }, [today]);

    // Build quests with current progress
    const quests = useMemo(() => {
        const questList: Quest[] = [
            {
                ...DAILY_QUESTS.daily_3_predictions,
                progress: dailyPredictions,
                expiresAt: `${today}T23:59:59`,
                completed: completedQuests.has('daily_3_predictions') || dailyPredictions >= 3
            },
            {
                ...DAILY_QUESTS.daily_underdog,
                progress: underdogPredictions,
                expiresAt: `${today}T23:59:59`,
                completed: completedQuests.has('daily_underdog') || underdogPredictions >= 1
            },
            {
                ...DAILY_QUESTS.daily_complete_group,
                progress: completedGroups,
                expiresAt: `${today}T23:59:59`,
                completed: completedQuests.has('daily_complete_group') || completedGroups >= 1
            }
        ];
        return questList;
    }, [dailyPredictions, underdogPredictions, completedGroups, today, completedQuests]);

    // Check for newly completed quests and award XP
    useEffect(() => {
        quests.forEach(quest => {
            if (quest.progress >= quest.target && !completedQuests.has(quest.id)) {
                setCompletedQuests(prev => {
                    const newSet = new Set(prev);
                    newSet.add(quest.id);
                    localStorage.setItem('completedQuests', JSON.stringify([...newSet]));
                    return newSet;
                });
                addXP(quest.xpReward);
            }
        });
    }, [quests, completedQuests, addXP]);

    const completedCount = quests.filter(q => q.completed).length;

    return (
        <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden">
            {/* Header */}
            <div className="px-3 py-2 bg-gradient-to-r from-purple-900/50 to-indigo-900/50 border-b border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-lg">📋</span>
                    <span className="text-sm font-bold text-white">Günlük Görevler</span>
                </div>
                <div className="text-xs text-purple-400 font-bold">
                    {completedCount}/{quests.length}
                </div>
            </div>

            {/* Quest List */}
            <div className="p-2 space-y-2">
                {quests.map(quest => {
                    const progressPercent = Math.min((quest.progress / quest.target) * 100, 100);

                    return (
                        <div
                            key={quest.id}
                            className={`p-2 rounded-lg border transition-all ${quest.completed
                                ? 'bg-emerald-900/20 border-emerald-600/30'
                                : 'bg-slate-800/50 border-slate-700/50'
                                }`}
                        >
                            <div className="flex items-start gap-2">
                                <span className={`text-xl ${quest.completed ? '' : 'grayscale-[50%]'}`}>
                                    {quest.icon}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xs font-bold ${quest.completed ? 'text-emerald-400' : 'text-white'
                                            }`}>
                                            {quest.name}
                                        </span>
                                        {quest.completed && (
                                            <span className="text-[10px] bg-emerald-700 text-white px-1.5 rounded">✓</span>
                                        )}
                                    </div>
                                    <div className="text-[10px] text-slate-400">{quest.description}</div>

                                    {/* Progress Bar */}
                                    <div className="mt-1.5 flex items-center gap-2">
                                        <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full transition-all duration-500 ${quest.completed
                                                    ? 'bg-emerald-500'
                                                    : 'bg-gradient-to-r from-purple-500 to-indigo-500'
                                                    }`}
                                                style={{ width: `${progressPercent}%` }}
                                            />
                                        </div>
                                        <span className="text-[10px] text-slate-500 font-mono">
                                            {quest.progress}/{quest.target}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-xs font-bold text-amber-400">
                                    +{quest.xpReward}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Reset Info */}
            <div className="px-3 py-1.5 text-[10px] text-slate-500 text-center border-t border-slate-700/50">
                Görevler gece yarısı sıfırlanır
            </div>
        </div>
    );
}

```

