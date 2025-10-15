'use client';

import { jobsService } from '@/services/jobs.service';
import { AuthService } from '@/lib/auth';

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

    // Add a delay to ensure token is properly stored and available
    // Longer delay on first attempt, shorter on retries
    const delay = retryCount === 0 ? 300 : (100 + (retryCount * 200));
    await new Promise(resolve => setTimeout(resolve, delay));
    console.log(`⏳ Waited ${delay}ms for token to be ready`);

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

    // Check if this is a pending approval error
    const isPendingApproval = error instanceof Error && (
      error.message.includes('Account pending approval') ||
      error.message.includes('pending admin approval') ||
      error.message.includes('pending approval')
    );

    if (isPendingApproval) {
      console.log('⏳ Post-auth routing: Account pending approval detected, redirecting to pending approval page');
      return '/pending-approval';
    }

    // Check if it's an authentication error and we can retry
    const isAuthError = error instanceof Error && (
      error.message.includes('401') ||
      error.message.includes('Authentication failed') ||
      error.message.includes('Token refresh failed')
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
