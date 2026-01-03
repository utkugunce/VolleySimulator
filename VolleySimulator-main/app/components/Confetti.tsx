"use client";

import { useEffect, useState } from 'react';

interface ConfettiProps {
    trigger: boolean;
    onComplete?: () => void;
}

export default function Confetti({ trigger, onComplete }: ConfettiProps) {
    const [particles, setParticles] = useState<Array<{
        id: number;
        x: number;
        color: string;
        delay: number;
        size: number;
        borderRadius: string;
        duration: string;
    }>>([]);

    useEffect(() => {
        if (trigger) {
            const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
            const newParticles = Array.from({ length: 50 }, (_, i) => ({
                id: i,
                x: Math.random() * 100,
                color: colors[Math.floor(Math.random() * colors.length)],
                delay: Math.random() * 0.5,
                size: Math.random() * 8 + 4,
                borderRadius: Math.random() > 0.5 ? '50%' : '0',
                duration: `${1 + Math.random()}s`
            }));
            Promise.resolve().then(() => setParticles(newParticles));

            const timer = setTimeout(() => {
                setParticles([]);
                onComplete?.();
            }, 2000);

            return () => clearTimeout(timer);
        }
    }, [trigger, onComplete]);

    if (particles.length === 0) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {particles.map(p => (
                <div
                    key={p.id}
                    className="absolute animate-confetti"
                    style={{
                        left: `${p.x}%`,
                        top: '-20px',
                        width: p.size,
                        height: p.size,
                        backgroundColor: p.color,
                        borderRadius: p.borderRadius,
                        animationDelay: `${p.delay}s`,
                        animationDuration: p.duration
                    }}
                />
            ))}
        </div>
    );
}
