"use client";

import { ReactNode } from 'react';

interface SkeletonProps {
    className?: string;
}

// Base skeleton with shimmer animation
export function Skeleton({ className = '' }: SkeletonProps) {
    return (
        <div
            className={`animate-pulse bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-[length:200%_100%] rounded ${className}`}
        />
    );
}

// Text line skeleton
export function SkeletonText({ lines = 1, className = '' }: { lines?: number; className?: string }) {
    return (
        <div className={`space-y-2 ${className}`}>
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton
                    key={i}
                    className={`h-4 ${i === lines - 1 ? 'w-3/4' : 'w-full'}`}
                />
            ))}
        </div>
    );
}

// Avatar/Circle skeleton
export function SkeletonAvatar({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
    const sizes = {
        sm: 'w-8 h-8',
        md: 'w-12 h-12',
        lg: 'w-16 h-16'
    };
    return <Skeleton className={`${sizes[size]} rounded-full`} />;
}

// Card skeleton
export function SkeletonCard({ className = '' }: SkeletonProps) {
    return (
        <div className={`bg-slate-900/50 rounded-xl border border-slate-800 p-4 ${className}`}>
            <div className="flex items-center gap-3 mb-4">
                <SkeletonAvatar size="sm" />
                <div className="flex-1">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-3 w-16" />
                </div>
            </div>
            <SkeletonText lines={2} />
        </div>
    );
}

// Table row skeleton
export function SkeletonTableRow({ columns = 5 }: { columns?: number }) {
    return (
        <div className="flex items-center gap-3 p-2 border-b border-slate-800/50">
            <Skeleton className="w-6 h-6 rounded" />
            <SkeletonAvatar size="sm" />
            <div className="flex-1">
                <Skeleton className="h-4 w-32" />
            </div>
            {Array.from({ length: columns - 2 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-8" />
            ))}
        </div>
    );
}

// Table skeleton
export function SkeletonTable({ rows = 8, columns = 5 }: { rows?: number; columns?: number }) {
    return (
        <div className="bg-slate-900/50 rounded-xl border border-slate-800 overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 p-3 border-b border-slate-700 bg-slate-800/50">
                {Array.from({ length: columns }).map((_, i) => (
                    <Skeleton key={i} className={`h-3 ${i === 0 ? 'w-6' : i === 1 ? 'w-32' : 'w-12'}`} />
                ))}
            </div>
            {/* Rows */}
            {Array.from({ length: rows }).map((_, i) => (
                <SkeletonTableRow key={i} columns={columns} />
            ))}
        </div>
    );
}

// Stats grid skeleton
export function SkeletonStats({ count = 4 }: { count?: number }) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="bg-slate-900/50 rounded-xl border border-slate-800 p-4 text-center">
                    <Skeleton className="h-8 w-12 mx-auto mb-2" />
                    <Skeleton className="h-3 w-16 mx-auto" />
                </div>
            ))}
        </div>
    );
}

// Match list skeleton
export function SkeletonMatchList({ count = 6 }: { count?: number }) {
    return (
        <div className="space-y-2">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl border border-slate-800">
                    <div className="flex items-center gap-2">
                        <SkeletonAvatar size="sm" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-6 w-12 rounded-lg" />
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-24" />
                        <SkeletonAvatar size="sm" />
                    </div>
                </div>
            ))}
        </div>
    );
}

// Page skeleton (combines multiple elements)
export function SkeletonPage() {
    return (
        <div className="space-y-4 p-4 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <Skeleton className="h-6 w-48 mb-2" />
                    <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-10 w-24 rounded-lg" />
            </div>

            {/* Stats */}
            <SkeletonStats count={4} />

            {/* Content grid */}
            <div className="grid md:grid-cols-2 gap-4">
                <SkeletonTable rows={6} />
                <SkeletonMatchList count={4} />
            </div>
        </div>
    );
}

export default Skeleton;
