// components/navbar.tsx
'use client';

import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { apiClient } from '@/lib/api-client';

const navItems = ['Home', 'About', 'Contact'];

export function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    try {
      // TODO: Implement search functionality
      const results = await apiClient.search({ query: searchQuery });
      console.log('Search results:', results);
      // TODO: Handle search results (navigate to results page, show dropdown, etc.)
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200 h-14 flex items-center px-6">
      <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
        {/* Left side - Logo and nav */}
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-3">
            {/* <img
              src="/assets/vettio-logo.png"
              alt="Vettio Logo"
              className="w-20 h-10"
            /> */}
            <span className="font-semibold text-[#1D2025] text-lg">Vettio</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <a
                key={item}
                href="#"
                className="text-[#1D2025] hover:text-[#8952E0] transition-colors text-sm font-medium"
              >
                {item}
              </a>
            ))}
          </div>
        </div>

        {/* Right side - Search and auth */}
        <div className="flex items-center space-x-4">
          <form onSubmit={handleSearch} className="hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#7D7F83] w-4 h-4" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-60 h-8 border border-gray-300 rounded-md text-sm placeholder:text-[#7D7F83] focus:outline-none focus:ring-2 focus:ring-[#8952E0] focus:border-transparent"
              />
            </div>
          </form>
          
          <div className="flex items-center space-x-2">
            <Button variant="secondary" size="sm">
              Login
            </Button>
            <Button variant="default" size="sm">
              Sign up
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
