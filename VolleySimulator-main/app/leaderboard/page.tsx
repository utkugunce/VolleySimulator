"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import PageHeader from "../components/PageHeader";

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

export default function LeaderboardPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [userEntry, setUserEntry] = useState<LeaderboardEntry | null>(null);
    const [userRank, setUserRank] = useState<number | null>(null);
    const [type, setType] = useState<LeaderboardType>('total');

    useEffect(() => {
        fetchLeaderboard();
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
                                    ? 'bg-emerald-600 text-white shadow-lg'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                }`}
                        >
                            {typeLabels[t]}
                        </button>
                    ))}
                </div>

                {/* User's Position (if not in top 50) */}
                {userEntry && userRank && userRank > 50 && (
                    <div className="bg-gradient-to-r from-amber-900/30 to-orange-900/30 rounded-xl border border-amber-600/30 p-4">
                        <div className="text-xs text-amber-400 mb-2">Senin Sıran</div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-amber-600 rounded-xl flex items-center justify-center font-bold text-white">
                                    #{userRank}
                                </div>
                                <div>
                                    <div className="font-bold text-white">{userEntry.display_name}</div>
                                    <div className="text-xs text-slate-400">
                                        {userEntry.correct_predictions}/{userEntry.total_predictions} doğru
                                    </div>
                                </div>
                            </div>
                            <div className="text-2xl font-bold text-amber-400">
                                {type === 'weekly' ? userEntry.weekly_points :
                                    type === 'monthly' ? userEntry.monthly_points :
                                        userEntry.total_points}
                            </div>
                        </div>
                    </div>
                )}

                {/* Leaderboard Table */}
                <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
                    {loading ? (
                        <div className="p-8 flex justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                        </div>
                    ) : leaderboard.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">
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
                                        className={`flex items-center justify-between p-3 sm:p-4 transition-colors ${isCurrentUser ? 'bg-amber-900/20' : 'hover:bg-slate-800/50'
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

                                            {/* Name & Stats */}
                                            <div>
                                                <div className={`font-bold ${isCurrentUser ? 'text-amber-400' : 'text-white'}`}>
                                                    {entry.display_name || 'Anonim'}
                                                    {isCurrentUser && <span className="ml-2 text-xs text-amber-400">(Sen)</span>}
                                                </div>
                                                <div className="text-[10px] sm:text-xs text-slate-500 flex gap-2">
                                                    <span>✓ {entry.correct_predictions}</span>
                                                    <span>🔥 {entry.best_streak}</span>
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

                {/* Legend */}
                <div className="flex flex-wrap gap-4 text-xs text-slate-500 justify-center">
                    <div className="flex items-center gap-1">
                        <span>✓</span> Doğru Tahmin
                    </div>
                    <div className="flex items-center gap-1">
                        <span>🔥</span> En İyi Seri
                    </div>
                    <div className="flex items-center gap-1">
                        <span>P</span> Toplam Puan
                    </div>
                </div>
            </div>
        </main>
    );
}
