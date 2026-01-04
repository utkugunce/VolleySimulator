"use client";

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameState } from '../../utils/gameState';
import { Button } from './Button';
import { Trophy, Star, Zap, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export function LevelUpModal() {
    const { gameState, showLevelUp, clearLevelUp, getLevelTitle } = useGameState();

    useEffect(() => {
        if (showLevelUp) {
            // Multi-burst confetti for more celebration
            const duration = 3 * 1000;
            const animationEnd = Date.now() + duration;
            const colors = ['#10b981', '#fbbf24', '#3b82f6', '#f59e0b', '#8b5cf6'];

            const frame = () => {
                confetti({
                    particleCount: 5,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0, y: 0.7 },
                    colors: colors
                });
                confetti({
                    particleCount: 5,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1, y: 0.7 },
                    colors: colors
                });

                if (Date.now() < animationEnd) {
                    requestAnimationFrame(frame);
                }
            };

            // Initial burst
            confetti({
                particleCount: 200,
                spread: 100,
                origin: { y: 0.6 },
                colors: colors,
                startVelocity: 45
            });

            frame();
        }
    }, [showLevelUp]);

    if (!showLevelUp) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                {/* Animated background glow rings */}
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ 
                        scale: [1, 1.5, 1], 
                        opacity: [0.3, 0.1, 0.3] 
                    }}
                    transition={{ 
                        duration: 2, 
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-r from-primary/30 via-accent/20 to-primary/30 blur-3xl"
                />
                
                <motion.div
                    initial={{ scale: 0, opacity: 0, rotateX: -30 }}
                    animate={{ 
                        scale: 1, 
                        opacity: 1, 
                        rotateX: 0
                    }}
                    exit={{ scale: 0.5, opacity: 0, y: 100 }}
                    transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 15,
                        mass: 1
                    }}
                    className="relative w-full max-w-sm bg-surface-primary rounded-[32px] p-8 border border-primary/30 overflow-hidden"
                    style={{
                        boxShadow: '0 0 60px rgba(16, 185, 129, 0.4), 0 0 120px rgba(16, 185, 129, 0.2), inset 0 1px 0 rgba(255,255,255,0.1)'
                    }}
                >
                    {/* Pulsing glow overlay */}
                    <motion.div
                        animate={{
                            opacity: [0.2, 0.4, 0.2],
                            scale: [1, 1.05, 1]
                        }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="absolute inset-0 bg-gradient-to-t from-primary/10 via-transparent to-accent/10 pointer-events-none"
                    />
                    
                    {/* Sparkle particles */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute top-4 right-4"
                    >
                        <motion.div
                            animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        >
                            <Sparkles className="w-6 h-6 text-accent" />
                        </motion.div>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute bottom-4 left-4"
                    >
                        <motion.div
                            animate={{ rotate: -360, scale: [1, 1.2, 1] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear", delay: 0.5 }}
                        >
                            <Sparkles className="w-5 h-5 text-primary" />
                        </motion.div>
                    </motion.div>

                    {/* Background Glows */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/20 blur-[80px] rounded-full -z-10" />

                    <div className="flex flex-col items-center text-center relative z-10">
                        <motion.div
                            initial={{ rotate: -180, scale: 0, y: -50 }}
                            animate={{ rotate: 0, scale: 1, y: 0 }}
                            transition={{ 
                                delay: 0.2, 
                                type: "spring",
                                stiffness: 200,
                                damping: 12
                            }}
                            className="relative"
                        >
                            {/* Glow ring behind trophy */}
                            <motion.div
                                animate={{
                                    boxShadow: [
                                        '0 0 30px rgba(16, 185, 129, 0.5)',
                                        '0 0 60px rgba(16, 185, 129, 0.8)',
                                        '0 0 30px rgba(16, 185, 129, 0.5)'
                                    ]
                                }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                className="w-24 h-24 bg-gradient-to-br from-primary to-accent rounded-3xl flex items-center justify-center mb-6"
                            >
                                <Trophy className="w-12 h-12 text-white drop-shadow-lg" />
                            </motion.div>
                        </motion.div>

                        <motion.h2 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-2"
                        >
                            🎉 Seviye Atladın! 🎉
                        </motion.h2>

                        <motion.div 
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5, type: "spring" }}
                            className="text-5xl font-black text-text-primary mb-1"
                            style={{
                                textShadow: '0 0 40px rgba(16, 185, 129, 0.5)'
                            }}
                        >
                            SEVİYE {gameState.level}
                        </motion.div>

                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="px-4 py-1.5 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full text-[11px] font-black text-primary uppercase tracking-wider mb-8 border border-primary/30"
                        >
                            ⭐ {getLevelTitle()} ⭐
                        </motion.div>

                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 }}
                            className="grid grid-cols-2 gap-3 w-full mb-8"
                        >
                            <div className="bg-surface-secondary p-4 rounded-2xl border border-primary/20 hover:border-primary/40 transition-colors">
                                <div className="text-text-muted text-[9px] font-black uppercase mb-1">Yeni Ödül</div>
                                <div className="flex items-center gap-2 text-text-primary text-xs font-bold">
                                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                    100 Coin
                                </div>
                            </div>
                            <div className="bg-surface-secondary p-4 rounded-2xl border border-accent/20 hover:border-accent/40 transition-colors">
                                <div className="text-text-muted text-[9px] font-black uppercase mb-1">Gelişim</div>
                                <div className="flex items-center gap-2 text-text-primary text-xs font-bold">
                                    <Zap className="w-3.5 h-3.5 text-primary fill-primary" />
                                    +5% Analiz
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 }}
                            className="w-full"
                        >
                            <Button
                                variant="primary"
                                className="w-full h-14 rounded-2xl text-lg font-black"
                                onClick={clearLevelUp}
                                style={{
                                    boxShadow: '0 0 30px rgba(16, 185, 129, 0.4)'
                                }}
                            >
                                ✨ DEVAM ET ✨
                            </Button>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
