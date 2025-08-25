import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get Deepgram API key from environment
    const deepgramApiKey = process.env.DEEPGRAM_API_KEY;
    if (!deepgramApiKey) {
      return NextResponse.json({ error: 'Deepgram not configured' }, { status: 500 });
    }

    // Return the API key for client-side WebSocket connection
    return NextResponse.json({
      success: true,
      data: {
        apiKey: deepgramApiKey,
        wsUrl: 'wss://api.deepgram.com/v1/listen',
      },
    });
  } catch (error) {
    console.error('Error getting Deepgram token:', error);
    return NextResponse.json(
      { error: 'Failed to get Deepgram token' },
      { status: 500 }
    );
  }
}
