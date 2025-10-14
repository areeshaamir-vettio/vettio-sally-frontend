'use client';

import React from 'react';
import { MapPin, Eye, ExternalLink, GraduationCap, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProfileAvatar } from '@/components/ui/profile-avatar';

interface CandidateCardProps {
  candidate: {
    id: string;
    name: string;
    title: string;
    location: string;
    company: string;
    matchScore: number;
    avatar?: string | null;
    education: {
      degree: string;
      institution: string;
    };
    experience: {
      role: string;
      company: string;
    };
  };
}

export function CandidateCard({ candidate }: CandidateCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 w-full max-w-[320px] h-[482px]">
      {/* Card Content */}
      <div className="p-5 h-full flex flex-col">

        {/* Header - Avatar and Name */}
        <div className="flex items-center gap-3 mb-3">
          <ProfileAvatar
            src={candidate.avatar}
            alt={candidate.name}
            size="md"
          />
          <div>
            <h3 className="font-semibold text-[#1D2025] text-base leading-tight">
              {candidate.name}
            </h3>
          </div>
        </div>

        {/* Job Title */}
        <div className="mb-3">
          <p className="text-sm font-medium text-[#6B7280]">
            {candidate.title}
          </p>
        </div>

        {/* Location and Company */}
        <div className="flex items-center gap-1 mb-4">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-[#6B7280]">
            {candidate.location} | {candidate.company}
          </span>
        </div>

        {/* Match Score */}
        <div className="mb-4">
          <div className="inline-flex items-center px-3 py-1 bg-green-100 rounded-full">
            <span className="text-sm font-medium text-green-800">
              {candidate.matchScore}% Match Score
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mb-5">
          <Button variant="outline" size="sm" className="flex-1 text-xs h-8 px-2">
            <Eye className="w-3 h-3 mr-1" />
            Resume
          </Button>
          <Button variant="outline" size="sm" className="flex-1 text-xs h-8 px-2">
            <ExternalLink className="w-3 h-3 mr-1" />
            LinkedIn
          </Button>
        </div>

        {/* Education Section */}
        <div className="mb-4">
          <div className="flex items-start gap-2">
            <GraduationCap className="w-4 h-4 text-gray-400 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-[#1D2025] mb-1">Education</p>
              <p className="text-xs text-[#6B7280] leading-4">
                {candidate.education.degree} from {candidate.education.institution}
              </p>
            </div>
          </div>
        </div>

        {/* Experience Section */}
        <div className="mb-6">
          <div className="flex items-start gap-2">
            <Briefcase className="w-4 h-4 text-gray-400 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-[#1D2025] mb-1">Experience</p>
              <p className="text-xs text-[#6B7280] leading-4">
                {candidate.experience.role} at {candidate.experience.company}
              </p>
            </div>
          </div>
        </div>

        {/* Decision Buttons - At bottom */}
        <div className="mt-auto flex gap-2">
          <Button
            variant="default"
            size="sm"
            className="flex-1 bg-[#8952E0] hover:bg-[#7A47CC] text-white text-xs h-9"
          >
            Good Match
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs h-9 border-gray-300"
          >
            Not A Match
          </Button>
        </div>

      </div>
    </div>
  );
}
