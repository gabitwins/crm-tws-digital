const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const existing = await prisma.user.findUnique({
      where: { email: 'admin@crm.com' }
    });

    if (existing) {
      console.log('✅ Usuário admin já existe');
      console.log('Email:', existing.email);
      console.log('ID:', existing.id);
      return;
    }

    const user = await prisma.user.create({
      data: {
        email: 'admin@crm.com',
        password: hashedPassword,
        name: 'Admin',
        role: 'admin',
        isActive: true
      }
    });

    console.log('✅ Usuário admin criado com sucesso!');
    console.log('Email: admin@crm.com');
    console.log('Senha: admin123');
    console.log('ID:', user.id);
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
