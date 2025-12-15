import { getApp, getApps, initializeApp } from 'firebase/app';
import { initializeAuth, getAuth } from 'firebase/auth';
import { FIREBASE_CONFIG } from './constants/firebase';

// Initialize Firebase (prevent re-initialization)
const app = getApps().length === 0 ? initializeApp(FIREBASE_CONFIG) : getApp();

// Initialize Firebase Authentication
// Try to use initializeAuth with persistence if AsyncStorage is available
let auth: any;

try {
  // Try to import AsyncStorage dynamically
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
  const { getReactNativePersistence } = require('firebase/auth');

  // If AsyncStorage is available, use it for persistence
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
  console.log('Firebase Auth initialized with AsyncStorage persistence');
} catch (error) {
  // Fallback to getAuth if AsyncStorage is not available
  console.warn('AsyncStorage not available, using Firebase Auth without persistence:', error);
  try {
    auth = getAuth(app);
  } catch (authError) {
    console.warn('getAuth failed, trying initializeAuth without persistence:', authError);
    auth = initializeAuth(app);
  }
}

export { auth };
export default app;