"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
    Share2, 
    Download, 
    Play, 
    AlertCircle, 
    Clock,
    User,
    Calendar,
    Loader2
} from 'lucide-react';
import { decodeScenarioShareCode } from '../../lib/calculation/scenarioUtils';
import { ScenarioExport } from '../../types';
import Link from 'next/link';

export default function ScenarioSharePage() {
    const params = useParams();
    const router = useRouter();
    const shareId = params.shareId as string;
    
    const [scenario, setScenario] = useState<ScenarioExport | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [imported, setImported] = useState(false);

    useEffect(() => {
        if (!shareId) {
            setError('Geçersiz paylaşım kodu');
            setLoading(false);
            return;
        }

        try {
            const decoded = decodeScenarioShareCode(shareId);
            
            if (!decoded) {
                setError('Senaryo bulunamadı veya süresi dolmuş');
                setLoading(false);
                return;
            }

            setScenario(decoded);
        } catch (err) {
            setError('Senaryo yüklenirken hata oluştu');
        } finally {
            setLoading(false);
        }
    }, [shareId]);

    const handleImportAndPlay = () => {
        if (!scenario) return;

        // Store scenario in localStorage for the calculator to load
        const groupKey = `scenario_import_${scenario.groupId}`;
        localStorage.setItem(groupKey, JSON.stringify(scenario.overrides));
        
        // Also store a flag to indicate imported scenario
        localStorage.setItem('volleySim_importedScenario', JSON.stringify({
            ...scenario,
            importedAt: new Date().toISOString()
        }));

        setImported(true);

        // Redirect to the appropriate league page
        setTimeout(() => {
            if (scenario.league === '2lig') {
                router.push(`/2lig/group/${scenario.groupId}`);
            } else {
                router.push('/vsl/gunceldurum');
            }
        }, 1500);
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            // Could add toast notification here
        } catch (err) {
            console.error('Failed to copy link');
        }
    };

    const getOverrideCount = () => {
        if (!scenario?.overrides) return 0;
        return Object.keys(scenario.overrides).length;
    };

    if (loading) {
        return (
            <main className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-text-muted">Senaryo yükleniyor...</p>
                </div>
            </main>
        );
    }

    if (error || !scenario) {
        return (
            <main className="min-h-screen bg-background flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-md w-full bg-surface-primary border border-red-500/30 rounded-2xl p-8 text-center"
                >
                    <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-8 h-8 text-red-400" />
                    </div>
                    <h1 className="text-xl font-bold text-text-primary mb-2">Senaryo Bulunamadı</h1>
                    <p className="text-text-muted mb-6">{error}</p>
                    <Link 
                        href="/"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-colors"
                    >
                        Ana Sayfaya Dön
                    </Link>
                </motion.div>
            </main>
        );
    }

    if (imported) {
        return (
            <main className="min-h-screen bg-background flex items-center justify-center p-4">
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="max-w-md w-full bg-surface-primary border border-primary/30 rounded-2xl p-8 text-center"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring' }}
                        className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4"
                    >
                        <span className="text-4xl">✅</span>
                    </motion.div>
                    <h1 className="text-xl font-bold text-text-primary mb-2">Senaryo Yüklendi!</h1>
                    <p className="text-text-muted mb-2">Yönlendiriliyorsunuz...</p>
                    <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
                </motion.div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-background">
            {/* Header */}
            <div className="bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-8">
                <div className="max-w-2xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-4">
                        <Share2 className="w-4 h-4 text-white" />
                        <span className="text-white/80 text-sm">Paylaşılan Senaryo</span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                        Senaryo Meydan Okuması
                    </h1>
                    <p className="text-white/70">
                        Birisi seninle bir voleybol senaryosu paylaştı!
                    </p>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-8">
                {/* Scenario Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-surface-primary border border-border-subtle rounded-2xl overflow-hidden mb-6"
                >
                    {/* Scenario Header */}
                    <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">
                                    {scenario.league === '2lig' ? '2. Lig' : 'Sultanlar Ligi'}
                                </div>
                                <h2 className="text-xl font-bold text-white">
                                    {scenario.groupId ? `Grup ${scenario.groupId.toUpperCase()}` : 'Özel Senaryo'}
                                </h2>
                            </div>
                            <div className="text-4xl">🎮</div>
                        </div>
                    </div>

                    {/* Scenario Details */}
                    <div className="p-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                                    <Calendar className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <div className="text-xs text-text-muted">Oluşturulma</div>
                                    <div className="text-sm font-medium text-text-primary">
                                        {new Date(scenario.timestamp).toLocaleDateString('tr-TR')}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center">
                                    <Clock className="w-5 h-5 text-accent" />
                                </div>
                                <div>
                                    <div className="text-xs text-text-muted">Değişiklik</div>
                                    <div className="text-sm font-medium text-text-primary">
                                        {getOverrideCount()} maç sonucu
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Match Count Info */}
                        {scenario.metadata && (
                            <div className="bg-surface-secondary rounded-xl p-4">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-text-muted">Tamamlanan Maçlar</span>
                                    <span className="font-medium text-text-primary">
                                        {scenario.metadata.completedMatches} / {scenario.metadata.totalMatches}
                                    </span>
                                </div>
                                <div className="mt-2 h-2 bg-slate-700 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-gradient-to-r from-primary to-accent transition-all"
                                        style={{ 
                                            width: `${(scenario.metadata.completedMatches / scenario.metadata.totalMatches) * 100}%` 
                                        }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Challenge Text */}
                        <div className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/20 rounded-xl p-4">
                            <div className="flex items-start gap-3">
                                <span className="text-2xl">🤔</span>
                                <div>
                                    <div className="font-medium text-text-primary mb-1">
                                        Meydan Okuma
                                    </div>
                                    <p className="text-sm text-text-secondary">
                                        Bu senaryoda şampiyon kim olur? Tahminini yap ve arkadaşınla yarış!
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Actions */}
                <div className="space-y-3">
                    <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        onClick={handleImportAndPlay}
                        className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-bold text-lg hover:opacity-90 transition-opacity"
                    >
                        <Play className="w-5 h-5" />
                        Senaryoyu Yükle ve Oyna
                    </motion.button>

                    <div className="grid grid-cols-2 gap-3">
                        <motion.button
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            onClick={handleCopyLink}
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-surface-secondary text-text-primary rounded-xl font-medium hover:bg-surface-primary transition-colors"
                        >
                            <Share2 className="w-4 h-4" />
                            Linki Kopyala
                        </motion.button>

                        <motion.a
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            href={`data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(scenario, null, 2))}`}
                            download={`scenario-${shareId}.json`}
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-surface-secondary text-text-primary rounded-xl font-medium hover:bg-surface-primary transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            JSON İndir
                        </motion.a>
                    </div>
                </div>

                {/* Info Footer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-8 text-center text-sm text-text-muted"
                >
                    <p>Bu senaryo 7 gün boyunca geçerlidir.</p>
                    <Link href="/" className="text-primary hover:underline mt-2 inline-block">
                        Kendi senaryonu oluştur →
                    </Link>
                </motion.div>
            </div>
        </main>
    );
}
