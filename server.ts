import express from 'express';
import cors from 'cors';
import { registerHandler } from './functions/api/auth/register';
import { loginHandler } from './functions/api/auth/login';
import { authMiddleware } from './functions/lib/middleware';
import { createTodoHandler } from './functions/api/todos/create';
import { listTodosHandler } from './functions/api/todos/list';

const app = express();
const PORT = process.env.PORT || 3001;

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

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;