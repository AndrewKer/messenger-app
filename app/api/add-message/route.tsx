import { NextRequest, NextResponse } from 'next/server';
import { messageStore, MessagePayload } from '@/lib/messageStore';


export async function POST(request: NextRequest) {
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