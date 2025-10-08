// OAuth hook for managing OAuth state and flow
import { useState, useCallback } from 'react';
import { OAuthService } from '@/lib/oauth';

export interface OAuthState {
  isLoading: boolean;
  error: string | null;
  provider: string | null;
}

export const useOAuth = () => {
  const [state, setState] = useState<OAuthState>({
    isLoading: false,
    error: null,
    provider: null,
  });

  const initiateOAuth = useCallback(async (provider: 'google' | 'linkedin') => {
    setState({
      isLoading: true,
      error: null,
      provider,
    });

    try {
      await OAuthService.initiateOAuth(provider);
      // Note: User will be redirected, so we won't reach this point
      // unless there's an error
    } catch (error) {
      setState({
        isLoading: false,
        error: error instanceof Error ? error.message : `${provider} authentication failed`,
        provider: null,
      });
      throw error;
    }
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      provider: null,
    });
  }, []);

  return {
    ...state,
    initiateOAuth,
    clearError,
    reset,
  };
};
