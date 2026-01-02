"use client";

import { useRef, useEffect } from 'react';

interface SwipeableTabsProps {
    tabs: { id: string; label: string }[];
    activeTab: string;
    onChange: (id: string) => void;
    className?: string;
}

/**
 * Horizontal scrollable tabs for mobile-friendly group selection
 * 
 * Features:
 * - Touch-friendly (min 44px height)
 * - Auto-scrolls to keep active tab visible
 * - Single-tap selection (no dropdown needed)
 * - Active indicator animation
 */
export default function SwipeableTabs({
    tabs,
    activeTab,
    onChange,
    className = ''
}: SwipeableTabsProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const activeTabRef = useRef<HTMLButtonElement>(null);

    // Auto-scroll to active tab when it changes
    useEffect(() => {
        if (activeTabRef.current && containerRef.current) {
            const container = containerRef.current;
            const activeElement = activeTabRef.current;

            const containerRect = container.getBoundingClientRect();
            const elementRect = activeElement.getBoundingClientRect();

            // Check if element is outside visible area
            const isOutsideLeft = elementRect.left < containerRect.left;
            const isOutsideRight = elementRect.right > containerRect.right;

            if (isOutsideLeft || isOutsideRight) {
                activeElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                    inline: 'center'
                });
            }
        }
    }, [activeTab]);

    return (
        <div
            ref={containerRef}
            className={`flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth pb-1 ${className}`}
            style={{
                WebkitOverflowScrolling: 'touch',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
            }}
        >
            {tabs.map((tab) => {
                const isActive = tab.id === activeTab;

                return (
                    <button
                        key={tab.id}
                        ref={isActive ? activeTabRef : null}
                        onClick={() => onChange(tab.id)}
                        className={`
                            px-4 py-2 rounded-full text-sm font-medium
                            whitespace-nowrap transition-all duration-200
                            min-h-[44px] flex-shrink-0
                            ${isActive
                                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                            }
                        `}
                    >
                        {tab.label}
                    </button>
                );
            })}
        </div>
    );
}
