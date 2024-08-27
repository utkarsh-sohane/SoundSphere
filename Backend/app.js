import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { authenticateToken } from './utils/auth.js';
import playlistRouter from './routes/playlists.js';
import tracksRouter from './routes/tracks.js';
import messagesRouter from './routes/messages.js';
import driveRouter from './routes/drive.js';
import favoritesRouter from './routes/favorites.js';
import loginRouter from './routes/login.js';
import postsRouter from './routes/posts.js';
import searchRouter from './routes/search.js';
import usersRouter from './routes/users.js';

import dbConnect from './utils/dbConnect.js';
await dbConnect();

// socket.io
import { Server } from 'socket.io';
import { createServer } from 'http';
import { sendMessage } from './utils/userUtils.js';

const app = express();
const port = process.env.PORT || 8000;

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:8000",  // Replace with your client's URL
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Handling socket.io connections
io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId;
  console.log(`User connected: ${userId}`);
  
  socket.join(userId);  // Join a room with the user's ID

  // Handling private messages
  socket.on('privateMessage', async ({ senderId, receiverId, message }) => {
    try {
      await sendMessage(senderId, receiverId, message); // Save the message to the database
      io.to(receiverId).emit('newMessage', { senderId, message }); // Emit the message to the receiver
    } catch (error) {
      console.error('Error sending message:', error);
    }
  });

  // Handle user disconnection
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${userId}`);
    socket.leave(userId);
  });
});

// Express middleware setup
app.use(cors());
app.use(express.static('public'));
app.use(express.json());

// API routes
app.use('/api/favorites', authenticateToken, favoritesRouter);
app.use('/api/playlists', authenticateToken, playlistRouter);
app.use('/api/drive', authenticateToken, driveRouter);
app.use('/api/posts', authenticateToken, postsRouter);
app.use('/api/messages', authenticateToken, messagesRouter);

// Partly protected routes
app.use('/api/users', usersRouter);
app.use('/api/tracks', tracksRouter);

// Public routes
app.use('/api/login', loginRouter);
app.use('/api/search', searchRouter);

// Start the server with Socket.IO
server.listen(port, () => {
  console.log(`Server with Socket.IO listening on port ${port}`);
});
