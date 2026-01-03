'use client';

import { useEffect } from 'react';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Report to error tracking service
        if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('event', 'exception', {
                description: `Global Error: ${error.message}`,
                fatal: true,
                error_digest: error.digest,
            });
        }
        console.error('Global Error:', error);
    }, [error]);

    return (
        <html lang="tr">
            <body className="bg-slate-950 text-white min-h-screen flex items-center justify-center p-4">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 max-w-md w-full text-center shadow-2xl">
                    <div className="text-5xl mb-4">💥</div>
                    <h2 className="text-xl font-bold mb-2 text-white">
                        Kritik Hata
                    </h2>
                    <p className="text-slate-400 mb-6 text-sm">
                        Uygulama kritik bir hatayla karşılaştı. Sayfayı yenilemeyi deneyin.
                    </p>
                    
                    {error.digest && (
                        <p className="text-xs text-slate-500 mb-4">
                            Hata kodu: {error.digest}
                        </p>
                    )}
                    
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={reset}
                            className="w-full px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors font-bold"
                        >
                            🔄 Tekrar Dene
                        </button>
                        
                        <button
                            onClick={() => window.location.href = '/'}
                            className="w-full px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors font-medium"
                        >
                            🏠 Ana Sayfaya Dön
                        </button>
                    </div>
                </div>
            </body>
        </html>
    );
}
