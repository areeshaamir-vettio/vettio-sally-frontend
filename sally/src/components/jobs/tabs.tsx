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
    <div className="flex items-center w-full overflow-x-auto">
      <div className="flex bg-[#F3F4F6] rounded-lg p-1 min-w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`px-3 md:px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 whitespace-nowrap ${
              currentActiveTab === tab.id
                ? 'bg-white text-[#1D2025] shadow-sm'
                : 'text-[#6B7280] hover:text-[#1D2025]'
            }`}
          >
            <span className="flex items-center gap-1 md:gap-2">
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-xs px-1.5 md:px-2 py-1 rounded-full ${
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

// Jobs-specific tabs (5 tabs)
export function JobsTabs({ onTabChange }: { onTabChange?: (tabId: string) => void }) {
  const tabs: Tab[] = [
    { id: 'all', label: 'All Jobs', count: 24 },
    { id: 'draft', label: 'Draft', count: 3 },
    { id: 'published', label: 'Published', count: 18 },
    { id: 'paused', label: 'Paused', count: 2 },
    { id: 'closed', label: 'Closed', count: 1 }
  ];

  return (
    <Tabs 
      tabs={tabs} 
      activeTab="all"
      onTabChange={onTabChange}
    />
  );
}
