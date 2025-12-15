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

// Initialize Firebase Authentication with safe loading
let auth: any = null;
let authInitialized = false;

const initializeFirebaseAuth = async () => {
  if (!app) {
    console.error('Firebase Auth not initialized due to missing Firebase app');
    authInitialized = true;
    return null;
  }

  // Try to initialize with AsyncStorage only on native platforms
  if (Platform.OS !== 'web') {
    try {
      // Lazy load AsyncStorage only when needed
      const AsyncStorageModule = await import('@react-native-async-storage/async-storage');
      const AsyncStorage = AsyncStorageModule.default || AsyncStorageModule;

      // Check if AsyncStorage is actually available
      if (AsyncStorage && typeof AsyncStorage.getItem === 'function') {
        // Lazy load getReactNativePersistence
        const { getReactNativePersistence, initializeAuth } = await import('firebase/auth');

        return initializeAuth(app, {
          persistence: getReactNativePersistence(AsyncStorage),
        });
      } else {
        throw new Error('AsyncStorage not properly initialized');
      }
    } catch (error) {
      console.warn('AsyncStorage not available, using Firebase Auth without persistence:', error);
      // Fall back to memory-only auth
    }
  } else {
    // Web platform - skip AsyncStorage
    console.log('Web platform detected, using Firebase Auth without AsyncStorage');
  }

  // Fallback: Initialize without persistence
  try {
    const { getAuth } = await import('firebase/auth');
    return getAuth(app);
  } catch (authError) {
    console.warn('getAuth failed, trying initializeAuth without persistence:', authError);
    try {
      const { initializeAuth } = await import('firebase/auth');
      return initializeAuth(app);
    } catch (initError) {
      console.error('Failed to initialize Firebase Auth:', initError);
      return null;
    }
  }
};

// Initialize auth asynchronously but also export a promise for cases where we need to wait
const authPromise = initializeFirebaseAuth().then(authInstance => {
  auth = authInstance;
  authInitialized = true;
  if (auth) {
    console.log('Firebase Auth initialized successfully');
  }
  return auth;
}).catch(error => {
  console.error('Critical error initializing Firebase Auth:', error);
  authInitialized = true;
  return null;
});

// Export auth promise for async usage
export { authPromise };

export { auth };
export default app;