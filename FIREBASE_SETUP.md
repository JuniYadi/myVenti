# Firebase Authentication Setup Guide

This guide will help you set up Firebase Authentication for your myVenti app.

## 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter your project name (e.g., "myVenti")
4. Follow the setup steps
5. Enable Google Analytics if desired

## 2. Configure Authentication

1. In your Firebase project, go to "Authentication" → "Sign-in method"
2. Enable the following providers:
   - **Email/Password**: Enable and save
   - **Google**: Enable, add your app's support email, and save

## 3. Get Firebase Configuration

1. In Firebase Console, go to Project Settings (⚙️ icon)
2. Under "Your apps", click "Add app" → Web app (even for mobile)
3. Copy the Firebase configuration object
4. Update `constants/firebase.ts` with your actual configuration:

```typescript
export const FIREBASE_CONFIG = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789012",
  appId: "your-actual-app-id",
};
```

## 4. Google Sign-In Configuration

### 4.1 Get Client IDs

1. In Firebase Console, go to Authentication → Sign-in method → Google
2. Click the dropdown and select "Configuration"
3. Copy the Web client ID
4. For Android/iOS, you'll need to configure additional client IDs

### 4.2 Update Google Sign-In Config

Update `constants/firebase.ts` with your Google client IDs:

```typescript
export const GOOGLE_SIGN_IN_CONFIG = {
  webClientId: 'your-actual-web-client-id.apps.googleusercontent.com',
  iosClientId: 'your-ios-client-id.apps.googleusercontent.com', // Optional
  androidClientId: 'your-android-client-id.apps.googleusercontent.com', // Optional
};
```

### 4.3 Android Configuration

1. In Firebase Console, go to Project Settings → Your apps → Android app
2. Add your Android app with package name: `com.juniyadi.myVenti`
3. Download `google-services.json` and place it in the `android/app/` directory
4. Follow the setup instructions to add the Google Services plugin

### 4.4 iOS Configuration

1. In Firebase Console, go to Project Settings → Your apps → iOS app
2. Add your iOS app with bundle ID: `com.juniyadi.myVenti`
3. Download `GoogleService-Info.plist` and add it to your Xcode project
4. Configure URL schemes in Xcode

## 5. Additional Required Configuration

### 5.1 Expo Configuration

Update your `app.json` to include Google Sign-In configuration:

```json
{
  "expo": {
    // ... existing config
    "plugins": [
      "expo-router",
      [
        "expo-splash-screen",
        {
          // ... existing splash config
        }
      ],
      [
        "@react-native-google-signin/google-signin"
      ]
    ],
    // ... rest of config
  }
}
```

### 5.2 Install Additional Dependencies (if needed)

```bash
npm install @react-native-google-signin/google-signin
```

### 5.3 Android SHA-1 Fingerprint

For Google Sign-In to work in production, you'll need to add your Android SHA-1 fingerprint:

1. Generate SHA-1 fingerprint:
   ```bash
   cd android
   ./gradlew signingReport
   ```

2. Copy the SHA-1 fingerprint for your debug and release keys

3. In Firebase Console, go to Project Settings → Your apps → Android app
4. Add the SHA-1 fingerprint under "SHA certificate fingerprints"

## 6. Security Rules

### 6.1 Firestore Security Rules

If you're using Firestore, add security rules to protect user data:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Example: Users can only access their own fuel records
    match /fuel/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 6.2 Storage Security Rules

If you're using Firebase Storage, add security rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Users can only access their own files
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 7. Test Your Configuration

1. Run your app:
   ```bash
   npm start
   ```

2. Test authentication flows:
   - Welcome screen should appear for unauthenticated users
   - Email/password sign up and sign in
   - Google Sign-In (requires proper Google OAuth setup)
   - Navigation protection should work correctly

## 8. Troubleshooting

### Common Issues:

1. **"Web client type is required"**
   - Make sure you've configured Google Sign-In in Firebase Console
   - Verify your web client ID is correct

2. **"Developer error" on Android**
   - Check that `google-services.json` is in `android/app/`
   - Verify your Android package name matches Firebase configuration

3. **"Network request failed"**
   - Check your Firebase configuration values
   - Ensure your API key is correct and not restricted

4. **Google Sign-In not working**
   - Verify SHA-1 fingerprint is added to Firebase Console
   - Check that OAuth consent screen is configured
   - Ensure your app is properly verified for Google Sign-In

### Debug Tips:

- Use `console.log` to debug authentication flow
- Check Firebase Console → Authentication → Users to see created accounts
- Monitor Network tab for API calls and errors
- Test on both development and production builds

## 9. Next Steps

Once authentication is working:

1. Add user profile management
2. Implement user data storage in Firestore
3. Add email verification for new accounts
4. Set up password reset functionality
5. Consider adding additional auth providers (Apple, Facebook, etc.)

## 10. Production Considerations

- Set up proper email templates for verification and password reset
- Configure production SHA-1 keys for Android
- Set up proper iOS app certificates and provisioning profiles
- Consider enabling Firebase App Check for additional security
- Set up monitoring and analytics for authentication events

---

**Note**: Keep your Firebase configuration secure and never commit sensitive credentials to version control.