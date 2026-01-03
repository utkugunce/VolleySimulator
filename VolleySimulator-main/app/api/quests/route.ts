import { NextRequest, NextResponse } from 'next/server';

// GET /api/quests - Get user's quests and badges
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const today = new Date().toISOString().split('T')[0];

    // In production, fetch from Supabase
    const mockDailyQuests = [
      {
        id: 'quest-1',
        type: 'make_predictions',
        title: '3 Tahmin Yap',
        description: 'Bugün 3 maç tahmini yap',
        reward: 50,
        progress: 2,
        target: 3,
        completed: false,
        claimedAt: null,
        expiresAt: new Date(new Date().setHours(23, 59, 59, 999)).toISOString(),
      },
      {
        id: 'quest-2',
        type: 'correct_prediction',
        title: 'Doğru Tahmin',
        description: 'En az 1 doğru tahmin yap',
        reward: 30,
        progress: 1,
        target: 1,
        completed: true,
        claimedAt: null,
        expiresAt: new Date(new Date().setHours(23, 59, 59, 999)).toISOString(),
      },
      {
        id: 'quest-3',
        type: 'visit_app',
        title: 'Günlük Giriş',
        description: 'Uygulamaya giriş yap',
        reward: 10,
        progress: 1,
        target: 1,
        completed: true,
        claimedAt: new Date().toISOString(),
        expiresAt: new Date(new Date().setHours(23, 59, 59, 999)).toISOString(),
      },
    ];

    const mockWeeklyChallenge = {
      id: 'weekly-1',
      title: 'Haftalık Meydan Okuma',
      description: 'Bu hafta 10 doğru tahmin yap',
      reward: 500,
      progress: 6,
      target: 10,
      completed: false,
      expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    };

    const mockBadges = [
      {
        id: 'early_adopter',
        name: 'İlk Katılımcı',
        description: 'Beta döneminde katıldın',
        icon: '🌟',
        rarity: 'legendary',
        earnedAt: new Date('2024-01-15').toISOString(),
        category: 'special',
      },
      {
        id: 'first_prediction',
        name: 'İlk Adım',
        description: 'İlk tahminini yaptın',
        icon: '🎯',
        rarity: 'common',
        earnedAt: new Date('2024-01-16').toISOString(),
        category: 'prediction',
      },
      {
        id: 'streak_3',
        name: '3 Gün Seri',
        description: '3 gün üst üste tahmin yaptın',
        icon: '🔥',
        rarity: 'uncommon',
        earnedAt: new Date('2024-01-20').toISOString(),
        category: 'streak',
      },
      {
        id: 'prediction_50',
        name: 'Deneyimli Tahminci',
        description: '50 tahmin yaptın',
        icon: '📊',
        rarity: 'rare',
        earnedAt: new Date('2024-02-01').toISOString(),
        category: 'prediction',
      },
    ];

    const mockStreak = {
      currentStreak: 5,
      longestStreak: 12,
      lastActivityDate: today,
      freezesAvailable: 2,
      freezeUsedToday: false,
    };

    return NextResponse.json({
      dailyQuests: mockDailyQuests,
      weeklyChallenge: mockWeeklyChallenge,
      badges: mockBadges,
      streak: mockStreak,
    });
  } catch (error) {
    console.error('Error fetching quests:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/quests - Claim quest reward or use streak freeze
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, questId } = body;

    if (action === 'claimReward' && questId) {
      // In production, update in Supabase and add points to user
      return NextResponse.json({
        success: true,
        message: 'Reward claimed',
        pointsEarned: 50,
      });
    }

    if (action === 'useStreakFreeze') {
      // In production, update in Supabase
      return NextResponse.json({
        success: true,
        message: 'Streak freeze used',
        freezesRemaining: 1,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error processing quest action:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
