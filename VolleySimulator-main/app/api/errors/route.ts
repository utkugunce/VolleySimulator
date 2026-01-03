import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { message, stack, context, timestamp, url, userAgent } = body;

        // Structured log for Vercel/CloudWatch
        console.error(JSON.stringify({
            level: 'error',
            message: message || 'Unknown client error',
            timestamp: timestamp || new Date().toISOString(),
            stack,
            context,
            url,
            userAgent: userAgent || request.headers.get('user-agent'),
            source: 'client-error-boundary'
        }));

        // In a real production app, you would send this to Sentry, LogRocket, or Supabase here.

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error logging client error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
