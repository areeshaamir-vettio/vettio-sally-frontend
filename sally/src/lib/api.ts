import { AuthService } from './auth';

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
        token = await AuthService.refreshToken();
        response = await this.makeRequest(endpoint, token, options);
      } catch {
        AuthService.logout();
        window.location.href = '/login';
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
