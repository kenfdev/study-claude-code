import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createTestApp } from '../../test-server';
import { generateToken } from './auth';
import { createUser } from './database';
import { hashPassword } from './auth';

const app = createTestApp();

describe('Auth Middleware', () => {
  let validToken: string;
  let userId: number;

  beforeEach(async () => {
    const hashedPassword = await hashPassword('password123');
    const user = await createUser('test@example.com', hashedPassword);
    userId = user.id;
    
    validToken = generateToken({
      userId: user.id,
      email: user.email
    });
  });

  it('should allow access with valid token', async () => {
    const response = await request(app)
      .get('/protected')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(200);

    expect(response.body).toMatchObject({
      message: 'Protected route accessed',
      user: {
        id: userId,
        email: 'test@example.com'
      }
    });
  });

  it('should reject access without token', async () => {
    const response = await request(app)
      .get('/protected')
      .expect(401);

    expect(response.body).toEqual({
      success: false,
      message: 'Access token required'
    });
  });

  it('should reject access with invalid token', async () => {
    const response = await request(app)
      .get('/protected')
      .set('Authorization', 'Bearer invalid-token')
      .expect(401);

    expect(response.body).toEqual({
      success: false,
      message: 'Invalid token'
    });
  });

  it('should reject access with malformed authorization header', async () => {
    const response = await request(app)
      .get('/protected')
      .set('Authorization', 'InvalidFormat')
      .expect(401);

    expect(response.body).toEqual({
      success: false,
      message: 'Access token required'
    });
  });

  it('should reject access when user no longer exists', async () => {
    const nonExistentUserToken = generateToken({
      userId: 99999,
      email: 'nonexistent@example.com'
    });

    const response = await request(app)
      .get('/protected')
      .set('Authorization', `Bearer ${nonExistentUserToken}`)
      .expect(401);

    expect(response.body).toEqual({
      success: false,
      message: 'User not found'
    });
  });
});