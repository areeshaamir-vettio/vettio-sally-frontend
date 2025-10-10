'use client';

import { useState } from 'react';
import { Roadmap } from './roadmap';
import { conversationalAiApi, ConversationalApiError } from '@/lib/conversational-ai-api';
import { RoleData } from '@/types/role-enhancement';

interface ProfileDrawerProps {
  sessionId: string;
  roadmapId: string;
  roleId?: string; // Added for API integration
  roleData: RoleData | null; // Added to pass role data directly
  isLoadingRole?: boolean; // Loading state for role data
  onError?: (error: string) => void; // Added for error handling
}

export function ProfileDrawer({ roadmapId, roleId, roleData, isLoadingRole = false, onError }: ProfileDrawerProps) {
  const [isPausing, setIsPausing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePauseSession = async () => {
    if (!roleId) {
      const errorMsg = 'No role ID provided';
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    setIsPausing(true);
    setError(null);

    try {
      // Note: Backend endpoint not implemented yet, using placeholder
      const result = await conversationalAiApi.pauseConversation();

      if (result.success) {
        // Show success message
        alert(result.message);
        console.log(result.message);

        // TODO: Redirect to dashboard or show success UI
        // window.location.href = '/dashboard';
      }
    } catch (err) {
      const errorMessage = err instanceof ConversationalApiError
        ? err.message
        : 'Failed to pause session';

      console.error('Failed to pause session:', err);
      setError(errorMessage);
      onError?.(errorMessage);

      // Show error to user
      alert(`Error: ${errorMessage}`);
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
        <Roadmap
          roadmapId={roadmapId}
          roleData={roleData}
          isLoading={isLoadingRole}
          onError={onError}
        />
      </div>

      {/* Pause Button - Fixed at Bottom */}
      <div className="p-6 border-t border-[#E5E7EB] bg-white">
        {error && (
          <p className="text-xs text-red-500 mb-2 text-center">{error}</p>
        )}
        <button
          onClick={handlePauseSession}
          disabled={isPausing || !roleId}
          className="w-full bg-[#F3F4F6] text-[#1D2025] py-2 px-4 rounded-md font-semibold hover:bg-[#E5E7EB] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm leading-5"
        >
          {isPausing ? 'Pausing...' : 'Pause and Resume Later'}
        </button>
      </div>
    </div>
  );
}
