'use client';

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useJobs } from '@/hooks/useJobs';
import { JobCard } from './job-card';

interface KanbanColumn {
  id: string;
  title: string;
  count: number;
  jobs: any[];
}

export function JobsKanbanBoard() {
  const { jobs } = useJobs();
  const router = useRouter();

  // Organize jobs into kanban columns based on status
  const columns: KanbanColumn[] = useMemo(() => {
    const allJobs = jobs || [];

    const activeJobs = allJobs.filter(job => job.status === 'active');
    const draftJobs = allJobs.filter(job => job.status === 'draft'); // Draft jobs are like "paused"
    const closedJobs = allJobs.filter(job => job.status === 'closed');

    return [
      {
        id: 'all',
        title: 'All Jobs',
        count: allJobs.length,
        jobs: allJobs
      },
      {
        id: 'draft',
        title: 'Draft',
        count: draftJobs.length,
        jobs: draftJobs
      },
      {
        id: 'active',
        title: 'Active',
        count: activeJobs.length,
        jobs: activeJobs
      },
      {
        id: 'closed',
        title: 'Closed',
        count: closedJobs.length,
        jobs: closedJobs
      }
    ];
  }, [jobs]);

  const handleJobClick = (jobId: string) => {
    router.push(`/job-dashboard/${jobId}`);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Kanban Board */}
      <div className="flex-1 flex gap-7 overflow-x-auto">
        {columns.map((column) => (
          <div key={column.id} className="flex-1 min-w-[300px] flex flex-col">
            {/* Column Header */}
            <div className="mb-4">
              <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-[#E7E9EB]">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-[#1D2025]">
                    {column.title}
                  </h3>
                  <span className="bg-[#F3F4F6] text-[#6B7280] text-sm font-medium px-2 py-1 rounded-full">
                    {column.count}
                  </span>
                </div>
              </div>
            </div>

            {/* Column Content */}
            <div className="flex-1 space-y-3 overflow-y-auto">
              {column.jobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onClick={() => handleJobClick(job.id)}
                />
              ))}
              
              {/* Empty state */}
              {column.jobs.length === 0 && (
                <div className="text-center py-8 text-[#6B7280]">
                  <p>No jobs in this category</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
