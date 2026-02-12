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

export default router;
