import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/database';

const router = Router();

router.post('/init-database', async (req: Request, res: Response) => {
  try {
    // Tentar criar tabela users se não existir
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        avatar TEXT,
        role TEXT NOT NULL DEFAULT 'AGENT',
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "lastLoginAt" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Verificar se admin existe
    const existingAdmin = await prisma.$queryRawUnsafe<any[]>(
      `SELECT * FROM users WHERE email = 'admin@crm.com' LIMIT 1;`
    );

    if (existingAdmin.length > 0) {
      return res.json({ 
        status: 'success', 
        message: 'Database já inicializado',
        admin: existingAdmin[0]
      });
    }

    // Criar admin
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await prisma.$executeRawUnsafe(`
      INSERT INTO users (email, password, name, role, "isActive") 
      VALUES ('admin@crm.com', '${hashedPassword}', 'Admin', 'ADMIN', true);
    `);

    res.json({ 
      status: 'success', 
      message: 'Database e admin criados com sucesso!'
    });
  } catch (error: any) {
    res.status(500).json({ 
      status: 'error', 
      message: error.message 
    });
  }
});

router.post('/create-admin', async (req: Request, res: Response) => {
  try {
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@crm.com' }
    });

    if (existingAdmin) {
      return res.json({ 
        status: 'success', 
        message: 'Admin já existe',
        user: {
          id: existingAdmin.id,
          email: existingAdmin.email,
          name: existingAdmin.name
        }
      });
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);

    const admin = await prisma.user.create({
      data: {
        email: 'admin@crm.com',
        password: hashedPassword,
        name: 'Admin',
        role: 'ADMIN',
        isActive: true
      }
    });

    res.json({ 
      status: 'success', 
      message: 'Admin criado com sucesso!',
      user: {
        id: admin.id,
        email: admin.email,
        name: admin.name
      }
    });
  } catch (error: any) {
    res.status(500).json({ 
      status: 'error', 
      message: error.message 
    });
  }
});

router.get('/check-admin', async (req: Request, res: Response) => {
  try {
    const users = await prisma.$queryRawUnsafe<any[]>(
      `SELECT id, email, name, role, "isActive" FROM users WHERE email = 'admin@crm.com' LIMIT 1;`
    );

    if (users.length === 0) {
      return res.json({ 
        status: 'not_found', 
        message: 'Admin não encontrado' 
      });
    }

    res.json({ 
      status: 'found', 
      user: users[0]
    });
  } catch (error: any) {
    res.status(500).json({ 
      status: 'error', 
      message: error.message 
    });
  }
});

router.post('/create-admin-nexo', async (req: Request, res: Response) => {
  try {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await prisma.$executeRawUnsafe(`
      INSERT INTO users (email, password, name, role, "isActive") 
      VALUES ('admin@nexo.com', '${hashedPassword}', 'Admin NEXO', 'ADMIN', true)
      ON CONFLICT (email) DO NOTHING;
    `);

    res.json({ 
      status: 'success', 
      message: 'Admin NEXO criado/verificado',
      email: 'admin@nexo.com'
    });
  } catch (error: any) {
    res.status(500).json({ 
      status: 'error', 
      message: error.message 
    });
  }
});

export default router;
