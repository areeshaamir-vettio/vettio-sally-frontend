'use client';

import { useRole } from '@/hooks/useRole';

export function RoleDebug() {
  const { role, loading, error, clearRole } = useRole();

  if (loading) {
    return (
      <div className="fixed bottom-4 left-4 bg-blue-100 border border-blue-300 rounded-lg p-4 shadow-lg max-w-sm">
        <h3 className="font-semibold text-blue-800 mb-2">Role Debug</h3>
        <p className="text-sm text-blue-600">Loading role...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed bottom-4 left-4 bg-red-100 border border-red-300 rounded-lg p-4 shadow-lg max-w-sm">
        <h3 className="font-semibold text-red-800 mb-2">Role Debug - Error</h3>
        <p className="text-sm text-red-600 mb-2">{error}</p>
        <button
          onClick={clearRole}
          className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
        >
          Clear Role
        </button>
      </div>
    );
  }

  if (!role) {
    return (
      <div className="fixed bottom-4 left-4 bg-gray-100 border border-gray-300 rounded-lg p-4 shadow-lg max-w-sm">
        <h3 className="font-semibold text-gray-800 mb-2">Role Debug</h3>
        <p className="text-sm text-gray-600">No active role</p>
        <p className="text-xs text-gray-500 mt-1">
          Click &quot;Get Started&quot; to create a role
        </p>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg max-w-sm">
      <h3 className="font-semibold text-gray-800 mb-2">Role Debug</h3>
      
      <div className="space-y-2 text-sm">
        <div>
          <span className="font-medium text-gray-700">ID:</span>
          <div className="font-mono text-xs bg-gray-100 p-1 rounded mt-1 break-all">
            {role.id}
          </div>
        </div>
        
        <div>
          <span className="font-medium text-gray-700">Title:</span>
          <div className="text-xs text-gray-600">
            {role.title || 'No title'}
          </div>
        </div>
        
        <div>
          <span className="font-medium text-gray-700">Location:</span>
          <div className="text-xs text-gray-600">
            {role.location || 'No location'}
          </div>
        </div>
        
        <div>
          <span className="font-medium text-gray-700">Status:</span>
          <div className="text-xs text-gray-600">
            {role.status}
          </div>
        </div>
        
        <div>
          <span className="font-medium text-gray-700">Created:</span>
          <div className="text-xs text-gray-600">
            {new Date(role.created_at).toLocaleString()}
          </div>
        </div>
        
        {role.job_description && (
          <div>
            <span className="font-medium text-gray-700">Description:</span>
            <div className="text-xs text-gray-600 max-h-20 overflow-y-auto">
              {role.job_description.substring(0, 100)}
              {role.job_description.length > 100 && '...'}
            </div>
          </div>
        )}
      </div>
      
      <button
        onClick={clearRole}
        className="mt-3 w-full bg-red-500 text-white text-xs py-1 px-2 rounded hover:bg-red-600 transition-colors"
      >
        Clear Role
      </button>
    </div>
  );
}

// Helper component to show role info in development only
export function RoleDebugDev() {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  return <RoleDebug />;
}
