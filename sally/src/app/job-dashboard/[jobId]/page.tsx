'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { JobsSidebar } from '@/components/jobs/sidebar';
import { JobDashboardContent } from '@/components/job-dashboard/content';
import { jobsService, Job } from '@/services/jobs.service';
import { useJobsContext } from '@/contexts/JobsContext';
import { useAuth } from '@/hooks/useAuth';

export default function JobSpecificDashboardPage() {
  const params = useParams();
  const jobId = params.jobId as string;
  const { user, isAuthenticated } = useAuth();
  const { jobs, loading: jobsLoading, ensureJobsLoaded } = useJobsContext();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        console.log('🔄 JobSpecificDashboardPage: Starting to fetch job with ID:', jobId);

        // Don't fetch if user is not authenticated
        if (!user || !user.id || !isAuthenticated) {
          console.log('⏭️ JobSpecificDashboardPage: User not authenticated, skipping job fetch');
          setLoading(false);
          return;
        }

        setLoading(true);
        setError(null);

        // First, ensure jobs are loaded
        await ensureJobsLoaded();

        // Then try to find the job in the cached jobs list
        const cachedJob = jobs.find(j => j.id === jobId);
        if (cachedJob) {
          console.log('⚡ JobSpecificDashboardPage: Using cached job data:', cachedJob);
          setJob(cachedJob);
          setLoading(false);
          return;
        }

        // If not in cache, fetch from API
        console.log('🌐 JobSpecificDashboardPage: Job not in cache, fetching from API');
        const jobData = await jobsService.getJob(jobId);
        setJob(jobData);

        console.log('✅ JobSpecificDashboardPage: Job fetched successfully:', jobData);
        console.log('🆔 JobSpecificDashboardPage: Job ID for candidates:', jobData.id);
        console.log('🔍 JobSpecificDashboardPage: Job sections:', jobData.sections);
        console.log('🔍 JobSpecificDashboardPage: Job basic_information:', jobData.sections?.basic_information);
        console.log('🔍 JobSpecificDashboardPage: Job title:', jobData.sections?.basic_information?.title);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch job';

        // Handle 403 errors gracefully (likely during logout or unauthorized access)
        if (err instanceof Error && (err.message.includes('403') || err.message.includes('Forbidden'))) {
          console.log('⏳ JobSpecificDashboardPage: Got 403/Forbidden error - likely during logout or unauthorized access');
          // Don't set error state for 403 during logout
          return;
        }

        setError(errorMessage);
        console.error('❌ JobSpecificDashboardPage: Failed to fetch job:', err);
      } finally {
        setLoading(false);
      }
    };

    console.log('🚀 JobSpecificDashboardPage: useEffect triggered with jobId:', jobId);
    console.log('📋 JobSpecificDashboardPage: Available cached jobs:', jobs.length);

    if (jobId) {
      fetchJob();
    } else {
      console.log('⚠️ JobSpecificDashboardPage: No jobId provided');
    }
  }, [jobId, jobs, ensureJobsLoaded, user, isAuthenticated]);

  if (loading && !job) {
    return (
      <div className="h-screen bg-[#F9FAFA] overflow-hidden">
        <div className="flex h-full">
          {/* Sidebar loads immediately */}
          <JobsSidebar />

          {/* Show skeleton while job data loads */}
          <div className="flex-1 flex flex-col">
            {/* Header skeleton */}
            <div className="bg-white border-b border-[#E5E7EB] px-6 py-4">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>

            {/* Content skeleton */}
            <div className="flex-1 p-6">
              <div className="animate-pulse space-y-6">
                <div className="grid grid-cols-4 gap-4">
                  <div className="h-24 bg-gray-200 rounded"></div>
                  <div className="h-24 bg-gray-200 rounded"></div>
                  <div className="h-24 bg-gray-200 rounded"></div>
                  <div className="h-24 bg-gray-200 rounded"></div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="h-64 bg-gray-200 rounded"></div>
                  <div className="h-64 bg-gray-200 rounded"></div>
                  <div className="h-64 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F9FAFA]">
        <div className="flex h-screen">
          <JobsSidebar />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-red-600 mb-4">Error: {error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-[#F9FAFA]">
        <div className="flex h-screen">
          <JobsSidebar />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-600">Job not found</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#F9FAFA] overflow-hidden">
      {/* Main Layout Container */}
      <div className="flex h-full">
        {/* Left Sidebar */}
        <JobsSidebar />

        {/* Main Content Area */}
        <JobDashboardContent job={job} />
      </div>
    </div>
  );
}
