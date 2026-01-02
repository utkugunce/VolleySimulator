"use client";

interface TeamAvatarProps {
    name: string;
    size?: 'sm' | 'md' | 'lg';
    showName?: boolean;
    position?: number;
}

export default function TeamAvatar({ name, size = 'md', showName = false, position }: TeamAvatarProps) {
    // Generate consistent color from team name
    const stringToColor = (str: string) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        const hue = hash % 360;
        return `hsl(${hue}, 60%, 40%)`;
    };

    const getInitials = (name: string) => {
        const words = name.split(' ');
        if (words.length >= 2) {
            return words[0][0] + words[1][0];
        }
        return name.slice(0, 2);
    };

    const sizes = {
        sm: 'w-6 h-6 text-[10px]',
        md: 'w-8 h-8 text-xs',
        lg: 'w-12 h-12 text-sm'
    };

    const positionColors: Record<number, string> = {
        1: 'ring-2 ring-amber-400',
        2: 'ring-2 ring-slate-300',
        3: 'ring-2 ring-amber-700'
    };

    return (
        <div className="flex items-center gap-2">
            <div
                className={`${sizes[size]} rounded-full flex items-center justify-center font-bold text-white uppercase relative overflow-hidden bg-slate-800 ${position ? positionColors[position] || '' : ''}`}
                title={name}
                role="img"
                aria-label={name}
            >
                {/* Try to load image based on name */}
                {/* First, try exact name match from public/logos */}
                <img
                    src={`/logos/${name}.png`}
                    alt={name}
                    className="w-full h-full object-contain p-0.5"
                    onError={(e) => {
                        // Fallback to initials if image fails
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        e.currentTarget.parentElement!.style.backgroundColor = stringToColor(name);
                    }}
                />

                {/* Fallback Initials (Hidden by default, shown on error) */}
                <div className="hidden w-full h-full flex items-center justify-center absolute inset-0">
                    {getInitials(name)}
                </div>
            </div>
            {showName && (
                <span className="text-sm text-white truncate">{name}</span>
            )}
        </div>
    );
}
