import {
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithCredential,
  signInWithEmailAndPassword,
  User
} from 'firebase/auth';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { GOOGLE_SIGN_IN_CONFIG } from '../constants/firebase';
import { auth } from '../firebase';

// Conditionally import Google Sign-in only for native platforms
let GoogleSignin: any = null;
let statusCodes: any = null;

if (Platform.OS !== 'web') {
  try {
    const googleSigninModule = require('@react-native-google-signin/google-signin');
    GoogleSignin = googleSigninModule.GoogleSignin;
    statusCodes = googleSigninModule.statusCodes;
  } catch (error) {
    console.warn('Google Sign-in not available:', error);
  }
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Configure Google Sign-In only if available
    if (GoogleSignin) {
      try {
        GoogleSignin.configure({
          webClientId: GOOGLE_SIGN_IN_CONFIG.webClientId,
          offlineAccess: true,
        });
      } catch (error) {
        console.warn('Failed to configure Google Sign-in:', error);
      }
    }

    // Listen for auth state changes using the imported function
    const unsubscribe = onAuthStateChanged(auth, (authUser: User | null) => {
      console.log('Auth state changed:', authUser ? 'User logged in' : 'No user');
      setUser(authUser);
      setLoading(false);
      setIsInitialized(true);
    }, (error: any) => {
      console.error('Auth state change error:', error);
      setLoading(false);
      setIsInitialized(true);
    });

    // Fallback timeout in case onAuthStateChanged doesn't fire
    const timeout = setTimeout(() => {
      if (!isInitialized) {
        console.log('Auth initialization timeout - setting loading to false');
        setLoading(false);
        setIsInitialized(true);
      }
    }, 5000);

    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError(getAuthErrorMessage(err.code));
      setLoading(false);
      throw err;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError(getAuthErrorMessage(err.code));
      setLoading(false);
      throw err;
    }
  };

  const signInWithGoogle = async () => {
    if (!GoogleSignin) {
      setError('Google Sign-in is not available on this platform');
      throw new Error('Google Sign-in not available');
    }

    try {
      setError(null);
      setLoading(true);

      // Check if device supports Google Play Services
      await GoogleSignin.hasPlayServices();

      // Sign in with Google
      const result = await GoogleSignin.signIn();
      const idToken = result.data?.idToken;

      if (!idToken) {
        throw new Error('Failed to get ID token from Google Sign-In');
      }

      // Create Google credential
      const googleCredential = GoogleAuthProvider.credential(idToken);

      // Sign in with Firebase
      await signInWithCredential(auth, googleCredential);
    } catch (err: any) {
      setLoading(false);

      if (statusCodes && err.code === statusCodes.SIGN_IN_CANCELLED) {
        // User cancelled the sign-in
        return;
      } else if (statusCodes && err.code === statusCodes.IN_PROGRESS) {
        // Operation is already in progress
        return;
      } else if (statusCodes && err.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        setError('Google Play Services not available');
      } else {
        setError(getAuthErrorMessage(err.code));
      }
      throw err;
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      if (GoogleSignin) {
        await GoogleSignin.signOut();
      }
      await firebaseSignOut(auth);
    } catch (err: any) {
      setError(getAuthErrorMessage(err.code));
      throw err;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setError(null);
      setLoading(true);
      await sendPasswordResetEmail(auth, email);
      setLoading(false);
    } catch (err: any) {
      setError(getAuthErrorMessage(err.code));
      setLoading(false);
      throw err;
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value: AuthContextType = {
    user,
    loading,
    error,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Helper function to convert Firebase error codes to user-friendly messages
function getAuthErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/user-not-found':
      return 'No account found with this email address.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection.';
    case 'auth/user-disabled':
      return 'This account has been disabled.';
    case 'auth/operation-not-allowed':
      return 'Email/password accounts are not enabled.';
    default:
      return 'An error occurred. Please try again.';
  }
}