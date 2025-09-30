import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../utils/supabaseClient';

interface AdminUser {
  id: string;
  email: string;
  role: string;
  is_active: boolean;
  permissions: Record<string, any>;
  created_at: string;
  last_login?: string;
}

interface AdminContextType {
  user: AdminUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  verifyAuth: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

interface AdminProviderProps {
  children: ReactNode;
}

export const AdminProvider: React.FC<AdminProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    verifyAuth();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);

      const response = await fetch('/functions/v1/admin-auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        localStorage.setItem('admin_token', data.token);
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error occurred' };
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);

      const response = await fetch('/functions/v1/admin-auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        // Don't auto-login after signup, redirect to login
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Sign up failed' };
      }
    } catch (error) {
      console.error('Sign up error:', error);
      return { success: false, error: 'Network error occurred' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await fetch('/functions/v1/admin-auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
        },
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('admin_token');
    }
  };

  const verifyAuth = async (): Promise<void> => {
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await fetch('/functions/v1/admin-auth/verify', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
      } else {
        // Token is invalid, remove it
        localStorage.removeItem('admin_token');
        setUser(null);
      }
    } catch (error) {
      console.error('Auth verification error:', error);
      localStorage.removeItem('admin_token');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const value: AdminContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    verifyAuth,
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};