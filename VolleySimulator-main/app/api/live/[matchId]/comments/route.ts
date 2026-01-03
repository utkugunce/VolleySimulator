import { NextRequest, NextResponse } from 'next/server';

// GET /api/live/[matchId]/comments - Get match comments
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
  try {
    const { matchId } = await params;

    // In production, fetch from Supabase
    const mockComments = [
      {
        id: 'comment-1',
        matchId,
        userId: 'user-1',
        username: 'voleybolcu123',
        displayName: 'Ahmet Yılmaz',
        avatar: null,
        content: 'Fenerbahçe bu seti alır! 💪',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        likes: 12,
        isLiked: false,
      },
      {
        id: 'comment-2',
        matchId,
        userId: 'user-2',
        username: 'tahminKrali',
        displayName: 'Mehmet Demir',
        avatar: null,
        content: 'Harika bir maç! Her iki takım da çok iyi oynuyor 🏐',
        timestamp: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
        likes: 8,
        isLiked: true,
      },
      {
        id: 'comment-3',
        matchId,
        userId: 'user-3',
        username: 'voleybolSever',
        displayName: 'Zeynep Kaya',
        avatar: null,
        content: 'Bu ace çok güzeldi! 🎯',
        timestamp: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
        likes: 5,
        isLiked: false,
      },
    ];

    return NextResponse.json({ comments: mockComments });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/live/[matchId]/comments - Add a comment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { matchId } = await params;
    const body = await request.json();
    const { content } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Comment content is required' }, { status: 400 });
    }

    // In production, save to Supabase
    const newComment = {
      id: `comment-${Date.now()}`,
      matchId,
      userId,
      username: 'currentUser',
      displayName: 'Kullanıcı',
      avatar: null,
      content: content.trim(),
      timestamp: new Date().toISOString(),
      likes: 0,
      isLiked: false,
    };

    return NextResponse.json({
      success: true,
      comment: newComment,
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
