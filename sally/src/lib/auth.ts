import { jwtVerify } from 'jose';
import { API_CONFIG, API_ENDPOINTS } from './constants';
import { User, LoginResponse } from '@/types/auth';

const API_BASE_URL = API_CONFIG.BASE_URL;

interface TokenRefreshRequest {
  refresh_token: string;
}

interface TokenRefreshResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export class AuthService {
  private static readonly ACCESS_TOKEN_KEY = 'access_token';
  private static readonly REFRESH_TOKEN_KEY = 'refresh_token';

  static getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  static getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  static setTokens(accessToken: string, refreshToken: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
  }

  static clearTokens(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  static async login(email: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.LOGIN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Login failed');
    }

    const data: LoginResponse = await response.json();

    // Store tokens in localStorage
    this.setTokens(data.access_token, data.refresh_token);

    return data;
  }

  static async refreshToken(): Promise<string> {
    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      this.logout();
      throw new Error('No refresh token available');
    }

    console.log('🔄 Attempting token refresh...');

    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refresh_token: refreshToken  // ✅ Correct field name for your backend
      } as TokenRefreshRequest),
    });

    if (!response.ok) {
      console.error('❌ Token refresh failed:', response.status, response.statusText);

      // Log response body for debugging
      try {
        const errorData = await response.json();
        console.error('Error details:', errorData);
      } catch (e) {
        console.error('Could not parse error response');
      }

      this.logout();
      throw new Error('Token refresh failed');
    }

    const data: TokenRefreshResponse = await response.json();

    // Update access token (keep same refresh token)
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.ACCESS_TOKEN_KEY, data.access_token);
    }

    console.log('✅ Token refreshed successfully');
    return data.access_token;
  }

  static logout(): void {
    this.clearTokens();
  }

  static async isTokenValid(): Promise<boolean> {
    const token = this.getAccessToken();
    if (!token) return false;

    try {
      // For development, we'll skip JWT verification since we don't have the secret
      // In production, you should verify the JWT properly
      if (process.env.NODE_ENV === 'development') {
        // Simple expiration check by decoding the payload
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Date.now() / 1000;
        return payload.exp > currentTime;
      }

      // For production with proper JWT secret
      const secret = new TextEncoder().encode(process.env.NEXT_PUBLIC_JWT_SECRET);
      await jwtVerify(token, secret);
      return true;
    } catch {
      return false;
    }
  }
}

// Legacy compatibility - keeping minimal implementations for existing code
export class TokenManager {
  static getAccessToken(): string | null {
    return AuthService.getAccessToken();
  }

  static getRefreshToken(): string | null {
    return AuthService.getRefreshToken();
  }

  static setTokens(accessToken: string, refreshToken: string): void {
    AuthService.setTokens(accessToken, refreshToken);
  }

  static clearTokens(): void {
    AuthService.clearTokens();
  }

  static isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch {
      return true;
    }
  }

  static getTokenExpirationTime(token: string): number | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000; // Convert to milliseconds
    } catch {
      return null;
    }
  }
}

// Legacy compatibility for existing code
export class AuthUtils {
  static isAuthenticated(): boolean {
    const token = TokenManager.getAccessToken();
    return token !== null && !TokenManager.isTokenExpired(token);
  }

  static logout(): void {
    AuthService.logout();

    // Redirect to landing page if we're in the browser
    if (typeof window !== 'undefined') {
      window.location.href = '/landing-page';
    }
  }

  static getAuthHeaders(): Record<string, string> {
    const token = TokenManager.getAccessToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
}

// Utility functions
export function getUserDisplayName(user: User | null): string {
  if (!user) return 'Guest';
  return user.full_name || user.email || 'User';
}

export function getUserInitials(user: User | null): string {
  if (!user?.full_name) return 'U';

  const names = user.full_name.split(' ');
  if (names.length >= 2) {
    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
  }
  return names[0][0].toUpperCase();
}
