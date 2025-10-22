'use client';

import { jobsService } from '@/services/jobs.service';
import { AuthService } from '@/lib/auth';
import { API_CONFIG, API_ENDPOINTS } from '@/lib/constants';

/**
 * Determines where to redirect user after successful authentication
 * based on whether they have existing jobs or not
 */
export async function getPostAuthRedirectPath(retryCount = 0): Promise<string> {
  const maxRetries = 2;

  try {
    console.log(`🔍 Checking if user has jobs for post-auth routing... (attempt ${retryCount + 1}/${maxRetries + 1})`);

    // Check if we have a valid token first
    const token = AuthService.getAccessToken();
    console.log('🎫 Token found:', !!token);
    console.log('🎫 Token preview:', token ? `${token.substring(0, 20)}...` : 'null');

    if (!token) {
      console.log('⚠️ No access token found, redirecting to /get-started');
      return '/get-started';
    }

    // Add a delay to ensure token is properly stored and backend session is established
    // Longer delay on first attempt to allow for session synchronization
    const delay = retryCount === 0 ? 800 : (300 + (retryCount * 400));
    await new Promise(resolve => setTimeout(resolve, delay));
    console.log(`⏳ Waited ${delay}ms for token and session to be ready`);

    // FIRST: Check account status before checking jobs
    console.log('🔍 Checking account status first...');
    try {
      const token = AuthService.getAccessToken();
      if (!token) {
        console.log('❌ No token found, redirecting to login');
        return '/login';
      }

      // Make a quick call to /me endpoint to check account status
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.AUTH.ME}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 403) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error?.message || errorData.message || errorData.detail || '';

        if (errorMessage.includes('Account pending approval') ||
            errorMessage.includes('pending approval') ||
            errorMessage.includes('pending admin approval')) {
          console.log('⏳ Account pending approval detected, redirecting to pending approval page');
          return '/pending-approval';
        }
      }

      if (!response.ok) {
        console.log('❌ Account status check failed, redirecting to login');
        return '/login';
      }

      console.log('✅ Account status check passed, proceeding to check jobs');
    } catch (statusError) {
      console.log('❌ Account status check error:', statusError);
      // If we can't check status, assume it might be pending approval
      return '/pending-approval';
    }

    // SECOND: Now check if user has jobs (only if account is approved)
    console.log('🔄 Calling jobsService.hasJobs()...');

    // Add a timeout wrapper for the entire hasJobs call
    const hasJobsPromise = jobsService.hasJobs();
    const timeoutPromise = new Promise<boolean>((_, reject) => {
      setTimeout(() => reject(new Error('hasJobs timeout after 8 seconds')), 8000);
    });

    const hasJobs = await Promise.race([hasJobsPromise, timeoutPromise]);
    console.log('📊 hasJobs result:', hasJobs);

    if (hasJobs) {
      console.log('✅ User has jobs, redirecting to /dashboard');
      return '/dashboard';
    } else {
      console.log('📝 User has no jobs, redirecting to /get-started');
      return '/get-started';
    }
  } catch (error) {
    console.error('❌ Error checking jobs for post-auth routing:', error);

    // Check if this is a pending approval error (should be rare now since we check status first)
    const isPendingApproval = error instanceof Error && (
      error.message.includes('PENDING_APPROVAL_REDIRECT') ||
      error.message.includes('Account pending approval') ||
      error.message.includes('pending admin approval') ||
      error.message.includes('pending approval') ||
      (error as any).isPendingApproval === true ||
      (error as any).shouldRedirect === true
    );

    if (isPendingApproval) {
      console.log('⏳ Post-auth routing: Account pending approval detected in fallback, redirecting to pending approval page');
      return '/pending-approval';
    }

    // Check if it's an authentication error and we can retry
    const isAuthError = error instanceof Error && (
      error.message.includes('401') ||
      error.message.includes('Authentication failed') ||
      error.message.includes('Token refresh failed') ||
      error.message.includes('Session not found') ||
      error.message.includes('Session expired')
    );

    if (isAuthError && retryCount < maxRetries) {
      console.log(`🔑 Auth error detected - retrying in ${(retryCount + 1) * 500}ms... (attempt ${retryCount + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, (retryCount + 1) * 500));
      return getPostAuthRedirectPath(retryCount + 1);
    }

    // In case of error or max retries reached, default to get-started page
    console.log('🔄 Defaulting to /get-started due to error or max retries reached');
    return '/get-started';
  }
}

/**
 * Handles post-authentication routing with loading state
 * Returns a promise that resolves to the redirect path
 */
export async function handlePostAuthRouting(): Promise<{
  redirectPath: string;
  hasJobs: boolean;
}> {
  try {
    console.log('🚀 Starting post-authentication routing...');

    const redirectPath = await getPostAuthRedirectPath();
    const hasJobs = redirectPath === '/dashboard';

    console.log(`✅ Post-auth routing complete: hasJobs=${hasJobs}, redirectPath=${redirectPath}`);

    return {
      redirectPath,
      hasJobs,
    };
  } catch (error) {
    console.error('❌ Error in post-auth routing:', error);

    return {
      redirectPath: '/get-started',
      hasJobs: false,
    };
  }
}

/**
 * Hook-like function for components that need to handle post-auth routing
 * Can be used in components that need to redirect users after authentication
 */
export function usePostAuthRouting() {
  const checkAndRedirect = async (router: any) => {
    try {
      const { redirectPath } = await handlePostAuthRouting();
      router.push(redirectPath);
    } catch (error) {
      console.error('❌ Error in post-auth routing:', error);
      router.push('/get-started');
    }
  };

  return { checkAndRedirect };
}
