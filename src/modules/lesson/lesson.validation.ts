import { LessonType } from '@prisma/client';
import { z } from 'zod';

const create = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    content: z.string().optional(),
    type: z.nativeEnum(LessonType).optional(),
    videoUrl: z.string().url('Invalid video URL').optional(),
    description: z.string().optional(),
    order: z.number().int('Order must be an integer'),
    isPreview: z.boolean().optional(),
    courseId: z.string().uuid('Invalid course ID'),
  }),
});

const update = z.object({
  body: z.object({
    title: z.string().optional(),
    content: z.string().optional(),
    type: z.nativeEnum(LessonType).optional(),
    videoUrl: z.string().url('Invalid video URL').optional(),
    description: z.string().optional(),
    order: z.number().optional(),
    isPreview: z.boolean().optional(),
    courseId: z.string().uuid('Invalid course ID').optional(),
  }),
});

const params = z.object({
  params: z.object({
    id: z.string().uuid('Invalid lesson ID'),
  }),
});

export const lessonValidation = {
  create,
  update,
  params,
};
