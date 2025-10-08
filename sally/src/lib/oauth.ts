// OAuth Service for handling Google and LinkedIn authentication
import Cookies from 'js-cookie';
import { API_CONFIG } from './constants';
import { User } from '@/types/auth';

export interface OAuthAuthorizationResponse {
  authorization_url: string;
  state: string;
}

export interface OAuthCallbackRequest {
  provider: string;
  code: string;
  state: string;
  redirect_uri: string;
}

export interface OAuthTokenResponse {
  access_token: string;
  refresh_token: string;
  user: User;
  is_new_user?: boolean;
}

export class OAuthService {
  private static readonly ACCESS_TOKEN_KEY = 'access_token';
  private static readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private static readonly OAUTH_STATE_KEY = 'oauth_state';
  private static readonly OAUTH_PROVIDER_KEY = 'oauth_provider';
  
  /**
   * Initiates OAuth flow by getting authorization URL from backend
   */
  static async initiateOAuth(provider: 'google' | 'linkedin' | 'github'): Promise<void> {
    try {
      const redirectUri = process.env.NEXT_PUBLIC_OAUTH_REDIRECT_URI || 'http://localhost:3000/oauth2callback';

      console.log(`🔄 Initiating ${provider} OAuth with redirect URI:`, redirectUri);

      const authorizeUrl = `${API_CONFIG.BASE_URL}/api/v1/auth/oauth/${provider}/authorize?redirect_uri=${encodeURIComponent(redirectUri)}`;

      const response = await fetch(authorizeUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to initiate ${provider} OAuth`);
      }

      const data: OAuthAuthorizationResponse = await response.json();
      console.log(`✅ ${provider} OAuth authorization data:`, data);

      // Store state and provider for verification
      sessionStorage.setItem(this.OAUTH_STATE_KEY, data.state);
      sessionStorage.setItem(this.OAUTH_PROVIDER_KEY, provider);

      console.log(`🔄 Redirecting to ${provider} OAuth provider...`);
      // Redirect to OAuth provider
      window.location.href = data.authorization_url;
    } catch (error) {
      console.error(`${provider} OAuth initiation failed:`, error);
      throw error;
    }
  }

  /**
   * Handles OAuth callback and exchanges code for tokens
   */
  static async handleOAuthCallback(
    code: string,
    state: string,
    provider?: string
  ): Promise<OAuthTokenResponse> {
    try {
      // Verify state parameter
      const storedState = sessionStorage.getItem(this.OAUTH_STATE_KEY);
      if (state !== storedState) {
        throw new Error('Invalid state parameter - possible CSRF attack');
      }

      // Get provider from storage if not provided
      const oauthProvider = provider || sessionStorage.getItem(this.OAUTH_PROVIDER_KEY);
      if (!oauthProvider) {
        throw new Error('OAuth provider not found');
      }

      const redirectUri = process.env.NEXT_PUBLIC_OAUTH_REDIRECT_URI || 'http://localhost:3000/oauth2callback';
      
      const callbackData: OAuthCallbackRequest = {
        provider: oauthProvider,
        code,
        state,
        redirect_uri: redirectUri,
      };

      const response = await fetch(
        `${API_CONFIG.BASE_URL}/api/v1/auth/oauth/${oauthProvider}/callback`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(callbackData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'OAuth callback failed');
      }

      const tokenData: OAuthTokenResponse = await response.json();

      console.log('🔍 OAuth Backend Response - Full token data:', tokenData);
      console.log('🔍 OAuth Backend Response - User object:', tokenData.user);
      console.log('🔍 OAuth Backend Response - All user fields:', Object.keys(tokenData.user));

      // Store tokens in cookies (same pattern as AuthService.login)
      Cookies.set(this.ACCESS_TOKEN_KEY, tokenData.access_token, {
        expires: 7,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
      Cookies.set(this.REFRESH_TOKEN_KEY, tokenData.refresh_token, {
        expires: 30,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
      
      // Clean up OAuth state
      this.cleanupOAuthState();
      
      return tokenData;
    } catch (error) {
      console.error('OAuth callback handling failed:', error);
      this.cleanupOAuthState();
      throw error;
    }
  }

  /**
   * Cleans up OAuth state from session storage
   */
  static cleanupOAuthState(): void {
    sessionStorage.removeItem(this.OAUTH_STATE_KEY);
    sessionStorage.removeItem(this.OAUTH_PROVIDER_KEY);
  }

  /**
   * Checks if we're currently in an OAuth flow
   */
  static isOAuthInProgress(): boolean {
    return !!(
      sessionStorage.getItem(this.OAUTH_STATE_KEY) &&
      sessionStorage.getItem(this.OAUTH_PROVIDER_KEY)
    );
  }

  /**
   * Gets the current OAuth provider if in progress
   */
  static getCurrentOAuthProvider(): string | null {
    return sessionStorage.getItem(this.OAUTH_PROVIDER_KEY);
  }
}
