import express from 'express';
import { registerHandler } from './functions/api/auth/register';
import { loginHandler } from './functions/api/auth/login';
import { authMiddleware } from './functions/lib/middleware';
import { createTodoHandler } from './functions/api/todos/create';
import { listTodosHandler } from './functions/api/todos/list';
import { deleteTodoHandler } from './functions/api/todos/delete';

export function createTestApp() {
  const app = express();
  app.use(express.json());
  
  app.post('/api/auth/register', registerHandler);
  app.post('/api/auth/login', loginHandler);
  
  app.post('/api/todos', authMiddleware, createTodoHandler);
  app.get('/api/todos', authMiddleware, listTodosHandler);
  app.delete('/api/todos/:id', authMiddleware, deleteTodoHandler);
  
  app.get('/protected', authMiddleware, (req, res) => {
    res.json({ message: 'Protected route accessed', user: req.user });
  });
  
  return app;
}