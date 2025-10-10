'use client';

import React from 'react';
import { X, User, Mail, Phone, Linkedin, GraduationCap, MapPin, Calendar, Clock, CheckCircle, AlertCircle, FileText, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Job } from '@/services/jobs.service';
import { Candidate, CandidateEducation } from '@/types/candidates';
import { ProfileAvatar } from '@/components/ui/profile-avatar';

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
                        'Data Analyst'; // Default title based on sample data

  const candidateEmail = candidate.contact_info?.email?.trim() || 'No email available';

  // Get profile picture URL with fallback
  const profilePictureUrl = candidate.personal_info?.profile_picture_url?.trim() || null;

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
          {/* Profile Picture with fallback */}
          <ProfileAvatar
            src={profilePictureUrl}
            alt={candidateName}
            size="lg"
          />
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

        {/* Certifications Section */}
        <CertificationsSection certifications={candidate.certifications} />
      </div>
    </div>
  );
}

// Details Section Component
function DetailsSection({ candidate }: { candidate: Candidate }) {
  // Extract actual data with fallbacks
  const salaryExpectation = candidate.professional_info?.expected_salary
    ? `$${candidate.professional_info.expected_salary.toLocaleString()}`
    : candidate.professional_info?.current_salary
    ? `$${candidate.professional_info.current_salary.toLocaleString()} (current)`
    : 'Not specified';

  const noticePeriod = candidate.professional_info?.notice_period || 'Not specified';

  const appliedDate = candidate.discovered_at
    ? new Date(candidate.discovered_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    : 'Not available';

  const experienceYears = candidate.professional_info?.years_experience
    ? `${candidate.professional_info.years_experience} years`
    : candidate.professional_info?.seniority_level || 'Not specified';

  const workAuthorization = candidate.personal_info?.work_authorization || 'Not specified';

  const willingToRelocate = candidate.professional_info?.willing_to_relocate !== undefined
    ? (candidate.professional_info.willing_to_relocate ? 'Yes' : 'No')
    : 'Not specified';

  return (
    <div>
      <h3 className="text-lg font-semibold text-[#111827] mb-4">Details</h3>
      <div className="space-y-4">
        {/* Experience */}
        <div className="flex justify-between items-center py-2">
          <span className="text-sm font-normal text-[#6B7280]">Experience</span>
          <span className="text-sm font-medium text-[#111827]">{experienceYears}</span>
        </div>
        <div className="border-b border-[#F3F4F6]"></div>

        {/* Salary Expectation */}
        <div className="flex justify-between items-center py-2">
          <span className="text-sm font-normal text-[#6B7280]">Salary Expectation</span>
          <span className="text-sm font-medium text-[#111827]">{salaryExpectation}</span>
        </div>
        <div className="border-b border-[#F3F4F6]"></div>

        {/* Notice Period */}
        <div className="flex justify-between items-center py-2">
          <span className="text-sm font-normal text-[#6B7280]">Notice Period</span>
          <span className="text-sm font-medium text-[#111827]">{noticePeriod}</span>
        </div>
        <div className="border-b border-[#F3F4F6]"></div>

        {/* Work Authorization */}
        <div className="flex justify-between items-center py-2">
          <span className="text-sm font-normal text-[#6B7280]">Work Authorization</span>
          <span className="text-sm font-medium text-[#111827]">{workAuthorization}</span>
        </div>
        <div className="border-b border-[#F3F4F6]"></div>

        {/* Willing to Relocate */}
        <div className="flex justify-between items-center py-2">
          <span className="text-sm font-normal text-[#6B7280]">Willing to Relocate</span>
          <span className="text-sm font-medium text-[#111827]">{willingToRelocate}</span>
        </div>
        <div className="border-b border-[#F3F4F6]"></div>

        {/* Applied Date */}
        <div className="flex justify-between items-center py-2">
          <span className="text-sm font-normal text-[#6B7280]">Discovered Date</span>
          <span className="text-sm font-medium text-[#111827]">{appliedDate}</span>
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
  // Process actual education data or provide fallback
  let educationData = [];

  if (education && Array.isArray(education) && education.length > 0) {
    educationData = education.map((edu: any) => ({
      degree: edu.degree || 'Degree not specified',
      institution: edu.institution || 'Institution not specified',
      location: edu.location || '',
      duration: edu.start_date && edu.end_date
        ? `${new Date(edu.start_date).getFullYear()} - ${new Date(edu.end_date).getFullYear()}`
        : edu.duration || 'Duration not specified',
      field_of_study: edu.field_of_study || ''
    }));
  } else {
    // Fallback education data
    educationData = [
      {
        degree: 'Business Analytics & Accounting',
        institution: 'Farmingdale State College',
        location: 'New York, NY',
        duration: '2022 - 2025',
        field_of_study: 'Data'
      }
    ];
  }

  return (
    <div>
      <div className="border-b border-[#E5E7EB] mb-6"></div>
      <h3 className="text-lg font-semibold text-[#111827] mb-4">Education</h3>
      <div className="space-y-6">
        {educationData.map((edu: any, index: number) => (
          <div key={index} className="border-l-2 border-[#E5E7EB] pl-4 relative">
            <div className="absolute w-2 h-2 bg-[#8B5CF6] rounded-full -left-1 top-1"></div>
            <h4 className="font-medium text-[#111827] mb-1">
              {edu.degree}
              {edu.field_of_study && edu.field_of_study !== edu.degree && (
                <span className="text-sm font-normal text-[#6B7280]"> - {edu.field_of_study}</span>
              )}
            </h4>
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

// Certifications Section Component
function CertificationsSection({ certifications }: { certifications?: any[] }) {
  // Process actual certifications data or provide fallback
  let certificationsData = [];

  if (certifications && Array.isArray(certifications) && certifications.length > 0) {
    certificationsData = certifications.map((cert: any) => ({
      name: cert.name || 'Certification not specified',
      issuing_organization: cert.issuing_organization || 'Organization not specified',
      issue_date: cert.issue_date
        ? new Date(cert.issue_date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short'
          })
        : 'Date not specified',
      expiry_date: cert.expiry_date
        ? new Date(cert.expiry_date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short'
          })
        : null,
      credential_id: cert.credential_id || null
    }));
  }

  // Only render if there are certifications
  if (certificationsData.length === 0) {
    return null;
  }

  return (
    <div>
      <div className="border-b border-[#E5E7EB] mb-6"></div>
      <h3 className="text-lg font-semibold text-[#111827] mb-4">Certifications</h3>
      <div className="space-y-4">
        {certificationsData.map((cert: any, index: number) => (
          <div key={index} className="border border-[#E5E7EB] rounded-lg p-4">
            <h4 className="font-medium text-[#111827] mb-2">{cert.name}</h4>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                <span className="font-medium">{cert.issuing_organization}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                <Calendar className="w-3 h-3" />
                <span>Issued: {cert.issue_date}</span>
                {cert.expiry_date && (
                  <>
                    <span>•</span>
                    <span>Expires: {cert.expiry_date}</span>
                  </>
                )}
              </div>
              {cert.credential_id && (
                <div className="text-xs text-[#6B7280]">
                  Credential ID: {cert.credential_id}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
