'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Plus } from 'lucide-react';
import { useSession } from '@/contexts/SessionContext';
import { useAuth } from '@/contexts/AuthContext';

export function WelcomeCard() {
  const router = useRouter();
  const { generateJobId } = useSession();
  const { user } = useAuth();

  const handleGetStarted = () => {
    // Generate a fake job ID and store it in session
    const jobId = generateJobId(user?.id);

    console.log('🚀 Starting job creation with ID:', jobId);

    // Navigate to company onboarding (step 3 in the flow)
    router.push('/company-onboarding');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm w-full max-w-[424px] mx-auto overflow-hidden"
         style={{
           boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)'
         }}>
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
        {/* Title */}
        <h1 className="text-xl font-semibold text-[#1D2025] leading-tight text-center mt-5">
          Hey there! Let&apos;s create your first job to get started
        </h1>

        {/* Subtitle */}
        <p className="text-[#6B7280] text-md leading-relaxed text-center mt-4">
          Great News! You don&apos;t have to write a job post.
          <br />
          Just share what you have, and your AI agent will draft, refine, and structure it with you.
        </p>

        {/* CTA Button */}
        <button
          onClick={handleGetStarted}
          className="w-full bg-[#8952E0] text-white py-3 px-4 rounded-md hover:bg-[#7A47CC] transition-colors font-medium flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          Create Your First Job
        </button>
      </div>
    </div>
  );
}
