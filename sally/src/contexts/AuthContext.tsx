'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { User, AuthState, LoginRequest, RegisterRequest, CorporateRegisterRequest } from '@/types/auth';
import { AuthService } from '@/lib/auth';
import { apiClient } from '@/lib/api-client';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
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

  const register = async (data: RegisterRequest) => {
    try {
      const response = await apiClient.register(data);

      // If registration returns user data with tokens, automatically log them in
      if (response) {
        // Create a user object from the registration response
        const user: User = {
          id: response.id || `user_${Date.now()}`,
          email: response.email || data.email,
          full_name: response.full_name || data.full_name,
          is_active: response.is_active ?? true,
          organization_id: response.organization_id,
          roles: response.roles || ["user"],
          is_admin: response.is_admin ?? false,
          is_approved: response.is_approved ?? true,
          email_verified: response.email_verified ?? false,
          created_at: response.created_at || new Date().toISOString(),
          last_login: response.last_login
        };

        setState({
          user,
          isAuthenticated: true,
          isLoading: false,
        });

        // Navigate to get-started page after successful registration
        router.push('/get-started');
      }
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
    // Navigate to landing page after logout
    router.push('/landing-page');
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
    <AuthContext.Provider value={{ ...state, login, register, logout, refreshAuth }}>
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
