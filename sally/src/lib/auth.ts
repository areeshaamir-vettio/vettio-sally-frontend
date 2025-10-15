import Cookies from 'js-cookie';
import { jwtVerify } from 'jose';
import { API_CONFIG, API_ENDPOINTS } from './constants';
import { User, LoginResponse } from '@/types/auth';

const API_BASE_URL = API_CONFIG.BASE_URL;

export class AuthService {
  private static readonly ACCESS_TOKEN_KEY = 'access_token';
  private static readonly REFRESH_TOKEN_KEY = 'refresh_token';

  static async login(email: string, password: string): Promise<LoginResponse> {
    console.log('🔄 AuthService.login: Starting login request...');
    console.log('🌐 AuthService.login: API URL:', `${API_BASE_URL}${API_ENDPOINTS.AUTH.LOGIN}`);
    console.log('🌐 AuthService.login: Base URL from env:', process.env.NEXT_PUBLIC_API_URL);
    console.log('📧 AuthService.login: Email:', email);

    // Check if API URL is accessible
    if (!API_BASE_URL || API_BASE_URL === 'undefined') {
      throw new Error('API URL is not configured. Please check your environment variables.');
    }

    let response: Response;
    try {
      // Create a timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Login request timeout after 15 seconds')), 15000);
      });

      // Race between fetch and timeout
      response = await Promise.race([
        fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.LOGIN}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        }),
        timeoutPromise
      ]);

      console.log('📡 AuthService.login: Response status:', response.status);
      console.log('📡 AuthService.login: Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ AuthService.login: Error response text:', errorText);

        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (parseError) {
          console.error('❌ AuthService.login: Failed to parse error response:', parseError);
          errorData = { message: `HTTP ${response.status}: ${response.statusText}` };
        }

        console.error('❌ AuthService.login: Login failed:', errorData);
        throw new Error(errorData.message || `Login failed with status ${response.status}`);
      }
    } catch (networkError) {
      console.error('❌ AuthService.login: Network error:', networkError);
      if (networkError instanceof TypeError && networkError.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to server. Please check your internet connection.');
      }
      throw networkError;
    }

    const data: LoginResponse = await response.json();
    console.log('✅ AuthService.login: Login response received');

    // Store tokens in cookies
    console.log('🔑 AuthService.login: Storing tokens...');
    Cookies.set(this.ACCESS_TOKEN_KEY, data.access_token, {
      expires: 7,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    Cookies.set(this.REFRESH_TOKEN_KEY, data.refresh_token, {
      expires: 30,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    console.log('✅ AuthService.login: Tokens stored successfully');
    return data;
  }

  static async refreshToken(): Promise<string> {
    const refreshToken = Cookies.get(this.REFRESH_TOKEN_KEY);
    if (!refreshToken) {
      console.error('❌ No refresh token available');
      throw new Error('No refresh token available');
    }

    // Check if refresh token is expired before attempting refresh
    if (TokenManager.isTokenExpired(refreshToken)) {
      console.error('❌ Refresh token has expired');
      // Both tokens are expired, perform full logout
      this.performFullLogout();
      throw new Error('Refresh token expired');
    }

    console.log('🔄 Attempting to refresh token...');

    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh_token: refreshToken  // ✅ Correct field name for backend
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Token refresh failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });

        // Only logout if refresh token is invalid (401/403)
        // For other errors (500, network), keep the user logged in
        if (response.status === 401 || response.status === 403) {
          console.error('❌ Refresh token is invalid or expired, logging out...');
          this.performFullLogout();
        }

        throw new Error(errorData.message || 'Token refresh failed');
      }

      const data = await response.json();
      console.log('✅ Token refreshed successfully');

      // Store the new access token with longer expiration
      Cookies.set(this.ACCESS_TOKEN_KEY, data.access_token, {
        expires: 7, // Cookie expires in 7 days
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });

      // Also update refresh token if provided
      if (data.refresh_token) {
        Cookies.set(this.REFRESH_TOKEN_KEY, data.refresh_token, {
          expires: 30, // Cookie expires in 30 days
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        });
      }

      return data.access_token;
    } catch (error) {
      console.error('❌ Token refresh error:', error);
      throw error;
    }
  }

  /**
   * Perform a full logout - clear tokens and redirect to login page
   * This should be called when both access and refresh tokens are expired/invalid
   */
  static performFullLogout(): void {
    console.log('🚪 Performing full logout - clearing tokens and redirecting to login');

    // Clear tokens
    this.logout();

    // Redirect to login page if in browser
    if (typeof window !== 'undefined') {
      // Store the current path to redirect back after login (optional)
      const currentPath = window.location.pathname;
      const publicPaths = ['/login', '/signup', '/', '/pending-approval'];

      if (!publicPaths.includes(currentPath)) {
        sessionStorage.setItem('redirectAfterLogin', currentPath);
      }

      window.location.href = '/login';
    }
  }

  static logout(): void {
    Cookies.remove(this.ACCESS_TOKEN_KEY);
    Cookies.remove(this.REFRESH_TOKEN_KEY);
  }

  static storeTokens(accessToken: string, refreshToken: string): void {
    // Store tokens in cookies
    Cookies.set(this.ACCESS_TOKEN_KEY, accessToken, {
      expires: 7,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    Cookies.set(this.REFRESH_TOKEN_KEY, refreshToken, {
      expires: 30,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
  }

  static getAccessToken(): string | undefined {
    return Cookies.get(this.ACCESS_TOKEN_KEY);
  }

  static async isTokenValid(): Promise<boolean> {
    const token = this.getAccessToken();
    console.log('🔍 AuthService: Checking token validity...');
    console.log('🎫 AuthService: Token exists:', !!token);

    if (!token) {
      console.log('❌ AuthService: No token found');
      return false;
    }

    try {
      // For development, we'll skip JWT verification since we don't have the secret
      // In production, you should verify the JWT properly
      if (process.env.NODE_ENV === 'development') {
        console.log('🔧 AuthService: Development mode - checking token expiration');
        // Simple expiration check by decoding the payload
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Date.now() / 1000;
        const isValid = payload.exp > currentTime;
        console.log('⏰ AuthService: Token expires at:', new Date(payload.exp * 1000));
        console.log('⏰ AuthService: Current time:', new Date(currentTime * 1000));
        console.log('✅ AuthService: Token valid:', isValid);
        return isValid;
      }

      // For production with proper JWT secret
      const secret = new TextEncoder().encode(process.env.NEXT_PUBLIC_JWT_SECRET);
      await jwtVerify(token, secret);
      console.log('✅ AuthService: Token valid (production)');
      return true;
    } catch (error) {
      console.log('❌ AuthService: Token validation failed:', error);
      return false;
    }
  }
}

// Legacy compatibility - keeping minimal implementations for existing code
export class TokenManager {
  static getAccessToken(): string | undefined {
    return AuthService.getAccessToken();
  }

  static getRefreshToken(): string | undefined {
    return Cookies.get('refresh_token');
  }

  static setTokens(accessToken: string, refreshToken: string): void {
    // This is handled by AuthService.login now
    console.warn('TokenManager.setTokens is deprecated, use AuthService.login instead');
  }

  static clearTokens(): void {
    AuthService.logout();
  }

  static isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      return true;
    }
  }
}

// Legacy compatibility for existing code
export class AuthUtils {
  static isAuthenticated(): boolean {
    const token = TokenManager.getAccessToken();
    return token !== undefined && !TokenManager.isTokenExpired(token);
  }

  static logout(): void {
    AuthService.logout();

    // Redirect to login page if we're in the browser
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }

  static getAuthHeaders(): Record<string, string> {
    const token = TokenManager.getAccessToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
}

// Session Management
export class SessionManager {
  private static sessionTimer: NodeJS.Timeout | null = null;

  static startSessionTimer(onSessionExpired: () => void): void {
    this.clearSessionTimer();
    
    this.sessionTimer = setTimeout(() => {
      onSessionExpired();
    }, 30 * 60 * 1000); // 30 minutes
  }

  static clearSessionTimer(): void {
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
      this.sessionTimer = null;
    }
  }

  static resetSessionTimer(onSessionExpired: () => void): void {
    this.startSessionTimer(onSessionExpired);
  }
}

// Utility function to format user display name
export function getUserDisplayName(user: User | null): string {
  if (!user) return 'Guest';
  return user.full_name || user.email || 'User';
}

// Utility function to get user initials for avatar
export function getUserInitials(user: User | null): string {
  if (!user?.full_name) return 'U';
  
  const names = user.full_name.split(' ');
  if (names.length >= 2) {
    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
  }
  return names[0][0].toUpperCase();
}
