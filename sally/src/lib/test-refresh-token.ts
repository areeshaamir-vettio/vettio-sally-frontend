// lib/test-refresh-token.ts
'use client';

import { AuthService, TokenManager } from './auth';

/**
 * Utility functions to test refresh token functionality
 */
export class RefreshTokenTester {
  
  /**
   * Method 1: Manually expire the access token and test refresh
   */
  static async testManualTokenExpiry() {
    console.log('🧪 Testing Manual Token Expiry...');
    
    try {
      // Get current tokens
      const currentAccessToken = TokenManager.getAccessToken();
      const refreshToken = TokenManager.getRefreshToken();
      
      if (!currentAccessToken || !refreshToken) {
        console.error('❌ No tokens found. Please login first.');
        return false;
      }
      
      console.log('📋 Current tokens:', {
        accessToken: currentAccessToken.substring(0, 20) + '...',
        refreshToken: refreshToken.substring(0, 20) + '...'
      });
      
      // Create an expired token by modifying the expiration time
      const expiredToken = this.createExpiredToken(currentAccessToken);
      
      // Manually set the expired token
      TokenManager.setTokens(expiredToken, refreshToken);
      
      console.log('⏰ Set expired access token');
      
      // Make an API call that should trigger refresh
      console.log('🔄 Making API call to trigger refresh...');
      
      // This should automatically refresh the token via the interceptor
      const response = await fetch('/api/v1/auth/me', {
        headers: {
          'Authorization': `Bearer ${expiredToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.status === 401) {
        console.log('✅ Token refresh mechanism triggered (got 401 as expected)');
        return true;
      } else {
        console.log('⚠️ Unexpected response:', response.status);
        return false;
      }
      
    } catch (error) {
      console.error('❌ Test failed:', error);
      return false;
    }
  }
  
  /**
   * Method 2: Test token expiration detection
   */
  static testTokenExpirationDetection() {
    console.log('🧪 Testing Token Expiration Detection...');
    
    const currentToken = TokenManager.getAccessToken();
    if (!currentToken) {
      console.error('❌ No access token found');
      return false;
    }
    
    try {
      const isExpired = TokenManager.isTokenExpired(currentToken);
      const expirationTime = TokenManager.getTokenExpirationTime(currentToken);
      const currentTime = Date.now();
      
      console.log('📊 Token Analysis:', {
        isExpired,
        expirationTime: expirationTime ? new Date(expirationTime).toISOString() : 'Unknown',
        currentTime: new Date(currentTime).toISOString(),
        timeUntilExpiry: expirationTime ? Math.round((expirationTime - currentTime) / 1000) + ' seconds' : 'Unknown'
      });
      
      return true;
    } catch (error) {
      console.error('❌ Token analysis failed:', error);
      return false;
    }
  }
  
  /**
   * Method 3: Test refresh token API call directly
   */
  static async testRefreshTokenAPI() {
    console.log('🧪 Testing Refresh Token API...');

    const refreshToken = TokenManager.getRefreshToken();
    const accessToken = TokenManager.getAccessToken();

    if (!refreshToken || !accessToken) {
      console.error('❌ No tokens found. Please login first.');
      console.log('Current tokens:', {
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken
      });
      return false;
    }

    try {
      console.log('🔄 Calling refresh token API...');

      const newAccessToken = await AuthService.refreshToken();

      console.log('✅ Refresh successful! New token:', newAccessToken.substring(0, 20) + '...');

      return true;
    } catch (error) {
      console.error('❌ Refresh failed:', error);
      return false;
    }
  }
  
  /**
   * Method 4: Simulate network request with expired token
   */
  static async testNetworkRequestWithExpiredToken() {
    console.log('🧪 Testing Network Request with Expired Token...');

    try {
      const currentToken = TokenManager.getAccessToken();
      const refreshToken = TokenManager.getRefreshToken();

      if (!currentToken || !refreshToken) {
        console.error('❌ No tokens found');
        return false;
      }

      // Create expired token
      const expiredToken = this.createExpiredToken(currentToken);
      TokenManager.setTokens(expiredToken, refreshToken);

      console.log('🌐 Making authenticated API request...');

      try {
        // Make a direct fetch request that should trigger refresh
        const response = await fetch('http://localhost:8000/api/v1/auth/me', {
          headers: {
            'Authorization': `Bearer ${expiredToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.status === 401) {
          console.log('✅ Got 401 as expected, now testing refresh...');
          // Try to refresh and retry
          const newToken = await AuthService.refreshToken();
          const retryResponse = await fetch('http://localhost:8000/api/v1/auth/me', {
            headers: {
              'Authorization': `Bearer ${newToken}`,
              'Content-Type': 'application/json'
            }
          });

          if (retryResponse.ok) {
            console.log('✅ Request successful after token refresh');
            return true;
          } else {
            console.log('❌ Retry request failed');
            return false;
          }
        } else {
          console.log('⚠️ Unexpected response status:', response.status);
          return false;
        }
      } catch (error) {
        console.log('⚠️ Request failed:', error);
        return false;
      }

    } catch (error) {
      console.error('❌ Test failed:', error);
      return false;
    }
  }
  
  /**
   * Helper method to create an expired token for testing
   */
  private static createExpiredToken(originalToken: string): string {
    try {
      const [header, payload, signature] = originalToken.split('.');
      const decodedPayload = JSON.parse(atob(payload));
      
      // Set expiration to 1 minute ago
      decodedPayload.exp = Math.floor(Date.now() / 1000) - 60;
      
      const newPayload = btoa(JSON.stringify(decodedPayload));
      return `${header}.${newPayload}.${signature}`;
    } catch (error) {
      console.error('Failed to create expired token:', error);
      return originalToken;
    }
  }
  
  /**
   * Run all tests
   */
  static async runAllTests() {
    console.log('🚀 Running All Refresh Token Tests...\n');
    
    const results = {
      tokenDetection: this.testTokenExpirationDetection(),
      refreshAPI: await this.testRefreshTokenAPI(),
      manualExpiry: await this.testManualTokenExpiry(),
      networkRequest: await this.testNetworkRequestWithExpiredToken()
    };
    
    console.log('\n📊 Test Results Summary:', results);
    
    const allPassed = Object.values(results).every(result => result === true);
    console.log(allPassed ? '✅ All tests passed!' : '❌ Some tests failed');
    
    return results;
  }
}

/**
 * Browser console helper functions
 * Use these in the browser console to test refresh token functionality
 */
declare global {
  interface Window {
    testRefreshToken: typeof RefreshTokenTester;
  }
}

// Make available in browser console
if (typeof window !== 'undefined') {
  window.testRefreshToken = RefreshTokenTester;
}
