import { CourseStatus } from '@prisma/client';

export interface CreateCoursePayload {
  title: string;
  description?: string;
  price?: number;
  isFree?: boolean;
  status?: CourseStatus;
  categoryId?: string;
}

export type UpdateCoursePayload = Partial<CreateCoursePayload>;
