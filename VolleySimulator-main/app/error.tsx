'use client';

import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-slate-100 p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 max-w-md w-full text-center shadow-2xl">
                <div className="text-4xl mb-4">⚠️</div>
                <h2 className="text-xl font-bold mb-2 text-white">Bir şeyler ters gitti!</h2>
                <p className="text-slate-400 mb-6 text-sm">
                    Uygulama beklenmedik bir hatayla karşılaştı. Lütfen tekrar deneyin.
                </p>
                <div className="bg-slate-950/50 p-3 rounded mb-6 text-left border border-slate-800">
                    <code className="text-xs text-rose-400 font-mono break-all line-clamp-4">
                        {error.message || "Bilinmeyen Hata"}
                    </code>
                </div>
                <button
                    onClick={reset}
                    className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors font-medium"
                >
                    Tekrar Dene
                </button>
            </div>
        </div>
    );
}
