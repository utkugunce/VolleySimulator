import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';

// Validation schemas for API routes
export const ScoreSchema = z.string()
    .regex(/^\d+-\d+$/, 'Geçerli skor formatı: "X-Y" (örn: "3-0")');

export const PredictionSchema = z.object({
    matchId: z.string().min(1),
    score: ScoreSchema,
    leagueId: z.string().min(1),
});

export const LeagueIdSchema = z.enum([
    'vsl',
    '1lig',
    '2lig',
    'cev-cl',
    'cev-cup',
    'cev-challenge',
    'tvf'
]);

/**
 * Validate JSON body with Zod schema
 * @param req - NextRequest
 * @param schema - Zod schema
 * @returns Validated data or error response
 */
export async function validateBody<T>(
    req: NextRequest,
    schema: z.ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; error: string }> {
    try {
        const body = await req.json();
        const validated = schema.parse(body);
        return { success: true, data: validated as T };
    } catch (error) {
        if (error instanceof z.ZodError) {
            const message = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
            return { success: false, error: message };
        }
        return { success: false, error: 'Invalid request body' };
    }
}

/**
 * Create error response
 */
export function errorResponse(message: string, status: number = 400) {
    return NextResponse.json({ error: message }, { status });
}

/**
 * Create success response
 */
export function successResponse<T>(data: T, status: number = 200) {
    return NextResponse.json(data, { status });
}
