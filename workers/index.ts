import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { jwt } from 'hono/jwt';

export interface Env {
  DB: D1Database;
  JWT_SECRET: string;
}

const app = new Hono<{ Bindings: Env }>();

// Enable CORS
app.use('/*', cors());

// JWT middleware for protected routes
const authMiddleware = (secret: string) => jwt({ secret });

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth routes
app.post('/api/auth/register', async (c) => {
  try {
    const { email, password } = await c.req.json();
    
    if (!email || !password) {
      return c.json({ success: false, error: 'Email and password are required' }, 400);
    }

    // Check if user exists
    const existingUser = await c.env.DB.prepare(
      'SELECT id FROM users WHERE email = ?'
    ).bind(email).first();

    if (existingUser) {
      return c.json({ success: false, error: 'User already exists' }, 409);
    }

    // Hash password using Web Crypto API
    const passwordHash = await hashPassword(password);

    // Create user
    const result = await c.env.DB.prepare(
      'INSERT INTO users (email, password_hash, created_at) VALUES (?, ?, ?) RETURNING id'
    ).bind(email, passwordHash, new Date().toISOString()).first();

    if (!result) {
      throw new Error('Failed to create user');
    }

    // Generate JWT
    const token = await new SignJWT({ userId: result.id, email })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(new TextEncoder().encode(c.env.JWT_SECRET));

    return c.json({
      success: true,
      token,
      user: { id: result.id, email }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return c.json({ success: false, error: 'Internal server error' }, 500);
  }
});

app.post('/api/auth/login', async (c) => {
  try {
    const { email, password } = await c.req.json();

    if (!email || !password) {
      return c.json({ success: false, error: 'Email and password are required' }, 400);
    }

    // Find user
    const user = await c.env.DB.prepare(
      'SELECT id, email, password_hash FROM users WHERE email = ?'
    ).bind(email).first();

    if (!user) {
      return c.json({ success: false, error: 'Invalid credentials' }, 401);
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password_hash as string);
    if (!isValid) {
      return c.json({ success: false, error: 'Invalid credentials' }, 401);
    }

    // Generate JWT
    const token = await new SignJWT({ userId: user.id, email: user.email })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(new TextEncoder().encode(c.env.JWT_SECRET));

    return c.json({
      success: true,
      token,
      user: { id: user.id, email: user.email }
    });
  } catch (error) {
    console.error('Login error:', error);
    return c.json({ success: false, error: 'Internal server error' }, 500);
  }
});

// Protected routes
app.use('/api/todos/*', authMiddleware((c) => c.env.JWT_SECRET));
app.use('/api/auth/me', authMiddleware((c) => c.env.JWT_SECRET));

app.get('/api/auth/me', async (c) => {
  const payload = c.get('jwtPayload');
  return c.json({
    success: true,
    user: { id: payload.userId, email: payload.email }
  });
});

// Todo routes
app.post('/api/todos', async (c) => {
  try {
    const payload = c.get('jwtPayload');
    const { title } = await c.req.json();

    if (!title || title.trim() === '') {
      return c.json({ success: false, error: 'Title is required' }, 400);
    }

    const result = await c.env.DB.prepare(
      'INSERT INTO todos (user_id, title, completed, created_at) VALUES (?, ?, ?, ?) RETURNING *'
    ).bind(payload.userId, title.trim(), 0, new Date().toISOString()).first();

    if (!result) {
      throw new Error('Failed to create todo');
    }

    return c.json({
      success: true,
      todo: {
        id: result.id,
        title: result.title,
        completed: result.completed === 1,
        created_at: result.created_at
      }
    });
  } catch (error) {
    console.error('Create todo error:', error);
    return c.json({ success: false, error: 'Internal server error' }, 500);
  }
});

app.get('/api/todos', async (c) => {
  try {
    const payload = c.get('jwtPayload');
    
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM todos WHERE user_id = ? ORDER BY created_at DESC'
    ).bind(payload.userId).all();

    const todos = results.map(todo => ({
      id: todo.id,
      title: todo.title,
      completed: todo.completed === 1,
      created_at: todo.created_at
    }));

    return c.json({ success: true, todos });
  } catch (error) {
    console.error('List todos error:', error);
    return c.json({ success: false, error: 'Internal server error' }, 500);
  }
});

app.put('/api/todos/:id', async (c) => {
  try {
    const payload = c.get('jwtPayload');
    const todoId = c.req.param('id');
    const { completed } = await c.req.json();

    if (typeof completed !== 'boolean') {
      return c.json({ success: false, error: 'Completed status is required' }, 400);
    }

    // Check ownership
    const todo = await c.env.DB.prepare(
      'SELECT * FROM todos WHERE id = ? AND user_id = ?'
    ).bind(todoId, payload.userId).first();

    if (!todo) {
      return c.json({ success: false, error: 'Todo not found' }, 404);
    }

    // Update todo
    await c.env.DB.prepare(
      'UPDATE todos SET completed = ? WHERE id = ? AND user_id = ?'
    ).bind(completed ? 1 : 0, todoId, payload.userId).run();

    return c.json({
      success: true,
      todo: {
        id: todo.id,
        title: todo.title,
        completed,
        created_at: todo.created_at
      }
    });
  } catch (error) {
    console.error('Update todo error:', error);
    return c.json({ success: false, error: 'Internal server error' }, 500);
  }
});

app.delete('/api/todos/:id', async (c) => {
  try {
    const payload = c.get('jwtPayload');
    const todoId = c.req.param('id');

    // Check ownership and delete
    const result = await c.env.DB.prepare(
      'DELETE FROM todos WHERE id = ? AND user_id = ? RETURNING id'
    ).bind(todoId, payload.userId).first();

    if (!result) {
      return c.json({ success: false, error: 'Todo not found' }, 404);
    }

    return c.json({ success: true });
  } catch (error) {
    console.error('Delete todo error:', error);
    return c.json({ success: false, error: 'Internal server error' }, 500);
  }
});

export default app;

// Password hashing functions for Workers
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  
  const key = await crypto.subtle.importKey(
    'raw',
    data,
    'PBKDF2',
    false,
    ['deriveBits']
  );
  
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    key,
    256
  );
  
  const hashArray = new Uint8Array(bits);
  const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
  const hashHex = Array.from(hashArray).map(b => b.toString(16).padStart(2, '0')).join('');
  
  return `${saltHex}:${hashHex}`;
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const [saltHex, hashHex] = hash.split(':');
  if (!saltHex || !hashHex) return false;
  
  const salt = new Uint8Array(saltHex.match(/.{2}/g)!.map(byte => parseInt(byte, 16)));
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  
  const key = await crypto.subtle.importKey(
    'raw',
    data,
    'PBKDF2',
    false,
    ['deriveBits']
  );
  
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    key,
    256
  );
  
  const hashArray = new Uint8Array(bits);
  const newHashHex = Array.from(hashArray).map(b => b.toString(16).padStart(2, '0')).join('');
  
  return newHashHex === hashHex;
}

// SignJWT implementation for Workers
class SignJWT {
  private payload: any;
  private header: any = {};

  constructor(payload: any) {
    this.payload = payload;
  }

  setProtectedHeader(header: any) {
    this.header = header;
    return this;
  }

  setExpirationTime(exp: string) {
    const now = Math.floor(Date.now() / 1000);
    const duration = exp === '7d' ? 7 * 24 * 60 * 60 : 0;
    this.payload.exp = now + duration;
    return this;
  }

  async sign(key: Uint8Array): Promise<string> {
    const encoder = new TextEncoder();
    const header = btoa(JSON.stringify(this.header)).replace(/=/g, '');
    const payload = btoa(JSON.stringify(this.payload)).replace(/=/g, '');
    const data = `${header}.${payload}`;
    
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      key,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signature = await crypto.subtle.sign(
      'HMAC',
      cryptoKey,
      encoder.encode(data)
    );
    
    const sig = btoa(String.fromCharCode(...new Uint8Array(signature))).replace(/=/g, '');
    return `${data}.${sig}`;
  }
}