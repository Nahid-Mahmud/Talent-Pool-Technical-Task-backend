import { CourseStatus } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';
import {
  deleteFileFormCloudinary,
  uploadFileToCloudinary,
} from '../../config/cloudinary.config';

import { prisma } from '../../config/prisma';
import AppError from '../../errors/AppError';

import { generateSlug } from '../../utils';
import { CreateCoursePayload, UpdateCoursePayload } from './course.interface';

const createCourse = async (
  instructorId: string,
  payload: CreateCoursePayload,
  file?: Express.Multer.File
) => {
  const { title, description, price, isFree, status, categoryId } = payload;

  // Validate category
  if (categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!category) {
      throw new AppError(StatusCodes.NOT_FOUND, 'Category not found');
    }
  }

  // Upload thumbnail to Cloudinary
  let thumbnail: string | undefined;
  if (file) {
    const uploadResult = await uploadFileToCloudinary(
      file,
      'course-thumbnails'
    );
    thumbnail = uploadResult.secure_url;
  }

  // Generate unique slug
  const slug = generateSlug(title);

  // Build Prisma payload
  const courseData = {
    title,
    slug,
    description,
    thumbnail,
    status: status ?? CourseStatus.draft,
    price: price ?? 0,
    isFree: isFree ?? (price === 0 || price === undefined),
    instructor: { connect: { id: instructorId } },
    ...(categoryId && { category: { connect: { id: categoryId } } }),
  };

  const course = await prisma.course.create({ data: courseData });
  return course;
};

const updateCourse = async (
  courseId: string,
  payload: UpdateCoursePayload,
  file?: Express.Multer.File
) => {
  const { title, categoryId, ...otherData } = payload;

  // Check if course exists
  const existingCourse = await prisma.course.findUnique({
    where: { id: courseId },
  });

  if (!existingCourse) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Course not found');
  }

  // Validate category
  if (categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!category) {
      throw new AppError(StatusCodes.NOT_FOUND, 'Category not found');
    }
  }

  // Update thumbnail
  let thumbnail: string | undefined;
  if (file) {
    // Delete existing thumbnail if it exists
    if (existingCourse.thumbnail) {
      await deleteFileFormCloudinary(existingCourse.thumbnail);
    }
    // Upload new thumbnail
    const uploadResult = await uploadFileToCloudinary(
      file,
      'course-thumbnails'
    );
    thumbnail = uploadResult.secure_url;
  }

  // Handle title/slug change
  let slug: string | undefined;
  if (title) {
    slug = generateSlug(title);
  }

  // Build update data
  const updateData = {
    ...otherData,
    title,
    slug,
    thumbnail,
    ...(categoryId && { category: { connect: { id: categoryId } } }),
  };

  const course = await prisma.course.update({
    where: { id: courseId },
    data: updateData,
  });

  return course;
};

export const courseService = {
  createCourse,
  updateCourse,
};
