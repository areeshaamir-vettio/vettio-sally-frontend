'use client';

import { useMemo } from 'react';
// import { Check, Clock, Circle } from 'lucide-react';
import { RoadmapStep } from '@/types/conversational-ai';
import { mapRoleToRoadmap } from '@/lib/mappers/role-enhancement-mapper';
import { RoleData } from '@/types/role-enhancement';

interface RoadmapProps {
  roadmapId: string;
  roleData: RoleData | null; // Changed to receive role data directly
  isLoading?: boolean; // Loading state from parent
  onError?: (error: string) => void; // Added for error handling
}

export function Roadmap({ roadmapId, roleData, isLoading = false }: RoadmapProps) {
  // Map role data to roadmap format using useMemo to avoid recalculation
  const roadmap = useMemo(() => {
    if (!roleData) return null;
    return mapRoleToRoadmap(roleData, roadmapId);
  }, [roleData, roadmapId]);

  const error = !roleData && !isLoading ? 'No role data available' : null;

  const getStatusIcon = (status: RoadmapStep['status'], stepNumber: number) => {
    // Always show step number instead of icons
    return <span className="text-sm font-normal text-white leading-5">{stepNumber}</span>;
  };

  const getStatusText = (status: RoadmapStep['status']) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'in-progress':
        return 'In Progress';
      case 'pending':
        return 'Pending';
      default:
        return 'Pending';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !roadmap) {
    return (
      <div className="p-6 text-center">
        <p className="text-[#6B7280] mb-2">
          {error || 'Failed to load roadmap'}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="text-sm text-[#8952E0] hover:underline"
        >
          Retry
        </button>
      </div>
    );
  }

  const completedCount = roadmap.steps.filter(s => s.status === 'completed').length;
  const pendingCount = roadmap.steps.length - completedCount;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-sm font-normal text-[#0E1012] leading-5 mb-4">
          {roadmap.title}
        </h2>
      </div>

      {/* Vertical Progress Line */}
      <div className="mb-6">
        <div className="relative">
          {/* Vertical Progress Line Background */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-[#E5E7EB]"></div>

          {/* Vertical Progress Line Fill */}
          <div
            className="absolute left-4 top-0 w-0.5 bg-[#8952E0] transition-all duration-700 ease-out"
            style={{
              height: `${(roadmap.steps.filter(s => s.status === 'completed').length / roadmap.steps.length) * 100}%`
            }}
          ></div>

          {/* Step Items */}
          <div className="space-y-6">
            {roadmap.steps.map((step) => (
              <div key={step.id} className="relative flex items-start">
                {/* Step Circle */}
                <div
                  className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${
                    step.status === 'completed' || step.status === 'in-progress'
                      ? 'bg-[#8952E0]'
                      : 'bg-[#E5E7EB]'
                  }`}
                >
                  {getStatusIcon(step.status, step.stepNumber)}
                </div>

                {/* Step Content */}
                <div className="ml-4 flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className={`text-sm font-medium leading-6 ${
                      step.status === 'in-progress' ? 'text-[#1D2025]' : 'text-[#52555A]'
                    }`}>
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-xs font-normal text-[#52555A] leading-4">
                    {getStatusText(step.status)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Progress Summary */}
      <div className="mt-6 pt-6 border-t border-[#E5E7EB]">
        <div className="flex items-center justify-between text-sm font-normal leading-5">
          <div className="flex items-center space-x-2">
            <span className="text-black">Completed</span>
            <span className="text-[#0E1012]">{completedCount}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-black">Pending</span>
            <span className="text-[#0E1012]">{pendingCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
