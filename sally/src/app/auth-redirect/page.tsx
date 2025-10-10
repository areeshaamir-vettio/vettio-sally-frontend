'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getPostAuthRedirectPath } from '@/utils/post-auth-routing';

export default function AuthRedirectPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const hasAttemptedRedirect = useRef(false);

  useEffect(() => {
    const handleRedirect = async () => {
      // Wait for auth to be loaded
      if (isLoading) {
        console.log('🔄 Auth Redirect - Waiting for auth to load...');
        return;
      }

      // If not authenticated, redirect to login
      if (!isAuthenticated) {
        console.log('🔄 Auth Redirect - Not authenticated, redirecting to login...');
        router.push('/login');
        return;
      }

      // Prevent multiple simultaneous redirect attempts
      if (isRedirecting || hasAttemptedRedirect.current) {
        console.log('🔄 Auth Redirect - Already redirecting, skipping...');
        return;
      }

      try {
        setIsRedirecting(true);
        hasAttemptedRedirect.current = true;

        // Check if user has jobs and redirect accordingly
        // The getPostAuthRedirectPath function has built-in retry logic
        // that handles token refresh automatically
        console.log('🔄 Auth Redirect - Checking jobs for routing...');
        const redirectPath = await getPostAuthRedirectPath();
        console.log('🔄 Auth Redirect - Redirecting to:', redirectPath);
        router.push(redirectPath);
      } catch (error) {
        console.error('❌ Auth redirect error:', error);
        // Default to get-started on error
        router.push('/get-started');
      } finally {
        setIsRedirecting(false);
      }
    };

    handleRedirect();
  }, [isAuthenticated, isLoading, router, isRedirecting]);

  // Show loading state while redirecting
  return (
    <div className="min-h-screen bg-[#F9FAFA] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8952E0] mx-auto mb-4"></div>
        <p className="text-lg font-medium text-[#1D2025] mb-2">
          {isLoading ? 'Loading...' : 'Redirecting...'}
        </p>
        <p className="text-sm text-gray-500">
          {isLoading ? 'Checking authentication...' : 'Setting up your workspace...'}
        </p>
      </div>
    </div>
  );
}
