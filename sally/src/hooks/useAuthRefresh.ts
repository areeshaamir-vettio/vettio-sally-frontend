import { useEffect, useRef } from 'react';
import { AuthService, TokenManager } from '@/lib/auth';

/**
 * Hook to automatically refresh authentication tokens before they expire
 * This prevents users from being logged out unexpectedly
 *
 * Features:
 * - Proactively refreshes access token 1 minute before expiration
 * - Checks refresh token validity before attempting refresh
 * - Logs out user when both tokens are expired
 * - Retries on temporary failures but gives up on permanent failures
 */
export function useAuthRefresh() {
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isRefreshingRef = useRef(false);
  const retryCountRef = useRef(0);
  const MAX_RETRY_ATTEMPTS = 3;

  useEffect(() => {
    const setupTokenRefresh = () => {
      // Clear any existing timer
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }

      const token = AuthService.getAccessToken();
      if (!token) {
        console.log('🔍 useAuthRefresh: No token found, skipping refresh setup');
        return;
      }

      try {
        // Decode the JWT to get expiration time
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expirationTime = payload.exp * 1000; // Convert to milliseconds
        const currentTime = Date.now();
        const timeUntilExpiry = expirationTime - currentTime;

        console.log('⏰ useAuthRefresh: Token status', {
          expiresAt: new Date(expirationTime).toISOString(),
          timeUntilExpiry: Math.round(timeUntilExpiry / 1000) + ' seconds',
          willRefreshIn: Math.round((timeUntilExpiry - 60000) / 1000) + ' seconds'
        });

        // If token is already expired or will expire in less than 1 minute, refresh immediately
        if (timeUntilExpiry < 60000) {
          console.log('⚠️ useAuthRefresh: Token expiring soon, refreshing immediately');
          refreshTokenNow();
          return;
        }

        // Schedule refresh 1 minute before expiration
        const refreshTime = timeUntilExpiry - 60000; // 1 minute before expiry

        console.log(`⏰ useAuthRefresh: Scheduling token refresh in ${Math.round(refreshTime / 1000)} seconds`);

        refreshTimerRef.current = setTimeout(() => {
          refreshTokenNow();
        }, refreshTime);
      } catch (error) {
        console.error('❌ useAuthRefresh: Failed to decode token:', error);
      }
    };

    const refreshTokenNow = async () => {
      // Prevent multiple simultaneous refresh attempts
      if (isRefreshingRef.current) {
        console.log('⏳ useAuthRefresh: Refresh already in progress, skipping');
        return;
      }

      isRefreshingRef.current = true;
      console.log('🔄 useAuthRefresh: Refreshing token...');

      try {
        // Check if refresh token exists and is valid before attempting refresh
        const refreshToken = TokenManager.getRefreshToken();
        if (!refreshToken) {
          console.error('❌ useAuthRefresh: No refresh token available');
          AuthService.performFullLogout();
          return;
        }

        // Check if refresh token is expired
        if (TokenManager.isTokenExpired(refreshToken)) {
          console.error('❌ useAuthRefresh: Refresh token has expired');
          AuthService.performFullLogout();
          return;
        }

        await AuthService.refreshToken();
        console.log('✅ useAuthRefresh: Token refreshed successfully');

        // Reset retry count on success
        retryCountRef.current = 0;

        // Schedule the next refresh
        setupTokenRefresh();
      } catch (error: any) {
        console.error('❌ useAuthRefresh: Token refresh failed:', error);

        // Check if the error is due to expired/invalid refresh token
        const isAuthError = error?.message?.includes('Refresh token expired') ||
                           error?.message?.includes('No refresh token available');

        if (isAuthError) {
          console.error('❌ useAuthRefresh: Authentication failed - both tokens expired');
          // Don't retry, user will be logged out by AuthService.refreshToken()
          return;
        }

        // For network/temporary errors, retry with exponential backoff
        retryCountRef.current += 1;

        if (retryCountRef.current <= MAX_RETRY_ATTEMPTS) {
          const retryDelay = Math.min(30000 * retryCountRef.current, 120000); // Max 2 minutes
          console.log(`⏰ useAuthRefresh: Scheduling retry ${retryCountRef.current}/${MAX_RETRY_ATTEMPTS} in ${retryDelay / 1000} seconds`);

          refreshTimerRef.current = setTimeout(() => {
            refreshTokenNow();
          }, retryDelay);
        } else {
          console.error('❌ useAuthRefresh: Max retry attempts reached, logging out');
          AuthService.performFullLogout();
        }
      } finally {
        isRefreshingRef.current = false;
      }
    };

    // Initial setup
    setupTokenRefresh();

    // Also refresh on window focus (user returns to tab)
    const handleFocus = () => {
      const token = AuthService.getAccessToken();
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const expirationTime = payload.exp * 1000;
          const currentTime = Date.now();
          const timeUntilExpiry = expirationTime - currentTime;

          // If token will expire in less than 5 minutes, refresh it
          if (timeUntilExpiry < 300000) {
            console.log('⚠️ useAuthRefresh: Token expiring soon after focus (${Math.round(timeUntilExpiry / 1000)}s remaining), refreshing');
            refreshTokenNow();
          }
          // Only log if token is expiring soon, otherwise silent
        } catch (error) {
          console.error('❌ useAuthRefresh: Failed to check token on focus:', error);
        }
      }
    };

    window.addEventListener('focus', handleFocus);

    // Cleanup
    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
      window.removeEventListener('focus', handleFocus);
    };
  }, []); // Empty dependency array - only run once on mount

  return null;
}

