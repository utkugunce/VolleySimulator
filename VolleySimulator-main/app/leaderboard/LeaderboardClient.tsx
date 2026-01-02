"use client";

import { useState, useEffect } from "react";
import PageHeader from "../components/PageHeader";
import { useAuth } from "../context/AuthContext";

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

    // Only fetch if type changes (initial load is served by SSR)
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
        <main className="min-h-screen bg-slate-950 text-slate-100 p-2 sm:p-4 font-sans">
            <div className="max-w-4xl mx-auto space-y-4">
                <PageHeader
                    title="Sıralama Tablosu"
                    subtitle="En iyi tahmin uzmanları"
                />

                {/* Type Selector */}
                <div className="flex gap-2 p-1 bg-slate-900 rounded-xl border border-slate-800">
                    {(['total', 'weekly', 'monthly'] as LeaderboardType[]).map((t) => (
                        <button
                            key={t}
                            onClick={() => setType(t)}
                            className={`flex-1 px-4 py-2 rounded-lg text-sm font-bold transition-all ${type === t
                                ? 'bg-emerald-700 text-white shadow-lg'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                }`}
                        >
                            {typeLabels[t]}
                        </button>
                    ))}
                </div>

                {/* User's Position (if not in top 50) */}
                {userEntry && userRank && userRank > 50 && (
                    <div className="bg-gradient-to-r from-emerald-900/30 to-teal-900/30 rounded-xl border border-emerald-600/30 p-4">
                        <div className="text-xs text-emerald-400 mb-2">Senin Sıran</div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center font-bold text-white">
                                    #{userRank}
                                </div>
                                <div>
                                    <div className="font-bold text-white">{userEntry.display_name || 'Anonim'}</div>
                                    <div className="text-xs text-slate-400">
                                        {userEntry.correct_predictions}/{userEntry.total_predictions} doğru
                                    </div>
                                </div>
                            </div>
                            <div className="text-2xl font-bold text-emerald-400">
                                {type === 'weekly' ? userEntry.weekly_points :
                                    type === 'monthly' ? userEntry.monthly_points :
                                        userEntry.total_points}
                                <span className="text-xs ml-1">P</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Leaderboard Table */}
                <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl relative">
                    {loading && (
                        <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm z-10 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                        </div>
                    )}

                    {leaderboard.length === 0 && !loading ? (
                        <div className="p-12 text-center text-slate-500">
                            <div className="text-4xl mb-3">😴</div>
                            Henüz sıralama verisi yok
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-800">
                            {leaderboard.map((entry) => {
                                const isCurrentUser = user?.id === entry.user_id;
                                const points = type === 'weekly' ? entry.weekly_points :
                                    type === 'monthly' ? entry.monthly_points :
                                        entry.total_points;

                                return (
                                    <div
                                        key={entry.user_id}
                                        className={`flex items-center justify-between p-3 sm:p-4 transition-colors ${isCurrentUser ? 'bg-emerald-900/20' : 'hover:bg-slate-800/50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3 sm:gap-4">
                                            {/* Rank */}
                                            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center font-bold text-sm ${entry.rank === 1 ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/30' :
                                                entry.rank === 2 ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-slate-800' :
                                                    entry.rank === 3 ? 'bg-gradient-to-br from-amber-600 to-amber-700 text-white' :
                                                        'bg-slate-800 text-slate-500'
                                                }`}>
                                                {entry.rank === 1 ? '👑' : entry.rank}
                                            </div>

                                            {/* Avatar Fallback / Decoration */}
                                            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-slate-400 font-bold border border-slate-700">
                                                {(entry.display_name || 'A').slice(0, 1).toUpperCase()}
                                            </div>

                                            {/* Name & Stats */}
                                            <div>
                                                <div className={`font-bold flex items-center gap-2 ${isCurrentUser ? 'text-emerald-400' : 'text-white'}`}>
                                                    <span className="truncate max-w-[120px] sm:max-w-none">{entry.display_name || 'Anonim'}</span>
                                                    {isCurrentUser && <span className="text-[9px] px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded uppercase tracking-wider">Sen</span>}
                                                </div>
                                                <div className="text-[10px] sm:text-xs text-slate-500 flex gap-2">
                                                    <span>✓ {entry.correct_predictions} Doğru</span>
                                                    <span>🔥 {entry.best_streak} Seri</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Points */}
                                        <div className={`text-lg sm:text-xl font-bold ${entry.rank <= 3 ? 'text-amber-400' : 'text-slate-300'
                                            }`}>
                                            {points}
                                            <span className="text-xs text-slate-500 ml-1">P</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Stats Info */}
                <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800/50">
                    <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 text-center tracking-widest">Sistem Bilgisi</h4>
                    <div className="flex flex-wrap gap-x-8 gap-y-3 text-[10px] text-slate-500 justify-center">
                        <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            <span>Doğru Tahmin: +10 Puan</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                            <span>Seri Bonusu: Her 3 maçta +5 Puan</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                            <span>Sıralama her 15 dakikada bir güncellenir</span>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
