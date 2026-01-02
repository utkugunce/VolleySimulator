"use client";

import Link from "next/link";
import { useAuth } from "./context/AuthContext";

export default function Home() {
  const { user } = useAuth();

  return (
    <main className="min-h-screen relative flex flex-col items-center justify-center p-4 overflow-hidden">
      {/* Background with Modern Gradient & Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0a1a] to-black -z-20"></div>
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20 -z-10"></div>

      {/* Floating Particles Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-5">
        <div className="absolute top-[10%] left-[15%] w-2 h-2 bg-emerald-400/30 rounded-full animate-float delay-0"></div>
        <div className="absolute top-[20%] right-[20%] w-3 h-3 bg-teal-400/20 rounded-full animate-float-slow delay-500"></div>
        <div className="absolute top-[60%] left-[10%] w-1.5 h-1.5 bg-cyan-400/30 rounded-full animate-float delay-1000"></div>
        <div className="absolute top-[40%] right-[10%] w-2 h-2 bg-emerald-500/20 rounded-full animate-float-slow delay-1500"></div>
        <div className="absolute bottom-[30%] left-[25%] w-2.5 h-2.5 bg-amber-400/20 rounded-full animate-float delay-2000"></div>
        <div className="absolute bottom-[20%] right-[30%] w-1.5 h-1.5 bg-orange-400/30 rounded-full animate-float-slow delay-2500"></div>
      </div>

      {/* Ambient Light Effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-[128px] -z-10 animate-pulse-glow"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-[128px] -z-10"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-500/5 rounded-full blur-[200px] -z-10"></div>

      <div className="w-full max-w-4xl mx-auto relative z-10 space-y-10">
        {/* Hero Section */}
        <div className="text-center space-y-6 animate-fade-in-up">
          <div className="inline-block">
            <span className="text-5xl md:text-6xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400">
              VolleySimulator
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-light text-slate-300 max-w-2xl mx-auto">
            Voleybol tutkunları için <span className="font-semibold text-white">yeni nesil simülasyon</span> ve tahmin platformu
          </h2>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            {user ? (
              <Link
                href="/ligler"
                className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-2"
              >
                <span>Oyuna Başla</span>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-2"
                >
                  <span>Giriş Yap</span>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
                <Link
                  href="/register"
                  className="px-8 py-4 bg-slate-800/80 border border-slate-600 text-white font-bold rounded-2xl hover:bg-slate-700/80 hover:border-slate-500 hover:scale-105 active:scale-95 transition-all duration-200"
                >
                  Kayıt Ol
                </Link>
              </>
            )}
          </div>
        </div>

        {/* League Cards removed as per request */}

        {/* Features Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in-up delay-400">
          <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-700/50 p-5 rounded-2xl hover:border-emerald-500/30 transition-all duration-300 hover:scale-[1.02] card-shine">
            <h3 className="font-bold text-white mb-1">Tahmin Oyunu</h3>
            <p className="text-xs text-slate-400">Maç skorlarını tahmin et, puanları topla</p>
          </div>
          <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-700/50 p-5 rounded-2xl hover:border-emerald-500/30 transition-all duration-300 hover:scale-[1.02] card-shine">
            <h3 className="font-bold text-white mb-1">Detaylı Analiz</h3>
            <p className="text-xs text-slate-400">Takım form durumları ve istatistikler</p>
          </div>
          <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-700/50 p-5 rounded-2xl hover:border-emerald-500/30 transition-all duration-300 hover:scale-[1.02] card-shine">
            <h3 className="font-bold text-white mb-1">Canlı Skor</h3>
            <p className="text-xs text-slate-400">Anlık maç sonuçları ve güncellemeler</p>
          </div>
          <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-700/50 p-5 rounded-2xl hover:border-emerald-500/30 transition-all duration-300 hover:scale-[1.02] card-shine">
            <h3 className="font-bold text-white mb-1">Topluluk</h3>
            <p className="text-xs text-slate-400">Diğer kullanıcılarla yarış</p>
          </div>
        </div>

        {/* Browse without login link */}
        {!user && (
          <div className="text-center animate-fade-in-up delay-600">
            <Link href="/1lig/tahminoyunu" className="text-slate-500 text-sm hover:text-slate-300 transition-colors inline-flex items-center gap-1 group">
              Giriş yapmadan siteye göz at
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
        )}
      </div>

      <style jsx>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.6s ease-out forwards;
                    opacity: 0;
                }
            `}</style>
    </main>
  );
}
