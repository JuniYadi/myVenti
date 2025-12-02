/**
 * ServiceEntryScreen - Dedicated screen for creating and editing service records
 * Integrates ServiceForm component with navigation handling and form submission
 * Matches the fuel entry screen pattern for consistency
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ServiceForm } from '@/components/forms/ServiceForm';
import type { ServiceRecord, ServiceFormData } from '@/types/data';
import { ServiceService, VehicleService } from '@/services/index';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export default function ServiceEntryScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];

  const { recordId } = useLocalSearchParams<{ recordId?: string }>();
  const isEditing = Boolean(recordId);

  const [serviceRecord, setServiceRecord] = useState<ServiceRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadServiceRecord();
  }, [recordId]);

  const loadServiceRecord = async () => {
    if (!isEditing) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const record = await ServiceService.getById(recordId!);
      setServiceRecord(record);
    } catch (error) {
      console.error('Error loading service record:', error);
      Alert.alert(
        'Error',
        'Failed to load service record. It may have been deleted.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData: ServiceFormData) => {
    setSubmitting(true);
    try {
      if (isEditing && serviceRecord) {
        // Update existing record
        await ServiceService.update(serviceRecord.id, formData);
        Alert.alert('Success', 'Service record updated successfully!');
      } else {
        // Create new record
        const result = await ServiceService.create(formData);
        Alert.alert('Success', 'Service record added successfully!');
      }

      // Navigate back after successful submission
      router.back();
    } catch (error) {
      console.error('Error saving service record:', error);
      Alert.alert(
        'Error',
        `Failed to save service record: ${error instanceof Error ? error.message : 'Unknown error'}`,
        [{ text: 'OK' }]
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    // Ask for confirmation if there are unsaved changes
    if (submitting) {
      return; // Don't allow cancellation during submission
    }

    router.back();
  };

  if (loading) {
    return (
      <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <ThemedText style={[styles.loadingText, { color: colors.text }]}>
            {isEditing ? 'Loading service record...' : 'Loading...'}
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: isEditing ? 'Edit Service Record' : 'Add Service Record',
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
          headerTitleStyle: {
            fontWeight: '600',
          },
          presentation: 'modal',
        }}
      />

      <View style={styles.content}>
        <ServiceForm
          serviceRecord={serviceRecord}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitButtonText={submitting ? 'Saving...' : (isEditing ? 'Update Record' : 'Add Record')}
          showCancelButton={true}
        />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
});