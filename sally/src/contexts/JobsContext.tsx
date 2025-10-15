'use client';

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { jobsService, Job, JobsListOptions } from '@/services/jobs.service';
import { AuthService } from '@/lib/auth';

interface JobsContextType {
  jobs: Job[];
  loading: boolean;
  error: string | null;
  hasJobs: boolean;
  fetchJobs: (options?: JobsListOptions) => Promise<void>;
  checkHasJobs: () => Promise<boolean>;
  refetch: () => Promise<void>;
}

const JobsContext = createContext<JobsContextType | undefined>(undefined);

export function JobsProvider({ children }: { children: ReactNode }) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasJobs, setHasJobs] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);

  const fetchJobs = useCallback(async (customOptions?: JobsListOptions) => {
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

      // Check if this is a 403 error (likely pending approval)
      if (err instanceof Error && err.message.includes('403')) {
        console.log('⏳ JobsContext: Got 403 error during fetchJobs - likely pending approval');
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
  }, [loading]);

  const checkHasJobs = useCallback(async (): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const userHasJobs = await jobsService.hasJobs();
      setHasJobs(userHasJobs);

      console.log('✅ JobsContext: Checked if user has jobs:', userHasJobs);
      return userHasJobs;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check jobs';

      // Check if this is a 403 error (likely pending approval)
      if (err instanceof Error && err.message.includes('403')) {
        console.log('⏳ JobsContext: Got 403 error during checkHasJobs - likely pending approval');
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
  }, []);

  const refetch = useCallback(async () => {
    await fetchJobs();
  }, [fetchJobs]);

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

