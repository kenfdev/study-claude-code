import React, { useState } from 'react';

interface TodoFormProps {
  onSubmit: (title: string) => Promise<{ success: boolean; message?: string }>;
  isLoading?: boolean;
}

export function TodoForm({ onSubmit, isLoading = false }: TodoFormProps) {
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');

  function validateTitle(title: string): string | null {
    const trimmed = title.trim();
    if (trimmed.length === 0) {
      return 'Todoタイトルは必須です';
    }
    if (trimmed.length > 500) {
      return 'タイトルは500文字以内で入力してください';
    }
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const validationError = validateTitle(title);
    if (validationError) {
      setError(validationError);
      return;
    }

    const result = await onSubmit(title.trim());
    if (result.success) {
      setTitle(''); // Clear form on success
    } else {
      setError(result.message || '作成に失敗しました');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="flex gap-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="新しいTodoを入力..."
          disabled={isLoading}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? '追加中...' : '追加'}
        </button>
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </form>
  );
}