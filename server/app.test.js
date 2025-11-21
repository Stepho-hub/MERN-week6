import request from 'supertest';
import { createApp } from './app.js';

describe('API Endpoints', () => {
  let app;

  beforeEach(async () => {
    app = await createApp();
  });

  describe('GET /api/users', () => {
    test('returns empty array initially', async () => {
      const response = await request(app).get('/api/users');
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    test('returns users after creation', async () => {
      // Create a user first
      const newUser = { name: 'John Doe', email: 'john@example.com' };
      await request(app).post('/api/users').send(newUser);

      // Then get all users
      const response = await request(app).get('/api/users');
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toMatchObject(newUser);
      expect(response.body[0]).toHaveProperty('_id');
    });
  });

  describe('POST /api/users', () => {
    test('creates a new user with valid data', async () => {
      const newUser = { name: 'John Doe', email: 'john@example.com' };
      const response = await request(app).post('/api/users').send(newUser);
      expect(response.status).toBe(201);
      expect(response.body).toMatchObject(newUser);
      expect(response.body).toHaveProperty('_id');
      expect(typeof response.body._id).toBe('string');
    });

    test('sanitizes input data', async () => {
      const dirtyUser = { name: '  <John>  ', email: '  john@example.com  ' };
      const response = await request(app).post('/api/users').send(dirtyUser);
      expect(response.status).toBe(201);
      expect(response.body.name).toBe('John');
      expect(response.body.email).toBe('john@example.com');
    });

    test('returns 400 for invalid name', async () => {
      const invalidUser = { name: '', email: 'john@example.com' };
      const response = await request(app).post('/api/users').send(invalidUser);
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid name');
    });

    test('returns 400 for invalid email', async () => {
      const invalidUser = { name: 'John Doe', email: 'invalid-email' };
      const response = await request(app).post('/api/users').send(invalidUser);
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid email');
    });

    test('returns 409 for duplicate email', async () => {
      const user = { name: 'John Doe', email: 'john@example.com' };

      // Create first user
      await request(app).post('/api/users').send(user);

      // Try to create duplicate
      const response = await request(app).post('/api/users').send(user);
      expect(response.status).toBe(409);
      expect(response.body.error).toBe('Email already exists');
    });

    test('returns 400 for missing name', async () => {
      const invalidUser = { email: 'john@example.com' };
      const response = await request(app).post('/api/users').send(invalidUser);
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid name');
    });

    test('returns 400 for missing email', async () => {
      const invalidUser = { name: 'John Doe' };
      const response = await request(app).post('/api/users').send(invalidUser);
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid email');
    });
  });
});