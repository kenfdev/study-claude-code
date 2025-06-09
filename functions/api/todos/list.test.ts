import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createTestApp } from '../../../test-server';
import { generateToken } from '../../lib/auth';
import { createUser, createTodo } from '../../lib/database';
import { hashPassword } from '../../lib/auth';

const app = createTestApp();

describe('GET /api/todos', () => {
  let validToken: string;
  let userId: number;

  beforeEach(async () => {
    const hashedPassword = await hashPassword('password123');
    const user = await createUser('todo-list-test@example.com', hashedPassword);
    userId = user.id;
    
    validToken = generateToken({
      userId: user.id,
      email: user.email
    });
  });

  it('should return empty list when no todos exist', async () => {
    const response = await request(app)
      .get('/api/todos')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(200);

    expect(response.body).toEqual({
      success: true,
      todos: []
    });
  });

  it('should return todos for authenticated user', async () => {
    // Create some todos
    await createTodo(userId, 'First todo');
    await createTodo(userId, 'Second todo');

    const response = await request(app)
      .get('/api/todos')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.todos).toHaveLength(2);
    expect(response.body.todos[0]).toMatchObject({
      id: expect.any(Number),
      title: 'Second todo', // Most recent first
      completed: false,
      created_at: expect.any(String)
    });
    expect(response.body.todos[1]).toMatchObject({
      id: expect.any(Number),
      title: 'First todo',
      completed: false,
      created_at: expect.any(String)
    });
  });

  it('should only return todos for the authenticated user', async () => {
    // Create another user
    const hashedPassword = await hashPassword('password123');
    const otherUser = await createUser('other-user@example.com', hashedPassword);
    
    // Create todos for both users
    await createTodo(userId, 'My todo');
    await createTodo(otherUser.id, 'Other user todo');

    const response = await request(app)
      .get('/api/todos')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.todos).toHaveLength(1);
    expect(response.body.todos[0].title).toBe('My todo');
  });

  it('should reject request without authentication', async () => {
    const response = await request(app)
      .get('/api/todos')
      .expect(401);

    expect(response.body).toEqual({
      success: false,
      message: 'Access token required'
    });
  });

  it('should reject request with invalid token', async () => {
    const response = await request(app)
      .get('/api/todos')
      .set('Authorization', 'Bearer invalid-token')
      .expect(401);

    expect(response.body).toEqual({
      success: false,
      message: 'Invalid token'
    });
  });
});