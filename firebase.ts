import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { FIREBASE_CONFIG } from '@/constants/firebase';

// Initialize Firebase
const app = initializeApp(FIREBASE_CONFIG);

// Initialize Firebase Authentication
export const auth = getAuth(app);

export default app;