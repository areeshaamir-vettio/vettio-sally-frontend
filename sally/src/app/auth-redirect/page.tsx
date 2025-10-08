'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getPostAuthRedirectPath } from '@/utils/post-auth-routing';

export default function AuthRedirectPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    const handleRedirect = async () => {
      // Wait for auth to be loaded
      if (isLoading) return;

      // If not authenticated, redirect to login
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }

      try {
        // Check if user has jobs and redirect accordingly
        console.log('🔄 Auth Redirect - Checking jobs for routing...');
        const redirectPath = await getPostAuthRedirectPath();
        console.log('🔄 Auth Redirect - Redirecting to:', redirectPath);
        router.push(redirectPath);
      } catch (error) {
        console.error('❌ Auth redirect error:', error);
        // Default to get-started on error
        router.push('/get-started');
      }
    };

    handleRedirect();
  }, [isAuthenticated, isLoading, router]);

  // Show loading state while redirecting
  return (
    <div className="min-h-screen bg-[#F9FAFA] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#171A1D] mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}
