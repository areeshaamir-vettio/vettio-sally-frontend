'use client';

import React from 'react';
import { JobsSidebar } from '@/components/jobs/sidebar';
import { JobsContent } from '@/components/jobs/content';

export default function JobsPage() {
  return (
    <div className="min-h-screen bg-[#F9FAFA]">
      <div className="flex h-screen">
        <JobsSidebar />
        <JobsContent />
      </div>
    </div>
  );
}
