import { Request, Response } from 'express';
import { prisma } from '../config/database';

export class UserController {
  async updateProfile(req: Request, res: Response) {
    try {
      const { name, email, phone, company, avatar } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      // Check if email is already taken by another user
      if (email) {
        const existingUser = await prisma.user.findFirst({
          where: {
            email,
            id: { not: userId }
          }
        });

        if (existingUser) {
          return res.status(400).json({ error: 'Email já está em uso por outro usuário' });
        }
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          name,
          email,
          phone,
          company,
          avatar
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          company: true,
          role: true,
          avatar: true
        }
      });

      return res.json(updatedUser);
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      return res.status(500).json({ error: 'Erro interno ao atualizar perfil' });
    }
  }

  async uploadAvatar(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Nenhum arquivo enviado' });
      }

      // Assuming file upload middleware puts file info in req.file
      // and we return the file path or URL.
      // For local storage, we can return the path.
      // In production, this would be an S3 URL.
      
      const avatarUrl = `/uploads/${req.file.filename}`;
      const userId = req.user?.id;

      if (!userId) {
         return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { avatar: avatarUrl },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatar: true
        }
      });

      return res.json(updatedUser);
    } catch (error) {
      console.error('Erro ao fazer upload de avatar:', error);
      return res.status(500).json({ error: 'Erro ao processar upload' });
    }
  }
}
