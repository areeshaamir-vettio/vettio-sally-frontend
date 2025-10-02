'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';

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

  const handleInputChange = async (inputValue: string) => {
    onChange(inputValue);
    
    if (inputValue.trim() && onValidation) {
      setIsValidating(true);
      setValidationMessage('');
      
      try {
        // Mock validation - in real app would call API
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (inputValue.includes('example.com') || inputValue.includes('company.com')) {
          setValidationMessage('✓ Company found: Example Company Inc.');
          onValidation(true, 'Example Company Inc.');
        } else {
          setValidationMessage('Company not found. Please check the URL.');
          onValidation(false);
        }
      } catch (error) {
        setValidationMessage('Error validating company URL.');
        onValidation(false);
      } finally {
        setIsValidating(false);
      }
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
          disabled={disabled || isValidating}
          className="w-full px-4 py-3 border border-[#D1D5DB] rounded-md bg-white text-[#1D2025] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#8952E0] focus:border-[#8952E0] disabled:bg-gray-50 disabled:cursor-not-allowed"
        />
        
        {isValidating && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Loader2 className="w-4 h-4 animate-spin text-[#8952E0]" />
          </div>
        )}
      </div>
      
      {/* Validation Message */}
      {validationMessage && (
        <p className={`mt-2 text-sm ${
          validationMessage.startsWith('✓')
            ? 'text-green-600'
            : 'text-red-600'
        }`}>
          {validationMessage}
        </p>
      )}
    </div>
  );
}
