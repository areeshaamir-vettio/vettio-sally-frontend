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
    <nav className="flex items-center space-x-2 text-sm">
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <ChevronRight className="w-4 h-4 text-[#6B7280]" />
          )}
          {item.href && !item.isActive ? (
            <a
              href={item.href}
              className="text-[#6B7280] hover:text-[#1D2025] transition-colors"
            >
              {item.label}
            </a>
          ) : (
            <span
              className={
                item.isActive
                  ? 'text-[#1D2025] font-medium'
                  : 'text-[#6B7280]'
              }
            >
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

// Default breadcrumb for Jobs
export function JobsBreadcrumb() {
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Jobs', isActive: true }
  ];

  return <Breadcrumb items={breadcrumbItems} />;
}
