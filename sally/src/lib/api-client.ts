// lib/api-client.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import {
  LoginRequest,
  RegisterRequest,
  CorporateRegisterRequest,
  AuthResponse,
  RegisterResponse,
  SearchRequest,
  SearchResponse,
  RefreshTokenRequest,
  RefreshTokenResponse
} from '@/types/auth';
import { CreateRoleRequest, Role } from '@/types/roles'; 
import { API_CONFIG, API_ENDPOINTS } from './constants';
import { AuthService, TokenManager, AuthUtils } from './auth';
import { ErrorHandler, ApiError } from './errors';

class ApiClient {
  private axiosInstance: AxiosInstance;
  private baseUrl = API_CONFIG.BASE_URL;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor to add auth token
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = TokenManager.getAccessToken();
        console.log('🔍 API Request interceptor - Token available:', !!token);

        if (token) {
          const isExpired = TokenManager.isTokenExpired(token);
          console.log('🔍 API Request interceptor - Token expired:', isExpired);

          if (!isExpired) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('✅ API Request interceptor - Added Authorization header');
          } else {
            console.log('⚠️ API Request interceptor - Token expired, not adding header');
          }
        } else {
          console.log('❌ API Request interceptor - No token available');
        }

        console.log('📤 API Request:', config.method?.toUpperCase(), config.url);
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling and token refresh
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = TokenManager.getRefreshToken();
            if (refreshToken) {
              // Use AuthService.refreshToken which handles the correct API call
              const newAccessToken = await AuthService.refreshToken();

              // Retry original request with new token
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
              return this.axiosInstance(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, logout user
            AuthUtils.logout();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(ErrorHandler.handleAxiosError(error));
      }
    );
  }

  private async request<T = any>(
    endpoint: string,
    options: AxiosRequestConfig = {}
  ): Promise<T> {
    try {
      const response: AxiosResponse<any> = await this.axiosInstance({
        url: endpoint,
        ...options,
      });

      // Handle different response structures
      if (response.data?.data !== undefined) {
        return response.data.data;
      }

      return response.data;
    } catch (error) {
      throw ErrorHandler.handleAxiosError(error as any);
    }
  }

  // Authentication endpoints
  async login(data: LoginRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      data,
    });
  }

  async register(data: RegisterRequest): Promise<RegisterResponse> {
    return this.request<RegisterResponse>(API_ENDPOINTS.AUTH.REGISTER, {
      method: 'POST',
      data,
    });
  }

  /**
   * Register a new user with corporate email validation and organization management.
   *
   * This endpoint:
   * - Validates corporate email address
   * - Creates organization if first user from domain
   * - Creates user with appropriate admin status
   * - Sends email verification
   *
   * @param data Corporate registration data
   * @returns Created user data
   * @throws ApiError if registration fails
   */
  async registerCorporate(data: CorporateRegisterRequest): Promise<RegisterResponse> {
    return this.request<RegisterResponse>(API_ENDPOINTS.AUTH.CORPORATE_REGISTER, {
      method: 'POST',
      data,
    });
  }

  async refreshToken(data: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    return this.request<RefreshTokenResponse>(API_ENDPOINTS.AUTH.REFRESH, {
      method: 'POST',
      data,
    });
  }

  // Public method for testing purposes
  async makeRequest<T = any>(endpoint: string, options: AxiosRequestConfig = {}): Promise<T> {
    return this.request<T>(endpoint, options);
  }

  // Social authentication endpoints
  async loginWithGoogle(): Promise<AuthResponse> {
    return this.request<AuthResponse>(API_ENDPOINTS.AUTH.GOOGLE, {
      method: 'POST',
    });
  }

  async loginWithGithub(): Promise<AuthResponse> {
    return this.request<AuthResponse>(API_ENDPOINTS.AUTH.GITHUB, {
      method: 'POST',
    });
  }

  async loginWithLinkedIn(): Promise<AuthResponse> {
    return this.request<AuthResponse>(API_ENDPOINTS.AUTH.LINKEDIN, {
      method: 'POST',
    });
  }

  // Search functionality
  async search(data: SearchRequest): Promise<SearchResponse> {
    return this.request<SearchResponse>(API_ENDPOINTS.SEARCH.GLOBAL, {
      method: 'POST',
      data,
    });
  }

  // Additional authentication methods
  async logout(): Promise<void> {
    const refreshToken = TokenManager.getRefreshToken();
    if (refreshToken) {
      try {
        await this.request(API_ENDPOINTS.AUTH.LOGOUT, {
          method: 'POST',
          data: { refresh_token: refreshToken },
        });
      } catch (error) {
        // Log error but don't throw - logout should always succeed locally
        console.error('Logout API call failed:', error);
      }
    }

    // Always clear local tokens regardless of API call result
    TokenManager.clearTokens();
  }

  async forgotPassword(email: string): Promise<void> {
    return this.request(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, {
      method: 'POST',
      data: { email },
    });
  }

  async resetPassword(token: string, password: string, confirmPassword: string): Promise<void> {
    return this.request(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
      method: 'POST',
      data: {
        token,
        password,
        confirm_password: confirmPassword
      },
    });
  }

  async verifyEmail(token: string): Promise<void> {
    return this.request(API_ENDPOINTS.AUTH.VERIFY_EMAIL, {
      method: 'POST',
      data: { token },
    });
  }


  // Role/Intake endpoints
  async createRole(data: CreateRoleRequest): Promise<Role> {
    console.log('📝 Creating role with data:', data);

    try {
      const response = await this.request<Role>(API_ENDPOINTS.INTAKE.CREATE, {
        method: 'POST',
        data,
      });

      console.log('✅ Role created successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to create role:', error);
      throw error;
    }
  }

  async getRole(id: string): Promise<Role> {
    console.log('🔍 Fetching role with ID:', id);

    try {
      const response = await this.request<Role>(API_ENDPOINTS.INTAKE.GET(id), {
        method: 'GET',
      });

      console.log('✅ Role fetched successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to fetch role:', error);
      throw error;
    }
  }

  async updateRole(id: string, data: Partial<CreateRoleRequest>): Promise<Role> {
    console.log('📝 Updating role with ID:', id, 'Data:', data);

    try {
      const response = await this.request<Role>(API_ENDPOINTS.INTAKE.GET(id), {
        method: 'PUT',
        data,
      });

      console.log('✅ Role updated successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to update role:', error);
      throw error;
    }
  }

  async listRoles(): Promise<Role[]> {
    console.log('📋 Fetching roles list');

    try {
      const response = await this.request<Role[]>(API_ENDPOINTS.INTAKE.LIST, {
        method: 'GET',
      });

      console.log('✅ Roles list fetched successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to fetch roles list:', error);
      throw error;
    }
  }


}

export const apiClient = new ApiClient();
