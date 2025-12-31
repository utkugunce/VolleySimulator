"use client";

import { useEffect } from "react";

import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { useFetch } from "@/app/utils/useFetch";
import Link from "next/link";

interface AdminStats {
    users: number;
    predictions: number;
    results: number;
}

export default function AdminDashboard() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const { data: stats, loading: statsLoading, error, execute } = useFetch<AdminStats>();

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login?redirect=/admin");
        } else if (user) {
            execute("/api/admin/stats");
        }
    }, [user, loading, router, execute]);

    if (loading || statsLoading) {
        return (
            <div className="min-h-screen pt-20 flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen pt-20 px-4">
                <div className="max-w-4xl mx-auto bg-rose-500/10 border border-rose-500/20 text-rose-500 p-4 rounded-xl">
                    <h1 className="text-xl font-bold mb-2">Erişim Reddedildi</h1>
                    <p>{error}</p>
                    <Link href="/" className="inline-block mt-4 px-4 py-2 bg-slate-800 rounded-lg hover:bg-slate-700 text-white transition-colors">
                        Anasayfaya Dön
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen pt-20 px-4 pb-20">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Yönetim Paneli</h1>
                        <p className="text-slate-400">Sistem istatistikleri ve yönetim araçları</p>
                    </div>
                    <div className="flex gap-3">
                        <Link
                            href="/admin/matches"
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                        >
                            <span>🏐</span> Maç Yönetimi
                        </Link>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard
                        title="Toplam Kullanıcı"
                        value={stats?.users || 0}
                        icon="👥"
                        color="blue"
                    />
                    <StatCard
                        title="Toplam Tahmin"
                        value={stats?.predictions || 0}
                        icon="📊"
                        color="amber"
                    />
                    <StatCard
                        title="Oynanan Maçlar"
                        value={stats?.results || 0}
                        icon="✅"
                        color="emerald"
                    />
                </div>

            </div>
        </div>
    );
}

function StatCard({ title, value, icon, color }: { title: string, value: number, icon: string, color: string }) {
    const colorClasses = {
        blue: "from-blue-500/20 to-indigo-500/20 border-blue-500/30 text-blue-400",
        amber: "from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-400",
        emerald: "from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-400",
    }[color] || "from-slate-800 to-slate-900 border-slate-700 text-slate-400";

    return (
        <div className={`p-6 rounded-2xl border bg-gradient-to-br ${colorClasses} backdrop-blur-sm`}>
            <div className="flex justify-between items-start mb-4">
                <span className="text-4xl">{icon}</span>
                <div className={`px-3 py-1 rounded-full text-xs font-bold bg-black/20 text-white`}>
                    Canlı
                </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{value.toLocaleString()}</div>
            <div className="text-sm font-medium opacity-80">{title}</div>
        </div>
    );
}
