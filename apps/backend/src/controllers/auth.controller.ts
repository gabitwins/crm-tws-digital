import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';
import { AppError } from '../middlewares/errorHandler';

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;
      console.log('🔐 Tentativa de login:', { email });

      // Usar SQL puro para evitar problema do Prisma
      const users = await prisma.$queryRawUnsafe<any[]>(
        `SELECT * FROM users WHERE email = '${email}' LIMIT 1;`
      );

      console.log('👤 Usuário encontrado:', users.length > 0 ? 'SIM' : 'NÃO');

      const user = users[0];

      if (!user || !user.isActive) {
        console.log('❌ Usuário não encontrado ou inativo');
        throw new AppError('Credenciais inválidas', 401);
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      console.log('🔑 Senha válida:', isValidPassword ? 'SIM' : 'NÃO');

      if (!isValidPassword) {
        throw new AppError('Credenciais inválidas', 401);
      }

      await prisma.$executeRawUnsafe(
        `UPDATE users SET "lastLoginAt" = NOW() WHERE id = '${user.id}';`
      );

      const token = this.generateToken(user.id, user.email, user.role);

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatar: user.avatar
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, name, role } = req.body;

      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        throw new AppError('Email já cadastrado', 400);
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role
        }
      });

      const token = this.generateToken(user.id, user.email, user.role);

      res.status(201).json({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.body;

      if (!token) {
        throw new AppError('Token não fornecido', 400);
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId }
      });

      if (!user || !user.isActive) {
        throw new AppError('Usuário não encontrado', 401);
      }

      const newToken = this.generateToken(user.id, user.email, user.role);

      res.json({ token: newToken });
    } catch (error) {
      next(error);
    }
  }

  private generateToken(userId: string, email: string, role: string): string {
    const secret = process.env.JWT_SECRET || 'default-secret';
    const payload = { userId, email, role };
    
    return jwt.sign(payload, secret, { expiresIn: '7d' } as any);
  }
}
