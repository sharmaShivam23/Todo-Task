import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectToDatabase } from './config/database';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/authRoutes';
import todoRoutes from './routes/todoRoutes';
import {
  securityHeaders,
  mongoSanitization,
  httpParameterPollution,
  generalLimiter,
} from './middleware/security';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS must be first to allow requests
app.use(cors({
  origin: ["https://todoweb25.vercel.app"],
  // origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing middleware (must come before security middleware)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security Middleware
app.use(securityHeaders);
app.use(mongoSanitization);
app.use(httpParameterPollution);
app.use(generalLimiter);

// Apply xss-clean globally (after body parsing)
// Temporarily commented out to test if it's interfering with request body
// eslint-disable-next-line @typescript-eslint/no-var-requires
// const xss = require('xss-clean');
// app.use(xss());

// Health check route
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/todos', todoRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    await connectToDatabase();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

