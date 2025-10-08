'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { User, AuthState, LoginRequest, RegisterRequest, CorporateRegisterRequest } from '@/types/auth';
import { AuthService } from '@/lib/auth';
import { apiClient } from '@/lib/api-client';
import { API_CONFIG, API_ENDPOINTS } from '@/lib/constants';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  loginWithOAuth: (user: User) => void;
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

      // Handle post-auth routing based on jobs
      try {
        const { getPostAuthRedirectPath } = await import('@/utils/post-auth-routing');
        const redirectPath = await getPostAuthRedirectPath();
        console.log('🔄 Login - Redirecting to:', redirectPath);
        router.push(redirectPath);
      } catch (routingError) {
        console.error('❌ Post-auth routing failed:', routingError);
        router.push('/get-started');
      }
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const loginWithOAuth = (user: User) => {
    setState({
      user,
      isAuthenticated: true,
      isLoading: false,
    });
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

        // Handle post-auth routing based on jobs
        try {
          const { getPostAuthRedirectPath } = await import('@/utils/post-auth-routing');
          const redirectPath = await getPostAuthRedirectPath();
          console.log('🔄 Register - Redirecting to:', redirectPath);
          router.push(redirectPath);
        } catch (routingError) {
          console.error('❌ Post-auth routing failed:', routingError);
          router.push('/get-started');
        }
      }
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const logout = () => {
    AuthService.logout();

    // Clear current role ID from session storage
    // TODO: When job list is implemented, this should be updated to:
    // 1. Keep role IDs in session storage for "Continue where you left off" feature
    // 2. Only clear role IDs when user explicitly deletes them from job list
    // 3. Consider moving role IDs to a more persistent storage (localStorage or backend)
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('current_role_id');
    }

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
      console.log('🔄 AuthContext: Starting refreshAuth...');
      const token = AuthService.getAccessToken();
      console.log('🎫 AuthContext: Token exists:', !!token);

      const isValid = await AuthService.isTokenValid();
      console.log('✅ AuthContext: Token valid:', isValid);

      if (isValid) {
        // Fetch user data from /me endpoint
        const fullUrl = `${API_CONFIG.BASE_URL}${API_ENDPOINTS.AUTH.ME}`;
        console.log('📡 AuthContext: Fetching user data from:', fullUrl);
        console.log('🎫 AuthContext: Using token:', token?.substring(0, 20) + '...');

        const response = await fetch(fullUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });

        console.log('📡 AuthContext: /me response status:', response.status);
        console.log('📡 AuthContext: /me response headers:', Object.fromEntries(response.headers.entries()));

        if (response.ok) {
          const user = await response.json();
          console.log('👤 AuthContext: User data received:', user);
          setState({ user, isAuthenticated: true, isLoading: false });
        } else {
          const errorText = await response.text();
          console.log('❌ AuthContext: /me endpoint failed with status:', response.status);
          console.log('❌ AuthContext: Error response:', errorText);

          // Check if it's a "pending approval" error
          try {
            const errorData = JSON.parse(errorText);
            if (response.status === 403 && errorData.error?.message === "Account pending approval") {
              console.log('⏳ AuthContext: Account pending approval detected');
              // Set loading to false
              setState({
                user: null,
                isAuthenticated: false,
                isLoading: false,
              });

              // Only redirect if not already on pending approval page
              if (typeof window !== 'undefined' && !window.location.pathname.includes('/pending-approval')) {
                console.log('⏳ AuthContext: Redirecting to pending approval page');
                router.push('/pending-approval');
              } else {
                console.log('⏳ AuthContext: Already on pending approval page, staying put');
              }
              return;
            }
          } catch (parseError) {
            console.log('Failed to parse error response:', parseError);
          }

          // For other errors, don't immediately logout - just set loading to false
          // This prevents automatic logout when backend is temporarily unavailable
          setState(prev => ({ ...prev, isLoading: false }));
        }
      } else {
        console.log('❌ AuthContext: Token invalid, logging out');
        logout();
      }
    } catch (error) {
      console.log('💥 AuthContext: Error in refreshAuth:', error);
      // Don't immediately logout on network errors - just set loading to false
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  useEffect(() => {
    // Don't run auth refresh if we're on the pending approval page
    // This prevents redirect loops when user refreshes the pending page
    if (typeof window !== 'undefined' && window.location.pathname === '/pending-approval') {
      console.log('🚫 AuthContext: Skipping auth refresh on pending approval page');
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    refreshAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, loginWithOAuth, register, logout, refreshAuth }}>
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
