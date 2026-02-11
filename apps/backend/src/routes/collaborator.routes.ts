import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { authenticate } from '../middlewares/auth';

const router = Router();
const prisma = new PrismaClient();

// Listar todos os colaboradores
router.get('/', authenticate, async (req, res) => {
  try {
    const collaborators = await prisma.collaborator.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            isActive: true,
            lastLoginAt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(collaborators);
  } catch (error) {
    console.error('Erro ao listar colaboradores:', error);
    res.status(500).json({ error: 'Erro ao listar colaboradores' });
  }
});

// Convidar colaborador
router.post('/invite', authenticate, async (req, res) => {
  try {
    const { email, name, role } = req.body;
    const userId = (req as any).user.userId;

    if (!email || !name) {
      return res.status(400).json({ error: 'Email e nome são obrigatórios' });
    }

    // Verificar se já existe
    const existing = await prisma.collaborator.findUnique({
      where: { email }
    });

    if (existing) {
      return res.status(400).json({ error: 'Colaborador já existe' });
    }

    // Gerar token de convite
    const inviteToken = crypto.randomBytes(32).toString('hex');
    const inviteExpiry = new Date();
    inviteExpiry.setDate(inviteExpiry.getDate() + 7); // 7 dias

    const collaborator = await prisma.collaborator.create({
      data: {
        email,
        name,
        role: role || 'AGENT',
        status: 'PENDING',
        invitedBy: userId,
        inviteToken,
        inviteExpiry
      }
    });

    res.json({
      ...collaborator,
      inviteLink: `${process.env.FRONTEND_URL}/convite/${inviteToken}`
    });
  } catch (error) {
    console.error('Erro ao convidar colaborador:', error);
    res.status(500).json({ error: 'Erro ao enviar convite' });
  }
});

// Aceitar convite
router.post('/accept-invite/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const collaborator = await prisma.collaborator.findUnique({
      where: { inviteToken: token }
    });

    if (!collaborator) {
      return res.status(404).json({ error: 'Convite não encontrado' });
    }

    if (collaborator.status !== 'PENDING') {
      return res.status(400).json({ error: 'Convite já foi aceito' });
    }

    if (collaborator.inviteExpiry && collaborator.inviteExpiry < new Date()) {
      return res.status(400).json({ error: 'Convite expirado' });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Senha deve ter no mínimo 6 caracteres' });
    }

    // Criar usuário
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.create({
      data: {
        email: collaborator.email,
        name: collaborator.name,
        password: hashedPassword,
        role: collaborator.role,
        isActive: true
      }
    });

    // Atualizar colaborador
    await prisma.collaborator.update({
      where: { id: collaborator.id },
      data: {
        userId: user.id,
        status: 'ACTIVE',
        joinedAt: new Date(),
        inviteToken: null
      }
    });

    res.json({ message: 'Convite aceito com sucesso' });
  } catch (error) {
    console.error('Erro ao aceitar convite:', error);
    res.status(500).json({ error: 'Erro ao aceitar convite' });
  }
});

// Atualizar status do colaborador
router.patch('/:id/status', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const collaborator = await prisma.collaborator.update({
      where: { id },
      data: { status }
    });

    // Se inativar, inativar também o usuário
    if (status === 'INACTIVE' && collaborator.userId) {
      await prisma.user.update({
        where: { id: collaborator.userId },
        data: { isActive: false }
      });
    }

    res.json(collaborator);
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    res.status(500).json({ error: 'Erro ao atualizar status' });
  }
});

// Deletar colaborador
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const collaborator = await prisma.collaborator.findUnique({
      where: { id }
    });

    if (!collaborator) {
      return res.status(404).json({ error: 'Colaborador não encontrado' });
    }

    // Deletar usuário se existir
    if (collaborator.userId) {
      await prisma.user.delete({
        where: { id: collaborator.userId }
      });
    }

    // Deletar colaborador
    await prisma.collaborator.delete({
      where: { id }
    });

    res.json({ message: 'Colaborador removido com sucesso' });
  } catch (error) {
    console.error('Erro ao remover colaborador:', error);
    res.status(500).json({ error: 'Erro ao remover colaborador' });
  }
});

export default router;
