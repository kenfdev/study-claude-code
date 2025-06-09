import express from 'express';
import cors from 'cors';
import { registerHandler } from './functions/api/auth/register';
import { loginHandler } from './functions/api/auth/login';
import { authMiddleware } from './functions/lib/middleware';
import { createTodoHandler } from './functions/api/todos/create';
import { listTodosHandler } from './functions/api/todos/list';
import updateHandler from './functions/api/todos/update';
import { deleteTodoHandler } from './functions/api/todos/delete';

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(cors());
app.use(express.json());

app.post('/api/auth/register', registerHandler);
app.post('/api/auth/login', loginHandler);

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