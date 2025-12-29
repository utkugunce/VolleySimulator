"use client";

import Link from "next/link";
import Image from "next/image";
import Logo from "./Logo";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useGameState } from "../utils/gameState";
import { useAuth } from "../context/AuthContext";

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
    const xpForNextLevel = gameState.level * 100;
    const xpProgress = Math.min((gameState.xp / xpForNextLevel) * 100, 100);

    const isInLeague = pathname?.startsWith('/1lig') || pathname?.startsWith('/2lig');

    return (
        <>
            {/* Top Header */}
            <nav className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b h-12 transition-all duration-300 ${scrolled
                ? 'bg-slate-900/95 border-slate-700 shadow-lg'
                : 'bg-slate-900/80 border-slate-800'
                }`}>
                <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
                    {/* Brand + Level */}
                    <Link href="/" className="flex items-center gap-2 group p-1 h-full" prefetch={true}>
                        <Logo size="md" className="group-hover:scale-110 transition-transform duration-300" />
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
                            VolleySimulator
                        </span>
                        {!loading && user && (
                            <div className="flex items-center gap-2 ml-1">
                                <span className="text-[10px] font-bold text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
                                    Lv.{gameState.level}
                                </span>
                            </div>
                        )}
                    </Link>

                    {/* Auth Button */}
                    {!loading && (
                        user ? (
                            <Link
                                href="/profile"
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-600 to-orange-600 text-white text-sm font-bold rounded-lg shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 hover:scale-105 active:scale-95 transition-all duration-200 btn-press"
                                prefetch={true}
                            >
                                <span>👤</span>
                                <span className="hidden sm:inline">Profil</span>
                            </Link>
                        ) : (
                            <Link
                                href="/login"
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-bold rounded-lg shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-105 active:scale-95 transition-all duration-200 btn-press"
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
            <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 h-14 shadow-[0_-4px_20px_rgba(0,0,0,0.3)]">
                <div className="max-w-lg mx-auto h-full flex items-center justify-around px-2">
                    {/* Anasayfa */}
                    <Link
                        href={user ? "/1lig/anasayfa" : "/"}
                        className={`relative flex flex-col items-center gap-0.5 px-6 py-2 rounded-xl transition-all duration-200 active:scale-95 ${pathname === '/' || pathname === '/1lig/anasayfa' || pathname === '/2lig/anasayfa'
                            ? 'text-emerald-400'
                            : 'text-slate-400 hover:text-white'
                            }`}
                        prefetch={true}
                    >
                        {(pathname === '/' || pathname === '/1lig/anasayfa' || pathname === '/2lig/anasayfa') && (
                            <div className="absolute inset-0 bg-emerald-500/15 rounded-xl border border-emerald-500/30"></div>
                        )}
                        <span className="text-xl relative z-10">🏠</span>
                        <span className="text-[10px] font-bold relative z-10">Anasayfa</span>
                    </Link>

                    {/* Ligler */}
                    <button
                        onClick={() => setShowLeagueModal(true)}
                        className={`relative flex flex-col items-center gap-0.5 px-6 py-2 rounded-xl transition-all duration-200 active:scale-95 ${isInLeague
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

                    {/* Anasayfa */}
                    <Link
                        href={user ? "/1lig/anasayfa" : "/"}
                        className={`flex flex-col items-center gap-0.5 px-6 py-2 rounded-lg transition-all ${pathname === '/' || pathname === '/1lig/anasayfa' || pathname === '/2lig/anasayfa'
                            ? 'text-emerald-400 bg-emerald-500/10'
                            : 'text-slate-400 hover:text-white'
                            }`}
                        prefetch={true}
                    >
                        <span className="text-xl">🏠</span>
                        <span className="text-[10px] font-bold">Anasayfa</span>
                    </Link>

                    {/* Profil */}
                    <Link
                        href={user ? "/profile" : "/login"}
                        className={`relative flex flex-col items-center gap-0.5 px-6 py-2 rounded-xl transition-all duration-200 active:scale-95 ${pathname === '/profile' || pathname === '/login'
                            ? 'text-amber-400'
                            : 'text-slate-400 hover:text-white'
                            }`}
                        prefetch={true}
                    >
                        {(pathname === '/profile' || pathname === '/login') && (
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
                                href="/1lig/anasayfa"
                                onClick={() => setShowLeagueModal(false)}
                                className="bg-gradient-to-br from-amber-600 to-orange-700 rounded-2xl p-6 text-center shadow-xl shadow-amber-500/20 hover:shadow-amber-500/40 hover:scale-105 active:scale-95 transition-all duration-200 card-shine"
                            >
                                <div className="text-4xl mb-3 animate-float-slow">🥇</div>
                                <div className="font-bold text-white text-lg">1. Lig</div>
                                <div className="text-xs text-white/60 mt-1">Kadınlar</div>
                            </Link>

                            <Link
                                href="/2lig/anasayfa"
                                onClick={() => setShowLeagueModal(false)}
                                className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-6 text-center shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-105 active:scale-95 transition-all duration-200 card-shine"
                            >
                                <div className="text-4xl mb-3 animate-float-slow" style={{ animationDelay: '0.5s' }}>🥈</div>
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
