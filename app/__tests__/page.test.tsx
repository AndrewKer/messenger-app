import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Home from "@/app/page";
import { act } from "@testing-library/react";

// Mock the socket provider before importing the component
jest.mock("@/lib/socket-provider", () => ({
  useSocket: jest.fn(),
}));

import { useSocket } from "@/lib/socket-provider";

describe("Home Page", () => {
  const mockSocket = {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useSocket as jest.Mock).mockReturnValue(mockSocket);
  });

  it("should render the messenger interface", () => {
    render(<Home />);

    expect(screen.getByText("Next.js Messenger")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Type a message...")
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send/i })).toBeInTheDocument();
  });

  it("should send message on form submit", async () => {
    const user = userEvent.setup();

    render(<Home />);

    // Simulate user input
    await user.type(
      screen.getByPlaceholderText("Type a message..."),
      "Hello World"
    );

    // Submit form
    await user.click(screen.getByRole("button", { name: /send/i }));

    // Verify message was sent
    expect(mockSocket.emit).toHaveBeenCalledWith("send-message", "Hello World");
  });

  it("should display messages in real-time", async () => {
    // Simulate receiving a message
    mockSocket.on.mockImplementation((event, callback) => {
      if (event === "receive-message") {
        callback({
          id: "1",
          message: "Hello World",
          timestamp: new Date().toISOString(),
        });
      }
    });

    render(<Home />);

    // Wait for message to appear
    await waitFor(() => {
      expect(screen.getByText("Hello World")).toBeInTheDocument();
    });

    // Verify message is displayed with correct formatting
    expect(screen.getByText("Hello World")).toBeInTheDocument();
    expect(screen.getByText("1:")).toBeInTheDocument();
  });

  it("should not send empty messages", async () => {
    const mockSocket = {
      emit: jest.fn(),
      on: jest.fn(),
      off: jest.fn(),
    };

    // Mock the socket provider
    jest.mock("@/lib/socket-provider", () => ({
      useSocket: () => mockSocket,
    }));

    const user = userEvent.setup();
    render(<Home />);

    // Submit empty message
    await user.click(screen.getByRole("button", { name: /send/i }));

    // Verify no message was sent
    expect(mockSocket.emit).not.toHaveBeenCalled();
  });

  it("should handle message formatting", async () => {
    // Simulate receiving a message with special characters
    mockSocket.on.mockImplementation((event, callback) => {
      if (event === "receive-message") {
        callback({
          id: "1",
          message: 'Hello <script>alert("xss")</script> World',
          timestamp: new Date().toISOString(),
        });
      }
    });

    render(<Home />);

    // Wait for message to appear
    await waitFor(() => {
      expect(
        screen.getByText('Hello <script>alert("xss")</script> World')
      ).toBeInTheDocument();
    });

    // Verify HTML is not executed (sanitized)
    expect(
      screen.getByText('Hello <script>alert("xss")</script> World')
    ).toBeInTheDocument();
  });
});

describe("Home - Handle Connection Errors", () => {
  const mockSocket = {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  };
  let errorCallback: ((err: Error) => void) | null = null;

  beforeEach(() => {
    (useSocket as jest.Mock).mockReturnValue(mockSocket);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should display error message when socket emits error event", async () => {
    mockSocket.on.mockImplementation(
      (event: string, callback: ((err: Error) => void) | null = null) => {
        if (event === "error") {
          errorCallback = callback;
        }
      }
    );

    render(<Home />);

    // Wrap the code that updates the state inside the act function
    await act(() => {
      // Simulate socket error
      const testError = new Error("Connection failed");
      errorCallback?.(testError);
    });

    await waitFor(() => {
      const errorElement = screen.getByTestId("error-message");
      expect(errorElement).toBeInTheDocument();
      expect(errorElement).toHaveTextContent("Connection failed");
    });
  });

  it("should clear error listeners on unmount", () => {
    const { unmount } = render(<Home />);

    unmount();

    expect(mockSocket.off).toHaveBeenCalledWith("error");
    expect(mockSocket.off).toHaveBeenCalledWith("receive-message");
  });

  it("should handle multiple consecutive errors", async () => {
    mockSocket.on.mockImplementation(
      (event: string, callback: ((err: Error) => void) | null = null) => {
        if (event === "error") {
          errorCallback = callback;
        }
      }
    );

    render(<Home />);

    // First error
    await act(() => {
      // Simulate socket error
      errorCallback?.(new Error("First error"));
    });
    await waitFor(() => {
      expect(screen.getByTestId("error-message")).toHaveTextContent(
        "First error"
      );
    });

    // Wrap the code that updates the state inside the act function

    // Second error overwrites first
    await act(() => {
      // Simulate socket error
      errorCallback?.(new Error("Second error"));
    });
    await waitFor(() => {
      expect(screen.getByTestId("error-message")).toHaveTextContent(
        "Second error"
      );
    });
  });

  it("should not crash when socket is null", () => {
    (useSocket as jest.Mock).mockReturnValue(null);

    expect(() => render(<Home />)).not.toThrow();
  });
});
