import { Router } from 'express';
import * as categoryController from './category.controller';
import { validateRequest } from '../../middlewares/validateRequest';
import { categoryValidation } from './category.validation';

const router = Router();

router.post(
  '/',
  validateRequest(categoryValidation.create),
  categoryController.createCategory
);
router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);
router.patch(
  '/:id',
  validateRequest(categoryValidation.update),
  categoryController.updateCategory
);
router.delete('/:id', categoryController.deleteCategory);

export default router;
