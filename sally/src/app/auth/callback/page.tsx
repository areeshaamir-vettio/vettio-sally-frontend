'use client';

import { useEffect, useState, useRef } from 'react';
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

  // Prevent multiple callback processing
  const hasProcessedRef = useRef(false);
  const isRedirectingRef = useRef(false);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      // Prevent multiple processing of the same callback
      if (hasProcessedRef.current || isRedirectingRef.current) {
        console.log('🚫 OAuth Callback - Already processed or redirecting, skipping');
        return;
      }

      hasProcessedRef.current = true;

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

        // Check approval status immediately (no delay)
        (async () => {
          // Prevent multiple redirects
          if (isRedirectingRef.current) {
            console.log('🚫 OAuth Callback - Already redirecting, skipping');
            return;
          }

          isRedirectingRef.current = true;

          try {
            console.log('🔄 OAuth Callback - Checking user approval status...');
            const { AuthService } = await import('@/lib/auth');
            const { API_CONFIG, API_ENDPOINTS } = await import('@/lib/constants');

            const token = AuthService.getAccessToken();
            const fullUrl = `${API_CONFIG.BASE_URL}${API_ENDPOINTS.AUTH.ME}`;
            console.log('📡 OAuth Callback: Checking approval status at:', fullUrl);

            const meResponse = await fetch(fullUrl, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
            });

            console.log('📡 OAuth Callback: /me response status:', meResponse.status);

            if (meResponse.status === 403) {
              console.log('⏳ OAuth Callback: Got 403 from /me endpoint - account pending approval');
              router.push('/pending-approval');
              return;
            }

            if (!meResponse.ok) {
              console.log('⚠️ OAuth Callback: /me endpoint failed with status:', meResponse.status);
              // For other errors, proceed with normal routing as fallback
            }

            // If /me endpoint succeeds, user is approved, proceed with normal routing
            console.log('✅ OAuth Callback: User is approved, proceeding with post-auth routing...');
            const { getPostAuthRedirectPath } = await import('@/utils/post-auth-routing');
            const redirectPath = await getPostAuthRedirectPath();
            console.log('🔄 OAuth Callback - About to redirect to:', redirectPath);
            router.push(redirectPath);
          } catch (routingError) {
            // Check if this is a pending approval error
            if (routingError instanceof Error && (
              routingError.message.includes('Account pending approval') ||
              routingError.message.includes('pending approval') ||
              routingError.message.includes('pending admin approval')
            )) {
              console.log('⏳ OAuth Callback: Account pending approval detected during routing - redirecting');
              isRedirectingRef.current = true;
              router.push('/pending-approval');
              return; // Don't log as error, just redirect
            }

            console.error('❌ OAuth Callback - Post-auth routing failed:', routingError);
            // Default to get-started if routing fails
            router.push('/get-started');
          }
        })();

      } catch (error) {
        // Reset flags on error
        hasProcessedRef.current = false;
        isRedirectingRef.current = false;

        // Import the PendingApprovalError class
        const { PendingApprovalError } = await import('@/lib/oauth');

        // Check if this is a pending approval error (don't log as error)
        if (error instanceof PendingApprovalError ||
            (error instanceof Error && (
              error.message.includes('Account pending approval') ||
              error.message.includes('pending admin approval') ||
              error.message.includes('pending approval') ||
              error.message.includes('Your account is pending')
            ))) {
          console.log('⏳ OAuth Callback: Account pending approval detected');
          setState({
            status: 'loading',
            message: 'Account pending approval. Redirecting...'
          });

          isRedirectingRef.current = true;
          // Immediate redirect, no delay
          router.push('/pending-approval');
          return;
        }

        // Only log actual errors
        console.error('OAuth callback error:', error);
        setState({
          status: 'error',
          message: error instanceof Error ? error.message : 'Authentication failed'
        });

        // Redirect to login page after error
        setTimeout(() => {
          isRedirectingRef.current = true;
          router.push('/login?error=oauth_failed');
        }, 3000);
      }
    };

    // Only run if we have search params and haven't processed yet
    if (searchParams.toString() && !hasProcessedRef.current) {
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
