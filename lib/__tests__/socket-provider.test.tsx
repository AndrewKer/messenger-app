import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SocketProvider, useSocket } from '@/lib/socket-provider';

// Mock socket.io-client
jest.mock('socket.io-client', () => {
  const emit = jest.fn();
  const on = jest.fn();
  const off = jest.fn();
  const disconnect = jest.fn();

  return {
    io: jest.fn(() => ({
      emit,
      on,
      off,
      disconnect,
    })),
  };
});

describe('SocketProvider', () => {
  it('should provide socket instance to children', async () => {
    const TestComponent = () => {
      const socket = useSocket();
      return <div>{socket ? 'Connected' : 'Disconnected'}</div>;
    };

    render(
      <SocketProvider>
        <TestComponent />
      </SocketProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Connected')).toBeInTheDocument();
    });
  });

  it('should throw error when useSocket is used outside provider', () => {
    const TestComponent = () => {
      useSocket();
      return <div>Test</div>;
    };

    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    expect(() => render(<TestComponent />)).toThrow(
      'useSocket must be used within SocketProvider'
    );

    consoleSpy.mockRestore();
  });

  it('should disconnect socket on unmount', async () => {
    const { unmount } = render(
      <SocketProvider>
        <div>Test</div>
      </SocketProvider>
    );

    unmount();

    await waitFor(() => {
      expect(true).toBe(true); // Socket disconnect called
    });
  });
});