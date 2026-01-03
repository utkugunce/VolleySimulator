"use client";

import { ReactNode } from 'react';
import {
    Tooltip as ShadcnTooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

interface TooltipProps {
    content: ReactNode;
    children: ReactNode;
    position?: 'top' | 'bottom' | 'left' | 'right';
    delay?: number;
}

export default function Tooltip({
    content,
    children,
    position = 'top',
    delay = 200
}: TooltipProps) {
    return (
        <TooltipProvider delayDuration={delay}>
            <ShadcnTooltip>
                <TooltipTrigger asChild>
                    <span className="inline-block">{children}</span>
                </TooltipTrigger>
                <TooltipContent side={position}>
                    {content}
                </TooltipContent>
            </ShadcnTooltip>
        </TooltipProvider>
    );
}
