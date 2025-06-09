import express from 'express';
import { deleteTodo } from '../../lib/database';

export async function deleteTodoHandler(req: express.Request, res: express.Response): Promise<void> {
  try {
    const { id } = req.params;
    const user = req.user;

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    // IDの検証
    const todoId = parseInt(id, 10);
    if (isNaN(todoId) || todoId <= 0) {
      res.status(400).json({
        success: false,
        message: 'Invalid todo ID'
      });
      return;
    }

    // Todoを削除（ユーザー権限もチェック）
    const deleted = await deleteTodo(todoId, user.id);

    if (!deleted) {
      res.status(404).json({
        success: false,
        message: 'Todo not found or access denied'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Todo deleted successfully'
    });
  } catch (error) {
    console.error('Todo deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}