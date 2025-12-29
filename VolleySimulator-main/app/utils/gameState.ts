"use client";

import { useState, useEffect, useCallback } from 'react';
import {
    GameState,
    Achievement,
    AchievementId,
    Quest,
    QuestId,
    LEVEL_THRESHOLDS,
    LEVEL_TITLES
} from '../types';

// ============================================
// ACHIEVEMENT DEFINITIONS
// ============================================
export const ACHIEVEMENTS: Record<AchievementId, Omit<Achievement, 'unlockedAt'>> = {
    first_prediction: {
        id: 'first_prediction',
        name: 'İlk Adım',
        description: 'İlk tahminini yaptın!',
        icon: '🎯',
        xpReward: 50
    },
    streak_3: {
        id: 'streak_3',
        name: '3\'lü Seri',
        description: '3 maç üst üste doğru tahmin',
        icon: '🔥',
        xpReward: 100
    },
    streak_5: {
        id: 'streak_5',
        name: '5\'li Seri',
        description: '5 maç üst üste doğru tahmin',
        icon: '💥',
        xpReward: 200
    },
    champion_predictor: {
        id: 'champion_predictor',
        name: 'Şampiyon Tahmincisi',
        description: 'Sezon şampiyonunu doğru tahmin ettin',
        icon: '🏆',
        xpReward: 500
    },
    perfect_week: {
        id: 'perfect_week',
        name: 'Mükemmel Hafta',
        description: 'Bir haftada 5/5 doğru tahmin',
        icon: '💯',
        xpReward: 300
    },
    underdog_hero: {
        id: 'underdog_hero',
        name: 'Underdog Kahramanı',
        description: 'Sürpriz bir sonucu doğru tahmin ettin',
        icon: '🦸',
        xpReward: 150
    },
    game_addict: {
        id: 'game_addict',
        name: 'Oyun Bağımlısı',
        description: '50+ tahmin yaptın',
        icon: '🎮',
        xpReward: 250
    },
    loyal_fan: {
        id: 'loyal_fan',
        name: 'Sadık Taraftar',
        description: 'Favori takım seçtin ve 10 maçını tahmin ettin',
        icon: '❤️',
        xpReward: 150
    }
};

// ============================================
// INITIAL STATE
// ============================================
const getInitialGameState = (): GameState => ({
    xp: 0,
    level: 1,
    favoriteTeam: null,
    achievements: [],
    quests: [],
    stats: {
        totalPredictions: 0,
        correctPredictions: 0,
        currentStreak: 0,
        bestStreak: 0,
        predictedChampions: []
    },
    soundEnabled: true,
    lastActiveDate: new Date().toISOString().split('T')[0]
});

// ============================================
// HELPER FUNCTIONS
// ============================================
export function calculateLevel(xp: number): number {
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
        if (xp >= LEVEL_THRESHOLDS[i]) {
            return i + 1;
        }
    }
    return 1;
}

export function getXPForNextLevel(level: number): number {
    if (level >= LEVEL_THRESHOLDS.length) {
        return LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1] + 3000 * (level - LEVEL_THRESHOLDS.length + 1);
    }
    return LEVEL_THRESHOLDS[level] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
}

export function getLevelTitle(level: number): string {
    const titles = Object.entries(LEVEL_TITLES)
        .map(([lvl, title]) => ({ level: parseInt(lvl), title }))
        .sort((a, b) => b.level - a.level);

    for (const { level: reqLevel, title } of titles) {
        if (level >= reqLevel) return title;
    }
    return 'Çaylak';
}

// ============================================
// GAME STATE HOOK
// ============================================
const STORAGE_KEY = 'volleySimGameState';

export function useGameState() {
    const [gameState, setGameState] = useState<GameState>(getInitialGameState);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                setGameState(prev => ({ ...prev, ...parsed }));
            }
        } catch (e) {
            console.error('Failed to load game state:', e);
        }
        setIsLoaded(true);
    }, []);

    // Save to localStorage on change
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
        }
    }, [gameState, isLoaded]);

    // Add XP
    const addXP = useCallback((amount: number) => {
        setGameState(prev => {
            const newXP = prev.xp + amount;
            const newLevel = calculateLevel(newXP);
            return {
                ...prev,
                xp: newXP,
                level: newLevel
            };
        });
    }, []);

    // Record prediction
    const recordPrediction = useCallback((isCorrect: boolean) => {
        setGameState(prev => {
            const newStats = { ...prev.stats };
            newStats.totalPredictions++;

            if (isCorrect) {
                newStats.correctPredictions++;
                newStats.currentStreak++;
                if (newStats.currentStreak > newStats.bestStreak) {
                    newStats.bestStreak = newStats.currentStreak;
                }
            } else {
                newStats.currentStreak = 0;
            }

            return { ...prev, stats: newStats };
        });
    }, []);

    // Unlock achievement
    const unlockAchievement = useCallback((id: AchievementId): boolean => {
        let wasUnlocked = false;

        setGameState(prev => {
            // Check if already unlocked
            if (prev.achievements.some(a => a.id === id)) {
                return prev;
            }

            const achievementDef = ACHIEVEMENTS[id];
            if (!achievementDef) return prev;

            const newAchievement: Achievement = {
                ...achievementDef,
                unlockedAt: new Date().toISOString()
            };

            wasUnlocked = true;
            const newXP = prev.xp + achievementDef.xpReward;

            return {
                ...prev,
                xp: newXP,
                level: calculateLevel(newXP),
                achievements: [...prev.achievements, newAchievement]
            };
        });

        return wasUnlocked;
    }, []);

    // Set favorite team
    const setFavoriteTeam = useCallback((teamName: string | null) => {
        setGameState(prev => ({ ...prev, favoriteTeam: teamName }));
    }, []);

    // Toggle sound
    const toggleSound = useCallback(() => {
        setGameState(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }));
    }, []);

    // Check if achievement is unlocked
    const hasAchievement = useCallback((id: AchievementId): boolean => {
        return gameState.achievements.some(a => a.id === id);
    }, [gameState.achievements]);

    return {
        gameState,
        isLoaded,
        addXP,
        recordPrediction,
        unlockAchievement,
        setFavoriteTeam,
        toggleSound,
        hasAchievement,
        getLevelTitle: () => getLevelTitle(gameState.level),
        getXPProgress: () => {
            const currentLevelXP = LEVEL_THRESHOLDS[gameState.level - 1] || 0;
            const nextLevelXP = getXPForNextLevel(gameState.level);
            const progress = gameState.xp - currentLevelXP;
            const required = nextLevelXP - currentLevelXP;
            return { progress, required, percentage: (progress / required) * 100 };
        }
    };
}
