"use client";

import { useState, useEffect, useCallback } from 'react';

/**
 * Type-safe localStorage hook with SSR support
 */
export function useLocalStorage<T>(
    key: string,
    initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
    // State to store our value
    const [storedValue, setStoredValue] = useState<T>(initialValue);
    const [isHydrated, setIsHydrated] = useState(false);

    // Hydrate from localStorage after mount
    useEffect(() => {
        const value = (() => {
            try {
                const item = window.localStorage.getItem(key);
                return item ? JSON.parse(item) : initialValue;
            } catch (error) {
                console.warn(`Error reading localStorage key "${key}":`, error);
                return initialValue;
            }
        })();

        // Defer state updates to avoid "cascading renders" warning 
        // and ensure the initial render matches the server output.
        Promise.resolve().then(() => {
            setStoredValue(value);
            setIsHydrated(true);
        });
    }, [key, initialValue]);

    // Return a wrapped version of useState's setter function
    const setValue = useCallback((value: T | ((prev: T) => T)) => {
        try {
            // Allow value to be a function for same API as useState
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);

            if (typeof window !== 'undefined') {
                window.localStorage.setItem(key, JSON.stringify(valueToStore));
            }
        } catch (error) {
            console.warn(`Error setting localStorage key "${key}":`, error);
        }
    }, [key, storedValue]);

    // Remove from localStorage
    const removeValue = useCallback(() => {
        try {
            setStoredValue(initialValue);
            if (typeof window !== 'undefined') {
                window.localStorage.removeItem(key);
            }
        } catch (error) {
            console.warn(`Error removing localStorage key "${key}":`, error);
        }
    }, [key, initialValue]);

    return [storedValue, setValue, removeValue];
}

export default useLocalStorage;
