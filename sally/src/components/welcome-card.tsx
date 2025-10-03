'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRole } from '@/hooks/useRole';
import { AuthService, TokenManager } from '@/lib/auth';

export function WelcomeCard() {
  const router = useRouter();
  const { user } = useAuth();
  const { createRole, loading, error } = useRole();

  const handleGetStarted = async () => {
    try {
      console.log('🚀 Get Started clicked');
      console.log('👤 User object:', user);
      console.log('🔐 Is authenticated:', !!user);

      // Check if user is authenticated
      if (!user) {
        console.error('❌ User not authenticated');
        alert('Please log in first to create a role.');
        router.push('/login');
        return;
      }

      // Check if we have a valid access token
      const token = AuthService.getAccessToken();
      console.log('🎫 Token from AuthService:', !!token);

      if (!token) {
        console.error('❌ No access token found');
        alert('Please log in again to continue.');
        router.push('/login');
        return;
      }

      console.log('🔐 User authenticated:', user.email);
      console.log('🎫 Token available:', !!token);
      console.log('🍪 Token preview:', token.substring(0, 20) + '...');

      // Test if token is expired
      const isExpired = TokenManager.isTokenExpired(token);
      console.log('⏰ Token expired:', isExpired);

      // Create a draft role with minimal information (all fields optional)
      const roleData = {
        title: user?.full_name ? `${user.full_name}'s Job` : 'New Job Role',
        location_text: 'Remote', // Default location
        raw_job_description: '', // Will be filled in later steps
      };

      console.log('🚀 Creating draft role for user:', user?.email, 'with data:', roleData);

      // Create role using the hook (automatically stores ID)
      // const role = await createRole(roleData);

      // console.log('✅ Draft role created successfully:', role);

      // Navigate to company onboarding (step 3 in the flow)
      router.push('/company-onboarding');
    } catch (err) {
      console.error('❌ Failed to create role:', err);

      // Check if it's an authentication error
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { status?: number } };
        if (axiosError.response?.status === 401 || axiosError.response?.status === 403) {
          alert('Your session has expired. Please log in again.');
          router.push('/login');
          return;
        }
      }

      // Show user-friendly error message
      const errorMessage = error || 'Something went wrong while creating the role. Please try again.';
      alert(errorMessage);
    }
  };

  return (
    <div
      className="bg-white rounded-lg shadow-sm w-full max-w-[424px] mx-auto overflow-hidden"
      style={{
        boxShadow:
          '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
      }}
    >
      {/* Hero Image */}
      <div className="w-full h-40 bg-[#F9FAFA] relative flex items-center justify-center rounded-xl">
        <Image
          src="/assets/welcome-card.svg"
          alt="Welcome illustration"
          width={384}
          height={166}
          className="object-contain"
          priority
        />
      </div>

      {/* Content */}
      <div className="p-6 space-y-5">
        <h1 className="text-xl font-semibold text-[#1D2025] leading-tight text-center mt-5">
          Hey there! Let&apos;s create your first job to get started
        </h1>

        <p className="text-[#6B7280] text-md leading-relaxed text-center mt-4">
          Great News! You don&apos;t have to write a job post.
          <br />
          Just share what you have, and your AI agent will draft, refine, and structure it with you.
        </p>

        <button
          onClick={handleGetStarted}
          disabled={loading}
          className="w-full bg-[#8952E0] text-white py-3 px-4 rounded-md hover:bg-[#7A47CC] transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-60"
        >
          <Plus size={20} />
          {loading ? 'Creating Role...' : 'Create Your First Job'}
        </button>
      </div>
    </div>
  );
}
