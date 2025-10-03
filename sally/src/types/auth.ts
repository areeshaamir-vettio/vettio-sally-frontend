// types/auth.ts

// Core User interface matching backend structure
export interface User {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  organization_id?: string;
  roles: string[];
  is_admin: boolean;
  is_approved: boolean;
  email_verified: boolean;
  created_at: string;
  last_login?: string;
}

// Authentication request/response types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

// Legacy interfaces for backward compatibility
export interface AuthResponse extends LoginResponse {}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
}

// Corporate registration request (with email validation and organization management)
export interface CorporateRegisterRequest {
  email: string;
  full_name: string;
  is_active: boolean;
  password: string;
  organization_id?: string; // Optional - will be created if first user from domain
}

export interface RegisterResponse extends User {}

// Authentication state for React context
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Search types (placeholder for future implementation)
export interface SearchRequest {
  query: string;
  filters?: Record<string, any>;
}

export interface SearchResponse {
  results: any[];
  total: number;
}

export interface CompanyOnboardingData {
  companyUrl: string;
}

// API Response Wrapper Types
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status: number;
  timestamp: string;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  message?: string;
  status: number;
  timestamp: string;
}

// Error Types
export interface ApiErrorResponse {
  error: {
    message: string;
    code?: string;
    details?: any;
    errors?: Record<string, string[]>;
  };
  status: number;
  timestamp: string;
  path?: string;
}

export interface ValidationErrorResponse {
  error: {
    message: string;
    code: 'VALIDATION_ERROR';
    errors: Record<string, string[]>;
  };
  status: 422;
  timestamp: string;
  path?: string;
}

// Request/Response Types for Authentication
export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface LogoutRequest {
  refresh_token?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirm_password: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface UpdateProfileRequest {
  full_name?: string;
  bio?: string;
  phone_number?: string;
  location?: string;
  timezone?: string;
}

// Social Authentication Types
export interface SocialAuthResponse extends AuthResponse {}

// Organization Types
export interface Organization {
  id: string;
  name: string;
  description?: string;
  website?: string;
  logo_url?: string;
  industry?: string;
  size?: string;
  location?: string;
  created_at: string;
  updated_at: string;
}

// Enhanced User Type with additional fields
export interface UserProfile extends User {
  organization?: Organization;
  permissions?: string[];
  last_activity?: string;
  preferences?: Record<string, any>;
}
