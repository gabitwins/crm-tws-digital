import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { AppError } from '../middlewares/errorHandler';

export class LeadController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const leads = await prisma.lead.findMany({
        include: {
          assignedAgent: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          tags: {
            include: {
              tag: true
            }
          }
        },
        orderBy: {
          lastInteraction: 'desc'
        }
      });

      res.json(leads);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const lead = await prisma.lead.findUnique({
        where: { id },
        include: {
          assignedAgent: true,
          tags: {
            include: { tag: true }
          },
          messages: {
            orderBy: { sentAt: 'desc' },
            take: 50
          },
          sales: {
            include: { product: true }
          },
          tickets: true,
          activities: {
            orderBy: { createdAt: 'desc' }
          },
          notes: {
            include: { user: true }
          }
        }
      });

      if (!lead) {
        throw new AppError('Lead não encontrado', 404);
      }

      res.json(lead);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, phone, email, source } = req.body;

      const lead = await prisma.lead.create({
        data: {
          name,
          phone,
          email,
          source
        }
      });

      res.status(201).json(lead);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = req.body;

      const lead = await prisma.lead.update({
        where: { id },
        data
      });

      res.json(lead);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      await prisma.lead.delete({
        where: { id }
      });

      res.json({ message: 'Lead deletado com sucesso' });
    } catch (error) {
      next(error);
    }
  }
}
