'use client';

import React from 'react';
import { X } from 'lucide-react';

export function CalibrationNotification() {
  return (
    <div 
      className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-center justify-between"
      style={{
        width: '1400px',
        height: '56px'
      }}
    >
      <div className="flex items-center gap-3">
        {/* Info Icon */}
        <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xs font-bold">i</span>
        </div>
        
        {/* Message */}
        <p className="text-sm text-blue-800 font-medium">
          Please review these sample candidates and indicate whether they would be a good match for your role. This helps calibrate our AI matching algorithm.
        </p>
      </div>

      {/* Close Button */}
      <button className="text-blue-600 hover:text-blue-800 transition-colors">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
