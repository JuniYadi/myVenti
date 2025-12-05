import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '../components/themed-text';
import { ThemedView } from '../components/themed-view';
import { AuthButton } from '../components/auth/auth-button';
import { useAuth } from '../hooks/use-auth';
import { useColorScheme } from '../hooks/use-theme-manager';

export default function WelcomeScreen() {
  const { signInWithGoogle } = useAuth();
  const colorScheme = useColorScheme() ?? 'light';

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      // Error is handled by the useAuth hook
      console.log('Google sign-in cancelled or failed');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        {/* App Logo/Title */}
        <View style={styles.header}>
          <View style={[styles.logoContainer, { backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#f0f0f0' }]}>
            <Ionicons name="car" size={60} color={colorScheme === 'dark' ? '#ffffff' : '#000000'} />
          </View>
          <ThemedText type="title" style={styles.title}>
            myVenti
          </ThemedText>
          <ThemedText type="subtitle" style={styles.subtitle}>
            Track your fuel expenses efficiently
          </ThemedText>
        </View>

        {/* Authentication Buttons */}
        <View style={styles.buttons}>
          <AuthButton
            title="Sign in with Google"
            onPress={handleGoogleSignIn}
            variant="google"
            icon={<Ionicons name="logo-google" size={20} color="#4285F4" />}
          />

          <AuthButton
            title="Sign in with Email"
            onPress={() => router.push('/login')}
            variant="secondary"
          />

          <AuthButton
            title="Create Account"
            onPress={() => router.push('/signup')}
            variant="primary"
          />
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <ThemedText style={styles.footerText}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: 40,
  },
  header: {
    alignItems: 'center',
    gap: 16,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.8,
  },
  buttons: {
    gap: 12,
    width: '100%',
  },
  footer: {
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.6,
  },
});