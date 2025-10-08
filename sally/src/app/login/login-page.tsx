'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { AuthService } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const { loginWithOAuth } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Mock login - in real app would call API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create mock user object
      const mockUser = {
        id: `user_${Date.now()}`,
        email: formData.email,
        full_name: formData.email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        is_active: true,
        organization_id: `org_${Date.now()}`,
        roles: ["recruiter"],
        is_admin: false,
        is_approved: true,
        email_verified: true,
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString(),
      };
      
      // Store mock tokens for API calls to work
      const mockTokenPayload = {
        sub: mockUser.id,
        email: mockUser.email,
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours from now
        iat: Math.floor(Date.now() / 1000),
      };
      const mockToken = `mock.${btoa(JSON.stringify(mockTokenPayload))}.signature`;
      AuthService.storeTokens(mockToken, 'mock_refresh_token');

      loginWithOAuth(mockUser);

      // Check if user has jobs and redirect accordingly
      console.log('🔄 Login - Checking jobs for routing...');
      const { getPostAuthRedirectPath } = await import('@/utils/post-auth-routing');
      const redirectPath = await getPostAuthRedirectPath();
      console.log('🔄 Login - About to redirect to:', redirectPath);
      router.push(redirectPath);
    } catch (error: any) {
      console.error('Login failed:', error);
      setError('Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFA] flex items-center justify-center px-6 py-16">
      <div className="w-96 bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-[#171A1D]">Welcome back</h2>
          <p className="text-gray-700 text-sm mt-2">Sign in to your account</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-red-800 text-sm">{error}</div>
          </div>
        )}

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="flex text-sm font-medium text-[#1D2025]">
              Email
              <span className="text-[#E53E3E] ml-1">*</span>
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="mt-2 flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#8952E0] focus:border-transparent"
              placeholder="Your work email address"
            />
          </div>
          
          <div>
            <label className="flex text-sm font-medium text-[#1D2025]">
              Password
              <span className="text-[#E53E3E] ml-1">*</span>
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="mt-2 flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#8952E0] focus:border-transparent"
              placeholder="Your account password"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#8952E0] text-white py-2 px-4 rounded-md hover:bg-[#7A47CC] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center mt-6">
          <span className="text-gray-700 text-sm">Don't have an account? </span>
          <a href="/landing-page" className="text-[#171A1D] text-sm font-medium hover:underline">
            Sign up
          </a>
        </div>
      </div>
    </div>
  );
}
