'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { OAuthService } from '@/lib/oauth';
import { useAuth } from '@/contexts/AuthContext';

interface CallbackState {
  status: 'loading' | 'success' | 'error';
  message: string;
}

export default function OAuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginWithOAuth } = useAuth();
  
  const [state, setState] = useState<CallbackState>({
    status: 'loading',
    message: 'Processing authentication...'
  });

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        console.log('🔍 OAuth Callback - Current URL:', window.location.href);
        console.log('🔍 OAuth Callback - Search params:', searchParams.toString());

        // Get parameters from URL
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        console.log('🔍 OAuth Callback - Code:', code);
        console.log('🔍 OAuth Callback - State:', state);
        console.log('🔍 OAuth Callback - Error:', error);

        // Handle OAuth errors
        if (error) {
          throw new Error(errorDescription || `OAuth Error: ${error}`);
        }

        // Validate required parameters
        if (!code || !state) {
          throw new Error('Missing authorization code or state parameter');
        }

        setState({
          status: 'loading',
          message: 'Exchanging authorization code for tokens...'
        });

        // Handle OAuth callback
        console.log('🔄 OAuth Callback - Calling handleOAuthCallback...');
        const tokenData = await OAuthService.handleOAuthCallback(code, state);
        console.log('✅ OAuth Callback - Token data received:', tokenData);

        setState({
          status: 'loading',
          message: 'Authentication successful! Redirecting...'
        });

        // Update auth context with user data
        console.log('🔄 OAuth Callback - Updating auth context...');
        loginWithOAuth(tokenData.user);

        setState({
          status: 'success',
          message: 'Authentication successful!'
        });

        // Check if user has jobs and redirect accordingly
        setTimeout(async () => {
          console.log('🔄 OAuth Callback - Checking jobs for routing...');
          const { getPostAuthRedirectPath } = await import('@/utils/post-auth-routing');
          const redirectPath = await getPostAuthRedirectPath();
          console.log('🔄 OAuth Callback - About to redirect to:', redirectPath);
          router.push(redirectPath);
        }, 2000);

      } catch (error) {
        console.error('OAuth callback error:', error);
        setState({
          status: 'error',
          message: error instanceof Error ? error.message : 'Authentication failed'
        });

        // Redirect to login page after error
        setTimeout(() => {
          router.push('/login?error=oauth_failed');
        }, 3000);
      }
    };

    // Only run if we have search params
    if (searchParams.toString()) {
      handleOAuthCallback();
    }
  }, [searchParams, router, loginWithOAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {state.status === 'loading' && 'Authenticating...'}
            {state.status === 'success' && 'Success!'}
            {state.status === 'error' && 'Authentication Failed'}
          </h2>
          
          <div className="mt-4">
            {state.status === 'loading' && (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            )}
            
            {state.status === 'success' && (
              <div className="text-green-600">
                <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
            
            {state.status === 'error' && (
              <div className="text-red-600">
                <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            )}
          </div>
          
          <p className="mt-2 text-sm text-gray-600">
            {state.message}
          </p>
          
          {state.status === 'error' && (
            <div className="mt-4">
              <button
                onClick={() => router.push('/login')}
                className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
              >
                Return to login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
