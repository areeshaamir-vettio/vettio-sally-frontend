import { AxiosError } from 'axios';
import { HTTP_STATUS, ERROR_MESSAGES, APP_CONFIG } from './constants';

// Custom Error Classes
export class ApiError extends Error {
  public status: number;
  public code?: string;
  public details?: any;

  constructor(message: string, status: number, code?: string, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export class ValidationError extends Error {
  public field?: string;
  public errors: Record<string, string[]>;

  constructor(message: string, errors: Record<string, string[]> = {}, field?: string) {
    super(message);
    this.name = 'ValidationError';
    this.errors = errors;
    this.field = field;
  }
}

export class NetworkError extends Error {
  constructor(message: string = ERROR_MESSAGES.NETWORK_ERROR) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class AuthenticationError extends Error {
  constructor(message: string = ERROR_MESSAGES.UNAUTHORIZED) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends Error {
  constructor(message: string = ERROR_MESSAGES.FORBIDDEN) {
    super(message);
  }
}

// Error Response Types
export interface ErrorResponse {
  message: string;
  code?: string;
  details?: any;
  errors?: Record<string, string[]>;
}

export interface ApiErrorResponse {
  error: ErrorResponse;
  status: number;
  timestamp: string;
  path?: string;
}

// Error Handler Class
export class ErrorHandler {
  static handleAxiosError(error: AxiosError): ApiError {
    if (!error.response) {
      // Network error
      return new ApiError(
        ERROR_MESSAGES.NETWORK_ERROR,
        0,
        'NETWORK_ERROR'
      );
    }

    const { status, data } = error.response;
    const errorData = data as any;

    // Extract error message
    let message: string = ERROR_MESSAGES.UNKNOWN_ERROR;
    let code = 'UNKNOWN_ERROR';
    let details = null;

    if (errorData) {
      if (typeof errorData === 'string') {
        message = errorData;
      } else if (errorData.message) {
        message = errorData.message;
      } else if (errorData.error?.message) {
        message = errorData.error.message;
      } else if (errorData.detail) {
        // Handle FastAPI error format
        if (typeof errorData.detail === 'string') {
          message = errorData.detail;
        } else if (Array.isArray(errorData.detail)) {
          // Handle validation errors from FastAPI
          message = errorData.detail.map((err: any) => err.msg || err.message).join(', ');
        }
      }

      code = errorData.code || errorData.error?.code || this.getDefaultErrorCode(status);
      details = errorData.details || errorData.error?.details || errorData.detail;
    }

    return new ApiError(message, status, code, details);
  }

  static getDefaultErrorCode(status: number): string {
    switch (status) {
      case HTTP_STATUS.BAD_REQUEST:
        return 'BAD_REQUEST';
      case HTTP_STATUS.UNAUTHORIZED:
        return 'UNAUTHORIZED';
      case HTTP_STATUS.FORBIDDEN:
        return 'FORBIDDEN';
      case HTTP_STATUS.NOT_FOUND:
        return 'NOT_FOUND';
      case HTTP_STATUS.CONFLICT:
        return 'CONFLICT';
      case HTTP_STATUS.UNPROCESSABLE_ENTITY:
        return 'VALIDATION_ERROR';
      case HTTP_STATUS.INTERNAL_SERVER_ERROR:
        return 'INTERNAL_SERVER_ERROR';
      case HTTP_STATUS.BAD_GATEWAY:
        return 'BAD_GATEWAY';
      case HTTP_STATUS.SERVICE_UNAVAILABLE:
        return 'SERVICE_UNAVAILABLE';
      default:
        return 'UNKNOWN_ERROR';
    }
  }

  static getUserFriendlyMessage(error: ApiError): string {
    switch (error.status) {
      case HTTP_STATUS.BAD_REQUEST:
        return error.message || ERROR_MESSAGES.VALIDATION_ERROR;
      case HTTP_STATUS.UNAUTHORIZED:
        return ERROR_MESSAGES.UNAUTHORIZED;
      case HTTP_STATUS.FORBIDDEN:
        return ERROR_MESSAGES.FORBIDDEN;
      case HTTP_STATUS.NOT_FOUND:
        return ERROR_MESSAGES.NOT_FOUND;
      case HTTP_STATUS.UNPROCESSABLE_ENTITY:
        return error.message || ERROR_MESSAGES.VALIDATION_ERROR;
      case HTTP_STATUS.INTERNAL_SERVER_ERROR:
      case HTTP_STATUS.BAD_GATEWAY:
      case HTTP_STATUS.SERVICE_UNAVAILABLE:
        return ERROR_MESSAGES.SERVER_ERROR;
      case 0:
        return ERROR_MESSAGES.NETWORK_ERROR;
      default:
        return error.message || ERROR_MESSAGES.UNKNOWN_ERROR;
    }
  }

  static logError(error: Error, context?: string): void {
    if (!APP_CONFIG.DEBUG_MODE) return;

    const errorInfo = {
      name: error.name,
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
    };

    if (error instanceof ApiError) {
      Object.assign(errorInfo, {
        status: error.status,
        code: error.code,
        details: error.details,
      });
    }

    console.error('Error logged:', errorInfo);
  }

  static isRetryableError(error: ApiError): boolean {
    // Retry on network errors and 5xx server errors
    return (
      error.status === 0 || // Network error
      error.status >= 500 || // Server errors
      error.status === HTTP_STATUS.BAD_GATEWAY ||
      error.status === HTTP_STATUS.SERVICE_UNAVAILABLE
    );
  }

  static shouldRefreshToken(error: ApiError): boolean {
    return error.status === HTTP_STATUS.UNAUTHORIZED && error.code !== 'INVALID_CREDENTIALS';
  }
}

// Utility functions for common error scenarios
export function createValidationError(errors: Record<string, string[]>): ValidationError {
  const message = 'Validation failed';
  return new ValidationError(message, errors);
}

export function createNetworkError(): NetworkError {
  return new NetworkError();
}

export function createAuthenticationError(message?: string): AuthenticationError {
  return new AuthenticationError(message);
}

export function createAuthorizationError(message?: string): AuthorizationError {
  return new AuthorizationError(message);
}

// Error boundary helper
export function getErrorBoundaryMessage(error: Error): string {
  if (error instanceof ApiError) {
    return ErrorHandler.getUserFriendlyMessage(error);
  }
  
  if (error instanceof ValidationError) {
    return error.message;
  }
  
  if (error instanceof NetworkError) {
    return error.message;
  }
  
  if (error instanceof AuthenticationError) {
    return error.message;
  }
  
  if (error instanceof AuthorizationError) {
    return error.message;
  }
  
  return ERROR_MESSAGES.UNKNOWN_ERROR;
}

// Type guards
export function isApiError(error: any): error is ApiError {
  return error instanceof ApiError;
}

export function isValidationError(error: any): error is ValidationError {
  return error instanceof ValidationError;
}

export function isNetworkError(error: any): error is NetworkError {
  return error instanceof NetworkError;
}

export function isAuthenticationError(error: any): error is AuthenticationError {
  return error instanceof AuthenticationError;
}

export function isAuthorizationError(error: any): error is AuthorizationError {
  return error instanceof AuthorizationError;
}
