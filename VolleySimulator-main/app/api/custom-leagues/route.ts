import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import { z } from 'zod';

const LeagueConfigSchema = z.object({
  allowedLeagues: z.array(z.string()),
  scoringMultiplier: z.number().min(0.5).max(5).optional(),
  showRankings: z.boolean().optional(),
  allowChat: z.boolean().optional(),
});

const CreateLeagueSchema = z.object({
  name: z.string().min(3).max(50),
  description: z.string().max(200).optional(),
  type: z.enum(['private', 'public']).default('private'),
  maxMembers: z.number().min(2).max(1000).optional(),
  settings: LeagueConfigSchema.optional(),
});

const UpdateLeagueSchema = z.object({
  leagueId: z.string().min(1),
  updates: CreateLeagueSchema.partial()
});

// GET /api/custom-leagues - Get user's custom leagues
export async function GET(request: NextRequest) {
  return withAuth(request, async (req, { user }) => {
    // In production, fetch from Supabase
    const mockLeagues = [
      {
        id: 'league-1',
        name: 'Ofis Ligi',
        description: 'Şirket içi voleybol tahmin yarışması',
        type: 'private',
        ownerId: user.id,
        inviteCode: 'OFIS2024',
        maxMembers: 50,
        memberCount: 12,
        settings: {
          allowedLeagues: ['vsl', '1lig'],
          scoringMultiplier: 1,
          showRankings: true,
          allowChat: true,
        },
        createdAt: new Date('2024-01-01').toISOString(),
        members: [
          { id: 'm-1', username: 'user1', displayName: 'Ahmet', role: 'owner', joinedAt: new Date().toISOString(), points: 450 },
          { id: 'm-2', username: 'user2', displayName: 'Mehmet', role: 'member', joinedAt: new Date().toISOString(), points: 380 },
          { id: 'm-3', username: 'user3', displayName: 'Ayşe', role: 'moderator', joinedAt: new Date().toISOString(), points: 520 },
        ],
      },
      {
        id: 'league-2',
        name: 'Üniversite Turnuvası',
        description: 'Kampüs voleybol sezonu',
        type: 'private',
        ownerId: 'other-user',
        inviteCode: 'UNI2024',
        maxMembers: 100,
        memberCount: 45,
        settings: {
          allowedLeagues: ['vsl', '1lig', 'cev-cl'],
          scoringMultiplier: 1.5,
          showRankings: true,
          allowChat: true,
        },
        createdAt: new Date('2024-02-01').toISOString(),
        members: [],
      }
    ];

    return NextResponse.json({ leagues: mockLeagues });
  });
}

// POST /api/custom-leagues - Create a new custom league
export async function POST(request: NextRequest) {
  return withAuth(request, async (req, { user }) => {
    const body = await req.json();

    // Validate with Zod
    let validatedData;
    try {
      validatedData = CreateLeagueSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 });
      }
      throw error;
    }

    const { name, description, type, maxMembers, settings } = validatedData;

    // Generate invite code
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    // In production, create in Supabase
    const newLeague = {
      id: `league-${Date.now()}`,
      name,
      description: description || '',
      type: type,
      ownerId: user.id,
      inviteCode,
      maxMembers: maxMembers || 50,
      memberCount: 1,
      settings: settings || {
        allowedLeagues: ['vsl'],
        scoringMultiplier: 1,
        showRankings: true,
        allowChat: true,
      },
      createdAt: new Date().toISOString(),
      members: [
        { id: user.id, username: 'you', displayName: 'Sen', role: 'owner', joinedAt: new Date().toISOString(), points: 0 }
      ],
    };

    return NextResponse.json({
      success: true,
      message: 'League created',
      league: newLeague,
    });
  });
}

// PUT /api/custom-leagues - Update a custom league
export async function PUT(request: NextRequest) {
  return withAuth(request, async (req, { user }) => {
    const body = await req.json();

    // Validate with Zod
    let validatedData;
    try {
      validatedData = UpdateLeagueSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 });
      }
      throw error;
    }

    const { leagueId, updates } = validatedData;

    // In production, check ownership and update in Supabase

    return NextResponse.json({
      success: true,
      message: 'League updated',
    });
  });
}

// DELETE /api/custom-leagues - Delete a custom league
export async function DELETE(request: NextRequest) {
  return withAuth(request, async (req, { user }) => {
    const { searchParams } = new URL(req.url);
    const leagueId = searchParams.get('id');

    if (!leagueId) {
      return NextResponse.json({ error: 'League ID is required' }, { status: 400 });
    }

    // In production, check ownership and delete from Supabase

    return NextResponse.json({
      success: true,
      message: 'League deleted',
    });
  });
}
