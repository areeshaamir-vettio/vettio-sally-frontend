import { useEffect, useRef } from 'react';
import { AuthService } from '@/lib/auth';

/**
 * Hook to automatically refresh authentication tokens before they expire
 * This prevents users from being logged out unexpectedly
 */
export function useAuthRefresh() {
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isRefreshingRef = useRef(false);

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
        const newToken = await AuthService.refreshToken();
        console.log('✅ useAuthRefresh: Token refreshed successfully');
        
        // Schedule the next refresh
        setupTokenRefresh();
      } catch (error) {
        console.error('❌ useAuthRefresh: Token refresh failed:', error);
        
        // If refresh fails, try again in 30 seconds
        // This gives the backend time to recover if it's temporarily down
        console.log('⏰ useAuthRefresh: Scheduling retry in 30 seconds');
        refreshTimerRef.current = setTimeout(() => {
          refreshTokenNow();
        }, 30000);
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

