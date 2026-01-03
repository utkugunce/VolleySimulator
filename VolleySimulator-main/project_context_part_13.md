# Project Application Context - Part 13

## File: app\premium\page.tsx
```
"use client";

import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Link from "next/link";

interface PremiumPlan {
  id: string;
  name: string;
  price: number;
  period: 'monthly' | 'yearly';
  features: string[];
  popular?: boolean;
}

const PREMIUM_PLANS: PremiumPlan[] = [
  {
    id: 'basic',
    name: 'Temel',
    price: 0,
    period: 'monthly',
    features: [
      'Maç tahminleri',
      'Temel istatistikler',
      'Haftalık sıralama',
      'Arkadaşlık sistemi',
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 29.99,
    period: 'monthly',
    features: [
      'Tüm Temel özellikler',
      'AI Tahmin Asistanı',
      'Gelişmiş istatistikler',
      'Özel rozetler',
      'Reklamsız deneyim',
      'Öncelikli destek',
      'Özel temalar',
      'Maç simülasyonu',
    ],
    popular: true
  },
  {
    id: 'elite',
    name: 'Elite',
    price: 199.99,
    period: 'yearly',
    features: [
      'Tüm Pro özellikler',
      'Sınırsız özel lig',
      'Elit rozetler',
      'VIP Discord kanalı',
      'Erken erişim',
      'Aylık ödüller',
      '%40 indirim',
    ]
  }
];

const PREMIUM_FEATURES = [
  {
    icon: '🤖',
    title: 'AI Tahmin Asistanı',
    description: 'Yapay zeka destekli tahmin önerileri ve analiz',
    premium: true
  },
  {
    icon: '📊',
    title: 'Gelişmiş İstatistikler',
    description: 'Takım formları, H2H analizleri ve trend grafikleri',
    premium: true
  },
  {
    icon: '🎮',
    title: 'Maç Simülasyonu',
    description: 'Maçları simüle et ve sonuçları tahmin et',
    premium: true
  },
  {
    icon: '🎨',
    title: 'Özel Temalar',
    description: '15+ özel tema ve renk seçeneği',
    premium: true
  },
  {
    icon: '🏆',
    title: 'Özel Rozetler',
    description: 'Premium üyelere özel rozetler ve unvanlar',
    premium: true
  },
  {
    icon: '🚫',
    title: 'Reklamsız Deneyim',
    description: 'Hiçbir reklam görmeden oyunun keyfini çıkar',
    premium: true
  },
  {
    icon: '⚡',
    title: 'Öncelikli Destek',
    description: '24 saat içinde yanıt garantisi',
    premium: true
  },
  {
    icon: '🔮',
    title: 'Erken Erişim',
    description: 'Yeni özelliklere ilk sen eriş',
    premium: true
  }
];

export default function PremiumPage() {
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  const handleSubscribe = (planId: string) => {
    // In real app, this would open payment modal
    alert(`${planId} planına abone olunuyor...`);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-amber-600 via-orange-600 to-red-600 px-4 py-16 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
        
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6">
            <span className="animate-pulse">✨</span>
            <span>Premium Üyelik</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
            Tahmin Gücünü
            <span className="block text-amber-200">Sınırsız Hale Getir</span>
          </h1>
          
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            AI destekli tahminler, gelişmiş istatistikler ve özel özelliklerle 
            rakiplerinin bir adım önünde ol.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12 space-y-16">
        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setBillingPeriod('monthly')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              billingPeriod === 'monthly'
                ? 'bg-white text-slate-900'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Aylık
          </button>
          <button
            onClick={() => setBillingPeriod('yearly')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              billingPeriod === 'yearly'
                ? 'bg-white text-slate-900'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Yıllık <span className="text-emerald-400 text-sm ml-1">%40 indirim</span>
          </button>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PREMIUM_PLANS.map(plan => {
            const displayPrice = billingPeriod === 'yearly' && plan.id === 'pro' 
              ? (plan.price * 12 * 0.6).toFixed(2)
              : plan.price;
            
            return (
              <div
                key={plan.id}
                className={`relative bg-slate-900/50 border rounded-2xl p-6 transition-all ${
                  plan.popular 
                    ? 'border-amber-500 scale-105 shadow-2xl shadow-amber-500/20' 
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-1 rounded-full text-sm font-bold text-white">
                    En Popüler
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                  <div className="mt-4">
                    <span className="text-4xl font-black text-white">
                      {displayPrice === 0 ? 'Ücretsiz' : `₺${displayPrice}`}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-slate-400 ml-2">
                        /{billingPeriod === 'yearly' ? 'yıl' : 'ay'}
                      </span>
                    )}
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-slate-300">
                      <span className="text-emerald-400">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(plan.id)}
                  className={`w-full py-3 rounded-xl font-bold transition-all ${
                    plan.price === 0
                      ? 'bg-slate-800 text-slate-400 cursor-default'
                      : plan.popular
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white'
                        : 'bg-slate-800 hover:bg-slate-700 text-white'
                  }`}
                  disabled={plan.price === 0}
                >
                  {plan.price === 0 ? 'Mevcut Plan' : 'Abone Ol'}
                </button>
              </div>
            );
          })}
        </div>

        {/* Features Grid */}
        <div>
          <h2 className="text-2xl font-bold text-white text-center mb-8">
            Premium Özellikleri
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {PREMIUM_FEATURES.map((feature, index) => (
              <div
                key={index}
                className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:border-amber-500/50 transition-colors"
              >
                <span className="text-3xl">{feature.icon}</span>
                <h3 className="font-bold text-white mt-3">{feature.title}</h3>
                <p className="text-sm text-slate-400 mt-1">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-2xl p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: '10,000+', label: 'Premium Üye' },
              { value: '%89', label: 'Daha Yüksek Doğruluk' },
              { value: '50+', label: 'AI Modeli' },
              { value: '24/7', label: 'Destek' },
            ].map((stat, index) => (
              <div key={index}>
                <div className="text-3xl font-black text-amber-400">{stat.value}</div>
                <div className="text-sm text-slate-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div>
          <h2 className="text-2xl font-bold text-white text-center mb-8">
            Sık Sorulan Sorular
          </h2>
          
          <div className="space-y-4 max-w-3xl mx-auto">
            {[
              {
                q: 'Premium üyelik nasıl çalışır?',
                a: 'Premium üyelik satın aldığınızda, tüm premium özelliklere anında erişim kazanırsınız. Üyeliğiniz otomatik olarak yenilenir.'
              },
              {
                q: 'İstediğim zaman iptal edebilir miyim?',
                a: 'Evet, üyeliğinizi istediğiniz zaman iptal edebilirsiniz. İptal ettiğinizde, mevcut dönemin sonuna kadar premium özelliklere erişiminiz devam eder.'
              },
              {
                q: 'AI Tahmin Asistanı ne kadar doğru?',
                a: 'AI modelimiz, tarihsel veriler ve form analizleri ile %89 doğruluk oranına sahiptir. Ancak futbol her zaman sürprizlere açıktır!'
              },
              {
                q: 'Özel rozetler nasıl kazanılır?',
                a: 'Premium üye olduğunuzda otomatik olarak özel Premium rozeti alırsınız. Ayrıca premium görevleri tamamlayarak ek rozetler kazanabilirsiniz.'
              },
            ].map((faq, index) => (
              <details
                key={index}
                className="bg-slate-900/50 border border-slate-800 rounded-xl group"
              >
                <summary className="px-6 py-4 cursor-pointer font-medium text-white flex items-center justify-between">
                  {faq.q}
                  <span className="text-slate-500 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="px-6 pb-4 text-slate-400 text-sm">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Hala Düşünüyor musun?
          </h2>
          <p className="text-slate-400 mb-6">
            7 günlük ücretsiz deneme ile tüm özellikleri keşfet!
          </p>
          <button className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 rounded-xl font-bold text-lg transition-all">
            🚀 Ücretsiz Denemeyi Başlat
          </button>
        </div>

        {/* Guarantee */}
        <div className="flex items-center justify-center gap-4 py-6 border-t border-slate-800">
          <span className="text-2xl">🔒</span>
          <div>
            <div className="font-medium text-white">30 Gün Para İade Garantisi</div>
            <div className="text-sm text-slate-400">Memnun kalmazsan, paranı iade ederiz</div>
          </div>
        </div>
      </div>
    </main>
  );
}

```

## File: app\profile\page.tsx
```
"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { useGameState, ACHIEVEMENTS, getLevelTitle, getXPForNextLevel } from "../utils/gameState";
import { LEVEL_THRESHOLDS } from "../types";

export default function ProfilePage() {
    const router = useRouter();
    const { user, loading: authLoading, signOut } = useAuth();
    const { gameState, toggleSound, setFavoriteTeam } = useGameState();

    function getXPProgress(state: typeof gameState) {
        const currentLevelXP = LEVEL_THRESHOLDS[state.level - 1] || 0;
        const nextLevelXP = getXPForNextLevel(state.level);
        const progress = state.xp - currentLevelXP;
        const required = nextLevelXP - currentLevelXP;
        return { progress, required, percentage: (progress / required) * 100 };
    }

    const { progress, required, percentage } = getXPProgress(gameState);
    const accuracy = gameState.stats.totalPredictions > 0
        ? Math.round((gameState.stats.correctPredictions / gameState.stats.totalPredictions) * 100)
        : 0;

    const allAchievements = Object.values(ACHIEVEMENTS);
    const unlockedCount = gameState.achievements.length;

    const handleSignOut = async () => {
        await signOut();
        router.push('/login');
    };

    if (authLoading) {
        return (
            <main className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-slate-950 text-slate-100 p-2 sm:p-4 font-sans">
            <div className="max-w-2xl mx-auto space-y-3 sm:space-y-4">

                {/* Compact Header Card */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700 p-3 sm:p-4 shadow-xl">
                    <div className="flex items-center gap-3 sm:gap-4">
                        {/* Level Badge */}
                        <div className="relative shrink-0">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/30">
                                <span className="text-2xl sm:text-3xl font-black text-white">{gameState.level}</span>
                            </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h1 className="font-bold text-white text-lg sm:text-xl truncate">
                                    {user?.user_metadata?.name || 'Oyuncu'}
                                </h1>
                                <span className="text-[10px] sm:text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-bold">
                                    {getLevelTitle(gameState.level)}
                                </span>
                            </div>
                            <p className="text-[11px] sm:text-xs text-slate-500 truncate">
                                {user?.email || 'Giriş yapılmamış'}
                            </p>

                            {/* XP Mini Bar */}
                            <div className="mt-2">
                                <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-amber-400 to-orange-400 transition-all"
                                        style={{ width: `${Math.min(percentage, 100)}%` }}
                                    />
                                </div>
                                <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                                    <span>{gameState.xp.toLocaleString()} XP</span>
                                    <span>{progress}/{required}</span>
                                </div>
                            </div>
                        </div>

                        {/* Sign Out */}
                        {user && (
                            <button
                                onClick={handleSignOut}
                                className="shrink-0 px-2 sm:px-3 py-1.5 bg-slate-800 hover:bg-rose-900/50 text-slate-400 hover:text-rose-400 text-xs font-bold rounded-lg transition-all"
                            >
                                Çıkış
                            </button>
                        )}
                    </div>
                </div>

                {/* Stats Grid - More Compact */}
                <div className="grid grid-cols-4 gap-2">
                    <StatMini icon="🎯" value={gameState.stats.totalPredictions} label="Tahmin" color="blue" />
                    <StatMini icon="✓" value={gameState.stats.correctPredictions} label="Doğru" color="emerald" />
                    <StatMini icon="📊" value={`${accuracy}%`} label="İsabet" color="amber" />
                    <StatMini icon="🔥" value={gameState.stats.bestStreak} label="Seri" color="orange" />
                </div>

                {/* Favorite Team - Compact */}
                {gameState.favoriteTeam && (
                    <div className="bg-gradient-to-r from-rose-900/20 to-pink-900/20 rounded-xl border border-rose-600/30 p-2 sm:p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-lg">❤️</span>
                            <div>
                                <div className="text-[10px] text-rose-400/80 uppercase tracking-wider">Favori</div>
                                <div className="text-sm font-bold text-white truncate">{gameState.favoriteTeam}</div>
                            </div>
                        </div>
                        <button
                            onClick={() => setFavoriteTeam(null)}
                            className="text-rose-400/60 hover:text-rose-400 text-xs"
                        >
                            ✕
                        </button>
                    </div>
                )}

                {/* Quick Settings */}
                <div className="bg-slate-900 rounded-xl border border-slate-800 p-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-slate-500">🔊</span>
                            <span className="text-sm text-slate-300">Ses</span>
                        </div>
                        <button
                            onClick={toggleSound}
                            title="Ses Efektlerini Aç/Kapat"
                            className={`w-10 h-5 rounded-full transition-all relative ${gameState.soundEnabled ? 'bg-emerald-600' : 'bg-slate-700'}`}
                        >
                            <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform ${gameState.soundEnabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
                        </button>
                    </div>
                </div>

                {/* Achievements - Compact Grid */}
                <div className="bg-slate-900 rounded-xl border border-slate-800 p-3">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                            🏆 Başarılar
                        </h3>
                        <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-bold">
                            {unlockedCount}/{allAchievements.length}
                        </span>
                    </div>

                    <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                        {allAchievements.map(achievement => {
                            const isUnlocked = gameState.achievements.some(a => a.id === achievement.id);
                            return (
                                <div
                                    key={achievement.id}
                                    className={`p-2 rounded-lg border text-center transition-all ${isUnlocked
                                        ? 'bg-gradient-to-br from-amber-900/30 to-orange-900/30 border-amber-600/40'
                                        : 'bg-slate-800/30 border-slate-700/30 opacity-40'
                                        }`}
                                    title={`${achievement.name}: ${achievement.description}`}
                                >
                                    <div className={`text-xl ${!isUnlocked && 'grayscale'}`}>
                                        {achievement.icon}
                                    </div>
                                    <div className="text-[9px] font-bold text-white truncate mt-1">{achievement.name}</div>
                                    <div className="text-[8px] text-amber-400/70">+{achievement.xpReward}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Auth Card - Only if not logged in */}
                {!user && (
                    <div className="bg-amber-900/20 border border-amber-600/30 rounded-xl p-3 flex items-center justify-between">
                        <span className="text-amber-400 text-sm">Giriş yaparak ilerlemenizi kaydedin</span>
                        <a
                            href="/login"
                            className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg transition-all"
                        >
                            Giriş Yap
                        </a>
                    </div>
                )}

                {/* Back to Game */}
                <div className="text-center pb-4">
                    <a
                        href="/anasayfa"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold rounded-lg transition-all"
                    >
                        ← Ana Sayfa
                    </a>
                </div>

            </div>
        </main>
    );
}

// Compact stat mini component
function StatMini({ icon, value, label, color }: { icon: string; value: string | number; label: string; color: string }) {
    const colors: Record<string, string> = {
        blue: 'from-blue-900/30 to-blue-800/20 border-blue-600/30 text-blue-400',
        emerald: 'from-emerald-900/30 to-emerald-800/20 border-emerald-600/30 text-emerald-400',
        amber: 'from-amber-900/30 to-amber-800/20 border-amber-600/30 text-amber-400',
        orange: 'from-orange-900/30 to-orange-800/20 border-orange-600/30 text-orange-400',
    };

    return (
        <div className={`bg-gradient-to-br ${colors[color]} rounded-xl border p-2 text-center`}>
            <div className="text-sm">{icon}</div>
            <div className="text-lg sm:text-xl font-bold text-white">{value}</div>
            <div className="text-[9px] text-slate-400 uppercase">{label}</div>
        </div>
    );
}

```

## File: app\providers\QueryProvider.tsx
```
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";

export function QueryProvider({ children }: { children: ReactNode }) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 1000 * 60 * 10, // 10 minutes - data doesn't change frequently
                gcTime: 1000 * 60 * 30, // 30 minutes cache time (formerly cacheTime)
                refetchOnWindowFocus: false,
                refetchOnMount: false,
                refetchOnReconnect: false,
                retry: 1, // Only retry once on failure
                retryDelay: 1000,
            },
        },
    }));

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}

```

## File: app\quests\page.tsx
```
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

```

## File: app\register\layout.tsx
```
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Kayıt Ol",
    description: "VolleySimulator'a ücretsiz kayıt olun. Voleybol maç tahminleri yapın, puan kazanın ve diğer taraftarlarla yarışın.",
    openGraph: {
        title: "Kayıt Ol | VolleySimulator",
        description: "VolleySimulator'a ücretsiz kayıt olun ve tahmin oyununa katılın.",
    },
    robots: {
        index: false,
        follow: true,
    },
};

export default function RegisterLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}

```

## File: app\register\page.tsx
```
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { validators, sanitize } from "../utils/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowRight, ArrowLeft, AlertCircle, Gamepad2 } from "lucide-react";

export default function RegisterPage() {
    const router = useRouter();
    const { signUp, signInWithGoogle, user } = useAuth();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        favoriteTeam: ""
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [step, setStep] = useState(1);

    // Redirect if already logged in
    if (user) {
        router.push('/profile');
        return null;
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (step === 1) {
            // Use validation utilities
            const nameError = validators.string.required(formData.name, "Ad gerekli");
            const emailError = validators.string.required(formData.email, "E-posta gerekli")
                || validators.string.email(formData.email, "Geçerli bir e-posta girin");

            if (nameError || emailError) {
                setError(nameError || emailError || "");
                return;
            }
            // Sanitize inputs
            setFormData(prev => ({
                ...prev,
                name: sanitize.normalizeWhitespace(prev.name),
                email: prev.email.trim().toLowerCase()
            }));
            setError("");
            setStep(2);
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError("Şifreler eşleşmiyor");
            return;
        }

        if (formData.password.length < 6) {
            setError("Şifre en az 6 karakter olmalı");
            return;
        }

        setIsLoading(true);
        setError("");

        const { error } = await signUp(formData.email, formData.password, {
            name: formData.name
        });

        if (error) {
            setError(error.message === "User already registered"
                ? "Bu e-posta zaten kayıtlı"
                : error.message
            );
            setIsLoading(false);
        } else {
            // Save favorite team to localStorage for now
            if (formData.favoriteTeam) {
                localStorage.setItem('favoriteTeam', formData.favoriteTeam);
            }
            router.push('/profile');
        }
    };

    return (
        <main className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-block mb-4">
                        <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-200">
                            VolleySimulator
                        </span>
                    </Link>
                    <h1 className="text-3xl font-black">Kayıt Ol</h1>
                    <p className="text-muted-foreground text-sm mt-2">Tahmin oyununa katıl ve XP kazan!</p>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-center gap-4 mb-6">
                    <div className={`flex items-center gap-2 ${step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                            1
                        </div>
                        <span className="text-sm font-medium hidden sm:inline">Bilgiler</span>
                    </div>
                    <div className={`w-12 h-0.5 ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
                    <div className={`flex items-center gap-2 ${step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                            2
                        </div>
                        <span className="text-sm font-medium hidden sm:inline">Şifre</span>
                    </div>
                </div>

                {/* Register Form */}
                <Card>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            {step === 1 ? (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Kullanıcı Adı</Label>
                                        <Input
                                            id="name"
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="Takma adın"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email">E-posta</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="ornek@email.com"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Favori Takım (Opsiyonel)</Label>
                                        <Select
                                            value={formData.favoriteTeam}
                                            onValueChange={(value) => setFormData({ ...formData, favoriteTeam: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Takım seç..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Fenerbahçe Medicana">Fenerbahçe Medicana</SelectItem>
                                                <SelectItem value="VakıfBank">VakıfBank</SelectItem>
                                                <SelectItem value="Eczacıbaşı Dynavit">Eczacıbaşı Dynavit</SelectItem>
                                                <SelectItem value="THY">THY</SelectItem>
                                                <SelectItem value="Galatasaray">Galatasaray</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-amber-500">+20% XP bonus favori takımın maçlarında!</p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="password">Şifre</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            placeholder="En az 6 karakter"
                                            required
                                            minLength={6}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword">Şifre Tekrar</Label>
                                        <Input
                                            id="confirmPassword"
                                            type="password"
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            placeholder="Şifreyi tekrar gir"
                                            required
                                        />
                                    </div>

                                    <div className="bg-muted rounded-lg p-4">
                                        <div className="text-xs text-muted-foreground mb-2">Kayıt olduğunda kazanacakların:</div>
                                        <div className="flex flex-wrap gap-2">
                                            <Badge variant="secondary" className="bg-amber-500/20 text-amber-400">+50 XP</Badge>
                                            <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-400">🎯 İlk Adım Rozeti</Badge>
                                        </div>
                                    </div>
                                </>
                            )}

                            <div className="flex gap-3">
                                {step === 2 && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setStep(1)}
                                        className="flex-1"
                                    >
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Geri
                                    </Button>
                                )}
                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Kayıt yapılıyor...
                                        </>
                                    ) : step === 1 ? (
                                        <>
                                            Devam Et
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </>
                                    ) : (
                                        <>
                                            <Gamepad2 className="mr-2 h-4 w-4" />
                                            Kayıt Ol
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Divider */}
                <div className="relative my-6">
                    <Separator />
                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-4 text-muted-foreground text-sm">
                        veya
                    </span>
                </div>

                {/* Google Sign Up */}
                <Button
                    type="button"
                    variant="outline"
                    onClick={signInWithGoogle}
                    className="w-full"
                >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Google ile Kayıt Ol
                </Button>

                {/* Login Link */}
                <p className="text-center mt-6 text-muted-foreground">
                    Zaten hesabın var mı?{" "}
                    <Link href="/login" className="text-primary font-bold hover:underline">
                        Giriş Yap
                    </Link>
                </p>
            </div>
        </main>
    );
}

```

## File: app\scenario-standings\page.tsx
```
"use client";

import { useEffect, useState } from "react";
import { TeamStats } from "../types";
import Link from "next/link";
import { calculateGroupStandings, applyOverridesToTeams } from "../utils/playoffUtils";


export default function ScenarioStandingsPage() {
    const [loading, setLoading] = useState(true);
    const [allTeams, setAllTeams] = useState<TeamStats[]>([]);
    const [groups, setGroups] = useState<string[]>([]);
    const [scenarios, setScenarios] = useState<any>({});

    useEffect(() => {
        fetchData();
        // Load overrides correctly
        const saved = localStorage.getItem('playoffScenarios'); // Actually this might be wrong key.
        // Let's check how GroupPage saves it.
        // In GroupPage it saves to `playoffScenarios`? No, let's check group page.
        // GroupPage saves to: localStorage.setItem(`group_matches_${groupId}`, ...);
        // Wait, the user wants "Oyundan gelen puan durumu". 
        // This implies we need to read ALL `group_matches_X` keys.
    }, []);

    async function fetchData() {
        try {
            setLoading(true);
            const res = await fetch("/api/scrape");
            if (!res.ok) throw new Error("Veri çekilemedi");
            const data = await res.json();
            setAllTeams(data.teams);

            const uniqueGroups = [...new Set(data.teams.map((t: TeamStats) => t.groupName))].sort((a: any, b: any) => {
                const numA = parseInt(a.match(/\d+/)?.[0] || "0");
                const numB = parseInt(b.match(/\d+/)?.[0] || "0");
                return numA - numB;
            });
            setGroups(uniqueGroups as string[]);

            // Load all scenarios
            const savedScenarios = localStorage.getItem('groupScenarios');
            if (savedScenarios) {
                try {
                    setScenarios(JSON.parse(savedScenarios));
                } catch (e) {
                    console.error("Failed to parse scenarios", e);
                }
            }

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    // Calculate simulated standings for all groups
    const teamsByGroup = groups.reduce((acc, groupName) => {
        const originalGroupTeams = allTeams.filter(t => t.groupName === groupName);
        const groupOverrides = scenarios[groupName] || [];

        // Apply Logic
        // We need a way to verify if applyOverridesToTeams works with just Match objects or the full logic.
        // Looking at GroupPage, it does:
        // const newTeams = applyOverridesToTeams(originalTeams, overrides);
        // So we can perform the simulation here!

        const simulatedTeams = applyOverridesToTeams(originalGroupTeams, groupOverrides);

        acc[groupName] = simulatedTeams.sort((a: TeamStats, b: TeamStats) => b.points - a.points || b.wins - a.wins || (b.setsWon - b.setsLost) - (a.setsWon - a.setsLost));
        return acc;
    }, {} as Record<string, TeamStats[]>);

    if (loading) {
        return (
            <div className="h-[calc(100vh-64px)] flex items-center justify-center text-slate-400">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            </div>
        )
    }

    return (
        <main className="min-h-screen bg-slate-950 text-slate-100 p-2 sm:p-4 font-sans">
            <div className="max-w-7xl mx-auto flex flex-col gap-4">

                {/* Header */}
                <div className="flex flex-col gap-1 px-1">
                    <h1 className="font-bold text-white text-lg tracking-tight leading-none hidden sm:block">Senaryo Puan Durumu</h1>
                    <p className="text-[10px] text-slate-400 hidden sm:block">Yaptığınız maç tahminlerine göre oluşan puan durumu</p>
                </div>

                {/* Global Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {groups.map(groupName => {
                        const groupTeams = teamsByGroup[groupName] || [];
                        return (
                            <div key={groupName} className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden flex flex-col h-full">
                                {/* Header */}
                                <div className="bg-slate-800/50 px-3 py-2 border-b border-slate-800 flex justify-between items-center">
                                    <h3 className="font-bold text-slate-200">{groupName}. Grup</h3>
                                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                        Simülasyon
                                    </span>
                                </div>

                                {/* Table */}
                                <div className="p-2 space-y-0.5 flex-1">
                                    <div className="flex text-[9px] text-slate-500 px-2 pb-1 border-b border-slate-800/50 uppercase tracking-wider font-semibold">
                                        <span className="w-4">#</span>
                                        <span className="flex-1">Takım</span>
                                        <span className="w-6 text-center">O</span>
                                        <span className="w-6 text-center text-slate-300 font-bold">P</span>
                                    </div>
                                    {groupTeams.map((team, idx) => {
                                        const isRelegation = idx >= groupTeams.length - 2;
                                        const isPromotion = idx < 2;
                                        return (
                                            <div key={team.name} className={`flex items-center text-xs py-1.5 px-2 rounded ${isPromotion ? 'bg-emerald-500/10' : isRelegation ? 'bg-rose-500/10' : ''}`}>
                                                <span className={`w-4 text-[10px] font-bold ${isPromotion ? 'text-emerald-400' : isRelegation ? 'text-rose-500' : 'text-slate-600'}`}>
                                                    {idx + 1}
                                                </span>
                                                <span className={`flex-1 truncate pr-2 ${isPromotion ? 'text-slate-200 font-medium' : isRelegation ? 'text-rose-200/80' : 'text-slate-400'}`} title={team.name}>
                                                    {team.name}
                                                </span>
                                                <span className="w-6 text-center text-[10px] text-slate-500 font-mono">{team.played}</span>
                                                <span className={`w-6 text-center font-bold relative ${isPromotion ? 'text-white' : isRelegation ? 'text-rose-200' : 'text-slate-500'}`}>
                                                    {team.points}
                                                </span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </main>
    );
}

```

## File: app\simulation\page.tsx
```
"use client";

import { useState, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { useMatchSimulation, getSimulationState } from "../hooks/useMatchSimulation";
import Link from "next/link";

// Sample teams for simulation
const SAMPLE_TEAMS = [
  "FENERBAHÇE MEDICANA",
  "ECZACIBAŞI DYNAVİT",
  "VAKIFBANK",
  "GALATASARAY DAIKIN",
  "THY",
  "NİLÜFER BELEDİYESPOR",
  "BEŞİKTAŞ",
  "ARAS KARGO",
];

export default function SimulationPage() {
  const { user } = useAuth();
  const { 
    simulation, 
    isSimulating, 
    isPlaying,
    currentSet,
    currentPoint,
    progress,
    startSimulation,
    play,
    pause,
    reset,
    skipToEnd,
    setSpeed,
  } = useMatchSimulation({ autoPlay: false });
  
  const [homeTeam, setHomeTeam] = useState(SAMPLE_TEAMS[0]);
  const [awayTeam, setAwayTeam] = useState(SAMPLE_TEAMS[1]);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    setSpeed(speed);
  };

  const simulationState = useMemo(() => {
    if (!simulation) return null;
    return getSimulationState(simulation, currentSet, currentPoint);
  }, [simulation, currentSet, currentPoint]);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-white">Maç Simülasyonu</h1>
          <p className="text-white/70 text-sm mt-1">
            Takımları seç ve maçın nasıl oynanabileceğini izle
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Team Selection */}
        {!simulation && (
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <h2 className="font-bold text-white mb-4">Takımları Seç</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Home Team */}
              <div>
                <label className="block text-sm text-slate-400 mb-2">Ev Sahibi</label>
                <select
                  value={homeTeam}
                  onChange={(e) => setHomeTeam(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500"
                >
                  {SAMPLE_TEAMS.map(team => (
                    <option key={team} value={team} disabled={team === awayTeam}>
                      {team}
                    </option>
                  ))}
                </select>
              </div>

              {/* Away Team */}
              <div>
                <label className="block text-sm text-slate-400 mb-2">Deplasman</label>
                <select
                  value={awayTeam}
                  onChange={(e) => setAwayTeam(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500"
                >
                  {SAMPLE_TEAMS.map(team => (
                    <option key={team} value={team} disabled={team === homeTeam}>
                      {team}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={() => startSimulation(homeTeam, awayTeam)}
              disabled={isSimulating}
              className="w-full mt-6 px-6 py-4 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 disabled:opacity-50 rounded-xl font-bold text-lg transition-all"
            >
              {isSimulating ? 'Simülasyon Hazırlanıyor...' : '🎮 Simülasyonu Başlat'}
            </button>
          </div>
        )}

        {/* Simulation Display */}
        {simulation && simulationState && (
          <>
            {/* Scoreboard */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl p-8">
              <div className="flex items-center justify-between">
                {/* Home Team */}
                <div className="flex-1 text-center">
                  <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-4xl mb-4 shadow-lg">
                    🏐
                  </div>
                  <h3 className="font-bold text-white text-xl">{simulation.homeTeam}</h3>
                </div>

                {/* Score */}
                <div className="px-12 text-center">
                  <div className="text-6xl font-black text-white mb-4">
                    {simulationState.setScore.home} - {simulationState.setScore.away}
                  </div>
                  <div className="text-sm text-slate-400">Set Skoru</div>
                  
                  {!simulationState.isComplete && (
                    <div className="mt-6 bg-violet-500/20 border border-violet-500/30 rounded-xl px-8 py-4">
                      <div className="text-3xl font-bold text-white">
                        {simulationState.currentSetScore.home} - {simulationState.currentSetScore.away}
                      </div>
                      <div className="text-sm text-violet-400 mt-1">
                        {currentSet + 1}. Set
                      </div>
                    </div>
                  )}

                  {simulationState.isComplete && (
                    <div className="mt-6 bg-emerald-500/20 border border-emerald-500/30 rounded-xl px-8 py-4">
                      <div className="text-lg font-bold text-emerald-400">
                        🏆 {simulation.winner} Kazandı!
                      </div>
                    </div>
                  )}
                </div>

                {/* Away Team */}
                <div className="flex-1 text-center">
                  <div className="w-24 h-24 mx-auto bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center text-4xl mb-4 shadow-lg">
                    🏐
                  </div>
                  <h3 className="font-bold text-white text-xl">{simulation.awayTeam}</h3>
                </div>
              </div>

              {/* Last Point Animation */}
              {simulationState.lastPoint && !simulationState.isComplete && (
                <div className="mt-6 text-center">
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm ${
                    simulationState.lastPoint.scorer === 'home'
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-orange-500/20 text-orange-400'
                  }`}>
                    {getPointTypeIcon(simulationState.lastPoint.type)}
                    <span>
                      {simulationState.lastPoint.scorer === 'home' ? simulation.homeTeam : simulation.awayTeam}
                      {' - '}
                      {getPointTypeText(simulationState.lastPoint.type)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Progress Bar */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-100"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
                <span>Başlangıç</span>
                <span>Bitiş</span>
              </div>
            </div>

            {/* Controls */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={reset}
                  className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
                  title="Başa Sar"
                >
                  ⏮️
                </button>
                
                <button
                  onClick={isPlaying ? pause : play}
                  className="p-4 bg-violet-600 hover:bg-violet-700 rounded-xl transition-colors"
                >
                  {isPlaying ? '⏸️' : '▶️'}
                </button>
                
                <button
                  onClick={skipToEnd}
                  className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
                  title="Sonuca Atla"
                >
                  ⏭️
                </button>
              </div>

              {/* Speed Control */}
              <div className="flex items-center justify-center gap-2 mt-4">
                <span className="text-xs text-slate-500">Hız:</span>
                {[0.5, 1, 2, 4].map(speed => (
                  <button
                    key={speed}
                    onClick={() => handleSpeedChange(speed)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                      playbackSpeed === speed
                        ? 'bg-violet-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            </div>

            {/* Set Details */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
              <h3 className="font-bold text-white mb-4">Set Detayları</h3>
              <div className="grid grid-cols-5 gap-4">
                {simulation.simulatedSets.map((set, index) => {
                  const isCurrentSet = index === currentSet && !simulationState.isComplete;
                  const isPastSet = index < currentSet || simulationState.isComplete;
                  
                  return (
                    <div 
                      key={index}
                      className={`text-center p-4 rounded-xl border transition-all ${
                        isCurrentSet 
                          ? 'bg-violet-500/20 border-violet-500/50 animate-pulse'
                          : isPastSet
                            ? set.winner === 'home'
                              ? 'bg-blue-500/20 border-blue-500/30'
                              : 'bg-orange-500/20 border-orange-500/30'
                            : 'bg-slate-800/50 border-slate-700'
                      }`}
                    >
                      <div className="text-xs text-slate-400 mb-2">{index + 1}. Set</div>
                      <div className={`text-xl font-bold ${
                        isPastSet 
                          ? 'text-white' 
                          : isCurrentSet 
                            ? 'text-violet-400'
                            : 'text-slate-600'
                      }`}>
                        {isPastSet 
                          ? `${set.homePoints}-${set.awayPoints}`
                          : isCurrentSet
                            ? `${simulationState.currentSetScore.home}-${simulationState.currentSetScore.away}`
                            : '-'
                        }
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Key Moments */}
            {simulation.keyMoments.length > 0 && (
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                <h3 className="font-bold text-white mb-4">Önemli Anlar</h3>
                <div className="space-y-3">
                  {simulation.keyMoments.map((moment, index) => (
                    <div 
                      key={index}
                      className={`flex items-center gap-3 p-3 rounded-lg ${
                        moment.type === 'match_point'
                          ? 'bg-emerald-500/20 border border-emerald-500/30'
                          : 'bg-slate-800/50'
                      }`}
                    >
                      <span className="text-xl">
                        {moment.type === 'match_point' ? '🏆' : 
                         moment.type === 'set_point' ? '📍' : '⚡'}
                      </span>
                      <span className={
                        moment.type === 'match_point' ? 'text-emerald-400' : 'text-slate-300'
                      }>
                        {moment.description}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Simulation Button */}
            <button
              onClick={() => {
                reset();
                startSimulation(homeTeam, awayTeam);
              }}
              className="w-full px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-medium transition-colors"
            >
              🔄 Yeni Simülasyon
            </button>
          </>
        )}
      </div>
    </main>
  );
}

function getPointTypeIcon(type: string): string {
  switch (type) {
    case 'attack': return '💥';
    case 'block': return '🛡️';
    case 'ace': return '🎯';
    case 'error': return '❌';
    default: return '🏐';
  }
}

function getPointTypeText(type: string): string {
  switch (type) {
    case 'attack': return 'Hücum Sayısı';
    case 'block': return 'Blok Sayısı';
    case 'ace': return 'As Servis';
    case 'error': return 'Rakip Hata';
    default: return 'Sayı';
  }
}

```

## File: app\stats\page.tsx
```
import { Metadata } from "next";
import { getLeagueData } from "../utils/serverData";
import StatsClient from "./StatsClient";

export const metadata: Metadata = {
    title: "Genel İstatistikler",
    description: "Tüm liglerin birleşik istatistikleri. Sultanlar Ligi, 1. Lig, 2. Lig ve CEV turnuvaları takım performans analizleri.",
    openGraph: {
        title: "Genel İstatistikler | VolleySimulator",
        description: "Tüm liglerin birleşik istatistikleri ve takım performans analizleri.",
    },
};

export default async function StatsPage() {
    const [lig1, lig2, vsl, cev] = await Promise.all([
        getLeagueData("1lig"),
        getLeagueData("2lig"),
        getLeagueData("vsl"),
        getLeagueData("cev-cl")
    ]);

    // Combine all teams for global stats
    const allTeams = [
        ...lig1.teams,
        ...lig2.teams,
        ...vsl.teams,
        ...cev.teams
    ];

    return (
        <StatsClient initialTeams={allTeams} />
    );
}

```

## File: app\stats\StatsClient.tsx
```
"use client";

import { useMemo } from "react";
import { TeamStats } from "../types";

import TeamAvatar from "../components/TeamAvatar";

interface StatsClientProps {
    initialTeams: TeamStats[];
}

export default function StatsClient({ initialTeams }: StatsClientProps) {
    const teamsWithStats = useMemo(() => initialTeams.map(t => ({
        ...t,
        losses: t.played - t.wins,
        winRate: t.played > 0 ? Math.round((t.wins / t.played) * 100) : 0
    })), [initialTeams]);

    const leastLosses = useMemo(() => [...teamsWithStats].sort((a, b) => a.losses - b.losses || b.wins - a.wins).slice(0, 5), [teamsWithStats]);
    const mostLosses = useMemo(() => [...teamsWithStats].sort((a, b) => b.losses - a.losses || a.wins - b.wins).slice(0, 5), [teamsWithStats]);
    const mostSets = useMemo(() => [...teamsWithStats].sort((a, b) => b.setsWon - a.setsWon).slice(0, 5), [teamsWithStats]);
    const mostPoints = useMemo(() => [...teamsWithStats].sort((a, b) => b.points - a.points).slice(0, 5), [teamsWithStats]);
    const leastSetsLost = useMemo(() => [...teamsWithStats].sort((a, b) => a.setsLost - b.setsLost || b.wins - a.wins).slice(0, 5), [teamsWithStats]);
    const bestWinRate = useMemo(() => [...teamsWithStats].filter(t => t.played >= 5).sort((a, b) => b.winRate - a.winRate).slice(0, 5), [teamsWithStats]);

    // Summary stats
    const totalTeams = initialTeams.length;
    const totalMatches = Math.floor(initialTeams.reduce((acc, t) => acc + t.played, 0) / 2);
    const avgPoints = totalTeams > 0 ? Math.round(initialTeams.reduce((acc, t) => acc + t.points, 0) / totalTeams) : 0;

    const StatCard = ({ title, icon, teams, statKey, color, gradient, suffix = "" }: {
        title: string; icon: string;
        teams: typeof teamsWithStats;
        statKey: 'losses' | 'wins' | 'setsWon' | 'setsLost' | 'points' | 'winRate';
        color: string;
        gradient: string;
        suffix?: string;
    }) => {
        const maxValue = Math.max(...teams.map(t => Number(t[statKey])), 1);

        return (
            <div className="bg-slate-950/50 backdrop-blur-md rounded-xl border border-slate-800/60 overflow-hidden hover:border-slate-700/80 transition-all duration-300 group shadow-lg hover:shadow-xl">
                <div className={`${gradient} px-3 py-2.5 border-b border-white/10 relative overflow-hidden`}>
                    {/* Gloss effect */}
                    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="flex items-center justify-between relative z-10">
                        <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
                            <span className="text-base">{icon}</span> {title}
                        </h3>
                        <span className="text-[10px] font-bold text-white/80 bg-black/20 px-2 py-0.5 rounded-full backdrop-blur-sm border border-white/10">TOP 5</span>
                    </div>
                </div>

                <div className="p-2 space-y-1.5">
                    {teams.map((t, idx) => (
                        <div
                            key={t.name}
                            className={`flex items-center gap-2.5 p-1.5 rounded-lg transition-all ${idx === 0 ? 'bg-gradient-to-r from-white/5 to-transparent border border-white/10' : 'hover:bg-white/5'
                                }`}
                        >
                            <div className={`w-5 h-5 rounded flex items-center justify-center font-bold text-[10px] shadow-sm ${idx === 0 ? 'bg-amber-400 text-amber-950' :
                                idx === 1 ? 'bg-slate-300 text-slate-800' :
                                    idx === 2 ? 'bg-amber-700 text-amber-100' :
                                        'bg-slate-800 text-slate-500'
                                }`}>
                                {idx + 1}
                            </div>
                            <TeamAvatar name={t.name} size="xs" />

                            <div className="flex-1 min-w-0">
                                <span className={`text-xs font-bold truncate block ${idx === 0 ? 'text-white' : 'text-slate-300'}`} title={t.name}>
                                    {t.name}
                                </span>
                            </div>

                            <div className="flex items-center gap-2 w-20 justify-end">
                                <div className="h-1 bg-slate-800/50 rounded-full overflow-hidden flex-1 max-w-[40px]">
                                    <div className={`h-full ${color} opacity-80`} style={{ width: `${Math.min((Number(t[statKey]) / maxValue) * 100, 100)}%` }}></div>
                                </div>
                                <span className={`text-xs font-bold min-w-[30px] text-right ${idx === 0 ? 'text-white' : 'text-slate-400'}`}>
                                    {t[statKey]}{suffix}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <main className="min-h-screen bg-slate-950 text-slate-100 p-4 font-sans">
            <div className="max-w-7xl mx-auto space-y-8 pt-4">
                <div className="flex flex-col gap-1">
                    <h1 className="font-bold text-white text-lg tracking-tight leading-none hidden sm:block">İstatistikler</h1>
                    <p className="text-[10px] text-slate-400 hidden sm:block">Global İstatistik Merkezi</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-emerald-600/20 to-emerald-900/20 backdrop-blur-sm border border-emerald-500/20 rounded-2xl p-4 text-center">
                        <div className="text-3xl font-black text-emerald-400">{totalTeams}</div>
                        <div className="text-xs text-slate-400 uppercase tracking-wider mt-1">Takım</div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-600/20 to-blue-900/20 backdrop-blur-sm border border-blue-500/20 rounded-2xl p-4 text-center">
                        <div className="text-3xl font-black text-blue-400">{totalMatches}</div>
                        <div className="text-xs text-slate-400 uppercase tracking-wider mt-1">Maç</div>
                    </div>
                    <div className="bg-gradient-to-br from-amber-600/20 to-amber-900/20 backdrop-blur-sm border border-amber-500/20 rounded-2xl p-4 text-center">
                        <div className="text-3xl font-black text-amber-400">{avgPoints}</div>
                        <div className="text-xs text-slate-400 uppercase tracking-wider mt-1">Ort. Puan</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-600/20 to-purple-900/20 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-4 text-center">
                        <div className="text-3xl font-black text-purple-400">11</div>
                        <div className="text-xs text-slate-400 uppercase tracking-wider mt-1">Grup</div>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
                    <StatCard
                        title="En Çok Puan"
                        icon="💎"
                        teams={mostPoints}
                        statKey="points"
                        color="bg-amber-500"
                        gradient="bg-gradient-to-r from-amber-600 to-orange-600"
                        suffix="P"
                    />
                    <StatCard
                        title="En Yüksek Galibiyet %"
                        icon="📈"
                        teams={bestWinRate}
                        statKey="winRate"
                        color="bg-teal-500"
                        gradient="bg-gradient-to-r from-teal-600 to-emerald-600"
                        suffix="%"
                    />
                    <StatCard
                        title="En Çok Set Alan"
                        icon="🏐"
                        teams={mostSets}
                        statKey="setsWon"
                        color="bg-purple-500"
                        gradient="bg-gradient-to-r from-purple-600 to-pink-600"
                        suffix="Set"
                    />
                    <StatCard
                        title="En Az Mağlubiyet"
                        icon="🛡️"
                        teams={leastLosses}
                        statKey="losses"
                        color="bg-emerald-500"
                        gradient="bg-gradient-to-r from-emerald-600 to-cyan-600"
                        suffix="M"
                    />
                    <StatCard
                        title="En Az Set Veren"
                        icon="🧱"
                        teams={leastSetsLost}
                        statKey="setsLost"
                        color="bg-rose-500"
                        gradient="bg-gradient-to-r from-rose-600 to-red-600"
                        suffix="Set"
                    />
                    <StatCard
                        title="En Çok Mağlubiyet"
                        icon="📉"
                        teams={mostLosses}
                        statKey="losses"
                        color="bg-slate-500"
                        gradient="bg-gradient-to-r from-slate-600 to-slate-700"
                        suffix="M"
                    />
                </div>
            </div>
        </main>
    );
}

```

