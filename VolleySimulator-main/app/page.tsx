"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? "" : prev + ".");
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen relative flex flex-col items-center justify-center p-4 overflow-hidden bg-slate-950">
      {/* Background with Modern Gradient & Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0a1a] to-black -z-20"></div>
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 -z-10"></div>

      {/* Ambient Light Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[128px] -z-10 animate-pulse-slow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[128px] -z-10 animate-pulse-slow" style={{ animationDelay: '1s' }}></div>

      <div className="relative z-10 text-center max-w-3xl mx-auto space-y-8 p-8">

        {/* Animated Icon */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-500 blur-xl opacity-20 animate-pulse"></div>
            <div className="w-24 h-24 bg-gradient-to-tr from-slate-800 to-slate-900 border border-slate-700 rounded-3xl flex items-center justify-center shadow-2xl relative z-10">
              <span className="text-5xl">🏐</span>
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white mb-2">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
              VolleySimulator
            </span>
          </h1>
          <div className="h-px w-24 mx-auto bg-gradient-to-r from-transparent via-slate-500 to-transparent my-6"></div>
          <h2 className="text-3xl md:text-5xl font-bold text-slate-200">
            Çok Yakında Sizlerle{dots}
          </h2>
        </div>

        {/* Description */}
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Voleybol tutkunları için hazırladığımız yeni nesil simülasyon ve tahmin platformumuzda son hazırlıkları yapıyoruz.
          <br className="hidden md:block" />
          Daha iyi bir deneyim için kısa bir süreliğine bakımdayız.
        </p>

        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900/50 border border-slate-800 rounded-full backdrop-blur-sm mt-8">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="text-sm font-medium text-slate-300">Sistem Güncelleniyor</span>
        </div>

      </div>

      <style jsx>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.1; transform: scale(1); }
          50% { opacity: 0.2; transform: scale(1.1); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
      `}</style>
    </main>
  );
}
