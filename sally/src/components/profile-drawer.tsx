'use client';

import { useState } from 'react';
import { User } from 'lucide-react';
import { Roadmap } from './roadmap';
import { mockConversationalAiApi } from '@/lib/mock-conversational-ai-api';

interface ProfileDrawerProps {
  sessionId: string;
  roadmapId: string;
}

export function ProfileDrawer({ sessionId, roadmapId }: ProfileDrawerProps) {
  const [isPausing, setIsPausing] = useState(false);

  const handlePauseSession = async () => {
    setIsPausing(true);
    
    try {
      const result = await mockConversationalAiApi.pauseSession({
        sessionId,
        roadmapId
      });
      
      if (result.success) {
        // Show success message or redirect
        console.log(result.message);
      }
    } catch (error) {
      console.error('Failed to pause session:', error);
    } finally {
      setIsPausing(false);
    }
  };

  return (
    <div
      className="bg-white h-full flex flex-col"
      style={{
        width: '373px',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 10px 15px -3px rgb(0 0 0 / 0.1)'
      }}
    >
      {/* Roadmap Section - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <Roadmap roadmapId={roadmapId} />
      </div>

      {/* Pause Button - Fixed at Bottom */}
      <div className="p-6 border-t border-[#E5E7EB] bg-white">
        <button
          onClick={handlePauseSession}
          disabled={isPausing}
          className="w-full bg-[#F3F4F6] text-[#374151] py-2 px-4 rounded-md font-medium hover:bg-[#E5E7EB] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {isPausing ? 'Pausing...' : 'Pause and Resume Later'}
        </button>
      </div>
    </div>
  );
}
