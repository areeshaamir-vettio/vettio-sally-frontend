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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Extract job information from sections
  const title = job.sections?.basic_information?.title || 'Untitled Job';
  const location = job.sections?.basic_information?.location || job.sections?.job_details?.location || 'Remote';
  const department = job.sections?.basic_information?.department || job.sections?.job_details?.department || 'Engineering';
  const salaryRange = job.sections?.compensation?.salary_range || job.sections?.job_details?.salary_range || '$80,000 - $120,000';
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

        {/* Job Details - Two columns layout */}
        <div className="space-y-2">
          {/* Row 1: Company & Location */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-[#6B7280] flex-1 min-w-0">
              <Building2 className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{company}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-[#6B7280] flex-1 min-w-0">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{location}</span>
            </div>
          </div>

          {/* Row 2: Job Type & Salary */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-[#6B7280] flex-1 min-w-0">
              <Clock className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{jobType}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-[#6B7280] flex-1 min-w-0">
              <DollarSign className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{salaryRange}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
