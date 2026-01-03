import { NextRequest, NextResponse } from 'next/server';

// POST /api/custom-leagues/join - Join a league with invite code
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { inviteCode } = body;

    if (!inviteCode) {
      return NextResponse.json({ error: 'Invite code is required' }, { status: 400 });
    }

    // In production, find league by invite code and add member in Supabase
    
    // Mock response - simulate finding a league
    if (inviteCode.length !== 6) {
      return NextResponse.json({ error: 'Invalid invite code' }, { status: 400 });
    }

    const mockLeague = {
      id: 'joined-league',
      name: 'Yeni Katıldığın Lig',
      description: 'Bu lige davet koduyla katıldın',
      type: 'private',
      ownerId: 'other-user',
      inviteCode,
      maxMembers: 50,
      memberCount: 15,
    };

    return NextResponse.json({
      success: true,
      message: 'Successfully joined the league',
      league: mockLeague,
    });
  } catch (error) {
    console.error('Error joining league:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
