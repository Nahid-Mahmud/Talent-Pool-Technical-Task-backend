import { catchAsync } from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { courseService } from './course.service';

const createCourse = catchAsync(async (req, res) => {
  const instructorId = req.user.id;

  const course = await courseService.createCourse(
    instructorId,
    req.body,
    req.file
  );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Course created successfully',
    data: course,
  });
});

const updateCourse = catchAsync(async (req, res) => {
  const { id } = req.params;
  const course = await courseService.updateCourse(
    id as string,
    req.body,
    req.file
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Course updated successfully',
    data: course,
  });
});

export const courseController = {
  createCourse,
  updateCourse,
};
