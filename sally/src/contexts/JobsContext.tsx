'use client';

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { jobsService, Job, JobsListOptions } from '@/services/jobs.service';
import { AuthService } from '@/lib/auth';
import { useAuth } from '@/hooks/useAuth';

interface JobsContextType {
  jobs: Job[];
  loading: boolean;
  error: string | null;
  hasJobs: boolean;
  fetchJobs: (options?: JobsListOptions) => Promise<void>;
  checkHasJobs: () => Promise<boolean>;
  refetch: () => Promise<void>;
  ensureJobsLoaded: () => Promise<void>;
  clearCache: () => void;
}

const JobsContext = createContext<JobsContextType | undefined>(undefined);

export function JobsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasJobs, setHasJobs] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);

  const fetchJobs = useCallback(async (customOptions?: JobsListOptions) => {
    // Don't fetch if user is not authenticated
    if (!user || !user.id) {
      console.log('⏭️ JobsContext: fetchJobs - no authenticated user, skipping fetch');
      return;
    }

    if (!authToken) {
      console.log('⏭️ JobsContext: fetchJobs - no auth token, skipping fetch');
      return;
    }

    // Prevent duplicate fetches if already loading
    if (loading) {
      console.log('⏭️ JobsContext: Already fetching jobs, skipping duplicate request');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const queryOptions = {
        limit: 50, // Default to fetch up to 50 jobs
        clear_cache: true,
        ...customOptions,
      };

      console.log('🔍 JobsContext: Fetching jobs with options:', queryOptions);
      const jobsData = await jobsService.listJobs(queryOptions);
      setJobs(jobsData);
      setHasJobs(jobsData.length > 0);
      setHasFetched(true);

      console.log('✅ JobsContext: Jobs fetched successfully:', jobsData.length, 'jobs');
      console.log('📋 JobsContext: Job titles:', jobsData.map(job => job.sections?.basic_information?.title || 'Untitled').slice(0, 10));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch jobs';

      // Check if this is a 403 error (likely pending approval or logout)
      if (err instanceof Error && (err.message.includes('403') || err.message.includes('Forbidden'))) {
        console.log('⏳ JobsContext: Got 403/Forbidden error during fetchJobs - likely pending approval or logout');
        // Don't set this as an error state, just silently fail
        setHasJobs(false);
        setHasFetched(true); // Mark as fetched to prevent retries
      } else {
        setError(errorMessage);
        console.error('❌ JobsContext: Failed to fetch jobs:', err);
        setHasJobs(false);
      }
    } finally {
      setLoading(false);
    }
  }, [loading, user, authToken]);

  const checkHasJobs = useCallback(async (): Promise<boolean> => {
    // Don't check if user is not authenticated
    if (!user || !user.id) {
      console.log('⏭️ JobsContext: checkHasJobs - no authenticated user, returning false');
      return false;
    }

    if (!authToken) {
      console.log('⏭️ JobsContext: checkHasJobs - no auth token, returning false');
      return false;
    }

    try {
      setLoading(true);
      setError(null);

      const userHasJobs = await jobsService.hasJobs();
      setHasJobs(userHasJobs);

      console.log('✅ JobsContext: Checked if user has jobs:', userHasJobs);
      return userHasJobs;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check jobs';

      // Check if this is a 403 error (likely pending approval or logout)
      if (err instanceof Error && (err.message.includes('403') || err.message.includes('Forbidden'))) {
        console.log('⏳ JobsContext: Got 403/Forbidden error during checkHasJobs - likely pending approval or logout');
        // Don't set this as an error state, just return false
        setHasJobs(false);
        return false;
      } else {
        setError(errorMessage);
        console.error('❌ JobsContext: Failed to check if user has jobs:', err);
        setHasJobs(false);
        return false;
      }
    } finally {
      setLoading(false);
    }
  }, [user, authToken]);

  const refetch = useCallback(async () => {
    await fetchJobs();
  }, [fetchJobs]);

  const ensureJobsLoaded = useCallback(async () => {
    // Don't fetch if user is not authenticated
    if (!user || !user.id) {
      console.log('⏭️ JobsContext: ensureJobsLoaded - no authenticated user, skipping fetch');
      return;
    }

    if (!authToken) {
      console.log('⏭️ JobsContext: ensureJobsLoaded - no auth token, skipping fetch');
      return;
    }

    if (!hasFetched && !loading) {
      console.log('🔄 JobsContext: ensureJobsLoaded - fetching jobs on demand');
      console.log('🔄 JobsContext: authToken available:', !!authToken);
      await fetchJobs();
    } else {
      console.log('⏭️ JobsContext: ensureJobsLoaded - jobs already loaded or loading', { hasFetched, loading });
    }
  }, [hasFetched, loading, authToken, fetchJobs, user]);

  const clearCache = useCallback(() => {
    console.log('🧹 JobsContext: Clearing cache...');
    setJobs([]);
    setHasJobs(false);
    setHasFetched(false);
    setError(null);
    setLoading(false);
  }, []);

  // Listen for cache clear events from AuthContext
  useEffect(() => {
    const handleClearCache = () => {
      console.log('🧹 JobsContext: Received cache clear event from AuthContext');
      clearCache();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('auth:clearCache', handleClearCache);
      return () => window.removeEventListener('auth:clearCache', handleClearCache);
    }
  }, [clearCache]);

  // Monitor auth token changes and update state
  useEffect(() => {
    const checkToken = () => {
      const token = AuthService.getAccessToken();
      setAuthToken(token || null);
    };

    // Check immediately
    checkToken();

    // Set up an interval to check for token changes
    const interval = setInterval(checkToken, 500);

    return () => clearInterval(interval);
  }, []);

  // Auto-fetch jobs when auth token becomes available
  useEffect(() => {
    if (!authToken) {
      console.log('⏭️ JobsContext: No auth token, skipping auto-fetch');
      return;
    }

    // Don't auto-fetch if we're on the pending approval page
    if (typeof window !== 'undefined' && window.location.pathname === '/pending-approval') {
      console.log('⏭️ JobsContext: On pending approval page, skipping auto-fetch');
      return;
    }

    // Don't auto-fetch if we're on login page (to prevent race condition during login flow)
    if (typeof window !== 'undefined' && window.location.pathname === '/login') {
      console.log('⏭️ JobsContext: On login page, skipping auto-fetch to prevent race condition');
      return;
    }

    // Don't auto-fetch if we're on job dashboard page, but allow manual fetch
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/job-dashboard/')) {
      console.log('⏭️ JobsContext: On job dashboard page, skipping auto-fetch but allowing manual fetch');
      return;
    }

    if (!hasFetched && !loading) {
      console.log('🚀 JobsContext: Auth token detected, auto-fetching jobs');
      fetchJobs();
    }
  }, [authToken, hasFetched, loading, fetchJobs]); // Trigger when authToken changes

  return (
    <JobsContext.Provider
      value={{
        jobs,
        loading,
        error,
        hasJobs,
        fetchJobs,
        checkHasJobs,
        refetch,
        ensureJobsLoaded,
        clearCache,
      }}
    >
      {children}
    </JobsContext.Provider>
  );
}

export function useJobsContext() {
  const context = useContext(JobsContext);
  if (context === undefined) {
    throw new Error('useJobsContext must be used within a JobsProvider');
  }
  return context;
}

