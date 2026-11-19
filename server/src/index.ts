import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import express, { Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { Server as SocketIOServer } from 'socket.io';
import { config } from './config';
import { connectDB, disconnectDB } from './config/database';
import { generalLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';
import './types/express';

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO with CORS configuration
const io = new SocketIOServer(server, {
  cors: {
    origin: config.clientUrl,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  },
});

io.on('connection', (socket) => {
  console.log(`[Socket.IO] Client connected: ${socket.id}`);

  socket.on('disconnect', (reason) => {
    console.log(`[Socket.IO] Client disconnected: ${socket.id} (${reason})`);
  });
});

// Middleware configuration
app.use(helmet());
app.use(
  cors({
    origin: config.clientUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply general rate limiting
app.use(generalLimiter);

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    service: 'LifeLink AI Server',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

// Global Error Handler
app.use(errorHandler);

// Server startup routine
const startServer = async (): Promise<void> => {
  try {
    await connectDB();
    server.listen(config.port, () => {
      console.log(`[LifeLink AI] Server running in ${config.nodeEnv} mode on port ${config.port}`);
      console.log(`[LifeLink AI] Client URL permitted: ${config.clientUrl}`);
    });
  } catch (error) {
    console.error('[LifeLink AI] Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown handler
const handleGracefulShutdown = async (signal: string): Promise<void> => {
  console.log(`\n[LifeLink AI] Received ${signal}. Starting graceful shutdown...`);

  server.close(async () => {
    console.log('[LifeLink AI] HTTP server closed.');
    try {
      await disconnectDB();
      console.log('[LifeLink AI] Mongoose disconnected. Process exiting cleanly.');
      process.exit(0);
    } catch (err) {
      console.error('[LifeLink AI] Error during shutdown:', err);
      process.exit(1);
    }
  });

  // Force process exit after 10 seconds if connections hang
  setTimeout(() => {
    console.error('[LifeLink AI] Forced shutdown after timeout.');
    process.exit(1);
  }, 10000).unref();
};

process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));
process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));

startServer();

export { app, server, io };
