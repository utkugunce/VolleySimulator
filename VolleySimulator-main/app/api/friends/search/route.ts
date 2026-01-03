import { NextRequest, NextResponse } from 'next/server';

// GET /api/friends/search - Search for users
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
      return NextResponse.json({ users: [] });
    }

    // In production, search in Supabase
    const mockUsers = [
      {
        id: 'user-1',
        username: 'voleybolcu123',
        displayName: 'Ahmet Yılmaz',
        avatar: null,
        level: 15,
        totalPoints: 2450,
      },
      {
        id: 'user-2',
        username: 'tahminKrali',
        displayName: 'Mehmet Demir',
        avatar: null,
        level: 12,
        totalPoints: 1890,
      },
      {
        id: 'user-3',
        username: 'voleybolSever',
        displayName: 'Zeynep Kaya',
        avatar: null,
        level: 8,
        totalPoints: 890,
      },
    ].filter(user => 
      user.username.toLowerCase().includes(query.toLowerCase()) ||
      user.displayName.toLowerCase().includes(query.toLowerCase())
    );

    return NextResponse.json({ users: mockUsers });
  } catch (error) {
    console.error('Error searching users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
