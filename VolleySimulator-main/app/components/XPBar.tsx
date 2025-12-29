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
