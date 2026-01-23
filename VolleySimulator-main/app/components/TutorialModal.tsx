"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

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
            "Yardım için iletişime geçin",
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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div
                className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-700 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-scale-in"
                role="dialog"
                aria-modal="true"
                aria-labelledby="tutorial-title"
            >
                {/* Progress Bar */}
                <div className="h-1 bg-slate-800">
                    <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-300"
                        style={{ width: `${((currentStep + 1) / TUTORIAL_STEPS.length) * 100}%` }}
                    />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 font-medium">
                            {currentStep + 1} / {TUTORIAL_STEPS.length}
                        </span>
                    </div>
                    <button
                        onClick={handleSkip}
                        className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                    >
                        Atla
                    </button>
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
                    <h2 id="tutorial-title" className="text-xl font-bold text-white text-center mb-3">
                        {step.title}
                    </h2>
                    <p className="text-slate-400 text-center text-sm leading-relaxed mb-6">
                        {step.description}
                    </p>

                    {/* Tips */}
                    {step.tips && (
                        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                                💡 İpuçları
                            </div>
                            <ul className="space-y-2">
                                {step.tips.map((tip, index) => (
                                    <li key={index} className="flex items-start gap-2 text-sm text-slate-300">
                                        <span className="text-emerald-400 mt-0.5">•</span>
                                        {tip}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between p-4 border-t border-slate-800 bg-slate-900/50">
                    <button
                        onClick={handlePrev}
                        disabled={isFirstStep}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${isFirstStep
                            ? 'text-slate-600 cursor-not-allowed'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                    >
                        ← Geri
                    </button>

                    {/* Step Dots */}
                    <div className="flex gap-1.5">
                        {TUTORIAL_STEPS.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentStep(index)}
                                className={`w-2 h-2 rounded-full transition-all ${index === currentStep
                                    ? 'bg-emerald-500 w-6'
                                    : index < currentStep
                                        ? 'bg-emerald-500/50'
                                        : 'bg-slate-700'
                                    }`}
                            />
                        ))}
                    </div>

                    <button
                        onClick={handleNext}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${isLastStep
                            ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40'
                            : 'bg-slate-800 text-white hover:bg-slate-700'
                            }`}
                    >
                        {isLastStep ? 'Başla! 🚀' : 'İleri →'}
                    </button>
                </div>
            </div>

            <style jsx>{`
                @keyframes scale-in {
                    from {
                        transform: scale(0.9);
                        opacity: 0;
                    }
                    to {
                        transform: scale(1);
                        opacity: 1;
                    }
                }
                .animate-scale-in {
                    animation: scale-in 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
}

// Hook for tutorial state
export function useTutorial() {
    const [showTutorial, setShowTutorial] = useState(false);
    const [isFirstVisit, setIsFirstVisit] = useState(false);

    useEffect(() => {
        const completed = localStorage.getItem("tutorialCompleted");
        if (!completed) {
            setIsFirstVisit(true);
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
