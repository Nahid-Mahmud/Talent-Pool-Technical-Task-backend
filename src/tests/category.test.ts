import request from 'supertest';

import { PrismaClient } from '@prisma/client';
import { app } from '../app';

const prisma = new PrismaClient();

describe('Category API', () => {
  let categoryId: string;

  afterAll(async () => {
    await prisma.category.deleteMany();
    await prisma.$disconnect();
  });

  it('should create a category', async () => {
    const res = await request(app)
      .post('/api/v1/categories')
      .send({ name: 'Test Category' });
    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('Test Category');
    categoryId = res.body.data.id;
  });

  it('should get all categories', async () => {
    const res = await request(app).get('/api/v1/categories');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('should get a category by id', async () => {
    const res = await request(app).get(`/api/v1/categories/${categoryId}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(categoryId);
  });

  it('should update a category', async () => {
    const res = await request(app)
      .patch(`/api/v1/categories/${categoryId}`)
      .send({ name: 'Updated Category' });
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Updated Category');
  });

  it('should delete a category', async () => {
    const res = await request(app).delete(`/api/v1/categories/${categoryId}`);
    expect(res.status).toBe(200);
  });
});
