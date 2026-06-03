import { Router } from 'express';
import { authController } from '../controllers/index.js';
import { validateBody, validateParams } from '../middleware/validation/index.js';
import { authenticate } from '../middleware/auth/index.js';
import {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  updateProfileSchema,
  userIdSchema,
} from '../utils/validationSchemas.js';

const router = Router();

router.post(
  '/register',
  validateBody(registerSchema),
  authController.register.bind(authController)
);

router.post(
  '/login',
  validateBody(loginSchema),
  authController.login.bind(authController)
);

router.post(
  '/refresh',
  authController.refreshToken.bind(authController)
);

router.post(
  '/logout',
  authenticate,
  authController.logout.bind(authController)
);

router.get(
  '/profile',
  authenticate,
  authController.getProfile.bind(authController)
);

router.put(
  '/profile',
  authenticate,
  validateBody(updateProfileSchema),
  authController.updateProfile.bind(authController)
);

router.put(
  '/password',
  authenticate,
  validateBody(changePasswordSchema),
  authController.changePassword.bind(authController)
);

export default router;
