"use client";

import { useState, useEffect } from "react";
import { useGameState } from "../utils/gameState";
import { useToast } from "../components/Toast";
import TutorialModal from "../components/TutorialModal";

// Theme handling inline since we need to update document
function useLocalTheme() {
    const [theme, setThemeState] = useState<'dark' | 'light'>('dark');

    useEffect(() => {
        const saved = localStorage.getItem('theme') as 'dark' | 'light' | null;
        if (saved) {
            setThemeState(saved);
        }
    }, []);

    const setTheme = (newTheme: 'dark' | 'light') => {
        setThemeState(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
    };

    return { theme, setTheme };
}

export default function AyarlarPage() {
    const { gameState, toggleSound } = useGameState();
    const { showToast } = useToast();
    const { theme, setTheme } = useLocalTheme();

    const [notifications, setNotifications] = useState(true);
    const [showTutorial, setShowTutorial] = useState(false);

    const handleResetData = () => {
        if (confirm("Tüm oyun verileriniz (XP, seviye, başarımlar, tahminler) silinecek. Bu işlem geri alınamaz. Emin misiniz?")) {
            localStorage.removeItem('volleySimGameState');
            localStorage.removeItem('cevclGroupScenarios');
            localStorage.removeItem('cevclPlayoffScenarios');
            showToast("Tüm veriler sıfırlandı. Sayfa yenileniyor...", "success");
            setTimeout(() => window.location.reload(), 1000);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950">
            {/* Header with Navigation */}
            <div className="bg-gradient-to-r from-cyan-900/50 to-slate-900/50 border-b border-slate-800 px-4 py-4">
                <div className="max-w-2xl mx-auto">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div>
                            <h1 className="text-xl font-bold text-white">Ayarlar</h1>
                            <p className="text-slate-400 text-xs">Uygulama tercihlerini yönetin</p>
                        </div>

                        {/* Navigation */}
                        <div className="flex items-center gap-2">
                            <a
                                href="/cev-cl/tahminoyunu"
                                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold rounded-lg transition-all border border-slate-700"
                            >
                                Tahmin
                            </a>
                            <a
                                href="/cev-cl/playoffs"
                                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold rounded-lg transition-all border border-slate-700"
                            >
                                Playoffs
                            </a>
                            <a
                                href="/ayarlar"
                                className="px-3 py-1.5 bg-cyan-600 text-white text-xs font-bold rounded-lg"
                            >
                                Ayarlar
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">

                {/* Sound Settings */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                    <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Ses Ayarları</h2>

                    <div className="flex items-center justify-between">
                        <div>
                            <div className="font-medium text-white">Ses Efektleri</div>
                            <div className="text-xs text-slate-500">Tahmin ve başarım sesleri</div>
                        </div>
                        <button
                            onClick={toggleSound}
                            className={`w-14 h-7 rounded-full transition-all relative ${gameState.soundEnabled ? 'bg-blue-600' : 'bg-slate-700'
                                }`}
                        >
                            <div className={`w-6 h-6 bg-white rounded-full shadow-md absolute top-0.5 transition-transform ${gameState.soundEnabled ? 'translate-x-7' : 'translate-x-0.5'
                                }`} />
                        </button>
                    </div>
                </div>

                {/* Display Settings */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                    <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Görünüm</h2>

                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <div className="font-medium text-white">Tema</div>
                            <div className="text-xs text-slate-500">Uygulama renk teması</div>
                        </div>
                        <select
                            value={theme}
                            onChange={(e) => setTheme(e.target.value as 'dark' | 'light')}
                            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                        >
                            <option value="dark">Koyu</option>
                            <option value="light">Açık</option>
                        </select>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <div className="font-medium text-white">Bildirimler</div>
                            <div className="text-xs text-slate-500">Uygulama içi bildirimler</div>
                        </div>
                        <button
                            onClick={() => setNotifications(!notifications)}
                            className={`w-14 h-7 rounded-full transition-all relative ${notifications ? 'bg-blue-600' : 'bg-slate-700'
                                }`}
                        >
                            <div className={`w-6 h-6 bg-white rounded-full shadow-md absolute top-0.5 transition-transform ${notifications ? 'translate-x-7' : 'translate-x-0.5'
                                }`} />
                        </button>
                    </div>
                </div>

                {/* Data Management */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                    <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Veri Yönetimi</h2>

                    <div className="space-y-3">
                        <button
                            onClick={handleResetData}
                            className="w-full flex items-center justify-between p-3 bg-slate-800 hover:bg-rose-900/50 rounded-lg transition-colors group"
                        >
                            <div className="text-left">
                                <div className="font-medium text-white group-hover:text-rose-400">Verileri Sıfırla</div>
                                <div className="text-xs text-slate-500 group-hover:text-rose-400/70">Tüm tahminleri ve ilerlemeyi sil</div>
                            </div>
                            <span className="text-rose-400">✕</span>
                        </button>
                    </div>
                </div>

                {/* Help Section */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                    <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Yardım</h2>

                    <div className="space-y-3">
                        <button
                            onClick={() => setShowTutorial(true)}
                            className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-blue-900/30 to-blue-800/10 hover:from-blue-800/40 hover:to-blue-700/20 border border-blue-600/30 hover:border-blue-500/50 rounded-lg transition-all group"
                        >
                            <div className="text-left">
                                <div className="font-medium text-white group-hover:text-blue-300">Uygulama Rehberi</div>
                                <div className="text-xs text-slate-500">Nasıl kullanılacağını öğrenin</div>
                            </div>
                            <span className="text-blue-400">İ</span>
                        </button>
                    </div>
                </div>

                {/* App Info */}
                <div className="text-center py-4">
                    <div className="text-slate-500 text-xs">CEV CL Simulator v1.0.0</div>
                    <div className="text-slate-600 text-xs mt-1">© 2025 Tüm hakları saklıdır</div>
                </div>
            </div>

            {/* Tutorial Modal */}
            <TutorialModal isOpen={showTutorial} onClose={() => setShowTutorial(false)} />
        </div>
    );
}
