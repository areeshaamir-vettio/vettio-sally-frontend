// components/signup-form.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RegisterRequest } from '@/types/auth';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api-client';

// Blocked personal email domains
const BLOCKED_DOMAINS = [
  'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
  'aol.com', 'icloud.com', 'protonmail.com', 'live.com',
  'msn.com', 'yandex.com', 'mail.com', 'zoho.com'
];

// Error mappings for user-friendly messages
const ERROR_MAPPINGS: Record<string, string> = {
  // Organization errors
  'Failed to create organization': 'Unable to set up your organization. This might be a temporary issue. Please try again.',
  'Organization creation failed': 'Unable to set up your organization. Please try again or contact support.',
  'Organization service unavailable': 'Organization service is temporarily unavailable. Please try again later.',

  // Email validation errors
  'Invalid email format': 'Please enter a valid email address',
  'corporate email address': 'Please use your work email. Personal emails (Gmail, Yahoo, etc.) aren\'t supported.',
  'Personal email providers': 'Please use your work email. Personal emails (Gmail, Yahoo, etc.) aren\'t supported.',
  'User with this email already exists': 'An account with this email already exists. Try logging in instead.',
  'already exists': 'An account with this email already exists. Try logging in instead.',

  // Password validation errors
  'Password must be at least 8 characters': 'Password must be at least 8 characters long',
  'Password must contain at least one uppercase letter': 'Password must include at least one uppercase letter (A-Z)',
  'Password must contain at least one lowercase letter': 'Password must include at least one lowercase letter (a-z)',
  'Password must contain at least one digit': 'Password must include at least one number (0-9)',
  'Password must contain at least one number': 'Password must include at least one number (0-9)',

  // Firebase/Auth errors
  'Failed to create user in Firebase Auth': 'Account creation failed. Please try again.',
  'Firebase Auth': 'Account creation failed. Please try again.',

  // Network errors
  'Network error': 'Connection problem. Please check your internet and try again.',
  'fetch': 'Connection problem. Please check your internet and try again.',
};

// Password validation function
const validatePassword = (password: string): string[] => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return errors;
};

// Email validation functions
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

const isPersonalEmail = (email: string): boolean => {
  const domain = email.split('@')[1]?.toLowerCase();
  return BLOCKED_DOMAINS.includes(domain);
};

// Enhanced error parsing function
const parseErrorMessage = (error: unknown): string => {
  if (typeof error === 'string') {
    return getErrorMapping(error);
  }

  if (error instanceof Error) {
    // Try to extract meaningful error from API response
    const message = error.message;

    // Check for specific error patterns
    for (const [key, userMessage] of Object.entries(ERROR_MAPPINGS)) {
      if (message.toLowerCase().includes(key.toLowerCase())) {
        return userMessage;
      }
    }

    return getErrorMapping(message);
  }

  return 'Registration failed. Please try again.';
};

const getErrorMapping = (message: string): string => {
  for (const [key, userMessage] of Object.entries(ERROR_MAPPINGS)) {
    if (message.toLowerCase().includes(key.toLowerCase())) {
      return userMessage;
    }
  }
  return message || 'Registration failed. Please try again.';
};

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

// LinkedIn Icon Component
const LinkedInIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

export function SignUpForm() {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});
  const [showRetry, setShowRetry] = useState(false);
  const [errorType, setErrorType] = useState<'validation' | 'server' | 'network' | null>(null);

  const handlePasswordChange = (password: string) => {
    setFormData({ ...formData, password });
    const errors = validatePassword(password);
    setPasswordErrors(errors);
    // Clear password field error when user starts typing
    if (fieldErrors.password) {
      setFieldErrors(prev => ({ ...prev, password: false }));
    }
  };

  const handleEmailChange = (email: string) => {
    setFormData({ ...formData, email });
    // Clear email field error when user starts typing
    if (fieldErrors.email) {
      setFieldErrors(prev => ({ ...prev, email: false }));
    }
  };

  const handleNameChange = (fullName: string) => {
    setFormData({ ...formData, fullName });
    // Clear name field error when user starts typing
    if (fieldErrors.fullName) {
      setFieldErrors(prev => ({ ...prev, fullName: false }));
    }
  };

  const validateClientSide = (): string[] => {
    const errors: string[] = [];
    const newFieldErrors: Record<string, boolean> = {};

    // Email validation
    if (!formData.email) {
      errors.push('Email is required');
      newFieldErrors.email = true;
    } else if (!isValidEmail(formData.email)) {
      errors.push('Please enter a valid email address');
      newFieldErrors.email = true;
    } else if (isPersonalEmail(formData.email)) {
      errors.push('Please use your work email. Personal emails (Gmail, Yahoo, etc.) aren\'t supported.');
      newFieldErrors.email = true;
    }

    // Password validation
    if (!formData.password) {
      errors.push('Password is required');
      newFieldErrors.password = true;
    } else {
      const passwordValidationErrors = validatePassword(formData.password);
      if (passwordValidationErrors.length > 0) {
        errors.push(...passwordValidationErrors);
        newFieldErrors.password = true;
      }
    }

    // Name validation
    if (!formData.fullName || formData.fullName.trim().length < 2) {
      errors.push('Full name must be at least 2 characters long');
      newFieldErrors.fullName = true;
    }

    setFieldErrors(newFieldErrors);
    return errors;
  };

  const clearMessages = () => {
    setError(null);
    setSuccess(false);
    setShowRetry(false);
    setErrorType(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    clearMessages();

    try {
      // Client-side validation first
      const validationErrors = validateClientSide();
      if (validationErrors.length > 0) {
        setErrorType('validation');
        throw new Error(validationErrors.join('. '));
      }

      const registerData: RegisterRequest = {
        email: formData.email,
        password: formData.password,
        full_name: formData.fullName,
      };

      await register(registerData);
      console.log('Registration successful');
      setSuccess(true);

      // The register function will automatically redirect to get-started page

    } catch (error: unknown) {
      console.error('Registration failed:', error);
      handleRegistrationError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegistrationError = (error: unknown) => {
    let errorMessage = 'Registration failed. Please try again.';
    let shouldShowRetry = false;
    let errorCategory: 'validation' | 'server' | 'network' = 'server';
    const newFieldErrors: Record<string, boolean> = {};

    try {
      // Parse the error message
      errorMessage = parseErrorMessage(error);

      // Determine error type and specific field errors
      if (error instanceof Error) {
        const message = error.message.toLowerCase();

        // Network errors
        if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
          errorCategory = 'network';
          shouldShowRetry = true;
          errorMessage = 'Connection problem. Please check your internet and try again.';
        }
        // Organization creation errors (your specific case)
        else if (message.includes('failed to create organization') || message.includes('organization')) {
          errorCategory = 'server';
          shouldShowRetry = true;
          errorMessage = 'Unable to set up your organization. This might be a temporary issue. Please try again.';
        }
        // Email-related errors
        else if (message.includes('email') || message.includes('already exists')) {
          errorCategory = 'validation';
          newFieldErrors.email = true;
          if (message.includes('already exists')) {
            errorMessage = 'An account with this email already exists. Try logging in instead.';
          }
        }
        // Password-related errors
        else if (message.includes('password')) {
          errorCategory = 'validation';
          newFieldErrors.password = true;
        }
        // Firebase/Auth errors
        else if (message.includes('firebase') || message.includes('auth')) {
          errorCategory = 'server';
          shouldShowRetry = true;
          errorMessage = 'Account creation failed. Please try again.';
        }
        // Server errors (500, etc.)
        else if (message.includes('server') || message.includes('internal')) {
          errorCategory = 'server';
          shouldShowRetry = true;
          errorMessage = 'Server error. Please try again later.';
        }
      }
    } catch (parseError) {
      console.warn('Error parsing registration error:', parseError);
      errorCategory = 'server';
      shouldShowRetry = true;
    }

    setError(errorMessage);
    setErrorType(errorCategory);
    setShowRetry(shouldShowRetry);
    setFieldErrors(prev => ({ ...prev, ...newFieldErrors }));
  };

  const handleRetry = () => {
    clearMessages();
    setFieldErrors({});
  };

  const handleSocialAuth = async (provider: 'google' | 'github' | 'linkedin') => {
    try {
      setSocialLoading(provider);
      switch (provider) {
        case 'google':
          await apiClient.loginWithGoogle();
          break;
        case 'github':
          await apiClient.loginWithGithub();
          break;
        case 'linkedin':
          await apiClient.loginWithLinkedIn();
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

      {/* Success Message */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="text-green-800 text-sm">
            ✅ Registration successful! Please check your email for verification. Redirecting...
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className={`mb-6 p-4 border rounded-lg ${
          errorType === 'network' ? 'bg-yellow-50 border-yellow-200' :
          errorType === 'validation' ? 'bg-red-50 border-red-200' :
          'bg-orange-50 border-orange-200'
        }`}>
          <div className={`text-sm font-medium mb-2 ${
            errorType === 'network' ? 'text-yellow-800' :
            errorType === 'validation' ? 'text-red-800' :
            'text-orange-800'
          }`}>
            {errorType === 'network' ? '🌐 Connection Issue' :
             errorType === 'validation' ? '⚠️ Validation Error' :
             '🔧 Server Issue'}
          </div>
          <div className={`text-sm ${
            errorType === 'network' ? 'text-yellow-700' :
            errorType === 'validation' ? 'text-red-700' :
            'text-orange-700'
          }`}>
            {error}
          </div>
          {showRetry && (
            <button
              onClick={handleRetry}
              className={`mt-3 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                errorType === 'network' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' :
                'bg-orange-100 text-orange-800 hover:bg-orange-200'
              }`}
            >
              Try Again
            </button>
          )}
        </div>
      )}

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
          onClick={() => handleSocialAuth('linkedin')}
          disabled={socialLoading === 'linkedin'}
        >
          <LinkedInIcon />
          {socialLoading === 'linkedin' ? 'Connecting...' : 'Continue with LinkedIn'}
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
        <div className={`form-field ${fieldErrors.fullName ? 'error' : ''}`}>
          <Input
            label="Full Name"
            type="text"
            required
            value={formData.fullName}
            onChange={(e) => handleNameChange(e.target.value)}
            helpText="Your full name"
            className={fieldErrors.fullName ? 'border-red-500 focus:border-red-500' : ''}
          />
        </div>

        <div className={`form-field ${fieldErrors.email ? 'error' : ''}`}>
          <Input
            label="Work Email"
            type="email"
            required
            value={formData.email}
            onChange={(e) => handleEmailChange(e.target.value)}
            helpText="Use your company email address (not Gmail, Yahoo, etc.)"
            className={fieldErrors.email ? 'border-red-500 focus:border-red-500' : ''}
          />
        </div>

        <div className={`form-field ${fieldErrors.password ? 'error' : ''}`}>
          <Input
            label="Password"
            type="password"
            required
            value={formData.password}
            onChange={(e) => handlePasswordChange(e.target.value)}
            helpText="Must be 8+ characters with uppercase, lowercase, and number"
            className={fieldErrors.password ? 'border-red-500 focus:border-red-500' : ''}
          />
        </div>

        {/* Password validation feedback */}
        {formData.password && (
          <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="text-gray-800 text-sm font-medium mb-2">Password requirements:</div>
            <div className="space-y-1">
              {[
                { check: formData.password.length >= 8, text: 'At least 8 characters' },
                { check: /[A-Z]/.test(formData.password), text: 'One uppercase letter' },
                { check: /[a-z]/.test(formData.password), text: 'One lowercase letter' },
                { check: /\d/.test(formData.password), text: 'One number' },
                { check: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password), text: 'One special character' },
              ].map((requirement, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  {requirement.check ? (
                    <span className="text-green-500 font-bold">✓</span>
                  ) : (
                    <span className="text-red-500 font-bold">✗</span>
                  )}
                  <span className={requirement.check ? 'text-green-700' : 'text-red-700'}>
                    {requirement.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading || (passwordErrors.length > 0 && formData.password.length > 0)}
        >
          {isLoading ? 'Creating Account...' :
           passwordErrors.length > 0 && formData.password.length > 0 ? 'Fix Password Requirements' :
           'Create Account'}
        </Button>

        {/* Additional help text for common issues */}
        {errorType === 'validation' && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-blue-800 text-sm font-medium mb-1">💡 Common Issues:</div>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• Make sure to use your work email (not Gmail, Yahoo, etc.)</li>
              <li>• Password needs uppercase, lowercase, and numbers</li>
              <li>• Check if you already have an account</li>
            </ul>
          </div>
        )}

        {errorType === 'server' && (
          <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="text-purple-800 text-sm font-medium mb-1">🔧 Server Issue</div>
            <div className="text-purple-700 text-sm">
              We&apos;re experiencing technical difficulties. This is usually temporary.
              Please try again in a few moments or contact support if the issue persists.
            </div>
          </div>
        )}
      </form>

      {/* Footer Link */}
      <div className="text-center mt-6">
        <span className="text-[#7D7F83] text-sm">Already have an account? </span>
        <a href="/login" className="text-[#171A1D] text-sm font-medium hover:underline">
          Log in
        </a>
      </div>
    </div>
  );
}
