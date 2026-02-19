/* eslint-disable no-console */
import { Prisma, UserRole } from '@prisma/client';
import envVariables from '../config/env';
import { prisma } from '../config/prisma';

import { hashPassword } from './hashPassword';

export const seedSuperAdmin = async () => {
  try {
    // console.log("object");

    // check if super admin already exists
    const existingSuperAdmin = await prisma.user.findUnique({
      where: {
        email: envVariables.SUPER_ADMIN_EMAIL,
      },
    });

    if (existingSuperAdmin) {
      console.log('Super admin already exists.');
      return;
    }

    const password = await hashPassword(envVariables.SUPER_ADMIN_PASSWORD);

    const payload: Prisma.UserCreateInput = {
      name: envVariables.SUPER_ADMIN_NAME,
      email: envVariables.SUPER_ADMIN_EMAIL,
      role: UserRole.super_admin,
      password,
    };

    await prisma.user.create({ data: payload });
    console.log('Super admin seeded successfully.');
  } catch (error) {
    console.error('Error seeding super admin:', error);
  }
};
