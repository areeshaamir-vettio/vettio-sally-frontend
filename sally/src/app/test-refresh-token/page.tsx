import { Navbar } from '@/components/navbar';
import { RefreshTokenTesterComponent } from '@/components/refresh-token-tester';

export default function TestRefreshTokenPage() {
  return (
    <div className="min-h-screen bg-[#F9FAFA]">
      <Navbar />
      
      <main className="py-8">
        <RefreshTokenTesterComponent />
      </main>
    </div>
  );
}
