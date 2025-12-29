"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "../../utils/supabase";
import Link from "next/link";
import { Suspense } from "react";

function ConsentContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const supabase = createClient();

    useEffect(() => {
        // Check if there's an auth code to exchange
        const code = searchParams.get('code');
        if (code) {
            supabase.auth.exchangeCodeForSession(code).then(() => {
                router.push('/profile');
            });
        }
    }, [searchParams, router]);

    return (
        <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md text-center">
                {/* Header */}
                <div className="mb-8">
                    <Link href="/" className="inline-block mb-6">
                        <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-200">
                            VolleySimulator
                        </span>
                    </Link>
                </div>

                {/* Consent Card */}
                <div className="bg-slate-900/80 rounded-2xl border border-slate-700 p-8 space-y-6">
                    <div className="w-16 h-16 mx-auto bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                        <span className="text-3xl">🔐</span>
                    </div>

                    <div>
                        <h1 className="text-2xl font-black text-white mb-2">Giriş Onayı</h1>
                        <p className="text-slate-400 text-sm">
                            VolleySimulator uygulamasına erişim izni verin
                        </p>
                    </div>

                    <div className="bg-slate-800/50 rounded-xl p-4 text-left space-y-3">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                            İzin Verilen Erişimler:
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-300">
                            <span className="text-emerald-400">✓</span>
                            <span>Profil bilgileriniz</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-300">
                            <span className="text-emerald-400">✓</span>
                            <span>E-posta adresiniz</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-300">
                            <span className="text-emerald-400">✓</span>
                            <span>Tahmin ve oyun ilerlemeniz</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Link
                            href="/profile"
                            className="block w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all text-center"
                        >
                            ✓ İzin Ver ve Devam Et
                        </Link>
                        <Link
                            href="/"
                            className="block w-full py-3 bg-slate-800 border border-slate-700 text-slate-400 font-medium rounded-xl hover:bg-slate-700 transition-all text-center"
                        >
                            İptal
                        </Link>
                    </div>
                </div>

                <p className="mt-6 text-xs text-slate-500">
                    Giriş yaparak{" "}
                    <a href="#" className="text-emerald-400 hover:underline">Kullanım Koşulları</a>
                    {" "}ve{" "}
                    <a href="#" className="text-emerald-400 hover:underline">Gizlilik Politikası</a>
                    &apos;nı kabul etmiş olursunuz.
                </p>
            </div>
        </main>
    );
}

export default function OAuthConsentPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
            </div>
        }>
            <ConsentContent />
        </Suspense>
    );
}
