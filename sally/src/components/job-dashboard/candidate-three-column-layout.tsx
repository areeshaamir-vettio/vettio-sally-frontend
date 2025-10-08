'use client';

import React from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Star,
  MoreHorizontal,
  GraduationCap,
  Briefcase,
  Clock
} from 'lucide-react';

export function CandidateThreeColumnLayout() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Column 1 - All Applications */}
      <div className="bg-gray-50 rounded-xl p-4 min-h-[700px]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[#1D2025]">All Applications</h3>
          <span className="text-sm text-[#6B7280] bg-white px-3 py-1 rounded-full">234 total</span>
        </div>

        <div className="space-y-3 max-h-[620px] overflow-y-auto">
          <SimpleCandidateCard
            name="Sarah Johnson"
            role="Senior Frontend Developer"
            email="sarah.j@email.com"
            phone="+1 (555) 123-4567"
            status="new"
          />
          <SimpleCandidateCard
            name="Mike Chen"
            role="Frontend Developer"
            email="mike.chen@email.com"
            phone="+1 (555) 234-5678"
            status="shortlisted"
          />
          <SimpleCandidateCard
            name="Emily Davis"
            role="Frontend Developer"
            email="emily.d@email.com"
            phone="+1 (555) 345-6789"
            status="new"
          />
          <SimpleCandidateCard
            name="Alex Rodriguez"
            role="Frontend Developer"
            email="alex.r@email.com"
            phone="+1 (555) 456-7890"
            status="rejected"
          />
          <SimpleCandidateCard
            name="Jessica Wong"
            role="Frontend Developer"
            email="jessica.w@email.com"
            phone="+1 (555) 678-9012"
            status="shortlisted"
          />
        </div>
      </div>

      {/* Column 2 - New Applications */}
      <div className="bg-blue-50 rounded-xl p-4 min-h-[700px]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[#1D2025]">New</h3>
          <span className="text-sm text-[#6B7280] bg-white px-3 py-1 rounded-full">56 new</span>
        </div>

        <div className="space-y-3 max-h-[620px] overflow-y-auto">
          <SimpleCandidateCard
            name="Sarah Johnson"
            role="Frontend Developer"
            email="sarah.j@email.com"
            phone="+1 (555) 123-4567"
            status="new"
          />
          <SimpleCandidateCard
            name="Emily Davis"
            role="Frontend Developer"
            email="emily.d@email.com"
            phone="+1 (555) 345-6789"
            status="new"
          />
          <SimpleCandidateCard
            name="David Kim"
            role="Frontend Developer"
            email="david.k@email.com"
            phone="+1 (555) 567-8901"
            status="new"
          />
        </div>
      </div>

      {/* Column 3 - Shortlisted */}
      <div className="bg-green-50 rounded-xl p-4 min-h-[700px]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[#1D2025]">Shortlisted</h3>
          <span className="text-sm text-[#6B7280] bg-white px-3 py-1 rounded-full">89 shortlisted</span>
        </div>

        <div className="space-y-3 max-h-[620px] overflow-y-auto">
          <SimpleCandidateCard
            name="Mike Chen"
            role="Frontend Developer"
            email="mike.chen@email.com"
            phone="+1 (555) 234-5678"
            status="shortlisted"
          />
          <SimpleCandidateCard
            name="Jessica Wong"
            role="Frontend Developer"
            email="jessica.w@email.com"
            phone="+1 (555) 678-9012"
            status="shortlisted"
          />
        </div>
      </div>
    </div>
  );
}

interface SimpleCandidateCardProps {
  name: string;
  role: string;
  email: string;
  phone: string;
  status: 'new' | 'shortlisted' | 'rejected';
}

function SimpleCandidateCard({
  name,
  role,
  email,
  phone,
  status
}: SimpleCandidateCardProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'shortlisted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-[#8952E0] to-[#7A47CC] rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-[#1D2025] text-base">{name}</h4>
            <p className="text-sm text-[#6B7280] mt-1">{role}</p>
          </div>
        </div>
        <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor()}`}>
          {status}
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3 text-sm text-[#6B7280]">
          <Mail className="w-4 h-4 text-[#8952E0]" />
          <span>{email}</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-[#6B7280]">
          <Phone className="w-4 h-4 text-[#8952E0]" />
          <span>{phone}</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <button className="w-full text-sm text-[#8952E0] hover:text-[#7A47CC] font-medium transition-colors">
          View Profile
        </button>
      </div>
    </div>
  );
}
