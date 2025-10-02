// lib/api-client.ts
import { LoginRequest, RegisterRequest, AuthResponse, RegisterResponse, SearchRequest, SearchResponse } from '@/types/auth';

// Mock delay to simulate network requests
const mockDelay = (ms: number = 1000) => new Promise(resolve => setTimeout(resolve, ms));

class ApiClient {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.example.com';

  // Authentication endpoints (your provided specs)
  async login(data: LoginRequest): Promise<AuthResponse> {
    await mockDelay();
    
    // Mock successful login response
    return {
      access_token: "mock_access_token_" + Date.now(),
      refresh_token: "mock_refresh_token_" + Date.now(),
      token_type: "bearer",
      expires_in: 3600,
      user: {
        email: data.email,
        full_name: "John Doe",
        is_active: true,
        id: "user_" + Date.now(),
        organization_id: "org_123",
        roles: ["recruiter"],
        is_admin: false,
        is_approved: true,
        email_verified: true,
        profile_picture_url: "https://via.placeholder.com/150",
        bio: "Experienced recruiter",
        phone_number: "+1234567890",
        location: "San Francisco, CA",
        timezone: "America/Los_Angeles",
        mfa_enabled: false,
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString()
      }
    };
  }

  async register(data: RegisterRequest): Promise<RegisterResponse> {
    await mockDelay();
    
    // Mock successful registration response
    return {
      email: data.email,
      full_name: data.full_name,
      is_active: data.is_active,
      id: "user_" + Date.now(),
      organization_id: data.organization_id,
      roles: ["recruiter"],
      is_admin: false,
      is_approved: true,
      email_verified: false,
      profile_picture_url: "",
      bio: "",
      phone_number: "",
      location: "",
      timezone: "",
      mfa_enabled: false,
      created_at: new Date().toISOString(),
      last_login: new Date().toISOString()
    };
  }

  // TODO: Implement social authentication endpoints
  // These are placeholder mocks - update with actual social auth providers
  async loginWithGoogle(): Promise<AuthResponse> {
    await mockDelay();
    // TODO: Implement Google OAuth flow
    // Endpoint: /auth/google/callback
    throw new Error('Google authentication not implemented yet');
  }

  async loginWithGithub(): Promise<AuthResponse> {
    await mockDelay();
    // TODO: Implement GitHub OAuth flow  
    // Endpoint: /auth/github/callback
    throw new Error('GitHub authentication not implemented yet');
  }

  async loginWithOutlook(): Promise<AuthResponse> {
    await mockDelay();
    // TODO: Implement Microsoft/Outlook OAuth flow
    // Endpoint: /auth/microsoft/callback
    throw new Error('Outlook authentication not implemented yet');
  }

  // TODO: Implement search functionality
  async search(data: SearchRequest): Promise<SearchResponse> {
    await mockDelay(500);
    // TODO: Implement actual search endpoint
    // Endpoint: /search
    return {
      results: [
        { id: 1, title: `Mock result for "${data.query}"`, type: 'candidate' },
        { id: 2, title: `Another result for "${data.query}"`, type: 'job' }
      ],
      total: 2
    };
  }
}

export const apiClient = new ApiClient();
