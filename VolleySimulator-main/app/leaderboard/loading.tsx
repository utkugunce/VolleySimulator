import { SkeletonTable, SkeletonStats } from "../components/Skeleton";

export default function LeaderboardLoading() {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-4">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header skeleton */}
                <div className="text-center space-y-2">
                    <div className="h-10 w-64 bg-slate-800 rounded animate-pulse mx-auto" />
                    <div className="h-4 w-96 bg-slate-800/50 rounded animate-pulse mx-auto" />
                </div>

                {/* Stats skeleton */}
                <SkeletonStats count={4} />

                {/* Table skeleton */}
                <SkeletonTable rows={10} columns={5} />
            </div>
        </div>
    );
}
