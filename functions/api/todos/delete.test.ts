import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createTestApp } from '../../../test-server';
import { generateToken, hashPassword } from '../../lib/auth';
import { createUser, createTodo } from '../../lib/database';

const app = createTestApp();

describe('DELETE /api/todos/:id', () => {
  let validToken: string;
  let userId: number;

  beforeEach(async () => {
    const hashedPassword = await hashPassword('password123');
    const user = await createUser('test@example.com', hashedPassword);
    userId = user.id;
    validToken = generateToken({ userId: user.id, email: user.email });
  });

  it('should delete a todo successfully', async () => {
    // Todoを作成
    const todo = await createTodo(userId, 'Test Todo');

    const response = await request(app)
      .delete(`/api/todos/${todo.id}`)
      .set('Authorization', `Bearer ${validToken}`)
      .expect(200);

    expect(response.body).toEqual({
      success: true,
      message: 'Todo deleted successfully'
    });
  });

  it('should return 401 if user is not authenticated', async () => {
    const response = await request(app)
      .delete('/api/todos/1')
      .expect(401);

    expect(response.body).toEqual({
      success: false,
      message: 'Access token required'
    });
  });

  it('should return 400 if todo ID is invalid', async () => {
    const response = await request(app)
      .delete('/api/todos/invalid')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(400);

    expect(response.body).toEqual({
      success: false,
      message: 'Invalid todo ID'
    });
  });

  it('should return 404 if todo does not exist', async () => {
    const response = await request(app)
      .delete('/api/todos/999')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(404);

    expect(response.body).toEqual({
      success: false,
      message: 'Todo not found or access denied'
    });
  });

  it('should return 404 if trying to delete another user\'s todo', async () => {
    // 別のユーザーを作成
    const hashedPassword = await hashPassword('password123');
    const otherUser = await createUser('other@example.com', hashedPassword);
    const otherTodo = await createTodo(otherUser.id, 'Other User Todo');

    const response = await request(app)
      .delete(`/api/todos/${otherTodo.id}`)
      .set('Authorization', `Bearer ${validToken}`)
      .expect(404);

    expect(response.body).toEqual({
      success: false,
      message: 'Todo not found or access denied'
    });
  });
});