import express from 'express';
import { getTodosByUserId } from '../../lib/database';

export async function listTodosHandler(req: express.Request, res: express.Response): Promise<void> {
  try {
    const user = req.user;

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    const todos = await getTodosByUserId(user.id);

    res.json({
      success: true,
      todos: todos.map(todo => ({
        id: todo.id,
        title: todo.title,
        completed: Boolean(todo.completed),
        created_at: todo.created_at
      }))
    });
  } catch (error) {
    console.error('Todo list error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}