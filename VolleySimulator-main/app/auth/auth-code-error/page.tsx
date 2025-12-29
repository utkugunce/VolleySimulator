"use client";

import Link from "next/link";

export default function AuthCodeErrorPage() {
    return (
        <main className="min-h-screen relative flex flex-col items-center justify-center p-4 overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0a1a] to-black -z-20"></div>
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20 -z-10"></div>

            {/* Ambient Light */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-rose-500/20 rounded-full blur-[128px] -z-10"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-[128px] -z-10"></div>

            <div className="w-full max-w-md mx-auto text-center space-y-6">
                {/* Error Icon */}
                <div className="text-6xl animate-bounce">😔</div>

                {/* Error Message */}
                <div className="bg-slate-900/60 backdrop-blur-xl border border-rose-500/30 rounded-3xl p-8 space-y-4">
                    <h1 className="text-2xl font-bold text-white">Giriş Başarısız</h1>
                    <p className="text-slate-400">
                        Google ile giriş yapılırken bir hata oluştu. Lütfen tekrar deneyin.
                    </p>

                    <div className="pt-4 space-y-3">
                        <Link
                            href="/login"
                            className="block w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                            Tekrar Dene
                        </Link>

                        <Link
                            href="/"
                            className="block w-full py-3 bg-slate-800 border border-slate-700 text-white font-medium rounded-xl hover:bg-slate-700 transition-all"
                        >
                            Ana Sayfaya Dön
                        </Link>
                    </div>
                </div>

                {/* Help Text */}
                <p className="text-xs text-slate-500">
                    Sorun devam ederse e-posta ile giriş yapmayı deneyebilirsiniz.
                </p>
            </div>
        </main>
    );
}
