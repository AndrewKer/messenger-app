'use client';

import { useState, useEffect } from 'react';
import { useSocket } from '@/lib/socket-provider';
import styles from './page.module.css';

interface Message {
  id: string;
  message: string;
  timestamp: string;
}

export default function Home() {
  const socket = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');

  useEffect(() => {
    if (!socket) return;

    socket.on('receive-message', (data: Message) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.off('receive-message');
    };
  }, [socket]);

  const sendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.trim() && socket) {
      socket.emit('send-message', input);
      setInput('');
    }
  };

  return (
    <div className={styles.container}>
      <h1>Next.js Messenger</h1>

      <div className={styles.messages}>
        {messages.map((msg, index) => (
          <div key={index} className={styles.message}>
            <strong>{msg.id}:</strong> {msg.message}
            <span className={styles.time}>
              {new Date(msg.timestamp).toLocaleTimeString()}
            </span>
          </div>
        ))}
      </div>

      <form onSubmit={sendMessage} className={styles.form}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className={styles.input}
        />
        <button type="submit" className={styles.button}>
          Send
        </button>
      </form>
    </div>
  );
}