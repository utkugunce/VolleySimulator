import { SkeletonCard } from "../components/Skeleton";

export default function LiglerLoading() {
    return (
        <div className="min-h-screen bg-slate-950">
            <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
                <div className="flex flex-col gap-1 items-center md:items-start text-center md:text-left">
                    <div className="h-8 w-32 bg-slate-800 rounded animate-pulse" />
                    <div className="h-4 w-64 bg-slate-800/50 rounded animate-pulse mt-2" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <SkeletonCard key={i} className="h-48" />
                    ))}
                </div>
            </div>
        </div>
    );
}
