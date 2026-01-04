"use client";

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameState } from '../../utils/gameState';
import { Button } from './Button';
import { Trophy, Star, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';

export function LevelUpModal() {
    const { gameState, showLevelUp, clearLevelUp, getLevelTitle } = useGameState();

    useEffect(() => {
        if (showLevelUp) {
            // Play sound would go here
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#10b981', '#fbbf24', '#3b82f6']
            });
        }
    }, [showLevelUp]);

    if (!showLevelUp) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                <motion.div
                    initial={{ scale: 0.5, opacity: 0, y: 100 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.5, opacity: 0, y: 100 }}
                    className="relative w-full max-w-sm bg-surface-primary rounded-[32px] p-8 border border-primary/20 shadow-glow-primary overflow-hidden"
                >
                    {/* Background Glows */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/10 blur-[80px] rounded-full -z-10" />

                    <div className="flex flex-col items-center text-center">
                        <motion.div
                            initial={{ rotate: -20, scale: 0 }}
                            animate={{ rotate: 0, scale: 1 }}
                            transition={{ delay: 0.2, type: "spring" }}
                            className="w-24 h-24 bg-gradient-to-br from-primary to-accent rounded-3xl flex items-center justify-center mb-6 shadow-glow-primary"
                        >
                            <Trophy className="w-12 h-12 text-white" />
                        </motion.div>

                        <h2 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-2">
                            Seviye Atladın!
                        </h2>

                        <div className="text-4xl font-black text-text-primary mb-1">
                            SEVİYE {gameState.level}
                        </div>

                        <div className="px-4 py-1 bg-primary/10 rounded-full text-[11px] font-black text-primary uppercase tracking-wider mb-8">
                            {getLevelTitle()}
                        </div>

                        <div className="grid grid-cols-2 gap-3 w-full mb-8">
                            <div className="bg-surface-secondary p-4 rounded-2xl border border-border-subtle">
                                <div className="text-text-muted text-[9px] font-black uppercase mb-1">Yeni Ödül</div>
                                <div className="flex items-center gap-2 text-text-primary text-xs font-bold">
                                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                    100 Coin
                                </div>
                            </div>
                            <div className="bg-surface-secondary p-4 rounded-2xl border border-border-subtle">
                                <div className="text-text-muted text-[9px] font-black uppercase mb-1">Gelişim</div>
                                <div className="flex items-center gap-2 text-text-primary text-xs font-bold">
                                    <Zap className="w-3.5 h-3.5 text-primary fill-primary" />
                                    +5% Analiz
                                </div>
                            </div>
                        </div>

                        <Button
                            variant="primary"
                            className="w-full h-14 rounded-2xl text-lg font-black shadow-glow-primary"
                            onClick={clearLevelUp}
                        >
                            DEVAM ET
                        </Button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
