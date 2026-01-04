"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./Button";
import { Card } from "./Card";
import { X, ChevronRight, Zap, Trophy, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";

interface Step {
    title: string;
    description: string;
    icon: React.ElementType;
    target?: string;
}

const steps: Step[] = [
    {
        title: "Hoş Geldiniz!",
        description: "VolleySimulator ile ligleri simüle edin, puan durumunu tahmin edin ve sonuçları görün.",
        icon: Trophy,
    },
    {
        title: "Hızlı Tahmin",
        description: "Zap butonuna basarak 'Hızlı Tahmin' moduna geçebilir, skorları anında girebilirsiniz.",
        icon: Zap,
        target: "zap-button",
    },
    {
        title: "Puan Durumu",
        description: "Tahminleriniz anında puan durumuna yansır. Play-off ve Küme düşme hatlarını takip edin.",
        icon: TrendingUp,
        target: "standings-table",
    },
];

export default function OnboardingTour() {
    const [isOpen, setIsOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        const hasSeenTour = localStorage.getItem("hasSeenOnboarding_v1");
        if (!hasSeenTour) {
            setIsOpen(true);
        }
    }, []);

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            completeTour();
        }
    };

    const completeTour = () => {
        setIsOpen(false);
        localStorage.setItem("hasSeenOnboarding_v1", "true");
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#10b981', '#f59e0b', '#3b82f6']
        });
    };

    const skipTour = () => {
        setIsOpen(false);
        localStorage.setItem("hasSeenOnboarding_v1", "true");
    };

    if (!isOpen) return null;

    const current = steps[currentStep];
    const Icon = current.icon;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="w-full max-w-sm"
                >
                    <Card className="relative overflow-hidden border-primary/20 bg-surface-primary shadow-2xl">
                        <div className="absolute top-0 left-0 w-full h-1 bg-surface-secondary">
                            <motion.div
                                className="h-full bg-primary shadow-glow-primary"
                                initial={{ width: 0 }}
                                animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                            />
                        </div>

                        <button
                            onClick={skipTour}
                            className="absolute top-4 right-4 p-1 rounded-full hover:bg-surface-secondary transition-colors text-text-muted"
                            aria-label="Turu Atla"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="p-8 pb-6 flex flex-col items-center text-center">
                            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                                <Icon className="w-8 h-8 text-primary" />
                            </div>

                            <h2 className="text-2xl font-black text-text-primary tracking-tight mb-3">
                                {current.title}
                            </h2>

                            <p className="text-sm text-text-secondary leading-relaxed mb-8">
                                {current.description}
                            </p>

                            <div className="flex w-full gap-3">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="flex-1"
                                    onClick={skipTour}
                                >
                                    Atla
                                </Button>
                                <Button
                                    variant="primary"
                                    size="sm"
                                    className="flex-1 shadow-glow-primary"
                                    onClick={handleNext}
                                    rightIcon={<ChevronRight className="w-4 h-4" />}
                                >
                                    {currentStep === steps.length - 1 ? "Başla!" : "İleri"}
                                </Button>
                            </div>

                            <div className="flex gap-1.5 mt-8">
                                {steps.map((_, i) => (
                                    <div
                                        key={i}
                                        className={cn(
                                            "w-1.5 h-1.5 rounded-full transition-all duration-300",
                                            i === currentStep ? "w-4 bg-primary" : "bg-border-subtle"
                                        )}
                                    />
                                ))}
                            </div>
                        </div>
                    </Card>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
