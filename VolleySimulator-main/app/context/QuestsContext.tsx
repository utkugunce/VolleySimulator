"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { DailyQuest, WeeklyChallenge, StreakData, Badge } from "../types";
import { useAuth } from "./AuthContext";
import { useGameState } from "../utils/gameState";

interface QuestsContextType {
  dailyQuests: DailyQuest[];
  weeklyChallenge: WeeklyChallenge | null;
  streakData: StreakData;
  badges: Badge[];
  unlockedBadges: Badge[];
  isLoading: boolean;
  // Actions
  claimQuestReward: (questId: string) => Promise<{ xp: number; coins: number } | null>;
  useStreakFreeze: () => Promise<boolean>;
  refreshQuests: () => Promise<void>;
  trackQuestProgress: (questType: string, amount?: number) => Promise<void>;
}

const defaultStreakData: StreakData = {
  currentStreak: 0,
  longestStreak: 0,
  lastPredictionDate: '',
  streakFreezeAvailable: 0,
  streakHistory: [],
};

const QuestsContext = createContext<QuestsContextType | undefined>(undefined);

export function QuestsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { addXP } = useGameState();
  const [dailyQuests, setDailyQuests] = useState<DailyQuest[]>([]);
  const [weeklyChallenge, setWeeklyChallenge] = useState<WeeklyChallenge | null>(null);
  const [streakData, setStreakData] = useState<StreakData>(defaultStreakData);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [unlockedBadges, setUnlockedBadges] = useState<Badge[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch daily quests
  const fetchQuests = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);

    try {
      // Use consolidated API endpoint
      const response = await fetch('/api/quests', {
        headers: { 'Authorization': `Bearer ${user.id}` },
      });

      if (response.ok) {
        const data = await response.json();

        if (data.dailyQuests) {
          setDailyQuests(data.dailyQuests);
        } else {
          setDailyQuests(generateDefaultQuests());
        }

        if (data.weeklyChallenge) {
          setWeeklyChallenge(data.weeklyChallenge);
        }

        if (data.streak) {
          setStreakData(data.streak);
        } else {
          setStreakData(defaultStreakData);
        }

        if (data.badges) {
          setBadges(data.badges);
          // Assuming unlockedBadges are part of badges or separate property, 
          // but API returns 'badges' which likely contains status.
          // For now, filtering if structure supports it, or setting empty if separate property missing
          setUnlockedBadges(data.badges.filter((b: Badge) => b.unlockedAt) || []);
        }
      } else {
        throw new Error('Failed to fetch quests');
      }
    } catch (err) {
      console.error('Failed to fetch quests:', err);
      // Use default quests on error
      setDailyQuests(generateDefaultQuests());
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Generate default daily quests
  function generateDefaultQuests(): DailyQuest[] {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const expiresAt = today.toISOString();

    return [
      {
        id: 'daily_predict_3',
        type: 'make_predictions',
        title: '3 Tahmin Yap',
        description: 'Bugün en az 3 maç tahmini yap',
        icon: '🎯',
        target: 3,
        progress: 0,
        xpReward: 50,
        coinReward: 10,
        expiresAt,
        completed: false,
        claimed: false,
      },
      {
        id: 'daily_correct_1',
        type: 'correct_predictions',
        title: 'Doğru Tahmin',
        description: '1 doğru tahmin yap',
        icon: '✅',
        target: 1,
        progress: 0,
        xpReward: 75,
        coinReward: 15,
        expiresAt,
        completed: false,
        claimed: false,
      },
      {
        id: 'daily_underdog',
        type: 'predict_underdog',
        title: 'Underdog Tahmini',
        description: 'Bir maçta sürpriz sonuç tahmin et',
        icon: '🐺',
        target: 1,
        progress: 0,
        xpReward: 100,
        coinReward: 25,
        expiresAt,
        completed: false,
        claimed: false,
      },
      {
        id: 'daily_view_stats',
        type: 'view_stats',
        title: 'İstatistikleri İncele',
        description: 'Takım istatistiklerini görüntüle',
        icon: '📊',
        target: 1,
        progress: 0,
        xpReward: 25,
        coinReward: 5,
        expiresAt,
        completed: false,
        claimed: false,
      },
    ];
  }

  // Claim quest reward
  const claimQuestReward = useCallback(async (questId: string): Promise<{ xp: number; coins: number } | null> => {
    if (!user) return null;

    const quest = dailyQuests.find(q => q.id === questId);
    if (!quest || !quest.completed || quest.claimed) return null;

    try {
      const response = await fetch(`/api/quests/${questId}/claim`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.id}`,
        },
      });

      if (!response.ok) throw new Error('Failed to claim reward');

      const data = await response.json();

      // Update local state
      setDailyQuests(prev =>
        prev.map(q => q.id === questId ? { ...q, claimed: true } : q)
      );

      // Add XP
      addXP(quest.xpReward);

      return { xp: quest.xpReward, coins: quest.coinReward };
    } catch (err) {
      console.error('Failed to claim reward:', err);
      return null;
    }
  }, [user, dailyQuests, addXP]);

  // Use streak freeze
  const useStreakFreeze = useCallback(async (): Promise<boolean> => {
    if (!user || streakData.streakFreezeAvailable <= 0) return false;

    try {
      const response = await fetch('/api/streak/freeze', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.id}`,
        },
      });

      if (!response.ok) throw new Error('Failed to use streak freeze');

      setStreakData(prev => ({
        ...prev,
        streakFreezeAvailable: prev.streakFreezeAvailable - 1,
      }));

      return true;
    } catch (err) {
      console.error('Failed to use streak freeze:', err);
      return false;
    }
  }, [user, streakData.streakFreezeAvailable]);

  // Track quest progress
  const trackQuestProgress = useCallback(async (questType: string, amount: number = 1) => {
    if (!user) return;

    // Update local state optimistically
    setDailyQuests(prev =>
      prev.map(q => {
        if (q.type === questType && !q.completed) {
          const newProgress = Math.min(q.progress + amount, q.target);
          return {
            ...q,
            progress: newProgress,
            completed: newProgress >= q.target,
          };
        }
        return q;
      })
    );

    // Send to server
    try {
      await fetch('/api/quests/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.id}`,
        },
        body: JSON.stringify({ questType, amount }),
      });
    } catch (err) {
      console.error('Failed to track quest progress:', err);
    }
  }, [user]);

  // Refresh quests
  const refreshQuests = useCallback(async () => {
    await fetchQuests();
  }, [fetchQuests]);

  // Initial fetch
  useEffect(() => {
    if (user) {
      fetchQuests();
    }
  }, [user, fetchQuests]);

  // Check for new day and reset quests
  useEffect(() => {
    const checkDailyReset = () => {
      const now = new Date();
      const questExpiry = dailyQuests[0]?.expiresAt;

      if (questExpiry && new Date(questExpiry) < now) {
        fetchQuests();
      }
    };

    const interval = setInterval(checkDailyReset, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [dailyQuests, fetchQuests]);

  return (
    <QuestsContext.Provider
      value={{
        dailyQuests,
        weeklyChallenge,
        streakData,
        badges,
        unlockedBadges,
        isLoading,
        claimQuestReward,
        useStreakFreeze,
        refreshQuests,
        trackQuestProgress,
      }}
    >
      {children}
    </QuestsContext.Provider>
  );
}

export function useQuests() {
  const context = useContext(QuestsContext);
  if (context === undefined) {
    throw new Error('useQuests must be used within a QuestsProvider');
  }
  return context;
}
