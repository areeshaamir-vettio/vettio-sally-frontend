import { Navbar } from '@/components/navbar';
import { JobDescriptionActions } from '@/components/job-description-actions';

export default function JobDescriptionPage() {
  return (
    <div className="min-h-screen bg-[#F9FAFA]">
      {/* Navigation - Exact height: 56px */}
      <Navbar />
      
      {/* Main Content - Pixel-perfect centering */}
      <main className="flex items-center justify-center px-6" style={{ minHeight: 'calc(100vh - 200px)' }}>
        <JobDescriptionActions />
      </main>
    </div>
  );
}
