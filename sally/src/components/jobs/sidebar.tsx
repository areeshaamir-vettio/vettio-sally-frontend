'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Home,
  Search,
  Users,
  FileText,
  MessageSquare,
  Settings,
  ChevronRight,
  ChevronDown,
  User,
  Bell,
  Briefcase,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useJobs } from '@/hooks/useJobs';

interface SidebarNavItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  isActive?: boolean;
  href?: string;
  onClick?: () => void;
  hasChevron?: boolean;
  isExpanded?: boolean;
}

export function JobsSidebar() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { jobs, loading: jobsLoading, error: jobsError } = useJobs();
  const router = useRouter();
  const [isProfileExpanded, setIsProfileExpanded] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  const handleSignOutClick = () => {
    setShowSignOutModal(true);
  };

  const handleConfirmSignOut = async () => {
    try {
      await logout();
      setShowSignOutModal(false);
      router.push('/auth/login');
    } catch (error) {
      console.error('Sign out error:', error);
      setShowSignOutModal(false);
    }
  };

  const handleCancelSignOut = () => {
    setShowSignOutModal(false);
  };

  // Debug logging
  console.log('JobsSidebar - Auth State:', { user, isAuthenticated, isLoading });

  // Show loading state while authentication is being checked
  if (isLoading) {
    return (
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full shadow-sm">
        <div className="flex items-center justify-center h-full">
          <div className="text-sm text-gray-500">Loading...</div>
        </div>
      </div>
    );
  }

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
          <span className="font-semibold text-[#1D2025] text-lg">Vettio</span>
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
            href="/dashboard"
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
                  label={job.sections?.basic_information?.title || 'Untitled Job'}
                  isActive={false}
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
              hasChevron={true}
              isExpanded={isProfileExpanded}
              onClick={() => setIsProfileExpanded(!isProfileExpanded)}
            />

            {/* Profile Submenu */}
            {isProfileExpanded && (
              <div className="ml-6 space-y-1 mt-1">
                <SidebarNavItem
                  icon={LogOut}
                  label="Sign Out"
                  isActive={false}
                  onClick={handleSignOutClick}
                />
              </div>
            )}

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
              <Image
                src="/assets/vettio-logo.png"
                alt="Vettio Logo"
                width={20}
                height={20}
                className="object-contain"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-medium text-[#1D2025] truncate">{user.full_name}</p>
              </div>
              <p className="text-xs text-[#6B7280] truncate">{user.email}</p>
            </div>
          </div>
        </div>
      )}

      {/* Sign Out Confirmation Modal */}
      {showSignOutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <LogOut className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Sign Out</h3>
                <p className="text-sm text-gray-600">Are you sure you want to sign out?</p>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancelSignOut}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSignOut}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SidebarNavItem({ icon: Icon, label, isActive = false, href, onClick, hasChevron = false, isExpanded = false }: SidebarNavItemProps) {
  const content = (
    <>
      <Icon className="w-5 h-5" />
      <span className="text-sm font-medium">{label}</span>
      {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
      {hasChevron && !isActive && (
        isExpanded ?
          <ChevronDown className="w-4 h-4 ml-auto" /> :
          <ChevronRight className="w-4 h-4 ml-auto" />
      )}
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
