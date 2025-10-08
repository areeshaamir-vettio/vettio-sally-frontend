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

// Default breadcrumb for Job Dashboard
export function JobDashboardBreadcrumb() {
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Job Dashboard', href: '/job-dashboard' },
    { label: 'Frontend Developer', isActive: true }
  ];

  return <Breadcrumb items={breadcrumbItems} />;
}
