import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { checkAuth } from '../../middlewares/checkAuth';
import { validateRequest } from '../../middlewares/validateRequest';
import { multerUpload } from '../../config/multer.config';
import { courseValidation } from './course.validation';
import { courseController } from './course.controller';

const router = Router();

router.post(
  '/',
  checkAuth(UserRole.instructor, UserRole.admin, UserRole.super_admin),
  multerUpload.single('thumbnail'),
  validateRequest(courseValidation.create),
  courseController.createCourse
);

router.patch(
  '/:id',
  checkAuth(UserRole.instructor, UserRole.admin, UserRole.super_admin),
  multerUpload.single('thumbnail'),
  validateRequest(courseValidation.update),
  courseController.updateCourse
);

export default router;
