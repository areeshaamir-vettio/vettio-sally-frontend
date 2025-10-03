'use client';

import { AuthService, TokenManager } from './auth';

export function debugAuthState() {
  const accessToken = TokenManager.getAccessToken();
  const refreshToken = TokenManager.getRefreshToken();
  
  console.log('🔍 Auth Debug Info:');
  console.log('Has Access Token:', !!accessToken);
  console.log('Has Refresh Token:', !!refreshToken);
  
  if (accessToken) {
    console.log('Access Token (first 20 chars):', accessToken.substring(0, 20) + '...');
    
    // Check if token is expired
    try {
      const isExpired = TokenManager.isTokenExpired(accessToken);
      const expirationTime = TokenManager.getTokenExpirationTime(accessToken);
      console.log('Token Expired:', isExpired);
      console.log('Expiration Time:', expirationTime ? new Date(expirationTime).toISOString() : 'Unknown');
      
      if (expirationTime) {
        const timeUntilExpiry = Math.round((expirationTime - Date.now()) / 1000);
        console.log('Time until expiry:', timeUntilExpiry > 0 ? `${timeUntilExpiry} seconds` : 'Expired');
      }
    } catch (error) {
      console.error('Error parsing token:', error);
    }
  }
  
  if (refreshToken) {
    console.log('Refresh Token (first 20 chars):', refreshToken.substring(0, 20) + '...');
  }
  
  return { accessToken, refreshToken };
}

// Test login with sample credentials
export async function testLogin(email = 'test@company.com', password = 'password123') {
  console.log('🔐 Testing login...');
  
  try {
    const response = await AuthService.login(email, password);
    console.log('✅ Login successful:', {
      user: response.user?.email,
      hasAccessToken: !!response.access_token,
      hasRefreshToken: !!response.refresh_token
    });
    return true;
  } catch (error) {
    console.error('❌ Login failed:', error);
    return false;
  }
}

// Test refresh token directly
export async function testRefreshToken() {
  console.log('🔄 Testing refresh token...');
  
  const refreshToken = TokenManager.getRefreshToken();
  if (!refreshToken) {
    console.error('❌ No refresh token found. Please login first.');
    return false;
  }
  
  try {
    const newAccessToken = await AuthService.refreshToken();
    console.log('✅ Refresh successful! New token length:', newAccessToken.length);
    return true;
  } catch (error) {
    console.error('❌ Refresh failed:', error);
    return false;
  }
}

// Test authenticated request
export async function testAuthenticatedRequest() {
  console.log('🌐 Testing authenticated request...');
  
  const accessToken = TokenManager.getAccessToken();
  if (!accessToken) {
    console.error('❌ No access token found. Please login first.');
    return false;
  }
  
  try {
    const response = await fetch('http://localhost:8000/api/v1/auth/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const userData = await response.json();
      console.log('✅ Authenticated request successful:', userData.email);
      return true;
    } else {
      console.error('❌ Authenticated request failed:', response.status, response.statusText);
      
      if (response.status === 401) {
        console.log('🔄 Token might be expired, trying refresh...');
        const refreshSuccess = await testRefreshToken();
        if (refreshSuccess) {
          // Retry the request
          return await testAuthenticatedRequest();
        }
      }
      
      return false;
    }
  } catch (error) {
    console.error('❌ Request failed:', error);
    return false;
  }
}

// Run all debug tests
export async function runDebugTests() {
  console.log('🚀 Running Debug Tests');
  console.log('=' .repeat(50));
  
  // 1. Check current auth state
  console.log('\n1. Current Auth State:');
  debugAuthState();
  
  // 2. Test if we need to login
  const hasTokens = TokenManager.getAccessToken() && TokenManager.getRefreshToken();
  if (!hasTokens) {
    console.log('\n2. No tokens found, testing login...');
    const loginSuccess = await testLogin();
    if (!loginSuccess) {
      console.log('❌ Cannot proceed without login');
      return;
    }
  } else {
    console.log('\n2. Tokens found, skipping login test');
  }
  
  // 3. Test authenticated request
  console.log('\n3. Testing authenticated request...');
  await testAuthenticatedRequest();
  
  // 4. Test refresh token
  console.log('\n4. Testing refresh token...');
  await testRefreshToken();
  
  console.log('\n🏁 Debug tests completed');
}

// Make available in browser console
declare global {
  interface Window {
    debugAuth: {
      debugAuthState: typeof debugAuthState;
      testLogin: typeof testLogin;
      testRefreshToken: typeof testRefreshToken;
      testAuthenticatedRequest: typeof testAuthenticatedRequest;
      runDebugTests: typeof runDebugTests;
    };
  }
}

if (typeof window !== 'undefined') {
  window.debugAuth = {
    debugAuthState,
    testLogin,
    testRefreshToken,
    testAuthenticatedRequest,
    runDebugTests
  };
}
