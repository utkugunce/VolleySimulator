"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useGameState } from "../utils/gameState";
import { useToast } from "../components/Toast";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { motion, AnimatePresence } from "framer-motion";
import {
    Volume2, VolumeX, Sun, Moon, Bell, BellOff, Download,
    Trash2, HelpCircle, RefreshCcw, User, ShieldCheck, Mail, Info
} from "lucide-react";
import { cn } from "@/lib/utils";

const TutorialModal = dynamic(() => import("../components/TutorialModal"), {
    loading: () => null,
    ssr: false,
});

// Theme handling integrated with system design
function useLocalTheme() {
    const [theme, setThemeState] = useState<'dark' | 'light'>('dark');

    useEffect(() => {
        const saved = localStorage.getItem('theme') as 'dark' | 'light' | null;
        if (saved) {
            setThemeState(saved);
        }
    }, []);

    const setTheme = (newTheme: 'dark' | 'light') => {
        setThemeState(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
    };

    return { theme, setTheme };
}

export default function AyarlarPage() {
    const { user } = useAuth();
    const { gameState, toggleSound } = useGameState();
    const { showToast } = useToast();
    const { theme, setTheme } = useLocalTheme();

    const [notifications, setNotifications] = useState(true);
    const [showTutorial, setShowTutorial] = useState(false);

    const handleResetData = () => {
        if (confirm("Tüm oyun verileriniz (XP, seviye, başarımlar, tahminler) silinecek. Bu işlem geri alınamaz. Emin misiniz?")) {
            localStorage.removeItem('volleySimGameState');
            localStorage.removeItem('1ligGroupScenarios');
            localStorage.removeItem('groupScenarios');
            localStorage.removeItem('playoffScenarios');
            showToast("Tüm veriler sıfırlandı. Sayfa yenileniyor...", "success");
            setTimeout(() => window.location.reload(), 1000);
        }
    };

    const handleExportData = () => {
        try {
            const exportData = {
                gameState: gameState,
                lig1Scenarios: JSON.parse(localStorage.getItem('1ligGroupScenarios') || '{}'),
                lig2Scenarios: JSON.parse(localStorage.getItem('groupScenarios') || '{}'),
                exportDate: new Date().toISOString()
            };
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
            const a = document.createElement('a');
            a.href = dataStr;
            a.download = `volleysimulator-backup-${new Date().toLocaleDateString('tr-TR')}.json`;
            a.click();
            showToast("Veriler indirildi", "success");
        } catch (e) {
            showToast("Hata oluştu", "error");
        }
    };

    return (
        <main className="min-h-screen bg-background text-text-primary p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500">
            <div className="max-w-2xl mx-auto space-y-8">

                {/* Header Section */}
                <div className="space-y-1 border-b border-border-subtle pb-6">
                    <h1 className="text-4xl font-black tracking-tighter text-text-primary uppercase italic">
                        UYGULAMA <span className="text-primary shadow-glow-primary">AYARLARI</span>
                    </h1>
                    <p className="text-text-secondary font-medium">Uygulama deneyiminizi kişiselleştirin ve verilerinizi yönetin.</p>
                </div>

                <div className="space-y-4">
                    {/* General Settings */}
                    <SectionHeader title="GENEL TERCİHLER" icon={<Info className="w-4 h-4" />} />

                    <div className="grid grid-cols-1 gap-3">
                        {/* Sound Toggle */}
                        <SettingCard
                            title="Ses Efektleri"
                            desc="Tahmin ve başarımlarda geri bildirim sesleri."
                            icon={gameState.soundEnabled ? <Volume2 className="text-emerald-500" /> : <VolumeX className="text-text-muted" />}
                            action={
                                <Toggle
                                    enabled={gameState.soundEnabled}
                                    onClick={toggleSound}
                                    activeColor="bg-emerald-500 shadow-glow-primary"
                                />
                            }
                        />

                        {/* Theme Select */}
                        <SettingCard
                            title="Arayüz Teması"
                            desc="Koyu veya Açık mod arasında geçiş yapın."
                            icon={theme === 'dark' ? <Moon className="text-primary" /> : <Sun className="text-amber-500" />}
                            action={
                                <select
                                    value={theme}
                                    onChange={(e) => setTheme(e.target.value as 'dark' | 'light')}
                                    className="bg-surface-secondary border border-border-subtle rounded-lg px-3 py-1.5 text-xs font-black uppercase text-text-primary outline-none focus:border-primary/50 transition-all"
                                    aria-label="Tema Seçimi"
                                >
                                    <option value="dark">KOYU</option>
                                    <option value="light">AÇIK</option>
                                </select>
                            }
                        />

                        {/* Notifications */}
                        <SettingCard
                            title="Bildirimler"
                            desc="Uygulama içi anlık bildirimler ve duyurular."
                            icon={notifications ? <Bell className="text-primary" /> : <BellOff className="text-text-muted" />}
                            action={
                                <Toggle
                                    enabled={notifications}
                                    onClick={() => setNotifications(!notifications)}
                                />
                            }
                        />
                    </div>

                    {/* Data Management */}
                    <SectionHeader title="VERİ YÖNETİMİ" icon={<ShieldCheck className="w-4 h-4" />} />

                    <div className="grid grid-cols-1 gap-3">
                        <ActionButton
                            title="Tahmin Verilerini Yedekle"
                            desc="Tüm ilerlemenizi JSON formatında cihazınıza kaydedin."
                            icon={<Download className="w-5 h-5 text-emerald-500" />}
                            onClick={handleExportData}
                        />
                        <ActionButton
                            title="Tüm Verileri Sıfırla"
                            desc="XP, seviye ve tüm yerel tahmin geçmişini kalıcı olarak siler."
                            icon={<Trash2 className="w-5 h-5 text-rose-500" />}
                            danger
                            onClick={handleResetData}
                        />
                    </div>

                    {/* Help & Support */}
                    <SectionHeader title="YARDIM VE DESTEK" icon={<HelpCircle className="w-4 h-4" />} />

                    <div className="grid grid-cols-1 gap-3">
                        <ActionButton
                            title="Uygulama Rehberini Başlat"
                            desc="Temel özelliklerin nasıl kullanılacağını gösterir."
                            icon={<HelpCircle className="w-5 h-5 text-primary" />}
                            highlight
                            onClick={() => setShowTutorial(true)}
                        />
                        <ActionButton
                            title="Rehber Durumunu Sıfırla"
                            desc="Rehberin bir sonraki girişte tekrar otomatik görünmesini sağlar."
                            icon={<RefreshCcw className="w-5 h-5 text-text-muted" />}
                            onClick={() => {
                                localStorage.removeItem('tutorialCompleted');
                                showToast("Rehber sıfırlandı", "success");
                            }}
                        />
                    </div>

                    {/* Account Info */}
                    <SectionHeader title="HESAP BİLGİLERİ" icon={<User className="w-4 h-4" />} />

                    <Card className="bg-surface-secondary/20 border-border-main border-dashed">
                        <CardContent className="p-4 sm:p-6">
                            {user ? (
                                <div className="flex flex-col sm:flex-row justify-between gap-4 items-center">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                                            <Mail className="w-6 h-6 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-black text-text-primary tracking-tight">{user.email}</p>
                                            <Badge variant="success" className="h-5 px-2 py-0 text-[8px] font-black uppercase tracking-widest mt-1">KAYITLI KULLANICI</Badge>
                                        </div>
                                    </div>
                                    <Button variant="ghost" onClick={() => window.location.href = '/profile'} className="text-xs font-black uppercase tracking-widest text-primary">PROFİLE GİT</Button>
                                </div>
                            ) : (
                                <div className="text-center space-y-4">
                                    <p className="text-sm text-text-secondary font-medium italic">Giriş yaparak tüm cihazlarınızdan ilerlemenize erişebilirsiniz.</p>
                                    <Button variant="primary" onClick={() => window.location.href = '/login'} className="shadow-glow-primary font-black uppercase tracking-widest text-xs px-8">GİRİŞ YAP</Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* App Version */}
                    <div className="text-center pt-8 opacity-30">
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-text-muted">VolleySimulator • Build v1.0.b • 2026</p>
                    </div>
                </div>
            </div>

            <TutorialModal isOpen={showTutorial} onClose={() => setShowTutorial(false)} />
        </main>
    );
}

const SectionHeader = ({ title, icon }: { title: string; icon: React.ReactNode }) => (
    <div className="flex items-center gap-2 pt-4 pb-2 border-b border-border-subtle mb-4">
        <div className="text-primary">{icon}</div>
        <h2 className="text-[10px] font-black tracking-[0.2em] text-text-muted uppercase">{title}</h2>
    </div>
);

const SettingCard = ({ title, desc, icon, action }: { title: string; desc: string; icon: React.ReactNode; action: React.ReactNode }) => (
    <Card className="bg-surface-primary border-border-main/50 overflow-hidden">
        <CardContent className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 overflow-hidden">
                <div className="w-10 h-10 rounded-xl bg-surface-secondary flex items-center justify-center shrink-0">
                    {icon}
                </div>
                <div className="overflow-hidden">
                    <h3 className="text-sm font-black text-text-primary uppercase tracking-tight truncate">{title}</h3>
                    <p className="text-[10px] text-text-secondary font-medium line-clamp-1">{desc}</p>
                </div>
            </div>
            {action}
        </CardContent>
    </Card>
);

const ActionButton = ({ title, desc, icon, onClick, danger, highlight }: { title: string; desc: string; icon: React.ReactNode; onClick: () => void; danger?: boolean; highlight?: boolean }) => (
    <button
        onClick={onClick}
        className={cn(
            "w-full text-left group transition-all duration-300",
            highlight ? "" : ""
        )}
    >
        <Card className={cn(
            "transition-all duration-300 border-border-main/50 group-hover:bg-surface-secondary/50",
            highlight ? "bg-primary/5 border-primary/20 group-hover:bg-primary/10 group-hover:border-primary/40" : "bg-surface-primary",
            danger ? "group-hover:border-rose-500/40" : ""
        )}>
            <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 duration-500",
                        highlight ? "bg-primary/20" : "bg-surface-secondary"
                    )}>
                        {icon}
                    </div>
                    <div>
                        <h3 className={cn(
                            "text-sm font-black uppercase tracking-tight",
                            danger ? "group-hover:text-rose-500" : highlight ? "text-primary" : "text-text-primary"
                        )}>
                            {title}
                        </h3>
                        <p className="text-[10px] text-text-secondary font-medium">{desc}</p>
                    </div>
                </div>
                <span className={cn(
                    "text-lg transition-transform group-hover:translate-x-1 duration-300",
                    danger ? "text-rose-400" : highlight ? "text-primary" : "text-text-muted"
                )}>→</span>
            </CardContent>
        </Card>
    </button>
);

const Toggle = ({ enabled, onClick, activeColor = "bg-primary shadow-glow-primary" }: { enabled: boolean; onClick: () => void; activeColor?: string }) => (
    <button
        onClick={onClick}
        className={cn(
            "w-10 h-5 rounded-full transition-all relative border border-border-subtle shrink-0",
            enabled ? activeColor : "bg-surface-dark"
        )}
        aria-label="Seçeneği Değiştir"
    >
        <motion.div
            layout
            className="w-3.5 h-3.5 bg-white rounded-full absolute top-0.5"
            animate={{ x: enabled ? 20 : 2 }}
        />
    </button>
);
