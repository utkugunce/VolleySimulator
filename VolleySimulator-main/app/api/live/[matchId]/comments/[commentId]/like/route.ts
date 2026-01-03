import { NextRequest, NextResponse } from 'next/server';

// POST /api/live/[matchId]/comments/[commentId]/like - Like/unlike a comment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ matchId: string; commentId: string }> }
) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { matchId, commentId } = await params;

    // In production, toggle like in Supabase
    // This would check if user already liked and toggle

    return NextResponse.json({
      success: true,
      liked: true, // or false if unliked
    });
  } catch (error) {
    console.error('Error liking comment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
