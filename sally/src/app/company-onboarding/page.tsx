import { Navbar } from '@/components/navbar';
import { CompanyOnboardingForm } from '@/components/company-onboarding-form';

export default function CompanyOnboardingPage() {
  return (
    <div className="min-h-screen bg-[#F9FAFA]">
      {/* Navigation */}
      <Navbar />

      {/* Main Content */}
      <main>
        <CompanyOnboardingForm />
      </main>
    </div>
  );
}
