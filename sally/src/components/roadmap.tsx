'use client';

import { useMemo } from 'react';
import { Check, Clock, Circle } from 'lucide-react';
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
    switch (status) {
      case 'completed':
        return <Check className="w-4 h-4 text-white" />;
      case 'in-progress':
        return <Clock className="w-4 h-4 text-white" />;
      case 'pending':
        return <Circle className="w-4 h-4 text-[#9CA3AF]" />;
      default:
        return <span className="text-xs font-medium text-[#9CA3AF]">{stepNumber}</span>;
    }
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

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-[#1D2025] mb-4">
          {roadmap.title}
        </h2>
        <div className="flex items-center justify-between text-xs mb-3">
          <span className="text-[#6B7280]">
            {roadmap.steps.filter(s => s.status === 'completed').length} of {roadmap.steps.length} completed
          </span>
          <span className="text-[#6B7280]">{roadmap.overallProgress}%</span>
        </div>
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
                  className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    step.status === 'completed'
                      ? 'bg-[#8952E0] border-[#8952E0] text-white shadow-lg'
                      : step.status === 'in-progress'
                      ? 'bg-white border-[#8952E0] text-[#8952E0] shadow-md'
                      : 'bg-white border-[#E5E7EB] text-[#9CA3AF]'
                  }`}
                >
                  {getStatusIcon(step.status, step.stepNumber)}
                </div>

                {/* Step Content */}
                <div className="ml-4 flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-medium text-[#1D2025]">
                      {step.title}
                    </h3>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      step.status === 'completed'
                        ? 'bg-[#8952E0]/10 text-[#8952E0]'
                        : step.status === 'in-progress'
                        ? 'bg-[#F59E0B]/10 text-[#F59E0B]'
                        : 'bg-[#6B7280]/10 text-[#6B7280]'
                    }`}>
                      {getStatusText(step.status)}
                    </span>
                  </div>
                  {step.description && (
                    <p className="text-xs text-[#6B7280] leading-relaxed">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Current Step Details */}
      {roadmap.steps.find(s => s.status === 'in-progress') && (
        <div className="bg-[#F8F9FA] rounded-lg p-4">
          <h3 className="text-sm font-medium text-[#1D2025] mb-2">
            Current Step: {roadmap.steps.find(s => s.status === 'in-progress')?.title}
          </h3>
          <p className="text-xs text-[#6B7280] leading-relaxed">
            {roadmap.steps.find(s => s.status === 'in-progress')?.description}
          </p>
        </div>
      )}
    </div>
  );
}
