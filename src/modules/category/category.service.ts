import { PrismaClient, Category, Prisma } from '@prisma/client';

import AppError from '../../errors/AppError';

const prisma = new PrismaClient();

const createCategory = async (payload: Prisma.CategoryCreateInput) => {
  // check if category with same name exists
  const existingCategory = await prisma.category.findUnique({
    where: { name: payload.name },
  });

  if (existingCategory) {
    throw new AppError(400, 'Category with this name already exists');
  }

  const res = await prisma.category.create({ data: payload });
  return res;
};

const getAllCategories = async () => {
  const res = await prisma.category.findMany();
  return res;
};

const getCategoryById = async (id: string) => {
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) throw new AppError(404, 'Category not found');
  return category;
};

const updateCategory = async (id: string, payload: Partial<Category>) => {
  const category = await prisma.category.update({
    where: { id },
    data: payload,
  });
  return category;
};

const deleteCategory = async (id: string) => {
  await prisma.category.delete({ where: { id } });
};

export const categoryService = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
