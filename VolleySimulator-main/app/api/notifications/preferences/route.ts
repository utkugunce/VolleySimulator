import { NextRequest, NextResponse } from 'next/server';

// GET /api/notifications/preferences - Get notification preferences
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // In production, fetch from Supabase
    const mockPreferences = {
      userId,
      pushEnabled: true,
      emailEnabled: true,
      matchReminders: true,
      matchResults: true,
      friendRequests: true,
      friendActivity: true,
      achievements: true,
      leaderboardChanges: true,
      dailyQuests: true,
      weeklyDigest: true,
      quietHoursStart: '23:00',
      quietHoursEnd: '08:00',
    };

    return NextResponse.json({ preferences: mockPreferences });
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/notifications/preferences - Update notification preferences
export async function PUT(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // In production, update in Supabase
    
    return NextResponse.json({ 
      success: true, 
      message: 'Preferences updated',
      preferences: { userId, ...body }
    });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
