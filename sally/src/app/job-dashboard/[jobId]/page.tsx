'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { JobsSidebar } from '@/components/jobs/sidebar';
import { JobDashboardContent } from '@/components/job-dashboard/content';
import { jobsService, Job } from '@/services/jobs.service';

export default function JobSpecificDashboardPage() {
  const params = useParams();
  const jobId = params.jobId as string;
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        console.log('🔄 JobSpecificDashboardPage: Starting to fetch job with ID:', jobId);
        setLoading(true);
        setError(null);

        // Get the specific job by ID
        const jobData = await jobsService.getJob(jobId);
        setJob(jobData);

        console.log('✅ JobSpecificDashboardPage: Job fetched successfully:', jobData);
        console.log('🆔 JobSpecificDashboardPage: Job ID for candidates:', jobData.id);
        console.log('🔍 JobSpecificDashboardPage: Job sections:', jobData.sections);
        console.log('🔍 JobSpecificDashboardPage: Job basic_information:', jobData.sections?.basic_information);
        console.log('🔍 JobSpecificDashboardPage: Job title:', jobData.sections?.basic_information?.title);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch job';
        setError(errorMessage);
        console.error('❌ JobSpecificDashboardPage: Failed to fetch job:', err);
      } finally {
        setLoading(false);
      }
    };

    console.log('🚀 JobSpecificDashboardPage: useEffect triggered with jobId:', jobId);
    if (jobId) {
      fetchJob();
    } else {
      console.log('⚠️ JobSpecificDashboardPage: No jobId provided');
    }
  }, [jobId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9FAFA]">
        <div className="flex h-screen">
          <JobsSidebar />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading job dashboard...</p>
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
    <div className="min-h-screen bg-[#F9FAFA]">
      {/* Main Layout Container */}
      <div className="flex h-screen">
        {/* Left Sidebar */}
        <JobsSidebar />

        {/* Main Content Area */}
        <JobDashboardContent job={job} />
      </div>
    </div>
  );
}
