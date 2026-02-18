import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { checkAuth } from '../../middlewares/checkAuth';
import { validateRequest } from '../../middlewares/validateRequest';
import { userController } from './user.controller';
import { userValidation } from './user.validation';

const router = Router();

// Any authenticated user — get own profile
router.get('/me', checkAuth(...Object.values(UserRole)), userController.getMe);

// Admin + Super Admin — list and view users
router.get(
  '/',
  checkAuth(UserRole.admin, UserRole.super_admin),
  userController.getAllUsers
);

router.get(
  '/:id',
  checkAuth(UserRole.admin, UserRole.super_admin),
  userController.getUserById
);

// Admin + Super Admin — update user status
router.patch(
  '/:id/status',
  checkAuth(UserRole.admin, UserRole.super_admin),
  validateRequest(userValidation.updateStatusSchema),
  userController.updateUserStatus
);

// Super Admin only — delete user
router.delete(
  '/:id',
  checkAuth(UserRole.super_admin),
  userController.deleteUser
);

router.patch(
  '/self/:id',
  checkAuth(...Object.values(UserRole)),
  validateRequest(userValidation.updateUserSchema),
  userController.updateUser
);

// Super Admin only — manage admin accounts
router.post(
  '/admin',
  checkAuth(UserRole.super_admin),
  validateRequest(userValidation.createAdminSchema),
  userController.createAdmin
);

router.patch(
  '/admin/:id',
  checkAuth(UserRole.super_admin),
  validateRequest(userValidation.updateAdminSchema),
  userController.updateAdmin
);

export const userRoutes = router;
