"use client";

import Link from "next/link";
import Logo from "./Logo";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useGameState, getLevelTitle, getXPForNextLevel } from "../utils/gameState";
import { useAuth } from "../context/AuthContext";
import { LEVEL_THRESHOLDS } from "../types";

export default function Navbar() {
    const pathname = usePathname();
    const { gameState } = useGameState();
    const { user, loading } = useAuth();
    const [showLeagueModal, setShowLeagueModal] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    // Track scroll position for navbar background
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Calculate XP progress
    const currentLevelXP = LEVEL_THRESHOLDS[gameState.level - 1] || 0;
    const nextLevelXP = getXPForNextLevel(gameState.level);
    const progress = gameState.xp - currentLevelXP;
    const required = nextLevelXP - currentLevelXP;
    const xpProgress = Math.min((progress / required) * 100, 100);

    const isInLeague = pathname?.startsWith('/1lig') || pathname?.startsWith('/2lig');
    const isAnasayfa = pathname === '/' || pathname === '/anasayfa';
    const isAyarlar = pathname === '/ayarlar';
    const isProfile = pathname === '/profile' || pathname === '/login' || pathname === '/register';

    // Generate league URL preserving current page path
    const getLeagueUrl = (targetLeague: string) => {
        if (!pathname) return `/${targetLeague}/tahminoyunu`;

        const pathParts = pathname.split('/');
        if (pathParts[1] === '1lig' || pathParts[1] === '2lig') {
            pathParts[1] = targetLeague;
            return pathParts.join('/');
        }
        return `/${targetLeague}/tahminoyunu`;
    };

    // Get user display name
    const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Oyuncu';

    return (
        <>
            {/* Top Header */}
            <nav className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b h-12 transition-all duration-300 ${scrolled
                ? 'bg-slate-900/95 border-slate-700 shadow-lg'
                : 'bg-slate-900/80 border-slate-800'
                }`}>
                <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
                    {/* Brand */}
                    <Link href="/" className="flex items-center gap-2 group p-1 h-full" prefetch={true}>
                        <Logo size="md" className="group-hover:scale-110 transition-transform duration-300" />
                        <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400 hidden sm:inline">
                            VolleySimulator
                        </span>
                    </Link>

                    {/* User Info or Login Button */}
                    {!loading && (
                        user ? (
                            <div className="flex items-center gap-3">
                                {/* Achievements Badge */}
                                <div className="hidden sm:flex items-center gap-1 text-xs text-amber-400 bg-amber-500/20 px-2 py-1 rounded-full border border-amber-500/30">
                                    <span>🏆</span>
                                    <span className="font-bold">{gameState.achievements.length}</span>
                                </div>

                                {/* Level + XP Bar */}
                                <div className="flex items-center gap-2">
                                    <div className="hidden sm:block">
                                        <div className="w-20 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-amber-400 to-orange-400 transition-all"
                                                style={{ width: `${xpProgress}%` }}
                                            />
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
                                        Lv.{gameState.level}
                                    </span>
                                </div>

                                {/* User Name */}
                                <Link
                                    href="/profile"
                                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-sm font-medium rounded-lg transition-all"
                                    prefetch={true}
                                >
                                    <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                        {userName[0].toUpperCase()}
                                    </div>
                                    <span className="hidden md:inline max-w-[100px] truncate">{userName}</span>
                                </Link>
                            </div>
                        ) : (
                            <Link
                                href="/login"
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-bold rounded-lg shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-105 active:scale-95 transition-all duration-200"
                                prefetch={true}
                            >
                                <span>Giriş Yap</span>
                            </Link>
                        )
                    )}
                </div>
            </nav>

            {/* Bottom Navigation Bar */}
            <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 h-14 shadow-[0_-4px_20px_rgba(0,0,0,0.3)]">
                <div className="max-w-lg mx-auto h-full flex items-center justify-around px-2">
                    {/* Anasayfa */}
                    <Link
                        href={user ? "/anasayfa" : "/"}
                        className={`relative flex flex-col items-center gap-0.5 px-5 py-2 rounded-xl transition-all duration-200 active:scale-95 ${isAnasayfa
                            ? 'text-emerald-400'
                            : 'text-slate-400 hover:text-white'
                            }`}
                        prefetch={true}
                    >
                        {isAnasayfa && (
                            <div className="absolute inset-0 bg-emerald-500/15 rounded-xl border border-emerald-500/30"></div>
                        )}
                        <span className="text-xl relative z-10">🏠</span>
                        <span className="text-[10px] font-bold relative z-10">Anasayfa</span>
                    </Link>

                    {/* Ligler */}
                    <button
                        onClick={() => setShowLeagueModal(true)}
                        className={`relative flex flex-col items-center gap-0.5 px-5 py-2 rounded-xl transition-all duration-200 active:scale-95 ${isInLeague
                            ? 'text-indigo-400'
                            : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        {isInLeague && (
                            <div className="absolute inset-0 bg-indigo-500/15 rounded-xl border border-indigo-500/30"></div>
                        )}
                        <span className="text-xl relative z-10">🏐</span>
                        <span className="text-[10px] font-bold relative z-10">Ligler</span>
                    </button>

                    {/* Ayarlar */}
                    <Link
                        href="/ayarlar"
                        className={`relative flex flex-col items-center gap-0.5 px-5 py-2 rounded-xl transition-all duration-200 active:scale-95 ${isAyarlar
                            ? 'text-cyan-400'
                            : 'text-slate-400 hover:text-white'
                            }`}
                        prefetch={true}
                    >
                        {isAyarlar && (
                            <div className="absolute inset-0 bg-cyan-500/15 rounded-xl border border-cyan-500/30"></div>
                        )}
                        <span className="text-xl relative z-10">⚙️</span>
                        <span className="text-[10px] font-bold relative z-10">Ayarlar</span>
                    </Link>

                    {/* Profil */}
                    <Link
                        href={user ? "/profile" : "/login"}
                        className={`relative flex flex-col items-center gap-0.5 px-5 py-2 rounded-xl transition-all duration-200 active:scale-95 ${isProfile
                            ? 'text-amber-400'
                            : 'text-slate-400 hover:text-white'
                            }`}
                        prefetch={true}
                    >
                        {isProfile && (
                            <div className="absolute inset-0 bg-amber-500/15 rounded-xl border border-amber-500/30"></div>
                        )}
                        <span className="text-xl relative z-10">👤</span>
                        <span className="text-[10px] font-bold relative z-10">Profil</span>
                    </Link>
                </div>
            </nav>

            {/* League Selection Modal */}
            {showLeagueModal && (
                <div
                    className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end justify-center"
                    onClick={() => setShowLeagueModal(false)}
                >
                    <div
                        className="bg-slate-900 border-t border-slate-800 rounded-t-3xl w-full max-w-lg p-6 pb-8 animate-slide-up"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="w-12 h-1 bg-slate-700 rounded-full mx-auto mb-6"></div>
                        <h2 className="text-lg font-bold text-center text-white mb-6">Lig Seçin</h2>

                        <div className="grid grid-cols-2 gap-4">
                            <Link
                                href={getLeagueUrl('1lig')}
                                onClick={() => setShowLeagueModal(false)}
                                className="bg-gradient-to-br from-amber-600 to-orange-700 rounded-2xl p-6 text-center shadow-xl shadow-amber-500/20 hover:shadow-amber-500/40 hover:scale-105 active:scale-95 transition-all duration-200 card-shine"
                            >
                                <div className="text-4xl mb-3 animate-float-slow">🥇</div>
                                <div className="font-bold text-white text-lg">1. Lig</div>
                                <div className="text-xs text-white/60 mt-1">Kadınlar</div>
                            </Link>

                            <Link
                                href={getLeagueUrl('2lig')}
                                onClick={() => setShowLeagueModal(false)}
                                className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-6 text-center shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-105 active:scale-95 transition-all duration-200 card-shine"
                            >
                                <div className="text-4xl mb-3 animate-float-slow delay-500">🥈</div>
                                <div className="font-bold text-white text-lg">2. Lig</div>
                                <div className="text-xs text-white/60 mt-1">Kadınlar</div>
                            </Link>
                        </div>

                        <button
                            onClick={() => setShowLeagueModal(false)}
                            className="w-full mt-4 py-3 text-slate-400 text-sm font-medium"
                        >
                            İptal
                        </button>
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes slide-up {
                    from {
                        transform: translateY(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }
                .animate-slide-up {
                    animation: slide-up 0.3s ease-out forwards;
                }
            `}</style>
        </>
    );
}
