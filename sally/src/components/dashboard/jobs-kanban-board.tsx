'use client';

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useJobs } from '@/hooks/useJobs';
import { JobCard } from './job-card';
import { JobStatus } from './filter-bar';
import { Circle } from 'lucide-react'; // 🟢 added icon import

interface KanbanColumn {
  id: string;
  title: string;
  count: number;
  jobs: any[];
}

interface JobsKanbanBoardProps {
  selectedStatus?: JobStatus;
}

export function JobsKanbanBoard({ selectedStatus = 'all' }: JobsKanbanBoardProps) {
  const { jobs } = useJobs();
  const router = useRouter();

  // Organize jobs into kanban columns based on status
  const columns: KanbanColumn[] = useMemo(() => {
    const allJobs = jobs || [];

    const filteredJobs =
      selectedStatus === 'all'
        ? allJobs
        : allJobs.filter((job) => job.status === selectedStatus);

    const activeJobs = filteredJobs.filter((job) => job.status === 'active');
    const draftJobs = filteredJobs.filter((job) => job.status === 'draft');
    const closedJobs = filteredJobs.filter((job) => job.status === 'closed');

    return [
      { id: 'all', title: 'All Jobs', count: filteredJobs.length, jobs: filteredJobs },
      { id: 'draft', title: 'Draft', count: draftJobs.length, jobs: draftJobs },
      { id: 'active', title: 'Active', count: activeJobs.length, jobs: activeJobs },
      { id: 'closed', title: 'Closed', count: closedJobs.length, jobs: closedJobs },
    ];
  }, [jobs, selectedStatus]);

  const handleJobClick = (jobId: string) => {
    router.push(`/job-dashboard/${jobId}`);
  };

  // 🎨 Circle color helper
  const getCircleColor = (id: string) => {
    switch (id) {
      case 'all':
        return 'text-blue-500';
      case 'draft':
        return 'text-yellow-500';
      case 'active':
        return 'text-green-500';
      case 'closed':
        return 'text-gray-500';
      default:
        return 'text-purple-500';
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Kanban Board */}
      <div className="flex-1 flex gap-3 lg:gap-4 xl:gap-5 overflow-x-auto pb-4">
        {columns.map((column) => (
          <div
            key={column.id}
            className="flex-1 min-w-[260px] sm:min-w-[280px] lg:min-w-[300px] xl:min-w-[320px] flex flex-col"
          >
            {/* Column Header */}
            <div className="mb-3 flex-shrink-0">
              <div className="flex items-center justify-between p-2.5 lg:p-3 bg-white rounded-lg border border-[#E7E9EB]">
                <div className="flex items-center gap-2">
                  {/* 🔵 Circle icon */}
                  <Circle
                    className={`h-3.5 w-3.5 ${getCircleColor(column.id)}`}
                    strokeWidth={2}
                  />
                  <h3 className="text-sm lg:text-base font-semibold text-[#1D2025]">
                    {column.title}
                  </h3>
                  <span className="bg-[#F3F4F6] text-[#6B7280] text-xs font-medium px-1.5 py-0.5 rounded-full">
                    {column.count}
                  </span>
                </div>
              </div>
            </div>

            {/* Column Content */}
            <div className="flex-1 space-y-2 lg:space-y-3 overflow-y-auto">
              {column.jobs.map((job) => (
                <JobCard key={job.id} job={job} onClick={() => handleJobClick(job.id)} />
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
