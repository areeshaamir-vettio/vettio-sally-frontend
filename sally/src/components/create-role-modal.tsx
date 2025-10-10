'use client';

import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { jobsService } from '@/services/jobs.service';

interface CreateRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface CreateRoleFormData {
  title: string;
  location: string;
  job_description: string;
}

export function CreateRoleModal({ isOpen, onClose, onSuccess }: CreateRoleModalProps) {
  const [formData, setFormData] = useState<CreateRoleFormData>({
    title: '',
    location: '',
    job_description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: keyof CreateRoleFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      console.log('🚀 Creating role with data:', formData);
      
      // Create the role using the jobs service
      const newRole = await jobsService.createJob(formData);
      
      console.log('✅ Role created successfully:', newRole);
      
      // Reset form
      setFormData({
        title: '',
        location: '',
        job_description: ''
      });
      
      // Call success callback to refresh jobs list
      if (onSuccess) {
        onSuccess();
      }
      
      // Close modal
      onClose();
      
    } catch (err) {
      console.error('❌ Failed to create role:', err);
      setError(err instanceof Error ? err.message : 'Failed to create role');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        title: '',
        location: '',
        job_description: ''
      });
      setError(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-[#1D2025]">Create New Role</h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Title Field */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Role Title <span className="text-gray-400">(optional)</span>
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="e.g., Senior Backend Engineer"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8952E0] focus:border-transparent outline-none transition-colors"
              disabled={isSubmitting}
            />
          </div>

          {/* Location Field */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
              Location <span className="text-gray-400">(optional)</span>
            </label>
            <input
              type="text"
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="e.g., Remote, New York, NY"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8952E0] focus:border-transparent outline-none transition-colors"
              disabled={isSubmitting}
            />
          </div>

          {/* Job Description Field */}
          <div>
            <label htmlFor="job_description" className="block text-sm font-medium text-gray-700 mb-2">
              Job Description <span className="text-gray-400">(optional)</span>
            </label>
            <textarea
              id="job_description"
              value={formData.job_description}
              onChange={(e) => handleInputChange('job_description', e.target.value)}
              placeholder="Raw job description text (will be extracted when role is viewed)"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8952E0] focus:border-transparent outline-none transition-colors resize-vertical"
              disabled={isSubmitting}
            />
          </div>

          {/* Info Text */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Note:</strong> The role will be created in 'draft' status. When you view the role details, 
              the system will automatically extract information from the job description (if provided) and start 
              the AI conversation to gather remaining details.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Create Role
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
