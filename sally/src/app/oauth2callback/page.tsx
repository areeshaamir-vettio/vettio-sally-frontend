'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { OAuthService } from '@/lib/oauth';
import { useAuth } from '@/contexts/AuthContext';

interface CallbackState {
  status: 'loading' | 'success' | 'error';
  message: string;
}

export default function OAuth2CallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginWithOAuth } = useAuth();

  const [state, setState] = useState<CallbackState>({
    status: 'loading',
    message: 'Processing authentication...'
  });

  const [hasProcessed, setHasProcessed] = useState(false);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        setHasProcessed(true);
        console.log('🔍 OAuth2 Callback - Current URL:', window.location.href);
        console.log('🔍 OAuth2 Callback - Search params:', searchParams.toString());

        // Get parameters from URL
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        console.log('🔍 OAuth2 Callback - Code:', code);
        console.log('🔍 OAuth2 Callback - State:', state);
        console.log('🔍 OAuth2 Callback - Error:', error);

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
        console.log('🔄 OAuth2 Callback - Calling handleOAuthCallback...');
        const tokenData = await OAuthService.handleOAuthCallback(code, state);
        console.log('✅ OAuth2 Callback - Token data received:', tokenData);

        setState({
          status: 'loading',
          message: 'Authentication successful! Redirecting...'
        });

        // Update auth context with user data
        console.log('🔄 OAuth2 Callback - Updating auth context...');
        console.log('👤 OAuth2 Callback - User data:', tokenData.user);
        console.log('🖼️ OAuth2 Callback - Profile picture URL:', tokenData.user.profile_picture_url);
        loginWithOAuth(tokenData.user);

        setState({
          status: 'success',
          message: 'Authentication successful!'
        });

        // Check approval status immediately (no delay)
        (async () => {
          try {
            console.log('🔄 OAuth2 Callback - Checking user approval status...');
            const { AuthService } = await import('@/lib/auth');
            const { API_CONFIG, API_ENDPOINTS } = await import('@/lib/constants');

            const token = AuthService.getAccessToken();
            const fullUrl = `${API_CONFIG.BASE_URL}${API_ENDPOINTS.AUTH.ME}`;
            console.log('📡 OAuth2 Callback: Checking approval status at:', fullUrl);

            const meResponse = await fetch(fullUrl, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
            });

            console.log('📡 OAuth2 Callback: /me response status:', meResponse.status);

            if (meResponse.status === 403) {
              console.log('⏳ OAuth2 Callback: Got 403 from /me endpoint - account pending approval');
              router.push('/pending-approval');
              return;
            }

            if (!meResponse.ok) {
              console.log('⚠️ OAuth2 Callback: /me endpoint failed with status:', meResponse.status);
              // For other errors, proceed with normal routing as fallback
            }

            // If /me endpoint succeeds, user is approved, proceed with normal routing
            console.log('✅ OAuth2 Callback: User is approved, proceeding with post-auth routing...');
            const { getPostAuthRedirectPath } = await import('@/utils/post-auth-routing');
            const redirectPath = await getPostAuthRedirectPath();
            console.log('🔄 OAuth2 Callback - About to redirect to:', redirectPath);
            router.push(redirectPath);
          } catch (routingError) {
            console.error('❌ OAuth2 Callback - Post-auth routing failed:', routingError);
            // Default to get-started if routing fails
            router.push('/get-started');
          }
        })();

      } catch (error) {
        // Import the PendingApprovalError class
        const { PendingApprovalError } = await import('@/lib/oauth');

        // Check if this is a pending approval error (don't log as error)
        if (error instanceof PendingApprovalError ||
            (error instanceof Error && (
              error.message.includes('PENDING_APPROVAL_REDIRECT') ||
              error.message.includes('Account pending approval') ||
              error.message.includes('pending admin approval') ||
              error.message.includes('pending approval') ||
              error.message.includes('Your account is pending') ||
              (error as any).isPendingApproval === true ||
              (error as any).shouldRedirect === true
            ))) {
          console.log('⏳ OAuth2 Callback: Account pending approval detected');
          setState({
            status: 'loading',
            message: 'Account pending approval. Redirecting...'
          });

          // Immediate redirect, no delay
          router.push('/pending-approval');
          return;
        }

        // Only log actual errors
        console.error('OAuth2 callback error:', error);
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

    // Only run if we have search params and haven't processed yet
    if (searchParams.toString() && !hasProcessed) {
      handleOAuthCallback();
    }
  }, [searchParams, router, loginWithOAuth, hasProcessed]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center">
            {state.status === 'loading' && (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            )}
            {state.status === 'success' && (
              <div className="rounded-full h-8 w-8 bg-green-100 flex items-center justify-center">
                <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
            )}
            {state.status === 'error' && (
              <div className="rounded-full h-8 w-8 bg-red-100 flex items-center justify-center">
                <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
            )}
          </div>
          
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {state.status === 'loading' && 'Authenticating...'}
            {state.status === 'success' && 'Success!'}
            {state.status === 'error' && 'Authentication Failed'}
          </h2>
          
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
