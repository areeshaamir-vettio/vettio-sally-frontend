'use client';

import React from 'react';
import { JobsSidebar } from '@/components/jobs/sidebar';
import { JobDashboardContent } from '@/components/job-dashboard/content';

export default function JobDashboardPage() {
  return (
    <div className="min-h-screen bg-[#F9FAFA]">
      {/* Main Layout Container */}
      <div className="flex h-screen">
        {/* Left Sidebar */}
        <JobsSidebar />

        {/* Main Content Area */}
        <JobDashboardContent />
      </div>
    </div>
  );
}
