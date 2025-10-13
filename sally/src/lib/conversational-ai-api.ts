// API Client for Conversational AI / Role Enhancement

import {
  RoleEnhancementResponse,
  SendMessageRequest,
  ApiError,
  ValidationError,
} from '@/types/role-enhancement';
import { AuthService } from '@/lib/auth';

// ============================================================================
// CONFIGURATION
// ============================================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * Custom error class for API errors
 */
class ConversationalApiError extends Error implements ApiError {
  status: number;
  details?: ValidationError | Record<string, unknown>;

  constructor(message: string, status: number, details?: ValidationError | Record<string, unknown>) {
    super(message);
    this.name = 'ConversationalApiError';
    this.status = status;
    this.details = details;
  }
}

/**
 * Handles API response errors
 */
async function handleApiError(response: Response): Promise<never> {
  let errorDetails;
  
  try {
    errorDetails = await response.json();
  } catch {
    errorDetails = { message: response.statusText };
  }

  // Handle validation errors (422)
  if (response.status === 422 && errorDetails.detail) {
    const validationError = errorDetails as ValidationError;
    const errorMessages = validationError.detail
      .map((err) => `${err.loc.join('.')}: ${err.msg}`)
      .join(', ');
    
    throw new ConversationalApiError(
      `Validation Error: ${errorMessages}`,
      422,
      validationError
    );
  }

  // Handle other errors
  const errorMessage = errorDetails.message || errorDetails.detail || 'An error occurred';
  throw new ConversationalApiError(errorMessage, response.status, errorDetails);
}

// ============================================================================
// API CLIENT CLASS
// ============================================================================

class ConversationalAiApiClient {
  private baseUrl: string;
  private authToken: string | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Set authentication token for API requests
   * Currently commented out as authentication is not required yet
   */
  setAuthToken(token: string) {
    this.authToken = token;
  }

  /**
   * Get default headers for API requests
   */
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Attach Authorization header if an access token is available
    const token = AuthService.getAccessToken();
    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Make a GET request to the API
   */
  private async get<T>(endpoint: string): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      let response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      // If unauthorized, attempt a token refresh once and retry
      if (response.status === 401) {
        try {
          const newAccessToken = await AuthService.refreshToken();
          response = await fetch(url, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${newAccessToken}`,
            },
          });
        } catch (e) {
          // Refresh failed, propagate original error handling below
        }
      }

      if (!response.ok) {
        await handleApiError(response);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ConversationalApiError) {
        throw error;
      }
      throw new ConversationalApiError(
        `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        0
      );
    }
  }

  /**
   * Make a POST request to the API
   */
  private async post<T>(endpoint: string, data?: Record<string, unknown>): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    console.log('🌐 POST Request:', {
      url,
      endpoint,
      baseUrl: this.baseUrl,
      data,
      headers: this.getHeaders()
    });

    try {
      let response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: data ? JSON.stringify(data) : undefined,
      });

      console.log('📡 POST Response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        url: response.url
      });

      // If unauthorized, attempt a token refresh once and retry
      if (response.status === 401) {
        console.log('🔄 ConversationalAI: Attempting token refresh...');
        try {
          // Check if refresh token exists and is valid
          const { TokenManager } = await import('./auth');
          const refreshToken = TokenManager.getRefreshToken();

          if (!refreshToken || TokenManager.isTokenExpired(refreshToken)) {
            console.error('❌ ConversationalAI: Refresh token missing or expired');
            AuthService.performFullLogout();
            throw new Error('Session expired');
          }

          const newAccessToken = await AuthService.refreshToken();
          console.log('✅ ConversationalAI: Token refreshed, retrying request...');
          response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${newAccessToken}`,
            },
            body: data ? JSON.stringify(data) : undefined,
          });
          console.log('📡 ConversationalAI: Retry Response:', {
            status: response.status,
            statusText: response.statusText,
            ok: response.ok
          });
        } catch (e: any) {
          console.error('❌ ConversationalAI: Token refresh failed:', e);

          // Only call performFullLogout if it wasn't already called
          if (!e?.message?.includes('Session expired') &&
              !e?.message?.includes('Refresh token expired')) {
            AuthService.performFullLogout();
          }

          // Refresh failed, propagate original error handling below
        }
      }

      if (!response.ok) {
        console.error('❌ Response not OK, handling error...');
        await handleApiError(response);
      }

      const responseData = await response.json();
      console.log('✅ POST Success - Response data:', responseData);
      return responseData;
    } catch (error) {
      console.error('❌ POST Request failed:', error);
      if (error instanceof ConversationalApiError) {
        throw error;
      }
      throw new ConversationalApiError(
        `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        0
      );
    }
  }

  // ==========================================================================
  // PUBLIC API METHODS
  // ==========================================================================

  /**
   * Start a new conversation for a role
   * GET /api/v1/intake/roles/{role_id}
   * 
   * @param roleId - The ID of the role to enhance
   * @returns The initial conversation state with the first question
   */
  async startConversation(roleId: string): Promise<RoleEnhancementResponse> {
    return this.get<RoleEnhancementResponse>(`/intake/roles/${roleId}`);
  }

  /**
   * Send a message in the conversation
   * POST /api/v1/intake/roles/{role_id}/enhance
   *
   * @param roleId - The ID of the role
   * @param message - The user's message
   * @returns Updated conversation state with AI response
   */
  async sendMessage(roleId: string, message: string): Promise<RoleEnhancementResponse> {
    const requestBody = {
      user_message: message,
    };

    return this.post<RoleEnhancementResponse>(
      `/intake/roles/${roleId}/enhance`,
      requestBody
    );
  }

  /**
   * Get the current conversation state
   * GET /api/v1/intake/roles/{role_id}
   * 
   * @param roleId - The ID of the role
   * @returns Current conversation state
   */
  async getConversation(roleId: string): Promise<RoleEnhancementResponse> {
    return this.get<RoleEnhancementResponse>(`/intake/roles/${roleId}`);
  }

  /**
   * Pause the conversation (not implemented in backend yet)
   * This is a placeholder for future implementation
   *
   * @returns Success response
   */
  async pauseConversation(): Promise<{ success: boolean; message: string }> {
    // TODO: Implement when backend endpoint is available
    // return this.post<{ success: boolean; message: string }>(
    //   `/intake/roles/${roleId}/pause`
    // );

    // For now, return a mock success response
    return Promise.resolve({
      success: true,
      message: 'Conversation paused successfully. You can resume anytime from where you left off.',
    });
  }

  /**
   * Refresh conversation state (alias for getConversation)
   * 
   * @param roleId - The ID of the role
   * @returns Current conversation state
   */
  async refreshConversation(roleId: string): Promise<RoleEnhancementResponse> {
    return this.getConversation(roleId);
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const conversationalAiApi = new ConversationalAiApiClient();

// Export the error class for error handling in components
export { ConversationalApiError };

// Export type for external use
export type { ConversationalAiApiClient };

