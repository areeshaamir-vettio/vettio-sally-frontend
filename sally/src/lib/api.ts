import { AuthService, TokenManager } from './auth';

class ApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  }

  async request(endpoint: string, options: RequestInit = {}) {
    let token = AuthService.getAccessToken();

    // Try request with current token
    let response = await this.makeRequest(endpoint, token, options);

    // If unauthorized, try to refresh token
    if (response.status === 401 && token) {
      try {
        // Check if refresh token exists and is valid
        const refreshToken = TokenManager.getRefreshToken();
        if (!refreshToken || TokenManager.isTokenExpired(refreshToken)) {
          console.error('❌ ApiClient: Refresh token missing or expired');
          AuthService.performFullLogout();
          throw new Error('Session expired');
        }

        token = await AuthService.refreshToken();
        response = await this.makeRequest(endpoint, token, options);
      } catch (error: any) {
        console.error('❌ ApiClient: Token refresh failed:', error);

        // Only call performFullLogout if it wasn't already called
        if (!error?.message?.includes('Session expired') &&
            !error?.message?.includes('Refresh token expired')) {
          AuthService.performFullLogout();
        }

        throw new Error('Authentication failed');
      }
    }

    return response;
  }

  private async makeRequest(endpoint: string, token: string | undefined, options: RequestInit) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers,
    });
  }
}

export const apiClient = new ApiClient();
