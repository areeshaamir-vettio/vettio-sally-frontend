'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/navbar';
import { useSession } from '@/contexts/SessionContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

export default function TestSessionPage() {
  const { sessionData, generateJobId, clearSession } = useSession();
  const { user } = useAuth();
  const [sessionHistory, setSessionHistory] = useState<string[]>([]);

  // Load session history from localStorage
  useEffect(() => {
    const history = localStorage.getItem('session_history');
    if (history) {
      try {
        setSessionHistory(JSON.parse(history));
      } catch (error) {
        console.error('Failed to parse session history:', error);
      }
    }
  }, []);

  // Save session history to localStorage
  useEffect(() => {
    if (sessionHistory.length > 0) {
      localStorage.setItem('session_history', JSON.stringify(sessionHistory));
    }
  }, [sessionHistory]);

  const handleGenerateJobId = () => {
    const newJobId = generateJobId(user?.id);
    setSessionHistory(prev => [newJobId, ...prev.slice(0, 9)]); // Keep last 10
  };

  const handleClearSession = () => {
    clearSession();
  };

  const handleClearHistory = () => {
    setSessionHistory([]);
    localStorage.removeItem('session_history');
  };

  return (
    <div className="min-h-screen bg-[#F9FAFA]">
      <Navbar />
      
      <main className="max-w-4xl mx-auto py-8 px-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Session Testing</h1>
          
          {/* Current Session Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h2 className="font-semibold text-blue-800 mb-3">Current Session</h2>
            
            {sessionData.jobId ? (
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-blue-700">Job ID:</span>
                  <div className="font-mono text-xs bg-white p-2 rounded mt-1 border">
                    {sessionData.jobId}
                  </div>
                </div>
                
                <div>
                  <span className="font-medium text-blue-700">Created:</span>
                  <div className="text-blue-600">
                    {sessionData.createdAt ? new Date(sessionData.createdAt).toLocaleString() : 'Unknown'}
                  </div>
                </div>
                
                <div>
                  <span className="font-medium text-blue-700">User:</span>
                  <div className="text-blue-600">
                    {user?.full_name || user?.email || 'Not logged in'}
                  </div>
                </div>
                
                <div>
                  <span className="font-medium text-blue-700">User ID:</span>
                  <div className="text-blue-600">
                    {sessionData.userId || 'None'}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-blue-600">No active session</p>
            )}
          </div>

          {/* Controls */}
          <div className="flex gap-4 mb-6">
            <Button onClick={handleGenerateJobId}>
              Generate New Job ID
            </Button>
            
            <Button 
              onClick={handleClearSession} 
              variant="outline"
              disabled={!sessionData.jobId}
            >
              Clear Current Session
            </Button>
            
            <Button 
              onClick={handleClearHistory} 
              variant="outline"
              disabled={sessionHistory.length === 0}
            >
              Clear History
            </Button>
          </div>

          {/* Session History */}
          {sessionHistory.length > 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h2 className="font-semibold text-gray-800 mb-3">Session History</h2>
              <div className="space-y-2">
                {sessionHistory.map((jobId, index) => (
                  <div key={index} className="font-mono text-xs bg-white p-2 rounded border">
                    {jobId}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h2 className="font-semibold text-yellow-800 mb-2">How to Test</h2>
            <ol className="list-decimal list-inside space-y-1 text-sm text-yellow-700">
              <li>Click &quot;Generate New Job ID&quot; to create a session</li>
              <li>Navigate to the Get Started page and click the &quot;Get Started&quot; button</li>
              <li>Check the browser console for session logs</li>
              <li>Use browser dev tools to inspect localStorage for &apos;vettio_session&apos;</li>
              <li>Try refreshing the page to see if session persists</li>
            </ol>
          </div>

          {/* Console Commands */}
          <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h2 className="font-semibold text-gray-800 mb-2">Console Commands</h2>
            <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-sm space-y-1">
              <div>// Check current session</div>
              <div>window.sessionUtils.logSessionInfo()</div>
              <div></div>
              <div>// Get current job ID</div>
              <div>window.sessionUtils.getCurrentJobId()</div>
              <div></div>
              <div>// Check if session exists</div>
              <div>window.sessionUtils.hasActiveJobSession()</div>
              <div></div>
              <div>// Clear session</div>
              <div>window.sessionUtils.clearSessionData()</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
