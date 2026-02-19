import { Router } from 'express';
import * as categoryController from './category.controller';
import { validateRequest } from '../../middlewares/validateRequest';
import { categoryValidation } from './category.validation';
import { checkAuth } from '../../middlewares/checkAuth';
import { UserRole } from '@prisma/client';

const router = Router();

router.post(
  '/',
  checkAuth(UserRole.admin, UserRole.super_admin),
  validateRequest(categoryValidation.create),
  categoryController.createCategory
);
router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);

router.patch(
  '/:id',
  checkAuth(UserRole.admin, UserRole.super_admin),
  validateRequest(categoryValidation.update),
  categoryController.updateCategory
);

router.delete(
  '/:id',
  checkAuth(UserRole.admin, UserRole.super_admin),
  categoryController.deleteCategory
);

export default router;
