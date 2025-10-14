'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Home,
  Search,
  Users,
  FileText,
  MessageSquare,
  Settings,
  ChevronRight,
  User,
  Bell,
  Briefcase
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useJobs } from '@/hooks/useJobs';

interface SidebarNavItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  isActive?: boolean;
  href?: string;
  onClick?: () => void;
}

export function JobDashboardSidebar() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { jobs, loading: jobsLoading, error: jobsError } = useJobs();
  const params = useParams();
  const currentJobId = params.jobId as string;

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full shadow-sm">
      {/* Header */}
      <div className="px-6 py-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-gray-200 shadow-sm">
            <Image
              src="/assets/vettio-logo.png"
              alt="Vettio Logo"
              width={20}
              height={20}
              className="object-contain"
            />
          </div>
          <span className="text-lg font-semibold text-[#1D2025]">Vettio</span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-4 py-6 overflow-y-auto">
        {/* Job Dashboard Section */}
        <div className="space-y-1 mb-6">
          <SidebarNavItem
            icon={Briefcase}
            label="Job Dashboard"
            isActive={true}
          />

          {/* Job Role Subsections */}
          <div className="ml-6 space-y-1 mt-2">
            {jobsLoading ? (
              <div className="text-sm text-gray-500 px-3 py-2">
                Loading jobs...
              </div>
            ) : jobsError ? (
              <div className="text-sm text-red-500 px-3 py-2">
                Error loading jobs
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-sm text-gray-500 px-3 py-2">
                No jobs found
              </div>
            ) : (
              jobs.map((job) => (
                <SidebarNavItem
                  key={job.id}
                  icon={Users}
                  label={job.role?.basic_information?.title || 'Untitled Job'}
                  isActive={currentJobId === job.id}
                  href={`/job-dashboard/${job.id}`}
                />
              ))
            )}
          </div>
        </div>

        {/* Outreach Section */}
        <div className="space-y-1 mb-6">
          <SidebarNavItem
            icon={MessageSquare}
            label="Outreach"
            isActive={false}
          />
        </div>

        {/* Account Section */}
        <div className="space-y-1">
          <SidebarNavItem
            icon={User}
            label="Account"
            isActive={false}
          />

          {/* Account Subsections */}
          <div className="ml-6 space-y-1 mt-2">
            <SidebarNavItem
              icon={User}
              label="Profile"
              isActive={false}
            />
            <SidebarNavItem
              icon={Settings}
              label="Settings"
              isActive={false}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      {isAuthenticated && user && (
        <div className="px-4 py-4 border-t border-gray-200">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center border border-gray-200">
              <span className="text-sm font-medium text-[#1D2025]">
                {user.full_name?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-medium text-[#1D2025] truncate">{user.full_name}</p>
                {user.is_admin && (
                  <span className="px-1.5 py-0.5 bg-gradient-to-r from-[#8952E0] to-[#7A47CC] text-white text-xs font-medium rounded-full flex-shrink-0">
                    Admin
                  </span>
                )}
              </div>
              <p className="text-xs text-[#6B7280] truncate">{user.email}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface SidebarNavItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  isActive?: boolean;
}

function SidebarNavItem({ icon: Icon, label, isActive = false, href, onClick }: SidebarNavItemProps) {
  const content = (
    <>
      <Icon className="w-5 h-5" />
      <span className="text-sm font-medium">{label}</span>
      {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
    </>
  );

  const className = `flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 ${
    isActive
      ? 'bg-gradient-to-r from-[#8952E0] to-[#7A47CC] text-white shadow-sm'
      : 'text-[#6B7280] hover:bg-gray-50 hover:text-[#1D2025]'
  }`;

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <div className={className} onClick={onClick}>
      {content}
    </div>
  );
}

interface SidebarTagProps {
  label: string;
  count: number;
}

function SidebarTag({ label, count }: SidebarTagProps) {
  return (
    <div className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
      <span className="text-sm text-[#6B7280]">{label}</span>
      <span className="text-xs bg-[#8952E0]/10 text-[#8952E0] px-2 py-1 rounded-full font-medium">
        {count}
      </span>
    </div>
  );
}
