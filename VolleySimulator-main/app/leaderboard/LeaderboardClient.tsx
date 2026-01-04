"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Skeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { Trophy, TrendingUp, Calendar, Zap, Info, Award } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeaderboardEntry {
    rank: number;
    user_id: string;
    display_name: string;
    total_points: number;
    correct_predictions: number;
    total_predictions: number;
    current_streak: number;
    best_streak: number;
    weekly_points: number;
    monthly_points: number;
}

type LeaderboardType = 'total' | 'weekly' | 'monthly';

interface LeaderboardClientProps {
    initialLeaderboard: LeaderboardEntry[];
    initialUserEntry: LeaderboardEntry | null;
    initialUserRank: number | null;
}

export default function LeaderboardClient({
    initialLeaderboard,
    initialUserEntry,
    initialUserRank
}: LeaderboardClientProps) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(initialLeaderboard);
    const [userEntry, setUserEntry] = useState<LeaderboardEntry | null>(initialUserEntry);
    const [userRank, setUserRank] = useState<number | null>(initialUserRank);
    const [type, setType] = useState<LeaderboardType>('total');

    useEffect(() => {
        if (type !== 'total' || leaderboard !== initialLeaderboard) {
            fetchLeaderboard();
        }
    }, [type]);

    async function fetchLeaderboard() {
        try {
            setLoading(true);
            const res = await fetch(`/api/leaderboard?type=${type}&limit=50`);
            if (res.ok) {
                const data = await res.json();
                setLeaderboard(data.leaderboard || []);
                setUserEntry(data.userEntry);
                setUserRank(data.userRank);
            }
        } catch (err) {
            console.error("Leaderboard fetch error:", err);
        } finally {
            setLoading(false);
        }
    }

    const typeLabels: Record<LeaderboardType, string> = {
        total: 'Tüm Zamanlar',
        weekly: 'Bu Hafta',
        monthly: 'Bu Ay'
    };

    return (
        <main className="min-h-screen bg-background text-text-primary p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border-subtle pb-6">
                    <div className="space-y-1">
                        <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5 mb-2">
                            PREMIUM ANALİTİK
                        </Badge>
                        <h1 className="text-4xl font-black tracking-tighter text-text-primary uppercase italic">
                            Sıralama <span className="text-primary shadow-glow-primary">Tablosu</span>
                        </h1>
                        <p className="text-text-secondary font-medium">En iyi voleybol tahmin uzmanları arasında yerini al.</p>
                    </div>

                    {/* Filter Tabs */}
                    <div className="inline-flex p-1 bg-surface-secondary/50 backdrop-blur-sm rounded-xl border border-border-main">
                        {(['total', 'weekly', 'monthly'] as LeaderboardType[]).map((t) => (
                            <Button
                                key={t}
                                variant={type === t ? 'primary' : 'ghost'}
                                size="sm"
                                onClick={() => setType(t)}
                                className={cn(
                                    "rounded-lg text-xs font-black transition-all px-4 h-9 uppercase",
                                    type === t && "shadow-glow-primary"
                                )}
                            >
                                {typeLabels[t]}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Top 3 Podium (Visual) - Only on Desktop and if data exists */}
                {leaderboard.length >= 3 && !loading && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                        {[leaderboard[1], leaderboard[0], leaderboard[2]].map((entry, i) => {
                            const isFirst = entry.rank === 1;
                            return (
                                <Card
                                    key={entry.user_id}
                                    className={cn(
                                        "relative border-none overflow-hidden",
                                        isFirst ? "bg-gradient-to-br from-amber-400/20 via-amber-600/10 to-transparent ring-2 ring-amber-500/50 scale-105 z-10 sm:-translate-y-2" : "bg-surface-secondary/30",
                                        user?.id === entry.user_id && "ring-2 ring-primary/50"
                                    )}
                                >
                                    <div className="p-6 flex flex-col items-center">
                                        <div className={cn(
                                            "w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-4 relative",
                                            entry.rank === 1 ? "bg-amber-500 shadow-glow-accent" : "bg-surface-dark border border-border-main"
                                        )}>
                                            {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉'}
                                            {user?.id === entry.user_id && (
                                                <div className="absolute -bottom-1 -right-1">
                                                    <Badge variant="success" className="p-0.5 rounded-full"><TrendingUp className="w-3 h-3" /></Badge>
                                                </div>
                                            )}
                                        </div>
                                        <h3 className="font-black text-lg truncate w-full px-2">{entry.display_name || 'Anonim'}</h3>
                                        <div className="text-2xl font-black text-text-primary mt-2">
                                            {type === 'weekly' ? entry.weekly_points :
                                                type === 'monthly' ? entry.monthly_points :
                                                    entry.total_points}
                                            <span className="text-[10px] text-text-muted ml-0.5 uppercase tracking-tighter">Puan</span>
                                        </div>
                                        <Badge variant="secondary" className="mt-4 text-[10px] font-black tracking-widest uppercase">
                                            {entry.correct_predictions} Doğru
                                        </Badge>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                )}

                {/* User's Current Status Banner */}
                {userEntry && userRank && userRank > 3 && (
                    <Card className="bg-primary/5 border-primary/20 overflow-hidden relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent group-hover:from-primary/20 transition-all duration-700" />
                        <CardContent className="p-4 sm:p-6 relative z-10">
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center font-black text-primary text-xl shadow-glow-primary">
                                        #{userRank}
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Senin Mevcut Sıran</div>
                                        <div className="font-black text-xl text-text-primary tracking-tight">{userEntry.display_name || 'Kullanıcı'}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-black text-primary tabular-nums">
                                        {type === 'weekly' ? userEntry.weekly_points :
                                            type === 'monthly' ? userEntry.monthly_points :
                                                userEntry.total_points}
                                        <span className="text-xs ml-1 font-medium text-text-muted uppercase">Puan</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Main List */}
                <Card className="bg-surface-primary/50 backdrop-blur-sm border-border-main/50 overflow-hidden">
                    <CardHeader className="bg-surface-secondary/30 p-4 border-b border-border-main">
                        <CardTitle className="text-sm font-black flex items-center gap-2 tracking-widest uppercase">
                            <TrendingUp className="w-4 h-4 text-primary" />
                            TOP 50 Tahminci
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="p-0 relative">
                        {loading && (
                            <div className="absolute inset-0 bg-background/50 backdrop-blur-[2px] z-50 flex flex-col items-center justify-center gap-3">
                                <Zap className="w-8 h-8 text-primary animate-pulse shadow-glow-primary" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">Veriler Çekiliyor</span>
                            </div>
                        )}

                        {leaderboard.length === 0 && !loading ? (
                            <EmptyState
                                title="Henüz Skor Yok"
                                description="Bu kategori için henüz sıralama verisi oluşturulmamış. İlk tahmini sen yap!"
                                icon={Award}
                                className="min-h-[400px] border-none"
                                actionLabel="Hemen Tahmin Yap"
                                onAction={() => window.location.href = '/ligler'}
                            />
                        ) : (
                            <div className="divide-y divide-border-subtle">
                                {leaderboard.map((entry) => {
                                    const isCurrentUser = user?.id === entry.user_id;
                                    const points = type === 'weekly' ? entry.weekly_points :
                                        type === 'monthly' ? entry.monthly_points :
                                            entry.total_points;
                                    const isTop3 = entry.rank <= 3;

                                    return (
                                        <div
                                            key={entry.user_id}
                                            className={cn(
                                                "flex items-center justify-between p-4 transition-all duration-300 group",
                                                isCurrentUser ? "bg-primary/5" : "hover:bg-surface-secondary/50"
                                            )}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={cn(
                                                    "w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm transition-transform group-hover:scale-110",
                                                    entry.rank === 1 ? "bg-amber-500 text-white shadow-glow-accent" :
                                                        entry.rank === 2 ? "bg-slate-300 text-slate-800" :
                                                            entry.rank === 3 ? "bg-amber-600 text-white shadow-md shadow-amber-900/20" :
                                                                "bg-surface-secondary text-text-muted border border-border-subtle"
                                                )}>
                                                    #{entry.rank}
                                                </div>

                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-2">
                                                        <span className={cn(
                                                            "font-black tracking-tight",
                                                            isCurrentUser ? "text-primary" : "text-text-primary"
                                                        )}>
                                                            {entry.display_name || 'Anonim Tahminci'}
                                                        </span>
                                                        {isCurrentUser && (
                                                            <Badge variant="default" className="h-4 px-1.5 py-0 text-[8px] font-black uppercase tracking-widest">Sen</Badge>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-3 mt-1 underline-offset-4">
                                                        <span className="text-[10px] font-medium text-text-muted flex items-center gap-1">
                                                            <Badge variant="secondary" className="px-1 py-0 h-4 text-[8px]">{entry.correct_predictions}</Badge> İsabet
                                                        </span>
                                                        {entry.current_streak >= 3 && (
                                                            <span className="text-[10px] font-black text-primary italic flex items-center gap-1">
                                                                <Zap className="w-2.5 h-2.5 fill-current" />
                                                                {entry.current_streak} SERİ!
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <div className={cn(
                                                    "text-xl font-black tabular-nums tracking-tighter",
                                                    isTop3 ? "text-amber-500" : "text-text-primary"
                                                )}>
                                                    {points}
                                                    <span className="text-[9px] text-text-muted ml-0.5 uppercase">pts</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Legend / Info Footer */}
                <Card className="bg-surface-secondary/20 border-border-main/30 border-dashed">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Info className="w-4 h-4 text-primary" />
                            <h4 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Puanlama Sistemi</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <InfoCard title="Tahmin" value="+10" desc="Skoru tam bilenlere" />
                            <InfoCard title="Seri Bonusu" value="+5" desc="Üst üste 3 doğru maça" />
                            <InfoCard title="Sıralama" value="15 DK" desc="Güncelleme aralığı" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}

const InfoCard = ({ title, value, desc }: { title: string; value: string; desc: string }) => (
    <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-text-muted uppercase">{title}</span>
            <span className="text-xs font-black text-primary">{value}</span>
        </div>
        <p className="text-[10px] text-text-secondary leading-tight">{desc}</p>
    </div>
);
