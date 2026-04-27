// src/server.ts

import dotenv from 'dotenv';
import { app } from './app.js';
import logger from './utils/logger.js';

// Load environment variables
dotenv.config({ path: '.env.local' });

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Start server
const server = app.listen(PORT, () => {
  logger.info(`distill. API server started`, {
    port: PORT,
    environment: NODE_ENV,
    supabase_configured: !!process.env.SUPABASE_URL,
    groq_configured: !!process.env.GROQ_API_KEY
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', { promise, reason });
});

export default server;
