'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useRole } from '@/hooks/useRole';
import { Role, CreateRoleRequest } from '@/types/roles';

interface RoleContextType {
  role: Role | null;
  loading: boolean;
  error: string | null;
  createRole: (data: CreateRoleRequest) => Promise<Role>;
  updateRole: (data: Partial<CreateRoleRequest>) => Promise<Role>;
  getRoleId: () => string | null;
  setRoleId: (id: string) => void;
  clearRole: () => void;
  hasRole: boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

interface RoleProviderProps {
  children: ReactNode;
}

export function RoleProvider({ children }: RoleProviderProps) {
  const roleHook = useRole();
  
  const contextValue: RoleContextType = {
    ...roleHook,
    hasRole: !!roleHook.role,
  };

  return (
    <RoleContext.Provider value={contextValue}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRoleContext() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRoleContext must be used within a RoleProvider');
  }
  return context;
}

// Higher-order component to ensure role exists
interface WithRoleProps {
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
}

export function WithRole({ children, fallback, redirectTo }: WithRoleProps) {
  const { role, loading, error } = useRoleContext();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading role...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h3 className="text-red-800 font-semibold mb-2">Error Loading Role</h3>
          <p className="text-red-600 text-sm mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!role) {
    if (redirectTo && typeof window !== 'undefined') {
      window.location.href = redirectTo;
      return null;
    }

    return (
      fallback || (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-center bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md">
            <h3 className="text-yellow-800 font-semibold mb-2">No Role Found</h3>
            <p className="text-yellow-600 text-sm mb-4">
              Please start by creating a role from the get started page.
            </p>
            <a
              href="/get-started"
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors inline-block"
            >
              Get Started
            </a>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
}

// Component to display role information
export function RoleInfo() {
  const { role } = useRoleContext();

  if (!role) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <h3 className="font-semibold text-blue-800 mb-2">Current Role</h3>
      <div className="space-y-1 text-sm">
        <div>
          <span className="font-medium text-blue-700">Title:</span>
          <span className="text-blue-600 ml-2">{role.title || 'Untitled'}</span>
        </div>
        <div>
          <span className="font-medium text-blue-700">Location:</span>
          <span className="text-blue-600 ml-2">{role.location || 'Not specified'}</span>
        </div>
        <div>
          <span className="font-medium text-blue-700">Status:</span>
          <span className="text-blue-600 ml-2">{role.status}</span>
        </div>
        <div>
          <span className="font-medium text-blue-700">ID:</span>
          <span className="text-blue-600 ml-2 font-mono text-xs">{role.id}</span>
        </div>
      </div>
    </div>
  );
}
