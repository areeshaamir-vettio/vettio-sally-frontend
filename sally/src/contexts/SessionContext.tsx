'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface SessionData {
  jobId: string | null;
  createdAt: string | null;
  userId: string | null;
}

interface SessionContextType {
  sessionData: SessionData;
  generateJobId: (userId?: string) => string;
  clearSession: () => void;
  getJobId: () => string | null;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

// Generate a fake job ID
function generateFakeJobId(): string {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `JOB_${timestamp}_${randomSuffix}`;
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [sessionData, setSessionData] = useState<SessionData>({
    jobId: null,
    createdAt: null,
    userId: null,
  });

  // Load session data from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedSession = localStorage.getItem('vettio_session');
      if (storedSession) {
        try {
          const parsed = JSON.parse(storedSession);
          setSessionData(parsed);
        } catch (error) {
          console.error('Failed to parse stored session:', error);
          // Clear invalid session data
          localStorage.removeItem('vettio_session');
        }
      }
    }
  }, []);

  // Save session data to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (sessionData.jobId) {
        localStorage.setItem('vettio_session', JSON.stringify(sessionData));
      } else {
        localStorage.removeItem('vettio_session');
      }
    }
  }, [sessionData]);

  const generateJobId = (userId?: string): string => {
    const newJobId = generateFakeJobId();
    const newSessionData: SessionData = {
      jobId: newJobId,
      createdAt: new Date().toISOString(),
      userId: userId || null,
    };
    
    setSessionData(newSessionData);
    
    console.log('🆔 Generated new Job ID:', newJobId);
    console.log('📅 Session created at:', newSessionData.createdAt);
    if (userId) {
      console.log('👤 Associated with user:', userId);
    }
    
    return newJobId;
  };

  const clearSession = () => {
    setSessionData({
      jobId: null,
      createdAt: null,
      userId: null,
    });
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('vettio_session');
    }
    
    console.log('🗑️ Session cleared');
  };

  const getJobId = (): string | null => {
    return sessionData.jobId;
  };

  return (
    <SessionContext.Provider value={{
      sessionData,
      generateJobId,
      clearSession,
      getJobId,
    }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}

// Helper hook to get just the job ID
export function useJobId() {
  const { getJobId } = useSession();
  return getJobId();
}

// Helper function to check if session exists
export function useHasActiveSession() {
  const { sessionData } = useSession();
  return !!sessionData.jobId;
}
