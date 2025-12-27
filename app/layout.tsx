import type { ReactNode } from 'react';
import { SocketProvider } from '../lib/socket-provider';
import './globals.css';

export const metadata = {
  title: 'Next.js Messenger',
  description: 'Real-time messenger with Socket.IO',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SocketProvider>
          {children}
        </SocketProvider>
      </body>
    </html>
  );
}