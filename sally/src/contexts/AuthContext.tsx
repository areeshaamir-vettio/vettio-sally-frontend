'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode, useRef } from 'react';
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

  // Track if we're in the middle of an OAuth flow to prevent race conditions
  const isOAuthFlowRef = useRef(false);
  const refreshAuthAbortControllerRef = useRef<AbortController | null>(null);

  // Automatically refresh tokens before they expire
  useAuthRefresh();

  const login = async (email: string, password: string) => {
    try {
      console.log('🔄 AuthContext.login: Starting login process...');

      // Mark that we're in a login flow to prevent refreshAuth from interfering
      isOAuthFlowRef.current = true;

      // Cancel any ongoing refreshAuth operations
      if (refreshAuthAbortControllerRef.current) {
        refreshAuthAbortControllerRef.current.abort();
        refreshAuthAbortControllerRef.current = null;
      }

      // Clear any cached data from previous user/session
      console.log('🧹 AuthContext.login: Clearing cache before login...');
      if (typeof window !== 'undefined') {
        // Clear any cached data that might exist
        window.dispatchEvent(new CustomEvent('auth:clearCache'));
      }

      const response = await AuthService.login(email, password);
      console.log('✅ AuthContext.login: Login successful, setting state...');

      // Clear any pending approval flag since login was successful
      localStorage.removeItem('pending_approval_detected');

      setState({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
      });

      console.log('🔄 AuthContext.login: Starting post-auth routing...');
      // Handle post-auth routing based on jobs
      try {
        const { getPostAuthRedirectPath } = await import('@/utils/post-auth-routing');
        console.log('🔄 AuthContext.login: Calling getPostAuthRedirectPath...');
        const redirectPath = await getPostAuthRedirectPath();
        console.log('🔄 AuthContext.login: Redirecting to:', redirectPath);
        router.push(redirectPath);
        console.log('✅ AuthContext.login: Router.push called successfully');
      } catch (routingError) {
        // Check if this is a pending approval error
        if (routingError instanceof Error && (
          routingError.message.includes('Account pending approval') ||
          routingError.message.includes('pending approval') ||
          routingError.message.includes('pending admin approval')
        )) {
          console.log('⏳ AuthContext.login: Account pending approval detected - redirecting');
          router.push('/pending-approval');
          return; // Don't throw error, just redirect
        }

        console.error('❌ AuthContext.login: Post-auth routing failed:', routingError);
        console.log('🔄 AuthContext.login: Falling back to /get-started');
        router.push('/get-started');
      }

      // Reset login flow flag after routing
      setTimeout(() => {
        isOAuthFlowRef.current = false;
      }, 1000);
    } catch (error) {
      // Check if this is a pending approval error first
      if (error instanceof Error && (
        error.message.includes('PENDING_APPROVAL_REDIRECT') ||
        error.message.includes('Account pending approval') ||
        error.message.includes('pending approval') ||
        error.message.includes('pending admin approval') ||
        (error as any).isPendingApproval === true ||
        (error as any).shouldRedirect === true
      )) {
        console.log('⏳ AuthContext.login: Account pending approval detected in login - redirecting');
        setState(prev => ({ ...prev, isLoading: false }));
        isOAuthFlowRef.current = false;
        router.push('/pending-approval');
        return; // Don't throw error, just redirect
      }

      console.error('❌ AuthContext.login: Login failed:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      // Reset login flow flag on error
      isOAuthFlowRef.current = false;
      throw error;
    }
  };

  const loginWithOAuth = async (user: User) => {
    console.log('🔄 AuthContext: Setting OAuth user state...');

    // Mark that we're in an OAuth flow to prevent refreshAuth from interfering
    isOAuthFlowRef.current = true;

    // Cancel any ongoing refreshAuth operations
    if (refreshAuthAbortControllerRef.current) {
      refreshAuthAbortControllerRef.current.abort();
      refreshAuthAbortControllerRef.current = null;
    }

    // Clear any cached data from previous user/session
    console.log('🧹 AuthContext.loginWithOAuth: Clearing cache before OAuth login...');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth:clearCache'));
    }

    // Clear any pending approval flag since OAuth login was successful
    localStorage.removeItem('pending_approval_detected');

    setState({
      user,
      isAuthenticated: true,
      isLoading: false,
    });
    console.log('✅ AuthContext: OAuth user state updated');

    // Reset OAuth flow flag after a short delay to allow routing to complete
    setTimeout(() => {
      isOAuthFlowRef.current = false;
    }, 1000);

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

          // Handle post-auth routing based on jobs
          try {
            const { getPostAuthRedirectPath } = await import('@/utils/post-auth-routing');
            const redirectPath = await getPostAuthRedirectPath();
            console.log('🔄 Register - Redirecting to:', redirectPath);
            router.push(redirectPath);
          } catch (routingError) {
            // Check if this is a pending approval error
            if (routingError instanceof Error && (
              routingError.message.includes('Account pending approval') ||
              routingError.message.includes('pending approval') ||
              routingError.message.includes('pending admin approval')
            )) {
              console.log('⏳ AuthContext.register: Account pending approval detected - redirecting');
              router.push('/pending-approval');
              return; // Don't throw error, just redirect
            }

            console.error('❌ Post-auth routing failed:', routingError);
            router.push('/get-started');
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
      // Check if this is a pending approval error first
      if (error instanceof Error && (
        error.message.includes('PENDING_APPROVAL_REDIRECT') ||
        error.message.includes('Account pending approval') ||
        error.message.includes('pending approval') ||
        error.message.includes('pending admin approval') ||
        (error as any).isPendingApproval === true ||
        (error as any).shouldRedirect === true
      )) {
        console.log('⏳ AuthContext.register: Account pending approval detected in registration - redirecting');
        setState(prev => ({ ...prev, isLoading: false }));
        router.push('/pending-approval');
        return; // Don't throw error, just redirect
      }

      console.error('❌ AuthContext.register: Registration failed:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const logout = useCallback(() => {
    // Set loading state to prevent flash of content during logout
    setState(prev => ({ ...prev, isLoading: true }));

    // Clear any cached data before logout
    console.log('🧹 AuthContext.logout: Clearing cache before logout...');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth:clearCache'));
    }

    AuthService.logout();

    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });

    // Navigate to landing page after logout
    router.push('/');
  }, [router]);

  const refreshAuth = useCallback(async () => {
    // Don't run refreshAuth if we're in the middle of an OAuth flow
    if (isOAuthFlowRef.current) {
      console.log('🚫 AuthContext: Skipping refreshAuth - OAuth flow in progress');
      return;
    }

    // Create abort controller for this refresh operation
    const abortController = new AbortController();
    refreshAuthAbortControllerRef.current = abortController;

    try {
      console.log('🔄 AuthContext: Starting refreshAuth...');
      const token = AuthService.getAccessToken();
      console.log('🎫 AuthContext: Token exists:', !!token);

      const isValid = await AuthService.isTokenValid();
      console.log('✅ AuthContext: Token valid:', isValid);

      // Check if operation was aborted
      if (abortController.signal.aborted) {
        console.log('🚫 AuthContext: refreshAuth aborted');
        return;
      }

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
          signal: abortController.signal,
        });

        console.log('📡 AuthContext: /me response status:', response.status);
        console.log('📡 AuthContext: /me response headers:', Object.fromEntries(response.headers.entries()));

        // Check if operation was aborted after fetch
        if (abortController.signal.aborted) {
          console.log('🚫 AuthContext: refreshAuth aborted after fetch');
          return;
        }

        if (response.ok) {
          const user = await response.json();
          console.log('👤 AuthContext: User data received:', user);

          // Final abort check before setting state
          if (!abortController.signal.aborted) {
            // Clear any pending approval flag since auth was successful
            localStorage.removeItem('pending_approval_detected');
            setState({ user, isAuthenticated: true, isLoading: false });
          }
        } else if (response.status === 401) {
          // Handle session synchronization issue - token is valid but session not ready
          console.log('🔄 AuthContext: Got 401, attempting token refresh for session sync...');

          try {
            await AuthService.refreshToken();
            console.log('✅ AuthContext: Token refreshed, waiting for session to be ready...');

            // Add a delay to ensure backend session is fully established
            await new Promise(resolve => setTimeout(resolve, 300));

            // Check if operation was aborted during delay
            if (abortController.signal.aborted) {
              console.log('🚫 AuthContext: refreshAuth aborted during session sync delay');
              return;
            }

            // Retry the /me call
            const retryResponse = await fetch(fullUrl, {
              headers: {
                'Authorization': `Bearer ${AuthService.getAccessToken()}`,
                'Content-Type': 'application/json'
              },
              signal: abortController.signal,
            });

            if (retryResponse.ok) {
              const user = await retryResponse.json();
              console.log('👤 AuthContext: User data received after retry:', user);

              if (!abortController.signal.aborted) {
                localStorage.removeItem('pending_approval_detected');
                setState({ user, isAuthenticated: true, isLoading: false });
              }
              return;
            } else {
              console.log('❌ AuthContext: Retry also failed with status:', retryResponse.status);
              // Fall through to handle the error
            }
          } catch (refreshError) {
            console.log('❌ AuthContext: Token refresh failed during session sync:', refreshError);
            // Fall through to handle as regular error
          }

          // If retry failed, treat as logout
          console.log('❌ AuthContext: Session sync failed, logging out');
          logout();
          return;
        } else {
          const errorText = await response.text();

          // Check if it's a "pending approval" error FIRST before logging as error
          if (response.status === 403) {
            try {
              const errorData = JSON.parse(errorText);
              const errorMessage = errorData.error?.message || errorData.message || errorData.detail || '';

              if (errorMessage.includes('Account pending approval') ||
                  errorMessage.includes('pending approval') ||
                  errorMessage.includes('pending admin approval')) {
                console.log('⏳ AuthContext: Account pending approval detected - redirecting silently');

                // Set a flag to avoid repeated API calls
                localStorage.setItem('pending_approval_detected', 'true');

                // Set loading to false
                setState({
                  user: null,
                  isAuthenticated: false,
                  isLoading: false,
                });

                // Always redirect to pending approval page, no errors thrown
                if (typeof window !== 'undefined') {
                  console.log('⏳ AuthContext: Redirecting to pending approval page');
                  router.push('/pending-approval');
                }
                return;
              }
            } catch (parseError) {
              // If we can't parse the error but got 403, assume it might be pending approval
              console.log('⏳ AuthContext: Got 403 error, assuming pending approval');

              // Set a flag to avoid repeated API calls
              localStorage.setItem('pending_approval_detected', 'true');

              setState({
                user: null,
                isAuthenticated: false,
                isLoading: false,
              });

              if (typeof window !== 'undefined') {
                router.push('/pending-approval');
              }
              return;
            }
          }

          // If we get here, it's not a pending approval case, so log as error
          console.log('❌ AuthContext: /me endpoint failed with status:', response.status);
          console.log('❌ AuthContext: Error response:', errorText);

          // For other errors, don't immediately logout - just set loading to false
          // This prevents automatic logout when backend is temporarily unavailable
          setState(prev => ({ ...prev, isLoading: false }));
        }
      } else {
        console.log('❌ AuthContext: Token invalid, logging out');
        logout();
      }
    } catch (error) {
      // Handle abort errors silently
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('🚫 AuthContext: refreshAuth was aborted');
        return;
      }

      console.log('💥 AuthContext: Error in refreshAuth:', error);
      // Don't immediately logout on network errors - just set loading to false
      if (!abortController.signal.aborted) {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } finally {
      // Clear the abort controller reference if this was the current one
      if (refreshAuthAbortControllerRef.current === abortController) {
        refreshAuthAbortControllerRef.current = null;
      }
    }
  }, [logout, router]);

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

    // Check if user has tokens but might be pending approval
    const token = AuthService.getAccessToken();

    // Check if we've recently detected pending approval to avoid repeated API calls
    const pendingApprovalFlag = localStorage.getItem('pending_approval_detected');
    if (pendingApprovalFlag && token) {
      console.log('⏳ AuthContext: Pending approval flag detected, redirecting without API call');
      setState({ user: null, isAuthenticated: false, isLoading: false });
      if (typeof window !== 'undefined') {
        router.push('/pending-approval');
      }
      return;
    }

    if (token) {
      console.log('🔄 AuthContext: Auto-refreshing auth with token');
      refreshAuth();
    } else {
      console.log('🚫 AuthContext: No token found, skipping auth refresh');
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [refreshAuth]);

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
