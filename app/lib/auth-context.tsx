import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from './auth';
import type { User } from './auth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  async function checkAuthStatus() {
    try {
      setIsLoading(true);
      const response = await authService.verifyToken();
      if (response.success && response.user) {
        setUser(response.user);
      } else {
        setUser(null);
        authService.removeToken();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      authService.removeToken();
    } finally {
      setIsLoading(false);
    }
  }

  async function login(email: string, password: string) {
    try {
      const response = await authService.login({ email, password });
      if (response.success && response.user && response.token) {
        authService.saveToken(response.token);
        setUser(response.user);
        return { success: true };
      } else {
        return { success: false, message: response.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Network error' };
    }
  }

  async function register(email: string, password: string) {
    try {
      const response = await authService.register({ email, password });
      if (response.success && response.user && response.token) {
        authService.saveToken(response.token);
        setUser(response.user);
        return { success: true };
      } else {
        return { success: false, message: response.message || 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: 'Network error' };
    }
  }

  function logout() {
    authService.removeToken();
    setUser(null);
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}