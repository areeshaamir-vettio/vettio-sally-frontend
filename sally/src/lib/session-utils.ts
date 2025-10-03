/**
 * Session utilities for accessing job session data
 * These functions work with localStorage directly for cases where React context isn't available
 */

interface SessionData {
  jobId: string | null;
  createdAt: string | null;
  userId: string | null;
}

/**
 * Get the current session data from localStorage
 */
export function getSessionData(): SessionData | null {
  if (typeof window === 'undefined') {
    return null;
  }
  
  try {
    const storedSession = localStorage.getItem('vettio_session');
    if (storedSession) {
      return JSON.parse(storedSession);
    }
  } catch (error) {
    console.error('Failed to parse session data:', error);
  }
  
  return null;
}

/**
 * Get the current job ID from session
 */
export function getCurrentJobId(): string | null {
  const sessionData = getSessionData();
  return sessionData?.jobId || null;
}

/**
 * Check if there's an active job session
 */
export function hasActiveJobSession(): boolean {
  return !!getCurrentJobId();
}

/**
 * Get session creation time
 */
export function getSessionCreatedAt(): Date | null {
  const sessionData = getSessionData();
  if (sessionData?.createdAt) {
    return new Date(sessionData.createdAt);
  }
  return null;
}

/**
 * Get the user ID associated with the session
 */
export function getSessionUserId(): string | null {
  const sessionData = getSessionData();
  return sessionData?.userId || null;
}

/**
 * Clear the session data
 */
export function clearSessionData(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('vettio_session');
  }
}

/**
 * Log session information to console (for debugging)
 */
export function logSessionInfo(): void {
  const sessionData = getSessionData();
  
  if (!sessionData || !sessionData.jobId) {
    console.log('📋 No active job session');
    return;
  }
  
  console.log('📋 Current Job Session:');
  console.log('  Job ID:', sessionData.jobId);
  console.log('  Created:', sessionData.createdAt ? new Date(sessionData.createdAt).toLocaleString() : 'Unknown');
  console.log('  User ID:', sessionData.userId || 'None');
  
  const createdAt = getSessionCreatedAt();
  if (createdAt) {
    const timeElapsed = Date.now() - createdAt.getTime();
    const minutes = Math.floor(timeElapsed / (1000 * 60));
    const seconds = Math.floor((timeElapsed % (1000 * 60)) / 1000);
    console.log('  Duration:', `${minutes}m ${seconds}s`);
  }
}

/**
 * Generate a fake job ID (same logic as in SessionContext)
 */
export function generateFakeJobId(): string {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `JOB_${timestamp}_${randomSuffix}`;
}

/**
 * Check if user has reached conversational-ai page
 */
export function hasReachedConversationalAI(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('reached_conversational_ai') === 'true';
}

/**
 * Reset the conversational-ai flag (for testing)
 */
export function resetConversationalAIFlag(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('reached_conversational_ai');
    console.log('🔄 Reset conversational-ai flag - session debug widget will show again');
  }
}

/**
 * Mark that user has reached conversational-ai page
 */
export function markReachedConversationalAI(): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('reached_conversational_ai', 'true');
    console.log('🎯 Marked as reached conversational-ai - session debug widget will be hidden');
  }
}

// Make utilities available in browser console for debugging
declare global {
  interface Window {
    sessionUtils: {
      getSessionData: typeof getSessionData;
      getCurrentJobId: typeof getCurrentJobId;
      hasActiveJobSession: typeof hasActiveJobSession;
      getSessionCreatedAt: typeof getSessionCreatedAt;
      getSessionUserId: typeof getSessionUserId;
      clearSessionData: typeof clearSessionData;
      logSessionInfo: typeof logSessionInfo;
      generateFakeJobId: typeof generateFakeJobId;
      hasReachedConversationalAI: typeof hasReachedConversationalAI;
      resetConversationalAIFlag: typeof resetConversationalAIFlag;
      markReachedConversationalAI: typeof markReachedConversationalAI;
    };
  }
}

if (typeof window !== 'undefined') {
  window.sessionUtils = {
    getSessionData,
    getCurrentJobId,
    hasActiveJobSession,
    getSessionCreatedAt,
    getSessionUserId,
    clearSessionData,
    logSessionInfo,
    generateFakeJobId,
    hasReachedConversationalAI,
    resetConversationalAIFlag,
    markReachedConversationalAI,
  };
}
