'use client';

import React, { useState } from 'react';

interface Tab {
  id: string;
  label: string;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
}

export function Tabs({ tabs, activeTab, onTabChange }: TabsProps) {
  const [internalActiveTab, setInternalActiveTab] = useState(activeTab || tabs[0]?.id);

  const handleTabClick = (tabId: string) => {
    setInternalActiveTab(tabId);
    onTabChange?.(tabId);
  };

  const currentActiveTab = activeTab || internalActiveTab;

  return (
    <div className="flex items-center">
      <div className="flex bg-[#F3F4F6] rounded-lg p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
              currentActiveTab === tab.id
                ? 'bg-white text-[#1D2025] shadow-sm'
                : 'text-[#6B7280] hover:text-[#1D2025]'
            }`}
          >
            <span className="flex items-center gap-2">
              {tab.label}
              {tab.count !== undefined && (
                <span 
                  className={`text-xs px-2 py-1 rounded-full ${
                    currentActiveTab === tab.id
                      ? 'bg-[#8952E0] text-white'
                      : 'bg-[#E5E7EB] text-[#6B7280]'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// Candidate-specific tabs
export function CandidateTabs() {
  const tabs: Tab[] = [
    { id: 'all', label: 'All Applications', count: 1234 },
    { id: 'new', label: 'New', count: 156 },
    { id: 'shortlisted', label: 'Shortlisted', count: 89 },
    { id: 'rejected', label: 'Rejected', count: 342 }
  ];

  return (
    <Tabs 
      tabs={tabs} 
      activeTab="all"
      onTabChange={(tabId) => {
        console.log('Tab changed to:', tabId);
      }}
    />
  );
}
