/**
 * Utility to track errors to the server
 */
export const trackError = async (error: Error, context: Record<string, any> = {}) => {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
        console.error('[ErrorTracker]', error, context);
    }

    try {
        await fetch('/api/errors', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: error.message,
                stack: error.stack,
                context,
                timestamp: new Date().toISOString(),
                url: typeof window !== 'undefined' ? window.location.href : '',
                userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
            }),
        });
    } catch (loggingError) {
        // Fallback if logging fails
        console.error('Failed to report error:', loggingError);
    }
};
