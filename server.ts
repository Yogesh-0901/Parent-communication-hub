import express from 'express';
import { createServer as createViteServer } from 'vite';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Routes
import authRoutes from './server/routes/auth.ts';
import studentRoutes from './server/routes/students.ts';
import messageRoutes from './server/routes/messages.ts';
import seedRoutes from './server/routes/seed.ts';
import marksRoutes from './server/routes/marks.ts';
import announcementsRoutes from './server/routes/announcements.ts';
import attendanceRoutes from './server/routes/attendance.ts';
import assignmentRoutes from './server/routes/assignments.ts';
import forgotPasswordRoutes from './server/routes/forgotPassword.ts';
import messagingRoutes from './server/routes/messaging.ts';
import emailRoutes from './server/routes/email.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = http.createServer(app);

  const PORT = Number(process.env.PORT) || 3001;

  console.log('Using SQLite database');
  console.log('EMAIL:', process.env.EMAIL_USER);

  // Middleware
  app.use(cors());
  app.use(express.json());

  // ================= SOCKET.IO =================
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join', (userId) => {
      socket.join(userId);
      console.log(`User ${userId} joined room`);
    });

    socket.on('sendMessage', (data) => {
      const { receiverId, message, senderId } = data;

      io.to(receiverId).emit('receiveMessage', {
        senderId,
        message,
        timestamp: new Date(),
      });
    });

    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });

  // ================= API ROUTES =================
  app.use('/api/auth', authRoutes);
  app.use('/api/students', studentRoutes);
  app.use('/api/messages', messageRoutes);
  app.use('/api/seed', seedRoutes);
  app.use('/api/marks', marksRoutes);
  app.use('/api/announcements', announcementsRoutes);
  app.use('/api/attendance', attendanceRoutes);
  app.use('/api/assignments', assignmentRoutes);
  app.use('/api/forgot-password', forgotPasswordRoutes);
  app.use('/api/messaging', messagingRoutes);
  app.use('/api/email', emailRoutes);

  // ================= VITE FRONTEND =================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');

    app.use(express.static(distPath));

    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // ================= MAIN SERVER ERROR HANDLING =================
  server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} is already in use.`);
      console.error(`👉 Run: taskkill /IM node.exe /F`);
      process.exit(1);
    } else {
      console.error('Server error:', err);
      process.exit(1);
    }
  });

  // ================= START SERVER =================
  server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

startServer();