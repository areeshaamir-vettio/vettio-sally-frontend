'use client';

import React from 'react';
import { CandidateGrid } from './candidate-grid';

export function CalibrationContent() {
  return (
    <div className="min-h-screen bg-[#F9FAFA] px-4 sm:px-6 lg:px-8 py-8">
      {/* Main Header - Centered */}
      <div className="text-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-semibold text-[#1D2025] leading-9">
          Review and Select Sample Candidate Matches
        </h1>
      </div>

      {/* Sub Header - Centered */}
      <div className="text-center mb-8">
        <p className="text-base sm:text-lg text-[#6B7280] leading-7 max-w-4xl mx-auto px-4">
          We&apos;ve prepared sample matches to validate your requirements. Select the best two profiles from these options.
        </p>
      </div>

      {/* White Box with Quick Note */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 mb-8 max-w-6xl mx-auto">
        <h3 className="text-center text-base sm:text-lg font-semibold text-[#1D2025] mb-4">
          Quick Note
        </h3>
        <p className="text-center text-sm text-[#1D2025] leading-6">
          These sample profiles are to confirm we&apos;ve captured your hiring needs. Please review and let us know which feel like a match so we can proceed to outreach.
        </p>
      </div>

      {/* Candidate Cards Grid */}
      <CandidateGrid />
    </div>
  );
}
