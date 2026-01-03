import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-slate-100 p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 max-w-md w-full text-center shadow-2xl">
                <div className="text-6xl mb-4">🏐</div>
                <h1 className="text-4xl font-bold mb-2 text-white">404</h1>
                <h2 className="text-xl font-medium mb-4 text-slate-300">
                    Sayfa Bulunamadı
                </h2>
                <p className="text-slate-400 mb-6 text-sm">
                    Aradığınız sayfa mevcut değil veya taşınmış olabilir.
                </p>
                
                <div className="flex flex-col gap-3">
                    <Link 
                        href="/"
                        className="w-full px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors font-bold block"
                    >
                        🏠 Ana Sayfaya Dön
                    </Link>
                    
                    <Link 
                        href="/ligler"
                        className="w-full px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors font-medium block"
                    >
                        ⚽ Liglere Git
                    </Link>
                </div>
                
                {/* Quick links */}
                <div className="mt-6 pt-4 border-t border-slate-800">
                    <p className="text-xs text-slate-500 mb-3">Popüler Sayfalar</p>
                    <div className="flex flex-wrap justify-center gap-2">
                        <Link 
                            href="/vsl/tahminoyunu" 
                            className="text-xs px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-300 transition-colors"
                        >
                            VSL Tahmin
                        </Link>
                        <Link 
                            href="/1lig/tahminoyunu" 
                            className="text-xs px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-300 transition-colors"
                        >
                            1.Lig Tahmin
                        </Link>
                        <Link 
                            href="/leaderboard" 
                            className="text-xs px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-300 transition-colors"
                        >
                            Liderlik
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
