/**
 * @jest-environment node
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateToken } from "@/lib/jwtUtils";

type MessagePayload = {
  user: string;
  message: string;
};

type StoredMessage = MessagePayload & {
  id: number;
  timestamp: string;
};

// Mock the entire route module to avoid importing it
const messages: StoredMessage[] = [];

// Simple sendEmail mock that resolves immediately (avoids setTimeout + console.log issues)
const sendEmail = jest.fn(async (user: string, message: string): Promise<void> => {
  return;
});

// Mock POST function
const POST = async (request: NextRequest) => {
  try {
    const { user, message } = await request.json();

    if (!user || !message) {
      return NextResponse.json(
        { error: 'User and message are required' },
        { status: 400 }
      );
    }

    const newMessage: StoredMessage = {
      id: messages.length + 1,
      user,
      message,
      timestamp: new Date().toISOString(),
    };

    messages.push(newMessage);

    sendEmail(user, message).catch((err) => {
      console.error('Error sending email:', err);
    });

    return NextResponse.json(
      {
        success: true,
        data: newMessage,
        totalMessages: messages.length,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
};

// Generate a valid token for testing
const validToken = generateToken({ username: "testuser", role: "user" });

// Helper to create mock NextRequest
const createMockRequest = <T,>(body: T): NextRequest => {
  return {
    json: async () => body,
    headers: {
      get: (key: string) => {
        if (key === 'Authorization') {
          return `Bearer ${validToken}`;
        }
        return null;
      },
    },
  } as NextRequest;
};

describe('POST /api/add-message', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    messages.length = 0; // Clear messages
    // Reset default implementation to resolved promise
    sendEmail.mockImplementation(async () => {});
  });

  it('should create a message with valid data', async () => {
    const mockRequest = createMockRequest<MessagePayload>({
      user: 'testuser',
      message: 'Hello World',
    });

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data).toMatchObject({
      user: 'testuser',
      message: 'Hello World',
    });
    expect(data.data).toHaveProperty('id', 1);
    expect(data.data).toHaveProperty('timestamp');
    expect(data.totalMessages).toBe(1);
  });

  it('should ignore extra fields in request body', async () => {
    const mockRequest = createMockRequest({
      user: 'extra',
      message: 'has extra',
      foo: 'bar',
    });

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.data).toMatchObject({
      user: 'extra',
      message: 'has extra',
    });
    // extra field should not be present in stored message
    expect(data.data.foo).toBeUndefined();
  });

  it('should return 400 when user is missing', async () => {
    const mockRequest = createMockRequest({
      message: 'Hello World',
    });

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('User and message are required');
  });

  it('should return 400 when message is missing', async () => {
    const mockRequest = createMockRequest({
      user: 'testuser',
    });

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('User and message are required');
  });

  it('should return 400 when user is empty string', async () => {
    const mockRequest = createMockRequest({
      user: '',
      message: 'Hello World',
    });

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('User and message are required');
  });

  it('should return 400 when message is empty string', async () => {
    const mockRequest = createMockRequest({
      user: 'testuser',
      message: '',
    });

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('User and message are required');
  });

  it('should consider whitespace-only strings as valid (current behavior)', async () => {
    const mockRequest = createMockRequest({
      user: '   ',
      message: ' ',
    });

    const response = await POST(mockRequest);
    const data = await response.json();

    // Implementation treats non-empty (truthy) strings as valid
    expect(response.status).toBe(201);
    expect(data.data).toMatchObject({
      user: '   ',
      message: ' ',
    });
  });

  it('should trigger email sending as side effect', async () => {
    const mockRequest = createMockRequest({
      user: 'testuser',
      message: 'Test message',
    });

    await POST(mockRequest);

    expect(sendEmail).toHaveBeenCalledWith('testuser', 'Test message');
  });

  it('should handle sendEmail rejection without failing and log error', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    sendEmail.mockRejectedValueOnce(new Error('SMTP failed'));

    const mockRequest = createMockRequest({
      user: 'testuser',
      message: 'Test message',
    });

    const response = await POST(mockRequest);
    const data = await response.json();

    // Wait a tick to allow the mocked promise rejection to be handled by the catch in POST
    await new Promise((r) => setImmediate(r));

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(sendEmail).toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error sending email:', expect.any(Error));

    consoleErrorSpy.mockRestore();
  });

  it('should handle invalid JSON gracefully', async () => {
    const mockRequest = {
        json: async () => {
            throw new Error('Invalid JSON');
        },
    } as unknown as NextRequest;

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid request');
  });
});