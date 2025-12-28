export interface MessagePayload {
  user: string;
  message: string;
}

interface StoredMessage extends MessagePayload {
  id: number;
  timestamp: string;
}

// In-memory store
const messages: StoredMessage[] = [];

export const messageStore = {
  getAll: () => messages,
  addMessage: (user: string, message: string) => {
    const newMessage = {
      id: messages.length + 1,
      user,
      message,
      timestamp: new Date().toISOString(),
    };
    messages.push(newMessage);
    return newMessage;
  },
};
