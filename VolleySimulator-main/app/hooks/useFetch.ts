"use client";

import { useCallback, useState } from "react";

interface FetchOptions extends RequestInit {
    retries?: number;
    retryDelay?: number;
}

interface UseFetchReturn<T> {
    data: T | null;
    error: string | null;
    loading: boolean;
    execute: (url: string, options?: FetchOptions) => Promise<T | null>;
    retry: () => Promise<T | null>;
}

/**
 * Custom hook for data fetching with automatic retry and error handling.
 * 
 * @example
 * const { data, error, loading, execute, retry } = useFetch<TeamStats[]>();
 * 
 * useEffect(() => {
 *   execute('/api/scrape');
 * }, []);
 */
export function useFetch<T>(): UseFetchReturn<T> {
    const [data, setData] = useState<T | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [lastRequest, setLastRequest] = useState<{ url: string; options?: FetchOptions } | null>(null);

    const execute = useCallback(async (url: string, options?: FetchOptions): Promise<T | null> => {
        const { retries = 3, retryDelay = 1000, ...fetchOptions } = options || {};

        setLoading(true);
        setError(null);
        setLastRequest({ url, options });

        let lastError: Error | null = null;

        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const fullUrl = (apiUrl && url.startsWith('/api'))
            ? url.replace('/api', apiUrl)
            : url;

        for (let attempt = 0; attempt <= retries; attempt++) {
            try {
                const response = await fetch(fullUrl, fetchOptions);

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const result = await response.json();
                setData(result);
                setLoading(false);
                return result;
            } catch (err) {
                lastError = err instanceof Error ? err : new Error(String(err));

                if (attempt < retries) {
                    // Wait before retrying
                    await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
                }
            }
        }

        // All retries failed
        const errorMessage = lastError?.message || "Bilinmeyen hata";
        setError(errorMessage);
        setLoading(false);
        return null;
    }, []);

    const retry = useCallback(async (): Promise<T | null> => {
        if (!lastRequest) return null;
        return execute(lastRequest.url, lastRequest.options);
    }, [lastRequest, execute]);

    return { data, error, loading, execute, retry };
}

/**
 * Simple fetch wrapper with retry logic.
 * For use outside of React components.
 */
export async function fetchWithRetry<T>(
    url: string,
    options?: FetchOptions
): Promise<{ data: T | null; error: string | null }> {
    const { retries = 3, retryDelay = 1000, ...fetchOptions } = options || {};

    let lastError: Error | null = null;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const fullUrl = (apiUrl && url.startsWith('/api'))
        ? url.replace('/api', apiUrl)
        : url;

    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const response = await fetch(fullUrl, fetchOptions);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            return { data, error: null };
        } catch (err) {
            lastError = err instanceof Error ? err : new Error(String(err));

            if (attempt < retries) {
                await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
            }
        }
    }

    return { data: null, error: lastError?.message || "Bilinmeyen hata" };
}
