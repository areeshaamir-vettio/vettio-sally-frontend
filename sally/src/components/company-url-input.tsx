'use client';

import { useState } from 'react';

interface CompanyUrlInputProps {
  value: string;
  onChange: (value: string) => void;
  onValidation?: (isValid: boolean, companyName?: string) => void;
  disabled?: boolean;
}

export function CompanyUrlInput({
  value,
  onChange,
  onValidation,
  disabled = false
}: CompanyUrlInputProps) {
  const [isValidating, setIsValidating] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string>('');

  const handleInputChange = (inputValue: string) => {
    onChange(inputValue);

    // Clear previous validation message when user is typing
    setValidationMessage('');
    setIsValidating(false);

    // Simple validation: enable button if input has a dot (looks like URL)
    if (inputValue.includes('.') && inputValue.trim().length >= 3) {
      onValidation?.(true, 'Valid URL format');
    } else {
      onValidation?.(false);
    }
  };

  return (
    <div className="w-full">
      {/* Label */}
      <label className="block text-sm font-medium text-[#1D2025] mb-2">
        Enter Your Company URL
        <span className="text-red-500 ml-1">*</span>
      </label>
      
      {/* Input Field */}
      <div className="relative">
        <input
          type="url"
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder="Paste or type url here...."
          disabled={disabled}
          className="w-full px-4 py-3 border border-[#D1D5DB] rounded-md bg-white text-[#1D2025] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#8952E0] focus:border-[#8952E0] disabled:bg-gray-50 disabled:cursor-not-allowed h-12"
        />
      </div>
      
      {/* Validation Message - Fixed height to prevent layout shift */}
      <div className="mt-2 h-5">
        {validationMessage && (
          <p className={`text-sm ${
            validationMessage.startsWith('✓')
              ? 'text-green-600'
              : 'text-red-600'
          }`}>
            {validationMessage}
          </p>
        )}
      </div>
    </div>
  );
}
