# Project Application Context - Part 9

## File: app\components\ScenarioEditor.tsx
```
import React from 'react';
import { Match } from '../types';

interface ScenarioEditorProps {
    matches: Match[]; // Upcoming matches
    overrides: Record<string, string>; // matchId ("Home-Away") -> score ("3-0")
    onUpdate: (matchId: string, score: string | null) => void;
    targetTeam: string;
}

const SCORES = ["3-0", "3-1", "3-2", "2-3", "1-3", "0-3"];

const ScenarioEditor: React.FC<ScenarioEditorProps> = ({ matches, overrides, onUpdate, targetTeam }) => {
    return (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-100 flex items-center gap-2">
                    <span>🎮</span> Senaryo Modu
                </h3>
                <span className="text-xs text-slate-500 bg-slate-950 px-2 py-1 rounded">Gelecek 4 Maç</span>
            </div>

            <div className="space-y-3">
                {matches.slice(0, 4).map(match => {
                    const matchId = `${match.homeTeam}-${match.awayTeam}`;
                    const currentScore = overrides[matchId] || "";
                    const isHome = match.homeTeam === targetTeam;
                    const opponent = isHome ? match.awayTeam : match.homeTeam;

                    return (
                        <div key={matchId} className="bg-slate-950 p-3 rounded border border-slate-800/50">
                            <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-2 text-sm text-slate-300">
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isHome ? 'bg-blue-900/30 text-blue-400' : 'bg-purple-900/30 text-purple-400'}`}>
                                        {isHome ? 'EV' : 'DEP'}
                                    </span>
                                    <span className="font-medium truncate">{opponent}</span>
                                </div>
                                {currentScore && (
                                    <button
                                        onClick={() => onUpdate(matchId, null)}
                                        className="text-[10px] text-slate-500 hover:text-white underline"
                                    >
                                        Temizle
                                    </button>
                                )}
                            </div>

                            <div className="flex gap-2">
                                {/* Win Options */}
                                <div className="flex-1 flex gap-1">
                                    {SCORES.slice(0, 3).map(score => { // 3-0, 3-1, 3-2
                                        const isSelected = currentScore === score;
                                        const [h, a] = score.split('-').map(Number);
                                        const targetWins = isHome ? h > a : a > h;
                                        const colorClass = targetWins ? 'hover:bg-emerald-900/50 hover:border-emerald-500/50' : 'hover:bg-rose-900/50 hover:border-rose-500/50';
                                        const activeClass = targetWins ? 'bg-emerald-700 border-emerald-600 text-white' : 'bg-rose-700 border-rose-600 text-white';

                                        return (
                                            <button
                                                key={score}
                                                onClick={() => onUpdate(matchId, isSelected ? null : score)}
                                                className={`flex-1 text-[10px] py-1.5 rounded border transition-all text-center ${isSelected
                                                    ? activeClass
                                                    : 'bg-slate-900 border-slate-800 text-slate-400 ' + colorClass
                                                    }`}
                                            >
                                                {score}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Lose Options */}
                                <div className="flex-1 flex gap-1">
                                    {SCORES.slice(3, 6).map(score => { // 2-3, 1-3, 0-3
                                        const isSelected = currentScore === score;
                                        const [h, a] = score.split('-').map(Number);
                                        const targetWins = isHome ? h > a : a > h;
                                        const colorClass = targetWins ? 'hover:bg-emerald-900/50 hover:border-emerald-500/50' : 'hover:bg-rose-900/50 hover:border-rose-500/50';
                                        const activeClass = targetWins ? 'bg-emerald-700 border-emerald-600 text-white' : 'bg-rose-700 border-rose-600 text-white';

                                        return (
                                            <button
                                                key={score}
                                                onClick={() => onUpdate(matchId, isSelected ? null : score)}
                                                className={`flex-1 text-[10px] py-1.5 rounded border transition-all text-center ${isSelected
                                                    ? activeClass
                                                    : 'bg-slate-900 border-slate-800 text-slate-400 ' + colorClass
                                                    }`}
                                            >
                                                {score}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            <p className="text-xs text-slate-500 italic">
                * Skorlara tıklayarak simülasyonu manipüle edebilirsiniz. Seçimi kaldırmak için tekrar tıklayın.
            </p>
        </div>
    );
};

export default ScenarioEditor;

```

## File: app\components\ScrollToTop.tsx
```
"use client";

import { useEffect, useState } from "react";

export default function ScrollToTop() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener("scroll", toggleVisibility);
        return () => window.removeEventListener("scroll", toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    if (!isVisible) return null;

    return (
        <button
            onClick={scrollToTop}
            className="fixed bottom-4 right-4 z-50 p-3 bg-amber-600 hover:bg-amber-500 text-white rounded-full shadow-lg shadow-amber-600/30 transition-all hover:scale-110 active:scale-95 animate-in fade-in slide-in-from-bottom-4 duration-300"
            aria-label="Yukarı Çık"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M5 10l7-7m0 0l7 7m-7-7v18"
                />
            </svg>
        </button>
    );
}

```

## File: app\components\SearchFilter.tsx
```
"use client";

import { useState, useEffect } from 'react';

interface SearchFilterProps {
    items: { name: string;[key: string]: any }[];
    onFilter: (filtered: any[]) => void;
    placeholder?: string;
}

export default function SearchFilter({ items, onFilter, placeholder = "Ara..." }: SearchFilterProps) {
    const [query, setQuery] = useState('');

    useEffect(() => {
        if (!query.trim()) {
            onFilter(items);
            return;
        }

        const q = query.toLowerCase();
        const filtered = items.filter(item =>
            item.name.toLowerCase().includes(q)
        );
        onFilter(filtered);
    }, [query, items, onFilter]);

    return (
        <div className="relative">
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholder}
                className="w-full px-4 py-2 pl-10 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                🔍
            </span>
            {query && (
                <button
                    onClick={() => setQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                >
                    ✕
                </button>
            )}
        </div>
    );
}

```

## File: app\components\SEOSchema.tsx
```
import Script from "next/script";

interface OrganizationSchemaProps {
    name?: string;
    url?: string;
    logo?: string;
    description?: string;
    sameAs?: string[];
}

export function OrganizationSchema({
    name = "VolleySimulator",
    url = "https://volleysimulator.com",
    logo = "https://volleysimulator.com/volley_simulator_logo.png",
    description = "Türkiye voleybol ligleri için puan durumu, maç tahminleri, playoff simülasyonu ve liderlik tablosu platformu.",
    sameAs = [],
}: OrganizationSchemaProps) {
    const schema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        name,
        url,
        logo,
        description,
        sameAs,
    };

    return (
        <Script
            id="organization-schema"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

interface WebsiteSchemaProps {
    name?: string;
    url?: string;
    description?: string;
}

export function WebsiteSchema({
    name = "VolleySimulator",
    url = "https://volleysimulator.com",
    description = "Türkiye voleybol ligleri için puan durumu, maç tahminleri, playoff simülasyonu ve liderlik tablosu.",
}: WebsiteSchemaProps) {
    const schema = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name,
        url,
        description,
        potentialAction: {
            "@type": "SearchAction",
            target: {
                "@type": "EntryPoint",
                urlTemplate: `${url}/takimlar/{search_term_string}`,
            },
            "query-input": "required name=search_term_string",
        },
    };

    return (
        <Script
            id="website-schema"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

interface SportsEventSchemaProps {
    name: string;
    startDate: string;
    location?: string;
    homeTeam: string;
    awayTeam: string;
    sport?: string;
}

export function SportsEventSchema({
    name,
    startDate,
    location = "Turkey",
    homeTeam,
    awayTeam,
    sport = "Volleyball",
}: SportsEventSchemaProps) {
    const schema = {
        "@context": "https://schema.org",
        "@type": "SportsEvent",
        name,
        startDate,
        location: {
            "@type": "Place",
            name: location,
        },
        homeTeam: {
            "@type": "SportsTeam",
            name: homeTeam,
        },
        awayTeam: {
            "@type": "SportsTeam",
            name: awayTeam,
        },
        sport,
    };

    return (
        <Script
            id={`sports-event-${homeTeam}-${awayTeam}`}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

interface BreadcrumbItem {
    name: string;
    url: string;
}

interface BreadcrumbSchemaProps {
    items: BreadcrumbItem[];
}

export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
    const schema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.name,
            item: item.url,
        })),
    };

    return (
        <Script
            id="breadcrumb-schema"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

interface SportsTeamSchemaProps {
    name: string;
    url?: string;
    logo?: string;
    sport?: string;
    league?: string;
}

export function SportsTeamSchema({
    name,
    url,
    logo,
    sport = "Volleyball",
    league,
}: SportsTeamSchemaProps) {
    const schema = {
        "@context": "https://schema.org",
        "@type": "SportsTeam",
        name,
        sport,
        ...(url && { url }),
        ...(logo && { logo }),
        ...(league && {
            memberOf: {
                "@type": "SportsOrganization",
                name: league,
            },
        }),
    };

    return (
        <Script
            id={`sports-team-${name}`}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

```

## File: app\components\ShareButton.tsx
```
"use client";

import { useCallback, useRef, useState } from "react";
import { toPng } from "html-to-image";

interface ShareButtonProps {
    targetRef: React.RefObject<HTMLElement | null>;
    championName?: string;
    className?: string;
}

export default function ShareButton({ targetRef, championName, className = "" }: ShareButtonProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleShare = useCallback(async () => {
        if (!targetRef.current) return;

        setIsLoading(true);
        try {
            // Create a wrapper with watermark
            const element = targetRef.current;

            const dataUrl = await toPng(element, {
                backgroundColor: "#0f172a",
                pixelRatio: 2,
                style: {
                    transform: "scale(1)",
                    transformOrigin: "top left",
                }
            });

            // Create canvas to add watermark
            const img = new Image();
            img.src = dataUrl;

            await new Promise((resolve) => { img.onload = resolve; });

            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height + 80; // Extra space for watermark

            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            // Fill background
            ctx.fillStyle = "#0f172a";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw the captured image
            ctx.drawImage(img, 0, 0);

            // Add watermark bar
            ctx.fillStyle = "#1e293b";
            ctx.fillRect(0, img.height, canvas.width, 80);

            // Add champion text
            ctx.fillStyle = "#fbbf24";
            ctx.font = "bold 24px system-ui, sans-serif";
            ctx.textAlign = "center";

            const text = championName
                ? `🏆 Benim Senaryoma Göre Şampiyon: ${championName}`
                : "🏐 VolleySimulator - Sezon Senaryom";
            ctx.fillText(text, canvas.width / 2, img.height + 50);

            // Convert to blob and download
            canvas.toBlob((blob) => {
                if (!blob) return;
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `senaryo-${new Date().toLocaleDateString("tr-TR")}.png`;
                a.click();
                URL.revokeObjectURL(url);
            }, "image/png");

        } catch (err) {
            console.error("Share failed:", err);
        } finally {
            setIsLoading(false);
        }
    }, [targetRef, championName]);

    return (
        <button
            onClick={handleShare}
            disabled={isLoading}
            className={`flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white text-xs font-bold rounded-lg shadow-lg shadow-amber-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-wait ${className}`}
        >
            {isLoading ? (
                <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>İndiriliyor...</span>
                </>
            ) : (
                <>
                    <span>Paylaş</span>
                </>
            )}
        </button>
    );
}

```

## File: app\components\StatsCard.tsx
```
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ArrowUp, ArrowDown, ArrowRight } from "lucide-react";

interface StatsCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon?: string;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
    color?: 'emerald' | 'blue' | 'amber' | 'rose' | 'purple';
}

export default function StatsCard({
    title,
    value,
    subtitle,
    icon,
    trend,
    trendValue,
    color = 'blue'
}: StatsCardProps) {
    const colors = {
        emerald: 'from-emerald-600 to-emerald-500',
        blue: 'from-blue-600 to-blue-500',
        amber: 'from-amber-600 to-amber-500',
        rose: 'from-rose-600 to-rose-500',
        purple: 'from-purple-600 to-purple-500'
    };

    const trendColors = {
        up: 'text-emerald-400',
        down: 'text-rose-400',
        neutral: 'text-muted-foreground'
    };

    const TrendIcon = {
        up: ArrowUp,
        down: ArrowDown,
        neutral: ArrowRight
    };

    return (
        <Card className="overflow-hidden shadow-sm hover:shadow-md transition-all group">
            <div className={`h-1 bg-gradient-to-r ${colors[color]}`} />
            <CardContent className="p-4">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-xs text-muted-foreground mb-1">{title}</p>
                        <p className="text-2xl font-bold text-foreground group-hover:scale-105 transition-transform origin-left">
                            {value}
                        </p>
                        {subtitle && (
                            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
                        )}
                    </div>
                    {icon && (
                        <span className="text-2xl opacity-50 group-hover:opacity-100 transition-opacity">
                            {icon}
                        </span>
                    )}
                </div>
                {trend && trendValue && (
                    <div className={`flex items-center gap-1 mt-2 text-xs ${trendColors[trend]}`}>
                        {(() => {
                            const Icon = TrendIcon[trend];
                            return <Icon className="h-3 w-3" />;
                        })()}
                        <span>{trendValue}</span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

```

## File: app\components\StreakWidget.tsx
```
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

```

## File: app\components\SwipeableTabs.tsx
```
"use client";

import { useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface SwipeableTabsProps {
    tabs: { id: string; label: string }[];
    activeTab: string;
    onChange: (id: string) => void;
    className?: string;
}

/**
 * Horizontal scrollable tabs for mobile-friendly group selection
 * 
 * Features:
 * - Touch-friendly (min 44px height)
 * - Auto-scrolls to keep active tab visible
 * - Single-tap selection (no dropdown needed)
 * - Active indicator animation
 */
export default function SwipeableTabs({
    tabs,
    activeTab,
    onChange,
    className = ''
}: SwipeableTabsProps) {
    const activeTabRef = useRef<HTMLButtonElement>(null);

    // Auto-scroll to active tab when it changes
    useEffect(() => {
        if (activeTabRef.current) {
            activeTabRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'center'
            });
        }
    }, [activeTab]);

    return (
        <ScrollArea className={`w-full ${className}`}>
            <div className="flex gap-2 pb-3">
                {tabs.map((tab) => {
                    const isActive = tab.id === activeTab;

                    return (
                        <Button
                            key={tab.id}
                            ref={isActive ? activeTabRef : null}
                            onClick={() => onChange(tab.id)}
                            variant={isActive ? "default" : "secondary"}
                            size="sm"
                            className={`
                                rounded-full whitespace-nowrap min-h-[44px] flex-shrink-0
                                ${isActive
                                    ? 'bg-primary text-primary-foreground shadow-lg'
                                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                                }
                            `}
                        >
                            {tab.label}
                        </Button>
                    );
                })}
            </div>
            <ScrollBar orientation="horizontal" />
        </ScrollArea>
    );
}

```

## File: app\components\TeamAvatar.tsx
```
"use client";

import Image from "next/image";
import { useState, memo, useMemo } from "react";

interface TeamAvatarProps {
    name: string;
    size?: 'xs' | 'sm' | 'md' | 'lg';
    showName?: boolean;
    position?: number;
    priority?: boolean;
}

const sizes = {
    xs: 'w-4 h-4 text-[8px]',
    sm: 'w-6 h-6 text-[10px]',
    md: 'w-8 h-8 text-xs',
    lg: 'w-12 h-12 text-sm'
} as const;

const pixelSizes = {
    xs: 16,
    sm: 24,
    md: 32,
    lg: 48
} as const;

const positionColors: Record<number, string> = {
    1: 'ring-2 ring-amber-400',
    2: 'ring-2 ring-slate-300',
    3: 'ring-2 ring-amber-700'
};

// Generate consistent color from team name - memoized outside component
const stringToColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = hash % 360;
    return `hsl(${hue}, 60%, 40%)`;
};

const getInitials = (teamName: string) => {
    const words = teamName.split(' ');
    if (words.length >= 2) {
        return words[0][0] + words[1][0];
    }
    return teamName.slice(0, 2);
};

function TeamAvatar({ name, size = 'md', showName = false, position, priority = false }: TeamAvatarProps) {
    const [hasError, setHasError] = useState(false);

    // Memoize computed values
    const backgroundColor = useMemo(() => hasError ? stringToColor(name) : undefined, [hasError, name]);
    const initials = useMemo(() => getInitials(name), [name]);
    const positionClass = position ? positionColors[position] || '' : '';

    return (
        <div className="flex items-center gap-2">
            <div
                className={`${sizes[size]} rounded-full flex items-center justify-center font-bold text-white uppercase relative overflow-hidden ${hasError ? '' : 'bg-slate-800'} ${positionClass}`}
                style={backgroundColor ? { backgroundColor } : undefined}
                title={name}
                role="img"
                aria-label={name}
            >
                {!hasError ? (
                    <Image
                        src={`/logos/${name}.png`}
                        alt={name}
                        width={pixelSizes[size]}
                        height={pixelSizes[size]}
                        className="w-full h-full object-contain p-0.5"
                        onError={() => setHasError(true)}
                        priority={priority}
                        loading={priority ? "eager" : "lazy"}
                        placeholder="blur"
                        blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjMWUyOTNiIiByeD0iMjAiLz48L3N2Zz4="
                        sizes={`${pixelSizes[size]}px`}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        {initials}
                    </div>
                )}
            </div>
            {showName && (
                <span className="text-sm text-white truncate">{name}</span>
            )}
        </div>
    );
}

export default memo(TeamAvatar);

```

## File: app\components\TeamCompareModal.tsx
```
"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface TeamCompareModalProps {
    isOpen: boolean;
    onClose: () => void;
    team1: TeamData | null;
    team2: TeamData | null;
}

interface TeamData {
    name: string;
    played: number;
    wins: number;
    points: number;
    setsWon: number;
    setsLost: number;
    elo?: number;
}

export default function TeamCompareModal({ isOpen, onClose, team1, team2 }: TeamCompareModalProps) {
    if (!team1 || !team2) return null;

    const stats: { label: string; key: keyof TeamData; icon: string; inverse?: boolean }[] = [
        { label: 'Oynanan', key: 'played', icon: '🎮' },
        { label: 'Galibiyet', key: 'wins', icon: '🏆' },
        { label: 'Puan', key: 'points', icon: '⭐' },
        { label: 'Set Kazanılan', key: 'setsWon', icon: '📊' },
        { label: 'Set Kaybedilen', key: 'setsLost', icon: '📉', inverse: true },
    ];

    const getWinner = (key: keyof TeamData, inverse = false) => {
        const v1 = team1[key] as number;
        const v2 = team2[key] as number;
        if (v1 === v2) return 0;
        if (inverse) return v1 < v2 ? 1 : 2;
        return v1 > v2 ? 1 : 2;
    };

    return (
        <Dialog open={isOpen} onOpenChange={() => onClose()}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-center">⚔️ Takım Karşılaştırması</DialogTitle>
                </DialogHeader>

                {/* Team Headers */}
                <div className="flex justify-between items-center mb-6">
                    <div className="text-center flex-1">
                        <div className="text-2xl mb-2">🔵</div>
                        <h3 className="font-bold text-foreground text-sm truncate px-2">{team1.name}</h3>
                    </div>
                    <div className="text-2xl text-muted-foreground">VS</div>
                    <div className="text-center flex-1">
                        <div className="text-2xl mb-2">🔴</div>
                        <h3 className="font-bold text-foreground text-sm truncate px-2">{team2.name}</h3>
                    </div>
                </div>

                {/* Stats Comparison */}
                <div className="space-y-3">
                    {stats.map(stat => {
                        const winner = getWinner(stat.key, stat.inverse);
                        const v1 = team1[stat.key] as number;
                        const v2 = team2[stat.key] as number;
                        const max = Math.max(v1, v2) || 1;

                        return (
                            <div key={stat.key} className="bg-muted rounded-lg p-3">
                                <div className="text-xs text-muted-foreground text-center mb-2">{stat.icon} {stat.label}</div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-sm font-bold w-8 text-right ${winner === 1 ? 'text-emerald-400' : 'text-foreground'}`}>
                                        {v1}
                                    </span>
                                    <div className="flex-1 flex gap-1 h-3">
                                        <div
                                            className={`h-full rounded-l transition-all ${winner === 1 ? 'bg-emerald-500' : 'bg-muted-foreground/30'}`}
                                            style={{ width: `${(v1 / max) * 50}%` }}
                                        />
                                        <div
                                            className={`h-full rounded-r transition-all ${winner === 2 ? 'bg-emerald-500' : 'bg-muted-foreground/30'}`}
                                            style={{ width: `${(v2 / max) * 50}%` }}
                                        />
                                    </div>
                                    <span className={`text-sm font-bold w-8 ${winner === 2 ? 'text-emerald-400' : 'text-foreground'}`}>
                                        {v2}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Close Button */}
                <Button onClick={onClose} variant="secondary" className="w-full mt-4">
                    Kapat
                </Button>
            </DialogContent>
        </Dialog>
    );
}

```

## File: app\components\TeamFormDisplay.tsx
```
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

```

## File: app\components\TeamLoyaltySelector.tsx
```
"use client";

import { useState, useEffect } from "react";
import { useGameState } from "../utils/gameState";

interface TeamLoyaltySelectorProps {
    teams: { name: string }[];
    onSelect?: (team: string | null) => void;
}

export default function TeamLoyaltySelector({ teams, onSelect }: TeamLoyaltySelectorProps) {
    const { gameState, setFavoriteTeam } = useGameState();
    const [isOpen, setIsOpen] = useState(false);

    const handleSelect = (teamName: string | null) => {
        setFavoriteTeam(teamName);
        setIsOpen(false);
        onSelect?.(teamName);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${gameState.favoriteTeam
                        ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white border-rose-500 shadow-lg shadow-rose-500/20'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white hover:bg-slate-700'
                    }`}
            >
                <span>❤️</span>
                <span className="hidden sm:inline">
                    {gameState.favoriteTeam || "Takım Seç"}
                </span>
                {gameState.favoriteTeam && (
                    <span className="bg-amber-500 text-[9px] px-1 rounded">+20% XP</span>
                )}
            </button>

            {isOpen && (
                <div className="absolute top-full mt-1 right-0 z-50 bg-slate-900 border border-slate-700 rounded-lg shadow-xl max-h-[300px] overflow-y-auto min-w-[200px]">
                    <div className="p-2 border-b border-slate-700">
                        <div className="text-xs text-slate-400 font-bold uppercase">Favori Takım</div>
                        <div className="text-[10px] text-amber-500 mt-0.5">Maçlarına +20% XP bonus!</div>
                    </div>

                    {gameState.favoriteTeam && (
                        <button
                            onClick={() => handleSelect(null)}
                            className="w-full px-3 py-2 text-left text-xs text-rose-400 hover:bg-rose-900/30 border-b border-slate-700/50"
                        >
                            ✕ Seçimi Kaldır
                        </button>
                    )}

                    <div className="py-1">
                        {teams.map(team => (
                            <button
                                key={team.name}
                                onClick={() => handleSelect(team.name)}
                                className={`w-full px-3 py-2 text-left text-xs transition-all flex items-center gap-2 ${gameState.favoriteTeam === team.name
                                        ? 'bg-rose-600/20 text-rose-400'
                                        : 'text-slate-300 hover:bg-slate-800'
                                    }`}
                            >
                                {gameState.favoriteTeam === team.name && <span>❤️</span>}
                                <span className="truncate">{team.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

```

## File: app\components\ThemeToggle.tsx
```
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
    const [theme, setTheme] = useState<'dark' | 'light'>('dark');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const saved = localStorage.getItem('theme') as 'dark' | 'light' | null;
        const initialTheme = saved || 'dark';
        setTheme(initialTheme);
        applyTheme(initialTheme);
    }, []);

    function applyTheme(newTheme: 'dark' | 'light') {
        document.documentElement.setAttribute('data-theme', newTheme);
        document.documentElement.classList.remove('dark', 'light');
        document.documentElement.classList.add(newTheme);
    }

    function toggleTheme() {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        applyTheme(newTheme);
    }

    if (!mounted) return null;

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Açık Temaya Geç' : 'Koyu Temaya Geç'}
            aria-label="Toggle theme"
            className="h-9 w-9"
        >
            {theme === 'dark' ? (
                <Sun className="h-4 w-4 text-amber-400" />
            ) : (
                <Moon className="h-4 w-4" />
            )}
        </Button>
    );
}

```

## File: app\components\ThemeWrapper.tsx
```
"use client";

import { ReactNode, useEffect, useState } from "react";
import { ThemeProvider } from "../context/ThemeContext";

export default function ThemeWrapper({ children }: { children: ReactNode }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Set initial theme from localStorage or default to dark
        const saved = localStorage.getItem("theme") || "dark";
        document.documentElement.setAttribute("data-theme", saved);
    }, []);

    // Prevent flash by rendering children immediately but theme applies after mount
    return <ThemeProvider>{children}</ThemeProvider>;
}

```

## File: app\components\Toast.tsx
```
"use client";

import { createContext, useContext, useCallback, ReactNode } from 'react';
import { toast as sonnerToast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';

interface ToastContextType {
    showToast: (message: string, type?: 'success' | 'error' | 'info' | 'undo', options?: { action?: { label: string; onClick: () => void }; duration?: number }) => void;
    showUndoToast: (message: string, onUndo: () => void, duration?: number) => void;
    removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
    const showToast = useCallback((
        message: string,
        type: 'success' | 'error' | 'info' | 'undo' = 'success',
        options?: { action?: { label: string; onClick: () => void }; duration?: number }
    ) => {
        const duration = options?.duration ?? 3000;
        const toastOptions: Parameters<typeof sonnerToast>[1] = {
            duration,
            action: options?.action ? {
                label: options.action.label,
                onClick: options.action.onClick,
            } : undefined,
        };

        switch (type) {
            case 'success':
                sonnerToast.success(message, toastOptions);
                break;
            case 'error':
                sonnerToast.error(message, toastOptions);
                break;
            case 'info':
                sonnerToast.info(message, toastOptions);
                break;
            case 'undo':
                sonnerToast(message, {
                    ...toastOptions,
                    duration: options?.duration ?? 5000,
                });
                break;
            default:
                sonnerToast(message, toastOptions);
        }
    }, []);

    const showUndoToast = useCallback((message: string, onUndo: () => void, duration: number = 5000) => {
        sonnerToast(message, {
            duration,
            action: {
                label: 'Geri Al',
                onClick: onUndo,
            },
        });
    }, []);

    const removeToast = useCallback((id: string) => {
        sonnerToast.dismiss(id);
    }, []);

    return (
        <ToastContext.Provider value={{ showToast, showUndoToast, removeToast }}>
            {children}
            <Toaster 
                position="bottom-right"
                richColors
                closeButton
                expand
            />
        </ToastContext.Provider>
    );
}

```

## File: app\components\Tooltip.tsx
```
"use client";

import { ReactNode } from 'react';
import {
    Tooltip as ShadcnTooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

interface TooltipProps {
    content: ReactNode;
    children: ReactNode;
    position?: 'top' | 'bottom' | 'left' | 'right';
    delay?: number;
}

export default function Tooltip({
    content,
    children,
    position = 'top',
    delay = 200
}: TooltipProps) {
    return (
        <TooltipProvider delayDuration={delay}>
            <ShadcnTooltip>
                <TooltipTrigger asChild>
                    <span className="inline-block">{children}</span>
                </TooltipTrigger>
                <TooltipContent side={position}>
                    {content}
                </TooltipContent>
            </ShadcnTooltip>
        </TooltipProvider>
    );
}

```

## File: app\components\TutorialModal.tsx
```
"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface TutorialStep {
    id: string;
    title: string;
    description: string;
    icon: string;
    image?: string;
    tips?: string[];
}

const TUTORIAL_STEPS: TutorialStep[] = [
    {
        id: "welcome",
        title: "VolleySimulator'a Hoş Geldiniz!",
        description: "Türkiye Kadınlar Voleybol Ligi tahmin oyununa hoş geldiniz. Bu rehber size uygulamayı nasıl kullanacağınızı gösterecek.",
        icon: "🏐",
        tips: [
            "Tahmin yaparak XP kazanın",
            "Seviye atlayarak yeni rozetler açın",
            "Arkadaşlarınızla yarışın"
        ]
    },
    {
        id: "leagues",
        title: "Lig Seçimi",
        description: "Alt menüden 'Ligler' butonuna tıklayarak takip etmek istediğiniz ligi seçin. Şu an Türkiye 1. Lig ve 2. Lig mevcuttur.",
        icon: "🇹🇷",
        tips: [
            "1. Lig: Arabica Coffee House Kadınlar Voleybol 1. Ligi",
            "2. Lig: Kadınlar 2. Lig",
            "Yakında yeni ülkeler eklenecek!"
        ]
    },
    {
        id: "predictions",
        title: "Tahmin Yapma",
        description: "Maç listesinden bir maç seçin ve tahmininizi girin. Her maç için ev sahibi ve deplasman takımının set skorunu tahmin edin.",
        icon: "🎯",
        tips: [
            "3-0, 3-1, 3-2, 2-3, 1-3, 0-3 skorlarından birini seçin",
            "Maç oynanmadan tahmin yapmalısınız",
            "Tahminlerinizi istediğiniz zaman güncelleyebilirsiniz"
        ]
    },
    {
        id: "standings",
        title: "Puan Durumu",
        description: "Sol tarafta canlı puan durumunu göreceksiniz. Tahminlerinize göre takımların sıralaması anlık olarak güncellenir.",
        icon: "📊",
        tips: [
            "Yeşil oklar yükselen takımları gösterir",
            "Kırmızı oklar düşen takımları gösterir",
            "Gruplar arasında geçiş yapabilirsiniz"
        ]
    },
    {
        id: "xp_system",
        title: "XP ve Seviye Sistemi",
        description: "Her tahmin yaptığınızda XP kazanırsınız. XP biriktirerek seviye atlarsınız ve yeni ünvanlar kazanırsınız.",
        icon: "⚡",
        tips: [
            "Tahmin başına +10 XP",
            "Doğru tahmin bonusu ek XP kazandırır",
            "Başarımlar büyük XP ödülleri verir"
        ]
    },
    {
        id: "achievements",
        title: "Başarımlar",
        description: "Özel görevleri tamamlayarak başarım rozetleri kazanın. Her başarım size ekstra XP ve özel ödüller verir.",
        icon: "🏆",
        tips: [
            "İlk tahmin: 'İlk Adım' rozeti",
            "50+ tahmin: 'Oyun Bağımlısı' rozeti",
            "Profilinizden tüm başarımları görüntüleyin"
        ]
    },
    {
        id: "save_share",
        title: "Kaydet ve Paylaş",
        description: "Tahminlerinizi JSON dosyası olarak kaydedebilir veya puan durumunu sosyal medyada paylaşabilirsiniz.",
        icon: "💾",
        tips: [
            "Kaydet: Tüm tahminlerinizi indirin",
            "Yükle: Önceki tahminlerinizi geri yükleyin",
            "Paylaş: Sonuçları görsel olarak paylaşın"
        ]
    },
    {
        id: "finish",
        title: "Hazırsınız!",
        description: "Artık VolleySimulator'ı kullanmaya hazırsınız. İyi tahminler ve bol şans!",
        icon: "🎉",
        tips: [
            "Sorularınız için Ayarlar > Yardım",
            "Geri bildirim için iletişime geçin",
            "Keyifli oyunlar!"
        ]
    }
];

interface TutorialModalProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete?: () => void;
}

export default function TutorialModal({ isOpen, onClose, onComplete }: TutorialModalProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    const step = TUTORIAL_STEPS[currentStep];
    const isLastStep = currentStep === TUTORIAL_STEPS.length - 1;
    const isFirstStep = currentStep === 0;

    const handleNext = () => {
        if (isLastStep) {
            handleComplete();
        } else {
            setIsAnimating(true);
            setTimeout(() => {
                setCurrentStep(prev => prev + 1);
                setIsAnimating(false);
            }, 150);
        }
    };

    const handlePrev = () => {
        if (!isFirstStep) {
            setIsAnimating(true);
            setTimeout(() => {
                setCurrentStep(prev => prev - 1);
                setIsAnimating(false);
            }, 150);
        }
    };

    const handleComplete = () => {
        localStorage.setItem("tutorialCompleted", "true");
        onComplete?.();
        onClose();
    };

    const handleSkip = () => {
        localStorage.setItem("tutorialCompleted", "true");
        onClose();
    };

    const progressValue = ((currentStep + 1) / TUTORIAL_STEPS.length) * 100;

    return (
        <Dialog open={isOpen} onOpenChange={() => onClose()}>
            <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
                {/* Progress Bar */}
                <Progress value={progressValue} className="h-1 rounded-none" />

                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b">
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground font-medium">
                            {currentStep + 1} / {TUTORIAL_STEPS.length}
                        </span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={handleSkip} className="text-xs">
                        Atla
                    </Button>
                </div>

                {/* Content */}
                <div className={`p-6 transition-opacity duration-150 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
                    {/* Icon */}
                    <div className="flex justify-center mb-6">
                        <div className="w-20 h-20 bg-gradient-to-br from-emerald-600/30 to-cyan-600/30 rounded-2xl flex items-center justify-center border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
                            <span className="text-4xl">{step.icon}</span>
                        </div>
                    </div>

                    {/* Title & Description */}
                    <h2 className="text-xl font-bold text-foreground text-center mb-3">
                        {step.title}
                    </h2>
                    <p className="text-muted-foreground text-center text-sm leading-relaxed mb-6">
                        {step.description}
                    </p>

                    {/* Tips */}
                    {step.tips && (
                        <div className="bg-muted rounded-xl p-4 border">
                            <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                                💡 İpuçları
                            </div>
                            <ul className="space-y-2">
                                {step.tips.map((tip, index) => (
                                    <li key={index} className="flex items-start gap-2 text-sm text-foreground/80">
                                        <span className="text-emerald-400 mt-0.5">•</span>
                                        {tip}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between p-4 border-t bg-muted/50">
                    <Button
                        variant="ghost"
                        onClick={handlePrev}
                        disabled={isFirstStep}
                        className="text-sm"
                    >
                        ← Geri
                    </Button>

                    {/* Step Dots */}
                    <div className="flex gap-1.5">
                        {TUTORIAL_STEPS.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentStep(index)}
                                title={`Adım ${index + 1}'e git`}
                                className={`h-2 rounded-full transition-all ${index === currentStep
                                    ? 'bg-emerald-500 w-6'
                                    : index < currentStep
                                        ? 'bg-emerald-500/50 w-2'
                                        : 'bg-muted-foreground/30 w-2'
                                    }`}
                            />
                        ))}
                    </div>

                    <Button
                        onClick={handleNext}
                        className={isLastStep ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 text-white' : ''}
                        variant={isLastStep ? 'default' : 'secondary'}
                    >
                        {isLastStep ? 'Başla! 🚀' : 'İleri →'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// Hook for tutorial state
export function useTutorial() {
    const [showTutorial, setShowTutorial] = useState(false);
    const [isFirstVisit, setIsFirstVisit] = useState(false);

    useEffect(() => {
        const completed = localStorage.getItem("tutorialCompleted");
        if (!completed) {
            setIsFirstVisit(true);
            // Show tutorial on first visit after a short delay
            setTimeout(() => setShowTutorial(true), 1000);
        }
    }, []);

    const openTutorial = () => setShowTutorial(true);
    const closeTutorial = () => setShowTutorial(false);
    const resetTutorial = () => {
        localStorage.removeItem("tutorialCompleted");
        setShowTutorial(true);
    };

    return {
        showTutorial,
        isFirstVisit,
        openTutorial,
        closeTutorial,
        resetTutorial
    };
}

```

## File: app\components\XPBar.tsx
```
"use client";

import { useGameState } from "../utils/gameState";

interface XPBarProps {
    compact?: boolean;
}

export default function XPBar({ compact = false }: XPBarProps) {
    const { gameState, getXPProgress, getLevelTitle } = useGameState();
    const { progress, required, percentage } = getXPProgress();

    if (compact) {
        return (
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-gradient-to-r from-amber-500 to-orange-500 px-2 py-0.5 rounded-full">
                    <span className="text-white text-xs font-black">Lv.{gameState.level}</span>
                </div>
                <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-amber-400 to-orange-400 transition-all duration-500"
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl border border-slate-700 p-3">
            {/* Level Badge & Title */}
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg shadow-lg shadow-amber-500/30">
                        <span className="text-white text-lg font-black">{gameState.level}</span>
                    </div>
                    <div>
                        <div className="text-xs text-slate-400">Seviye</div>
                        <div className="text-sm font-bold text-amber-400">{getLevelTitle()}</div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-xs text-slate-400">XP</div>
                    <div className="text-sm font-bold text-white">
                        {gameState.xp.toLocaleString()}
                    </div>
                </div>
            </div>

            {/* XP Progress Bar */}
            <div className="relative">
                <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 transition-all duration-700 ease-out relative"
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                    >
                        {/* Shine effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                    </div>
                </div>
                <div className="flex justify-between mt-1">
                    <span className="text-[10px] text-slate-500">{progress.toLocaleString()} XP</span>
                    <span className="text-[10px] text-slate-500">{required.toLocaleString()} XP</span>
                </div>
            </div>

            {/* Stats Row */}
            <div className="flex gap-4 mt-3 pt-3 border-t border-slate-700/50">
                <div className="flex items-center gap-1.5">
                    <span className="text-base">🎯</span>
                    <div>
                        <div className="text-[10px] text-slate-500">Tahmin</div>
                        <div className="text-xs font-bold text-white">{gameState.stats.totalPredictions}</div>
                    </div>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="text-base">🔥</span>
                    <div>
                        <div className="text-[10px] text-slate-500">Seri</div>
                        <div className="text-xs font-bold text-orange-400">{gameState.stats.currentStreak}</div>
                    </div>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="text-base">🏆</span>
                    <div>
                        <div className="text-[10px] text-slate-500">Rozet</div>
                        <div className="text-xs font-bold text-amber-400">{gameState.achievements.length}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

```

## File: app\components\Calculator\FixtureList.tsx
```
import { useState, memo, useCallback, useMemo } from "react";
import Link from "next/link";
import { Match } from "../../types";
import { SCORES, normalizeTeamName } from "../../utils/calculatorUtils";
import { generateTeamSlug } from "../../utils/teamSlug";
import TeamAvatar from "../TeamAvatar";

interface FixtureListProps {
    matches: Match[];
    overrides: Record<string, string>;
    onScoreChange: (matchId: string, score: string) => void;
    teamRanks?: Map<string, number>;
    totalTeams?: number; // Total teams in group for relegation calculation
    relegationSpots?: number; // Number of teams to be relegated
}

function FixtureList({ matches, overrides, onScoreChange, teamRanks, totalTeams = 16, relegationSpots = 2 }: FixtureListProps) {
    const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
    const [collapsedDates, setCollapsedDates] = useState<Set<string>>(new Set());

    const toggleDateCollapse = (dateStr: string) => {
        setCollapsedDates(prev => {
            const newSet = new Set(prev);
            if (newSet.has(dateStr)) {
                newSet.delete(dateStr);
            } else {
                newSet.add(dateStr);
            }
            return newSet;
        });
    };

    // Helper to get team rank
    const getTeamRank = (teamName: string): number | null => {
        if (!teamRanks) return null;
        if (teamRanks.has(teamName)) return teamRanks.get(teamName)!;
        const normalized = normalizeTeamName(teamName);
        for (const [key, rank] of teamRanks.entries()) {
            if (normalizeTeamName(key) === normalized) return rank;
        }
        return null;
    };

    // Determine match importance based on team positions
    const getMatchImportance = (homeRank: number | null, awayRank: number | null): { label: string; color: string } | null => {
        if (!homeRank || !awayRank) return null;
        if (relegationSpots === 0) return null; // No relegation warning if spots is 0

        const playoffBoundary = 4; // Top 4 go to playoff usually (adjusted based on needs)
        const relegationBoundary = totalTeams - relegationSpots + 1; // e.g. 10 teams, 2 spots -> 9 and 10 are relegated. Boundary is 9.

        // Both in playoff zone
        if (homeRank <= playoffBoundary && awayRank <= playoffBoundary) {
            return { label: 'Playoff Karşılaşması', color: 'from-emerald-600/80 to-emerald-500/60 text-emerald-200' };
        }
        // One in playoff, one fighting for it
        if ((homeRank <= playoffBoundary && awayRank <= playoffBoundary + 1) || (awayRank <= playoffBoundary && homeRank <= playoffBoundary + 1)) {
            return { label: 'Playoff Mücadelesi', color: 'from-blue-600/80 to-blue-500/60 text-blue-200' };
        }
        // Both in relegation zone
        if (homeRank >= relegationBoundary && awayRank >= relegationBoundary) {
            return { label: '⚠️ KÜME DÜŞME HATTINDA KRİTİK MAÇ', color: 'from-rose-600/80 to-rose-500/60 text-rose-200' };
        }
        // One in relegation zone
        if (homeRank >= relegationBoundary || awayRank >= relegationBoundary) {
            return { label: '⚠️ KÜME DÜŞME TEHLİKESİ', color: 'from-orange-600/80 to-orange-500/60 text-orange-200' };
        }
        // Mid-table clash
        if (homeRank > playoffBoundary && homeRank < relegationBoundary && awayRank > playoffBoundary && awayRank < relegationBoundary) {
            return { label: 'Orta Sıra', color: 'from-slate-600/60 to-slate-500/40 text-slate-300' };
        }
        return null;
    };

    // Parse date from DD.MM.YYYY or YYYY-MM-DD format
    const parseDate = (dateStr: string | undefined): Date | null => {
        if (!dateStr) return null;

        // Try DD.MM.YYYY
        if (dateStr.includes('.')) {
            const parts = dateStr.split('.');
            if (parts.length === 3) {
                return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
            }
        }

        // Try YYYY-MM-DD
        if (dateStr.includes('-')) {
            const parts = dateStr.split('-');
            if (parts.length === 3) {
                return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
            }
        }

        return null;
    };

    // Helper function for robust isPlayed check
    const isMatchPlayed = (m: Match) => {
        return m.isPlayed || (m.homeScore !== undefined && m.homeScore !== null && m.awayScore !== undefined && m.awayScore !== null);
    };

    // Split matches into upcoming and past
    const upcomingMatches = matches.filter(m => !isMatchPlayed(m));
    const pastMatches = matches.filter(m => isMatchPlayed(m));
    const currentMatches = activeTab === 'upcoming' ? upcomingMatches : pastMatches;

    // Group matches by date
    const groupedMatches = currentMatches.reduce((acc, match) => {
        const matchDate = match.matchDate || (match as any).date || 'Tarih Belirtilmemiş';
        if (!acc[matchDate]) acc[matchDate] = [];
        acc[matchDate].push(match);
        return acc;
    }, {} as Record<string, Match[]>);

    // Sort date groups
    const sortedDateGroups = Object.entries(groupedMatches).sort((a, b) => {
        const dateA = parseDate(a[0]);
        const dateB = parseDate(b[0]);
        if (!dateA && !dateB) return 0;
        if (!dateA) return 1;
        if (!dateB) return -1;
        return activeTab === 'upcoming'
            ? dateA.getTime() - dateB.getTime()  // Nearest first
            : dateB.getTime() - dateA.getTime(); // Most recent first
    });

    // Format date for display with day name
    const formatDateDisplay = (dateStr: string): string => {
        if (dateStr === 'Tarih Belirtilmemiş') return dateStr;

        const date = parseDate(dateStr);
        if (!date) return dateStr;

        const days = ['PAZAR', 'PAZARTESİ', 'SALI', 'ÇARŞAMBA', 'PERŞEMBE', 'CUMA', 'CUMARTESİ'];
        const dayName = days[date.getDay()];

        // Format as DD/MM/YYYY
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();

        return `${day}/${month}/${year} ${dayName}`;
    };

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow-xl flex flex-col h-full">
            {/* Tabs */}
            <div className="bg-slate-800/50 px-2 py-2 border-b border-slate-800 sticky top-0 z-10">
                <div className="flex gap-1">
                    <button
                        onClick={() => setActiveTab('upcoming')}
                        className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${activeTab === 'upcoming'
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                            }`}
                    >
                        <span>📅</span>
                        <span>Gelecek</span>
                        <span className="bg-white/20 px-1.5 py-0.5 rounded text-[9px]">{upcomingMatches.length}</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('past')}
                        className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${activeTab === 'past'
                            ? 'bg-slate-600 text-white shadow-lg'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                            }`}
                    >
                        <span>✅</span>
                        <span>Geçmiş</span>
                        <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px]">{pastMatches.length}</span>
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-3 custom-scrollbar">
                {sortedDateGroups.length === 0 ? (
                    <div className="flex items-center justify-center h-32 text-slate-500 text-sm">
                        {activeTab === 'upcoming' ? 'Gelecek maç bulunamadı' : 'Geçmiş maç bulunamadı'}
                    </div>
                ) : (
                    sortedDateGroups.map(([dateStr, dateMatches]) => {
                        const isCollapsed = collapsedDates.has(dateStr);
                        return (
                            <div key={dateStr} className="space-y-2">
                                <button
                                    onClick={() => toggleDateCollapse(dateStr)}
                                    className="sticky top-0 z-5 w-full bg-slate-950/90 backdrop-blur-sm py-1.5 px-3 rounded-lg border border-slate-800 flex items-center justify-between hover:bg-slate-900/90 transition-colors cursor-pointer"
                                >
                                    <span className="text-[10px] font-bold text-indigo-400 flex items-center gap-2">
                                        <span className={`transition-transform duration-200 ${isCollapsed ? '' : 'rotate-90'}`}>▶</span>
                                        📆 {formatDateDisplay(dateStr)}
                                    </span>
                                    <span className="text-[9px] text-slate-400 bg-slate-800/50 px-2 py-0.5 rounded">{dateMatches.length} maç</span>
                                </button>

                                {!isCollapsed && dateMatches.map((match) => {
                                    const matchId = `${match.homeTeam}-${match.awayTeam}`;
                                    const currentScore = overrides[matchId];
                                    // ROBUST: Treat as played if isPlayed is true OR scores are present
                                    const isPlayed = isMatchPlayed(match);

                                    const homeRank = getTeamRank(match.homeTeam);
                                    const awayRank = getTeamRank(match.awayTeam);
                                    const matchImportance = getMatchImportance(homeRank, awayRank);
                                    const matchTime = match.matchTime || (match as any).time;

                                    return (
                                        <div
                                            key={matchId}
                                            id={`match-${match.homeTeam}-${match.awayTeam}`}
                                            className={`p-2 rounded-lg border transition-all ${isPlayed
                                                ? 'bg-slate-950/50 border-slate-800/50'
                                                : currentScore
                                                    ? 'bg-slate-800 border-indigo-500/50 shadow-md ring-1 ring-indigo-500/20'
                                                    : 'bg-slate-800 border-slate-700 hover:border-slate-600'
                                                }`}
                                        >
                                            {/* Match Time Badge - Always show */}
                                            <div className="flex justify-center -mt-1 mb-1.5">
                                                <span className="text-[9px] font-mono bg-slate-950/80 px-1.5 py-0.5 rounded text-slate-400 border border-slate-800/50">
                                                    {matchTime || '--:--'}
                                                </span>
                                            </div>

                                            {/* Match Importance Badge */}
                                            {matchImportance && !isPlayed && (
                                                <div className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-t-md -mx-3 -mt-3 mb-2 text-center bg-gradient-to-r ${matchImportance.color}`}>
                                                    {matchImportance.label}
                                                </div>
                                            )}

                                            <div className="flex items-center justify-between text-[10px] mb-1.5">
                                                <div className={`flex-1 text-right font-semibold truncate pr-2 flex items-center justify-end gap-1 ${currentScore && getScoreWinner(currentScore) === 'home' ? 'text-emerald-400' : 'text-slate-300'}`}>
                                                    {homeRank && (
                                                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${homeRank <= 2 ? 'bg-emerald-500/20 text-emerald-400' : homeRank <= 4 ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-700 text-slate-300'}`}>
                                                            {homeRank}.
                                                        </span>
                                                    )}
                                                    <Link href={`/takimlar/${generateTeamSlug(match.homeTeam)}`} className="truncate hover:underline">{match.homeTeam}</Link>
                                                    <TeamAvatar name={match.homeTeam} size="sm" />
                                                </div>
                                                <div className="text-[10px] text-slate-600 font-mono shrink-0 px-1">v</div>
                                                <div className={`flex-1 text-left font-semibold truncate pl-2 flex items-center gap-1 ${currentScore && getScoreWinner(currentScore) === 'away' ? 'text-emerald-400' : 'text-slate-300'}`}>
                                                    <TeamAvatar name={match.awayTeam} size="sm" />
                                                    <Link href={`/takimlar/${generateTeamSlug(match.awayTeam)}`} className="truncate hover:underline">{match.awayTeam}</Link>
                                                    {awayRank && (
                                                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${awayRank <= 2 ? 'bg-emerald-500/20 text-emerald-400' : awayRank <= 4 ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-700 text-slate-300'}`}>
                                                            {awayRank}.
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {isPlayed ? (
                                                <div className="flex justify-center">
                                                    <span className="px-3 py-1 bg-slate-900 font-mono font-bold text-slate-400 rounded border border-slate-800 text-sm">
                                                        {match.homeScore !== undefined && match.homeScore !== null && match.awayScore !== undefined && match.awayScore !== null
                                                            ? `${match.homeScore} - ${match.awayScore}`
                                                            : match.resultScore || "Oynandı"}
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="flex justify-center gap-1 flex-wrap">
                                                    {SCORES.map(score => {
                                                        const isSelected = currentScore === score;
                                                        const [h, a] = score.split('-').map(Number);
                                                        const homeWin = h > a;
                                                        return (
                                                            <button
                                                                key={score}
                                                                onClick={() => onScoreChange(matchId, isSelected ? '' : score)}
                                                                className={`w-8 h-6 flex items-center justify-center rounded text-[10px] font-bold transition-all border ${isSelected
                                                                    ? homeWin
                                                                        ? 'bg-emerald-700 border-emerald-600 text-white shadow-emerald-600/30 shadow-md'
                                                                        : 'bg-rose-700 border-rose-600 text-white shadow-rose-600/30 shadow-md'
                                                                    : 'bg-slate-950 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-300'
                                                                    }`}
                                                            >
                                                                {score}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            )}

                                            {!isPlayed && currentScore && (
                                                <div className="flex justify-center text-[10px] text-indigo-400 font-medium mt-2">✓ Tahmin Girildi</div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

function getScoreWinner(score: string) {
    const [h, a] = score.split('-').map(Number);
    if (h > a) return 'home';
    if (a > h) return 'away';
    return null;
}

export default memo(FixtureList);

```

## File: app\components\Calculator\StandingsTable.tsx
```
import { memo } from "react";
import Link from "next/link";
import { TeamStats } from "../../types";
import { TeamDiff } from "../../utils/scenarioUtils";
import { generateTeamSlug } from "../../utils/teamSlug";
import TeamAvatar from "../TeamAvatar";

interface StandingsTableProps {
    teams: TeamStats[];
    playoffSpots?: number;
    secondaryPlayoffSpots?: number; // For 5-8 playoff zone (VSL)
    relegationSpots?: number;
    initialRanks?: Map<string, number>; // For showing rank changes
    compact?: boolean;
    loading?: boolean;
    comparisonDiffs?: TeamDiff[];
}

function StandingsTable({
    teams,
    playoffSpots = 2,
    secondaryPlayoffSpots = 0,
    relegationSpots = 2,
    initialRanks,
    compact = false,
    loading = false,
    comparisonDiffs
}: StandingsTableProps) {
    const rowClass = compact ? "px-2 py-1 text-xs" : "px-2 py-2 text-xs sm:text-sm";
    const headClass = compact ? "px-2 py-1 text-xs uppercase" : "px-2 py-2 text-xs uppercase sm:text-sm";
    const rankSize = compact ? "w-5 h-5 text-xs" : "w-6 h-6 text-xs";

    if (loading) {
        return (
            <div className={`bg-surface border border-border-main rounded-lg overflow-hidden shadow-sm h-full p-4 space-y-4`}>
                <div className="h-6 bg-surface-secondary rounded w-1/3 animate-pulse"></div>
                <div className="space-y-2">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="h-8 bg-surface-secondary/50 rounded animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-surface border border-border-main rounded-lg overflow-hidden shadow-sm flex flex-col h-full ${compact ? 'text-xs' : ''}`}>
            {!compact && (
                <div className="bg-surface-secondary px-4 py-3 border-b border-border-main">
                    <h3 className="font-bold text-foreground flex items-center gap-2">
                        <span>📊</span> Puan Durumu
                    </h3>
                </div>
            )}

            {/* Legend - Only show if not compact, or show simplified */}
            {!compact && (
                <div className="px-4 py-2 bg-surface/50 border-b border-border-main flex gap-4 text-[10px] flex-wrap">
                    <div className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                        <span className="text-text-secondary">Play-off (İlk {playoffSpots})</span>
                    </div>
                    {secondaryPlayoffSpots > 0 && (
                        <div className="flex items-center gap-1">
                            <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                            <span className="text-text-secondary">5-8 Play-off ({playoffSpots + 1}-{playoffSpots + secondaryPlayoffSpots})</span>
                        </div>
                    )}
                    <div className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                        <span className="text-text-secondary">Küme Düşme (Son {relegationSpots})</span>
                    </div>
                </div>
            )}

            <div className="overflow-x-auto flex-1 custom-scrollbar pb-2">
                <table className={`w-full text-left ${compact ? 'text-xs' : 'text-xs sm:text-sm'}`}>
                    <thead className="bg-surface-secondary text-text-secondary tracking-wider font-semibold border-b border-border-main sticky top-0">
                        <tr>
                            <th scope="col" className={`${headClass} w-10 text-left pl-2 whitespace-nowrap`}>#</th>
                            <th scope="col" className={`${headClass} whitespace-nowrap`}>Takım</th>
                            <th scope="col" className={`${headClass} w-8 text-center whitespace-nowrap`} title="Oynanan Maç">OM</th>
                            <th scope="col" className={`${headClass} w-8 text-center text-emerald-500 whitespace-nowrap`} title="Galibiyet">G</th>
                            <th scope="col" className={`${headClass} w-8 text-center text-rose-500 whitespace-nowrap`} title="Mağlubiyet">M</th>
                            <th scope="col" className={`${headClass} w-10 text-center text-amber-500 font-bold whitespace-nowrap`} title="Puan">P</th>
                            <th scope="col" className={`${headClass} w-8 text-center hidden sm:table-cell whitespace-nowrap`} title="Alınan Set">AS</th>
                            <th scope="col" className={`${headClass} w-8 text-center hidden sm:table-cell whitespace-nowrap`} title="Verilen Set">VS</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border-subtle">
                        {teams.map((team, idx) => {
                            const currentRank = idx + 1;
                            const isChampion = idx === 0;
                            const isPlayoff = idx < playoffSpots;
                            const isSecondaryPlayoff = secondaryPlayoffSpots > 0 && idx >= playoffSpots && idx < playoffSpots + secondaryPlayoffSpots;
                            const isRelegation = idx >= teams.length - relegationSpots;
                            const losses = team.played - team.wins;

                            // Calculate rank change
                            let rankChange = 0;
                            let pointDiff = 0;
                            let rankChangeIcon = null;
                            let pointDiffIcon = null;

                            if (comparisonDiffs) {
                                const diff = comparisonDiffs.find(d => d.name === team.name);
                                if (diff) {
                                    // Rank Diff
                                    rankChange = diff.rankDiff;
                                    if (rankChange > 0) rankChangeIcon = <span className="text-emerald-500 text-[10px] font-bold flex items-center gap-0.5">▲{rankChange}</span>;
                                    else if (rankChange < 0) rankChangeIcon = <span className="text-rose-500 text-[10px] font-bold flex items-center gap-0.5">▼{Math.abs(rankChange)}</span>;

                                    // Point Diff
                                    pointDiff = diff.pointDiff;
                                    if (pointDiff > 0) pointDiffIcon = <span className="text-emerald-500 text-[10px] ml-1">+{pointDiff}</span>;
                                    else if (pointDiff < 0) pointDiffIcon = <span className="text-rose-500 text-[10px] ml-1">{pointDiff}</span>;
                                }
                            } else if (initialRanks && initialRanks.has(team.name)) {
                                const oldRank = initialRanks.get(team.name)!;
                                const diff = oldRank - currentRank;
                                if (diff > 0) {
                                    rankChangeIcon = <span className="text-emerald-500 text-[10px] font-bold flex items-center gap-0.5">▲{diff}</span>;
                                } else if (diff < 0) {
                                    rankChangeIcon = <span className="text-rose-500 text-[10px] font-bold flex items-center gap-0.5">▼{Math.abs(diff)}</span>;
                                }
                            }

                            return (
                                <tr key={team.name} className={`hover:bg-surface-secondary/50 transition-colors ${isChampion ? 'bg-amber-500/10 dark:bg-amber-900/20' : isPlayoff ? 'bg-emerald-500/10 dark:bg-emerald-900/20' : isSecondaryPlayoff ? 'bg-amber-500/5 dark:bg-amber-900/10' : isRelegation ? 'bg-rose-500/10 dark:bg-rose-900/20' : ''}`}>
                                    <td className={`${rowClass} text-center font-mono whitespace-nowrap`}>
                                        <div className="flex items-center justify-start gap-1 pl-1">
                                            <div className={`${rankSize} flex-shrink-0 flex items-center justify-center rounded-full font-bold ${isChampion ? 'bg-gradient-to-b from-amber-400 to-amber-600 text-white shadow-lg' :
                                                isPlayoff ? 'bg-emerald-500 text-white shadow-lg' :
                                                    isSecondaryPlayoff ? 'bg-amber-500 text-white shadow-lg' :
                                                        isRelegation ? 'bg-rose-500 text-white shadow-lg' :
                                                            'bg-surface-secondary text-text-secondary'
                                                }`}>
                                                {isChampion ? '👑' : currentRank}
                                            </div>
                                            {rankChangeIcon}
                                        </div>
                                    </td>
                                    <td className={`${rowClass} font-medium whitespace-nowrap`}>
                                        <Link href={`/takimlar/${generateTeamSlug(team.name)}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity group">
                                            <TeamAvatar name={team.name} size={compact ? 'sm' : 'md'} priority={idx < 5} />
                                            <span className={`block truncate max-w-[120px] sm:max-w-[200px] group-hover:underline ${isPlayoff ? 'text-emerald-600 dark:text-emerald-400' : isSecondaryPlayoff ? 'text-amber-600 dark:text-amber-400' : isRelegation ? 'text-rose-600 dark:text-rose-400' : 'text-text-primary'}`}>{team.name}</span>
                                        </Link>
                                    </td>
                                    <td className={`${rowClass} text-center text-text-secondary whitespace-nowrap`}>{team.played}</td>
                                    <td className={`${rowClass} text-center text-emerald-500 font-medium whitespace-nowrap`}>{team.wins}</td>
                                    <td className={`${rowClass} text-center text-rose-500 font-medium whitespace-nowrap`}>{losses}</td>
                                    <td className={`${rowClass} text-center font-bold text-amber-500 bg-surface-secondary/30 whitespace-nowrap`}>
                                        {team.points}
                                        {pointDiffIcon}
                                    </td>
                                    <td className={`${rowClass} text-center text-text-secondary hidden sm:table-cell whitespace-nowrap`}>{team.setsWon}</td>
                                    <td className={`${rowClass} text-center text-text-secondary hidden sm:table-cell whitespace-nowrap`}>{team.setsLost}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default memo(StandingsTable);

```

