"use client";

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';

interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'undo';
    action?: {
        label: string;
        onClick: () => void;
    };
    duration?: number; // in ms, default 3000
}

interface ToastContextType {
    toasts: Toast[];
    showToast: (message: string, type?: Toast['type'], options?: { action?: Toast['action']; duration?: number }) => void;
    showUndoToast: (message: string, onUndo: () => void, duration?: number) => void;
    removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((
        message: string,
        type: Toast['type'] = 'success',
        options?: { action?: Toast['action']; duration?: number }
    ) => {
        const id = Date.now().toString();
        const duration = options?.duration ?? 3000;

        setToasts(prev => [...prev, {
            id,
            message,
            type,
            action: options?.action,
            duration
        }]);

        // Auto remove after duration
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, duration);
    }, []);

    const showUndoToast = useCallback((message: string, onUndo: () => void, duration: number = 5000) => {
        const id = Date.now().toString();

        setToasts(prev => [...prev, {
            id,
            message,
            type: 'undo',
            action: {
                label: 'Geri Al',
                onClick: () => {
                    onUndo();
                    setToasts(prev => prev.filter(t => t.id !== id));
                }
            },
            duration
        }]);

        // Auto remove after duration
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, duration);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ toasts, showToast, showUndoToast, removeToast }}>
            {children}
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </ToastContext.Provider>
    );
}

function ToastContainer({ toasts, onRemove }: { toasts: Toast[], onRemove: (id: string) => void }) {
    if (toasts.length === 0) return null;

    return (
        <div className="toast-container">
            {toasts.map(toast => (
                <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
            ))}
        </div>
    );
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
    const [progress, setProgress] = useState(100);
    const duration = toast.duration || 3000;

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(prev => {
                const newProgress = prev - (100 / (duration / 100));
                return newProgress > 0 ? newProgress : 0;
            });
        }, 100);

        return () => clearInterval(interval);
    }, [duration]);

    return (
        <div
            className={`toast toast-${toast.type} relative overflow-hidden`}
            onClick={() => !toast.action && onRemove(toast.id)}
        >
            <div className="flex items-center justify-between gap-3 w-full">
                <span className="flex-1">{toast.message}</span>
                {toast.action && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            toast.action?.onClick();
                        }}
                        className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded text-sm font-bold transition-colors whitespace-nowrap"
                    >
                        {toast.action.label}
                    </button>
                )}
            </div>

            {/* Progress bar for undo toasts */}
            {toast.type === 'undo' && (
                <div
                    className="absolute bottom-0 left-0 h-1 bg-white/40 transition-all ease-linear"
                    style={{ width: `${progress}%` }}
                />
            )}
        </div>
    );
}
