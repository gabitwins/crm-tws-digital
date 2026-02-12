import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import { logger } from './utils/logger';

let io: SocketIOServer;

export const initializeSocket = (httpServer: HttpServer, corsOptions: any) => {
  io = new SocketIOServer(httpServer, {
    cors: corsOptions,
    pingTimeout: 60000,
  });

  io.on('connection', (socket) => {
    logger.info(`🔌 Socket connected: ${socket.id}`);

    socket.on('disconnect', () => {
      logger.info(`🔌 Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    // Retorna um mock se não estiver inicializado para não quebrar testes ou chamadas prematuras
    // ou lança erro se preferir strictness.
    // Vamos lançar erro, mas com log.
    logger.warn('Socket.io not initialized yet!');
    throw new Error('Socket.io not initialized!');
  }
  return io;
};
