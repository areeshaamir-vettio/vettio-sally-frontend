import { Navbar } from '@/components/navbar';
import { WelcomeCard } from '@/components/welcome-card';

export default function GetStartedPage() {
  return (
    <div className="min-h-screen bg-[#F9FAFA]">
      {/* Navigation */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-16 min-h-[calc(100vh-150px)]">
        <WelcomeCard />
      </main>
    </div>
  );
}
