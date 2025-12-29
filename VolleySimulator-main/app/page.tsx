"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-slate-950 text-white font-sans flex flex-col items-center justify-center p-4">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center relative overflow-hidden w-full max-w-4xl py-20 px-4">
        {/* Background Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] bg-emerald-500/20 rounded-full blur-[80px] sm:blur-[100px] -z-0 pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-[200px] h-[200px] sm:w-[400px] sm:h-[400px] bg-indigo-500/10 rounded-full blur-[80px] sm:blur-[100px] -z-0 pointer-events-none"></div>

        <div className="z-10 w-full space-y-8">
          <div className="inline-block px-4 py-1.5 bg-slate-900/50 border border-slate-800 rounded-full text-xs font-bold text-emerald-400 mb-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
            ✨ İnteraktif Voleybol Simülasyonu
          </div>

          <h1 className="text-5xl sm:text-8xl font-black tracking-tighter animate-in fade-in zoom-in-95 duration-700 delay-100 uppercase italic">
            <span className="bg-clip-text text-transparent bg-gradient-to-br from-white via-slate-200 to-slate-500 block">Voleybol Ligi</span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500">Kaderi Sen Yaz!</span>
          </h1>

          <p className="text-base sm:text-xl text-slate-400 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 font-medium">
            Oynanmamış maçlara skor gir, canlı puan tablosunu anlık izle.
            Şampiyonluk ve küme düşme senaryolarını saniyeler içinde oluştur ve paylaş!
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
            <button
              onClick={() => setShowModal(true)}
              className="px-10 py-5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl font-black text-xl shadow-2xl shadow-emerald-500/30 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3 group border-b-4 border-emerald-800"
            >
              <span>HESAPLAMAYA BAŞLA</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>
        </div>
      </section>

      {/* Feature Grid - Minimal */}
      <section className="w-full max-w-7xl mx-auto py-12 px-4 grid grid-cols-1 md:grid-cols-3 gap-6 z-10 opacity-70">
        <FeatureCard icon="⚡" title="Canlı Hesaplama" />
        <FeatureCard icon="🎲" title="Senaryo Modu" />
        <FeatureCard icon="💾" title="Kayıt & Paylaş" />
      </section>

      {/* League Selection Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl max-w-md w-full space-y-8 animate-in zoom-in-95 duration-300 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-white text-2xl transition-colors"
            >
              ✕
            </button>
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-black text-white italic uppercase tracking-tight">Hangi Lig?</h2>
              <p className="text-slate-400 text-sm font-medium">Senaryo oluşturmak istediğiniz ligi seçin</p>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <Link
                href="/1lig/tahminoyunu"
                className="group relative overflow-hidden p-6 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] border-b-4 border-indigo-900"
              >
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex flex-col items-start">
                    <span className="text-white/70 text-xs font-bold uppercase tracking-widest mb-1">KADINLAR</span>
                    <span className="text-white text-3xl font-black italic uppercase">1. LİG</span>
                  </div>
                  <span className="text-4xl group-hover:translate-x-2 transition-transform">🏐</span>
                </div>
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </Link>

              <Link
                href="/2lig/tahminoyunu"
                className="group relative overflow-hidden p-6 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] border-b-4 border-emerald-900"
              >
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex flex-col items-start">
                    <span className="text-white/70 text-xs font-bold uppercase tracking-widest mb-1">KADINLAR</span>
                    <span className="text-white text-3xl font-black italic uppercase">2. LİG</span>
                  </div>
                  <span className="text-4xl group-hover:translate-x-2 transition-transform">🏐</span>
                </div>
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="w-full mt-auto py-8 text-center text-slate-700 text-[10px] font-bold uppercase tracking-widest">
        <p>© 2025 LigTahmin - İnteraktif Voleybol Simülasyonu</p>
      </footer>
    </main>
  );
}

function FeatureCard({ icon, title }: { icon: string, title: string }) {
  return (
    <div className="p-4 bg-slate-900/30 border border-slate-800/50 rounded-xl flex items-center justify-center gap-3 grayscale hover:grayscale-0 transition-all cursor-default">
      <span className="text-2xl">{icon}</span>
      <h3 className="text-sm font-bold text-slate-300 uppercase italic tracking-tight">{title}</h3>
    </div>
  );
}
