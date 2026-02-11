import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { errorHandler } from './middlewares/errorHandler';
import { notFound } from './middlewares/notFound';
import { setupRoutes } from './routes';
import { initializeServices } from './services';
import { logger } from './utils/logger';
import { connectDatabase } from './config/database';
import { initializeQueues } from './queues';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet());
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'https://frontend-pi-eight-36.vercel.app',
    'https://frontend-oow71kvng-gabitwins-projects.vercel.app'
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Endpoint de teste para diagnosticar problemas
app.get('/api/test', (req, res) => {
  res.json({
    message: 'API backend funcionando!',
    token_received: !!req.headers.authorization,
    timestamp: new Date().toISOString()
  });
});

setupRoutes(app);

app.use(notFound);
app.use(errorHandler);

async function startServer() {
  try {
    await connectDatabase();
    logger.info('✅ Database connected');

    // await initializeQueues();
    // logger.info('✅ Queues initialized');

    await initializeServices();
    logger.info('✅ Services initialized');

    app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`📍 Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});
