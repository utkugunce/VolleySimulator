"use client";

import { ReactNode } from "react";

interface ErrorFallbackProps {
    error: string;
    onRetry?: () => void;
    className?: string;
}

/**
 * Reusable error fallback component with retry button.
 */
export default function ErrorFallback({ error, onRetry, className = "" }: ErrorFallbackProps) {
    return (
        <div className={`flex flex-col items-center justify-center p-8 bg-slate-900/50 rounded-xl border border-rose-900/30 ${className}`}>
            <div className="text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-rose-400 mb-2">Bir Hata Oluştu</h3>
            <p className="text-sm text-slate-400 text-center mb-4 max-w-md">{error}</p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="flex items-center gap-2 px-4 py-2 bg-rose-700 hover:bg-rose-600 text-white text-sm font-medium rounded-lg transition-all"
                >
                    <span>🔄</span>
                    <span>Tekrar Dene</span>
                </button>
            )}
        </div>
    );
}

interface DataLoaderProps<T> {
    data: T | null;
    error: string | null;
    loading: boolean;
    onRetry?: () => void;
    loadingFallback?: ReactNode;
    errorFallback?: ReactNode;
    children: (data: T) => ReactNode;
}

/**
 * Generic data loader component that handles loading, error, and success states.
 * 
 * @example
 * <DataLoader data={teams} error={error} loading={loading} onRetry={retry}>
 *   {(teams) => <TeamList teams={teams} />}
 * </DataLoader>
 */
export function DataLoader<T>({
    data,
    error,
    loading,
    onRetry,
    loadingFallback,
    errorFallback,
    children
}: DataLoaderProps<T>) {
    if (loading) {
        return loadingFallback || (
            <div className="flex items-center justify-center p-8">
                <div className="w-8 h-8 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error) {
        return errorFallback || <ErrorFallback error={error} onRetry={onRetry} />;
    }

    if (!data) {
        return null;
    }

    return <>{children(data)}</>;
}
