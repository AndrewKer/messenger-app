import { NextRequest, NextResponse } from 'next/server';

interface MessagePayload {
  user: string;
  message: string;
}

interface StoredMessage extends MessagePayload {
  id: number;
  timestamp: string;
}

// In-memory store
const messages: StoredMessage[] = [];

// Mock email sending
const sendEmail = (user: string, message: string): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`email sent to ${user} with ${message}`);
      resolve();
    }, 1000);
  });
};

export async function GET() {
  return NextResponse.json({
    success: true,
    data: messages,
    count: messages.length,
  });
}

export async function POST(request: NextRequest) {
  const { user, message }: MessagePayload = await request.json();

  if (!user || !message) {
    return NextResponse.json(
      { error: 'User and message are required' },
      { status: 400 }
    );
  }

  const newMessage = {
    id: messages.length + 1,
    user,
    message,
    timestamp: new Date().toISOString()
  };

  messages.push(newMessage);

  // Side effect: send email
  sendEmail(user, message).catch((err) => {
    console.error('Error sending email:', err);
  });

  return NextResponse.json({
    success: true,
    data: newMessage,
    totalMessages: messages.length
  }, { status: 201 });
}