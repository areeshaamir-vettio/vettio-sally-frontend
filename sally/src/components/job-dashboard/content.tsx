'use client';

import React, { useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Bell, Search, Filter, Plus } from 'lucide-react';
import { JobDashboardBreadcrumb } from './breadcrumb';
import { CandidateTabs } from './candidate-tabs';
import { CandidateThreeColumnLayout } from './candidate-three-column-layout';
import { CandidateDetailPanel } from './candidate-detail-panel';
import { Button } from '@/components/ui/button';
import { Job } from '@/services/jobs.service';
import { useRoleCandidates } from '@/hooks/useRoleCandidates';
import { Candidate } from '@/types/candidates';

interface JobDashboardContentProps {
  job?: Job;
}

export function JobDashboardContent({ job }: JobDashboardContentProps) {
  const params = useParams();
  const searchParams = useSearchParams();
  const urlJobId = params.jobId as string;

  // State for candidate detail panel
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  console.log('🏢 JobDashboardContent: Component rendered with job:', job);
  console.log('🏢 JobDashboardContent: Job ID from prop:', job?.id);
  console.log('🏢 JobDashboardContent: Job ID from URL:', urlJobId);

  // Use job ID from prop, fallback to URL parameter
  const effectiveJobId = job?.id || urlJobId;
  console.log('🏢 JobDashboardContent: Effective Job ID:', effectiveJobId);

  // Use a stable options object to prevent infinite re-renders
  const candidatesOptions = React.useMemo(() => ({ limit: 100 }), []);
  const { candidates, totalCount } = useRoleCandidates(effectiveJobId, candidatesOptions);

  // Handle candidate selection
  const handleCandidateSelect = (candidate: Candidate) => {
    // Enhance candidate with mock data for detail view
    const enhancedCandidate = enhanceCandidateWithMockData(candidate);
    setSelectedCandidate(enhancedCandidate);
    setIsPanelOpen(true);
  };

  // Handle panel close
  const handlePanelClose = () => {
    setIsPanelOpen(false);
    setSelectedCandidate(null);
  };

  // Function to enhance candidate with mock data
  const enhanceCandidateWithMockData = (candidate: Candidate): Candidate => {
    return {
      ...candidate,
      education: candidate.education || [
        {
          degree: 'Masters of Science in Computer Sciences',
          institution: 'Columbia University',
          location: 'New York, NY',
          duration: '2020 - 2022'
        },
        {
          degree: 'Bachelor of Science in Computer Science',
          institution: 'University of California, Berkeley',
          location: 'Berkeley, CA',
          duration: '2016 - 2020'
        }
      ],
      work_experience: candidate.work_experience || [
        {
          title: candidate.professional_info?.current_title || 'Senior Frontend Developer',
          company: candidate.professional_info?.current_company || 'Tech Solutions Inc.',
          location: 'San Francisco, CA',
          duration: '2022 - Present',
          description: 'Lead frontend development for enterprise SaaS platform using React, TypeScript, and Next.js.'
        },
        {
          title: 'Frontend Developer',
          company: 'StartupXYZ',
          location: 'Remote',
          duration: '2020 - 2022',
          description: 'Built responsive web applications and implemented modern UI/UX designs.'
        }
      ],
      skillsList: candidate.skillsList || ['React', 'TypeScript', 'Next.js', 'TailwindCSS', 'Node.js', 'GraphQL', 'AWS', 'Docker']
    };
  };

  console.log('📈 JobDashboardContent: Candidates data:', {
    jobId: job?.id,
    candidatesCount: candidates.length,
    totalCount,
    candidates: candidates.slice(0, 2) // Log first 2 candidates for debugging
  });

  // Safely calculate counts for different statuses (using mock logic since API doesn't provide status)
  const safeCandidates = Array.isArray(candidates) ? candidates : [];
  const newCount = safeCandidates.filter((_, index) => index % 3 === 0).length;
  const shortlistedCount = safeCandidates.filter((_, index) => index % 3 === 1).length;
  const rejectedCount = safeCandidates.filter((_, index) => index % 3 === 2).length;
  // Get job title from the job data or fallback
  const jobTitle = job?.sections?.basic_information?.title || 'Job Role';
  const jobLocation = job?.sections?.basic_information?.location_text || 'Location TBD';
  return (
    <div className={`flex-1 flex flex-col bg-[#F9FAFA] overflow-hidden transition-all duration-300 ${isPanelOpen ? 'mr-[373px]' : ''}`}>
      {/* Top Navbar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          {/* Left side - Breadcrumb */}
          <JobDashboardBreadcrumb job={job} />

          {/* Right side - User actions */}
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5 text-[#6B7280]" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Search className="w-5 h-5 text-[#6B7280]" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 p-10 overflow-y-auto">
        <div className="max-w-full mx-auto space-y-4">
          {/* Header Section */}
          <div className="space-y-4">
            {/* Page Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-[#1D2025] mb-2">
                  {jobTitle}
                </h1>
                <p className="text-[#6B7280]">
                  Track candidates and shortlist
                </p>
               
              </div>
              
              
             
            </div>
              <div className="space-y-4">
           
            
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <StatsCard
                title="Candidates Reached Out"
                value="234"
                change="+12 this week"
                positive={true}
              />
              <StatsCard
                title="Interested Candidates"
                value="89"
                change="+8 today"
                positive={true}
              />
              <StatsCard
                title="Ready for Review"
                value="45"
                change="+5 this week"
                positive={true}
              />
              {/* <StatsCard
                title="Total Applications"
                value="1,234"
                change="+47 total"
                positive={true}
              /> */}
            </div>
          </div>


          <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold text-[#1D2025] mb-2 mt-4">
                  Candidates Ready For Review
                </h1>
                <p className="text-[#6B7280] mb-4">
                 These candidates have both shown interest and passed our initial evaluation. They align with your requirements and are now ready for your review. Once you’re ready, you can take the next step.
                </p>
              
              </div>
                        
            </div>
          {/* Controls Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold text-[#1D2025]">
                  Candidates
                </h2>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="flex items-center gap-2 shadow-sm border-gray-300">
                    <Filter className="w-4 h-4" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm" className="shadow-sm border-gray-300">
                    Export
                  </Button>
                </div>
              </div>
              <CandidateTabs
                totalCount={totalCount}
                newCount={newCount}
                shortlistedCount={shortlistedCount}
                rejectedCount={rejectedCount}
              />
            </div>

            {/* Main Content Layout */}
            <CandidateThreeColumnLayout
              roleId={effectiveJobId}
              onCandidateSelect={handleCandidateSelect}
            />

            {/* Debug Info */}
            {/* {process.env.NODE_ENV === 'development' && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-semibold text-yellow-800 mb-2">Debug Info:</h4>
                <p className="text-sm text-yellow-700">Job ID from prop: {job?.id || 'undefined'}</p>
                <p className="text-sm text-yellow-700">Job ID from URL: {urlJobId || 'undefined'}</p>
                <p className="text-sm text-yellow-700">Effective Job ID: {effectiveJobId || 'undefined'}</p>
                <p className="text-sm text-yellow-700">Job Object Keys: {job ? Object.keys(job).join(', ') : 'No job object'}</p>
                <p className="text-sm text-yellow-700">Candidates Count: {candidates.length}</p>
                <p className="text-sm text-yellow-700">Total Count: {totalCount}</p>
              </div>
            )} */}
          </div>
        </div>
      </div>

      {/* Candidate Detail Panel - Fixed Position */}
      {isPanelOpen && selectedCandidate && job && (
        <div className="fixed top-0 right-0 h-full z-50">
          <CandidateDetailPanel
            job={job}
            candidate={selectedCandidate}
            onClose={handlePanelClose}
          />
        </div>
      )}
    </div>
  );
}

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  positive: boolean;
}

function StatsCard({ title, value, change, positive }: StatsCardProps) {
  // Get the appropriate icon based on the title
  const getIconPath = () => {
    switch (title) {
      case 'Candidates Reached Out':
        return '/assets/reachedout.svg';
      case 'Interested Candidates':
        return '/assets/interested.svg';
      case 'Ready for Review':
        return '/assets/reviewready.svg';
      case 'Total Applications':
        return '/assets/welcome-card.svg'; // Fallback icon
      default:
        return '/assets/welcome-card.svg'; // Default fallback
    }
  };

  return (
    <div className="bg-white rounded border border-[#E2E8F0] shadow-sm">
      {/* Card Content */}
      <div className="p-5">
        {/* Header with Icon and Stat */}
        <div className="flex items-center justify-between mb-5">
          {/* Stat Section */}
          <div className="flex-1">
            <div className="mb-1">
              <h3 className="text-sm font-normal text-[#1E293B] mb-1">{title}</h3>
            </div>
            <div className="flex items-center gap-3.5">
              <span className="text-2xl font-semibold text-[#1E293B]">{value}</span>
              {/* Change Indicator */}
              <div className="flex items-center gap-1">
                {positive ? (
                  <svg className="w-4 h-4 text-[#059669]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 4l8 8h-6v8h-4v-8H4l8-8z"/>
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-[#DC2626]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 20l-8-8h6V4h4v8h6l-8 8z"/>
                  </svg>
                )}
                <span className={`text-sm font-normal opacity-80 ${positive ? 'text-[#059669]' : 'text-[#DC2626]'}`}>
                  {change}
                </span>
              </div>
            </div>
          </div>

          {/* Icon Section */}
          <div className="ml-2">
            <Image
              src={getIconPath()}
              alt={title}
              width={40}
              height={40}
              className="w-10 h-10"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
