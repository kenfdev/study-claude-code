import { updateTodo } from '../../lib/database';
import { verifyToken } from '../../lib/auth';

export interface Env {
  // Add environment types if needed
}

export default async function handler(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  if (request.method !== 'PUT') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    // Extract todoId from URL
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const todoIdIndex = pathSegments.findIndex(segment => segment === 'todos') + 1;
    const todoId = parseInt(pathSegments[todoIdIndex], 10);

    if (!todoId || isNaN(todoId)) {
      return new Response(JSON.stringify({ error: 'Invalid todo ID' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verify authentication
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const token = authHeader.slice(7);
    const payload = verifyToken(token);

    if (!payload) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Parse request body
    const body = await request.json();
    const { title, completed } = body;

    // Validate input
    const updates: { title?: string; completed?: boolean } = {};
    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim() === '') {
        return new Response(JSON.stringify({ error: 'Title must be a non-empty string' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      updates.title = title.trim();
    }

    if (completed !== undefined) {
      if (typeof completed !== 'boolean') {
        return new Response(JSON.stringify({ error: 'Completed must be a boolean' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      updates.completed = completed;
    }

    if (Object.keys(updates).length === 0) {
      return new Response(JSON.stringify({ error: 'No valid fields to update' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Update todo
    const updatedTodo = await updateTodo(todoId, payload.userId, updates);

    if (!updatedTodo) {
      return new Response(JSON.stringify({ error: 'Todo not found or access denied' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify(updatedTodo), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error updating todo:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}