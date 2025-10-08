'use client';

import React from 'react';
import { JobDashboardSidebar } from '@/components/job-dashboard/sidebar';
import { JobDashboardContent } from '@/components/job-dashboard/content';

export default function JobDashboardPage() {
  return (
    <div className="min-h-screen bg-[#F9FAFA]">
      {/* Main Layout Container */}
      <div className="flex h-screen">
        {/* Left Sidebar */}
        <JobDashboardSidebar />

        {/* Main Content Area */}
        <JobDashboardContent />
      </div>
    </div>
  );
}
