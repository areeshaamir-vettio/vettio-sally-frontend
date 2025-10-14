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
            className={`px-2 lg:px-4 py-1.5 lg:py-2 text-xs lg:text-sm font-medium rounded-md transition-all duration-200 ${
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

// Job status specific tabs
export type JobStatusTabId = 'all' | 'draft' | 'active' | 'closed';

interface JobStatusTabsProps {
  totalCount?: number;
  draftCount?: number;
  activeCount?: number;
  closedCount?: number;
  activeTab?: JobStatusTabId;
  onTabChange?: (tabId: JobStatusTabId) => void;
}

export function JobStatusTabs({
  totalCount = 0,
  draftCount = 0,
  activeCount = 0,
  closedCount = 0,
  activeTab = 'all',
  onTabChange
}: JobStatusTabsProps) {
  // Ensure all counts are valid numbers
  const safeTotal = Math.max(0, totalCount || 0);
  const safeDraft = Math.max(0, draftCount || 0);
  const safeActive = Math.max(0, activeCount || 0);
  const safeClosed = Math.max(0, closedCount || 0);

  const tabs: Tab[] = [
    { id: 'all', label: 'All Jobs', count: safeTotal },
    { id: 'draft', label: 'Draft', count: safeDraft },
    { id: 'active', label: 'Active', count: safeActive },
    { id: 'closed', label: 'Closed', count: safeClosed }
  ];

  return (
    <Tabs
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={(tabId) => {
        onTabChange?.(tabId as JobStatusTabId);
      }}
    />
  );
}
