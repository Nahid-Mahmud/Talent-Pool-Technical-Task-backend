import { z } from 'zod';

const create = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
  }),
});

const update = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
  }),
});

export const categoryValidation = { create, update };
