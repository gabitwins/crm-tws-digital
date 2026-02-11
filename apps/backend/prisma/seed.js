const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Criando usuário admin...');
  
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
  
  console.log('✅ Usuário admin criado:', admin.email);
}

main()
  .catch((e) => {
    console.error('❌ Erro:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
