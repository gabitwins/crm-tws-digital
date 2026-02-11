import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth';
import { imageUpload } from '../middlewares/imageUpload';

const router = Router();
const userController = new UserController();

router.put('/profile', authenticate, userController.updateProfile.bind(userController));
router.post('/avatar', authenticate, imageUpload.single('avatar'), userController.uploadAvatar.bind(userController));

export default router;
