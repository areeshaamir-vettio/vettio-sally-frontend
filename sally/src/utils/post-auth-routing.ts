'use client';

import { jobsService } from '@/services/jobs.service';
import { AuthService } from '@/lib/auth';

/**
 * Determines where to redirect user after successful authentication
 * based on whether they have existing jobs or not
 */
export async function getPostAuthRedirectPath(): Promise<string> {
  try {
    console.log('🔍 Checking if user has jobs for post-auth routing...');

    // Check if we have a valid token first
    const token = AuthService.getAccessToken();
    if (!token) {
      console.log('⚠️ No access token found, defaulting to /get-started (likely mock login)');
      return '/get-started';
    }

    const hasJobs = await jobsService.hasJobs();

    if (hasJobs) {
      console.log('✅ User has jobs, redirecting to /jobs');
      return '/jobs';
    } else {
      console.log('📝 User has no jobs, redirecting to /get-started');
      return '/get-started';
    }
  } catch (error) {
    console.error('❌ Error checking jobs for post-auth routing:', error);
    // In case of error, default to get-started page
    console.log('🔄 Defaulting to /get-started due to error');
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

    // Check if we have a valid token first
    const token = AuthService.getAccessToken();
    if (!token) {
      console.log('⚠️ No access token found, defaulting to /get-started (likely mock login)');
      return {
        redirectPath: '/get-started',
        hasJobs: false,
      };
    }

    const hasJobs = await jobsService.hasJobs();
    const redirectPath = hasJobs ? '/jobs' : '/get-started';

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
