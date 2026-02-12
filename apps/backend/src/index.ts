import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import http from 'http';
import { errorHandler } from './middlewares/errorHandler';
import { notFound } from './middlewares/notFound';
import { setupRoutes } from './routes';
import { initializeServices } from './services';
import { logger } from './utils/logger';
import { connectDatabase } from './config/database';
import { initializeQueues } from './queues';
import { initializeSocket } from './socket';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const httpServer = http.createServer(app);

app.use(helmet());

const corsOptions = {
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'https://frontend-pi-eight-36.vercel.app',
    'https://frontend-oow71kvng-gabitwins-projects.vercel.app'
  ],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

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

// Seed endpoint - COMPLETAMENTE FORA DE MIDDLEWARE
app.post('/api/seed-init', async (req, res) => {
  try {
    const { token } = req.body;
    if (token !== 'seed_secret_key_12345') {
      return res.status(401).json({ status: 'error', message: 'Invalid token' });
    }
    
    const bcrypt = require('bcryptjs');
    const { prisma } = await import('./config/database');
    
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const admin = await prisma.user.upsert({
      where: { email: 'admin@nexo.com' },
      update: {},
      create: {
        email: 'admin@nexo.com',
        password: hashedPassword,
        name: 'Administrador',
        role: 'ADMIN',
        isActive: true
      }
    });
    
    res.json({ status: 'success', message: 'Seed executed', user: admin.email });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
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

    initializeSocket(httpServer, corsOptions);
    logger.info('✅ Socket.io initialized');

    httpServer.listen(PORT, () => {
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
