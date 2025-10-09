'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { apiClient } from '@/lib/api-client';
import {
  RoleCandidatesResponse,
  RoleCandidatesOptions,
  Candidate
} from '@/types/candidates';

interface UseRoleCandidatesState {
  data: RoleCandidatesResponse | null;
  candidates: Candidate[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  hasMore: boolean;
}

interface UseRoleCandidatesReturn extends UseRoleCandidatesState {
  refetch: () => Promise<void>;
  clearError: () => void;
}

/**
 * Custom hook for fetching and managing role candidates data
 * @param roleId - The unique identifier of the role
 * @param options - Query options for filtering and pagination
 * @returns Object containing candidates data, loading state, error state, and utility functions
 */
export function useRoleCandidates(
  roleId: string | null | undefined,
  options: RoleCandidatesOptions = {}
): UseRoleCandidatesReturn {
  const [state, setState] = useState<UseRoleCandidatesState>({
    data: null,
    candidates: [],
    loading: false,
    error: null,
    totalCount: 0,
    hasMore: false,
  });

  // Memoize options to prevent unnecessary re-renders
  const memoizedOptions = useMemo(() => options, [options.limit]);

  const fetchCandidates = useCallback(async () => {
    console.log('🚀 useRoleCandidates: fetchCandidates called with roleId:', roleId);

    if (!roleId) {
      console.log('⚠️ useRoleCandidates: No roleId provided, clearing state');
      setState(prev => ({
        ...prev,
        data: null,
        candidates: [],
        loading: false,
        error: null,
        totalCount: 0,
        hasMore: false,
      }));
      return;
    }

    console.log('🔄 useRoleCandidates: Setting loading state to true for roleId:', roleId);
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      console.log('🔍 useRoleCandidates: Starting API call for role:', roleId);
      console.log('🔍 useRoleCandidates: Using options:', memoizedOptions);

      const response = await apiClient.getRoleCandidates(roleId, memoizedOptions);

      console.log('📦 useRoleCandidates: Raw API response:', response);
      
      // Validate response structure
      if (!response || typeof response !== 'object') {
        throw new Error('Invalid response format from candidates API');
      }

      // Ensure candidates is an array
      const candidatesArray = Array.isArray(response.candidates) ? response.candidates : [];

      // Filter out invalid candidates
      const validCandidates = candidatesArray.filter(candidate => {
        if (!candidate || typeof candidate !== 'object' || !candidate.id) {
          console.warn('Filtering out invalid candidate:', candidate);
          return false;
        }
        return true;
      });

      console.log('📊 useRoleCandidates: Processing response data:', {
        roleId: response.role_id,
        rawCandidateCount: candidatesArray.length,
        validCandidateCount: validCandidates.length,
        totalCount: response.total_count,
        hasMore: response.metadata?.has_more,
        filteredOut: candidatesArray.length - validCandidates.length
      });

      setState(prev => ({
        ...prev,
        data: response,
        candidates: validCandidates,
        totalCount: response.total_count || validCandidates.length,
        hasMore: response.metadata?.has_more || false,
        loading: false,
        error: null,
      }));

      console.log('✅ useRoleCandidates: State updated successfully:', {
        candidateCount: response.candidates?.length || 0,
        totalCount: response.total_count || 0,
      });
    } catch (err) {
      let errorMessage = 'Failed to fetch candidates';

      // Provide more specific error messages
      if (err instanceof Error) {
        if (err.message.includes('401')) {
          errorMessage = 'Authentication failed. Please log in again.';
        } else if (err.message.includes('403')) {
          errorMessage = 'You do not have permission to view candidates for this role.';
        } else if (err.message.includes('404')) {
          errorMessage = 'Role not found or no candidates available.';
        } else if (err.message.includes('500')) {
          errorMessage = 'Server error. Please try again later.';
        } else if (err.message.includes('Network')) {
          errorMessage = 'Network error. Please check your connection.';
        } else {
          errorMessage = err.message;
        }
      }

      console.error('❌ useRoleCandidates: API call failed for roleId:', roleId);
      console.error('❌ useRoleCandidates: Error details:', err);
      console.error('❌ useRoleCandidates: User-friendly error message:', errorMessage);

      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        // Keep existing candidates if this was a refresh attempt
        candidates: prev.candidates.length > 0 ? prev.candidates : [],
        totalCount: prev.totalCount > 0 ? prev.totalCount : 0,
      }));

      console.error('❌ useRoleCandidates: State updated with error:', errorMessage);
    }
  }, [roleId, memoizedOptions]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  return {
    ...state,
    refetch: fetchCandidates,
    clearError,
  };
}

export default useRoleCandidates;
