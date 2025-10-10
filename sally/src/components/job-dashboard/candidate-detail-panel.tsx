'use client';

import React from 'react';
import { X, User, Mail, Phone, Linkedin, GraduationCap, MapPin, Calendar, Clock, CheckCircle, AlertCircle, FileText, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Job } from '@/services/jobs.service';
import { Candidate, CandidateEducation } from '@/types/candidates';

interface CandidateDetailPanelProps {
  job: Job;
  candidate: Candidate;
  onClose: () => void;
}

export function CandidateDetailPanel({ job, candidate, onClose }: CandidateDetailPanelProps) {
  // Safely extract candidate information with fallbacks
  const candidateName = candidate.personal_info?.full_name?.trim() ||
                       `${candidate.personal_info?.first_name || ''} ${candidate.personal_info?.last_name || ''}`.trim() ||
                       'Unknown Candidate';

  const candidateTitle = candidate.professional_info?.current_title?.trim() ||
                        'Software Engineer';

  const candidateEmail = candidate.contact_info?.email?.trim() || 'john.doe@example.com';

  // Generate match score (mock data)
  const generateMatchScore = (candidateId: string) => {
    const hash = candidateId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return Math.abs(hash % 26) + 70; // 70-95% range
  };

  const matchScore = generateMatchScore(candidate.id);

  return (
    <div className="w-[373px] h-full bg-white border-l border-[#E5E7EB] flex flex-col">
      {/* Header with Close Button */}
      <div className="px-6 pt-6 pb-4 border-b border-[#E5E7EB] flex-shrink-0">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-[#111827]">Candidate Profile</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="flex items-center gap-2 border-[#D1D5DB] hover:bg-[#F9FAFB]"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Candidate Profile Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-semibold text-[#111827] mb-1">{candidateName}</h1>
            <p className="text-base font-normal text-[#6B7280] mb-2">{candidateTitle}</p>

            {/* Contact Information */}
            <div className="flex items-center gap-2 text-sm font-normal text-[#6B7280]">
              <Mail className="w-4 h-4" />
              <span>{candidateEmail}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mb-6">
          <Button size="sm" className="flex-1 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-medium">
            Review Email
          </Button>
          <Button variant="outline" size="sm" className="flex-1 border-[#D1D5DB] hover:bg-[#F9FAFB] font-medium">
            <FileText className="w-4 h-4 mr-2" />
            View Resume
          </Button>
        </div>

        {/* Upcoming Interview Tab */}
        <div className="mb-6 p-3 bg-[#EFF6FF] border border-[#DBEAFE] rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-[#2563EB]" />
            <span className="text-sm font-medium text-[#2563EB]">Upcoming Interview</span>
          </div>
          <p className="text-xs font-normal text-[#6B7280]">Scheduled for Dec 15, 2024 at 2:00 PM</p>
        </div>

        {/* Overall Match Section */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-[#111827] mb-3">Overall Match</h4>
          <div className="flex items-center gap-2 mb-3">
            <span className="px-3 py-1 bg-[#8B5CF6] text-white text-sm font-medium rounded-full">
              {matchScore}% Match Score
            </span>
          </div>
          <p className="text-xs font-normal text-[#6B7280] leading-relaxed">
            Strong technical skills match with React/Node.js stack. Location preference aligns. Compensation expectations within range.
          </p>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {/* Details Section */}
        <DetailsSection candidate={candidate} />

        {/* Key Highlights Section */}
        <KeyHighlightsSection />

        {/* Requirement Match Analysis */}
        <RequirementMatchAnalysis />

        {/* Experience Section */}
        <ExperienceSection experience={candidate.work_experience} />

        {/* Education Section */}
        <EducationSection education={candidate.education} />
      </div>
    </div>
  );
}

// Details Section Component
function DetailsSection({ candidate }: { candidate: Candidate }) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-[#111827] mb-4">Details</h3>
      <div className="space-y-4">
        {/* Job Applied Status */}
        <div className="flex justify-between items-center py-2">
          <span className="text-sm font-normal text-[#6B7280]">Job Applied</span>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-[#10B981]" />
            <span className="text-sm font-medium text-[#111827]">Interview Scheduled</span>
          </div>
        </div>
        <div className="border-b border-[#F3F4F6]"></div>

        {/* Salary Expectation */}
        <div className="flex justify-between items-center py-2">
          <span className="text-sm font-normal text-[#6B7280]">Salary Expectation</span>
          <span className="text-sm font-medium text-[#111827]">$120,000 - $140,000</span>
        </div>
        <div className="border-b border-[#F3F4F6]"></div>

        {/* Notice Period */}
        <div className="flex justify-between items-center py-2">
          <span className="text-sm font-normal text-[#6B7280]">Notice Period:</span>
          <span className="text-sm font-medium text-[#111827]">2 weeks</span>
        </div>
        <div className="border-b border-[#F3F4F6]"></div>

        {/* Applied Date */}
        <div className="flex justify-between items-center py-2">
          <span className="text-sm font-normal text-[#6B7280]">Applied Date</span>
          <span className="text-sm font-medium text-[#111827]">Dec 1, 2024</span>
        </div>
      </div>
    </div>
  );
}

// Key Highlights Section Component
function KeyHighlightsSection() {
  const highlights = [
    "5+ years of React development experience",
    "Led team of 8 developers at previous role",
    "Experience with microservices architecture",
    "Strong background in TypeScript and Node.js"
  ];

  return (
    <div>
      <div className="border-b border-[#E5E7EB] mb-6"></div>
      <h3 className="text-lg font-semibold text-[#111827] mb-4">Key Highlights</h3>
      <div className="space-y-3">
        {highlights.map((highlight, index) => (
          <div key={index} className="flex items-start gap-3">
            <CheckCircle className="w-4 h-4 text-[#10B981] mt-0.5 flex-shrink-0" />
            <span className="text-sm font-normal text-[#374151] leading-relaxed">{highlight}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Requirement Match Analysis Component
function RequirementMatchAnalysis() {
  const requirements = [
    { requirement: "React.js", status: "Matched", color: "green" },
    { requirement: "Node.js", status: "Matched", color: "green" },
    { requirement: "TypeScript", status: "Partially Matched", color: "yellow" },
    { requirement: "AWS", status: "Matched", color: "green" },
    { requirement: "Team Leadership", status: "Matched", color: "green" }
  ];

  return (
    <div>
      <div className="border-b border-[#E5E7EB] mb-6"></div>
      <h3 className="text-lg font-semibold text-[#111827] mb-4">Requirement Match Analysis</h3>
      <div className="space-y-4">
        {requirements.map((req, index) => (
          <div key={index}>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm font-normal text-[#6B7280]">{req.requirement}</span>
              <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                req.color === 'green'
                  ? 'bg-[#ECFDF5] text-[#065F46] border border-[#D1FAE5]'
                  : 'bg-[#FFFBEB] text-[#92400E] border border-[#FDE68A]'
              }`}>
                {req.status}
              </span>
            </div>
            {index < requirements.length - 1 && <div className="border-b border-[#F3F4F6]"></div>}
          </div>
        ))}
      </div>
    </div>
  );
}

// Experience Section Component
function ExperienceSection({ experience }: { experience?: any }) {
  const mockExperience = [
    {
      title: "Senior Frontend Developer",
      company: "Tech Solutions Inc.",
      location: "San Francisco, CA",
      duration: "2022 - Present",
      description: "Lead frontend development for enterprise SaaS platform using React, TypeScript, and Next.js."
    },
    {
      title: "Frontend Developer",
      company: "StartupXYZ",
      location: "Remote",
      duration: "2020 - 2022",
      description: "Built responsive web applications and implemented modern UI/UX designs."
    }
  ];

  const experienceData = experience || mockExperience;

  return (
    <div>
      <div className="border-b border-[#E5E7EB] mb-6"></div>
      <h3 className="text-lg font-semibold text-[#111827] mb-4">Experience</h3>
      <div className="space-y-6">
        {experienceData.map((exp: any, index: number) => (
          <div key={index} className="border-l-2 border-[#E5E7EB] pl-4 relative">
            <div className="absolute w-2 h-2 bg-[#8B5CF6] rounded-full -left-1 top-1"></div>
            <h4 className="font-medium text-[#111827] mb-1">{exp.title}</h4>
            <div className="flex items-center gap-2 text-sm font-normal text-[#6B7280] mb-1">
              <span className="font-medium">{exp.company}</span>
              {exp.location && (
                <>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{exp.location}</span>
                  </div>
                </>
              )}
            </div>
            <div className="flex items-center gap-1 text-sm font-normal text-[#6B7280] mb-3">
              <Calendar className="w-3 h-3" />
              <span>{exp.duration}</span>
            </div>
            {exp.description && (
              <p className="text-sm font-normal text-[#374151] leading-relaxed">{exp.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Education Section Component
function EducationSection({ education }: { education?: CandidateEducation[] | any }) {
  const mockEducation = [
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
  ];

  const educationData = education || mockEducation;

  return (
    <div>
      <div className="border-b border-[#E5E7EB] mb-6"></div>
      <h3 className="text-lg font-semibold text-[#111827] mb-4">Education</h3>
      <div className="space-y-6">
        {educationData.map((edu: any, index: number) => (
          <div key={index} className="border-l-2 border-[#E5E7EB] pl-4 relative">
            <div className="absolute w-2 h-2 bg-[#8B5CF6] rounded-full -left-1 top-1"></div>
            <h4 className="font-medium text-[#111827] mb-1">{edu.degree}</h4>
            <div className="flex items-center gap-2 text-sm font-normal text-[#6B7280] mb-1">
              <span className="font-medium">{edu.institution}</span>
              {edu.location && (
                <>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{edu.location}</span>
                  </div>
                </>
              )}
            </div>
            <div className="flex items-center gap-1 text-sm font-normal text-[#6B7280]">
              <Calendar className="w-3 h-3" />
              <span>{edu.duration}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
