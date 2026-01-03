import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient } from '../../utils/supabase-server';
import { createRateLimiter } from '../../utils/rateLimit';

// Validation schemas
const PredictionInputSchema = z.object({
    matchId: z.string().min(1),
    league: z.enum(['1lig', '2lig', 'vsl', 'cev-cl']),
    groupName: z.string().optional(),
    homeTeam: z.string().min(1),
    awayTeam: z.string().min(1),
    matchDate: z.string().optional(),
    predictedScore: z.string().regex(/^\d+-\d+$/, 'Invalid score format'),
});

const PredictionBatchSchema = z.array(PredictionInputSchema);

export interface PredictionInput {
    matchId: string;
    league: '1lig' | '2lig' | 'vsl' | 'cev-cl';
    groupName?: string;
    homeTeam: string;
    awayTeam: string;
    matchDate?: string;
    predictedScore: string;
}

// Rate limiter: 60 requests per minute per user
const rateLimiter = createRateLimiter({ requests: 60, windowMs: 60000 });

// GET - Fetch user's predictions
export async function GET(request: NextRequest) {
    try {
        // Apply rate limiting
        const limitResponse = rateLimiter(request);
        if (limitResponse) return limitResponse;

        const supabase = await createServerSupabaseClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const league = searchParams.get('league');
        const groupName = searchParams.get('group');

        let query = supabase
            .from('predictions')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (league) query = query.eq('league', league);
        if (groupName) query = query.eq('group_name', groupName);

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching predictions:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ predictions: data });
    } catch (error) {
        console.error('Predictions GET error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST - Create or update predictions (batch)
export async function POST(request: NextRequest) {
    try {
        // Apply rate limiting
        const limitResponse = rateLimiter(request);
        if (limitResponse) return limitResponse;

        const supabase = await createServerSupabaseClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const predictions: PredictionInput[] = Array.isArray(body) ? body : [body];

        if (predictions.length === 0) {
            return NextResponse.json({ error: 'No predictions provided' }, { status: 400 });
        }

        // Validate all predictions
        try {
            PredictionBatchSchema.parse(predictions);
        } catch (validationError) {
            if (validationError instanceof z.ZodError) {
                return NextResponse.json(
                    { error: 'Invalid prediction data', details: validationError.errors },
                    { status: 400 }
                );
            }
            throw validationError;
        }

        // Transform predictions for upsert
        const records = predictions.map(p => ({
            user_id: user.id,
            match_id: p.matchId,
            league: p.league,
            group_name: p.groupName || null,
            home_team: p.homeTeam,
            away_team: p.awayTeam,
            match_date: p.matchDate ? new Date(p.matchDate).toISOString().split('T')[0] : null,
            predicted_score: p.predictedScore,
            updated_at: new Date().toISOString()
        }));

        // Upsert predictions (insert or update on conflict)
        const { data, error } = await supabase
            .from('predictions')
            .upsert(records, {
                onConflict: 'user_id,match_id',
                ignoreDuplicates: false
            })
            .select();

        if (error) {
            console.error('Error saving predictions:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            saved: data?.length || 0,
            message: `${data?.length || 0} tahmin kaydedildi`
        });
    } catch (error) {
        console.error('Predictions POST error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE - Remove a prediction
export async function DELETE(request: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const matchId = searchParams.get('matchId');

        if (!matchId) {
            return NextResponse.json({ error: 'Match ID required' }, { status: 400 });
        }

        const { error } = await supabase
            .from('predictions')
            .delete()
            .eq('user_id', user.id)
            .eq('match_id', matchId);

        if (error) {
            console.error('Error deleting prediction:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Predictions DELETE error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
