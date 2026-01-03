"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useGameState } from "../utils/gameState";
import { useToast } from "../components/Toast";

const TutorialModal = dynamic(() => import("../components/TutorialModal"), {
    loading: () => null,
    ssr: false,
});

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
    const { user } = useAuth();
    const { gameState, toggleSound } = useGameState();
    const { showToast } = useToast();
    const { theme, setTheme } = useLocalTheme();

    const [notifications, setNotifications] = useState(true);
    const [showTutorial, setShowTutorial] = useState(false);

    const handleResetData = () => {
        if (confirm("Tüm oyun verileriniz (XP, seviye, başarımlar, tahminler) silinecek. Bu işlem geri alınamaz. Emin misiniz?")) {
            // Clear all game-related localStorage
            localStorage.removeItem('volleySimGameState');
            localStorage.removeItem('1ligGroupScenarios');
            localStorage.removeItem('groupScenarios');
            localStorage.removeItem('playoffScenarios');
            showToast("Tüm veriler sıfırlandı. Sayfa yenileniyor...", "success");
            // Reload to reset React state
            setTimeout(() => window.location.reload(), 1000);
        }
    };

    const handleExportData = () => {
        try {
            const exportData = {
                gameState: gameState,
                lig1Scenarios: JSON.parse(localStorage.getItem('1ligGroupScenarios') || '{}'),
                lig2Scenarios: JSON.parse(localStorage.getItem('groupScenarios') || '{}'),
                exportDate: new Date().toISOString()
            };
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
            const a = document.createElement('a');
            a.href = dataStr;
            a.download = `volleysimulator-backup-${new Date().toLocaleDateString('tr-TR')}.json`;
            a.click();
            showToast("Veriler indirildi", "success");
        } catch (e) {
            showToast("Hata oluştu", "error");
        }
    };

    return (
        <div className="min-h-screen bg-slate-950">
            {/* Header */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 px-4 py-6 border-b border-slate-800">
                <div className="max-w-2xl mx-auto">
                    <h1 className="text-2xl font-bold text-white">Ayarlar</h1>
                    <p className="text-slate-400 text-sm mt-1">Uygulama tercihlerini yönetin</p>
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
                            title="Ses Efektlerini Aç/Kapat"
                            className={`w-14 h-7 rounded-full transition-all relative ${gameState.soundEnabled ? 'bg-emerald-600' : 'bg-slate-700'
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
                            title="Tema Seçin"
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
                            title="Bildirimleri Aç/Kapat"
                            className={`w-14 h-7 rounded-full transition-all relative ${notifications ? 'bg-emerald-600' : 'bg-slate-700'
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
                            onClick={handleExportData}
                            className="w-full flex items-center justify-between p-3 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                        >
                            <div className="text-left">
                                <div className="font-medium text-white">Verileri İndir</div>
                                <div className="text-xs text-slate-500">Tüm tahminler ve ilerleme</div>
                            </div>
                            <span className="text-emerald-400">↓</span>
                        </button>

                        <button
                            onClick={handleResetData}
                            className="w-full flex items-center justify-between p-3 bg-slate-800 hover:bg-rose-900/50 rounded-lg transition-colors group"
                        >
                            <div className="text-left">
                                <div className="font-medium text-white group-hover:text-rose-400">Verileri Sıfırla</div>
                                <div className="text-xs text-slate-500 group-hover:text-rose-400/70">Tüm ilerlemeyi sil</div>
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
                            className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-emerald-900/30 to-emerald-800/10 hover:from-emerald-800/40 hover:to-emerald-700/20 border border-emerald-600/30 hover:border-emerald-500/50 rounded-lg transition-all group"
                        >
                            <div className="text-left">
                                <div className="font-medium text-white group-hover:text-emerald-300">Uygulama Rehberi</div>
                                <div className="text-xs text-slate-500">Nasıl kullanılacağını öğrenin</div>
                            </div>
                            <span className="text-emerald-400">İ</span>
                        </button>

                        <button
                            onClick={() => {
                                localStorage.removeItem('tutorialCompleted');
                                setShowTutorial(true);
                            }}
                            className="w-full flex items-center justify-between p-3 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                        >
                            <div className="text-left">
                                <div className="font-medium text-white">Rehberi Sıfırla</div>
                                <div className="text-xs text-slate-500">Rehberi baştan göster</div>
                            </div>
                            <span className="text-cyan-400">↻</span>
                        </button>
                    </div>
                </div>

                {/* Account Info */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                    <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Hesap</h2>

                    {user ? (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                                <span className="text-slate-400 text-sm">E-posta</span>
                                <span className="text-white text-sm">{user.email}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                                <span className="text-slate-400 text-sm">Hesap Türü</span>
                                <span className="text-emerald-400 text-sm">Kayıtlı Kullanıcı</span>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center p-4">
                            <p className="text-slate-400 text-sm mb-3">Giriş yaparak verilerinizi kaydedin</p>
                            <a
                                href="/login"
                                className="inline-block px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-lg transition-colors"
                            >
                                Giriş Yap
                            </a>
                        </div>
                    )}
                </div>

                {/* App Info */}
                <div className="text-center py-4">
                    <div className="text-slate-500 text-xs">VolleySimulator v1.0.0</div>
                    <div className="text-slate-600 text-xs mt-1">© 2025 Tüm hakları saklıdır</div>
                </div>
            </div>

            {/* Tutorial Modal */}
            <TutorialModal isOpen={showTutorial} onClose={() => setShowTutorial(false)} />
        </div>
    );
}
