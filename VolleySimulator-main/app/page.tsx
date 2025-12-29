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
    <main className="min-h-screen relative flex flex-col items-center justify-center p-4 overflow-hidden">
      {/* Background with Modern Gradient & Pattern (Matches Login Page) */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0a1a] to-black -z-20"></div>
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20 -z-10"></div>

      {/* Ambient Light Effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-[128px] -z-10"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-[128px] -z-10"></div>

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col items-center text-center w-full max-w-5xl">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-xs font-bold tracking-widest uppercase mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          ✨ 2025/2026 Sezonu Hazır
        </div>

        <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-6 animate-in fade-in zoom-in-95 duration-700 delay-100">
          <span className="block text-white">VOLEYBOL LİGİ</span>
          <span className="block bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-200 to-cyan-400">
            KADERİ SEN YAZ
          </span>
        </h1>

        <p className="text-lg md:text-2xl text-slate-400 max-w-2xl mx-auto mb-10 font-light leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
          Gerçek fikstür üzerinden maçları tahmin et, puan durumunu anlık gör.
          <span className="text-white font-medium"> Şampiyonluk</span> ve <span className="text-white font-medium">Küme Düşme</span> senaryolarını saniyeler içinde hesapla.
        </p>

        <div className="flex flex-col sm:flex-row gap-5 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
          <button
            onClick={() => setShowModal(true)}
            className="group relative px-8 py-4 bg-white text-slate-950 font-black text-lg rounded-2xl overflow-hidden hover:scale-105 transition-transform"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <span className="relative z-10 flex items-center gap-2 group-hover:text-white transition-colors">
              HESAPLAMAYA BAŞLA
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </span>
          </button>

          <Link href="/login" className="px-8 py-4 bg-slate-900/50 backdrop-blur-sm border border-slate-700 text-white font-bold text-lg rounded-2xl hover:bg-slate-800 transition-colors flex items-center gap-2">
            <span>GİRİŞ YAP</span>
          </Link>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 w-full max-w-5xl z-10 opacity-80">
        <FeatureCard
          icon="⚡"
          title="Canlı Simülasyon"
          desc="Maç skorlarını gir, puan tablosunun değişimini anında izle."
        />
        <FeatureCard
          icon="🏆"
          title="Play-Off Analizi"
          desc="Sultanlar Ligi'ne kim çıkacak? Olasılıkları hesapla."
        />
        <FeatureCard
          icon="📉"
          title="Düşme Hattı"
          desc="Ligden düşme ihtimali olan takımların kaderini belirle."
        />
      </div>

      {/* Glassmorphism Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-lg animate-in fade-in duration-300">
          <div
            className="relative w-full max-w-xl bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Decorative gradients inside modal */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-[64px] -z-10"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-[64px] -z-10"></div>

            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-3xl font-black text-white mb-2">LİGİNİ SEÇ</h2>
                <p className="text-slate-400">Hangi lig üzerinde tahmin yapmak istiyorsun?</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="grid gap-4">
              <Link
                href="/1lig/tahminoyunu"
                className="group relative p-6 bg-gradient-to-br from-indigo-900/50 to-slate-900/50 border border-indigo-500/30 hover:border-indigo-400 rounded-2xl transition-all hover:shadow-[0_0_30px_rgba(99,102,241,0.3)] hover:-translate-y-1"
              >
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-emerald-400 text-xs font-bold tracking-widest uppercase mb-1">2025/2026</span>
                    <span className="text-2xl font-black text-white group-hover:text-indigo-300 transition-colors">1. LİG KADINLAR</span>
                  </div>
                  <span className="text-4xl grayscale group-hover:grayscale-0 transition-all scale-90 group-hover:scale-110">🏐</span>
                </div>
              </Link>

              <Link
                href="/2lig/tahminoyunu"
                className="group relative p-6 bg-gradient-to-br from-emerald-900/50 to-slate-900/50 border border-emerald-500/30 hover:border-emerald-400 rounded-2xl transition-all hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:-translate-y-1"
              >
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-teal-400 text-xs font-bold tracking-widest uppercase mb-1">2025/2026</span>
                    <span className="text-2xl font-black text-white group-hover:text-emerald-300 transition-colors">2. LİG KADINLAR</span>
                  </div>
                  <span className="text-4xl grayscale group-hover:grayscale-0 transition-all scale-90 group-hover:scale-110">🏐</span>
                </div>
              </Link>
            </div>
          </div>
          {/* Click outside to close */}
          <div className="absolute inset-0 z-[-1]" onClick={() => setShowModal(false)}></div>
        </div>
      )}

      {/* Simple Footer */}
      <footer className="fixed bottom-4 text-center text-slate-600 text-[10px] font-bold uppercase tracking-widest mix-blend-plus-lighter">
        VolleySimulator 2025
      </footer>
    </main>
  );
}

function FeatureCard({ icon, title, desc }: { icon: string, title: string, desc: string }) {
  return (
    <div className="p-6 bg-slate-900/30 backdrop-blur-sm border border-white/5 rounded-2xl hover:bg-slate-900/50 transition-colors">
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
      <p className="text-sm text-slate-400 leading-snug">{desc}</p>
    </div>
  );
}
