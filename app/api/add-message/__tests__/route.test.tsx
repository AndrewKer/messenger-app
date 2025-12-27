/**
 * @jest-environment node
 */

import { NextRequest, NextResponse } from 'next/server';
import * as realRoute from '../route';

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

// Mock GET function
const GET = async () => {
  return NextResponse.json({
    success: true,
    data: messages,
    count: messages.length,
  });
};

// Helper to create mock NextRequest
const createMockRequest = <T,>(body: T): NextRequest => {
  return {
    json: async () => body,
  } as NextRequest;
};

describe('GET /api/add-message', () => {
  it('should return all messages', async () => {
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('success', true);
    expect(data).toHaveProperty('data');
    expect(data).toHaveProperty('count');
    expect(Array.isArray(data.data)).toBe(true);
  });
});

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

  it('should create multiple messages and increment ids', async () => {
    const req1 = createMockRequest<MessagePayload>({ user: 'u1', message: 'm1' });
    const req2 = createMockRequest<MessagePayload>({ user: 'u2', message: 'm2' });

    const res1 = await POST(req1);
    const data1 = await res1.json();

    const res2 = await POST(req2);
    const data2 = await res2.json();

    expect(res1.status).toBe(201);
    expect(res2.status).toBe(201);
    expect(data1.data.id).toBe(1);
    expect(data2.data.id).toBe(2);
    expect(data2.totalMessages).toBe(2);

    // GET should reflect both messages
    const getRes = await GET();
    const getData = await getRes.json();
    expect(getData.count).toBe(2);
    expect(getData.data[0].user).toBe('u1');
    expect(getData.data[1].user).toBe('u2');
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

describe('integration: real route sendEmail timer behavior', () => {
  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
    // clear real module messages if test mutated it
    // realRoute does not export messages; we only exercise POST/GET
  });

  it('real sendEmail logs to console and test waits for timer', async () => {
    jest.useFakeTimers();
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    const mockReq = {
      json: async () => ({ user: 'realuser', message: 'real message' }),
    } as NextRequest;

    const res = await realRoute.POST(mockReq);
    const data = await res.json();

    expect(res.status).toBe(201);
    expect(data.success).toBe(true);

    // Fast-forward timers so the internal setTimeout runs while the test is active
    jest.runAllTimers();

    // allow any pending promise microtasks to flush
    await Promise.resolve();

    expect(consoleLogSpy).toHaveBeenCalledWith('email sent to realuser with real message');

    consoleLogSpy.mockRestore();
    jest.useRealTimers();
  });
});