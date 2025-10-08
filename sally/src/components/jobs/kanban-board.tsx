'use client';

import React from 'react';
import {
  Briefcase,
  Users,
  MapPin,
  DollarSign,
  Clock,
  MoreHorizontal
} from 'lucide-react';

export function JobsKanbanBoard() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
      {/* Column 1 - Draft Jobs */}
      <KanbanColumn
        title="Draft"
        count={3}
        color="bg-gray-50"
        jobs={draftJobs}
      />

      {/* Column 2 - Published Jobs */}
      <KanbanColumn
        title="Published"
        count={18}
        color="bg-gray-50"
        jobs={publishedJobs}
      />

      {/* Column 3 - Active Hiring */}
      <KanbanColumn
        title="Active Hiring"
        count={12}
        color="bg-gray-50"
        jobs={activeJobs}
      />

      {/* Column 4 - Closed */}
      <KanbanColumn
        title="Closed"
        count={5}
        color="bg-gray-50"
        jobs={closedJobs}
      />
    </div>
  );
}

interface KanbanColumnProps {
  title: string;
  count: number;
  color: string;
  jobs: JobCardData[];
}

function KanbanColumn({ title, count, color, jobs }: KanbanColumnProps) {
  return (
    <div className={`${color} rounded-xl p-4 min-h-[700px]`}>
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[#1D2025]">{title}</h3>
        <span className="text-sm text-[#6B7280] bg-white px-3 py-1 rounded-full">
          {count} jobs
        </span>
      </div>
      
      {/* Job Cards */}
      <div className="space-y-3 max-h-[620px] overflow-y-auto">
        {jobs.map(job => (
          <JobCard key={job.id} {...job} />
        ))}
      </div>
    </div>
  );
}

interface JobCardData {
  id: number;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  status: 'draft' | 'published' | 'active' | 'closed';
}

function JobCard({
  title,
  company,
  location,
  type,
  salary,
  status
}: JobCardData) {
  const getStatusColor = () => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'published': return 'bg-blue-100 text-blue-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-md transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#8952E0] to-[#7A47CC] rounded-lg flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-[#1D2025] text-base">{title}</h4>
            <p className="text-sm text-[#6B7280]">{company}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor()}`}>
            {status}
          </span>
          <MoreHorizontal className="w-4 h-4 text-[#6B7280] cursor-pointer" />
        </div>
      </div>
      
      {/* Job Details - Two Column Layout */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Left Side - Location & Employment Type */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-[#6B7280]">
            <MapPin className="w-4 h-4 text-[#8952E0]" />
            <span>{location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-[#6B7280]">
            <Clock className="w-4 h-4 text-[#8952E0]" />
            <span>{type}</span>
          </div>
        </div>

        {/* Right Side - Salary Range */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-[#6B7280]">
            <DollarSign className="w-4 h-4 text-[#8952E0]" />
            <span>{salary}</span>
          </div>
        </div>
      </div>

      {/* View Details Button */}
      <div className="mb-4">
        <button className="w-full bg-[#8952E0] hover:bg-[#7A47CC] text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors duration-200">
          View Details
        </button>
      </div>
      

    </div>
  );
}

// Sample data
const draftJobs: JobCardData[] = [
  {
    id: 1,
    title: "Senior Frontend Developer",
    department: "Engineering",
    location: "San Francisco, CA",
    type: "Full-time",
    salary: "$120k - $160k",
    applicants: 0,
    status: "draft"
  },
  {
    id: 2,
    title: "Product Manager",
    department: "Product",
    location: "Remote",
    type: "Full-time",
    salary: "$130k - $170k",
    applicants: 0,
    status: "draft"
  }
];

const publishedJobs: JobCardData[] = [
  {
    id: 3,
    title: "Backend Engineer",
    department: "Engineering",
    location: "New York, NY",
    type: "Full-time",
    salary: "$110k - $150k",
    applicants: 45,
    status: "published"
  },
  {
    id: 4,
    title: "UX Designer",
    department: "Design",
    location: "Austin, TX",
    type: "Full-time",
    salary: "$90k - $120k",
    applicants: 32,
    status: "published"
  }
];

const activeJobs: JobCardData[] = [
  {
    id: 5,
    title: "Data Scientist",
    department: "Data",
    location: "Seattle, WA",
    type: "Full-time",
    salary: "$140k - $180k",
    applicants: 67,
    status: "active"
  }
];

const closedJobs: JobCardData[] = [
  {
    id: 6,
    title: "DevOps Engineer",
    department: "Engineering",
    location: "Remote",
    type: "Full-time",
    salary: "$125k - $165k",
    applicants: 89,
    status: "closed"
  }
];
