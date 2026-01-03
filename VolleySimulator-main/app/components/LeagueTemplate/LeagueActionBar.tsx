"use client";

import { ReactNode } from 'react';
import { LeagueConfig, THEME_COLORS } from './types';

interface LeagueActionBarProps {
    config: LeagueConfig;
    // Left side
    title?: string;
    subtitle?: string;
    // Selector (group/round/pool)
    selectorLabel?: string;
    selectorValue?: string;
    selectorOptions?: (string | { label: string; value: string })[];
    onSelectorChange?: (value: string) => void;
    // Progress
    progress?: number;
    progressLabel?: string;
    // Right side actions
    children?: ReactNode;
}

export function LeagueActionBar({
    config,
    title,
    subtitle,
    selectorLabel,
    selectorValue,
    selectorOptions = [],
    onSelectorChange,
    progress,
    progressLabel,
    children
}: LeagueActionBarProps) {
    const theme = THEME_COLORS[config.theme];

    return (
        <div className="sticky top-14 z-20 flex flex-col sm:flex-row items-center justify-between gap-3 p-2 bg-slate-900/95 backdrop-blur-sm rounded-xl border border-slate-800 shadow-xl">
            {/* Left Side: Title + Selector */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                {/* Title Block */}
                {(title || subtitle) && (
                    <div className="text-center sm:text-left">
                        {title && (
                            <h1 className="font-bold text-white text-lg tracking-tight leading-none hidden sm:block">
                                {title}
                            </h1>
                        )}
                        {subtitle && (
                            <p className="text-[10px] text-slate-400 hidden sm:block">
                                {subtitle}
                            </p>
                        )}
                    </div>
                )}

                {/* Selector */}
                {selectorOptions.length > 0 && onSelectorChange && (
                    <div className="flex gap-2 items-center w-full sm:w-auto">
                        {selectorLabel && (
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest hidden sm:inline whitespace-nowrap">
                                {selectorLabel}:
                            </span>
                        )}
                        <div className="flex gap-1 p-1 bg-slate-950/50 rounded-lg border border-slate-800 items-center">
                            <select
                                value={selectorValue}
                                onChange={(e) => onSelectorChange(e.target.value)}
                                title={selectorLabel || 'Seçin'}
                                className={`px-3 py-1 bg-${config.theme}-600/20 ${theme.text} text-[10px] uppercase font-black rounded-md border border-${config.theme}-500/30 outline-none cursor-pointer transition-all focus:ring-2 focus:ring-${config.theme}-500/50`}
                            >
                                {selectorOptions.map(opt => {
                                    const value = typeof opt === 'string' ? opt : opt.value;
                                    const label = typeof opt === 'string' ? opt : opt.label;
                                    return (
                                        <option key={value} value={value} className="bg-slate-900 text-white">
                                            {label}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>
                    </div>
                )}

                {/* Progress */}
                {progress !== undefined && (
                    <div className="hidden sm:flex items-center gap-2">
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-800/50 rounded-lg border border-slate-700/50">
                            <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                <div
                                    className={`h-full bg-gradient-to-r ${theme.gradient} transition-all`}
                                    style={{ width: `${Math.min(progress, 100)}%` }}
                                />
                            </div>
                            <span className={`text-[9px] font-bold ${theme.text}`}>
                                {progressLabel || `%${Math.round(progress)}`}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Right Side: Actions */}
            {children && (
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap sm:flex-nowrap">
                    {children}
                </div>
            )}
        </div>
    );
}

export default LeagueActionBar;
