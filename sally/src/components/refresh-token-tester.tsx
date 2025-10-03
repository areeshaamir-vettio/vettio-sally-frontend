'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshTokenTester } from '@/lib/test-refresh-token';
import { TokenManager } from '@/lib/auth';
import { useAuth } from '@/contexts/AuthContext';

interface TestResult {
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message?: string;
  details?: any;
}

export function RefreshTokenTesterComponent() {
  const { isAuthenticated, user } = useAuth();
  const [tests, setTests] = useState<TestResult[]>([
    { name: 'Token Expiration Detection', status: 'pending' },
    { name: 'Refresh Token API', status: 'pending' },
    { name: 'Manual Token Expiry', status: 'pending' },
    { name: 'Network Request with Expired Token', status: 'pending' },
  ]);
  const [isRunning, setIsRunning] = useState(false);
  const [tokenInfo, setTokenInfo] = useState<any>(null);

  const updateTest = (index: number, updates: Partial<TestResult>) => {
    setTests(prev => prev.map((test, i) => i === index ? { ...test, ...updates } : test));
  };

  const getTokenInfo = () => {
    const accessToken = TokenManager.getAccessToken();
    const refreshToken = TokenManager.getRefreshToken();
    
    if (!accessToken) {
      setTokenInfo({ error: 'No access token found' });
      return;
    }

    try {
      const isExpired = TokenManager.isTokenExpired(accessToken);
      const expirationTime = TokenManager.getTokenExpirationTime(accessToken);
      
      setTokenInfo({
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
        accessTokenPreview: accessToken.substring(0, 20) + '...',
        refreshTokenPreview: refreshToken ? refreshToken.substring(0, 20) + '...' : 'None',
        isExpired,
        expirationTime: expirationTime ? new Date(expirationTime).toISOString() : 'Unknown',
        timeUntilExpiry: expirationTime ? Math.round((expirationTime - Date.now()) / 1000) : null
      });
    } catch (error) {
      setTokenInfo({ error: 'Failed to parse token' });
    }
  };

  const runIndividualTest = async (testIndex: number) => {
    updateTest(testIndex, { status: 'running' });
    
    try {
      let result = false;
      let details = null;
      
      switch (testIndex) {
        case 0:
          result = RefreshTokenTester.testTokenExpirationDetection();
          break;
        case 1:
          result = await RefreshTokenTester.testRefreshTokenAPI();
          break;
        case 2:
          result = await RefreshTokenTester.testManualTokenExpiry();
          break;
        case 3:
          result = await RefreshTokenTester.testNetworkRequestWithExpiredToken();
          break;
      }
      
      updateTest(testIndex, {
        status: result ? 'success' : 'error',
        message: result ? 'Test passed' : 'Test failed',
        details
      });
    } catch (error) {
      updateTest(testIndex, {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    
    // Reset all tests
    setTests(prev => prev.map(test => ({ ...test, status: 'pending' as const })));
    
    // Run tests sequentially
    for (let i = 0; i < tests.length; i++) {
      await runIndividualTest(i);
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setIsRunning(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'running': return '🔄';
      case 'success': return '✅';
      case 'error': return '❌';
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'pending': return 'text-gray-500';
      case 'running': return 'text-blue-500';
      case 'success': return 'text-green-500';
      case 'error': return 'text-red-500';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">Authentication Required</h3>
        <p className="text-yellow-700">Please log in to test refresh token functionality.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Refresh Token Tester</h2>
        <p className="text-gray-600 mb-6">
          Test the refresh token functionality to ensure automatic token renewal works correctly.
        </p>

        {/* Current User Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-800 mb-2">Current User</h3>
          <p className="text-blue-700">
            {user?.full_name || user?.email || 'Unknown User'}
          </p>
        </div>

        {/* Token Information */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-gray-800">Token Information</h3>
            <Button onClick={getTokenInfo} variant="outline" size="sm">
              Refresh Info
            </Button>
          </div>
          
          {tokenInfo ? (
            tokenInfo.error ? (
              <p className="text-red-600">{tokenInfo.error}</p>
            ) : (
              <div className="space-y-2 text-sm">
                <div>Access Token: <code className="bg-gray-200 px-1 rounded">{tokenInfo.accessTokenPreview}</code></div>
                <div>Refresh Token: <code className="bg-gray-200 px-1 rounded">{tokenInfo.refreshTokenPreview}</code></div>
                <div>Status: <span className={tokenInfo.isExpired ? 'text-red-600' : 'text-green-600'}>
                  {tokenInfo.isExpired ? 'Expired' : 'Valid'}
                </span></div>
                <div>Expires: {tokenInfo.expirationTime}</div>
                {tokenInfo.timeUntilExpiry !== null && (
                  <div>Time until expiry: {tokenInfo.timeUntilExpiry > 0 ? `${tokenInfo.timeUntilExpiry} seconds` : 'Expired'}</div>
                )}
              </div>
            )
          ) : (
            <p className="text-gray-500">Click "Refresh Info" to view token details</p>
          )}
        </div>

        {/* Test Controls */}
        <div className="flex gap-4 mb-6">
          <Button 
            onClick={runAllTests} 
            disabled={isRunning}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isRunning ? 'Running Tests...' : 'Run All Tests'}
          </Button>
        </div>

        {/* Test Results */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-800">Test Results</h3>
          {tests.map((test, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{getStatusIcon(test.status)}</span>
                  <div>
                    <h4 className="font-medium text-gray-900">{test.name}</h4>
                    {test.message && (
                      <p className={`text-sm ${getStatusColor(test.status)}`}>
                        {test.message}
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  onClick={() => runIndividualTest(index)}
                  disabled={test.status === 'running' || isRunning}
                  variant="outline"
                  size="sm"
                >
                  {test.status === 'running' ? 'Running...' : 'Run Test'}
                </Button>
              </div>
              {test.details && (
                <div className="mt-3 p-3 bg-gray-50 rounded text-sm">
                  <pre>{JSON.stringify(test.details, null, 2)}</pre>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Console Instructions */}
        <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-800 mb-2">Console Testing</h3>
          <p className="text-gray-600 text-sm mb-3">
            You can also test refresh tokens directly in the browser console:
          </p>
          <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-sm">
            <div>// Test individual functions</div>
            <div>window.testRefreshToken.testTokenExpirationDetection()</div>
            <div>await window.testRefreshToken.testRefreshTokenAPI()</div>
            <div>await window.testRefreshToken.runAllTests()</div>
          </div>
        </div>
      </div>
    </div>
  );
}
