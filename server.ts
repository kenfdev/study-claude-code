import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { registerHandler } from './functions/api/auth/register';
import { loginHandler } from './functions/api/auth/login';
import { authMiddleware } from './functions/lib/middleware';
import { createTodoHandler } from './functions/api/todos/create';
import { listTodosHandler } from './functions/api/todos/list';
import updateHandler from './functions/api/todos/update';
import { deleteTodoHandler } from './functions/api/todos/delete';

const app = express();
const PORT = Number(process.env.PORT) || 3001;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());

// Rate limiting for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// General rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', generalLimiter);

app.post('/api/auth/register', authLimiter, registerHandler);
app.post('/api/auth/login', authLimiter, loginHandler);

app.get('/api/auth/me', authMiddleware, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

// Todo API endpoints
app.post('/api/todos', authMiddleware, createTodoHandler);
app.get('/api/todos', authMiddleware, listTodosHandler);
app.put('/api/todos/:id', authMiddleware, async (req, res) => {
  const request = new Request(`http://localhost/api/todos/${req.params.id}`, {
    method: 'PUT',
    headers: {
      'Authorization': req.headers.authorization || '',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(req.body)
  });
  
  const response = await updateHandler(request, {} as any, {} as any);
  const data = await response.json();
  
  res.status(response.status).json(data);
});
app.delete('/api/todos/:id', authMiddleware, deleteTodoHandler);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

if (process.env.NODE_ENV !== 'test') {
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`  ➜  Local:   http://localhost:${PORT}/`);
    console.log(`  ➜  Network: http://0.0.0.0:${PORT}/`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully...');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully...');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
}

export default app;