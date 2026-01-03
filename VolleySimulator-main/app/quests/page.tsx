"use client";

import { useState, useMemo } from "react";
import { useQuests } from "../context/QuestsContext";
import { useAuth } from "../context/AuthContext";
import { useGameState } from "../utils/gameState";
import { BADGE_RARITY_COLORS, Badge } from "../types";
import Link from "next/link";

export default function QuestsPage() {
  const { user } = useAuth();
  const { gameState } = useGameState();
  const { 
    dailyQuests, 
    weeklyChallenge, 
    streakData, 
    badges,
    unlockedBadges,
    claimQuestReward,
    useStreakFreeze,
    isLoading 
  } = useQuests();
  
  const [activeTab, setActiveTab] = useState<'quests' | 'badges' | 'streak'>('quests');
  const [showRewardModal, setShowRewardModal] = useState<{ xp: number; coins: number } | null>(null);

  // Calculate streak status
  const streakStatus = useMemo(() => {
    if (!streakData.lastPredictionDate) return 'inactive';
    
    const lastDate = new Date(streakData.lastPredictionDate);
    const today = new Date();
    const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'active';
    if (diffDays === 1) return 'at_risk';
    return 'broken';
  }, [streakData.lastPredictionDate]);

  const handleClaimReward = async (questId: string) => {
    const reward = await claimQuestReward(questId);
    if (reward) {
      setShowRewardModal(reward);
      setTimeout(() => setShowRewardModal(null), 3000);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 mb-4">Bu sayfayı görüntülemek için giriş yapmalısınız.</p>
          <Link href="/" className="text-emerald-400 hover:underline">Giriş Yap</Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header with Streak */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Görevler & Başarımlar</h1>
              <p className="text-white/70 text-sm mt-1">
                Günlük görevleri tamamla, XP kazan!
              </p>
            </div>
            
            {/* Streak Display */}
            <div className="text-center">
              <div className={`text-4xl font-black ${
                streakStatus === 'active' ? 'text-white' : 
                streakStatus === 'at_risk' ? 'text-amber-300' : 'text-slate-300'
              }`}>
                {streakData.currentStreak}🔥
              </div>
              <div className="text-xs text-white/70">Günlük Seri</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex gap-2 py-4 border-b border-slate-800">
          {[
            { key: 'quests', label: 'Günlük Görevler', icon: '📋' },
            { key: 'badges', label: 'Rozetler', icon: '🎖️' },
            { key: 'streak', label: 'Seri', icon: '🔥' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-white/10 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="py-6">
          {/* Daily Quests */}
          {activeTab === 'quests' && (
            <div className="space-y-4">
              {/* Daily Quest Progress */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-white">Günlük İlerleme</h3>
                  <span className="text-sm text-slate-400">
                    {dailyQuests.filter(q => q.completed).length}/{dailyQuests.length} tamamlandı
                  </span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-500"
                    style={{ width: `${(dailyQuests.filter(q => q.completed).length / dailyQuests.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Quest Cards */}
              <div className="space-y-3">
                {dailyQuests.map(quest => (
                  <div
                    key={quest.id}
                    className={`bg-slate-900/50 border rounded-xl p-4 transition-all ${
                      quest.completed 
                        ? quest.claimed 
                          ? 'border-slate-700 opacity-60' 
                          : 'border-emerald-500/50 bg-emerald-500/10'
                        : 'border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-3xl">{quest.icon}</div>
                      <div className="flex-1">
                        <h3 className="font-bold text-white">{quest.title}</h3>
                        <p className="text-sm text-slate-400">{quest.description}</p>
                        
                        {/* Progress Bar */}
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                            <span>{quest.progress}/{quest.target}</span>
                            <span>{Math.round((quest.progress / quest.target) * 100)}%</span>
                          </div>
                          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-300 ${
                                quest.completed ? 'bg-emerald-500' : 'bg-orange-500'
                              }`}
                              style={{ width: `${Math.min((quest.progress / quest.target) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      
                      {/* Rewards */}
                      <div className="text-right">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-amber-400">+{quest.xpReward} XP</span>
                          <span className="text-yellow-400">+{quest.coinReward} 🪙</span>
                        </div>
                        
                        {quest.completed && !quest.claimed && (
                          <button
                            onClick={() => handleClaimReward(quest.id)}
                            className="mt-2 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-sm font-medium transition-colors"
                          >
                            Ödülü Al
                          </button>
                        )}
                        
                        {quest.claimed && (
                          <span className="text-xs text-slate-500">✓ Alındı</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Weekly Challenge */}
              {weeklyChallenge && (
                <div className="mt-8">
                  <h2 className="text-lg font-bold text-white mb-4">🏆 Haftalık Meydan Okuma</h2>
                  <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 border border-purple-500/30 rounded-xl p-6">
                    <div className="flex items-start gap-4">
                      <div className="text-4xl">{weeklyChallenge.icon}</div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white">{weeklyChallenge.title}</h3>
                        <p className="text-slate-300 mt-1">{weeklyChallenge.description}</p>
                        
                        <div className="mt-4">
                          <div className="flex items-center justify-between text-sm text-slate-400 mb-2">
                            <span>{weeklyChallenge.progress}/{weeklyChallenge.target}</span>
                            <span>{weeklyChallenge.participants} katılımcı</span>
                          </div>
                          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                              style={{ width: `${(weeklyChallenge.progress / weeklyChallenge.target) * 100}%` }}
                            />
                          </div>
                        </div>
                        
                        <div className="mt-4 flex items-center gap-4">
                          <span className="text-amber-400 font-bold">+{weeklyChallenge.xpReward} XP</span>
                          {weeklyChallenge.badgeReward && (
                            <span className="text-purple-400">🎖️ Özel Rozet</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Badges */}
          {activeTab === 'badges' && (
            <div className="space-y-6">
              {/* Unlocked Badges */}
              <div>
                <h2 className="text-lg font-bold text-white mb-4">
                  Kazanılan Rozetler ({unlockedBadges.length})
                </h2>
                {unlockedBadges.length === 0 ? (
                  <div className="text-center py-8 bg-slate-900/50 border border-slate-800 rounded-xl">
                    <div className="text-5xl mb-4">🎖️</div>
                    <p className="text-slate-400">Henüz rozet kazanmadınız</p>
                    <p className="text-sm text-slate-500 mt-2">Görevleri tamamlayarak rozetler kazanın!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {unlockedBadges.map(badge => (
                      <BadgeCard key={badge.id} badge={badge} unlocked />
                    ))}
                  </div>
                )}
              </div>

              {/* All Badges */}
              <div>
                <h2 className="text-lg font-bold text-white mb-4">
                  Tüm Rozetler ({badges.length})
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {badges.map(badge => {
                    const isUnlocked = unlockedBadges.some(b => b.id === badge.id);
                    return (
                      <BadgeCard 
                        key={badge.id} 
                        badge={badge} 
                        unlocked={isUnlocked}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Streak */}
          {activeTab === 'streak' && (
            <div className="space-y-6">
              {/* Current Streak */}
              <div className="bg-gradient-to-br from-orange-900/50 to-red-900/50 border border-orange-500/30 rounded-xl p-8 text-center">
                <div className="text-6xl font-black text-white mb-2">
                  {streakData.currentStreak}
                </div>
                <div className="text-2xl mb-4">🔥</div>
                <p className="text-slate-300">Günlük Seri</p>
                
                {streakStatus === 'at_risk' && (
                  <div className="mt-4 p-3 bg-amber-500/20 border border-amber-500/30 rounded-lg">
                    <p className="text-amber-300 text-sm">
                      ⚠️ Seriniz risk altında! Bugün tahmin yaparak koruyun.
                    </p>
                  </div>
                )}
                
                {streakStatus === 'broken' && (
                  <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                    <p className="text-red-300 text-sm">
                      ❌ Seriniz kırıldı. Yeni bir seri başlatın!
                    </p>
                  </div>
                )}
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-amber-400">{streakData.longestStreak}</div>
                  <p className="text-sm text-slate-400 mt-1">En Uzun Seri</p>
                </div>
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-cyan-400">{streakData.streakFreezeAvailable}</div>
                  <p className="text-sm text-slate-400 mt-1">Dondurma Hakkı</p>
                </div>
              </div>

              {/* Streak Freeze */}
              {streakData.streakFreezeAvailable > 0 && streakStatus === 'at_risk' && (
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-white">❄️ Seri Dondurma</h3>
                      <p className="text-sm text-slate-400">Bugün oynayamazsanız serinizi koruyun</p>
                    </div>
                    <button
                      onClick={useStreakFreeze}
                      className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-sm font-medium transition-colors"
                    >
                      Kullan
                    </button>
                  </div>
                </div>
              )}

              {/* Streak History */}
              {streakData.streakHistory.length > 0 && (
                <div>
                  <h3 className="font-bold text-white mb-4">Son 7 Gün</h3>
                  <div className="flex gap-2">
                    {streakData.streakHistory.slice(0, 7).map((entry, index) => (
                      <div
                        key={index}
                        className={`flex-1 text-center p-3 rounded-xl ${
                          entry.predictionsCount > 0
                            ? 'bg-emerald-500/20 border border-emerald-500/30'
                            : 'bg-slate-800/50 border border-slate-700'
                        }`}
                      >
                        <div className="text-lg">
                          {entry.predictionsCount > 0 ? '✅' : '❌'}
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          {new Date(entry.date).toLocaleDateString('tr-TR', { weekday: 'short' })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Reward Modal */}
      {showRewardModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 text-center animate-bounce-in">
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-white mb-4">Ödül Kazandınız!</h2>
            <div className="flex items-center justify-center gap-6">
              <div className="text-amber-400 text-xl font-bold">+{showRewardModal.xp} XP</div>
              <div className="text-yellow-400 text-xl font-bold">+{showRewardModal.coins} 🪙</div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

// Badge Card Component
function BadgeCard({ badge, unlocked }: { badge: Badge; unlocked: boolean }) {
  return (
    <div 
      className={`relative bg-slate-900/50 border rounded-xl p-4 text-center transition-all ${
        unlocked 
          ? 'border-slate-700 hover:border-slate-600' 
          : 'border-slate-800 opacity-50 grayscale'
      }`}
    >
      <div className="text-4xl mb-2">{badge.icon}</div>
      <h3 className={`font-bold text-sm ${unlocked ? 'text-white' : 'text-slate-500'}`}>
        {badge.name}
      </h3>
      <p className="text-xs text-slate-500 mt-1">{badge.description}</p>
      
      {/* Rarity indicator */}
      <div className={`mt-3 text-xs font-medium px-2 py-0.5 rounded-full bg-gradient-to-r ${BADGE_RARITY_COLORS[badge.rarity]} text-white inline-block`}>
        {badge.rarity.toUpperCase()}
      </div>
      
      {/* Progress bar for locked badges */}
      {!unlocked && badge.progress !== undefined && badge.target !== undefined && (
        <div className="mt-2">
          <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-slate-600"
              style={{ width: `${(badge.progress / badge.target) * 100}%` }}
            />
          </div>
          <p className="text-xs text-slate-600 mt-1">{badge.progress}/{badge.target}</p>
        </div>
      )}
      
      {unlocked && badge.unlockedAt && (
        <p className="text-xs text-slate-600 mt-2">
          {new Date(badge.unlockedAt).toLocaleDateString('tr-TR')}
        </p>
      )}
    </div>
  );
}
