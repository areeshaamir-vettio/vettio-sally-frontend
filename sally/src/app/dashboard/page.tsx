'use client';

import React from 'react';
import { JobsSidebar } from '@/components/jobs/sidebar';
import { DashboardContent } from '@/components/dashboard/content';

export default function DashboardPage() {
  return (
    <div className="h-screen bg-[#F9FAFA] overflow-hidden">
      <div className="flex h-full">
        <JobsSidebar />
        <DashboardContent />
      </div>
    </div>
  );
}
