import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { FIREBASE_CONFIG } from './constants/firebase';

// Initialize Firebase (prevent re-initialization)
const app = getApps().length === 0 ? initializeApp(FIREBASE_CONFIG) : getApp();

// Initialize Firebase Authentication with AsyncStorage for persistence
// Always use initializeAuth with persistence for React Native
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export { auth };
export default app;