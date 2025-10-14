'use client';

import React from 'react';
import { MapPin, DollarSign, Building2, Clock } from 'lucide-react';

interface JobCardProps {
  job: {
    id: string;
    status: 'draft' | 'active' | 'closed';
    created_at: string;
    application_count: number;
    sections: Record<string, any>;
  };
  onClick: () => void;
}

export function JobCard({ job, onClick }: JobCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  // Extract job information
  const title = job.sections?.basic_information?.title || 'Untitled Job';
  const location = job.sections?.basic_information?.location || job.sections?.job_details?.location || 'Remote';
  const department = job.sections?.basic_information?.department || job.sections?.job_details?.department || 'Engineering';
  const salaryRange = job.sections?.compensation?.salary_range || job.sections?.job_details?.salary_range || 'PKR 80,000 - 120,000';
  const jobType = job.sections?.job_details?.employment_type || job.sections?.basic_information?.employment_type || 'Full-time';
  const company = job.sections?.basic_information?.company || 'Vettio';

  return (
    <div
      className="bg-white rounded-lg border border-[#E7E9EB] p-5 hover:shadow-md transition-shadow cursor-pointer hover:border-[#8952E0]"
      onClick={onClick}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-[#1D2025] mb-1 line-clamp-2">
              {title}
            </h4>
            {department && (
              <p className="text-sm text-[#6B7280]">{department}</p>
            )}
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
            {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
          </span>
        </div>

        {/* Row 1: Company & Location */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-[#6B7280]">
            <Building2 className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{company}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-[#6B7280]">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{location}</span>
          </div>
        </div>

        {/* Row 2: Salary first, then Job Type */}
        <div className="flex items-center justify-between gap-4 text-sm text-[#6B7280]">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 flex-shrink-0" />
            <span className="font-medium">{salaryRange}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 flex-shrink-0" />
            <span>{jobType}</span>
          </div>
        </div>




        {/* View Details Button */}
        <div className="pt-3 border-t border-gray-100">
          <button
            className="w-full px-4 py-2 text-sm font-medium text-gray-900 bg-gray-200 border border-gray-200 rounded-md hover:bg-gray-100 hover:border-gray-300 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}
