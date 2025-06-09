import React, { useState } from 'react';
import type { Todo } from '~/lib/auth';

interface TodoListProps {
  todos: Todo[];
  onDelete?: (id: number) => Promise<{ success: boolean; message?: string }>;
  isLoading?: boolean;
}

export function TodoList({ todos, onDelete, isLoading = false }: TodoListProps) {
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; title: string } | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDeleteClick = (todo: Todo) => {
    setDeleteConfirm({ id: todo.id, title: todo.title });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm || !onDelete) return;

    setDeletingId(deleteConfirm.id);
    try {
      await onDelete(deleteConfirm.id);
    } finally {
      setDeletingId(null);
      setDeleteConfirm(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm(null);
  };
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
    <>
      <div className="space-y-2">
        {todos.map((todo) => (
          <div
            key={todo.id}
            className="flex items-center p-3 bg-white border border-gray-200 rounded-md shadow-sm"
          >
            <input
              type="checkbox"
              checked={todo.completed}
              readOnly
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mr-3"
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
            <span className="text-xs text-gray-400 mr-3">
              {new Date(todo.created_at).toLocaleDateString('ja-JP')}
            </span>
            {onDelete && (
              <button
                onClick={() => handleDeleteClick(todo)}
                disabled={deletingId === todo.id}
                className="text-red-600 hover:text-red-800 p-1 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                title="削除"
              >
                {deletingId === todo.id ? (
                  <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                )}
              </button>
            )}
          </div>
        ))}
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Todoを削除しますか？
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              「{deleteConfirm.title}」を削除します。この操作は元に戻すことができません。
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleDeleteCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                キャンセル
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
              >
                削除
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}