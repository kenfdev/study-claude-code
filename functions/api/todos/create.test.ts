import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createTestApp } from '../../../test-server';
import { generateToken } from '../../lib/auth';
import { createUser } from '../../lib/database';
import { hashPassword } from '../../lib/auth';

const app = createTestApp();

describe('POST /api/todos', () => {
  let validToken: string;
  let userId: number;

  beforeEach(async () => {
    const hashedPassword = await hashPassword('password123');
    const user = await createUser('todo-test@example.com', hashedPassword);
    userId = user.id;
    
    validToken = generateToken({
      userId: user.id,
      email: user.email
    });
  });

  it('should create a new todo successfully', async () => {
    const todoData = {
      title: 'Test todo item'
    };

    const response = await request(app)
      .post('/api/todos')
      .set('Authorization', `Bearer ${validToken}`)
      .send(todoData)
      .expect(201);

    expect(response.body).toMatchObject({
      success: true,
      todo: {
        id: expect.any(Number),
        title: 'Test todo item',
        completed: false,
        created_at: expect.any(String)
      }
    });
  });

  it('should reject todo creation without authentication', async () => {
    const todoData = {
      title: 'Test todo item'
    };

    const response = await request(app)
      .post('/api/todos')
      .send(todoData)
      .expect(401);

    expect(response.body).toEqual({
      success: false,
      message: 'Access token required'
    });
  });

  it('should reject todo creation with invalid token', async () => {
    const todoData = {
      title: 'Test todo item'
    };

    const response = await request(app)
      .post('/api/todos')
      .set('Authorization', 'Bearer invalid-token')
      .send(todoData)
      .expect(401);

    expect(response.body).toEqual({
      success: false,
      message: 'Invalid token'
    });
  });

  it('should reject todo creation with empty title', async () => {
    const todoData = {
      title: ''
    };

    const response = await request(app)
      .post('/api/todos')
      .set('Authorization', `Bearer ${validToken}`)
      .send(todoData)
      .expect(400);

    expect(response.body).toEqual({
      success: false,
      message: 'Title cannot be empty'
    });
  });

  it('should reject todo creation with whitespace-only title', async () => {
    const todoData = {
      title: '   '
    };

    const response = await request(app)
      .post('/api/todos')
      .set('Authorization', `Bearer ${validToken}`)
      .send(todoData)
      .expect(400);

    expect(response.body).toEqual({
      success: false,
      message: 'Title cannot be empty'
    });
  });

  it('should reject todo creation without title', async () => {
    const todoData = {};

    const response = await request(app)
      .post('/api/todos')
      .set('Authorization', `Bearer ${validToken}`)
      .send(todoData)
      .expect(400);

    expect(response.body).toEqual({
      success: false,
      message: 'Title is required and must be a string'
    });
  });

  it('should reject todo creation with non-string title', async () => {
    const todoData = {
      title: 123
    };

    const response = await request(app)
      .post('/api/todos')
      .set('Authorization', `Bearer ${validToken}`)
      .send(todoData)
      .expect(400);

    expect(response.body).toEqual({
      success: false,
      message: 'Title is required and must be a string'
    });
  });

  it('should reject todo creation with title too long', async () => {
    const todoData = {
      title: 'a'.repeat(501)
    };

    const response = await request(app)
      .post('/api/todos')
      .set('Authorization', `Bearer ${validToken}`)
      .send(todoData)
      .expect(400);

    expect(response.body).toEqual({
      success: false,
      message: 'Title must be less than 500 characters'
    });
  });

  it('should trim whitespace from title', async () => {
    const todoData = {
      title: '  Test todo with spaces  '
    };

    const response = await request(app)
      .post('/api/todos')
      .set('Authorization', `Bearer ${validToken}`)
      .send(todoData)
      .expect(201);

    expect(response.body.todo.title).toBe('Test todo with spaces');
  });
});