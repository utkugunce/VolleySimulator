'use client';

import { useEffect } from 'react';
import Link from 'next/link';

// Error tracking - could be Sentry, LogRocket, etc.
function reportError(error: Error, digest?: string) {
    // Send to external error tracking service
    if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'exception', {
            description: error.message,
            fatal: true,
            error_digest: digest,
        });
    }
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
        console.error('Error reported:', { error, digest });
    }
}

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        reportError(error, error.digest);
    }, [error]);

    const isNetworkError = error.message?.toLowerCase().includes('network') ||
                           error.message?.toLowerCase().includes('fetch');
    
    const isAuthError = error.message?.toLowerCase().includes('unauthorized') ||
                        error.message?.toLowerCase().includes('auth');

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-slate-100 p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 max-w-md w-full text-center shadow-2xl">
                <div className="text-5xl mb-4">
                    {isNetworkError ? '📡' : isAuthError ? '🔐' : '⚠️'}
                </div>
                <h2 className="text-xl font-bold mb-2 text-white">
                    {isNetworkError 
                        ? 'Bağlantı Hatası' 
                        : isAuthError 
                            ? 'Oturum Hatası'
                            : 'Bir şeyler ters gitti!'}
                </h2>
                <p className="text-slate-400 mb-6 text-sm">
                    {isNetworkError 
                        ? 'İnternet bağlantınızı kontrol edip tekrar deneyin.'
                        : isAuthError
                            ? 'Oturumunuz sona ermiş olabilir. Tekrar giriş yapın.'
                            : 'Uygulama beklenmedik bir hatayla karşılaştı. Lütfen tekrar deneyin.'}
                </p>
                
                {/* Error details in development */}
                {process.env.NODE_ENV === 'development' && (
                    <div className="bg-slate-950/50 p-3 rounded mb-6 text-left border border-slate-800">
                        <code className="text-xs text-rose-400 font-mono break-all line-clamp-4">
                            {error.message || "Bilinmeyen Hata"}
                        </code>
                        {error.digest && (
                            <p className="text-xs text-slate-500 mt-2">
                                Digest: {error.digest}
                            </p>
                        )}
                    </div>
                )}
                
                {/* Production: show simple error code */}
                {process.env.NODE_ENV === 'production' && error.digest && (
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
                    
                    {isAuthError && (
                        <Link 
                            href="/login"
                            className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors font-bold block"
                        >
                            🔐 Giriş Yap
                        </Link>
                    )}
                    
                    <Link 
                        href="/"
                        className="w-full px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors font-medium block"
                    >
                        🏠 Ana Sayfaya Dön
                    </Link>
                </div>
                
                {/* Helpful tips */}
                <div className="mt-6 pt-4 border-t border-slate-800">
                    <p className="text-xs text-slate-500">
                        Sorun devam ederse{' '}
                        <a 
                            href="mailto:destek@volleysimulator.com" 
                            className="text-emerald-400 hover:underline"
                        >
                            destek@volleysimulator.com
                        </a>
                        {' '}adresinden bize ulaşın.
                    </p>
                </div>
            </div>
        </div>
    );
}
