import { Router } from 'express';
import { body } from 'express-validator';
import { AuthController } from '../controllers/auth.controller';

const router = Router();
const authController = new AuthController();

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Email inválido'),
    body('password').notEmpty().withMessage('Senha obrigatória')
  ],
  authController.login.bind(authController)
);

router.post(
  '/register',
  [
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
    body('name').notEmpty(),
    body('role').notEmpty()
  ],
  authController.register.bind(authController)
);

router.post('/refresh', authController.refreshToken.bind(authController));

router.post('/seed', async (req, res, next) => {
  try {
    const { token } = req.body;
    if (token !== 'seed_secret_key_12345') {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const bcrypt = require('bcryptjs');
    const { prisma } = require('../config/database');
    
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
    
    res.json({ message: 'Seed executed', user: admin.email });
  } catch (error) {
    next(error);
  }
});

export default router;
