import request from 'supertest';
import { app } from '../app';
import { prisma } from '../config/prisma';
import { hashPassword } from '../utils/hashPassword';
import { UserRole, UserStatus } from '@prisma/client';

const buildUser = (
  overrides?: Partial<{
    email: string;
    name: string;
    role: UserRole;
    status: UserStatus;
  }>
) => {
  return {
    email: overrides?.email ?? 'user@example.com',
    name: overrides?.name ?? 'User',
    password: 'Password123!',
    role: overrides?.role ?? 'student',
    status: overrides?.status ?? 'active',
  };
};

describe('User Routes', () => {
  type PrismaUser = Awaited<ReturnType<typeof prisma.user.create>>;
  let superAdmin: PrismaUser;
  let admin: PrismaUser;
  let student: PrismaUser;
  let superAdminCookie: string;
  let adminCookie: string;
  let studentCookie: string;

  beforeAll(async () => {
    await prisma.user.deleteMany();
    // Create super admin
    const superAdminData = buildUser({
      email: 'superadmin@example.com',
      role: 'super_admin',
    });
    superAdmin = await prisma.user.create({
      data: {
        ...superAdminData,
        password: await hashPassword(superAdminData.password),
      },
    });
    // Create admin
    const adminData = buildUser({ email: 'admin@example.com', role: 'admin' });
    admin = await prisma.user.create({
      data: { ...adminData, password: await hashPassword(adminData.password) },
    });
    // Create student
    const studentData = buildUser({
      email: 'student@example.com',
      role: 'student',
    });
    student = await prisma.user.create({
      data: {
        ...studentData,
        password: await hashPassword(studentData.password),
      },
    });

    // Login to get cookies
    const login = async (email: string, password: string) => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email, password });
      const cookies = res.headers['set-cookie'];
      return cookies ? cookies[0] : '';
    };
    superAdminCookie = await login(superAdmin.email, superAdminData.password);
    adminCookie = await login(admin.email, adminData.password);
    studentCookie = await login(student.email, studentData.password);
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  describe('GET /api/v1/users/me', () => {
    it('should get own profile', async () => {
      const res = await request(app)
        .get('/api/v1/users/me')
        .set('Cookie', studentCookie)
        .expect(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe(student.email);
    });
  });

  describe('GET /api/v1/users', () => {
    it('should list users for admin', async () => {
      const res = await request(app)
        .get('/api/v1/users')
        .set('Cookie', adminCookie)
        .expect(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should forbid students from listing users', async () => {
      await request(app)
        .get('/api/v1/users')
        .set('Cookie', studentCookie)
        .expect(403);
    });
  });

  describe('GET /api/v1/users/:id', () => {
    it('should get user by id for admin', async () => {
      const res = await request(app)
        .get(`/api/v1/users/${student.id}`)
        .set('Cookie', adminCookie)
        .expect(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe(student.email);
    });
    it('should return 404 for non-existent user', async () => {
      await request(app)
        .get('/api/v1/users/00000000-0000-0000-0000-000000000000')
        .set('Cookie', adminCookie)
        .expect(404);
    });
  });

  describe('PATCH /api/v1/users/:id/status', () => {
    it('should update user status as super admin', async () => {
      const res = await request(app)
        .patch(`/api/v1/users/${student.id}/status`)
        .set('Cookie', superAdminCookie)
        .send({ status: 'inactive' })
        .expect(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('inactive');
    });
    it('should forbid admin from updating super admin', async () => {
      await request(app)
        .patch(`/api/v1/users/${superAdmin.id}/status`)
        .set('Cookie', adminCookie)
        .send({ status: 'inactive' })
        .expect(403);
    });
    it('should prevent self-suspension', async () => {
      await request(app)
        .patch(`/api/v1/users/${admin.id}/status`)
        .set('Cookie', adminCookie)
        .send({ status: 'inactive' })
        .expect(400);
    });
  });

  describe('DELETE /api/v1/users/:id', () => {
    it('should delete a user as super admin', async () => {
      const tempUser = await prisma.user.create({
        data: buildUser({ email: 'todelete@example.com' }),
      });
      await request(app)
        .delete(`/api/v1/users/${tempUser.id}`)
        .set('Cookie', superAdminCookie)
        .expect(200);
    });
    it('should prevent self-deletion', async () => {
      await request(app)
        .delete(`/api/v1/users/${superAdmin.id}`)
        .set('Cookie', superAdminCookie)
        .expect(400);
    });
  });

  // Creating users is handled via `POST /api/v1/auth/register` now — user-creation
  // through the `/users` resource was removed. Covered by `auth` tests.

  describe('PATCH /api/v1/users/admin/:id', () => {
    it('should update admin as super admin', async () => {
      const res = await request(app)
        .patch(`/api/v1/users/admin/${admin.id}`)
        .set('Cookie', superAdminCookie)
        .send({ name: 'Updated Admin' })
        .expect(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Updated Admin');
    });
    it('should return 404 for non-admin', async () => {
      await request(app)
        .patch(`/api/v1/users/admin/${student.id}`)
        .set('Cookie', superAdminCookie)
        .send({ name: 'Should Fail' })
        .expect(404);
    });
  });

  describe('PATCH /api/v1/users/:id/role', () => {
    it('should let super admin change a student to admin', async () => {
      const res = await request(app)
        .patch(`/api/v1/users/${student.id}/role`)
        .set('Cookie', superAdminCookie)
        .send({ role: 'admin' })
        .expect(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.role).toBe('admin');
    });

    it('should let admin change a student to admin', async () => {
      const tempUser = await prisma.user.create({
        data: buildUser({
          email: 'stu-admin-change@example.com',
          role: 'student',
        }),
      });

      const res = await request(app)
        .patch(`/api/v1/users/${tempUser.id}/role`)
        .set('Cookie', adminCookie)
        .send({ role: 'admin' })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.role).toBe('admin');
    });

    it('should prevent self role-change', async () => {
      await request(app)
        .patch(`/api/v1/users/${superAdmin.id}/role`)
        .set('Cookie', superAdminCookie)
        .send({ role: 'admin' })
        .expect(400);
    });
  });

  describe('PATCH /api/v1/users/self/:id', () => {
    it('should update own profile', async () => {
      const res = await request(app)
        .patch(`/api/v1/users/self/${student.id}`)
        .set('Cookie', studentCookie)
        .send({ name: 'Updated Student' })
        .expect(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Updated Student');
    });
    it('should not allow duplicate email', async () => {
      await request(app)
        .patch(`/api/v1/users/self/${student.id}`)
        .set('Cookie', studentCookie)
        .send({ email: admin.email })
        .expect(409);
    });
  });
});
