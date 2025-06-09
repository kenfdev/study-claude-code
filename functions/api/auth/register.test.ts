import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createTestApp } from '../../../test-server';

const app = createTestApp();

describe('POST /api/auth/register', () => {

  it('should register a new user successfully', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123'
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(201);

    expect(response.body).toMatchObject({
      success: true,
      user: {
        id: expect.any(Number),
        email: 'test@example.com'
      },
      token: expect.any(String)
    });
    
    expect(response.body.user.password_hash).toBeUndefined();
  });

  it('should reject registration with invalid email', async () => {
    const userData = {
      email: 'invalid-email',
      password: 'password123'
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(400);

    expect(response.body).toEqual({
      success: false,
      message: 'Invalid email format'
    });
  });

  it('should reject registration with short password', async () => {
    const userData = {
      email: 'test@example.com',
      password: '123'
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(400);

    expect(response.body).toEqual({
      success: false,
      message: 'Password must be at least 6 characters long'
    });
  });

  it('should reject registration with duplicate email', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123'
    };

    await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(201);

    const response = await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(400);

    expect(response.body).toEqual({
      success: false,
      message: 'Email already exists'
    });
  });

  it('should reject registration with missing fields', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({})
      .expect(400);

    expect(response.body).toEqual({
      success: false,
      message: 'Email and password are required'
    });
  });
});