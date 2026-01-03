import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/app/utils/supabase-server';
import { checkRateLimit } from '@/app/utils/rateLimit';

type ProtectedHandler = (
    req: NextRequest,
    session: { user: any },
    params?: any
) => Promise<NextResponse>;

interface AuthOptions {
    rateLimit?: {
        limit: number;
        windowMs: number;
    };
}

export async function withAuth(
    req: NextRequest,
    handler: ProtectedHandler,
    options: AuthOptions = {}
) {
    try {
        // 1. Rate Limiting
        const rateLimitConfig = options.rateLimit || { limit: 20, windowMs: 60 * 1000 };
        // Use IP or a simplified identifier if possible, for now falling back to simple check
        // In a real edge environment, get IP from headers
        const ip = req.headers.get('x-forwarded-for') || 'unknown';

        const rateLimitResult = await checkRateLimit(ip, rateLimitConfig.limit, rateLimitConfig.windowMs);
        if (!rateLimitResult.success) {
            return NextResponse.json(
                { error: 'Too many requests', retryAfter: rateLimitResult.retryAfter },
                { status: 429 }
            );
        }

        // 2. Authentication
        const supabase = await createServerSupabaseClient();
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 3. Handover to handler
        return handler(req, { user }, undefined); // params passed separately usually
    } catch (error) {
        console.error('API Middleware Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
