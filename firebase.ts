import { getApp, getApps, initializeApp } from 'firebase/app';
import { initializeAuth, getAuth } from 'firebase/auth';
import { Platform } from 'react-native';
import { FIREBASE_CONFIG } from './constants/firebase';

// Validate Firebase config before initializing
const validateFirebaseConfig = () => {
  const requiredFields = ['apiKey', 'projectId', 'appId'];
  const missingFields = requiredFields.filter(field => !FIREBASE_CONFIG[field as keyof typeof FIREBASE_CONFIG]);

  if (missingFields.length > 0) {
    console.error('Firebase configuration missing required fields:', missingFields);
    console.error('Please check your environment variables in .env file');
    return false;
  }
  return true;
};

// Initialize Firebase (prevent re-initialization)
let app: any;
if (validateFirebaseConfig()) {
  try {
    app = getApps().length === 0 ? initializeApp(FIREBASE_CONFIG) : getApp();
    console.log('Firebase app initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Firebase app:', error);
    app = null;
  }
} else {
  console.error('Firebase not initialized due to missing configuration');
  app = null;
}

// Initialize Firebase Authentication with platform-specific handling
let auth: any = null;

if (app) {
  // Only try AsyncStorage on native platforms
  if (Platform.OS !== 'web') {
    try {
      // Try to import AsyncStorage dynamically
      const AsyncStorageModule = require('@react-native-async-storage/async-storage');
      const AsyncStorage = AsyncStorageModule.default || AsyncStorageModule;

      // Check if AsyncStorage is actually available
      if (AsyncStorage && typeof AsyncStorage.getItem === 'function') {
        const { getReactNativePersistence } = require('firebase/auth');

        auth = initializeAuth(app, {
          persistence: getReactNativePersistence(AsyncStorage),
        });
        console.log('Firebase Auth initialized with AsyncStorage persistence');
      } else {
        throw new Error('AsyncStorage not properly initialized');
      }
    } catch (error) {
      console.warn('AsyncStorage not available, using Firebase Auth without persistence:', error);
      // Fall back to memory-only auth
      try {
        auth = getAuth(app);
      } catch (authError) {
        console.warn('getAuth failed, trying initializeAuth without persistence:', authError);
        auth = initializeAuth(app);
      }
    }
  } else {
    // Web platform - use getAuth or initializeAuth without persistence
    console.log('Web platform detected, using Firebase Auth without AsyncStorage');
    try {
      auth = getAuth(app);
    } catch (authError) {
      console.warn('getAuth failed on web, trying initializeAuth:', authError);
      auth = initializeAuth(app);
    }
  }
} else {
  console.error('Firebase Auth not initialized due to missing Firebase app');
}

export { auth };
export default app;