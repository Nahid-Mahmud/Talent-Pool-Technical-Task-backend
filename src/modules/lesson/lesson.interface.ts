import { LessonType } from '@prisma/client';

export interface ILesson {
  title: string;
  content?: string;
  type?: LessonType;
  videoUrl?: string;
  description?: string;
  order: number;
  isPreview?: boolean;
  courseId: string;
}

export type IUpdateLesson = Partial<ILesson>;
