'use client';

import React, { useState } from 'react';
import { Bell, Filter, Plus } from 'lucide-react';
import { DashboardBreadcrumb } from './breadcrumb';
import { JobsKanbanBoard } from './jobs-kanban-board';
import { FilterBar, JobStatus } from './filter-bar';
import { JobStatusTabs, JobStatusTabId } from './job-status-tabs';
import { Button } from '@/components/ui/button';
import { useJobs } from '@/hooks/useJobs';
import { CreateRoleModal } from '@/components/create-role-modal';

export function DashboardContent() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<JobStatus>('all');
  const [showFilterBar, setShowFilterBar] = useState(false);
  const { jobs } = useJobs();

  const handleCreateJob = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleStatusChange = (status: JobStatus) => {
    setSelectedStatus(status);
  };

  const handleTabChange = (tabId: JobStatusTabId) => {
    setSelectedStatus(tabId as JobStatus);
  };

  const toggleFilterBar = () => {
    setShowFilterBar(!showFilterBar);
  };

  // Calculate job counts for filter bar
  const jobCounts = {
    all: jobs?.length || 0,
    draft: jobs?.filter(job => job.status === 'draft').length || 0,
    active: jobs?.filter(job => job.status === 'active').length || 0,
    closed: jobs?.filter(job => job.status === 'closed').length || 0,
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F9FAFA] overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-[#E7E9EB] px-4 lg:px-6 py-3 lg:py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <DashboardBreadcrumb />
          </div>
          <div className="flex items-center space-x-4">
            {/* <Button
              variant="outline"
              size="sm"
              onClick={toggleFilterBar}
              className={showFilterBar ? 'bg-blue-50 border-blue-200 text-blue-700' : ''}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button> */}
            <Button size="sm" onClick={handleCreateJob}>
              <Plus className="h-4 w-4 mr-2" />
              Create Job
            </Button>
            <div className="relative">
              <Bell className="h-5 w-5 text-gray-600" />
              <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></div>
            </div>
           
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-3 lg:px-4 xl:px-6 py-3 lg:py-4 xl:py-6 overflow-hidden flex flex-col">
        {/* Page Header */}
        <div className="mb-4 lg:mb-6 flex-shrink-0">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-[#1D2025] mb-1 lg:mb-2">Jobs</h1>
              <p className="text-[#6B7280] text-sm">Track and Manage your jobs</p>
            </div>

            {/* Job Status Tabs */}
            <div className="flex-shrink-0">
              <JobStatusTabs
                totalCount={jobCounts.all}
                draftCount={jobCounts.draft}
                activeCount={jobCounts.active}
                closedCount={jobCounts.closed}
                activeTab={selectedStatus as JobStatusTabId}
                onTabChange={handleTabChange}
              />
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        {showFilterBar && (
          <div className="mb-4 flex-shrink-0">
            <FilterBar
              selectedStatus={selectedStatus}
              onStatusChange={handleStatusChange}
              jobCounts={jobCounts}
            />
          </div>
        )}

        {/* Jobs Kanban Board */}
        <div className="flex-1 overflow-hidden">
          <JobsKanbanBoard selectedStatus={selectedStatus} />
        </div>
      </div>

      {/* Create Role Modal */}
      <CreateRoleModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}


