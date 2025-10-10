'use client';

import React from 'react';
import { Bell, Search, Filter, Plus } from 'lucide-react';
import { JobDashboardBreadcrumb } from './breadcrumb';
import { CandidateTabs } from './candidate-tabs';
import { CandidateThreeColumnLayout } from './candidate-three-column-layout';
import { Button } from '@/components/ui/button';
import { Job } from '@/services/jobs.service';

interface JobDashboardContentProps {
  job?: Job;
}

export function JobDashboardContent({ job }: JobDashboardContentProps) {
  // Get job title from the job data or fallback
  const jobTitle = job?.sections?.basic_information?.title || 'Job Role';
  const jobLocation = job?.sections?.basic_information?.location_text || 'Location TBD';
  return (
    <div className="flex-1 flex flex-col bg-[#F9FAFA] overflow-hidden">
      {/* Top Navbar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          {/* Left side - Breadcrumb */}
          <JobDashboardBreadcrumb />

          {/* Right side - User actions */}
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
                  {jobTitle}
                </h1>
                <p className="text-[#6B7280]">
                  Manage and track applications for this job role • {jobLocation}
                </p>
                {job && (
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-sm text-[#6B7280]">
                      Job ID: {job.id}
                    </span>
                    <span className="text-sm text-[#6B7280]">
                      Status: <span className="capitalize">{job.status}</span>
                    </span>
                  </div>
                )}
              </div>
              <Button className="flex items-center gap-2 shadow-sm">
                <Plus className="w-4 h-4" />
                Add Application
              </Button>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCard
                title="Candidates Reached Out"
                value="234"
                change="+12 this week"
                positive={true}
              />
              <StatsCard
                title="Interested Candidates"
                value="89"
                change="+8 today"
                positive={true}
              />
              <StatsCard
                title="Ready for Review"
                value="45"
                change="+5 this week"
                positive={true}
              />
              <StatsCard
                title="Total Applications"
                value="1,234"
                change="+47 total"
                positive={true}
              />
            </div>
          </div>

          {/* Controls Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold text-[#1D2025]">
                  Application Pipeline
                </h2>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="flex items-center gap-2 shadow-sm">
                    <Filter className="w-4 h-4" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm" className="shadow-sm">
                    Export
                  </Button>
                </div>
              </div>
              <CandidateTabs />
            </div>

            {/* Main Content Layout */}
            <CandidateThreeColumnLayout />
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  positive: boolean;
}

function StatsCard({ title, value, change, positive }: StatsCardProps) {
  return (
    <div className="bg-white rounded-lg p-6 border border-[#E5E7EB] shadow-sm">
      <h3 className="text-sm font-medium text-[#6B7280] mb-2">{title}</h3>
      <div className="flex items-end justify-between">
        <span className="text-3xl font-bold text-[#1D2025]">{value}</span>
        <span className={`text-xs font-medium ${positive ? 'text-green-600' : 'text-red-600'}`}>
          {change}
        </span>
      </div>
    </div>
  );
}
