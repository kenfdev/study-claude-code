import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createTestApp } from '../../../test-server';

const app = createTestApp();

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });
  });

  it('should login successfully with correct credentials', async () => {
    const loginData = {
      email: 'test@example.com',
      password: 'password123'
    };

    const response = await request(app)
      .post('/api/auth/login')
      .send(loginData)
      .expect(200);

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

  it('should reject login with non-existent email', async () => {
    const loginData = {
      email: 'nonexistent@example.com',
      password: 'password123'
    };

    const response = await request(app)
      .post('/api/auth/login')
      .send(loginData)
      .expect(401);

    expect(response.body).toEqual({
      success: false,
      message: 'Invalid email or password'
    });
  });

  it('should reject login with wrong password', async () => {
    const loginData = {
      email: 'test@example.com',
      password: 'wrongpassword'
    };

    const response = await request(app)
      .post('/api/auth/login')
      .send(loginData)
      .expect(401);

    expect(response.body).toEqual({
      success: false,
      message: 'Invalid email or password'
    });
  });

  it('should reject login with missing fields', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({})
      .expect(400);

    expect(response.body).toEqual({
      success: false,
      message: 'Email and password are required'
    });
  });

  it('should reject login with invalid email format', async () => {
    const loginData = {
      email: 'invalid-email',
      password: 'password123'
    };

    const response = await request(app)
      .post('/api/auth/login')
      .send(loginData)
      .expect(400);

    expect(response.body).toEqual({
      success: false,
      message: 'Invalid email format'
    });
  });
});