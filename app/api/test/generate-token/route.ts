import { NextResponse } from 'next/server';
import { generateToken } from '@/lib/jwtUtils';

export async function GET() {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available' }, { status: 404 });
  }

  const token = generateToken({
    username: 'test-user-123',
    role: 'admin'
  });

  return NextResponse.json({ token });
}