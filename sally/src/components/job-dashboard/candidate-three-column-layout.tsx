'use client';

import React from 'react';
import {
  User,
  Star,
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import { useRoleCandidates } from '@/hooks/useRoleCandidates';
import { Candidate } from '@/types/candidates';

interface CandidateThreeColumnLayoutProps {
  roleId?: string;
}

export function CandidateThreeColumnLayout({ roleId }: CandidateThreeColumnLayoutProps) {
  console.log('🎯 CandidateThreeColumnLayout: Component rendered with roleId:', roleId);

  // Use a stable options object to prevent infinite re-renders
  const candidatesOptions = React.useMemo(() => ({ limit: 100 }), []);
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
    <div className="flex gap-7 h-full">
      {/* Column 1 - All Applications */}
      <div className="flex-1 min-h-[700px]">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-[#1D2025]">All Applications</h3>
          <div className="flex items-center gap-3">
            <span className="text-sm text-[#6B7280] bg-white px-3 py-1.5 rounded-full border border-gray-200">
              {totalCount} total
            </span>
            <button
              onClick={() => refetch()}
              className="text-[#8952E0] text-sm font-medium hover:text-[#7A47CC] transition-colors"
              disabled={loading}
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        <div className="space-y-4 max-h-[620px] overflow-y-auto">
          {allCandidates.length === 0 ? (
            renderEmptyState(
              "No candidates found for this role yet",
              <User className="w-full h-full" />
            )
          ) : (
            allCandidates.map((candidate) => {
              // Ensure candidate has required fields
              if (!candidate || !candidate.id) {
                console.warn('Invalid candidate data:', candidate);
                return null;
              }

              return (
                <CandidateCard
                  key={candidate.id}
                  candidate={candidate}
                />
              );
            }).filter(Boolean) // Remove null entries
          )}
        </div>
      </div>

      {/* Column 2 - New Applications */}
      <div className="flex-1 min-h-[700px]">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-[#1D2025]">New</h3>
          <span className="text-sm text-[#6B7280] bg-white px-3 py-1.5 rounded-full border border-gray-200">
            {newCandidates.length} new
          </span>
        </div>

        <div className="space-y-4 max-h-[620px] overflow-y-auto">
          {newCandidates.length === 0 ? (
            renderEmptyState(
              "No new candidates at the moment",
              <User className="w-full h-full" />
            )
          ) : (
            newCandidates.map((candidate) => {
              if (!candidate || !candidate.id) {
                console.warn('Invalid new candidate data:', candidate);
                return null;
              }

              return (
                <CandidateCard
                  key={`new-${candidate.id}`}
                  candidate={candidate}
                />
              );
            }).filter(Boolean)
          )}
        </div>
      </div>

      {/* Column 3 - Shortlisted */}
      <div className="flex-1 min-h-[700px]">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-[#1D2025]">Shortlisted</h3>
          <span className="text-sm text-[#6B7280] bg-white px-3 py-1.5 rounded-full border border-gray-200">
            {shortlistedCandidates.length} shortlisted
          </span>
        </div>

        <div className="space-y-4 max-h-[620px] overflow-y-auto">
          {shortlistedCandidates.length === 0 ? (
            renderEmptyState(
              "No candidates shortlisted yet",
              <Star className="w-full h-full" />
            )
          ) : (
            shortlistedCandidates.map((candidate) => {
              if (!candidate || !candidate.id) {
                console.warn('Invalid shortlisted candidate data:', candidate);
                return null;
              }

              return (
                <CandidateCard
                  key={`shortlisted-${candidate.id}`}
                  candidate={candidate}
                />
              );
            }).filter(Boolean)
          )}
        </div>
      </div>
    </div>
  );
}



function CandidateCard({ candidate }: { candidate: Candidate }) {
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
                        'No title available';

  const candidateEmail = candidate.contact_info?.email?.trim() || null;
  const candidateLinkedIn = candidate.contact_info?.linkedin_url?.trim() ||
                           candidate.linkedin_url?.trim() || null;

  // Generate match score
  const matchScore = generateMatchScore(candidate.id);

  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Card Content with proper padding matching Figma */}
      <div className="px-5 pt-4 pb-5">

        {/* Header Section - Name and Actions */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#8952E0] to-[#7A47CC] rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
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
            {/* <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F1F2F4] hover:bg-[#E5E7EB] rounded-md text-sm font-medium text-[#1D2025] transition-colors">
              <ExternalLink className="w-3.5 h-3.5" />
              View Details
            </button> */}
          </div>
        </div>

        {/* Contact Information Section */}
        <div className="mb-5">
          <p className="text-md text-[#6B7280] mb-1">{candidateTitle}</p>
          
          <p className="text-md text-[#6B7280]">emailplaceholder@gmail.com</p>
        
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
