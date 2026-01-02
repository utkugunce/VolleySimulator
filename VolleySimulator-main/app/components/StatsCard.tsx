"use client";

interface StatsCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon?: string;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
    color?: 'emerald' | 'blue' | 'amber' | 'rose' | 'purple';
}

export default function StatsCard({
    title,
    value,
    subtitle,
    icon,
    trend,
    trendValue,
    color = 'blue'
}: StatsCardProps) {
    const colors = {
        emerald: 'from-emerald-600 to-emerald-500',
        blue: 'from-blue-600 to-blue-500',
        amber: 'from-amber-600 to-amber-500',
        rose: 'from-rose-600 to-rose-500',
        purple: 'from-purple-600 to-purple-500'
    };

    const trendColors = {
        up: 'text-emerald-400',
        down: 'text-rose-400',
        neutral: 'text-slate-400'
    };

    const trendIcons = {
        up: '↑',
        down: '↓',
        neutral: '→'
    };

    return (
        <div className="bg-surface rounded-lg border border-border-main overflow-hidden shadow-sm hover:shadow-md transition-all group">
            <div className={`h-1 bg-gradient-to-r ${colors[color]}`} />
            <div className="p-4">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-xs text-text-muted mb-1">{title}</p>
                        <p className="text-2xl font-bold text-foreground group-hover:scale-105 transition-transform origin-left">
                            {value}
                        </p>
                        {subtitle && (
                            <p className="text-xs text-text-muted mt-1">{subtitle}</p>
                        )}
                    </div>
                    {icon && (
                        <span className="text-2xl opacity-50 group-hover:opacity-100 transition-opacity">
                            {icon}
                        </span>
                    )}
                </div>
                {trend && trendValue && (
                    <div className={`flex items-center gap-1 mt-2 text-xs ${trendColors[trend]}`}>
                        <span>{trendIcons[trend]}</span>
                        <span>{trendValue}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
