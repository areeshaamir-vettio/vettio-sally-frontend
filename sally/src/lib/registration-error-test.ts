// Test scenarios for comprehensive error handling
// This file demonstrates all possible error conditions and their handling

export const ERROR_TEST_SCENARIOS = {
  // Client-side validation errors
  CLIENT_VALIDATION: {
    emptyFields: {
      email: '',
      password: '',
      fullName: '',
      expectedError: 'Please fill in all required fields'
    },
    invalidEmail: {
      email: 'invalid-email',
      password: 'ValidPass123',
      fullName: 'John Doe',
      expectedError: 'Please enter a valid email address'
    },
    personalEmail: {
      email: 'user@gmail.com',
      password: 'ValidPass123',
      fullName: 'John Doe',
      expectedError: 'Please use your work email. Personal emails (Gmail, Yahoo, etc.) aren\'t supported.'
    },
    weakPassword: {
      email: 'user@company.com',
      password: '12345678',
      fullName: 'John Doe',
      expectedError: 'Password must contain at least one uppercase letter'
    },
    shortName: {
      email: 'user@company.com',
      password: 'ValidPass123',
      fullName: 'A',
      expectedError: 'Full name must be at least 2 characters long'
    }
  },

  // Server-side errors (from backend API)
  SERVER_ERRORS: {
    userExists: {
      status: 400,
      response: { detail: 'User with this email already exists' },
      expectedMessage: 'An account with this email already exists. Try logging in instead.'
    },
    organizationFailed: {
      status: 400,
      response: { detail: 'Failed to create organization' },
      expectedMessage: 'Unable to set up your organization. This might be a temporary issue. Please try again.'
    },
    corporateEmailRequired: {
      status: 400,
      response: { detail: 'Process is designed for businesses and requires a corporate email address' },
      expectedMessage: 'Please use your work email. Personal emails (Gmail, Yahoo, etc.) aren\'t supported.'
    },
    firebaseError: {
      status: 400,
      response: { detail: 'Failed to create user in Firebase Auth' },
      expectedMessage: 'Account creation failed. Please try again.'
    },
    passwordValidation: {
      status: 422,
      response: {
        detail: [
          {
            type: 'value_error',
            loc: ['body', 'password'],
            msg: 'Password must contain at least one uppercase letter',
            input: '12345678'
          }
        ]
      },
      expectedMessage: 'Password must include at least one uppercase letter (A-Z)'
    },
    internalServerError: {
      status: 500,
      response: { detail: 'Internal server error' },
      expectedMessage: 'Server error. Please try again later.'
    }
  },

  // Network errors
  NETWORK_ERRORS: {
    connectionFailed: {
      error: new Error('fetch failed'),
      expectedMessage: 'Connection problem. Please check your internet and try again.'
    },
    timeout: {
      error: new Error('Network timeout'),
      expectedMessage: 'Connection problem. Please check your internet and try again.'
    }
  }
};

// Test helper functions
export const testErrorHandling = {
  // Test client-side validation
  testClientValidation: (scenario: any) => {
    console.log('Testing client validation:', scenario);
    // This would be used in actual tests
  },

  // Test server error parsing
  testServerErrorParsing: (scenario: any) => {
    console.log('Testing server error parsing:', scenario);
    // This would be used in actual tests
  },

  // Test network error handling
  testNetworkErrorHandling: (scenario: any) => {
    console.log('Testing network error handling:', scenario);
    // This would be used in actual tests
  }
};

// Error simulation for testing
export const simulateErrors = {
  // Simulate the "Failed to create organization" error you encountered
  simulateOrganizationError: () => {
    return new Promise((_, reject) => {
      reject({
        response: {
          status: 400,
          data: {
            detail: 'Failed to create organization'
          }
        }
      });
    });
  },

  // Simulate password validation error
  simulatePasswordError: () => {
    return new Promise((_, reject) => {
      reject({
        response: {
          status: 422,
          data: {
            detail: [
              {
                type: 'value_error',
                loc: ['body', 'password'],
                msg: 'Password must contain at least one uppercase letter',
                input: '12345678'
              }
            ]
          }
        }
      });
    });
  },

  // Simulate network error
  simulateNetworkError: () => {
    return new Promise((_, reject) => {
      reject(new Error('Network error: fetch failed'));
    });
  }
};

// User-friendly error messages mapping
export const ERROR_MESSAGES = {
  // Validation errors
  VALIDATION: {
    EMPTY_FIELDS: 'Please fill in all required fields',
    INVALID_EMAIL: 'Please enter a valid email address',
    PERSONAL_EMAIL: 'Please use your work email. Personal emails (Gmail, Yahoo, etc.) aren\'t supported.',
    WEAK_PASSWORD: 'Password must be stronger',
    SHORT_NAME: 'Full name must be at least 2 characters long'
  },

  // Server errors
  SERVER: {
    USER_EXISTS: 'An account with this email already exists. Try logging in instead.',
    ORGANIZATION_FAILED: 'Unable to set up your organization. This might be a temporary issue. Please try again.',
    FIREBASE_ERROR: 'Account creation failed. Please try again.',
    INTERNAL_ERROR: 'Server error. Please try again later.'
  },

  // Network errors
  NETWORK: {
    CONNECTION_FAILED: 'Connection problem. Please check your internet and try again.',
    TIMEOUT: 'Request timed out. Please try again.'
  }
};
