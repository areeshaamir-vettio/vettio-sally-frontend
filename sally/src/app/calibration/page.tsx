'use client';

import React from 'react';
import { Navbar } from '@/components/navbar';
import { CalibrationContent } from '@/components/calibration/content';

export default function CalibrationPage() {
  return (
    <div className="min-h-screen bg-[#F9FAFA]">
      {/* Navigation - Exact height: 56px */}
      <Navbar />

      {/* Main Content */}
      <CalibrationContent />
    </div>
  );
}
