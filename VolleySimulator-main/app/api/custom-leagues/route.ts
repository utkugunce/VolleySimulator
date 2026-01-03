import { NextRequest, NextResponse } from 'next/server';

// GET /api/custom-leagues - Get user's custom leagues
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // In production, fetch from Supabase
    const mockLeagues = [
      {
        id: 'league-1',
        name: 'Ofis Ligi',
        description: 'Şirket içi voleybol tahmin yarışması',
        type: 'private',
        ownerId: userId,
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
  } catch (error) {
    console.error('Error fetching custom leagues:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/custom-leagues - Create a new custom league
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, type, maxMembers, settings } = body;

    if (!name) {
      return NextResponse.json({ error: 'League name is required' }, { status: 400 });
    }

    // Generate invite code
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    // In production, create in Supabase
    const newLeague = {
      id: `league-${Date.now()}`,
      name,
      description: description || '',
      type: type || 'private',
      ownerId: userId,
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
        { id: userId, username: 'you', displayName: 'Sen', role: 'owner', joinedAt: new Date().toISOString(), points: 0 }
      ],
    };

    return NextResponse.json({
      success: true,
      message: 'League created',
      league: newLeague,
    });
  } catch (error) {
    console.error('Error creating custom league:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/custom-leagues - Update a custom league
export async function PUT(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { leagueId, updates } = body;

    if (!leagueId) {
      return NextResponse.json({ error: 'League ID is required' }, { status: 400 });
    }

    // In production, check ownership and update in Supabase

    return NextResponse.json({
      success: true,
      message: 'League updated',
    });
  } catch (error) {
    console.error('Error updating custom league:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/custom-leagues - Delete a custom league
export async function DELETE(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const leagueId = searchParams.get('id');

    if (!leagueId) {
      return NextResponse.json({ error: 'League ID is required' }, { status: 400 });
    }

    // In production, check ownership and delete from Supabase

    return NextResponse.json({
      success: true,
      message: 'League deleted',
    });
  } catch (error) {
    console.error('Error deleting custom league:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
