// Firebase configuration for frontend
// This file handles Firebase initialization for client-side features

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Validate configuration
const validateFirebaseConfig = () => {
  const requiredFields = [
    'apiKey',
    'authDomain', 
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId'
  ];

  const missingFields = requiredFields.filter(field => !firebaseConfig[field as keyof typeof firebaseConfig]);
  
  if (missingFields.length > 0) {
    console.warn('Missing Firebase configuration fields:', missingFields);
    return false;
  }
  
  return true;
};

// Initialize Firebase
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let firestore: Firestore | null = null;

const initializeFirebase = () => {
  try {
    // Check if Firebase is already initialized
    if (getApps().length === 0) {
      if (!validateFirebaseConfig()) {
        console.warn('Firebase configuration is incomplete. Some features may not work.');
        return null;
      }
      
      app = initializeApp(firebaseConfig);
      console.log('Firebase initialized successfully');
    } else {
      app = getApps()[0];
    }
    
    // Initialize services
    auth = getAuth(app);
    firestore = getFirestore(app);
    
    return app;
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    return null;
  }
};

// Initialize Firebase on module load
initializeFirebase();

// Export Firebase services
export { app, auth, firestore };

// Export initialization function for manual initialization
export { initializeFirebase };

// Firebase utilities
export const firebaseUtils = {
  isInitialized: () => app !== null,
  getApp: () => app,
  getAuth: () => auth,
  getFirestore: () => firestore,
  
  // Check if Firebase is properly configured
  isConfigured: () => validateFirebaseConfig(),
  
  // Get configuration status
  getConfigStatus: () => ({
    initialized: app !== null,
    configured: validateFirebaseConfig(),
    services: {
      auth: auth !== null,
      firestore: firestore !== null,
    }
  })
};

// Types for Firebase configuration
export interface FirebaseConfigStatus {
  initialized: boolean;
  configured: boolean;
  services: {
    auth: boolean;
    firestore: boolean;
  };
}

// Error handling for Firebase operations
export class FirebaseError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'FirebaseError';
  }
}

// Firebase operation wrapper with error handling
export const withFirebaseErrorHandling = async <T>(
  operation: () => Promise<T>,
  errorMessage: string = 'Firebase operation failed'
): Promise<T> => {
  try {
    return await operation();
  } catch (error: any) {
    console.error(`${errorMessage}:`, error);
    throw new FirebaseError(
      error.message || errorMessage,
      error.code
    );
  }
};

// Development helpers
if (process.env.NODE_ENV === 'development') {
  // Log Firebase configuration status in development
  const status = firebaseUtils.getConfigStatus();
  console.log('Firebase Configuration Status:', status);
  
  // Make Firebase utilities available globally for debugging
  (globalThis as any).firebaseUtils = firebaseUtils;
}
