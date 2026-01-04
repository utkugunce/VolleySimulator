import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "./Button"
import { LucideIcon } from "lucide-react"

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
    title: string
    description?: string
    icon?: LucideIcon
    actionLabel?: string
    onAction?: () => void
}

export function EmptyState({
    title,
    description,
    icon: Icon,
    actionLabel,
    onAction,
    className,
    ...props
}: EmptyStateProps) {
    return (
        <div
            className={cn(
                "flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed border-border-main p-8 text-center animate-in fade-in zoom-in duration-300",
                className
            )}
            {...props}
        >
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-surface-secondary/50 shadow-premium-sm">
                {Icon ? (
                    <Icon className="h-10 w-10 text-text-muted opacity-50" />
                ) : (
                    <div className="h-10 w-10 rounded-full bg-border-subtle" />
                )}
            </div>
            <h3 className="mt-6 text-xl font-black text-text-primary tracking-tight">{title}</h3>
            {description && (
                <p className="mx-auto mt-4 max-w-sm text-sm text-text-secondary leading-relaxed">
                    {description}
                </p>
            )}
            {actionLabel && onAction && (
                <Button
                    variant="primary"
                    onClick={onAction}
                    className="mt-8 shadow-glow-primary px-8"
                >
                    {actionLabel}
                </Button>
            )}
        </div>
    )
}
