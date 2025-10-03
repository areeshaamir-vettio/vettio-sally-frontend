'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { Role, CreateRoleRequest } from '@/types/roles';

interface UseRoleReturn {
  role: Role | null;
  loading: boolean;
  error: string | null;
  createRole: (data: CreateRoleRequest) => Promise<Role>;
  updateRole: (data: Partial<CreateRoleRequest>) => Promise<Role>;
  getRoleId: () => string | null;
  setRoleId: (id: string) => void;
  clearRole: () => void;
}

/**
 * Hook to manage role state and API operations
 * Handles role creation, fetching, updating, and ID persistence
 */
export function useRole(): UseRoleReturn {
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get role ID from sessionStorage
  const getRoleId = (): string | null => {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem('current_role_id');
  };

  // Set role ID in sessionStorage
  const setRoleId = (id: string): void => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('current_role_id', id);
      console.log('💾 Stored role ID:', id);
    }
  };

  // Clear role data and ID
  const clearRole = (): void => {
    setRole(null);
    setError(null);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('current_role_id');
      console.log('🗑️ Cleared role data');
    }
  };

  // Load role from API if ID exists in sessionStorage
  useEffect(() => {
    const loadRole = async () => {
      const roleId = getRoleId();
      if (!roleId) return;

      try {
        setLoading(true);
        setError(null);
        
        const fetchedRole = await apiClient.getRole(roleId);
        setRole(fetchedRole);
        console.log('📥 Loaded role from storage:', fetchedRole);
      } catch (err) {
        console.error('❌ Failed to load role:', err);
        setError(err instanceof Error ? err.message : 'Failed to load role');
        // Clear invalid role ID
        clearRole();
      } finally {
        setLoading(false);
      }
    };

    loadRole();
  }, []);

  // Create a new role
  const createRole = async (data: CreateRoleRequest): Promise<Role> => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🚀 Creating new role...');
      const newRole = await apiClient.createRole(data);
      
      setRole(newRole);
      setRoleId(newRole.id);
      
      console.log('✅ Role created and stored:', newRole);
      return newRole;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create role';
      setError(errorMessage);
      console.error('❌ Role creation failed:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update existing role
  const updateRole = async (data: Partial<CreateRoleRequest>): Promise<Role> => {
    const roleId = getRoleId();
    if (!roleId) {
      throw new Error('No role ID found. Please create a role first.');
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('📝 Updating role:', roleId);
      const updatedRole = await apiClient.updateRole(roleId, data);
      
      setRole(updatedRole);
      
      console.log('✅ Role updated:', updatedRole);
      return updatedRole;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update role';
      setError(errorMessage);
      console.error('❌ Role update failed:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    role,
    loading,
    error,
    createRole,
    updateRole,
    getRoleId,
    setRoleId,
    clearRole,
  };
}

/**
 * Utility functions for role management outside of React components
 */
export const roleUtils = {
  getCurrentRoleId: (): string | null => {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem('current_role_id');
  },

  setCurrentRoleId: (id: string): void => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('current_role_id', id);
    }
  },

  clearCurrentRoleId: (): void => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('current_role_id');
    }
  },

  hasCurrentRole: (): boolean => {
    return !!roleUtils.getCurrentRoleId();
  },
};

// Make role utilities available in browser console for debugging
declare global {
  interface Window {
    roleUtils: typeof roleUtils;
  }
}

if (typeof window !== 'undefined') {
  window.roleUtils = roleUtils;
}
