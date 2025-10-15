'use client';

import React from 'react';
import { ArrowLeft, User, Mail, Phone, Linkedin, GraduationCap, MapPin, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Job } from '@/services/jobs.service';
import { Candidate, CandidateEducation } from '@/types/candidates';
import { ProfileAvatar } from '@/components/ui/profile-avatar';

interface CandidateDetailViewProps {
  job: Job;
  candidate: Candidate;
}

export function CandidateDetailView({ job, candidate }: CandidateDetailViewProps) {
  const router = useRouter();

  const handleBackClick = () => {
    router.back();
  };

  // Safely extract candidate information with fallbacks
  const candidateName = candidate.personal_info?.full_name?.trim() ||
                       `${candidate.personal_info?.first_name || ''} ${candidate.personal_info?.last_name || ''}`.trim() ||
                       'Unknown Candidate';

  const candidateTitle = candidate.professional_info?.current_title?.trim() ||
                        'Data Analyst'; // Default title based on sample data

  const candidateEmail = candidate.contact_info?.email?.trim() || null;
  const candidatePhone = candidate.contact_info?.phone?.trim() || null;
  const candidateLinkedIn = candidate.contact_info?.linkedin_url?.trim() ||
                           candidate.linkedin_url?.trim() || null;

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
    <div className="flex-1 bg-white border-l border-gray-200">
      {/* Main Content Container - 373px width as per Figma */}
      <div className="w-[373px] h-full overflow-y-auto bg-white">

        {/* Header Section - Matching Figma padding */}
        <div className="px-6 pt-6 pb-6 border-b border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBackClick}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
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
              <h1 className="text-xl font-semibold text-[#1D2025] mb-1">{candidateName}</h1>
              <p className="text-base text-[#6B7280] mb-2">{candidateTitle}</p>
              
              {/* Contact Information */}
              <div className="space-y-1">
                {candidateEmail && (
                  <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                    <Mail className="w-4 h-4" />
                    <span>{candidateEmail}</span>
                  </div>
                )}
                {candidatePhone && (
                  <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                    <Phone className="w-4 h-4" />
                    <span>{candidatePhone}</span>
                  </div>
                )}
                {candidateLinkedIn && (
                  <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                    <Linkedin className="w-4 h-4" />
                    <a 
                      href={candidateLinkedIn} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:text-[#8952E0] transition-colors"
                    >
                      LinkedIn Profile
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Match Score */}
          <div className="w-full">
            <div className="inline-flex items-center justify-center w-full px-8 py-2 bg-[#E5E7EB] rounded-full">
              <span className="text-sm font-medium text-[#1D2025]">{matchScore}% Match Score</span>
            </div>
          </div>
        </div>

        {/* Content Sections - Matching Figma spacing */}
        <div className="px-6 py-6 space-y-6">
          
          {/* Summary Section */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-[#1D2025]">Summary</h3>
            <p className="text-sm text-[#6B7280] leading-relaxed">
              Strong technical skills match with React/Node.js stack. Location preference aligns. 
              Compensation expectations within range. Excellent communication skills and proven 
              track record in agile development environments.
            </p>
          </div>

          {/* Education Section */}
          <EducationSection education={candidate.education} />

          {/* Experience Section */}
          <ExperienceSection workExperience={candidate.work_experience} />

          {/* Skills Section */}
          <SkillsSection skills={candidate.skills} />

        </div>
      </div>
    </div>
  );
}

interface EducationSectionProps {
  education?: CandidateEducation[] | any;
}

function EducationSection({ education }: EducationSectionProps) {
  // Handle both array and non-array education data
  const educationArray = Array.isArray(education) ? education : [];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-[#1D2025] flex items-center gap-2">
        <GraduationCap className="w-5 h-5 text-[#6B7280]" />
        Education
      </h3>
      <div className="space-y-6">
        {educationArray.length > 0 ? (
          educationArray.map((edu, index) => (
            <EducationItem
              key={index}
              degree={edu.degree}
              institution={edu.institution}
              location={edu.location}
              duration={edu.duration}
            />
          ))
        ) : (
          <p className="text-sm text-[#6B7280]">No education information available</p>
        )}
      </div>
    </div>
  );
}

interface EducationItemProps {
  degree: string;
  institution: string;
  location?: string;
  duration: string;
}

function EducationItem({ degree, institution, location, duration }: EducationItemProps) {
  return (
    <div className="space-y-3">
      <h4 className="font-semibold text-[#1D2025] text-base">{degree}</h4>
      <div className="space-y-2">
        {location && (
          <div className="flex items-center gap-2 text-sm text-[#6B7280]">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span>{institution}, {location}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm text-[#6B7280]">
          <Calendar className="w-4 h-4 flex-shrink-0" />
          <span>{duration}</span>
        </div>
      </div>
    </div>
  );
}

interface ExperienceItemProps {
  title: string;
  company: string;
  location: string;
  duration: string;
  description?: string;
}

function ExperienceItem({ title, company, location, duration, description }: ExperienceItemProps) {
  return (
    <div className="space-y-2">
      <h4 className="font-medium text-[#1D2025]">{title}</h4>
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-sm text-[#6B7280]">
          <MapPin className="w-4 h-4" />
          <span>{company}, {location}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-[#6B7280]">
          <Calendar className="w-4 h-4" />
          <span>{duration}</span>
        </div>
        {description && (
          <p className="text-sm text-[#6B7280] mt-2 leading-relaxed">{description}</p>
        )}
      </div>
    </div>
  );
}

interface ExperienceSectionProps {
  workExperience?: any[];
}

function ExperienceSection({ workExperience }: ExperienceSectionProps) {
  const experienceArray = Array.isArray(workExperience) ? workExperience : [];

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-[#1D2025] flex items-center gap-2">
        <div className="w-5 h-5 text-[#6B7280]">
          💼
        </div>
        Experience
      </h3>
      <div className="space-y-4">
        {experienceArray.length > 0 ? (
          experienceArray.map((exp, index) => (
            <ExperienceItem
              key={index}
              title={exp.title}
              company={exp.company}
              location={exp.location}
              duration={exp.duration}
              description={exp.description}
            />
          ))
        ) : (
          <p className="text-sm text-[#6B7280]">No work experience information available</p>
        )}
      </div>
    </div>
  );
}

interface SkillsSectionProps {
  skills?: string[] | any;
}

function SkillsSection({ skills }: SkillsSectionProps) {
  const skillsArray = Array.isArray(skills) ? skills : [];

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-[#1D2025] flex items-center gap-2">
        <div className="w-5 h-5 text-[#6B7280]">
          🛠️
        </div>
        Skills
      </h3>
      <div className="flex flex-wrap gap-2">
        {skillsArray.length > 0 ? (
          skillsArray.map((skill: string) => (
            <span
              key={skill}
              className="px-3 py-1 bg-[#F3F4F6] text-[#1D2025] text-sm rounded-full"
            >
              {skill}
            </span>
          ))
        ) : (
          <p className="text-sm text-[#6B7280]">No skills information available</p>
        )}
      </div>
    </div>
  );
}
