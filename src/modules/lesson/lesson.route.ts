import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { checkAuth } from '../../middlewares/checkAuth';
import { validateRequest } from '../../middlewares/validateRequest';
import { lessonValidation } from './lesson.validation';
import { lessonController } from './lesson.controller';
import { multerUpload } from '../../config/multer.config';

const router = Router();

router.get(
  '/',
  checkAuth(
    UserRole.student,
    UserRole.instructor,
    UserRole.admin,
    UserRole.super_admin
  ),
  lessonController.getAllLessons
);

router.get(
  '/:id',
  checkAuth(
    UserRole.student,
    UserRole.instructor,
    UserRole.admin,
    UserRole.super_admin
  ),
  validateRequest(lessonValidation.params),
  lessonController.getSingleLesson
);

router.post(
  '/',
  checkAuth(UserRole.instructor, UserRole.admin, UserRole.super_admin),
  multerUpload.single('video'),
  validateRequest(lessonValidation.create),
  lessonController.createLesson
);

router.patch(
  '/:id',
  checkAuth(UserRole.instructor, UserRole.admin, UserRole.super_admin),
  multerUpload.single('video'),
  validateRequest(lessonValidation.params),
  validateRequest(lessonValidation.update),
  lessonController.updateLesson
);

router.delete(
  '/:id',
  checkAuth(UserRole.instructor, UserRole.admin, UserRole.super_admin),
  validateRequest(lessonValidation.params),
  lessonController.deleteLesson
);

export const lessonRoutes = router;
