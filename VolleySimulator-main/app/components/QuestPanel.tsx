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
        Promise.resolve().then(() => {
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
        });
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
        const newlyCompletedQuests = quests.filter(
            quest => quest.progress >= quest.target && !completedQuests.has(quest.id)
        );

        if (newlyCompletedQuests.length > 0) {
            // Defer update to avoid "cascading renders" warning
            Promise.resolve().then(() => {
                setCompletedQuests(prev => {
                    const newSet = new Set(prev);
                    newlyCompletedQuests.forEach(quest => {
                        newSet.add(quest.id);
                        addXP(quest.xpReward);
                    });
                    localStorage.setItem('completedQuests', JSON.stringify([...newSet]));
                    return newSet;
                });
            });
        }
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
                                                style={{ '--quest-progress': `${progressPercent}%`, width: 'var(--quest-progress)' } as any}
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
