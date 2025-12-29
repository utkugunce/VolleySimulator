"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useGameState } from "../utils/gameState";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
    const pathname = usePathname();
    const { gameState } = useGameState();
    const { user, loading } = useAuth();
    const [showLeagueModal, setShowLeagueModal] = useState(false);

    // Calculate XP progress
    const xpForNextLevel = gameState.level * 100;
    const xpProgress = Math.min((gameState.xp / xpForNextLevel) * 100, 100);

    const isInLeague = pathname?.startsWith('/1lig') || pathname?.startsWith('/2lig');

    return (
        <>
            {/* Top Header */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 h-12 transition-all duration-150">
                <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
                    {/* Brand + Level */}
                    <Link href="/" className="flex items-center gap-3 group p-1 h-full" prefetch={true}>
                        <Image
                            src="/logo.png"
                            alt="VolleySimulator Logo"
                            width={160}
                            height={40}
                            className="h-8 md:h-10 w-auto object-contain"
                            priority
                        />
                        {!loading && user && (
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
                                    Lv.{gameState.level}
                                </span>
                                <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden hidden sm:block">
                                    <div
                                        className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300"
                                        style={{ width: `${xpProgress}%` }}
                                    />
                                </div>
                            </div>
                        )}
                    </Link>

                    {/* Auth Button */}
                    {!loading && (
                        user ? (
                            <Link
                                href="/profile"
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-600 to-orange-600 text-white text-sm font-bold rounded-lg shadow-lg shadow-amber-500/20 hover:scale-105 transition-all"
                                prefetch={true}
                            >
                                <span>👤</span>
                                <span className="hidden sm:inline">Profil</span>
                            </Link>
                        ) : (
                            <Link
                                href="/login"
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-bold rounded-lg shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all"
                                prefetch={true}
                            >
                                <span>🔐</span>
                                <span className="hidden sm:inline">Giriş Yap</span>
                            </Link>
                        )
                    )}
                </div>
            </nav>

            {/* Bottom Navigation Bar */}
            <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 h-14">
                <div className="max-w-lg mx-auto h-full flex items-center justify-around px-2">
                    {/* Anasayfa */}
                    <Link
                        href="/"
                        className={`flex flex-col items-center gap-0.5 px-6 py-2 rounded-lg transition-all ${pathname === '/'
                            ? 'text-emerald-400 bg-emerald-500/10'
                            : 'text-slate-400 hover:text-white'
                            }`}
                        prefetch={true}
                    >
                        <span className="text-xl">🏠</span>
                        <span className="text-[10px] font-bold">Anasayfa</span>
                    </Link>

                    {/* Ligler */}
                    <button
                        onClick={() => setShowLeagueModal(true)}
                        className={`flex flex-col items-center gap-0.5 px-6 py-2 rounded-lg transition-all ${isInLeague
                            ? 'text-indigo-400 bg-indigo-500/10'
                            : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        <span className="text-xl">🏐</span>
                        <span className="text-[10px] font-bold">Ligler</span>
                    </button>

                    {/* Profil */}
                    <Link
                        href={user ? "/profile" : "/login"}
                        className={`flex flex-col items-center gap-0.5 px-6 py-2 rounded-lg transition-all ${pathname === '/profile' || pathname === '/login'
                            ? 'text-amber-400 bg-amber-500/10'
                            : 'text-slate-400 hover:text-white'
                            }`}
                        prefetch={true}
                    >
                        <span className="text-xl">👤</span>
                        <span className="text-[10px] font-bold">Profil</span>
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
                                href="/1lig/anasayfa"
                                onClick={() => setShowLeagueModal(false)}
                                className="bg-gradient-to-br from-amber-600 to-orange-700 rounded-2xl p-6 text-center shadow-xl shadow-amber-500/20 hover:scale-105 transition-all"
                            >
                                <div className="text-4xl mb-3">🥇</div>
                                <div className="font-bold text-white text-lg">1. Lig</div>
                                <div className="text-xs text-white/60 mt-1">Kadınlar</div>
                            </Link>

                            <Link
                                href="/2lig/anasayfa"
                                onClick={() => setShowLeagueModal(false)}
                                className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-6 text-center shadow-xl shadow-emerald-500/20 hover:scale-105 transition-all"
                            >
                                <div className="text-4xl mb-3">🥈</div>
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
