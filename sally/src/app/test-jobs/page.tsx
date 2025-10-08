'use client';

import { useState } from 'react';
import { useJobs } from '@/hooks/useJobs';
import { getPostAuthRedirectPath } from '@/utils/post-auth-routing';
import { AuthService } from '@/lib/auth';
import { getJobDisplayTitle, getPriorityColorClass, getRelativeTime } from '@/utils/job-helpers';

export default function TestJobsPage() {
  const { jobs, loading, error, hasJobs, checkHasJobs } = useJobs({ autoFetch: false });
  const [redirectPath, setRedirectPath] = useState<string>('');
  const [testResults, setTestResults] = useState<string[]>([]);

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const testJobsCheck = async () => {
    try {
      addTestResult('🔍 Testing jobs check...');
      const userHasJobs = await checkHasJobs();
      addTestResult(`✅ Has jobs: ${userHasJobs}`);
    } catch (err) {
      addTestResult(`❌ Error checking jobs: ${err}`);
    }
  };

  const testPostAuthRouting = async () => {
    try {
      addTestResult('🔍 Testing post-auth routing...');
      const path = await getPostAuthRedirectPath();
      setRedirectPath(path);
      addTestResult(`✅ Redirect path: ${path}`);
    } catch (err) {
      addTestResult(`❌ Error in post-auth routing: ${err}`);
    }
  };

  const testTokenCheck = () => {
    const token = AuthService.getAccessToken();
    addTestResult(`🎫 Token exists: ${!!token}`);
    if (token) {
      addTestResult(`🎫 Token preview: ${token.substring(0, 20)}...`);
      addTestResult(`🎭 Is mock token: ${token.startsWith('mock.')}`);
    }
  };

  const clearResults = () => {
    setTestResults([]);
    setRedirectPath('');
  };

  return (
    <div className="min-h-screen bg-[#F9FAFA] p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Jobs Service Test Page</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Test Controls */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
            <div className="space-y-4">
              <button
                onClick={testTokenCheck}
                className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Check Token Status
              </button>
              
              <button
                onClick={testJobsCheck}
                className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                disabled={loading}
              >
                {loading ? 'Checking...' : 'Test Jobs Check'}
              </button>
              
              <button
                onClick={testPostAuthRouting}
                className="w-full bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
              >
                Test Post-Auth Routing
              </button>
              
              <button
                onClick={clearResults}
                className="w-full bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Clear Results
              </button>
            </div>
          </div>

          {/* Current State */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Current State</h2>
            <div className="space-y-2 text-sm">
              <div><strong>Jobs Count:</strong> {jobs.length}</div>
              <div><strong>Has Jobs:</strong> {hasJobs ? 'Yes' : 'No'}</div>
              <div><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</div>
              <div><strong>Error:</strong> {error || 'None'}</div>
              <div><strong>Redirect Path:</strong> {redirectPath || 'Not tested'}</div>
            </div>
          </div>
        </div>

        {/* Test Results */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Test Results</h2>
          <div className="bg-gray-100 rounded p-4 h-64 overflow-y-auto">
            {testResults.length === 0 ? (
              <p className="text-gray-500">No test results yet. Click the test buttons above.</p>
            ) : (
              <div className="space-y-1">
                {testResults.map((result, index) => (
                  <div key={index} className="text-sm font-mono">
                    {result}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Jobs List */}
        {jobs.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Jobs List</h2>
            <div className="space-y-4">
              {jobs.map((job) => (
                <div key={job.id} className="border rounded p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold">
                      {getJobDisplayTitle(job)}
                    </h3>
                    <span className={`px-2 py-1 text-xs rounded ${getPriorityColorClass(job.priority)}`}>
                      {job.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Status: {job.status} • Workflow: {job.workflow_state || 'None'} • Applications: {job.application_count}
                  </p>
                  {job.tags && job.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {job.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="px-2 py-1 text-xs bg-gray-100 rounded">
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-gray-500">
                    Created: {getRelativeTime(job.created_at)} • Views: {job.view_count}
                    {job.published_at && ` • Published: ${getRelativeTime(job.published_at)}`}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
