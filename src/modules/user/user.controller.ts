import { UserRole, UserStatus } from '@prisma/client';
import { catchAsync } from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { userService } from './user.service';

const getMe = catchAsync(async (req, res) => {
  const result = await userService.getMe(req.user.email as string);
  sendResponse(res, {
    success: true,
    message: 'Profile retrieved',
    data: result,
    statusCode: 200,
  });
});

const getAllUsers = catchAsync(async (req, res) => {
  const { cursor, limit, role, status, search } = req.query;
  const result = await userService.getAllUsers({
    cursor: cursor as string,
    limit: limit ? parseInt(limit as string) : undefined,
    role: role as UserRole,
    status: status as UserStatus,
    search: search as string,
  });
  sendResponse(res, {
    success: true,
    message: 'Users retrieved',
    data: result.data,
    statusCode: 200,
    meta: { total: result.meta.total },
  });
});

const getUserById = catchAsync(async (req, res) => {
  const result = await userService.getUserById(req.params.id as string);
  sendResponse(res, {
    success: true,
    message: 'User retrieved',
    data: result,
    statusCode: 200,
  });
});

const updateUserStatus = catchAsync(async (req, res) => {
  const requesterId = req.user.id as string;
  const requesterRole = req.user.role as UserRole;
  const id = String(req.params.id);
  const result = await userService.updateUserStatus(
    id,
    req.body.status,
    requesterId,
    requesterRole
  );
  sendResponse(res, {
    success: true,
    message: 'User status updated',
    data: result,
    statusCode: 200,
  });
});

const deleteUser = catchAsync(async (req, res) => {
  const requesterId = req.user.id as string;
  const id = String(req.params.id);
  await userService.deleteUser(id, requesterId);
  sendResponse(res, {
    success: true,
    message: 'User deleted',
    data: null,
    statusCode: 200,
  });
});

const createAdmin = catchAsync(async (req, res) => {
  const { email, password, name } = req.body;
  const result = await userService.createAdmin(email, password, name);
  sendResponse(res, {
    success: true,
    message: 'Admin created',
    data: result,
    statusCode: 201,
  });
});

const updateAdmin = catchAsync(async (req, res) => {
  const id = String(req.params.id);
  const result = await userService.updateAdmin(id, req.body);
  sendResponse(res, {
    success: true,
    message: 'Admin updated',
    data: result,
    statusCode: 200,
  });
});

const updateUser = catchAsync(async (req, res) => {
  const userId = req.user.id as string;
  const result = await userService.updateUser(userId, req.body);
  sendResponse(res, {
    success: true,
    message: 'Profile updated',
    data: result,
    statusCode: 200,
  });
});

export const userController = {
  getMe,
  getAllUsers,
  getUserById,
  updateUserStatus,
  deleteUser,
  createAdmin,
  updateAdmin,
  updateUser,
};
