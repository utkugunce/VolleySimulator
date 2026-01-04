import { NextRequest, NextResponse } from 'next/server';

interface RateLimitConfig {
    requests: number;
    windowMs: number; // in milliseconds
}

const rateLimits = new Map<string, { count: number; resetTime: number }>();

/**
 * Simple in-memory rate limiter
 * For production, use external service like Upstash Redis
 * TODO: In a serverless environment (like Vercel), this in-memory cache is not shared across instances.
 * For consistent rate limiting, migrate to Vercel KV or Upstash Redis.
 */
export function createRateLimiter(config: RateLimitConfig) {
    return function rateLimit(req: NextRequest): NextResponse | null {
        const identifier = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'anonymous';
        const key = `${identifier}:${req.nextUrl.pathname}`;
        const now = Date.now();

        const limit = rateLimits.get(key);

        if (!limit || now > limit.resetTime) {
            // New window or expired
            rateLimits.set(key, {
                count: 1,
                resetTime: now + config.windowMs
            });
            return null; // Allow
        }

        if (limit.count >= config.requests) {
            return NextResponse.json(
                { error: 'Çok fazla istek. Lütfen daha sonra tekrar deneyin.' },
                {
                    status: 429,
                    headers: {
                        'Retry-After': String(Math.ceil((limit.resetTime - now) / 1000))
                    }
                }
            );
        }

        limit.count++;
        return null; // Allow
    };
}

/**
 * API route rate limiting middleware
 * Usage in API routes:
 * 
 * const rateLimiter = createRateLimiter({ requests: 10, windowMs: 60000 });
 * 
 * export async function POST(req) {
 *     const limitResponse = rateLimiter(req);
 *     if (limitResponse) return limitResponse;
 *     
 *     // ... rest of handler
 * }
 */

// Auto-cleanup interval reference
let cleanupInterval: NodeJS.Timeout | null = null;

/**
 * Cleanup old entries periodically
 * Automatically starts on first rateLimiter use
 */
export function startRateLimitCleanup(intervalMs = 60000) {
    // Prevent multiple intervals
    if (cleanupInterval) return;

    cleanupInterval = setInterval(() => {
        const now = Date.now();
        for (const [key, limit] of rateLimits.entries()) {
            if (now > limit.resetTime) {
                rateLimits.delete(key);
            }
        }
    }, intervalMs);

    // Don't block Node.js from exiting
    if (cleanupInterval.unref) {
        cleanupInterval.unref();
    }
}

// Auto-start cleanup when module is loaded
// Auto-start cleanup when module is loaded
if (typeof window === 'undefined') {
    startRateLimitCleanup();
}

// Export a direct check function for use in middleware
export async function checkRateLimit(identifier: string, limit: number, windowMs: number): Promise<{ success: boolean; retryAfter?: number }> {
    const key = `${identifier}`;
    const now = Date.now();
    const entry = rateLimits.get(key);

    if (!entry || now > entry.resetTime) {
        rateLimits.set(key, {
            count: 1,
            resetTime: now + windowMs
        });
        return { success: true };
    }

    if (entry.count >= limit) {
        return {
            success: false,
            retryAfter: Math.ceil((entry.resetTime - now) / 1000)
        };
    }

    entry.count++;
    return { success: true };
}

