'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, AuthState, LoginRequest, RegisterRequest, CorporateRegisterRequest } from '@/types/auth';
import { AuthService } from '@/lib/auth';
import { apiClient } from '@/lib/api-client';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const login = async (email: string, password: string) => {
    try {
      const response = await AuthService.login(email, password);
      setState({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const logout = () => {
    AuthService.logout();
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  const refreshAuth = async () => {
    try {
      const isValid = await AuthService.isTokenValid();
      if (isValid) {
        // Fetch user data from /me endpoint
        const token = AuthService.getAccessToken();
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const user = await response.json();
          setState({ user, isAuthenticated: true, isLoading: false });
        } else {
          logout();
        }
      } else {
        logout();
      }
    } catch {
      logout();
    }
  };

  useEffect(() => {
    refreshAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, refreshAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
