import { cn } from "@/lib/utils"

function Skeleton({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn("animate-pulse rounded-md bg-surface-secondary", className)}
            {...props}
        />
    )
}

export function StandingsTableSkeleton() {
    return (
        <div className="space-y-3">
            {[...Array(10)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-surface-primary border border-border-main rounded-xl">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <Skeleton className="h-6 w-32 flex-1" />
                    <div className="flex gap-3">
                        <Skeleton className="w-12 h-6" />
                        <Skeleton className="w-12 h-6" />
                        <Skeleton className="w-12 h-6" />
                    </div>
                </div>
            ))}
        </div>
    )
}

export function MatchCardSkeleton() {
    return (
        <div className="p-4 bg-surface-primary border border-border-main rounded-xl space-y-4">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-4 w-8" />
                <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="w-8 h-8 rounded-full" />
                </div>
            </div>
            <div className="grid grid-cols-4 gap-2">
                <Skeleton className="h-10 rounded-lg" />
                <Skeleton className="h-10 rounded-lg" />
                <Skeleton className="h-10 rounded-lg" />
                <Skeleton className="h-10 rounded-lg" />
            </div>
        </div>
    )
}

export { Skeleton }
