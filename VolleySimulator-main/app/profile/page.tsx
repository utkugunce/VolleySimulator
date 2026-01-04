"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { useGameState, ACHIEVEMENTS, getLevelTitle, getXPForNextLevel } from "../utils/gameState";
import { LEVEL_THRESHOLDS } from "../types";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Skeleton } from "../components/ui/Skeleton";
import { motion } from "framer-motion";
import { LogOut, Trophy, Zap, Target, TrendingUp, Settings as SettingsIcon, Heart, Home, Edit2 } from "lucide-react";
import { cn } from "@/lib/utils";

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
            <main className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Zap className="w-12 h-12 text-primary animate-pulse shadow-glow-primary" />
                    <span className="text-xs font-black uppercase tracking-widest text-text-muted">Profil Yükleniyor</span>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-background text-text-primary p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500">
            <div className="max-w-2xl mx-auto space-y-6">

                {/* Profile Header Block */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Card className="relative overflow-hidden border-border-main/50 bg-surface-primary/50 shadow-premium-lg">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 blur-[64px] -z-10" />
                        <CardContent className="p-6">
                            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                                {/* Large Avatar/Level Badge */}
                                <div className="relative group">
                                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary via-primary-dark to-black flex flex-col items-center justify-center shadow-glow-primary transition-transform duration-500 group-hover:rotate-3">
                                        <span className="text-[10px] font-black text-white/50 uppercase tracking-tighter -mb-1">LVL</span>
                                        <span className="text-4xl font-black text-white italic">{gameState.level}</span>
                                    </div>
                                    <div className="absolute -bottom-2 -right-2">
                                        <Badge variant="success" className="h-6 w-6 rounded-full flex items-center justify-center p-0 border-2 border-surface-primary ring-2 ring-emerald-500/20">
                                            <TrendingUp className="w-3.5 h-3.5" />
                                        </Badge>
                                    </div>
                                </div>

                                {/* User Meta Info */}
                                <div className="flex-1 text-center sm:text-left space-y-2">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                        <h1 className="text-2xl font-black tracking-tight text-text-primary uppercase italic">
                                            {user?.user_metadata?.name || 'Voleybol Tutkunu'}
                                        </h1>
                                        <Badge variant="outline" className="text-[10px] font-black tracking-widest text-primary border-primary/20 bg-primary/5 self-center sm:self-auto italic">
                                            {getLevelTitle(gameState.level)}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-text-secondary font-medium">
                                        {user?.email || 'Anonim Hesap'}
                                    </p>

                                    {/* XP Progress Bar */}
                                    <div className="pt-2">
                                        <div className="flex justify-between items-end mb-1.5">
                                            <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Tecrübe (XP)</span>
                                            <span className="text-[10px] font-black text-text-primary">{gameState.xp.toLocaleString()} / {required.toLocaleString()}</span>
                                        </div>
                                        <div className="h-2 bg-surface-secondary/50 rounded-full overflow-hidden border border-border-subtle p-0.5">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${Math.min(percentage, 100)}%` }}
                                                className="h-full bg-gradient-to-r from-primary to-primary-light rounded-full shadow-glow-primary"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col gap-2 w-full sm:w-auto">
                                    {user && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-9 font-black uppercase text-[10px] tracking-widest border-rose-500/30 text-rose-500 hover:bg-rose-500 hover:text-white"
                                            onClick={handleSignOut}
                                            leftIcon={<LogOut className="w-3 h-3" />}
                                        >
                                            ÇIKIŞ YAP
                                        </Button>
                                    )}
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        className="h-9 font-black uppercase text-[10px] tracking-widest"
                                        onClick={() => router.push('/ayarlar')}
                                        leftIcon={<SettingsIcon className="w-3 h-3" />}
                                    >
                                        AYARLAR
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Primary Stats Grid */}
                <motion.div
                    className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <StatMini icon={<Trophy className="w-4 h-4" />} value={gameState.stats.totalPredictions} label="Toplam Tahmin" />
                    <StatMini icon={<Target className="w-4 h-4" />} value={gameState.stats.correctPredictions} label="Doğru Skor" />
                    <StatMini icon={<TrendingUp className="w-4 h-4" />} value={`${accuracy}%`} label="Başarı Oranı" />
                    <StatMini icon={<Zap className="w-4 h-4" />} value={gameState.stats.bestStreak} label="En İyi Seri" />
                </motion.div>

                {/* Favorite Team & Shared Space */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {gameState.favoriteTeam && (
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                            <Card className="bg-primary/5 border-primary/20 overflow-hidden group">
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                                            <Heart className="w-5 h-5 text-primary fill-current" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-primary uppercase tracking-widest">Favori Takım</p>
                                            <p className="text-lg font-black text-text-primary italic uppercase tracking-tighter">{gameState.favoriteTeam}</p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-text-muted hover:text-rose-500"
                                        onClick={() => setFavoriteTeam(null)}
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </Button>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                        <Card className="bg-surface-secondary/20 border-border-main/50">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-surface-secondary/50 flex items-center justify-center">
                                        <Zap className="w-5 h-5 text-amber-500" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Ses Efektleri</p>
                                        <p className="text-sm font-black text-text-primary uppercase">{gameState.soundEnabled ? 'Aktif' : 'Pasif'}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={toggleSound}
                                    className={cn(
                                        "w-10 h-5 rounded-full transition-all relative border border-border-subtle",
                                        gameState.soundEnabled ? "bg-primary shadow-glow-primary" : "bg-surface-dark"
                                    )}
                                    aria-label="Ses Efektlerini Değiştir"
                                >
                                    <motion.div
                                        layout
                                        className="w-3.5 h-3.5 bg-white rounded-full absolute top-0.5"
                                        animate={{ x: gameState.soundEnabled ? 20 : 2 }}
                                    />
                                </button>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Achievements Showcase */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <Card className="bg-surface-primary border-border-main/50 overflow-hidden shadow-2xl">
                        <CardHeader className="bg-surface-secondary/30 p-4 border-b border-border-main flex-row justify-between items-center space-y-0">
                            <CardTitle className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2">
                                <Trophy className="w-4 h-4 text-primary" />
                                Başarı Başarımları
                            </CardTitle>
                            <Badge variant="secondary" className="px-2 py-0 h-5 text-[10px] font-black">
                                {unlockedCount}/{allAchievements.length}
                            </Badge>
                        </CardHeader>
                        <CardContent className="p-4">
                            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                                {allAchievements.map((achievement, idx) => {
                                    const isUnlocked = gameState.achievements.some(a => a.id === achievement.id);
                                    return (
                                        <motion.div
                                            key={achievement.id}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.4 + (idx * 0.05) }}
                                            className={cn(
                                                "relative flex flex-col items-center justify-center p-3 rounded-2xl border transition-all aspect-square",
                                                isUnlocked
                                                    ? "bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 shadow-premium-sm"
                                                    : "bg-surface-dark/50 border-border-subtle opacity-30 grayscale"
                                            )}
                                            title={`${achievement.name}: ${achievement.description}`}
                                        >
                                            <span className="text-2xl mb-1">{achievement.icon}</span>
                                            <div className="text-[8px] font-black text-center truncate w-full uppercase tracking-tighter text-text-primary px-1">
                                                {achievement.name}
                                            </div>
                                            {isUnlocked && (
                                                <div className="absolute -top-1 -right-1">
                                                    <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center shadow-glow-primary">
                                                        <Zap className="w-2 h-2 text-white fill-current" />
                                                    </div>
                                                </div>
                                            )}
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Footer Navigation */}
                <div className="flex items-center justify-center gap-4 py-8">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push('/anasayfa')}
                        className="text-text-muted hover:text-text-primary font-black uppercase text-[10px] tracking-widest"
                        leftIcon={<Home className="w-4 h-4" />}
                    >
                        Ana Sayfa
                    </Button>
                </div>

            </div>
        </main>
    );
}

function StatMini({ icon, value, label }: { icon: React.ReactNode; value: string | number; label: string }) {
    return (
        <Card className="bg-surface-primary border-border-main/50 p-4 flex flex-col items-center justify-center gap-1 group hover:border-primary/30 transition-all duration-300">
            <div className="w-8 h-8 rounded-xl bg-surface-secondary/50 flex items-center justify-center text-primary transition-transform group-hover:scale-110 group-hover:bg-primary/10">
                {icon}
            </div>
            <div className="text-xl font-black text-text-primary italic tabular-nums mt-1">{value}</div>
            <div className="text-[9px] font-black text-text-muted uppercase tracking-[0.1em]">{label}</div>
        </Card>
    );
}

