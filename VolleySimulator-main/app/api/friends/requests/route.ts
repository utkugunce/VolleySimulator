import { NextRequest, NextResponse } from 'next/server';

// GET /api/friends/requests - Get pending friend requests
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // In production, fetch from Supabase
    const mockRequests = [
      {
        id: 'req-1',
        userId: 'user-3',
        friendId: userId,
        status: 'pending',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        sender: {
          id: 'user-3',
          username: 'voleybolSever',
          displayName: 'Zeynep Kaya',
          avatar: null,
          level: 8,
          totalPoints: 890,
        }
      }
    ];

    return NextResponse.json({ requests: mockRequests });
  } catch (error) {
    console.error('Error fetching friend requests:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/friends/requests - Accept or reject friend request
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { requestId, action } = body;

    if (!requestId || !action) {
      return NextResponse.json({ error: 'Request ID and action are required' }, { status: 400 });
    }

    if (!['accept', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // In production, update in Supabase

    return NextResponse.json({ 
      success: true, 
      message: action === 'accept' ? 'Friend request accepted' : 'Friend request rejected'
    });
  } catch (error) {
    console.error('Error processing friend request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
