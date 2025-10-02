// types/auth.ts
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  full_name: string;
  is_active: boolean;
  password: string;
  organization_id: string;
}

export interface User {
  email: string;
  full_name: string;
  is_active: boolean;
  id: string;
  organization_id: string;
  roles: string[];
  is_admin: boolean;
  is_approved: boolean;
  email_verified: boolean;
  profile_picture_url: string;
  bio: string;
  phone_number: string;
  location: string;
  timezone: string;
  mfa_enabled: boolean;
  created_at: string;
  last_login: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface RegisterResponse extends User {}

// Search types (placeholder for future implementation)
export interface SearchRequest {
  query: string;
  filters?: Record<string, any>;
}

export interface SearchResponse {
  results: any[];
  total: number;
}
