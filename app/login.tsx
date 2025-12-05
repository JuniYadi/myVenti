import { router } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '../components/themed-text';
import { ThemedView } from '../components/themed-view';
import { AuthButton } from '../components/auth/auth-button';
import { AuthInput } from '../components/auth/auth-input';
import { ErrorMessage } from '../components/auth/error-message';
import { useAuth } from '../hooks/use-auth';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const { signIn, loading, error, signInWithGoogle, clearError } = useAuth();

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async () => {
    if (!validateForm()) return;

    try {
      await signIn(email, password);
    } catch (error) {
      // Error is handled by the useAuth hook
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      // Error is handled by the useAuth hook
    }
  };

  const handleBack = () => {
    clearError();
    router.back();
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title">Welcome Back</ThemedText>
        <ThemedText style={styles.subtitle}>
          Sign in to continue tracking your fuel expenses
        </ThemedText>
      </View>

      <View style={styles.form}>
        <ErrorMessage message={error} onDismiss={clearError} />

        <AuthInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          error={errors.email}
        />

        <AuthInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Enter your password"
          secureTextEntry
          error={errors.password}
        />

        <AuthButton
          title="Sign In"
          onPress={handleSignIn}
          loading={loading}
          disabled={loading}
        />

        <AuthButton
          title="Sign in with Google"
          onPress={handleGoogleSignIn}
          variant="google"
          disabled={loading}
          icon={<Ionicons name="logo-google" size={20} color="#4285F4" />}
        />
      </View>

      <View style={styles.footer}>
        <ThemedText style={styles.footerText}>
          Don't have an account?{' '}
          <ThemedText style={styles.link} onPress={() => router.push('/signup')}>
            Sign Up
          </ThemedText>
        </ThemedText>

        <AuthButton
          title="Back"
          onPress={handleBack}
          variant="secondary"
        />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  subtitle: {
    textAlign: 'center',
    marginTop: 8,
    opacity: 0.7,
  },
  form: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  footer: {
    paddingBottom: 20,
    gap: 16,
  },
  footerText: {
    textAlign: 'center',
    fontSize: 16,
  },
  link: {
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});