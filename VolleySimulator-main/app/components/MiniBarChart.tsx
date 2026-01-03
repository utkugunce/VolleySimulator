"use client";

interface MiniBarChartProps {
    data: number[];
    labels?: string[];
    height?: number;
    color?: string;
    showValues?: boolean;
}

export default function MiniBarChart({
    data,
    labels,
    height = 40,
    color = '#10b981',
    showValues = false
}: MiniBarChartProps) {
    const max = Math.max(...data, 1);
    const barWidth = 100 / data.length;

    return (
        <div className="w-full" style={{ height }}>
            <div className="flex items-end justify-between h-full gap-0.5">
                {data.map((value, i) => (
                    <div
                        key={i}
                        className="flex-1 flex flex-col items-center justify-end"
                        title={labels?.[i] ? `${labels[i]}: ${value}` : `${value}`}
                    >
                        {showValues && (
                            <span className="text-[8px] text-slate-400 mb-0.5">{value}</span>
                        )}
                        <div
                            className="w-full rounded-t transition-all duration-300 hover:opacity-80"
                            style={{
                                height: `${(value / max) * 100}%`,
                                backgroundColor: color,
                                minHeight: value > 0 ? '2px' : '0'
                            }}
                        />
                    </div>
                ))}
            </div>
            {labels && (
                <div className="flex justify-between mt-1">
                    {labels.map((label, i) => (
                        <span key={i} className="text-[8px] text-slate-500 flex-1 text-center truncate">
                            {label}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}
