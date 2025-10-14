// app/page.tsx
import { Navbar } from '@/components/navbar';
import { FeatureList } from '@/components/feature-list';
import { Testimonial } from '@/components/testimonial';
import { SignUpForm } from '@/components/signup-form';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start py-20">
          {/* Left Column - Main Content */}
          <div className="space-y-8">
            <div className="space-y-10">
              <h1 className="text-2xl font-semibold text-black leading-9">
                You&apos;re one conversation away from your perfect hire.
              </h1>
              <p className="text-base text-[#4D4B49] leading-7">
                An intuitive AI interface built to save hours and deliver top matches.
              </p>
            </div>

            <FeatureList />
            <Testimonial />
          </div>

          {/* Right Column - Sign Up Form */}
          <div className="flex justify-center lg:justify-end -mt-8">
            <SignUpForm />
          </div>
        </div>
      </main>
    </div>
  );
}
