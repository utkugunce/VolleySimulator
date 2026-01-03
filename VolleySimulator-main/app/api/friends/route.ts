import { NextRequest, NextResponse } from 'next/server';

// GET /api/friends - Get user's friends list
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // In production, fetch from Supabase
    const mockFriends = [
      {
        id: '1',
        friendId: 'friend-1',
        status: 'accepted',
        createdAt: new Date().toISOString(),
        friend: {
          id: 'friend-1',
          username: 'voleybolcu123',
          displayName: 'Ahmet Yılmaz',
          avatar: null,
          level: 15,
          totalPoints: 2450,
          weeklyPoints: 320,
          correctPredictions: 156,
          totalPredictions: 210,
          winRate: 74.3,
          streak: 5,
          badges: ['early_adopter', 'streak_master'],
          favoriteTeam: 'FENERBAHÇE MEDICANA',
          isOnline: true,
          lastActive: new Date().toISOString(),
        }
      },
      {
        id: '2',
        friendId: 'friend-2',
        status: 'accepted',
        createdAt: new Date().toISOString(),
        friend: {
          id: 'friend-2',
          username: 'tahminKrali',
          displayName: 'Mehmet Demir',
          avatar: null,
          level: 12,
          totalPoints: 1890,
          weeklyPoints: 210,
          correctPredictions: 98,
          totalPredictions: 145,
          winRate: 67.6,
          streak: 3,
          badges: ['prediction_expert'],
          favoriteTeam: 'ECZACIBAŞI DYNAVİT',
          isOnline: false,
          lastActive: new Date(Date.now() - 3600000).toISOString(),
        }
      }
    ];

    return NextResponse.json({ friends: mockFriends });
  } catch (error) {
    console.error('Error fetching friends:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/friends - Send friend request
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { friendId } = body;

    if (!friendId) {
      return NextResponse.json({ error: 'Friend ID is required' }, { status: 400 });
    }

    // In production, create friend request in Supabase
    const friendRequest = {
      id: `request-${Date.now()}`,
      userId,
      friendId,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({ 
      success: true, 
      message: 'Friend request sent',
      request: friendRequest 
    });
  } catch (error) {
    console.error('Error sending friend request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/friends - Remove friend
export async function DELETE(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const friendId = searchParams.get('friendId');

    if (!friendId) {
      return NextResponse.json({ error: 'Friend ID is required' }, { status: 400 });
    }

    // In production, delete from Supabase

    return NextResponse.json({ 
      success: true, 
      message: 'Friend removed' 
    });
  } catch (error) {
    console.error('Error removing friend:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
