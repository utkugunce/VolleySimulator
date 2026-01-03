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
