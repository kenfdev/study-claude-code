import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createUser, createTodo, closeDatabase } from '../../lib/database';
import { generateToken } from '../../lib/auth';
import handler from './update';

describe('PUT /api/todos/:id', () => {
  let user: any;
  let todo: any;
  let token: string;

  beforeEach(async () => {
    user = await createUser('test@example.com', 'hashedpassword');
    todo = await createTodo(user.id, 'Test todo');
    token = generateToken({ userId: user.id, email: user.email });
  });

  afterEach(async () => {
    await closeDatabase();
  });

  it('should update todo title successfully', async () => {
    const request = new Request('http://localhost/api/todos/' + todo.id, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: 'Updated todo title'
      })
    });

    const response = await handler(request, {} as any, {} as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.title).toBe('Updated todo title');
    expect(data.id).toBe(todo.id);
    expect(data.user_id).toBe(user.id);
  });

  it('should update todo completed status successfully', async () => {
    const request = new Request('http://localhost/api/todos/' + todo.id, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        completed: true
      })
    });

    const response = await handler(request, {} as any, {} as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.completed).toBe(true);
    expect(data.id).toBe(todo.id);
    expect(data.user_id).toBe(user.id);
  });

  it('should update both title and completed status', async () => {
    const request = new Request('http://localhost/api/todos/' + todo.id, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: 'Completed todo',
        completed: true
      })
    });

    const response = await handler(request, {} as any, {} as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.title).toBe('Completed todo');
    expect(data.completed).toBe(true);
    expect(data.id).toBe(todo.id);
    expect(data.user_id).toBe(user.id);
  });

  it('should return 401 without authorization header', async () => {
    const request = new Request('http://localhost/api/todos/' + todo.id, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        completed: true
      })
    });

    const response = await handler(request, {} as any, {} as any);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should return 401 with invalid token', async () => {
    const request = new Request('http://localhost/api/todos/' + todo.id, {
      method: 'PUT',
      headers: {
        'Authorization': 'Bearer invalid-token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        completed: true
      })
    });

    const response = await handler(request, {} as any, {} as any);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Invalid token');
  });

  it('should return 400 with invalid todo ID', async () => {
    const request = new Request('http://localhost/api/todos/invalid', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        completed: true
      })
    });

    const response = await handler(request, {} as any, {} as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid todo ID');
  });

  it('should return 400 with empty title', async () => {
    const request = new Request('http://localhost/api/todos/' + todo.id, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: ''
      })
    });

    const response = await handler(request, {} as any, {} as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Title must be a non-empty string');
  });

  it('should return 400 with invalid completed type', async () => {
    const request = new Request('http://localhost/api/todos/' + todo.id, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        completed: 'true'
      })
    });

    const response = await handler(request, {} as any, {} as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Completed must be a boolean');
  });

  it('should return 400 with no valid fields to update', async () => {
    const request = new Request('http://localhost/api/todos/' + todo.id, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });

    const response = await handler(request, {} as any, {} as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('No valid fields to update');
  });

  it('should return 404 for non-existent todo', async () => {
    const request = new Request('http://localhost/api/todos/99999', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        completed: true
      })
    });

    const response = await handler(request, {} as any, {} as any);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Todo not found or access denied');
  });

  it('should return 404 when trying to update another user\'s todo', async () => {
    const otherUser = await createUser('other@example.com', 'hashedpassword');
    const otherUserToken = generateToken({ userId: otherUser.id, email: otherUser.email });

    const request = new Request('http://localhost/api/todos/' + todo.id, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${otherUserToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        completed: true
      })
    });

    const response = await handler(request, {} as any, {} as any);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Todo not found or access denied');
  });

  it('should return 405 for non-PUT methods', async () => {
    const request = new Request('http://localhost/api/todos/' + todo.id, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const response = await handler(request, {} as any, {} as any);

    expect(response.status).toBe(405);
  });
});