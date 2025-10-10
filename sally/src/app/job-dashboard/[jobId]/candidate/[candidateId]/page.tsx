'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { JobDashboardSidebar } from '@/components/job-dashboard/sidebar';
import { CandidateDetailView } from '@/components/job-dashboard/candidate-detail-view';
import { jobsService, Job } from '@/services/jobs.service';
import { Candidate } from '@/types/candidates';

export default function CandidateDetailPage() {
  const params = useParams();
  const jobId = params.jobId as string;
  const candidateId = params.candidateId as string;
  const [job, setJob] = useState<Job | null>(null);
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('🔄 CandidateDetailPage: Starting to fetch data for job:', jobId, 'candidate:', candidateId);
        setLoading(true);
        setError(null);

        // Get the specific job by ID
        const jobData = await jobsService.getJob(jobId);
        setJob(jobData);

        // TODO: Fetch candidate data from API
        // For now, using mock data based on candidateId for variety
        const mockCandidates = {
          'candidate-1': {
            id: candidateId,
            organization_id: jobData.organization_id || '',
            personal_info: {
              full_name: 'Sarah Johnson',
              first_name: 'Sarah',
              last_name: 'Johnson',
              profile_picture_url: null
            },
            contact_info: {
              email: 'sarah.johnson@email.com',
              phone: '+1 (555) 123-4567',
              linkedin_url: 'https://linkedin.com/in/sarahjohnson'
            },
            professional_info: {
              current_title: 'Senior Frontend Developer',
              current_company: 'Tech Solutions Inc.',
              years_experience: 5,
              seniority_level: 'Senior'
            },
            education: [
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
            work_experience: [
              {
                title: 'Senior Frontend Developer',
                company: 'Tech Solutions Inc.',
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
            skills: ['React', 'TypeScript', 'Next.js', 'TailwindCSS', 'Node.js', 'GraphQL', 'AWS', 'Docker'],
            status: 'new',
            discovered_at: new Date().toISOString(),
            linkedin_profile_id: 'sarahjohnson'
          },
          'default': {
            id: candidateId,
            organization_id: jobData.organization_id || '',
            personal_info: {
              full_name: 'Alex Chen',
              first_name: 'Alex',
              last_name: 'Chen',
              profile_picture_url: null
            },
            contact_info: {
              email: 'alex.chen@email.com',
              phone: '+1 (555) 987-6543',
              linkedin_url: 'https://linkedin.com/in/alexchen'
            },
            professional_info: {
              current_title: 'Full Stack Developer',
              current_company: 'Innovation Labs',
              years_experience: 3,
              seniority_level: 'Mid-level'
            },
            education: [
              {
                degree: 'Bachelor of Science in Software Engineering',
                institution: 'Stanford University',
                location: 'Stanford, CA',
                duration: '2018 - 2022'
              }
            ],
            work_experience: [
              {
                title: 'Full Stack Developer',
                company: 'Innovation Labs',
                location: 'Austin, TX',
                duration: '2022 - Present',
                description: 'Develop and maintain web applications using React, Node.js, and PostgreSQL.'
              }
            ],
            skills: ['React', 'Node.js', 'PostgreSQL', 'Python', 'AWS', 'Docker', 'Git'],
            status: 'new',
            discovered_at: new Date().toISOString(),
            linkedin_profile_id: 'alexchen'
          }
        };

        const mockCandidate = mockCandidates[candidateId as keyof typeof mockCandidates] || mockCandidates.default;
        setCandidate(mockCandidate);

        console.log('✅ CandidateDetailPage: Data fetched successfully');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data';
        setError(errorMessage);
        console.error('❌ CandidateDetailPage: Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    };

    console.log('🚀 CandidateDetailPage: useEffect triggered with jobId:', jobId, 'candidateId:', candidateId);
    if (jobId && candidateId) {
      fetchData();
    } else {
      console.log('⚠️ CandidateDetailPage: Missing jobId or candidateId');
    }
  }, [jobId, candidateId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9FAFA]">
        <div className="flex h-screen">
          <JobDashboardSidebar />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading candidate details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F9FAFA]">
        <div className="flex h-screen">
          <JobDashboardSidebar />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-red-600 mb-4">Error: {error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!job || !candidate) {
    return (
      <div className="min-h-screen bg-[#F9FAFA]">
        <div className="flex h-screen">
          <JobDashboardSidebar />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-600">Candidate not found</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFA]">
      {/* Main Layout Container - Matching Figma 1536px width */}
      <div className="flex h-screen max-w-[1536px] mx-auto">
        {/* Left Sidebar - 240px width */}
        <JobDashboardSidebar />

        {/* Main Content Area - 373px width for candidate detail */}
        <CandidateDetailView job={job} candidate={candidate} />
      </div>
    </div>
  );
}
