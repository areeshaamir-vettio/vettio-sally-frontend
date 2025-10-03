// API Configuration Constants
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  VERSION: process.env.NEXT_PUBLIC_API_VERSION || 'v1',
  TIMEOUT: 30000, // 30 seconds
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/api/v1/auth/login',
    REGISTER: '/api/v1/auth/register',
    CORPORATE_REGISTER: '/api/v1/auth/register/corporate', // Corporate registration with email validation
    REFRESH: '/api/v1/auth/refresh',
    LOGOUT: '/api/v1/auth/logout',
    VERIFY_EMAIL: '/api/v1/auth/verify-email',
    FORGOT_PASSWORD: '/api/v1/auth/forgot-password',
    RESET_PASSWORD: '/api/v1/auth/reset-password',
    GOOGLE: '/api/v1/auth/google/callback',
    GITHUB: '/api/v1/auth/github/callback',
    LINKEDIN: '/api/v1/auth/linkedin/callback',
    MICROSOFT: '/api/v1/auth/microsoft/callback',
  },
  
  // User Management
  USERS: {
    PROFILE: '/users/me',
    UPDATE_PROFILE: '/users/me',
    UPLOAD_AVATAR: '/users/me/avatar',
  },
  
  // Organizations
  ORGANIZATIONS: {
    LIST: '/organizations',
    CREATE: '/organizations',
    GET: (id: string) => `/organizations/${id}`,
    UPDATE: (id: string) => `/organizations/${id}`,
    DELETE: (id: string) => `/organizations/${id}`,
  },
  
  // Jobs (placeholder for future implementation)
  JOBS: {
    LIST: '/jobs',
    CREATE: '/jobs',
    GET: (id: string) => `/jobs/${id}`,
    UPDATE: (id: string) => `/jobs/${id}`,
    DELETE: (id: string) => `/jobs/${id}`,
  },
  
  // Candidates (placeholder for future implementation)
  CANDIDATES: {
    LIST: '/candidates',
    CREATE: '/candidates',
    GET: (id: string) => `/candidates/${id}`,
    UPDATE: (id: string) => `/candidates/${id}`,
    DELETE: (id: string) => `/candidates/${id}`,
    SEARCH: '/candidates/search',
  },
  
  // Search
  SEARCH: {
    GLOBAL: '/search',
  },
  
  // WebSocket
  WEBSOCKET: {
    URL: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws',
  },
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY || 'sally_auth_token',
  REFRESH_TOKEN: process.env.NEXT_PUBLIC_REFRESH_TOKEN_KEY || 'sally_refresh_token',
  USER_DATA: 'sally_user_data',
  THEME: 'sally_theme',
  LANGUAGE: 'sally_language',
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

// Application Constants
export const APP_CONFIG = {
  NAME: 'Sally',
  VERSION: '0.1.0',
  ENVIRONMENT: process.env.NEXT_PUBLIC_ENVIRONMENT || 'development',
  SESSION_TIMEOUT: parseInt(process.env.NEXT_PUBLIC_SESSION_TIMEOUT || '3600000'), // 1 hour in ms
  DEBUG_MODE: process.env.NEXT_PUBLIC_DEBUG_MODE === 'true',
  LOG_LEVEL: process.env.NEXT_PUBLIC_LOG_LEVEL || 'info',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'An unexpected error occurred. Please try again later.',
  SESSION_EXPIRED: 'Your session has expired. Please log in again.',
  UNKNOWN_ERROR: 'An unknown error occurred.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Successfully logged in!',
  LOGOUT_SUCCESS: 'Successfully logged out!',
  REGISTRATION_SUCCESS: 'Account created successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  PASSWORD_RESET: 'Password reset email sent!',
  EMAIL_VERIFIED: 'Email verified successfully!',
} as const;
