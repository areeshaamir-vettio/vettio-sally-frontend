'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { User, AuthState, RegisterRequest } from '@/types/auth';
import { AuthService } from '@/lib/auth';
import { apiClient } from '@/lib/api-client';
import { API_CONFIG, API_ENDPOINTS } from '@/lib/constants';
import { useAuthRefresh } from '@/hooks/useAuthRefresh';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  loginWithOAuth: (user: User) => Promise<void>;
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

  // Automatically refresh tokens before they expire
  useAuthRefresh();

  const login = async (email: string, password: string) => {
    try {
      console.log('🔄 AuthContext.login: Starting login process...');
      const response = await AuthService.login(email, password);
      console.log('✅ AuthContext.login: Login successful, setting state...');

      setState({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
      });

      console.log('🔄 AuthContext.login: Checking user approval status...');
      // First, check if user is approved by calling /me endpoint
      try {
        const token = AuthService.getAccessToken();
        const fullUrl = `${API_CONFIG.BASE_URL}${API_ENDPOINTS.AUTH.ME}`;
        console.log('📡 AuthContext.login: Checking approval status at:', fullUrl);

        const meResponse = await fetch(fullUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });

        console.log('📡 AuthContext.login: /me response status:', meResponse.status);

        if (meResponse.status === 403) {
          console.log('⏳ AuthContext.login: Got 403 from /me endpoint - account pending approval');
          router.push('/pending-approval');
          return;
        }

        if (!meResponse.ok) {
          console.log('⚠️ AuthContext.login: /me endpoint failed with status:', meResponse.status);
          // For other errors, proceed with normal routing as fallback
        }

        // If /me endpoint succeeds, user is approved, proceed with normal routing
        console.log('✅ AuthContext.login: User is approved, proceeding with post-auth routing...');

        // Add a small delay to ensure auth state is fully settled before routing
        await new Promise(resolve => setTimeout(resolve, 500));

        const { getPostAuthRedirectPath } = await import('@/utils/post-auth-routing');
        console.log('🔄 AuthContext.login: Calling getPostAuthRedirectPath...');
        const redirectPath = await getPostAuthRedirectPath();
        console.log('🔄 AuthContext.login: Redirecting to:', redirectPath);
        router.push(redirectPath);
        console.log('✅ AuthContext.login: Router.push called successfully');

      } catch (routingError) {
        console.error('❌ AuthContext.login: Post-auth routing failed:', routingError);

        // Check if this is a pending approval error
        if (routingError instanceof Error && (
          routingError.message.includes('Account pending approval') ||
          routingError.message.includes('pending admin approval') ||
          routingError.message.includes('pending approval')
        )) {
          console.log('⏳ AuthContext.login: Account pending approval detected, redirecting to pending approval page');
          router.push('/pending-approval');
        } else {
          console.log('🔄 AuthContext.login: Falling back to /get-started');
          router.push('/get-started');
        }
      }
    } catch (error) {
      console.error('❌ AuthContext.login: Login failed:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const loginWithOAuth = async (user: User) => {
    console.log('🔄 AuthContext: Setting OAuth user state...');
    setState({
      user,
      isAuthenticated: true,
      isLoading: false,
    });
    console.log('✅ AuthContext: OAuth user state updated');
    // Note: OAuth callback pages handle their own routing
  };

  const register = async (data: RegisterRequest) => {
    try {
      console.log('🔄 AuthContext.register: Starting registration process...');
      const response = await apiClient.register(data);
      console.log('✅ AuthContext.register: Registration successful');

      // Registration successful, now automatically log the user in to get tokens
      if (response) {
        console.log('🔄 AuthContext.register: Auto-logging in user after registration...');

        try {
          // Use the login method to get authentication tokens
          const loginResponse = await AuthService.login(data.email, data.password);
          console.log('✅ AuthContext.register: Auto-login successful');

          setState({
            user: loginResponse.user,
            isAuthenticated: true,
            isLoading: false,
          });

          console.log('🔄 AuthContext.register: Checking user approval status...');
          // First, check if user is approved by calling /me endpoint
          try {
            const token = AuthService.getAccessToken();
            const fullUrl = `${API_CONFIG.BASE_URL}${API_ENDPOINTS.AUTH.ME}`;
            console.log('📡 AuthContext.register: Checking approval status at:', fullUrl);

            const meResponse = await fetch(fullUrl, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
            });

            console.log('📡 AuthContext.register: /me response status:', meResponse.status);

            if (meResponse.status === 403) {
              console.log('⏳ AuthContext.register: Got 403 from /me endpoint - account pending approval');
              router.push('/pending-approval');
              return;
            }

            if (!meResponse.ok) {
              console.log('⚠️ AuthContext.register: /me endpoint failed with status:', meResponse.status);
              // For other errors, proceed with normal routing as fallback
            }

            // If /me endpoint succeeds, user is approved, proceed with normal routing
            console.log('✅ AuthContext.register: User is approved, proceeding with post-auth routing...');

            // Add a small delay to ensure auth state is fully settled before routing
            await new Promise(resolve => setTimeout(resolve, 500));

            const { getPostAuthRedirectPath } = await import('@/utils/post-auth-routing');
            const redirectPath = await getPostAuthRedirectPath();
            console.log('🔄 Register - Redirecting to:', redirectPath);
            router.push(redirectPath);

          } catch (routingError) {
            console.error('❌ Post-auth routing failed:', routingError);

            // Check if this is a pending approval error
            if (routingError instanceof Error && (
              routingError.message.includes('Account pending approval') ||
              routingError.message.includes('pending admin approval') ||
              routingError.message.includes('pending approval')
            )) {
              console.log('⏳ AuthContext.register: Account pending approval detected, redirecting to pending approval page');
              router.push('/pending-approval');
            } else {
              router.push('/get-started');
            }
          }
        } catch (loginError) {
          console.error('❌ AuthContext.register: Auto-login failed:', loginError);
          // If auto-login fails, still set user state but redirect to login
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
            isAuthenticated: false, // Not authenticated since login failed
            isLoading: false,
          });

          // Redirect to login page with a message
          router.push('/login?message=registration_success');
        }
      }
    } catch (error) {
      console.error('❌ AuthContext.register: Registration failed:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const logout = () => {
    // Set loading state to prevent flash of content during logout
    setState(prev => ({ ...prev, isLoading: true }));

    AuthService.logout();

    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });

    // Navigate to landing page after logout
    router.push('/');
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
    // Don't run auth refresh if we're on public pages
    // This prevents redirect loops when user refreshes public pages
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      const publicPaths = ['/login', '/signup', '/', '/pending-approval'];

      if (publicPaths.includes(currentPath)) {
        console.log('🚫 AuthContext: Skipping auth refresh on public page:', currentPath);
        setState(prev => ({ ...prev, isLoading: false }));
        return;
      }
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
