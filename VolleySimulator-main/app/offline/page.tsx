'use client';

import Link from 'next/link';

export default function OfflinePage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 flex flex-col items-center justify-center p-4">
            <div className="text-center space-y-6 max-w-md">
                {/* Icon */}
                <div className="text-6xl">📡</div>

                {/* Title */}
                <h1 className="text-3xl font-bold text-white">
                    İnternet Bağlantısı Yok
                </h1>

                {/* Description */}
                <p className="text-slate-400 text-lg">
                    Şu anda çevrimdışısınız. Lütfen internet bağlantınızı kontrol edin.
                </p>

                {/* Cached Content Info */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 text-sm text-slate-300">
                    <p className="mb-2">✓ Kacak sayfa önbellekte saklanmıştır</p>
                    <p className="mb-2">✓ Tahminleriniz yerel olarak kaydedilmiştir</p>
                    <p>✓ Bağlantı sağlandığında senkronize olacaktır</p>
                </div>

                {/* Actions */}
                <div className="space-y-3 pt-4">
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-colors"
                    >
                        Yenile
                    </button>

                    <Link
                        href="/"
                        className="block w-full px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg transition-colors text-center"
                    >
                        Ana Sayfaya Dön
                    </Link>
                </div>

                {/* Tips */}
                <div className="text-xs text-slate-500 space-y-1 pt-4 border-t border-slate-800">
                    <p>💡 WiFi bağlantınızı kontrol edin</p>
                    <p>💡 Mobil veri bağlantınızı açmayı deneyin</p>
                    <p>💡 Uçak modu kapalı olduğundan emin olun</p>
                </div>
            </div>
        </div>
    );
}
