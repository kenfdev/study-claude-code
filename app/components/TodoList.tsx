import React from 'react';
import type { Todo } from '~/lib/auth';

interface TodoListProps {
  todos: Todo[];
  isLoading?: boolean;
  onToggleComplete?: (id: number, completed: boolean) => void;
}

export function TodoList({ todos, isLoading = false, onToggleComplete }: TodoListProps) {
  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">読み込み中...</p>
      </div>
    );
  }

  if (todos.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>まだTodoがありません</p>
        <p className="text-sm">上のフォームから新しいTodoを追加してください</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {todos.map((todo) => (
        <div
          key={todo.id}
          className="flex items-center p-3 bg-white border border-gray-200 rounded-md shadow-sm"
        >
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={(e) => onToggleComplete?.(todo.id, e.target.checked)}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mr-3 cursor-pointer"
          />
          <span
            className={`flex-1 ${
              todo.completed
                ? 'text-gray-500 line-through'
                : 'text-gray-900'
            }`}
          >
            {todo.title}
          </span>
          <span className="text-xs text-gray-400">
            {new Date(todo.created_at).toLocaleDateString('ja-JP')}
          </span>
        </div>
      ))}
    </div>
  );
}