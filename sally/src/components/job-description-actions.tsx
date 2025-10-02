'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileUpload } from './file-upload';
import { mockJobDescriptionApi } from '@/lib/mock-job-api';

export function JobDescriptionActions() {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [isBuilding, setIsBuilding] = useState(false);

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    
    try {
      const result = await mockJobDescriptionApi.uploadJobDescription({ file });
      console.log('Upload successful:', result);
      
      // Navigate to job description review page
      router.push('/job-description/review');
    } catch (error) {
      console.error('Upload failed:', error);
      // Handle error (show toast, etc.)
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadClick = () => {
    // Trigger file input click
    document.querySelector('input[type="file"]')?.click();
  };

  const handleBuildClick = async () => {
    setIsBuilding(true);
    
    try {
      const result = await mockJobDescriptionApi.buildJobDescription({
        jobTitle: 'New Job Position'
      });
      console.log('Build started:', result);
      
      // Navigate to job builder
      router.push('/job-description/builder');
    } catch (error) {
      console.error('Build failed:', error);
      // Handle error (show toast, etc.)
    } finally {
      setIsBuilding(false);
    }
  };

  return (
    <div className="w-full max-w-[586px]">
      {/* Title - Exact Figma dimensions: 586px × 36px */}
      <h1 
        className="text-2xl font-semibold text-[#1D2025] text-center mb-8"
        style={{ 
          width: '586px',
          height: '36px',
          fontSize: '24px',
          lineHeight: '32px',
          fontWeight: '600'
        }}
      >
        Have a job description ready? Feel free to upload it
      </h1>
      
      {/* File Upload Area */}
      <div className="mb-8">
        <FileUpload 
          onFileSelect={handleFileUpload}
          isUploading={isUploading}
          disabled={isUploading || isBuilding}
        />
      </div>
      
      {/* Action Buttons - Exact Figma dimensions: 324px × 32px container */}
      <div 
        className="flex items-center gap-2 mx-auto"
        style={{ 
          width: '324px',
          height: '32px'
        }}
      >
        {/* Primary Button - Exact dimensions: 194px × 32px */}
        <button
          onClick={handleUploadClick}
          disabled={isUploading || isBuilding}
          className="bg-[#8952E0] text-white rounded-md font-medium hover:bg-[#7A47CC] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
          style={{
            width: '194px',
            height: '32px',
            fontSize: '14px',
            lineHeight: '20px',
            fontWeight: '500'
          }}
        >
          {isUploading ? 'Uploading...' : 'Upload Job Description'}
        </button>
        
        {/* Secondary Button - Exact dimensions: 122px × 32px */}
        <button
          onClick={handleBuildClick}
          disabled={isUploading || isBuilding}
          className="bg-[#F3F4F6] text-[#374151] rounded-md font-medium hover:bg-[#E5E7EB] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          style={{
            width: '122px',
            height: '32px',
            fontSize: '14px',
            lineHeight: '20px',
            fontWeight: '500'
          }}
        >
          {isBuilding ? 'Building...' : 'Help me Build It'}
        </button>
      </div>
    </div>
  );
}
