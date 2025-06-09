const API_BASE_URL = typeof window !== 'undefined' 
  ? '/api'  // ブラウザから同じオリジンでアクセス
  : 'http://localhost:3001/api';  // サーバーサイドでは直接アクセス

export interface User {
  id: number;
  email: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
}

export interface Todo {
  id: number;
  title: string;
  completed: boolean;
  created_at: string;
}

export interface TodoResponse {
  success: boolean;
  todo?: Todo;
  message?: string;
}

export interface TodoListResponse {
  success: boolean;
  todos?: Todo[];
  message?: string;
}

export interface CreateTodoData {
  title: string;
}

export interface UpdateTodoData {
  title?: string;
  completed?: boolean;
}

export class AuthService {
  private static instance: AuthService;
  
  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    return response.json();
  }

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    return response.json();
  }

  async verifyToken(): Promise<AuthResponse> {
    const token = this.getToken();
    if (!token) {
      return { success: false, message: 'No token found' };
    }

    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    return response.json();
  }

  async createTodo(data: CreateTodoData): Promise<TodoResponse> {
    const token = this.getToken();
    if (!token) {
      return { success: false, message: 'No token found' };
    }

    const response = await fetch(`${API_BASE_URL}/todos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    return response.json();
  }

  async getTodos(): Promise<TodoListResponse> {
    const token = this.getToken();
    if (!token) {
      return { success: false, message: 'No token found' };
    }

    const response = await fetch(`${API_BASE_URL}/todos`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    return response.json();
  }

  async updateTodo(id: number, data: UpdateTodoData): Promise<TodoResponse> {
    const token = this.getToken();
    if (!token) {
      return { success: false, message: 'No token found' };
    }

    const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      const todo = await response.json();
      return { success: true, todo };
    } else {
      const error = await response.json();
      return { success: false, message: error.error || 'Update failed' };
    }
  }

  saveToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  removeToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export const authService = AuthService.getInstance();

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPassword(password: string): boolean {
  return password.length >= 6;
}