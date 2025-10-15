'use client';

import React, { useState } from 'react';
import { Bell, Search, Plus } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { JobsBreadcrumb } from './breadcrumb';
import { JobsTabs } from './tabs';
import { JobsKanbanBoard } from './kanban-board';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useJobsContext } from '@/contexts/JobsContext';
import { getJobDisplayTitle, getStatusColorClass, getPriorityColorClass, getRelativeTime } from '@/utils/job-helpers';
import { CreateRoleModal } from '@/components/create-role-modal';
import { apiClient } from '@/lib/api-client';

export function JobsContent() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { jobs, loading: jobsLoading, error: jobsError, fetchJobs } = useJobsContext();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleCreateJob = () => {
    setIsCreateModalOpen(true);
  };

  const handleModalClose = () => {
    setIsCreateModalOpen(false);
  };

  const handleJobCreated = () => {
    // Refresh the jobs list after successful creation
    fetchJobs();
  };

  const handleJobClick = async (jobId: string) => {
    try {
      console.log('🔄 Dashboard: Fetching role details for job:', jobId);

      // Call the GET /api/v1/intake/roles/{role_id} API
      const roleData = await apiClient.getRole(jobId);
      console.log('✅ Dashboard: Role data fetched:', roleData);
      console.log('🔍 Dashboard: is_complete value:', roleData.is_complete);

      // Check if role is complete and redirect accordingly
      if (roleData.is_complete === false) {
        console.log('🔄 Dashboard: Role is incomplete, redirecting to conversational-ai');
        router.push(`/conversational-ai?roleId=${jobId}`);
      } else {
        console.log('✅ Dashboard: Role is complete, redirecting to job dashboard');
        router.push(`/job-dashboard/${jobId}`);
      }
    } catch (error) {
      console.error('❌ Dashboard: Error fetching role data:', error);
      // On error, default to job dashboard
      router.push(`/job-dashboard/${jobId}`);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F9FAFA] overflow-hidden">
      {/* Top Navbar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          {/* Left side - Breadcrumb */}
          <JobsBreadcrumb />

          {/* Right side - Action buttons only */}
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5 text-[#6B7280]" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Search className="w-5 h-5 text-[#6B7280]" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="max-w-full mx-auto space-y-4">
          {/* Header Section */}
          <div className="space-y-4">
            {/* Page Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-[#1D2025] mb-2">
                  Jobs
                </h1>
                <p className="text-[#6B7280]">
                  Manage and track all job positions and applications
                </p>
              </div>
              <Button onClick={handleCreateJob} className="flex items-center gap-2 shadow-sm">
                <Plus className="w-4 h-4" />
                Create Job
              </Button>
            </div>
          </div>

          {/* Controls Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="mb-4 overflow-x-auto">
              <JobsTabs />
            </div>

            {/* Jobs List */}
            <div className="space-y-4">
              {jobsLoading && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#171A1D] mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading jobs...</p>
                </div>
              )}

              {jobsError && (
                <div className="text-center py-8">
                  <p className="text-red-600 mb-4">Error loading jobs: {jobsError}</p>
                  <Button onClick={() => fetchJobs()} variant="outline">
                    Try Again
                  </Button>
                </div>
              )}

              {!jobsLoading && !jobsError && jobs.length === 0 && (
                <div className="text-center py-12">
                  <div className="mb-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Plus className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No jobs yet</h3>
                    <p className="text-gray-600 mb-6">Get started by creating your first job posting</p>
                    <Button onClick={handleCreateJob} className="flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Create Your First Job
                    </Button>
                  </div>
                </div>
              )}

              {!jobsLoading && !jobsError && jobs.length > 0 && (
                <div className="grid gap-4">
                  {jobs.map((job) => (
                    <div
                      key={job.id}
                      className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleJobClick(job.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {job.title}
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColorClass(job.priority)}`}>
                              {job.priority}
                            </span>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColorClass(job.status)}`}>
                              {job.status}
                            </span>
                            <span>•</span>
                            <span>{job.location_text|| 'No workflow'}</span>
                            <span>•</span>
                            <span>{job.application_count} applications</span>
                          </div>

                          {/* Tags */}
                          {job.tags && job.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {job.tags.slice(0, 3).map((tag, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 text-xs rounded-md bg-gray-100 text-gray-700"
                                  style={{ backgroundColor: tag.color ? `${tag.color}20` : undefined }}
                                >
                                  {tag.name}
                                </span>
                              ))}
                              {job.tags.length > 3 && (
                                <span className="px-2 py-1 text-xs rounded-md bg-gray-100 text-gray-700">
                                  +{job.tags.length - 3} more
                                </span>
                              )}
                            </div>
                          )}

                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            {/* <span>Created {getRelativeTime(job.created_at)}</span>
                            <span>•</span>
                            <span>{job.view_count} views</span> */}
                            {job.published_at && (
                              <>
                                <span>•</span>
                                <span>Published {getRelativeTime(job.published_at)}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              // TODO: Add edit functionality
                              console.log('Edit job:', job.id);
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleJobClick(job.id);
                            }}
                          >
                            View
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create Role Modal */}
      <CreateRoleModal
        isOpen={isCreateModalOpen}
        onClose={handleModalClose}
        onSuccess={handleJobCreated}
      />
    </div>
  );
}
