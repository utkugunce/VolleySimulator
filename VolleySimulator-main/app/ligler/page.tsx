"use client";

import Link from "next/link";
import PageHeader from "../components/PageHeader";

export default function LiglerPage() {
    return (
        <div className="min-h-screen bg-slate-950">
            <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
                <PageHeader
                    title="Ligler"
                    subtitle="Türkiye Kadınlar Voleybol Ligleri • 2025-2026 Sezonu"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Vodafone Sultanlar Ligi */}
                    <Link href="/vsl/tahminoyunu" className="group bg-slate-900 border border-red-500/30 rounded-2xl p-8 hover:bg-slate-800 hover:border-red-500/60 transition-all flex flex-col items-center text-center gap-4 shadow-lg hover:shadow-red-900/20">
                        <span className="text-6xl group-hover:scale-110 transition-transform duration-300">🏆</span>
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-2">Vodafone Sultanlar Ligi</h2>
                            <p className="text-slate-400">Türkiye'nin en üst düzey kadınlar voleybol ligi</p>
                        </div>
                        <div className="mt-2 px-4 py-2 bg-red-600/20 text-red-400 rounded-full text-sm font-bold group-hover:bg-red-600 group-hover:text-white transition-colors">
                            Lige Git →
                        </div>
                    </Link>

                    {/* Arabica Coffee House 1. Lig */}
                    <Link href="/1lig/tahminoyunu" className="group bg-slate-900 border border-amber-500/30 rounded-2xl p-8 hover:bg-slate-800 hover:border-amber-500/60 transition-all flex flex-col items-center text-center gap-4 shadow-lg hover:shadow-amber-900/20">
                        <span className="text-6xl group-hover:scale-110 transition-transform duration-300">🥇</span>
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-2">Arabica Coffee House 1. Lig</h2>
                            <p className="text-slate-400">2 Gruplu 1. Lig Sistemi</p>
                        </div>
                        <div className="mt-2 px-4 py-2 bg-amber-600/20 text-amber-400 rounded-full text-sm font-bold group-hover:bg-amber-600 group-hover:text-white transition-colors">
                            Lige Git →
                        </div>
                    </Link>

                    {/* Kadınlar 2. Lig */}
                    <Link href="/2lig/tahminoyunu" className="group bg-slate-900 border border-emerald-500/30 rounded-2xl p-8 hover:bg-slate-800 hover:border-emerald-500/60 transition-all flex flex-col items-center text-center gap-4 shadow-lg hover:shadow-emerald-900/20">
                        <span className="text-6xl group-hover:scale-110 transition-transform duration-300">🥈</span>
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-2">Kadınlar 2. Lig</h2>
                            <p className="text-slate-400">5 Gruplu 2. Lig Sistemi</p>
                        </div>
                        <div className="mt-2 px-4 py-2 bg-emerald-600/20 text-emerald-400 rounded-full text-sm font-bold group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                            Lige Git →
                        </div>
                    </Link>

                    {/* Şampiyonlar Ligi */}
                    <Link href="/cev-cl/anasayfa" className="group bg-slate-900 border border-blue-500/30 rounded-2xl p-8 hover:bg-slate-800 hover:border-blue-500/60 transition-all flex flex-col items-center text-center gap-4 shadow-lg hover:shadow-blue-900/20">
                        <span className="text-6xl group-hover:scale-110 transition-transform duration-300">🌍</span>
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-2">CEV Şampiyonlar Ligi</h2>
                            <p className="text-slate-400">Avrupa'nın en iyi takımları</p>
                        </div>
                        <div className="mt-2 px-4 py-2 bg-blue-600/20 text-blue-400 rounded-full text-sm font-bold group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            Lige Git →
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}
