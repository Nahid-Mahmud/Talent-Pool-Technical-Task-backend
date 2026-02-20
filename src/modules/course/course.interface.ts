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

export interface GetCoursesFilters {
  search?: string;
  categoryId?: string;
  category?: string;
  instructorId?: string;
  status?: CourseStatus;
  isFree?: boolean;
  page?: number | string;
  limit?: number | string;
  sortOrder?: 'asc' | 'desc';
  sortBy?: string;
}
