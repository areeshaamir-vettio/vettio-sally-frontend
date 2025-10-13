'use client';

import React from 'react';
import { JobsSidebar } from '@/components/jobs/sidebar';
import { DashboardContent } from '@/components/dashboard/content';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#F9FAFA]">
      <div className="flex h-screen">
        <JobsSidebar />
        <DashboardContent />
      </div>
    </div>
  );
}
