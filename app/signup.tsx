import { router } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { AuthButton } from '@/components/auth/auth-button';
import { AuthInput } from '@/components/auth/auth-input';
import { ErrorMessage } from '@/components/auth/error-message';
import { useAuth } from '@/hooks/use-auth';

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const { signUp, loading, error, signInWithGoogle, clearError } = useAuth();

  const validateForm = () => {
    const newErrors: {
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    try {
      await signUp(email, password);
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

  const getPasswordStrength = (password: string) => {
    if (password.length < 6) return 'weak';
    if (password.length < 8 || !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) return 'medium';
    return 'strong';
  };

  const passwordStrength = getPasswordStrength(password);

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title">Create Account</ThemedText>
        <ThemedText style={styles.subtitle}>
          Sign up to start tracking your fuel expenses
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
          placeholder="Create a password"
          secureTextEntry
          error={errors.password}
        />

        {password.length > 0 && (
          <View style={styles.passwordStrengthContainer}>
            <ThemedText style={styles.passwordStrengthLabel}>
              Password strength:
            </ThemedText>
            <ThemedText
              style={[
                styles.passwordStrength,
                passwordStrength === 'weak' && styles.weak,
                passwordStrength === 'medium' && styles.medium,
                passwordStrength === 'strong' && styles.strong,
              ]}
            >
              {passwordStrength.toUpperCase()}
            </ThemedText>
          </View>
        )}

        <AuthInput
          label="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Confirm your password"
          secureTextEntry
          error={errors.confirmPassword}
        />

        <AuthButton
          title="Create Account"
          onPress={handleSignUp}
          loading={loading}
          disabled={loading}
        />

        <AuthButton
          title="Sign up with Google"
          onPress={handleGoogleSignIn}
          variant="google"
          disabled={loading}
          icon={<Ionicons name="logo-google" size={20} color="#4285F4" />}
        />
      </View>

      <View style={styles.footer}>
        <ThemedText style={styles.footerText}>
          Already have an account?{' '}
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
    marginBottom: 30,
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
  passwordStrengthContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  passwordStrengthLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  passwordStrength: {
    fontSize: 14,
    fontWeight: '600',
  },
  weak: {
    color: '#ef4444',
  },
  medium: {
    color: '#f59e0b',
  },
  strong: {
    color: '#10b981',
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