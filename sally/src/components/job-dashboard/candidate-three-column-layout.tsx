'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Star,
  AlertCircle
} from 'lucide-react';
import { useRoleCandidates } from '@/hooks/useRoleCandidates';
import { Candidate } from '@/types/candidates';
import { ProfileAvatar } from '@/components/ui/profile-avatar';
import { Circle, MoreVertical } from "lucide-react";


interface CandidateThreeColumnLayoutProps {
  roleId?: string;
  onCandidateSelect?: (candidate: Candidate) => void;
}

export function CandidateThreeColumnLayout({ roleId, onCandidateSelect }: CandidateThreeColumnLayoutProps) {
  console.log('🎯 CandidateThreeColumnLayout: Component rendered with roleId:', roleId);

  // Use a stable options object to prevent infinite re-renders
  // Start with very small limit for fastest initial load
  const candidatesOptions = React.useMemo(() => ({ limit: 12 }), []);
  const { candidates, loading, error, totalCount, refetch } = useRoleCandidates(roleId, candidatesOptions);

  console.log('📊 CandidateThreeColumnLayout: Hook state:', {
    roleId,
    candidatesCount: candidates.length,
    loading,
    error,
    totalCount
  });

  // Safely filter candidates by status (for now using mock status since API doesn't provide it)
  const allCandidates = Array.isArray(candidates) ? candidates : [];
  const newCandidates = allCandidates.filter((_, index) => index % 3 === 0); // Mock filtering
  const shortlistedCandidates = allCandidates.filter((_, index) => index % 3 === 1); // Mock filtering

  // Helper function to render empty state
  const renderEmptyState = (message: string, icon: React.ReactNode) => (
    <div className="text-center py-12">
      <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
        {icon}
      </div>
      <p className="text-gray-500 text-sm">{message}</p>
    </div>
  );

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((col) => (
          <div key={col} className="bg-gray-50 rounded-xl p-4 min-h-[700px]">
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading candidates...</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="col-span-3 bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Unable to load candidates</h3>
          <p className="text-red-600 mb-6 max-w-md mx-auto">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={refetch}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Refresh Page
            </button>
          </div>

          {/* Additional help text for common errors */}
          <div className="mt-6 text-sm text-red-600">
            {error.includes('Authentication') && (
              <p>💡 Try logging out and logging back in</p>
            )}
            {error.includes('permission') && (
              <p>💡 Contact your administrator for access to this role</p>
            )}
            {error.includes('Network') && (
              <p>💡 Check your internet connection and try again</p>
            )}
            {error.includes('not found') && (
              <p>💡 This role may not exist or may have been deleted</p>
            )}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col xl:flex-row gap-4 xl:gap-7 h-full overflow-hidden">
      {/* Column 1 - All Candidates */}
      <div className="flex-1 min-h-[300px] xl:min-h-[700px] max-w-full">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Circle className="h-4 w-4 text-orange-500" strokeWidth={2} />
            <h3 className="text-lg text-[#1D2025]">All Candidates</h3>
            <h6 className="text-[#6B7280] text-sm">{allCandidates.length}</h6>
          </div>
          <button
            className="p-2 rounded-full hover:bg-gray-100 transition"
            aria-label="More actions"
          >
            <MoreVertical className="h-5 w-5 text-[#1D2025]" />
          </button>
        </div>

        <div className="space-y-3 max-h-[640px] overflow-y-auto">
          {allCandidates.length === 0
            ? renderEmptyState("No candidates found", <User className="w-full h-full" />)
            : allCandidates.map((candidate) => (
                <CandidateCard
                  key={candidate.id}
                  candidate={candidate}
                  roleId={roleId}
                  onCandidateSelect={onCandidateSelect}
                />
              ))}
        </div>
      </div>

      {/* Column 2 - New Candidates */}
      <div className="flex-1 min-h-[300px] xl:min-h-[700px] max-w-full">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Circle className="h-4 w-4 text-blue-500" strokeWidth={2} />
            <h3 className="text-lg text-[#1D2025]">New</h3>
            <h6 className="text-[#6B7280] text-sm">{newCandidates.length}</h6>
          </div>
          <button
            className="p-2 rounded-full hover:bg-gray-100 transition"
            aria-label="More actions"
          >
            <MoreVertical className="h-5 w-5 text-[#1D2025]" />
          </button>
        </div>

        <div className="space-y-3 max-h-[640px] overflow-y-auto">
          {newCandidates.length === 0
            ? renderEmptyState("No new candidates", <User className="w-full h-full" />)
            : newCandidates.map((candidate) => (
                <CandidateCard
                  key={`new-${candidate.id}`}
                  candidate={candidate}
                  roleId={roleId}
                  onCandidateSelect={onCandidateSelect}
                />
              ))}
        </div>
      </div>

      {/* Column 3 - Shortlisted */}
      <div className="flex-1 min-h-[300px] xl:min-h-[700px] max-w-full">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Circle className="h-4 w-4 text-green-500" strokeWidth={2} />
            <h3 className="text-lg text-[#1D2025]">Shortlisted</h3>
            <h6 className="text-[#6B7280] text-sm">{shortlistedCandidates.length}</h6>
          </div>
          <button
            className="p-2 rounded-full hover:bg-gray-100 transition"
            aria-label="More actions"
          >
            <MoreVertical className="h-5 w-5 text-[#1D2025]" />
          </button>
        </div>

        <div className="space-y-3 max-h-[640px] overflow-y-auto">
          {shortlistedCandidates.length === 0
            ? renderEmptyState("No shortlisted candidates", <Star className="w-full h-full" />)
            : shortlistedCandidates.map((candidate) => (
                <CandidateCard
                  key={`shortlisted-${candidate.id}`}
                  candidate={candidate}
                  roleId={roleId}
                  onCandidateSelect={onCandidateSelect}
                />
              ))}
        </div>
      </div>
    </div>

  );
}



interface CandidateCardProps {
  candidate: Candidate;
  roleId?: string;
  onCandidateSelect?: (candidate: Candidate) => void;
}

function CandidateCard({ candidate, roleId, onCandidateSelect }: CandidateCardProps) {
  const router = useRouter();

  // Generate fake match score (70-95% range)
  const generateMatchScore = (candidateId: string) => {
    // Use candidate ID to generate consistent score
    const hash = candidateId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return Math.abs(hash % 26) + 70; // 70-95% range
  };

  // Safely extract candidate information with fallbacks
  const candidateName = candidate.personal_info?.full_name?.trim() ||
                       `${candidate.personal_info?.first_name || ''} ${candidate.personal_info?.last_name || ''}`.trim() ||
                       'Unknown Candidate';

  const candidateTitle = candidate.professional_info?.current_title?.trim() ||
                        'Data Analyst'; // Default title based on the sample data

  const candidateEmail = candidate.contact_info?.email?.trim() ||
                        'No email available';

  const candidateLinkedIn = candidate.contact_info?.linkedin_url?.trim() ||
                           candidate.linkedin_url?.trim() || null;

  // Get profile picture URL with fallbacks
  const profilePictureUrl = candidate.personal_info?.profile_picture_url?.trim() || null;

  // Additional info available but not currently displayed in card view

  // Generate match score
  const matchScore = generateMatchScore(candidate.id);

  const handleCardClick = () => {
    if (onCandidateSelect) {
      onCandidateSelect(candidate);
    } else if (roleId) {
      // Fallback to navigation if no callback provided
      router.push(`/job-dashboard/${roleId}/candidate/${candidate.id}`);
    }
  };

  return (
    <div
      className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Card Content with proper padding matching Figma */}
      <div className="px-5 pt-4 pb-5">

        {/* Header Section - Name and Actions */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            {/* Profile Picture with fallback */}
            <ProfileAvatar
              src={profilePictureUrl}
              alt={candidateName}
              size="md"
            />
            <div>
              <h4 className="font-semibold text-[#1D2025] text-base leading-tight">{candidateName}</h4>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {candidateLinkedIn && (
              <a
                href={candidateLinkedIn}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 hover:bg-gray-50 rounded-md transition-colors"
                title="View LinkedIn Profile"
              >
                <svg className="w-7 h-7 text-gray-300 hover:text-gray-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            )}
          </div>
        </div>

        {/* Contact Information Section */}
        <div className="mb-5">
          <p className="text-md text-[#6B7280] mb-1">{candidateTitle}</p>

          {/* Email */}
          <p className="text-md text-[#6B7280] mb-1">
            {candidateEmail}
          </p>

          {/* Additional info - Location or Company */}
          {/* {candidateLocation && candidateLocation !== 'Location not specified' && (
            <p className="text-sm text-[#6B7280] mb-1">
              📍 {candidateLocation}
            </p>
          )} */}

          {/* Experience level */}
          {/* {candidateExperience && candidateExperience !== 'Experience level not specified' && (
            <p className="text-sm text-[#6B7280]">
              💼 {candidateExperience}
            </p>
          )} */}
        </div>

        {/* Match Score Tag - Full Width */}
        <div className="w-full">
          <div className="inline-flex items-center justify-center w-full px-8 py-2 bg-[#E5E7EB] rounded-full">
            <span className="text-sm font-medium text-[#1D2025]">{matchScore}% Match Score</span>
          </div>
        </div>

      </div>
    </div>
  );
}
