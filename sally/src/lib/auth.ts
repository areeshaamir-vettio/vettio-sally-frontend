import Cookies from 'js-cookie';
import { jwtVerify } from 'jose';
import { API_CONFIG, API_ENDPOINTS } from './constants';
import { User, LoginResponse } from '@/types/auth';

const API_BASE_URL = API_CONFIG.BASE_URL;

export class AuthService {
  private static readonly ACCESS_TOKEN_KEY = 'access_token';
  private static readonly REFRESH_TOKEN_KEY = 'refresh_token';

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

    // Store tokens in cookies
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

    return data;
  }

  static async refreshToken(): Promise<string> {
    const refreshToken = Cookies.get(this.REFRESH_TOKEN_KEY);
    if (!refreshToken) throw new Error('No refresh token');

    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${refreshToken}`
      },
    });

    if (!response.ok) {
      AuthService.logout();
      throw new Error('Token refresh failed');
    }

    const data = await response.json();
    Cookies.set(this.ACCESS_TOKEN_KEY, data.access_token, {
      expires: 7,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    return data.access_token;
  }

  static logout(): void {
    Cookies.remove(this.ACCESS_TOKEN_KEY);
    Cookies.remove(this.REFRESH_TOKEN_KEY);
  }

  static getAccessToken(): string | undefined {
    return Cookies.get(this.ACCESS_TOKEN_KEY);
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
  static getAccessToken(): string | undefined {
    return AuthService.getAccessToken();
  }

  static getRefreshToken(): string | undefined {
    return Cookies.get('refresh_token');
  }

  static setTokens(accessToken: string, refreshToken: string): void {
    // This is handled by AuthService.login now
    Cookies.set('access_token', accessToken, {
      expires: 7,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    Cookies.set('refresh_token', refreshToken, {
      expires: 30,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
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

  static getTokenExpirationTime(token: string): number | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000; // Convert to milliseconds
    } catch (error) {
      return null;
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
