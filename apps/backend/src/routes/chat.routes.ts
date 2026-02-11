import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middlewares/auth';

const router = Router();
const prisma = new PrismaClient();

// Listar conversas (colaboradores com quem já conversou)
router.get('/conversations', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user.userId;

    // Buscar colaborador do usuário logado
    const myCollaborator = await prisma.collaborator.findUnique({
      where: { userId }
    });

    if (!myCollaborator) {
      return res.status(404).json({ error: 'Colaborador não encontrado' });
    }

    // Buscar todos os colaboradores ativos exceto eu mesmo
    const collaborators = await prisma.collaborator.findMany({
      where: {
        status: 'ACTIVE',
        id: { not: myCollaborator.id }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            lastLoginAt: true
          }
        }
      }
    });

    // Para cada colaborador, buscar última mensagem e contador de não lidas
    const conversations = await Promise.all(
      collaborators.map(async (collab) => {
        const lastMessage = await prisma.internalMessage.findFirst({
          where: {
            OR: [
              { senderId: myCollaborator.id, receiverId: collab.id },
              { senderId: collab.id, receiverId: myCollaborator.id }
            ]
          },
          orderBy: { createdAt: 'desc' }
        });

        const unreadCount = await prisma.internalMessage.count({
          where: {
            senderId: collab.id,
            receiverId: myCollaborator.id,
            isRead: false
          }
        });

        return {
          collaborator: collab,
          lastMessage,
          unreadCount
        };
      })
    );

    // Ordenar por última mensagem
    conversations.sort((a, b) => {
      if (!a.lastMessage) return 1;
      if (!b.lastMessage) return -1;
      return b.lastMessage.createdAt.getTime() - a.lastMessage.createdAt.getTime();
    });

    res.json(conversations);
  } catch (error) {
    console.error('Erro ao listar conversas:', error);
    res.status(500).json({ error: 'Erro ao listar conversas' });
  }
});

// Listar mensagens de uma conversa
router.get('/messages/:collaboratorId', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const { collaboratorId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const myCollaborator = await prisma.collaborator.findUnique({
      where: { userId }
    });

    if (!myCollaborator) {
      return res.status(404).json({ error: 'Colaborador não encontrado' });
    }

    const messages = await prisma.internalMessage.findMany({
      where: {
        OR: [
          { senderId: myCollaborator.id, receiverId: collaboratorId },
          { senderId: collaboratorId, receiverId: myCollaborator.id }
        ]
      },
      include: {
        sender: {
          include: {
            user: {
              select: {
                name: true,
                avatar: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'asc' },
      take: Number(limit),
      skip: Number(offset)
    });

    // Marcar como lidas as mensagens recebidas
    await prisma.internalMessage.updateMany({
      where: {
        senderId: collaboratorId,
        receiverId: myCollaborator.id,
        isRead: false
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });

    res.json(messages);
  } catch (error) {
    console.error('Erro ao listar mensagens:', error);
    res.status(500).json({ error: 'Erro ao listar mensagens' });
  }
});

// Enviar mensagem
router.post('/messages', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const { receiverId, message } = req.body;

    if (!receiverId || !message) {
      return res.status(400).json({ error: 'ReceberId e mensagem são obrigatórios' });
    }

    const myCollaborator = await prisma.collaborator.findUnique({
      where: { userId }
    });

    if (!myCollaborator) {
      return res.status(404).json({ error: 'Colaborador não encontrado' });
    }

    const newMessage = await prisma.internalMessage.create({
      data: {
        senderId: myCollaborator.id,
        receiverId,
        message
      },
      include: {
        sender: {
          include: {
            user: {
              select: {
                name: true,
                avatar: true
              }
            }
          }
        }
      }
    });

    res.json(newMessage);
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    res.status(500).json({ error: 'Erro ao enviar mensagem' });
  }
});

// Marcar mensagem como lida
router.patch('/messages/:id/read', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const message = await prisma.internalMessage.update({
      where: { id },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });

    res.json(message);
  } catch (error) {
    console.error('Erro ao marcar mensagem:', error);
    res.status(500).json({ error: 'Erro ao marcar mensagem' });
  }
});

// Contador de mensagens não lidas
router.get('/unread-count', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user.userId;

    const myCollaborator = await prisma.collaborator.findUnique({
      where: { userId }
    });

    if (!myCollaborator) {
      return res.json({ count: 0 });
    }

    const count = await prisma.internalMessage.count({
      where: {
        receiverId: myCollaborator.id,
        isRead: false
      }
    });

    res.json({ count });
  } catch (error) {
    console.error('Erro ao contar mensagens:', error);
    res.status(500).json({ error: 'Erro ao contar mensagens' });
  }
});

export default router;
