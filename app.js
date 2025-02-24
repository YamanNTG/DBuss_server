require('dotenv').config();
require('express-async-errors');

const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const fileUpload = require('express-fileupload');
const cloudinary = require('cloudinary').v2;
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimiter = require('express-rate-limit');
const helmet = require('helmet');
const xss = require('xss-clean');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const socketService = require('./utils/socketService');
// Initialize express and create HTTP server
const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:5173', 'https://buss-front.netlify.app'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});
socketService.init(io);
// Socket connection handling
io.on('connection', (socket) => {
  console.log('A client connected:', socket.id);
  socket.on('custom-event', (string) => {
    console.log(string);
  });
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// Database
const connectDB = require('./db/connect');

// Routes
const authRouter = require('./routes/authRoutes');
const userRouter = require('./routes/userRoutes');
const newsRouter = require('./routes/newsRoutes');
const issuesRouter = require('./routes/issuesRoutes');

// Middleware
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');

// Security middleware
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 60,
  })
);
app.use(helmet());
app.use(morgan('tiny'));
app.use(xss());
app.use(mongoSanitize());
app.use(express.json());
app.use(
  fileUpload({
    useTempFiles: true,
  })
);

app.use(
  cors({
    origin: ['http://localhost:5173', 'https://buss-front.netlify.app'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  })
);
app.use(cookieParser(process.env.JWT_SECRET));
app.use(express.static('./public'));

// Routes
app.get('/', (req, res) => {
  res.send('DBbuss API');
});
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/news', newsRouter);
app.use('/api/v1/issues', issuesRouter);

// Error handling middleware
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

// Start server function
const port = process.env.PORT || 5000;
const start = async () => {
  try {
    await connectDB(process.env.MONGO_URL);
    httpServer.listen(port, () => {
      console.log(`Server is running on port ${port}`);
      console.log('Socket.IO server is ready for connections');
    });
  } catch (error) {
    console.log('Server startup error:', error);
  }
};

start();

module.exports = { app, io };
