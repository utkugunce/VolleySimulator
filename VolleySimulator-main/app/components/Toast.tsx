"use client";

import { createContext, useContext, useCallback, ReactNode } from 'react';
import { toast as sonnerToast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';

interface ToastContextType {
    showToast: (message: string, type?: 'success' | 'error' | 'info' | 'undo', options?: { action?: { label: string; onClick: () => void }; duration?: number }) => void;
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
    const showToast = useCallback((
        message: string,
        type: 'success' | 'error' | 'info' | 'undo' = 'success',
        options?: { action?: { label: string; onClick: () => void }; duration?: number }
    ) => {
        const duration = options?.duration ?? 3000;
        const toastOptions: Parameters<typeof sonnerToast>[1] = {
            duration,
            action: options?.action ? {
                label: options.action.label,
                onClick: options.action.onClick,
            } : undefined,
        };

        switch (type) {
            case 'success':
                sonnerToast.success(message, toastOptions);
                break;
            case 'error':
                sonnerToast.error(message, toastOptions);
                break;
            case 'info':
                sonnerToast.info(message, toastOptions);
                break;
            case 'undo':
                sonnerToast(message, {
                    ...toastOptions,
                    duration: options?.duration ?? 5000,
                });
                break;
            default:
                sonnerToast(message, toastOptions);
        }
    }, []);

    const showUndoToast = useCallback((message: string, onUndo: () => void, duration: number = 5000) => {
        sonnerToast(message, {
            duration,
            action: {
                label: 'Geri Al',
                onClick: onUndo,
            },
        });
    }, []);

    const removeToast = useCallback((id: string) => {
        sonnerToast.dismiss(id);
    }, []);

    return (
        <ToastContext.Provider value={{ showToast, showUndoToast, removeToast }}>
            {children}
            <Toaster 
                position="bottom-right"
                richColors
                closeButton
                expand
            />
        </ToastContext.Provider>
    );
}
