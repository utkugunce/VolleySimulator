"use client";

import Image from "next/image";
import { useState, memo, useMemo } from "react";

interface TeamAvatarProps {
    name: string;
    size?: 'xs' | 'sm' | 'md' | 'lg';
    showName?: boolean;
    position?: number;
    priority?: boolean;
}

const sizes = {
    xs: 'w-4 h-4 text-[8px]',
    sm: 'w-6 h-6 text-[10px]',
    md: 'w-8 h-8 text-xs',
    lg: 'w-12 h-12 text-sm'
} as const;

const pixelSizes = {
    xs: 16,
    sm: 24,
    md: 32,
    lg: 48
} as const;

const positionColors: Record<number, string> = {
    1: 'ring-2 ring-amber-400',
    2: 'ring-2 ring-slate-300',
    3: 'ring-2 ring-amber-700'
};

// Generate consistent color from team name - memoized outside component
const stringToColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = hash % 360;
    return `hsl(${hue}, 60%, 40%)`;
};

const getInitials = (teamName: string) => {
    const words = teamName.split(' ');
    if (words.length >= 2) {
        return words[0][0] + words[1][0];
    }
    return teamName.slice(0, 2);
};

function TeamAvatar({ name, size = 'md', showName = false, position, priority = false }: TeamAvatarProps) {
    const [hasError, setHasError] = useState(false);

    // Memoize computed values
    const backgroundColor = useMemo(() => hasError ? stringToColor(name) : undefined, [hasError, name]);
    const initials = useMemo(() => getInitials(name), [name]);
    const positionClass = position ? positionColors[position] || '' : '';

    return (
        <div className="flex items-center gap-2">
            <div
                className={`${sizes[size]} rounded-full flex items-center justify-center font-bold text-white uppercase relative overflow-hidden ${hasError ? '' : 'bg-slate-800'} ${positionClass}`}
                style={backgroundColor ? { backgroundColor } : undefined}
                title={name}
                role="img"
                aria-label={name}
            >
                {!hasError ? (
                    <Image
                        src={`/logos/${name}.png`}
                        alt={name}
                        width={pixelSizes[size]}
                        height={pixelSizes[size]}
                        className="w-full h-full object-contain p-0.5"
                        onError={() => setHasError(true)}
                        priority={priority}
                        loading={priority ? "eager" : "lazy"}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        {initials}
                    </div>
                )}
            </div>
            {showName && (
                <span className="text-sm text-white truncate">{name}</span>
            )}
        </div>
    );
}

export default memo(TeamAvatar);
