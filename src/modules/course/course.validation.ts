import { CourseStatus } from '@prisma/client';
import { z } from 'zod';

/**
 * When using multipart/form-data the middleware parses req.body.data as a
 * JSON string and overwrites req.body with the parsed object, so we validate
 * clean JSON types here.
 */
const create = z.object({
  body: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().optional(),
    price: z.coerce.number().nonnegative('Price cannot be negative').optional(),
    isFree: z.boolean().optional(),
    status: z.enum(CourseStatus).optional(),
    categoryId: z.uuid('Invalid category ID').optional(),
  }),
});

const update = z.object({
  body: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters').optional(),
    description: z.string().optional(),
    price: z.coerce.number().nonnegative('Price cannot be negative').optional(),
    isFree: z.boolean().optional(),
    status: z.enum(CourseStatus).optional(),
    categoryId: z.uuid('Invalid category ID').optional(),
  }),
});

export const courseValidation = { create, update };
