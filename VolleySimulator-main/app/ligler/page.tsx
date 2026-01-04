import Link from "next/link";
import { Metadata } from "next";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Trophy, Globe, Zap, ArrowRight, Star } from "lucide-react";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
    title: "Ligler - Türkiye Kadınlar Voleybol Ligleri",
    description: "Sultanlar Ligi, 1. Lig, 2. Lig ve CEV Avrupa turnuvaları. 2025-2026 sezonu maç tahminleri ve puan durumları.",
};

const leagues = [
    {
        name: "Vodafone Sultanlar Ligi",
        desc: "Türkiye'nin en üst düzey kadınlar voleybol ligi",
        href: "/vsl/tahminoyunu",
        color: "from-red-600 to-rose-700",
        badge: "PRO LİG",
        icon: Trophy,
        stats: "14 Takım • Play-off Sistemi"
    },
    {
        name: "Arabica Coffee House 1. Lig",
        desc: "2 Gruplu 1. Lig Heyecanı",
        href: "/1lig/tahminoyunu",
        color: "from-amber-500 to-orange-600",
        badge: "YENİ",
        icon: Zap,
        stats: "2 Grup • 24 Takım"
    },
    {
        name: "Kadınlar 2. Lig",
        desc: "5 Gruplu Geniş Kapsamlı 2. Lig",
        href: "/2lig/tahminoyunu",
        color: "from-emerald-600 to-teal-700",
        badge: "AKTİF",
        icon: Star,
        stats: "5 Grup • Bölgesel Lig"
    },
    {
        name: "CEV Şampiyonlar Ligi",
        desc: "Avrupa'nın En İyilerinin Mücadelesi",
        href: "/cev-cl/tahminoyunu",
        color: "from-blue-600 to-indigo-700",
        badge: "AVRUPA",
        icon: Globe,
        stats: "Grup Aşaması • Play-off"
    }
];

export default function LiglerPage() {
    return (
        <main className="min-h-screen bg-background text-text-primary p-4 sm:p-8 lg:p-12 animate-in fade-in duration-500">
            <div className="max-w-6xl mx-auto space-y-12">

                {/* Hero / Header */}
                <div className="text-center space-y-4">
                    <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5 uppercase tracking-widest px-4">
                        Sezon 2025-2026
                    </Badge>
                    <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-text-primary uppercase italic">
                        AKTİF <span className="text-primary shadow-glow-primary">LİGLER</span>
                    </h1>
                    <p className="max-w-xl mx-auto text-text-secondary text-lg font-medium leading-relaxed">
                        Tahmin yapmak istediğin ligi seç ve simülasyona başla. Puanları toplayarak liderlik koltuğuna otur!
                    </p>
                </div>

                {/* Leagues Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                    {leagues.map((league) => (
                        <Link
                            key={league.name}
                            href={league.href}
                            className="group block"
                        >
                            <Card className="h-full relative overflow-hidden border-border-main/50 transition-all duration-500 group-hover:scale-[1.02] group-hover:border-primary/30 group-hover:shadow-premium-lg">
                                {/* Gradient Background overlay */}
                                <div className={cn(
                                    "absolute top-0 right-0 w-32 h-32 blur-[64px] opacity-10 transition-opacity group-hover:opacity-20 bg-gradient-to-br",
                                    league.color
                                )} />

                                <CardContent className="p-8">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className={cn(
                                            "w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-500 group-hover:rotate-6 bg-gradient-to-br",
                                            league.color
                                        )}>
                                            <league.icon className="w-7 h-7 text-white" />
                                        </div>
                                        <Badge variant="secondary" className="font-black text-[10px] tracking-widest px-3">
                                            {league.badge}
                                        </Badge>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <h2 className="text-2xl font-black text-text-primary tracking-tight group-hover:text-primary transition-colors">
                                                {league.name}
                                            </h2>
                                            <p className="text-text-secondary text-sm font-medium line-clamp-1">
                                                {league.desc}
                                            </p>
                                        </div>

                                        <div className="pt-4 flex items-center justify-between border-t border-border-subtle">
                                            <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">
                                                {league.stats}
                                            </span>
                                            <div className="flex items-center gap-1.5 text-primary font-bold text-sm">
                                                Giriş Yap
                                                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>

                {/* Info Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-12 border-t border-border-subtle">
                    <div className="flex gap-4">
                        <div className="shrink-0 w-10 h-10 rounded-full bg-surface-secondary flex items-center justify-center">
                            <Zap className="w-5 h-5 text-amber-500" />
                        </div>
                        <div className="space-y-1">
                            <h4 className="font-black text-xs uppercase tracking-widest">Hızlı Tahmin</h4>
                            <p className="text-xs text-text-secondary leading-relaxed">Özel arayüz ile saniyeler içinde tüm haftayı tahmin et.</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="shrink-0 w-10 h-10 rounded-full bg-surface-secondary flex items-center justify-center">
                            <Trophy className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div className="space-y-1">
                            <h4 className="font-black text-xs uppercase tracking-widest">Liderlik Yarışı</h4>
                            <p className="text-xs text-text-secondary leading-relaxed">Tahmin başarılarına göre global sıralamada yüksel.</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="shrink-0 w-10 h-10 rounded-full bg-surface-secondary flex items-center justify-center">
                            <ArrowRight className="w-5 h-5 text-blue-500" />
                        </div>
                        <div className="space-y-1">
                            <h4 className="font-black text-xs uppercase tracking-widest">Gelişmiş Veriler</h4>
                            <p className="text-xs text-text-secondary leading-relaxed">Yapay zeka destekli form durumlarını ve analizleri gör.</p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
