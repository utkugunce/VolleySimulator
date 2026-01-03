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
