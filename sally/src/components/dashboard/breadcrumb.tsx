'use client';

import React from 'react';
import { ChevronRight } from 'lucide-react';

export function DashboardBreadcrumb() {
  return (
    <nav className="flex items-center space-x-2 text-sm">
      <span className="text-[#6B7280]">Job Dashboard</span>
      {/* <ChevronRight className="w-4 h-4 text-[#6B7280]" />
      <span className="text-[#1D2025] font-medium">All Candidates</span> */}
    </nav>
  );
}
