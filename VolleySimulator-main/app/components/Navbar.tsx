"use client";

import Link from "next/link";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useGameState, getLevelTitle, getXPForNextLevel } from "../utils/gameState";
import { useAuth } from "../context/AuthContext";
import { LEVEL_THRESHOLDS } from "../types";

export default function Navbar() {
    const pathname = usePathname();
    const { gameState } = useGameState();
    const { user, loading, signOut } = useAuth();
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

    const isInLeague = pathname?.startsWith('/1lig') || pathname?.startsWith('/2lig') || pathname?.startsWith('/vsl') || pathname?.startsWith('/cev-cl');
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

                    {/* Theme Toggle + User Info or Login Button */}
                    <div className="flex items-center gap-2">
                        <ThemeToggle />

                        {!loading && (
                            user ? (
                                <div className="flex items-center gap-3">
                                    {/* Achievements Badge */}
                                    <div className="hidden sm:flex items-center gap-1 text-xs text-amber-400 bg-amber-500/20 px-2 py-1 rounded-full border border-amber-500/30">
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

                                    {/* Logout Button */}
                                    <button
                                        onClick={() => signOut()}
                                        className="px-2 py-1.5 bg-slate-800 hover:bg-rose-900/50 border border-slate-700 hover:border-rose-600/50 text-slate-400 hover:text-rose-400 text-xs font-medium rounded-lg transition-all"
                                        title="Çıkış Yap"
                                    >
                                        Çıkış
                                    </button>
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
                        <span className="text-xs font-bold relative z-10">Anasayfa</span>
                    </Link>

                    {/* Ligler */}
                    <Link
                        href="/ligler"
                        className={`relative flex flex-col items-center gap-0.5 px-5 py-2 rounded-xl transition-all duration-200 active:scale-95 ${isInLeague || pathname === '/ligler'
                            ? 'text-indigo-400'
                            : 'text-slate-400 hover:text-white'
                            }`}
                        prefetch={true}
                    >
                        {(isInLeague || pathname === '/ligler') && (
                            <div className="absolute inset-0 bg-indigo-500/15 rounded-xl border border-indigo-500/30"></div>
                        )}
                        <span className="text-xs font-bold relative z-10">Ligler</span>
                    </Link>

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
                        <span className="text-xs font-bold relative z-10">Ayarlar</span>
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
                        <span className="text-xs font-bold relative z-10">Profil</span>
                    </Link>
                </div>
            </nav>

            {/* League Selection Modal */}
            {showLeagueModal && (
                <div
                    className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
                    onClick={() => setShowLeagueModal(false)}
                >
                    <div
                        className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-700/50 rounded-3xl w-full max-w-md shadow-2xl shadow-black/50 animate-scale-in overflow-hidden"
                        onClick={e => e.stopPropagation()}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="league-modal-title"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-emerald-600/20 via-transparent to-amber-600/20 p-6 border-b border-slate-800">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 id="league-modal-title" className="text-xl font-bold text-white">Lig Seçin</h2>
                                    <p className="text-xs text-slate-400 mt-1">Takip etmek istediğiniz ligi seçin</p>
                                </div>
                                <button
                                    onClick={() => setShowLeagueModal(false)}
                                    className="w-8 h-8 bg-slate-800 hover:bg-slate-700 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-4 max-h-[60vh] overflow-y-auto">
                            {/* Turkey Section */}
                            <div className="mb-4">
                                <div className="flex items-center gap-2 mb-3 px-1">
                                    <span className="text-sm font-bold text-slate-300 uppercase tracking-wider">Türkiye</span>
                                    <div className="flex-1 h-px bg-gradient-to-r from-slate-700 to-transparent"></div>
                                </div>

                                <div className="space-y-2">
                                    {/* Vodafone Sultanlar Ligi */}
                                    <Link
                                        href="/vsl/tahminoyunu"
                                        onClick={() => setShowLeagueModal(false)}
                                        className="group flex items-center gap-4 p-4 bg-gradient-to-r from-red-900/30 to-red-800/10 hover:from-red-800/40 hover:to-red-700/20 rounded-2xl border border-red-600/30 hover:border-red-500/50 transition-all duration-300"
                                    >
                                        <div className="flex-1">
                                            <div className="font-bold text-white group-hover:text-red-300 transition-colors">Vodafone Sultanlar Ligi</div>
                                            <div className="text-xs text-red-400/70">Kadınlar Voleybol • 2025-26</div>
                                        </div>
                                        <div className="text-red-500/50 group-hover:text-red-400 group-hover:translate-x-1 transition-all">→</div>
                                    </Link>

                                    {/* 1. Lig */}
                                    <Link
                                        href={getLeagueUrl('1lig')}
                                        onClick={() => setShowLeagueModal(false)}
                                        className="group flex items-center gap-4 p-4 bg-gradient-to-r from-amber-900/30 to-amber-800/10 hover:from-amber-800/40 hover:to-amber-700/20 rounded-2xl border border-amber-600/30 hover:border-amber-500/50 transition-all duration-300"
                                    >
                                        <div className="flex-1">
                                            <div className="font-bold text-white group-hover:text-amber-300 transition-colors">Arabica Coffee House 1. Lig</div>
                                            <div className="text-xs text-amber-400/70">Kadınlar Voleybol • 2025-26</div>
                                        </div>
                                        <div className="text-amber-500/50 group-hover:text-amber-400 group-hover:translate-x-1 transition-all">→</div>
                                    </Link>

                                    {/* 2. Lig */}
                                    <Link
                                        href={getLeagueUrl('2lig')}
                                        onClick={() => setShowLeagueModal(false)}
                                        className="group flex items-center gap-4 p-4 bg-gradient-to-r from-emerald-900/30 to-emerald-800/10 hover:from-emerald-800/40 hover:to-emerald-700/20 rounded-2xl border border-emerald-600/30 hover:border-emerald-500/50 transition-all duration-300"
                                    >
                                        <div className="flex-1">
                                            <div className="font-bold text-white group-hover:text-emerald-300 transition-colors">Kadınlar 2. Lig</div>
                                            <div className="text-xs text-emerald-400/70">Kadınlar Voleybol • 2025-26</div>
                                        </div>
                                        <div className="text-emerald-500/50 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all">→</div>
                                    </Link>
                                </div>
                            </div>

                            {/* Europe Section */}
                            <div className="mt-6 pt-4 border-t border-slate-800">
                                <div className="flex items-center gap-2 mb-3 px-1">
                                    <span className="text-sm font-bold text-slate-300 uppercase tracking-wider">Avrupa</span>
                                    <div className="flex-1 h-px bg-gradient-to-r from-slate-700 to-transparent"></div>
                                </div>

                                <div className="space-y-2">
                                    {/* CEV Champions League */}
                                    <Link
                                        href="/cev-cl/anasayfa"
                                        onClick={() => setShowLeagueModal(false)}
                                        className="group flex items-center gap-4 p-4 bg-gradient-to-r from-blue-900/30 to-indigo-800/10 hover:from-blue-800/40 hover:to-indigo-700/20 rounded-2xl border border-blue-600/30 hover:border-blue-500/50 transition-all duration-300"
                                    >
                                        <div className="flex-1">
                                            <div className="font-bold text-white group-hover:text-blue-300 transition-colors">CEV Şampiyonlar Ligi</div>
                                            <div className="text-xs text-blue-400/70">Kadınlar • Grup Aşaması 2025-26</div>
                                        </div>
                                        <div className="text-blue-500/50 group-hover:text-blue-400 group-hover:translate-x-1 transition-all">→</div>
                                    </Link>
                                </div>
                            </div>

                            {/* Coming Soon Section */}
                            <div className="mt-6 pt-4 border-t border-slate-800">
                                <div className="flex items-center gap-2 mb-3 px-1">
                                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Yakında Eklenecek</span>
                                </div>

                                <div className="grid grid-cols-3 gap-2">
                                    <div className="flex flex-col items-center gap-1 p-3 bg-slate-800/30 rounded-xl opacity-50">
                                        <span className="text-[10px] text-slate-500">İtalya</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-1 p-3 bg-slate-800/30 rounded-xl opacity-50">
                                        <span className="text-[10px] text-slate-500">Polonya</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-1 p-3 bg-slate-800/30 rounded-xl opacity-50">
                                        <span className="text-[10px] text-slate-500">Brezilya</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
                            <p className="text-center text-xs text-slate-500">
                                Daha fazla lig için takipte kalın!
                            </p>
                        </div>
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
                @keyframes scale-in {
                    from {
                        transform: scale(0.9);
                        opacity: 0;
                    }
                    to {
                        transform: scale(1);
                        opacity: 1;
                    }
                }
                .animate-scale-in {
                    animation: scale-in 0.25s ease-out forwards;
                }
            `}</style>
        </>
    );
}
