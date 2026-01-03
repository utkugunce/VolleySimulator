import { SkeletonTable } from "../../components/Skeleton";

export default function VSLCalculatorLoading() {
    return (
        <main className="min-h-screen bg-slate-950 text-slate-100 p-2 sm:p-4 font-sans pb-20 sm:pb-4">
            <div className="w-full max-w-[1600px] mx-auto flex flex-col h-[calc(100vh-2rem)] gap-4">
                {/* Header skeleton */}
                <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-4">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                            <div className="h-8 w-48 bg-slate-800 rounded animate-pulse" />
                            <div className="h-6 w-32 bg-slate-800/50 rounded animate-pulse" />
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-20 bg-slate-800 rounded animate-pulse" />
                            <div className="h-8 w-20 bg-slate-800 rounded animate-pulse" />
                        </div>
                    </div>
                    {/* Progress bar skeleton */}
                    <div className="mt-4 h-2 w-full bg-slate-800 rounded-full animate-pulse" />
                </div>

                {/* Content grid skeleton */}
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0 overflow-hidden">
                    <div className="lg:col-span-7">
                        <SkeletonTable rows={12} columns={8} />
                    </div>
                    <div className="lg:col-span-5">
                        <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-4 space-y-4">
                            <div className="h-6 w-32 bg-slate-800 rounded animate-pulse" />
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 bg-slate-700 rounded-full animate-pulse" />
                                        <div className="h-4 w-24 bg-slate-700 rounded animate-pulse" />
                                    </div>
                                    <div className="h-6 w-16 bg-slate-700 rounded animate-pulse" />
                                    <div className="flex items-center gap-2">
                                        <div className="h-4 w-24 bg-slate-700 rounded animate-pulse" />
                                        <div className="w-6 h-6 bg-slate-700 rounded-full animate-pulse" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
