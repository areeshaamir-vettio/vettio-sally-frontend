'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CompanyUrlInput } from './company-url-input';
import { mockApiClient } from '@/lib/mock-api';

export function CompanyOnboardingForm() {
  const router = useRouter();
  const [companyUrl, setCompanyUrl] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [companyName, setCompanyName] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleValidation = (valid: boolean, name?: string) => {
    setIsValid(valid);
    setCompanyName(name || '');
  };

  const handleContinue = async () => {
    if (!companyUrl.trim() || !isValid) return;
    
    setIsSubmitting(true);
    
    try {
      // Mock registration data
      const registrationData = {
        email: 'user@example.com', // This would come from previous step
        full_name: 'John Doe', // This would come from previous step
        is_active: true,
        password: 'tempPassword123', // This would be handled securely
        organization_id: companyUrl // Using URL as org identifier for now
      };
      
      const result = await mockApiClient.register(registrationData);
      console.log('Registration successful:', result);
      
      // Navigate to next step (job description - step 4 in the flow)
      router.push('/job-description');
    } catch (error) {
      console.error('Registration failed:', error);
      // Handle error (show toast, etc.)
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    // Navigate to job description without company setup
    router.push('/job-description');
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-250px)] px-6">
      <div className="w-full max-w-[592px]">
        {/* Title */}
        <h1 className="text-2xl font-semibold text-[#1D2025] text-center mb-10">
          Which company are you hiring for?
        </h1>

        {/* Form with Input and Buttons */}
        <div className="space-y-4">
          {/* Input Field with Buttons */}
          <div className="flex gap-4">
            <div className="flex-1">
              <CompanyUrlInput
                value={companyUrl}
                onChange={setCompanyUrl}
                onValidation={handleValidation}
                disabled={isSubmitting}
              />
            </div>

            {/* Action Buttons - Aligned with input field */}
            <div className="flex items-start gap-2 pt-7">
              {/* Continue Button with Paper Plane Icon */}
              <button
                onClick={handleContinue}
                disabled={!companyUrl.trim() || !isValid || isSubmitting}
                className="bg-[#8952E0] text-white p-3 rounded-md hover:bg-[#7A47CC] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center h-12 w-12"
                title="Continue"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m3 3 3 9-3 9 19-9Z"/>
                  <path d="m6 12 13 0"/>
                </svg>
              </button>

              {/* Skip Button */}
              <button
                onClick={handleSkip}
                disabled={isSubmitting}
                className="px-4 py-3 text-[#6B7280] hover:text-[#1D2025] transition-colors disabled:opacity-50 text-sm h-12"
              >
                Skip
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
