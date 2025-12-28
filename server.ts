import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server, Socket } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

interface MessageData {
  id: string;
  message: string;
  timestamp: string;
}

// Mock email sending
const sendEmail = (user: string, message: string): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`email sent to ${user} with ${message}`);
      resolve();
    }, 1000);
  });
};

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    if (!req.url) return;
    const parsedUrl = parse(req.url, true);
    await handle(req, res, parsedUrl);
  });

  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  // Socket.IO logic
  io.on("connection", (socket: Socket) => {
    console.log("User connected:", socket.id);

    socket.on("send-message", (message: string) => {
      const messageData: MessageData = {
        id: socket.id,
        message,
        timestamp: new Date().toISOString(),
      };

      console.log("Sending email...");
      sendEmail(socket.id, message).catch((err) => {
        console.error("Error sending email:", err);
      });

      io.emit("receive-message", messageData);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  httpServer.listen(port, (err?: Error) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
