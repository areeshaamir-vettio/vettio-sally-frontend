'use client';

import React from 'react';
import { 
  Eye, 
  Users, 
  Clock, 
  TrendingUp, 
  MapPin, 
  Calendar,
  DollarSign,
  Star,
  MoreHorizontal
} from 'lucide-react';

export function ThreeColumnLayout() {
  return (
    <div 
      className="flex gap-4"
      style={{
        width: '1276px',
        height: '662px'
      }}
    >
      {/* Column 1 - Left */}
      <div 
        className="bg-white rounded-lg p-6"
        style={{
          width: '406.67px',
          height: '646px'
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-[#1D2025]">Active Jobs</h3>
          <button className="text-[#8952E0] text-sm font-medium hover:text-[#7A47CC]">
            View All
          </button>
        </div>
        
        <div className="space-y-4">
          <JobCard
            title="Senior Frontend Developer"
            company="Vettio Technologies"
            location="San Francisco, CA"
            salary="$120k - $150k"
            applicants={45}
            views={234}
            posted="2 days ago"
            status="active"
          />
          <JobCard
            title="AI Product Manager"
            company="Vettio Technologies"
            location="Remote"
            salary="$130k - $160k"
            applicants={28}
            views={156}
            posted="1 week ago"
            status="active"
          />
          <JobCard
            title="Senior UX Designer"
            company="Vettio Technologies"
            location="New York, NY"
            salary="$110k - $140k"
            applicants={67}
            views={345}
            posted="3 days ago"
            status="active"
          />
          <JobCard
            title="Backend Engineer"
            company="Vettio Technologies"
            location="Austin, TX"
            salary="$115k - $145k"
            applicants={32}
            views={189}
            posted="5 days ago"
            status="paused"
          />
        </div>
      </div>

      {/* Column 2 - Right */}
      <div 
        className="space-y-4"
        style={{
          width: '406.67px',
          height: '187px'
        }}
      >
        {/* Quick Stats Card */}
        <div className="bg-white rounded-lg p-6">
          <h3 className="text-lg font-semibold text-[#1D2025] mb-4">Quick Stats</h3>
          <div className="grid grid-cols-2 gap-4">
            <StatItem 
              icon={Users}
              label="Total Applications"
              value="1,234"
              change="+12%"
              positive={true}
            />
            <StatItem 
              icon={Eye}
              label="Job Views"
              value="5,678"
              change="+8%"
              positive={true}
            />
            <StatItem 
              icon={Clock}
              label="Avg. Response Time"
              value="2.3 days"
              change="-15%"
              positive={true}
            />
            <StatItem 
              icon={TrendingUp}
              label="Conversion Rate"
              value="18.5%"
              change="+3%"
              positive={true}
            />
          </div>
        </div>
      </div>

      {/* Column 3 - Middle */}
      <div 
        className="bg-white rounded-lg p-6"
        style={{
          width: '406.67px',
          height: '340px'
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-[#1D2025]">Recent Activity</h3>
          <MoreHorizontal className="w-5 h-5 text-[#6B7280] cursor-pointer" />
        </div>
        
        <div className="space-y-4">
          <ActivityItem
            type="application"
            message="New application for Senior Frontend Developer"
            time="2 minutes ago"
            user="Sarah Johnson"
          />
          <ActivityItem
            type="interview"
            message="Interview scheduled for AI Product Manager role"
            time="1 hour ago"
            user="Mike Chen"
          />
          <ActivityItem
            type="hire"
            message="Candidate hired for Senior UX Designer position"
            time="3 hours ago"
            user="Emily Davis"
          />
          <ActivityItem
            type="application"
            message="New application for Backend Engineer"
            time="5 hours ago"
            user="Alex Rodriguez"
          />
          <ActivityItem
            type="interview"
            message="Interview completed for Data Scientist role"
            time="1 day ago"
            user="Jessica Wong"
          />
          <ActivityItem
            type="application"
            message="Application reviewed for DevOps Engineer"
            time="2 days ago"
            user="David Kim"
          />
        </div>
      </div>
    </div>
  );
}

interface JobCardProps {
  title: string;
  company: string;
  location: string;
  salary: string;
  applicants: number;
  views: number;
  posted: string;
  status: 'active' | 'paused' | 'closed';
}

function JobCard({ title, company, location, salary, applicants, views, posted, status }: JobCardProps) {
  return (
    <div className="border border-[#E5E7EB] rounded-lg p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-medium text-[#1D2025] mb-1">{title}</h4>
          <p className="text-sm text-[#6B7280]">{company}</p>
        </div>
        <span className={`px-2 py-1 text-xs rounded-full ${
          status === 'active' ? 'bg-green-100 text-green-800' :
          status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {status}
        </span>
      </div>
      
      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2 text-sm text-[#6B7280]">
          <MapPin className="w-4 h-4" />
          {location}
        </div>
        <div className="flex items-center gap-2 text-sm text-[#6B7280]">
          <DollarSign className="w-4 h-4" />
          {salary}
        </div>
      </div>
      
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          <span className="text-[#6B7280]">{applicants} applicants</span>
          <span className="text-[#6B7280]">{views} views</span>
        </div>
        <span className="text-[#6B7280]">{posted}</span>
      </div>
    </div>
  );
}

interface StatItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  change: string;
  positive: boolean;
}

function StatItem({ icon: Icon, label, value, change, positive }: StatItemProps) {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center mb-2">
        <Icon className="w-5 h-5 text-[#8952E0]" />
      </div>
      <p className="text-2xl font-bold text-[#1D2025] mb-1">{value}</p>
      <p className="text-xs text-[#6B7280] mb-1">{label}</p>
      <p className={`text-xs ${positive ? 'text-green-600' : 'text-red-600'}`}>
        {change}
      </p>
    </div>
  );
}

interface ActivityItemProps {
  type: 'application' | 'interview' | 'hire';
  message: string;
  time: string;
  user: string;
}

function ActivityItem({ type, message, time, user }: ActivityItemProps) {
  const getIcon = () => {
    switch (type) {
      case 'application': return <Users className="w-4 h-4 text-blue-500" />;
      case 'interview': return <Calendar className="w-4 h-4 text-orange-500" />;
      case 'hire': return <Star className="w-4 h-4 text-green-500" />;
    }
  };

  return (
    <div className="flex items-start gap-3">
      <div className="mt-1">{getIcon()}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-[#1D2025] mb-1">{message}</p>
        <div className="flex items-center gap-2 text-xs text-[#6B7280]">
          <span>{user}</span>
          <span>•</span>
          <span>{time}</span>
        </div>
      </div>
    </div>
  );
}
