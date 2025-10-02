// components/signup-form.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiClient } from '@/lib/api-client';
import { RegisterRequest } from '@/types/auth';
import { Mail } from 'lucide-react';

// Google Icon Component
const GoogleIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24">
    <path
      fill="currentColor"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="currentColor"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="currentColor"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="currentColor"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

// GitHub Icon Component
const GitHubIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
);

export function SignUpForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const registerData: RegisterRequest = {
        email: formData.email,
        password: formData.password,
        full_name: formData.fullName,
        is_active: true,
        organization_id: 'default_org', // TODO: Allow user to select organization
      };

      const response = await apiClient.register(registerData);
      console.log('Registration successful:', response);
      // TODO: Handle successful registration (redirect, show success message, etc.)
    } catch (error) {
      console.error('Registration failed:', error);
      // TODO: Handle registration error (show error message)
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialAuth = async (provider: 'google' | 'github' | 'outlook') => {
    try {
      setSocialLoading(provider);
      switch (provider) {
        case 'google':
          await apiClient.loginWithGoogle();
          break;
        case 'github':
          await apiClient.loginWithGithub();
          break;
        case 'outlook':
          await apiClient.loginWithOutlook();
          break;
      }
    } catch (error) {
      console.error(`${provider} authentication failed:`, error);
      // TODO: Handle social auth error
    } finally {
      setSocialLoading(null);
    }
  };

  return (
    <div className="w-96 bg-white rounded-lg shadow-lg p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-[#171A1D]">Sign up for free</h2>
      </div>

      {/* Social Auth Buttons */}
      <div className="space-y-3 mb-6">
        <Button
          variant="outline"
          className="w-full flex items-center gap-2"
          onClick={() => handleSocialAuth('google')}
          disabled={socialLoading === 'google'}
        >
          <GoogleIcon />
          {socialLoading === 'google' ? 'Connecting...' : 'Continue with Google'}
        </Button>
        <Button
          variant="outline"
          className="w-full flex items-center gap-2"
          onClick={() => handleSocialAuth('github')}
          disabled={socialLoading === 'github'}
        >
          <GitHubIcon />
          {socialLoading === 'github' ? 'Connecting...' : 'Continue with Github'}
        </Button>
        <Button
          variant="outline"
          className="w-full flex items-center gap-2"
          onClick={() => handleSocialAuth('outlook')}
          disabled={socialLoading === 'outlook'}
        >
          <Mail className="w-4 h-4" />
          {socialLoading === 'outlook' ? 'Connecting...' : 'Continue with Outlook'}
        </Button>
      </div>

      {/* Divider */}
      <div className="flex items-center my-6">
        <hr className="flex-1 border-gray-300" />
        <span className="px-4 text-[#7D7F83] text-sm">or continue with</span>
        <hr className="flex-1 border-gray-300" />
      </div>

      {/* Email/Password Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email"
          type="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          helpText="Help text"
        />
        
        <Input
          label="Password"
          type="password"
          required
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          helpText="Help text"
        />

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? 'Signing up...' : 'Sign up'}
        </Button>
      </form>

      {/* Footer Link */}
      <div className="text-center mt-6">
        <span className="text-[#7D7F83] text-sm">Already have an account? </span>
        <a href="#" className="text-[#171A1D] text-sm font-medium hover:underline">
          Log in
        </a>
      </div>
    </div>
  );
}
