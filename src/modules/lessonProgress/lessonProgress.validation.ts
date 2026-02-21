import { z } from 'zod';

const updateProgress = z.object({
  body: z.object({
    lessonId: z.string().uuid('Invalid lesson ID'),
    isCompleted: z.boolean(),
  }),
});

export const lessonProgressValidation = {
  updateProgress,
};
