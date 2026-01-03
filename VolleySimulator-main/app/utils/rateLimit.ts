import { NextRequest, NextResponse } from 'next/server';

interface RateLimitConfig {
    requests: number;
    windowMs: number; // in milliseconds
}

const rateLimits = new Map<string, { count: number; resetTime: number }>();

/**
 * Simple in-memory rate limiter
 * For production, use external service like Upstash Redis
 */
export function createRateLimiter(config: RateLimitConfig) {
    return function rateLimit(req: NextRequest): NextResponse | null {
        const identifier = req.headers.get('x-forwarded-for') || req.ip || 'anonymous';
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

/**
 * Cleanup old entries periodically (optional)
 */
export function startRateLimitCleanup(intervalMs = 60000) {
    setInterval(() => {
        const now = Date.now();
        for (const [key, limit] of rateLimits.entries()) {
            if (now > limit.resetTime) {
                rateLimits.delete(key);
            }
        }
    }, intervalMs);
}
