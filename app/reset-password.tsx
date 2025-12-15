import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { AuthButton } from '../components/auth/auth-button';
import { AuthInput } from '../components/auth/auth-input';
import { ErrorMessage } from '../components/auth/error-message';
import { ThemedText } from '../components/themed-text';
import { ThemedView } from '../components/themed-view';
import { useAuth } from '../hooks/use-auth';

export default function ResetPasswordScreen() {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<{ email?: string }>({});
  const [isEmailSent, setIsEmailSent] = useState(false);

  const { resetPassword, loading, error, clearError } = useAuth();

  const validateForm = () => {
    const newErrors: { email?: string } = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResetPassword = async () => {
    if (!validateForm()) return;

    try {
      await resetPassword(email);
      setIsEmailSent(true);
      Alert.alert(
        'Reset Email Sent',
        'Check your email for instructions to reset your password.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      // Error is handled by the useAuth hook
    }
  };

  const handleBack = () => {
    clearError();
    router.back();
  };

  const handleBackToLogin = () => {
    clearError();
    router.replace('/login');
  };

  if (isEmailSent) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <Ionicons name="mail-outline" size={64} color="#4CAF50" style={styles.icon} />
          <ThemedText type="title">Check Your Email</ThemedText>
          <ThemedText style={styles.subtitle}>
            We've sent a password reset link to {email}
          </ThemedText>
        </View>

        <View style={styles.form}>
          <ThemedText style={styles.instructions}>
            Click the link in your email to reset your password. If you don't see the email, check your spam folder.
          </ThemedText>

          <AuthButton
            title="Resend Email"
            onPress={handleResetPassword}
            loading={loading}
            disabled={loading}
            variant="secondary"
          />
        </View>

        <View style={styles.footer}>
          <AuthButton
            title="Back to Login"
            onPress={handleBackToLogin}
            variant="primary"
          />
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="lock-closed-outline" size={64} color="#FF9800" style={styles.icon} />
        <ThemedText type="title">Reset Password</ThemedText>
        <ThemedText style={styles.subtitle}>
          Enter your email address and we'll send you a link to reset your password
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

        <AuthButton
          title="Send Reset Email"
          onPress={handleResetPassword}
          loading={loading}
          disabled={loading}
        />
      </View>

      <View style={styles.footer}>
        <ThemedText style={styles.footerText}>
          Remember your password?{' '}
          <ThemedText style={styles.link} onPress={() => router.push('/login')}>
            Sign In
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
  icon: {
    marginBottom: 16,
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
  instructions: {
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.8,
    lineHeight: 20,
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