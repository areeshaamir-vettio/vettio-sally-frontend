'use client';

import React from 'react';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
  isActive?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav 
      className="flex items-center"
      style={{
        width: '189px',
        height: '24px'
      }}
    >
      <ol className="flex items-center space-x-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="w-4 h-4 text-[#9CA3AF] mx-2" />
            )}
            {item.href && !item.isActive ? (
              <a
                href={item.href}
                className="text-sm text-[#6B7280] hover:text-[#1D2025] transition-colors"
              >
                {item.label}
              </a>
            ) : (
              <span 
                className={`text-sm ${
                  item.isActive 
                    ? 'text-[#1D2025] font-medium' 
                    : 'text-[#6B7280]'
                }`}
              >
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

// Job Dashboard breadcrumb with dynamic job title
interface JobDashboardBreadcrumbProps {
  job?: {
    id: string;
    sections?: {
      basic_information?: {
        title?: string;
      };
    };
  } | null;
}

export function JobDashboardBreadcrumb({ job }: JobDashboardBreadcrumbProps) {
  // Debug logging to see what data we're receiving
  console.log('🔍 JobDashboardBreadcrumb - RENDER CALLED');
  console.log('🔍 JobDashboardBreadcrumb - job is null/undefined:', job === null || job === undefined);
  console.log('🔍 JobDashboardBreadcrumb - Full job object:', job);

  if (job) {
    console.log('🔍 JobDashboardBreadcrumb - Job ID:', job.id);
    console.log('🔍 JobDashboardBreadcrumb - job.sections:', job?.sections);
    console.log('🔍 JobDashboardBreadcrumb - job.sections.basic_information:', job?.sections?.basic_information);
    console.log('🔍 JobDashboardBreadcrumb - job.sections.basic_information.title:', job?.sections?.basic_information?.title);
  } else {
    console.log('🔍 JobDashboardBreadcrumb - Job is null/undefined, using fallback');
  }

  // Check if sections exists and what keys it has
  if (job?.sections) {
    console.log('🔍 JobDashboardBreadcrumb - Available section keys:', Object.keys(job.sections));
    // Check each section for title-like properties
    Object.keys(job.sections).forEach(key => {
      console.log(`🔍 JobDashboardBreadcrumb - sections.${key}:`, (job.sections as Record<string, unknown>)[key]);
    });
  }

  // Extract job title from job data using the correct structure
  const jobTitle = job?.sections?.basic_information?.title || 'Job Role';

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Job Dashboard', href: '/dashboard' },
    { label: jobTitle, isActive: true }
  ];

  return <Breadcrumb items={breadcrumbItems} />;
}
