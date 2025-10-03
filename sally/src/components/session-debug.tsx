'use client';

import { useSession } from '@/contexts/SessionContext';
import { useAuth } from '@/contexts/AuthContext';

export function SessionDebug() {
  const { sessionData, clearSession } = useSession();
  const { user } = useAuth();

  if (!sessionData.jobId) {
    return (
      <div className="fixed bottom-4 right-4 bg-gray-100 border border-gray-300 rounded-lg p-4 shadow-lg max-w-sm">
        <h3 className="font-semibold text-gray-800 mb-2">Session Debug</h3>
        <p className="text-sm text-gray-600">No active job session</p>
        <p className="text-xs text-gray-500 mt-1">
          Click &quot;Get Started&quot; to create a job session
        </p>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg max-w-sm">
      <h3 className="font-semibold text-gray-800 mb-2">Session Debug</h3>
      
      <div className="space-y-2 text-sm">
        <div>
          <span className="font-medium text-gray-700">Job ID:</span>
          <div className="font-mono text-xs bg-gray-100 p-1 rounded mt-1 break-all">
            {sessionData.jobId}
          </div>
        </div>
        
        <div>
          <span className="font-medium text-gray-700">Created:</span>
          <div className="text-xs text-gray-600">
            {sessionData.createdAt ? new Date(sessionData.createdAt).toLocaleString() : 'Unknown'}
          </div>
        </div>
        
        <div>
          <span className="font-medium text-gray-700">User:</span>
          <div className="text-xs text-gray-600">
            {user?.full_name || user?.email || 'Not logged in'}
          </div>
        </div>
        
        <div>
          <span className="font-medium text-gray-700">User ID:</span>
          <div className="text-xs text-gray-600">
            {sessionData.userId || 'None'}
          </div>
        </div>
      </div>
      
      <button
        onClick={clearSession}
        className="mt-3 w-full bg-red-500 text-white text-xs py-1 px-2 rounded hover:bg-red-600 transition-colors"
      >
        Clear Session
      </button>
    </div>
  );
}

// Helper component to show session info in development only
export function SessionDebugDev() {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return <SessionDebug />;
}

// Component to show session debug from get-started until conversational-ai is reached
export function SessionDebugUntilConversationalAI() {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  // Check if user has reached conversational-ai page (stored in localStorage)
  if (typeof window !== 'undefined') {
    const hasReachedConvoAI = localStorage.getItem('reached_conversational_ai');
    if (hasReachedConvoAI === 'true') {
      return null; // Hide widget permanently once they've reached conversational-ai
    }

    const currentPath = window.location.pathname;

    // Only show on pages from get-started onwards
    const showOnPages = [
      '/get-started',
      '/company-onboarding',
      '/conversational-ai'
    ];

    // Check if current page is in the flow
    const shouldShow = showOnPages.some(page => currentPath.startsWith(page));

    if (!shouldShow) {
      return null;
    }

    // If on conversational-ai page, mark as reached and hide widget
    if (currentPath === '/conversational-ai') {
      localStorage.setItem('reached_conversational_ai', 'true');
      return null;
    }
  }

  return <SessionDebug />;
}
