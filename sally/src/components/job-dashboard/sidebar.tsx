'use client';

import React from 'react';
import Image from 'next/image';
import {
  Home,
  Search,
  Users,
  FileText,
  MessageSquare,
  Settings,
  ChevronRight,
  User,
  Bell
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export function JobDashboardSidebar() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full shadow-sm">
      {/* Sidebar Header */}
      <div className="flex items-center px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <Image
            src="/assets/vettio-logo.png"
            alt="Vettio Logo"
            width={28}
            height={28}
            className="object-contain"
          />
          <span className="text-lg font-semibold text-[#1D2025]">Vettio</span>
        </div>
      </div>

      {/* Navigation Section */}
      <div className="flex-1 px-4 py-6 overflow-y-auto">
        {/* Organization Section */}
        <div className="space-y-1 mb-6">
          <SidebarNavItem
            icon={Home}
            label="Organization"
            isActive={false}
          />
          <SidebarNavItem
            icon={Home}
            label="Overview"
            isActive={false}
          />
        </div>

        {/* Main Navigation */}
        <div className="space-y-1 mb-6">
          <SidebarNavItem
            icon={Users}
            label="Members"
            isActive={false}
          />
          <SidebarNavItem
            icon={FileText}
            label="Plans"
            isActive={false}
          />
          <SidebarNavItem
            icon={Settings}
            label="Billing"
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
          <SidebarNavItem
            icon={User}
            label="Profile"
            isActive={false}
          />
          <SidebarNavItem
            icon={Settings}
            label="Security"
            isActive={false}
          />
          <SidebarNavItem
            icon={Bell}
            label="Notifications"
            isActive={false}
          />
          <SidebarNavItem
            icon={Settings}
            label="API"
            isActive={false}
          />
        </div>
      </div>

      {/* Sidebar Footer */}
      {/* User Profile Section */}
      {isAuthenticated && user && (
        <div className="px-4 py-4 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-200">
              <Image
                src="/assets/vettio-logo.png"
                alt="Vettio Logo"
                width={24}
                height={24}
                className="object-contain"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-medium text-[#1D2025] truncate">
                  {user.full_name}
                </p>
                {user.is_admin && (
                  <span className="px-1.5 py-0.5 bg-gradient-to-r from-[#8952E0] to-[#7A47CC] text-white text-xs font-medium rounded-full flex-shrink-0">
                    Admin
                  </span>
                )}
              </div>
              <p className="text-xs text-[#6B7280] truncate">
                {user.email}
              </p>
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

function SidebarNavItem({ icon: Icon, label, isActive = false }: SidebarNavItemProps) {
  return (
    <div
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 ${
        isActive
          ? 'bg-gradient-to-r from-[#8952E0] to-[#7A47CC] text-white shadow-sm'
          : 'text-[#6B7280] hover:bg-gray-50 hover:text-[#1D2025]'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="text-sm font-medium">{label}</span>
      {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
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
