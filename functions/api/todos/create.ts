import express from 'express';
import { createTodo } from '../../lib/database';
import { sanitizeTodoTitle } from '../../lib/sanitizer';

export async function createTodoHandler(req: express.Request, res: express.Response): Promise<void> {
  try {
    const { title } = req.body;
    const user = req.user;

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    if (title === undefined || title === null || typeof title !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Title is required and must be a string'
      });
      return;
    }

    const sanitizedTitle = sanitizeTodoTitle(title);
    if (sanitizedTitle.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Title cannot be empty'
      });
      return;
    }

    const todo = await createTodo(user.id, sanitizedTitle);

    res.status(201).json({
      success: true,
      todo: {
        id: todo.id,
        title: todo.title,
        completed: Boolean(todo.completed),
        created_at: todo.created_at
      }
    });
  } catch (error) {
    console.error('Todo creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}