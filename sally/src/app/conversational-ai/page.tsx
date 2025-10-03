'use client';

import { useEffect } from 'react';
import { Navbar } from '@/components/navbar';
import { VoiceAgentWidget } from '@/components/voice-agent-widget';
import { ProfileDrawer } from '@/components/profile-drawer';

export default function ConversationalAIPage() {
  const sessionId = 'session-1';
  const roadmapId = 'roadmap-1';

  // Mark that user has reached conversational-ai page
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('reached_conversational_ai', 'true');
      console.log('🎯 User reached conversational-ai page - session debug widget will be hidden');
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#F9FAFA]">
      {/* Navigation - Exact height: 56px */}
      <Navbar />

      {/* Main Content Layout */}
      <div className="flex" style={{ height: 'calc(100vh - 56px)' }}>
        {/* Left Content Area */}
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          {/* Centered Title */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-[#1D2025]">
              Let&apos;s get started
            </h1>
            <p className="text-lg text-[#6B7280] mt-2">
              I&apos;ll help you build your job description step by step
            </p>
          </div>

          {/* Voice Agent Widget Container */}
          <div className="flex items-center justify-center">
            <VoiceAgentWidget
              sessionId={sessionId}
            />
          </div>
        </div>

        {/* Right Sidebar - Profile Drawer */}
        <ProfileDrawer
          sessionId={sessionId}
          roadmapId={roadmapId}
        />
      </div>
    </div>
  );
}
