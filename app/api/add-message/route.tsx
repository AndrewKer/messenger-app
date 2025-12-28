import { NextRequest, NextResponse } from 'next/server';
import { messageStore, MessagePayload } from '@/lib/messageStore';
import { validateToken } from '@/lib/jwtUtils';


export async function POST(request: NextRequest) {
  // Extract and validate JWT token from headers
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.split(' ')[1] || '';

  if (!token) {
    return NextResponse.json(
      { error: 'Unauthorized - Missing token' },
      { status: 401 }
    );
  }

  if (!validateToken(token)) {
    return NextResponse.json(
      { error: 'Unauthorized - Invalid or expired token' },
      { status: 401 }
    );
  }

  const { user, message }: MessagePayload = await request.json();

  if (!user || !message) {
    return NextResponse.json(
      { error: 'User and message are required' },
      { status: 400 }
    );
  }

  const newMessage = messageStore.addMessage(user, message);
  const totalMessages = messageStore.getAll().length;

  return NextResponse.json({
    success: true,
    data: newMessage,
    totalMessages: totalMessages
  }, { status: 201 });
}