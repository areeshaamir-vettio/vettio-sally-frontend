import { RegisterRequest, RegisterResponse } from '@/types/auth';

// Mock API client for development
export const mockApiClient = {
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock successful response
    return {
      email: data.email,
      full_name: data.full_name,
      is_active: true,
      id: `user_${Date.now()}`,
      organization_id: `org_${Date.now()}`,
      roles: ["recruiter"],
      is_admin: false,
      is_approved: true,
      email_verified: false,
      created_at: new Date().toISOString(),
    };
  },

  async validateCompanyUrl(url: string): Promise<{ valid: boolean; companyName?: string }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock validation logic
    if (url.includes('example.com') || url.includes('company.com')) {
      return {
        valid: true,
        companyName: 'Example Company Inc.'
      };
    }
    
    return { valid: false };
  }
};
