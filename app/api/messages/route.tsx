import { NextRequest, NextResponse } from 'next/server';
import { messageStore } from '@/lib/messageStore';

export async function GET(request: NextRequest) {
  const messages = messageStore.getAll();

  const searchParams = request.nextUrl.searchParams;
  
  // Extract query parameters
  const user = searchParams.get('user');
  const messageBody = searchParams.get('message');
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  
  // Validate pagination parameters
  if (page < 1 || limit < 1) {
    return NextResponse.json(
      { error: 'Page and limit must be greater than 0' },
      { status: 400 }
    );
  }
  
  // Filter messages
  const filtered = messages.filter((msg) => {
    const userMatch = !user || msg.user.toLowerCase().includes(user.toLowerCase());
    const messageMatch = !messageBody || msg.message.toLowerCase().includes(messageBody.toLowerCase());
    return userMatch && messageMatch;
  });
  
  // Calculate pagination
  const total = filtered.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedMessages = filtered.slice(startIndex, endIndex);
  
  return NextResponse.json({
    success: true,
    data: paginatedMessages,
    pagination: {
      count: paginatedMessages.length,
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  });
}