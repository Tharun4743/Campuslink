import express from "express";
import { createServer as createViteServer } from "vite";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";

dotenv.config();

import { initDb } from "./src/db.js";
import apiRouter, { setIo } from "./src/api.js";

async function startServer() {
  const app = express();
  const server = createServer(app);
  const io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  const PORT = 3000;

  // Initialize SQLite database
  initDb();

  // Pass io instance to API router
  setIo(io);

  // Socket.io connection handling
  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("join", (userId) => {
      socket.join(`user_${userId}`);
      console.log(`User ${userId} joined their room`);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  // Middleware
  app.use(express.json());

  // API Routes
  app.use('/api', apiRouter);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
