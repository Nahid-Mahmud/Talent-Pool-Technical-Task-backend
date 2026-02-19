import { UserRole, UserStatus, Prisma } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';
import { prisma } from '../../config/prisma';
import AppError from '../../errors/AppError';
import { hashPassword } from '../../utils/hashPassword';

const userSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  status: true,
  createdAt: true,
  updatedAt: true,
};

const getMe = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
    select: userSelect,
  });
  if (!user) throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
  return user;
};

const getAllUsers = async (query: {
  cursor?: string;
  limit?: number;
  role?: UserRole;
  status?: UserStatus;
  search?: string;
}) => {
  const limit = query.limit ?? 10;

  const where: Prisma.UserWhereInput = {
    ...(query.role ? { role: query.role } : {}),
    ...(query.status ? { status: query.status } : {}),
    ...(query.search
      ? {
          OR: [
            { name: { contains: query.search, mode: 'insensitive' } },
            { email: { contains: query.search, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      take: limit + 1,
      ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
      orderBy: { createdAt: 'desc' },
      select: userSelect,
    }),
    prisma.user.count({ where }),
  ]);

  const hasMore = users.length > limit;
  const data = hasMore ? users.slice(0, limit) : users;
  const nextCursor = hasMore ? data[data.length - 1].id : null;

  return { data, meta: { total, hasMore, nextCursor } };
};

const getUserById = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: userSelect,
  });
  if (!user) throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
  return user;
};

const updateUserStatus = async (
  targetId: string,
  newStatus: UserStatus,
  requesterId: string,
  requesterRole: UserRole
) => {
  const target = await prisma.user.findUnique({ where: { id: targetId } });
  if (!target) throw new AppError(StatusCodes.NOT_FOUND, 'User not found');

  // Admin cannot touch super_admin accounts
  if (requesterRole === 'admin' && target.role === 'super_admin') {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      'Admins cannot modify Super Admin accounts'
    );
  }

  // Prevent self-suspension
  if (targetId === requesterId) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'You cannot change your own status'
    );
  }

  return prisma.user.update({
    where: { id: targetId },
    data: { status: newStatus },
    select: userSelect,
  });
};

const deleteUser = async (targetId: string, requesterId: string) => {
  if (targetId === requesterId) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'You cannot delete yourself');
  }
  const user = await prisma.user.findUnique({ where: { id: targetId } });
  if (!user) throw new AppError(StatusCodes.NOT_FOUND, 'User not found');

  return prisma.user.delete({ where: { id: targetId } });
};

const updateAdmin = async (
  adminId: string,
  data: { name?: string; email?: string; status?: UserStatus }
) => {
  const admin = await prisma.user.findUnique({ where: { id: adminId } });
  if (!admin || admin.role !== 'admin') {
    throw new AppError(StatusCodes.NOT_FOUND, 'Admin not found');
  }

  return prisma.user.update({
    where: { id: adminId },
    data,
    select: userSelect,
  });
};

const updateUserRole = async (
  targetId: string,
  newRole: UserRole,
  requesterId: string,
  requesterRole: UserRole
) => {
  const target = await prisma.user.findUnique({ where: { id: targetId } });
  if (!target) throw new AppError(StatusCodes.NOT_FOUND, 'User not found');

  // Prevent self role-change
  if (targetId === requesterId) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'You cannot change your own role'
    );
  }

  // Admins cannot promote/change super_admin accounts
  if (requesterRole === 'admin' && target.role === 'super_admin') {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      'Admins cannot modify Super Admin accounts'
    );
  }

  // Prevent non-super-admins from assigning super_admin
  if (newRole === 'super_admin' && requesterRole !== 'super_admin') {
    throw new AppError(StatusCodes.FORBIDDEN, 'Insufficient permissions');
  }

  return prisma.user.update({
    where: { id: targetId },
    data: { role: newRole },
    select: userSelect,
  });
};

const updateUser = async (
  userId: string,
  data: { name?: string; email?: string; password?: string }
) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError(StatusCodes.NOT_FOUND, 'User not found');

  // Prevent email duplication
  if (data.email && data.email !== user.email) {
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existing)
      throw new AppError(StatusCodes.CONFLICT, 'Email already in use');
  }

  const updateData: Prisma.UserUpdateInput = { ...data };
  if (data.password) {
    updateData.password = await hashPassword(data.password);
  }

  return prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: userSelect,
  });
};

export const userService = {
  getMe,
  getAllUsers,
  getUserById,
  updateUserStatus,
  deleteUser,
  updateAdmin,
  updateUserRole,
  updateUser,
};
