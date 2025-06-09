import type { Route } from "./+types/home";
import { Link } from "react-router";
import { useAuth } from "~/lib/auth-context";
import { TodoForm } from "~/components/TodoForm";
import { TodoList } from "~/components/TodoList";
import { authService } from "~/lib/auth";
import type { Todo } from "~/lib/auth";
import { useState, useEffect } from "react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Todo App" },
    { name: "description", content: "Simple Todo Management App" },
  ];
}

export default function Home() {
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [todosLoading, setTodosLoading] = useState(false);
  const [todoCreating, setTodoCreating] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadTodos();
    }
  }, [isAuthenticated]);

  async function loadTodos() {
    setTodosLoading(true);
    try {
      const response = await authService.getTodos();
      if (response.success && response.todos) {
        setTodos(response.todos);
      }
    } catch (error) {
      console.error('Failed to load todos:', error);
    } finally {
      setTodosLoading(false);
    }
  }

  async function handleCreateTodo(title: string) {
    setTodoCreating(true);
    try {
      const response = await authService.createTodo({ title });
      if (response.success && response.todo) {
        setTodos(prev => [response.todo!, ...prev]);
        return { success: true };
      } else {
        return { success: false, message: response.message || 'Todo作成に失敗しました' };
      }
    } catch (error) {
      console.error('Failed to create todo:', error);
      return { success: false, message: 'ネットワークエラーが発生しました' };
    } finally {
      setTodoCreating(false);
    }
  }

  async function handleToggleComplete(id: number, completed: boolean) {
    setTodos(prev => 
      prev.map(todo => 
        todo.id === id ? { ...todo, completed } : todo
      )
    );

    try {
      const response = await authService.updateTodo(id, { completed });
      if (!response.success) {
        setTodos(prev => 
          prev.map(todo => 
            todo.id === id ? { ...todo, completed: !completed } : todo
          )
        );
        console.error('Failed to update todo:', response.message);
      }
    } catch (error) {
      setTodos(prev => 
        prev.map(todo => 
          todo.id === id ? { ...todo, completed: !completed } : todo
        )
      );
      console.error('Failed to update todo:', error);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 text-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Todo App</h1>
            <p className="text-lg text-gray-600 mb-8">シンプルなタスク管理アプリ</p>
          </div>
          <div className="space-y-4">
            <Link
              to="/login"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              ログイン
            </Link>
            <Link
              to="/register"
              className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              新規登録
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Todo App</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">こんにちは、{user?.email}さん</span>
              <button
                onClick={logout}
                className="bg-gray-200 hover:bg-gray-300 px-3 py-2 rounded-md text-sm font-medium text-gray-700"
              >
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Todo管理
            </h2>
            <p className="text-gray-600">
              新しいTodoを追加して、タスクを管理しましょう
            </p>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <TodoForm 
              onSubmit={handleCreateTodo}
              isLoading={todoCreating}
            />
            
            <TodoList 
              todos={todos}
              isLoading={todosLoading}
              onToggleComplete={handleToggleComplete}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
