"use client";

import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Link from "next/link";

interface TournamentPrediction {
  id: string;
  tournament: string;
  seasonPredictions: {
    champion: string;
    runnerUp: string;
    thirdPlace: string;
    relegated: string[];
    topScorer: string;
  };
  playoffPredictions?: {
    semifinal1: { home: string; away: string; winner: string };
    semifinal2: { home: string; away: string; winner: string };
    final: { home: string; away: string; winner: string };
    thirdPlace: { home: string; away: string; winner: string };
  };
  createdAt: string;
  locked: boolean;
}

const LEAGUES = [
  { id: 'vsl', name: 'Sultanlar Ligi', icon: '👑', color: 'from-amber-600 to-orange-600' },
  { id: '1lig', name: '1. Lig', icon: '🥈', color: 'from-slate-500 to-slate-600' },
  { id: '2lig', name: '2. Lig', icon: '🥉', color: 'from-amber-700 to-amber-800' },
  { id: 'cev-cl', name: 'CEV Şampiyonlar Ligi', icon: '🌟', color: 'from-blue-600 to-indigo-600' },
];

const SAMPLE_TEAMS: Record<string, string[]> = {
  vsl: [
    "FENERBAHÇE MEDICANA", "ECZACIBAŞI DYNAVİT", "VAKIFBANK", "GALATASARAY DAIKIN",
    "THY", "NİLÜFER BELEDİYESPOR", "BEŞİKTAŞ", "ARAS KARGO",
    "KUZEYBORUİSTANBUL", "SIGORTA SHOP", "PTT", "TOKAT BELEDİYE PLEVNE"
  ],
  '1lig': [
    "BURSA BÜYÜKŞEHIR", "AYDIN B.ŞEHİR BEL", "MERSİN", "KARAYOLLARI",
    "ÇANKAYA ÜNİV", "GAZİANTEP", "AKDENİZ ÜNİ", "ANTALYA 07"
  ],
  '2lig': [
    "SAKARYA", "MUĞLA", "İZMİR", "ESKİŞEHİR",
    "KONYA", "TRABZON", "ADANA", "BURSA"
  ],
  'cev-cl': [
    "VAKIFBANK", "ECZACIBAŞI", "FENERBAHÇE", "IMOCO VOLLEY",
    "VERO VOLLEY", "MARITZA PLOVDIV", "DEVELOPRES", "PROSTEJOV"
  ]
};

export default function TournamentPredictionsPage() {
  const { user } = useAuth();
  const [selectedLeague, setSelectedLeague] = useState<string | null>(null);
  const [predictions, setPredictions] = useState<Record<string, TournamentPrediction>>({});
  const [activeTab, setActiveTab] = useState<'season' | 'playoff'>('season');
  
  // Form state
  const [champion, setChampion] = useState("");
  const [runnerUp, setRunnerUp] = useState("");
  const [thirdPlace, setThirdPlace] = useState("");
  const [relegated, setRelegated] = useState<string[]>([]);
  const [topScorer, setTopScorer] = useState("");

  const handleSavePrediction = () => {
    if (!selectedLeague || !champion || !runnerUp || !thirdPlace) return;
    
    const newPrediction: TournamentPrediction = {
      id: `${selectedLeague}-${Date.now()}`,
      tournament: selectedLeague,
      seasonPredictions: {
        champion,
        runnerUp,
        thirdPlace,
        relegated,
        topScorer,
      },
      createdAt: new Date().toISOString(),
      locked: false,
    };
    
    setPredictions(prev => ({
      ...prev,
      [selectedLeague]: newPrediction
    }));
    
    // Reset form
    setChampion("");
    setRunnerUp("");
    setThirdPlace("");
    setRelegated([]);
    setTopScorer("");
    setSelectedLeague(null);
  };

  const toggleRelegated = (team: string) => {
    setRelegated(prev => 
      prev.includes(team) 
        ? prev.filter(t => t !== team)
        : prev.length < 2 ? [...prev, team] : prev
    );
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
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-white">Turnuva Tahminleri</h1>
          <p className="text-white/70 text-sm mt-1">
            Sezon sonu tahminlerini yap ve büyük ödüller kazan!
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Info Card */}
        <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <h3 className="font-bold text-white">Nasıl Çalışır?</h3>
              <p className="text-sm text-slate-300 mt-1">
                Her lig için sezon sonu tahminlerini yap. Şampiyon, ikincilik, üçüncülük ve küme düşecek takımları tahmin et. 
                Playoff aşamasına geçildiğinde playoff tahminleri de yapabilirsin. Doğru tahminler için yüksek puanlar kazan!
              </p>
            </div>
          </div>
        </div>

        {/* League Selection */}
        {!selectedLeague ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {LEAGUES.map(league => {
              const hasPrediction = predictions[league.id];
              return (
                <button
                  key={league.id}
                  onClick={() => setSelectedLeague(league.id)}
                  className={`relative bg-gradient-to-br ${league.color} rounded-2xl p-6 text-left transition-all hover:scale-[1.02] active:scale-[0.98]`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-4xl">{league.icon}</span>
                      <h3 className="font-bold text-white text-xl mt-3">{league.name}</h3>
                    </div>
                    {hasPrediction && (
                      <span className="bg-white/20 px-2 py-1 rounded-lg text-xs font-medium">
                        ✓ Tahmin Yapıldı
                      </span>
                    )}
                  </div>
                  
                  {hasPrediction ? (
                    <div className="mt-4 space-y-1 text-sm text-white/80">
                      <p>🥇 {hasPrediction.seasonPredictions.champion}</p>
                      <p>🥈 {hasPrediction.seasonPredictions.runnerUp}</p>
                      <p>🥉 {hasPrediction.seasonPredictions.thirdPlace}</p>
                    </div>
                  ) : (
                    <p className="mt-4 text-white/70 text-sm">
                      Henüz tahmin yapılmadı
                    </p>
                  )}
                  
                  <div className="absolute bottom-4 right-4 text-white/50 text-2xl">→</div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Back Button */}
            <button
              onClick={() => setSelectedLeague(null)}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              ← Geri Dön
            </button>

            {/* Selected League Header */}
            <div className={`bg-gradient-to-r ${LEAGUES.find(l => l.id === selectedLeague)?.color} rounded-xl p-6`}>
              <div className="flex items-center gap-4">
                <span className="text-4xl">{LEAGUES.find(l => l.id === selectedLeague)?.icon}</span>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {LEAGUES.find(l => l.id === selectedLeague)?.name}
                  </h2>
                  <p className="text-white/70">2024-2025 Sezonu Tahminleri</p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('season')}
                className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                  activeTab === 'season'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                📊 Sezon Sonu
              </button>
              <button
                onClick={() => setActiveTab('playoff')}
                className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                  activeTab === 'playoff'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                🏆 Playoff
              </button>
            </div>

            {/* Season Predictions */}
            {activeTab === 'season' && (
              <div className="space-y-6">
                {/* Champion */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                  <h3 className="flex items-center gap-2 font-bold text-white mb-4">
                    <span className="text-2xl">🥇</span> Şampiyon
                    <span className="ml-auto text-emerald-400 text-sm">+500 puan</span>
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {SAMPLE_TEAMS[selectedLeague]?.map(team => (
                      <button
                        key={team}
                        onClick={() => setChampion(team)}
                        disabled={team === runnerUp || team === thirdPlace || relegated.includes(team)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          champion === team
                            ? 'bg-amber-500 text-white scale-105'
                            : team === runnerUp || team === thirdPlace || relegated.includes(team)
                              ? 'bg-slate-800/50 text-slate-600 cursor-not-allowed'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {team}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Runner Up */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                  <h3 className="flex items-center gap-2 font-bold text-white mb-4">
                    <span className="text-2xl">🥈</span> İkinci
                    <span className="ml-auto text-emerald-400 text-sm">+300 puan</span>
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {SAMPLE_TEAMS[selectedLeague]?.map(team => (
                      <button
                        key={team}
                        onClick={() => setRunnerUp(team)}
                        disabled={team === champion || team === thirdPlace || relegated.includes(team)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          runnerUp === team
                            ? 'bg-slate-400 text-slate-900 scale-105'
                            : team === champion || team === thirdPlace || relegated.includes(team)
                              ? 'bg-slate-800/50 text-slate-600 cursor-not-allowed'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {team}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Third Place */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                  <h3 className="flex items-center gap-2 font-bold text-white mb-4">
                    <span className="text-2xl">🥉</span> Üçüncü
                    <span className="ml-auto text-emerald-400 text-sm">+200 puan</span>
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {SAMPLE_TEAMS[selectedLeague]?.map(team => (
                      <button
                        key={team}
                        onClick={() => setThirdPlace(team)}
                        disabled={team === champion || team === runnerUp || relegated.includes(team)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          thirdPlace === team
                            ? 'bg-amber-700 text-white scale-105'
                            : team === champion || team === runnerUp || relegated.includes(team)
                              ? 'bg-slate-800/50 text-slate-600 cursor-not-allowed'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {team}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Relegated Teams */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                  <h3 className="flex items-center gap-2 font-bold text-white mb-4">
                    <span className="text-2xl">⬇️</span> Küme Düşecekler (2 takım seç)
                    <span className="ml-auto text-emerald-400 text-sm">+150 puan</span>
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {SAMPLE_TEAMS[selectedLeague]?.map(team => (
                      <button
                        key={team}
                        onClick={() => toggleRelegated(team)}
                        disabled={team === champion || team === runnerUp || team === thirdPlace}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          relegated.includes(team)
                            ? 'bg-red-500 text-white scale-105'
                            : team === champion || team === runnerUp || team === thirdPlace
                              ? 'bg-slate-800/50 text-slate-600 cursor-not-allowed'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {team}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Top Scorer */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                  <h3 className="flex items-center gap-2 font-bold text-white mb-4">
                    <span className="text-2xl">⭐</span> Gol Kralı
                    <span className="ml-auto text-emerald-400 text-sm">+100 puan</span>
                  </h3>
                  <input
                    type="text"
                    value={topScorer}
                    onChange={(e) => setTopScorer(e.target.value)}
                    placeholder="Oyuncu adı girin..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Save Button */}
                <button
                  onClick={handleSavePrediction}
                  disabled={!champion || !runnerUp || !thirdPlace}
                  className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold text-lg transition-all"
                >
                  💾 Tahmini Kaydet
                </button>
              </div>
            )}

            {/* Playoff Predictions */}
            {activeTab === 'playoff' && (
              <div className="space-y-6">
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🔒</span>
                    <div>
                      <h3 className="font-bold text-amber-400">Playoff Henüz Başlamadı</h3>
                      <p className="text-sm text-slate-400 mt-1">
                        Playoff eşleşmeleri belli olduğunda burada tahmin yapabileceksiniz.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Playoff Bracket Preview */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                  <h3 className="font-bold text-white mb-6">Playoff Şeması</h3>
                  
                  <div className="flex items-center justify-center gap-8">
                    {/* Semifinals */}
                    <div className="space-y-4">
                      <div className="text-xs text-slate-500 text-center mb-2">Yarı Final</div>
                      <div className="bg-slate-800 rounded-lg p-3 w-40">
                        <div className="text-sm text-slate-400 border-b border-slate-700 pb-2 mb-2">---</div>
                        <div className="text-sm text-slate-400">---</div>
                      </div>
                      <div className="bg-slate-800 rounded-lg p-3 w-40">
                        <div className="text-sm text-slate-400 border-b border-slate-700 pb-2 mb-2">---</div>
                        <div className="text-sm text-slate-400">---</div>
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="text-slate-600 text-2xl">→</div>

                    {/* Final */}
                    <div className="space-y-4">
                      <div className="text-xs text-slate-500 text-center mb-2">Final</div>
                      <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-lg p-3 w-40">
                        <div className="text-sm text-slate-400 border-b border-amber-500/30 pb-2 mb-2">---</div>
                        <div className="text-sm text-slate-400">---</div>
                      </div>
                      <div className="bg-slate-800 rounded-lg p-3 w-40">
                        <div className="text-xs text-slate-500 text-center">3. lük Maçı</div>
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="text-slate-600 text-2xl">→</div>

                    {/* Champion */}
                    <div className="text-center">
                      <div className="text-xs text-slate-500 mb-2">Şampiyon</div>
                      <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                        <span className="text-3xl">🏆</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Point Values Info */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <h3 className="font-bold text-white mb-4">Puan Değerleri</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Şampiyon', points: 500, icon: '🥇' },
              { label: 'İkinci', points: 300, icon: '🥈' },
              { label: 'Üçüncü', points: 200, icon: '🥉' },
              { label: 'Küme Düşen', points: 150, icon: '⬇️' },
              { label: 'Gol Kralı', points: 100, icon: '⭐' },
              { label: 'Yarı Final', points: 100, icon: '🏟️' },
              { label: 'Final', points: 200, icon: '🏆' },
              { label: 'Tam İsabet', points: 1000, icon: '🎯' },
            ].map(item => (
              <div key={item.label} className="bg-slate-800/50 rounded-lg p-3 text-center">
                <span className="text-2xl">{item.icon}</span>
                <div className="text-sm text-slate-400 mt-1">{item.label}</div>
                <div className="text-emerald-400 font-bold">+{item.points}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
