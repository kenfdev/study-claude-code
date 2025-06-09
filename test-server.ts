import express from 'express';
import { registerHandler } from './functions/api/auth/register';
import { loginHandler } from './functions/api/auth/login';
import { authMiddleware } from './functions/lib/middleware';

export function createTestApp() {
  const app = express();
  app.use(express.json());
  
  app.post('/api/auth/register', registerHandler);
  app.post('/api/auth/login', loginHandler);
  
  app.get('/protected', authMiddleware, (req, res) => {
    res.json({ message: 'Protected route accessed', user: req.user });
  });
  
  return app;
}