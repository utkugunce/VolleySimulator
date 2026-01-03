"use client";

import { useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

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
    const activeTabRef = useRef<HTMLButtonElement>(null);

    // Auto-scroll to active tab when it changes
    useEffect(() => {
        if (activeTabRef.current) {
            activeTabRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'center'
            });
        }
    }, [activeTab]);

    return (
        <ScrollArea className={`w-full ${className}`}>
            <div className="flex gap-2 pb-3">
                {tabs.map((tab) => {
                    const isActive = tab.id === activeTab;

                    return (
                        <Button
                            key={tab.id}
                            ref={isActive ? activeTabRef : null}
                            onClick={() => onChange(tab.id)}
                            variant={isActive ? "default" : "secondary"}
                            size="sm"
                            className={`
                                rounded-full whitespace-nowrap min-h-[44px] flex-shrink-0
                                ${isActive
                                    ? 'bg-primary text-primary-foreground shadow-lg'
                                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                                }
                            `}
                        >
                            {tab.label}
                        </Button>
                    );
                })}
            </div>
            <ScrollBar orientation="horizontal" />
        </ScrollArea>
    );
}
