"use client";

import { useState, useCallback, useRef } from 'react';
import { useToast } from '../components/Toast';

interface UseUndoableActionOptions<T> {
    /** Message to show in the toast */
    message: string;
    /** Duration in ms before undo expires (default: 5000) */
    duration?: number;
    /** Callback when the action is executed */
    onExecute: () => T;
    /** Callback to restore previous state (receives the stored state) */
    onUndo: (previousState: T) => void;
}

/**
 * Hook for creating undoable actions
 * 
 * Usage:
 * ```tsx
 * const { execute } = useUndoableAction({
 *   message: 'Tahminler temizlendi',
 *   onExecute: () => {
 *     const prev = predictions;
 *     setPredictions({});
 *     return prev; // Return state to restore
 *   },
 *   onUndo: (prev) => setPredictions(prev)
 * });
 * 
 * // In button:
 * <button onClick={execute}>Sıfırla</button>
 * ```
 */
export function useUndoableAction<T>({
    message,
    duration = 5000,
    onExecute,
    onUndo,
}: UseUndoableActionOptions<T>) {
    const { showUndoToast } = useToast();
    const previousStateRef = useRef<T | null>(null);
    const [isUndoable, setIsUndoable] = useState(false);

    const execute = useCallback(() => {
        // Store previous state
        const previousState = onExecute();
        previousStateRef.current = previousState;
        setIsUndoable(true);

        // Show undo toast
        showUndoToast(message, () => {
            if (previousStateRef.current !== null) {
                onUndo(previousStateRef.current);
                previousStateRef.current = null;
            }
            setIsUndoable(false);
        }, duration);

        // Clear undo ability after duration
        setTimeout(() => {
            previousStateRef.current = null;
            setIsUndoable(false);
        }, duration);
    }, [message, duration, onExecute, onUndo, showUndoToast]);

    const undo = useCallback(() => {
        if (previousStateRef.current !== null) {
            onUndo(previousStateRef.current);
            previousStateRef.current = null;
            setIsUndoable(false);
        }
    }, [onUndo]);

    return {
        execute,
        undo,
        isUndoable,
    };
}
