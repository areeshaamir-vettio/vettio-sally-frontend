'use client';

import React from 'react';
import { CandidateCard } from './candidate-card';

// Sample candidate data matching the Figma design
const sampleCandidates = [
  {
    id: '1',
    name: 'Kristi Cummerata',
    title: 'Front-end Developer',
    location: 'Dubai, UAE',
    company: 'Meta',
    matchScore: 80,
    avatar: null, // Will use fallback
    education: {
      degree: 'Masters',
      institution: 'Columbia University'
    },
    experience: {
      role: 'Sr. Frontend Engineer',
      company: 'Meta'
    }
  },
  {
    id: '2',
    name: 'Kristi Cummerata',
    title: 'Front-end Developer',
    location: 'Dubai, UAE',
    company: 'Meta',
    matchScore: 80,
    avatar: null,
    education: {
      degree: 'Masters',
      institution: 'Columbia University'
    },
    experience: {
      role: 'Sr. Frontend Engineer',
      company: 'Meta'
    }
  },
  {
    id: '3',
    name: 'Kristi Cummerata',
    title: 'Front-end Developer',
    location: 'Dubai, UAE',
    company: 'Meta',
    matchScore: 80,
    avatar: null,
    education: {
      degree: 'Masters',
      institution: 'Columbia University'
    },
    experience: {
      role: 'Sr. Frontend Engineer',
      company: 'Meta'
    }
  },
  {
    id: '4',
    name: 'Kristi Cummerata',
    title: 'Front-end Developer',
    location: 'Dubai, UAE',
    company: 'Meta',
    matchScore: 80,
    avatar: null,
    education: {
      degree: 'Masters',
      institution: 'Columbia University'
    },
    experience: {
      role: 'Sr. Frontend Engineer',
      company: 'Meta'
    }
  }
];

export function CandidateGrid() {
  return (
    <div className="w-full max-w-[1400px] mx-auto px-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 justify-items-center">
        {sampleCandidates.map((candidate) => (
          <CandidateCard
            key={candidate.id}
            candidate={candidate}
          />
        ))}
      </div>
    </div>
  );
}
