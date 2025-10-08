'use client';

import { useState, useEffect, useCallback } from 'react';
import { jobsService, Job, JobsListOptions } from '@/services/jobs.service';

interface UseJobsReturn {
  jobs: Job[];
  loading: boolean;
  error: string | null;
  hasJobs: boolean;
  fetchJobs: (options?: JobsListOptions) => Promise<void>;
  checkHasJobs: () => Promise<boolean>;
  refetch: () => Promise<void>;
}

interface UseJobsOptions extends JobsListOptions {
  autoFetch?: boolean;
}

/**
 * Hook to manage jobs state and API operations
 * Handles job fetching, checking if user has jobs, and state management
 */
export function useJobs(options: UseJobsOptions = {}): UseJobsReturn {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasJobs, setHasJobs] = useState(false);

  const { autoFetch = true, ...fetchOptions } = options;

  const fetchJobs = useCallback(async (customOptions?: JobsListOptions) => {
    try {
      setLoading(true);
      setError(null);
      
      const queryOptions = {
        ...fetchOptions,
        ...customOptions,
      };
      
      const jobsData = await jobsService.listJobs(queryOptions);
      setJobs(jobsData);
      setHasJobs(jobsData.length > 0);
      
      console.log('✅ Jobs fetched successfully:', jobsData.length, 'jobs');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch jobs';
      setError(errorMessage);
      console.error('❌ Failed to fetch jobs:', err);
      setHasJobs(false);
    } finally {
      setLoading(false);
    }
  }, [fetchOptions]);

  const checkHasJobs = useCallback(async (): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const userHasJobs = await jobsService.hasJobs();
      setHasJobs(userHasJobs);
      
      console.log('✅ Checked if user has jobs:', userHasJobs);
      return userHasJobs;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check jobs';
      setError(errorMessage);
      console.error('❌ Failed to check if user has jobs:', err);
      setHasJobs(false);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(async () => {
    await fetchJobs();
  }, [fetchJobs]);

  // Auto-fetch jobs on mount if enabled
  useEffect(() => {
    if (autoFetch) {
      fetchJobs();
    }
  }, [autoFetch, fetchJobs]);

  return {
    jobs,
    loading,
    error,
    hasJobs,
    fetchJobs,
    checkHasJobs,
    refetch,
  };
}

/**
 * Simplified hook to just check if user has jobs
 * Useful for routing decisions without fetching full job list
 */
export function useHasJobs() {
  const [hasJobs, setHasJobs] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkHasJobs = useCallback(async (): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const userHasJobs = await jobsService.hasJobs();
      setHasJobs(userHasJobs);
      
      console.log('✅ Checked if user has jobs:', userHasJobs);
      return userHasJobs;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check jobs';
      setError(errorMessage);
      console.error('❌ Failed to check if user has jobs:', err);
      setHasJobs(false);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-check on mount
  useEffect(() => {
    checkHasJobs();
  }, [checkHasJobs]);

  return {
    hasJobs,
    loading,
    error,
    checkHasJobs,
  };
}
