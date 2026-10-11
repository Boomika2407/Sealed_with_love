import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/authRoutes.js';
import capsuleRoutes from './routes/capsuleRoutes.js';
import wallRoutes from './routes/wallRoutes.js';
import memoryWallRoutes from './routes/memoryWallRoutes.js';
import mediaRoutes from './routes/mediaRoutes.js';
import spotRoutes from './routes/spotRoutes.js';
import { getCampus } from './controllers/spotController.js';
import { generalLimiter } from './middleware/rateLimiter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.resolve(__dirname, '../../client/dist');

const app = express();

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// CORS policy
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// General rate limiter
app.use('/api', generalLimiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'Sealed - Time Capsule Network',
    securityModel: 'server-enforced access control',
    serverTimeUtc: new Date().toISOString()
  });
});

// Mount modular API routes
app.use('/api/auth', authRoutes);
app.use('/api/capsules', capsuleRoutes);
app.use('/api/wall', wallRoutes);
app.use('/api/memory-wall', memoryWallRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/spots', spotRoutes);
app.get('/api/campus', getCampus);

// Serve static frontend files if client build exists
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));

  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// 404 handler for unmatched API routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'This page graduated early. (Route not found)'
  });
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

export default app;
