import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { catchAsync } from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { lessonProgressService } from './lessonProgress.service';

const updateLessonProgress = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const { lessonId, isCompleted } = req.body;
  const result = await lessonProgressService.updateLessonProgress(
    userId,
    lessonId,
    isCompleted
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Lesson progress updated successfully',
    data: result,
  });
});

const getMyProgress = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const { courseId } = req.params;
  const result = await lessonProgressService.getMyProgress(
    userId,
    courseId as string
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Lesson progress fetched successfully',
    data: result,
  });
});

export const lessonProgressController = {
  updateLessonProgress,
  getMyProgress,
};
