'use client';

import React from 'react';
import { Check } from 'lucide-react';

export type JobStatus = 'all' | 'draft' | 'active' | 'closed';

interface FilterBarProps {
  selectedStatus: JobStatus;
  onStatusChange: (status: JobStatus) => void;
  jobCounts: {
    all: number;
    draft: number;
    active: number;
    closed: number;
  };
}

export function FilterBar({ selectedStatus, onStatusChange, jobCounts }: FilterBarProps) {
  const filters = [
    { id: 'all' as JobStatus, label: 'All Jobs', count: jobCounts.all },
    { id: 'draft' as JobStatus, label: 'Draft', count: jobCounts.draft },
    { id: 'active' as JobStatus, label: 'Active', count: jobCounts.active },
    { id: 'closed' as JobStatus, label: 'Closed', count: jobCounts.closed },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-900">Filter by Status</h3>
        <button
          onClick={() => onStatusChange('all')}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Clear filters
        </button>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => onStatusChange(filter.id)}
            className={`
              inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
              ${selectedStatus === filter.id
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
              }
            `}
          >
            {selectedStatus === filter.id && (
              <Check className="h-4 w-4" />
            )}
            <span>{filter.label}</span>
            <span className={`
              px-2 py-0.5 rounded-full text-xs font-medium
              ${selectedStatus === filter.id
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600'
              }
            `}>
              {filter.count}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
