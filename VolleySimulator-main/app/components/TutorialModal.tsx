"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface TutorialStep {
    id: string;
    title: string;
    description: string;
    icon: string;
    image?: string;
    tips?: string[];
}

const TUTORIAL_STEPS: TutorialStep[] = [
    {
        id: "welcome",
        title: "VolleySimulator'a Hoş Geldiniz!",
        description: "Türkiye Kadınlar Voleybol Ligi tahmin oyununa hoş geldiniz. Bu rehber size uygulamayı nasıl kullanacağınızı gösterecek.",
        icon: "🏐",
        tips: [
            "Tahmin yaparak XP kazanın",
            "Seviye atlayarak yeni rozetler açın",
            "Arkadaşlarınızla yarışın"
        ]
    },
    {
        id: "leagues",
        title: "Lig Seçimi",
        description: "Alt menüden 'Ligler' butonuna tıklayarak takip etmek istediğiniz ligi seçin. Şu an Türkiye 1. Lig ve 2. Lig mevcuttur.",
        icon: "🇹🇷",
        tips: [
            "1. Lig: Arabica Coffee House Kadınlar Voleybol 1. Ligi",
            "2. Lig: Kadınlar 2. Lig",
            "Yakında yeni ülkeler eklenecek!"
        ]
    },
    {
        id: "predictions",
        title: "Tahmin Yapma",
        description: "Maç listesinden bir maç seçin ve tahmininizi girin. Her maç için ev sahibi ve deplasman takımının set skorunu tahmin edin.",
        icon: "🎯",
        tips: [
            "3-0, 3-1, 3-2, 2-3, 1-3, 0-3 skorlarından birini seçin",
            "Maç oynanmadan tahmin yapmalısınız",
            "Tahminlerinizi istediğiniz zaman güncelleyebilirsiniz"
        ]
    },
    {
        id: "standings",
        title: "Puan Durumu",
        description: "Sol tarafta canlı puan durumunu göreceksiniz. Tahminlerinize göre takımların sıralaması anlık olarak güncellenir.",
        icon: "📊",
        tips: [
            "Yeşil oklar yükselen takımları gösterir",
            "Kırmızı oklar düşen takımları gösterir",
            "Gruplar arasında geçiş yapabilirsiniz"
        ]
    },
    {
        id: "xp_system",
        title: "XP ve Seviye Sistemi",
        description: "Her tahmin yaptığınızda XP kazanırsınız. XP biriktirerek seviye atlarsınız ve yeni ünvanlar kazanırsınız.",
        icon: "⚡",
        tips: [
            "Tahmin başına +10 XP",
            "Doğru tahmin bonusu ek XP kazandırır",
            "Başarımlar büyük XP ödülleri verir"
        ]
    },
    {
        id: "achievements",
        title: "Başarımlar",
        description: "Özel görevleri tamamlayarak başarım rozetleri kazanın. Her başarım size ekstra XP ve özel ödüller verir.",
        icon: "🏆",
        tips: [
            "İlk tahmin: 'İlk Adım' rozeti",
            "50+ tahmin: 'Oyun Bağımlısı' rozeti",
            "Profilinizden tüm başarımları görüntüleyin"
        ]
    },
    {
        id: "save_share",
        title: "Kaydet ve Paylaş",
        description: "Tahminlerinizi JSON dosyası olarak kaydedebilir veya puan durumunu sosyal medyada paylaşabilirsiniz.",
        icon: "💾",
        tips: [
            "Kaydet: Tüm tahminlerinizi indirin",
            "Yükle: Önceki tahminlerinizi geri yükleyin",
            "Paylaş: Sonuçları görsel olarak paylaşın"
        ]
    },
    {
        id: "finish",
        title: "Hazırsınız!",
        description: "Artık VolleySimulator'ı kullanmaya hazırsınız. İyi tahminler ve bol şans!",
        icon: "🎉",
        tips: [
            "Sorularınız için Ayarlar > Yardım",
            "Geri bildirim için iletişime geçin",
            "Keyifli oyunlar!"
        ]
    }
];

interface TutorialModalProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete?: () => void;
}

export default function TutorialModal({ isOpen, onClose, onComplete }: TutorialModalProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    const step = TUTORIAL_STEPS[currentStep];
    const isLastStep = currentStep === TUTORIAL_STEPS.length - 1;
    const isFirstStep = currentStep === 0;

    const handleNext = () => {
        if (isLastStep) {
            handleComplete();
        } else {
            setIsAnimating(true);
            setTimeout(() => {
                setCurrentStep(prev => prev + 1);
                setIsAnimating(false);
            }, 150);
        }
    };

    const handlePrev = () => {
        if (!isFirstStep) {
            setIsAnimating(true);
            setTimeout(() => {
                setCurrentStep(prev => prev - 1);
                setIsAnimating(false);
            }, 150);
        }
    };

    const handleComplete = () => {
        localStorage.setItem("tutorialCompleted", "true");
        onComplete?.();
        onClose();
    };

    const handleSkip = () => {
        localStorage.setItem("tutorialCompleted", "true");
        onClose();
    };

    const progressValue = ((currentStep + 1) / TUTORIAL_STEPS.length) * 100;

    return (
        <Dialog open={isOpen} onOpenChange={() => onClose()}>
            <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
                {/* Progress Bar */}
                <Progress value={progressValue} className="h-1 rounded-none" />

                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b">
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground font-medium">
                            {currentStep + 1} / {TUTORIAL_STEPS.length}
                        </span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={handleSkip} className="text-xs">
                        Atla
                    </Button>
                </div>

                {/* Content */}
                <div className={`p-6 transition-opacity duration-150 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
                    {/* Icon */}
                    <div className="flex justify-center mb-6">
                        <div className="w-20 h-20 bg-gradient-to-br from-emerald-600/30 to-cyan-600/30 rounded-2xl flex items-center justify-center border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
                            <span className="text-4xl">{step.icon}</span>
                        </div>
                    </div>

                    {/* Title & Description */}
                    <h2 className="text-xl font-bold text-foreground text-center mb-3">
                        {step.title}
                    </h2>
                    <p className="text-muted-foreground text-center text-sm leading-relaxed mb-6">
                        {step.description}
                    </p>

                    {/* Tips */}
                    {step.tips && (
                        <div className="bg-muted rounded-xl p-4 border">
                            <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                                💡 İpuçları
                            </div>
                            <ul className="space-y-2">
                                {step.tips.map((tip, index) => (
                                    <li key={index} className="flex items-start gap-2 text-sm text-foreground/80">
                                        <span className="text-emerald-400 mt-0.5">•</span>
                                        {tip}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between p-4 border-t bg-muted/50">
                    <Button
                        variant="ghost"
                        onClick={handlePrev}
                        disabled={isFirstStep}
                        className="text-sm"
                    >
                        ← Geri
                    </Button>

                    {/* Step Dots */}
                    <div className="flex gap-1.5">
                        {TUTORIAL_STEPS.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentStep(index)}
                                title={`Adım ${index + 1}'e git`}
                                className={`h-2 rounded-full transition-all ${index === currentStep
                                    ? 'bg-emerald-500 w-6'
                                    : index < currentStep
                                        ? 'bg-emerald-500/50 w-2'
                                        : 'bg-muted-foreground/30 w-2'
                                    }`}
                            />
                        ))}
                    </div>

                    <Button
                        onClick={handleNext}
                        className={isLastStep ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 text-white' : ''}
                        variant={isLastStep ? 'default' : 'secondary'}
                    >
                        {isLastStep ? 'Başla! 🚀' : 'İleri →'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// Hook for tutorial state
export function useTutorial() {
    const [showTutorial, setShowTutorial] = useState(false);
    const [isFirstVisit, setIsFirstVisit] = useState(false);

    useEffect(() => {
        const completed = localStorage.getItem("tutorialCompleted");
        if (!completed) {
            Promise.resolve().then(() => {
                setIsFirstVisit(true);
            });
            // Show tutorial on first visit after a short delay
            setTimeout(() => setShowTutorial(true), 1000);
        }
    }, []);

    const openTutorial = () => setShowTutorial(true);
    const closeTutorial = () => setShowTutorial(false);
    const resetTutorial = () => {
        localStorage.removeItem("tutorialCompleted");
        setShowTutorial(true);
    };

    return {
        showTutorial,
        isFirstVisit,
        openTutorial,
        closeTutorial,
        resetTutorial
    };
}
