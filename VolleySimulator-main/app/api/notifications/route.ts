import { NextRequest, NextResponse } from 'next/server';

// GET /api/notifications - Get user's notifications
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // In production, fetch from Supabase
    const mockNotifications = [
      {
        id: 'notif-1',
        userId,
        type: 'match_reminder',
        title: 'Maç Başlıyor!',
        message: 'Fenerbahçe vs Eczacıbaşı maçı 1 saat sonra başlıyor. Tahminini yaptın mı?',
        data: { matchId: 'match-1' },
        isRead: false,
        link: '/vsl',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'notif-2',
        userId,
        type: 'match_result',
        title: 'Maç Sonuçlandı',
        message: 'VakıfBank 3-1 Galatasaray. Tahminini doğru yaptın! +25 puan kazandın.',
        data: { matchId: 'match-2', points: 25 },
        isRead: false,
        link: '/vsl',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 'notif-3',
        userId,
        type: 'friend_request',
        title: 'Yeni Arkadaşlık İsteği',
        message: 'voleybolSever sana arkadaşlık isteği gönderdi.',
        data: { senderId: 'user-3' },
        isRead: true,
        link: '/friends',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 'notif-4',
        userId,
        type: 'achievement',
        title: 'Yeni Rozet Kazandın! 🏆',
        message: 'Tahmin Ustası rozetini kazandın. 50 doğru tahmin yaptın!',
        data: { badgeId: 'prediction_master' },
        isRead: true,
        link: '/quests',
        createdAt: new Date(Date.now() - 172800000).toISOString(),
      },
      {
        id: 'notif-5',
        userId,
        type: 'leaderboard_change',
        title: 'Sıralama Değişikliği',
        message: 'Haftalık sıralamada 5. sıraya yükseldin!',
        data: { rank: 5, change: 3 },
        isRead: true,
        link: '/leaderboard',
        createdAt: new Date(Date.now() - 259200000).toISOString(),
      },
    ];

    return NextResponse.json({ 
      notifications: mockNotifications,
      unreadCount: mockNotifications.filter(n => !n.isRead).length
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/notifications - Mark notifications as read
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, notificationIds } = body;

    if (action === 'markAsRead' && notificationIds) {
      // In production, update in Supabase
      return NextResponse.json({ 
        success: true, 
        message: 'Notifications marked as read' 
      });
    }

    if (action === 'markAllAsRead') {
      // In production, update all in Supabase
      return NextResponse.json({ 
        success: true, 
        message: 'All notifications marked as read' 
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error updating notifications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/notifications - Delete notification(s)
export async function DELETE(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get('id');
    const clearAll = searchParams.get('clearAll');

    if (clearAll === 'true') {
      // In production, delete all from Supabase
      return NextResponse.json({ 
        success: true, 
        message: 'All notifications cleared' 
      });
    }

    if (notificationId) {
      // In production, delete from Supabase
      return NextResponse.json({ 
        success: true, 
        message: 'Notification deleted' 
      });
    }

    return NextResponse.json({ error: 'Notification ID or clearAll required' }, { status: 400 });
  } catch (error) {
    console.error('Error deleting notifications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
