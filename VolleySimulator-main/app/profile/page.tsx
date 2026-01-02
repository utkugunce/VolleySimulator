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
