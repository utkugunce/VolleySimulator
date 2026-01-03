/**
 * Performance utilities for throttling, debouncing, and optimization
 */

type AnyFunction = (...args: never[]) => void;

/**
 * Throttle function execution to at most once per wait period
 */
export function throttle<T extends AnyFunction>(
    func: T,
    wait: number
): T & { cancel: () => void } {
    let timeout: NodeJS.Timeout | null = null;
    let lastArgs: Parameters<T> | null = null;
    let lastCallTime = 0;

    const throttled = function (this: unknown, ...args: Parameters<T>) {
        const now = Date.now();
        const remaining = wait - (now - lastCallTime);

        if (remaining <= 0 || remaining > wait) {
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }
            lastCallTime = now;
            func.apply(this, args);
        } else {
            lastArgs = args;
            if (!timeout) {
                timeout = setTimeout(() => {
                    lastCallTime = Date.now();
                    timeout = null;
                    if (lastArgs) {
                        func.apply(this, lastArgs);
                        lastArgs = null;
                    }
                }, remaining);
            }
        }
    } as T & { cancel: () => void };

    throttled.cancel = () => {
        if (timeout) {
            clearTimeout(timeout);
            timeout = null;
        }
        lastArgs = null;
    };

    return throttled;
}

/**
 * Debounce function execution until after wait period has elapsed since last call
 */
export function debounce<T extends AnyFunction>(
    func: T,
    wait: number,
    options: { leading?: boolean } = {}
): T & { cancel: () => void } {
    let timeout: NodeJS.Timeout | null = null;
    let lastArgs: Parameters<T> | null = null;

    const debounced = function (this: unknown, ...args: Parameters<T>) {
        lastArgs = args;

        if (options.leading && !timeout) {
            func.apply(this, args);
        }

        if (timeout) {
            clearTimeout(timeout);
        }

        timeout = setTimeout(() => {
            timeout = null;
            if (!options.leading && lastArgs) {
                func.apply(this, lastArgs);
            }
            lastArgs = null;
        }, wait);
    } as T & { cancel: () => void };

    debounced.cancel = () => {
        if (timeout) {
            clearTimeout(timeout);
            timeout = null;
        }
        lastArgs = null;
    };

    return debounced;
}

/**
 * Request animation frame based throttle for scroll/resize handlers
 */
export function rafThrottle<T extends AnyFunction>(
    func: T
): T & { cancel: () => void } {
    let rafId: number | null = null;
    let lastArgs: Parameters<T> | null = null;

    const throttled = function (this: unknown, ...args: Parameters<T>) {
        lastArgs = args;

        if (rafId === null) {
            rafId = requestAnimationFrame(() => {
                rafId = null;
                if (lastArgs) {
                    func.apply(this, lastArgs);
                }
            });
        }
    } as T & { cancel: () => void };

    throttled.cancel = () => {
        if (rafId !== null) {
            cancelAnimationFrame(rafId);
            rafId = null;
        }
        lastArgs = null;
    };

    return throttled;
}

type AnyReturnFunction = (...args: never[]) => unknown;

/**
 * Memoize function results based on arguments
 */
export function memoize<T extends AnyReturnFunction>(
    func: T,
    keyResolver?: (...args: Parameters<T>) => string
): T {
    const cache = new Map<string, unknown>();

    return function (this: unknown, ...args: Parameters<T>) {
        const key = keyResolver ? keyResolver(...args) : JSON.stringify(args);

        if (cache.has(key)) {
            return cache.get(key) as ReturnType<T>;
        }

        const result = func.apply(this, args) as ReturnType<T>;
        cache.set(key, result);
        return result;
    } as T;
}
