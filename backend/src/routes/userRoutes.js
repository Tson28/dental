import { Router } from 'express';
import { userController } from '../controllers/index.js';
import { validateBody, validateParams, validateQuery } from '../middleware/validation/index.js';
import { authenticate, authorize, isAdmin } from '../middleware/auth/index.js';
import {
  userQuerySchema,
  userIdSchema,
  updateUserSchema,
} from '../utils/validationSchemas.js';

const router = Router();

router.get(
  '/',
  authenticate,
  isAdmin,
  validateQuery(userQuerySchema),
  userController.getAllUsers.bind(userController)
);

router.get(
  '/doctors',
  authenticate,
  userController.getDoctors.bind(userController)
);

router.get(
  '/stats',
  authenticate,
  isAdmin,
  userController.getUserStats.bind(userController)
);

router.get(
  '/:id',
  authenticate,
  isAdmin,
  validateParams(userIdSchema),
  userController.getUserById.bind(userController)
);

router.put(
  '/:id',
  authenticate,
  isAdmin,
  validateParams(userIdSchema),
  validateBody(updateUserSchema),
  userController.updateUser.bind(userController)
);

router.patch(
  '/:id/status',
  authenticate,
  isAdmin,
  validateParams(userIdSchema),
  userController.toggleUserStatus.bind(userController)
);

router.delete(
  '/:id',
  authenticate,
  isAdmin,
  validateParams(userIdSchema),
  userController.deleteUser.bind(userController)
);

export default router;
