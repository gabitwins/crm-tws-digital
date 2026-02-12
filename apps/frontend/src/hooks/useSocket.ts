import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // Usar a mesma URL da API (sem /api)
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
    const socketUrl = apiUrl.replace('/api', '');

    const socketInstance = io(socketUrl, {
      transports: ['websocket'],
      withCredentials: true,
      path: '/socket.io/', // Padrão
    });

    socketInstance.on('connect', () => {
      console.log('🔌 Socket conectado:', socketInstance.id);
    });

    socketInstance.on('connect_error', (err) => {
      console.error('❌ Erro de conexão socket:', err);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return socket;
};
