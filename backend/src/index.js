require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const socketIo = require('socket.io');
const logger = require('./utils/logger');
const authRoutes = require('./routes/auth');
const goalRoutes = require('./routes/goals');
const chapterRoutes = require('./routes/chapters');
const mockTestRoutes = require('./routes/mockTests');
const progressRoutes = require('./routes/progress');
const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true } });
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});
app.use('/api/auth', authRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/chapters', chapterRoutes);
app.use('/api/mock-tests', mockTestRoutes);
app.use('/api/progress', progressRoutes);
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});
io.on('connection', (socket) => {
  logger.info(`User connected: ${socket.id}`);
  socket.on('disconnect', () => {
    logger.info(`User disconnected: ${socket.id}`);
  });
  socket.on('goal-updated', (data) => {
    io.emit('goal-updated-notification', data);
  });
  socket.on('chapter-changed', (data) => {
    io.emit('chapter-changed-notification', data);
  });
});
app.use((err, req, res, next) => {
  logger.error(err.message);
  res.status(err.status || 500).json({ error: { message: err.message, status: err.status || 500 } });
});
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
module.exports = { app, io };