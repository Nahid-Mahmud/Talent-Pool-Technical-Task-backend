import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { catchAsync } from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { lessonService } from './lesson.service';

const createLesson = catchAsync(async (req: Request, res: Response) => {
  const videoFile = req.file;
  const result = await lessonService.createLesson(req.body, videoFile);

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Lesson created successfully',
    data: result,
  });
});

const getAllLessons = catchAsync(async (req: Request, res: Response) => {
  const { courseId } = req.query;
  const result = await lessonService.getAllLessons(courseId as string);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Lessons fetched successfully',
    data: result,
  });
});

const getSingleLesson = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await lessonService.getSingleLesson(id as string);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Lesson fetched successfully',
    data: result,
  });
});

const updateLesson = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const videoFile = req.file;
  const result = await lessonService.updateLesson(
    id as string,
    req.body,
    videoFile
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Lesson updated successfully',
    data: result,
  });
});

const deleteLesson = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  await lessonService.deleteLesson(id as string);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Lesson deleted successfully',
    data: null,
  });
});

export const lessonController = {
  createLesson,
  getAllLessons,
  getSingleLesson,
  updateLesson,
  deleteLesson,
};
