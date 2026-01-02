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
