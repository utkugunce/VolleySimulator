"use client";

import React, { Component, ReactNode, ErrorInfo } from 'react';

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.props.onError?.(error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-[200px] flex flex-col items-center justify-center p-6 bg-slate-900/50 rounded-xl border border-red-500/30">
                    <div className="text-4xl mb-4">😔</div>
                    <h3 className="text-lg font-bold text-white mb-2">Bir şeyler yanlış gitti</h3>
                    <p className="text-sm text-slate-400 text-center mb-4 max-w-md">
                        Beklenmeyen bir hata oluştu. Sayfayı yenileyerek tekrar deneyebilirsiniz.
                    </p>
                    {process.env.NODE_ENV === 'development' && this.state.error && (
                        <details className="w-full max-w-md">
                            <summary className="text-xs text-red-400 cursor-pointer hover:text-red-300">
                                Hata Detayları (Geliştirici)
                            </summary>
                            <pre className="mt-2 p-3 bg-red-900/20 rounded-lg text-xs text-red-300 overflow-auto max-h-32">
                                {this.state.error.message}
                                {'\n\n'}
                                {this.state.error.stack}
                            </pre>
                        </details>
                    )}
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-bold rounded-lg transition-colors"
                    >
                        Sayfayı Yenile
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

// Functional wrapper for easier use
export function withErrorBoundary<P extends object>(
    WrappedComponent: React.ComponentType<P>,
    fallback?: ReactNode
) {
    return function WithErrorBoundaryWrapper(props: P) {
        return (
            <ErrorBoundary fallback={fallback}>
                <WrappedComponent {...props} />
            </ErrorBoundary>
        );
    };
}

export default ErrorBoundary;
