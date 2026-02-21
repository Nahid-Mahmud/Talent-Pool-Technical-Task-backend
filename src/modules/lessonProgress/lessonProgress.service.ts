import { StatusCodes } from 'http-status-codes';
import { prisma } from '../../config/prisma';
import AppError from '../../errors/AppError';

const updateLessonProgress = async (
  userId: string,
  lessonId: string,
  isCompleted: boolean
) => {
  // 1. Find the lesson and its course
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { courseId: true },
  });

  if (!lesson) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Lesson not found');
  }

  // 2. Find the enrollment for this user and course
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      studentId_courseId: {
        studentId: userId,
        courseId: lesson.courseId,
      },
    },
  });

  if (!enrollment) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      'You are not enrolled in this course'
    );
  }

  // 3. Upsert progress
  const progress = await prisma.lessonProgress.upsert({
    where: {
      enrollmentId_lessonId: {
        enrollmentId: enrollment.id,
        lessonId,
      },
    },
    update: {
      isCompleted,
      completedAt: isCompleted ? new Date() : null,
    },
    create: {
      enrollmentId: enrollment.id,
      lessonId,
      isCompleted,
      completedAt: isCompleted ? new Date() : null,
    },
  });

  return progress;
};

const getMyProgress = async (userId: string, courseId: string) => {
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      studentId_courseId: {
        studentId: userId,
        courseId,
      },
    },
    include: {
      progress: {
        include: {
          lesson: {
            select: {
              id: true,
              title: true,
              order: true,
            },
          },
        },
      },
    },
  });

  if (!enrollment) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      'You are not enrolled in this course'
    );
  }

  return enrollment.progress;
};

export const lessonProgressService = {
  updateLessonProgress,
  getMyProgress,
};
