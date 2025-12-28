/**
 * @jest-environment node
 */

import { GET } from '@/app/api/messages/route';
import { messageStore, MessagePayload } from '@/lib/messageStore';
import { NextRequest } from 'next/server';

// Mock the messageStore
jest.mock('@/lib/messageStore');

interface StoredMessage extends MessagePayload {
  id: number;
  timestamp: string;
}

describe('GET /api/messages', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic functionality', () => {
    it('should return all messages when no filters are applied', async () => {
      const mockMessages = [
        { id: 1, user: 'Alice', message: 'Hello' },
        { id: 2, user: 'Bob', message: 'Hi there' },
      ];
      (messageStore.getAll as jest.Mock).mockReturnValue(mockMessages);

      const request = new NextRequest('http://localhost:3000/api/messages');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockMessages);
      expect(data.pagination.total).toBe(2);
      expect(data.pagination.count).toBe(2);
    });

    it('should return empty array when no messages exist', async () => {
      (messageStore.getAll as jest.Mock).mockReturnValue([]);

      const request = new NextRequest('http://localhost:3000/api/messages');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toEqual([]);
      expect(data.pagination.total).toBe(0);
    });
  });

  describe('Filtering by user', () => {
    it('should filter messages by user (case-insensitive)', async () => {
      const mockMessages = [
        { id: 1, user: 'Alice', message: 'Hello' },
        { id: 2, user: 'Bob', message: 'Hi' },
        { id: 3, user: 'alice', message: 'Another message' },
      ];
      (messageStore.getAll as jest.Mock).mockReturnValue(mockMessages);

      const request = new NextRequest('http://localhost:3000/api/messages?user=alice');
      const response = await GET(request);
      const data = await response.json();

      expect(data.data).toHaveLength(2);
      expect(data.data.every((msg: StoredMessage) => msg.user.toLowerCase().includes('alice'))).toBe(true);
      expect(data.pagination.total).toBe(2);
    });

    it('should filter messages by partial user match', async () => {
      const mockMessages = [
        { id: 1, user: 'Alice', message: 'Hello' },
        { id: 2, user: 'Alicia', message: 'Hi' },
        { id: 3, user: 'Bob', message: 'Hey' },
      ];
      (messageStore.getAll as jest.Mock).mockReturnValue(mockMessages);

      const request = new NextRequest('http://localhost:3000/api/messages?user=ali');
      const response = await GET(request);
      const data = await response.json();

      expect(data.data).toHaveLength(2);
    });

    it('should return empty array when user filter has no matches', async () => {
      const mockMessages = [
        { id: 1, user: 'Alice', message: 'Hello' },
      ];
      (messageStore.getAll as jest.Mock).mockReturnValue(mockMessages);

      const request = new NextRequest('http://localhost:3000/api/messages?user=Charlie');
      const response = await GET(request);
      const data = await response.json();

      expect(data.data).toHaveLength(0);
      expect(data.pagination.total).toBe(0);
    });
  });

  describe('Filtering by message content', () => {
    it('should filter messages by content (case-insensitive)', async () => {
      const mockMessages = [
        { id: 1, user: 'Alice', message: 'Hello world' },
        { id: 2, user: 'Bob', message: 'HELLO there' },
        { id: 3, user: 'Charlie', message: 'Goodbye' },
      ];
      (messageStore.getAll as jest.Mock).mockReturnValue(mockMessages);

      const request = new NextRequest('http://localhost:3000/api/messages?message=hello');
      const response = await GET(request);
      const data = await response.json();

      expect(data.data).toHaveLength(2);
      expect(data.pagination.total).toBe(2);
    });
  });
});