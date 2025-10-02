'use client';

import { useState, useRef } from 'react';
import { Upload, FileText, Loader2 } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isUploading?: boolean;
  disabled?: boolean;
}

export function FileUpload({ onFileSelect, isUploading = false, disabled = false }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    const file = files[0];
    
    if (file && (file.type === 'application/pdf' || file.type.startsWith('text/') || file.name.endsWith('.docx'))) {
      onFileSelect(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div
      className={`
        border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
        ${isDragOver 
          ? 'border-[#8952E0] bg-purple-50' 
          : 'border-[#E5E7EB] hover:border-[#D1D5DB]'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.txt"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />
      
      <div className="flex flex-col items-center space-y-2">
        {isUploading ? (
          <Loader2 className="w-8 h-8 text-[#8952E0] animate-spin" />
        ) : (
          <Upload className="w-8 h-8 text-[#6B7280]" />
        )}
        
        <div>
          <p className="text-sm font-medium text-[#1D2025]">
            {isUploading ? 'Uploading...' : 'Drop your job description here'}
          </p>
          <p className="text-xs text-[#6B7280] mt-1">
            or click to browse (PDF, DOC, DOCX, TXT)
          </p>
        </div>
      </div>
    </div>
  );
}
