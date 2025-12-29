"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { useGameState, ACHIEVEMENTS, getLevelTitle, getXPForNextLevel } from "../utils/gameState";
import { LEVEL_THRESHOLDS } from "../types";

export default function ProfilePage() {
    const router = useRouter();
    const { user, loading: authLoading, signOut } = useAuth();
    const { gameState, toggleSound, setFavoriteTeam } = useGameState();
    const { progress, required, percentage } = getXPProgress(gameState);

    function getXPProgress(state: typeof gameState) {
        const currentLevelXP = LEVEL_THRESHOLDS[state.level - 1] || 0;
        const nextLevelXP = getXPForNextLevel(state.level);
        const progress = state.xp - currentLevelXP;
        const required = nextLevelXP - currentLevelXP;
        return { progress, required, percentage: (progress / required) * 100 };
    }

    // Calculate accuracy
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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-slate-950 text-slate-100 p-4 font-sans">
            <div className="max-w-4xl mx-auto space-y-6">

                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                        Oyuncu Profili
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                        {user ? user.email : 'Giriş yapmadınız'}
                    </p>
                </div>

                {/* Auth Status */}
                {user ? (
                    <div className="bg-emerald-900/20 border border-emerald-600/30 rounded-xl p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
                                {user.user_metadata?.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                            </div>
                            <div>
                                <div className="font-bold text-white">{user.user_metadata?.name || 'Oyuncu'}</div>
                                <div className="text-xs text-emerald-400">{user.email}</div>
                            </div>
                        </div>
                        <button
                            onClick={handleSignOut}
                            className="px-4 py-2 bg-slate-800 hover:bg-rose-900/50 text-slate-400 hover:text-rose-400 text-sm font-bold rounded-lg transition-all"
                        >
                            Çıkış Yap
                        </button>
                    </div>
                ) : (
                    <div className="bg-amber-900/20 border border-amber-600/30 rounded-xl p-4 flex items-center justify-between">
                        <div className="text-amber-400 text-sm">
                            Giriş yaparak ilerlemenizi kaydedin!
                        </div>
                        <a
                            href="/login"
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-lg transition-all"
                        >
                            Giriş Yap
                        </a>
                    </div>
                )}

                {/* Main Stats Card */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700 p-6 shadow-xl">
                    <div className="flex flex-col md:flex-row items-center gap-6">

                        {/* Avatar & Level */}
                        <div className="flex flex-col items-center">
                            <div className="relative">
                                <div className="w-28 h-28 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-xl shadow-amber-500/30">
                                    <span className="text-5xl font-black text-white">{gameState.level}</span>
                                </div>
                                {gameState.favoriteTeam && (
                                    <div className="absolute -bottom-2 -right-2 bg-rose-600 rounded-full p-1.5 border-4 border-slate-900">
                                        <span className="text-sm">❤️</span>
                                    </div>
                                )}
                            </div>
                            <div className="mt-3 text-center">
                                <div className="text-lg font-black text-amber-400">{getLevelTitle(gameState.level)}</div>
                                <div className="text-xs text-slate-500">Seviye {gameState.level}</div>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
                            <StatBox icon="⚡" label="Toplam XP" value={gameState.xp.toLocaleString()} color="amber" />
                            <StatBox icon="🎯" label="Tahmin" value={gameState.stats.totalPredictions} color="blue" />
                            <StatBox icon="📈" label="İsabet" value={`${accuracy}%`} color="emerald" />
                            <StatBox icon="🔥" label="En İyi Seri" value={gameState.stats.bestStreak} color="orange" />
                        </div>
                    </div>

                    {/* XP Progress */}
                    <div className="mt-6">
                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                            <span>Seviye {gameState.level}</span>
                            <span>Seviye {gameState.level + 1}</span>
                        </div>
                        <div className="h-4 bg-slate-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 transition-all duration-700 relative"
                                style={{ width: `${Math.min(percentage, 100)}%` }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                            </div>
                        </div>
                        <div className="text-center mt-2 text-sm text-slate-500">
                            {progress.toLocaleString()} / {required.toLocaleString()} XP
                        </div>
                    </div>
                </div>

                {/* Favorite Team */}
                {gameState.favoriteTeam && (
                    <div className="bg-gradient-to-r from-rose-900/30 to-pink-900/30 rounded-xl border border-rose-600/30 p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">❤️</span>
                            <div>
                                <div className="text-xs text-rose-400 uppercase tracking-wider font-bold">Favori Takım</div>
                                <div className="text-lg font-bold text-white">{gameState.favoriteTeam}</div>
                            </div>
                        </div>
                        <div className="bg-amber-500 text-black text-xs font-black px-3 py-1 rounded-full">
                            +20% XP
                        </div>
                    </div>
                )}

                {/* Detailed Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-900/80 rounded-xl border border-slate-700 p-4">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <span>📊</span> İstatistikler
                        </h3>
                        <div className="space-y-3">
                            <StatRow label="Toplam Tahmin" value={gameState.stats.totalPredictions} />
                            <StatRow label="Doğru Tahmin" value={gameState.stats.correctPredictions} />
                            <StatRow label="Mevcut Seri" value={gameState.stats.currentStreak} highlight={gameState.stats.currentStreak > 0} />
                            <StatRow label="En İyi Seri" value={gameState.stats.bestStreak} />
                        </div>
                    </div>

                    <div className="bg-slate-900/80 rounded-xl border border-slate-700 p-4">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <span>⚙️</span> Ayarlar
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/50 transition-colors">
                                <span className="text-sm text-slate-300">Ses Efektleri</span>
                                <button
                                    onClick={toggleSound}
                                    className={`w-12 h-6 rounded-full transition-all ${gameState.soundEnabled
                                            ? 'bg-emerald-600'
                                            : 'bg-slate-700'
                                        }`}
                                >
                                    <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform ${gameState.soundEnabled ? 'translate-x-6' : 'translate-x-0.5'
                                        }`} />
                                </button>
                            </div>
                            {gameState.favoriteTeam && (
                                <button
                                    onClick={() => setFavoriteTeam(null)}
                                    className="w-full p-2 text-sm text-rose-400 hover:bg-rose-900/30 rounded-lg transition-colors text-left"
                                >
                                    ❌ Favori takımı kaldır
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Achievements Grid */}
                <div className="bg-slate-900/80 rounded-xl border border-slate-700 p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                            <span>🏆</span> Başarılar
                        </h3>
                        <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-1 rounded-full font-bold">
                            {unlockedCount}/{allAchievements.length}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {allAchievements.map(achievement => {
                            const isUnlocked = gameState.achievements.some(a => a.id === achievement.id);
                            const unlockedData = gameState.achievements.find(a => a.id === achievement.id);

                            return (
                                <div
                                    key={achievement.id}
                                    className={`p-3 rounded-xl border text-center transition-all ${isUnlocked
                                            ? 'bg-gradient-to-br from-amber-900/30 to-orange-900/30 border-amber-600/50'
                                            : 'bg-slate-800/50 border-slate-700/50 opacity-50'
                                        }`}
                                >
                                    <div className={`text-3xl mb-2 ${!isUnlocked && 'grayscale'}`}>
                                        {achievement.icon}
                                    </div>
                                    <div className="text-xs font-bold text-white truncate">{achievement.name}</div>
                                    <div className="text-[10px] text-amber-400 font-bold mt-1">
                                        +{achievement.xpReward} XP
                                    </div>
                                    {isUnlocked && unlockedData?.unlockedAt && (
                                        <div className="text-[8px] text-slate-500 mt-1">
                                            {new Date(unlockedData.unlockedAt).toLocaleDateString('tr-TR')}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Back Button */}
                <div className="text-center">
                    <a
                        href="/1lig/tahminoyunu"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-600/20"
                    >
                        <span>🎮</span> Tahmin Oyununa Dön
                    </a>
                </div>

            </div>
        </main>
    );
}

// Helper Components
function StatBox({ icon, label, value, color }: { icon: string; label: string; value: string | number; color: string }) {
    const colorClasses: Record<string, string> = {
        amber: 'from-amber-900/40 to-amber-800/20 border-amber-600/30',
        blue: 'from-blue-900/40 to-blue-800/20 border-blue-600/30',
        emerald: 'from-emerald-900/40 to-emerald-800/20 border-emerald-600/30',
        orange: 'from-orange-900/40 to-orange-800/20 border-orange-600/30',
    };

    return (
        <div className={`bg-gradient-to-br ${colorClasses[color]} rounded-xl border p-3 text-center`}>
            <div className="text-xl mb-1">{icon}</div>
            <div className="text-xl font-black text-white">{value}</div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">{label}</div>
        </div>
    );
}

function StatRow({ label, value, highlight = false }: { label: string; value: string | number; highlight?: boolean }) {
    return (
        <div className="flex justify-between items-center p-2 rounded-lg bg-slate-800/30">
            <span className="text-sm text-slate-400">{label}</span>
            <span className={`font-bold ${highlight ? 'text-orange-400' : 'text-white'}`}>{value}</span>
        </div>
    );
}
