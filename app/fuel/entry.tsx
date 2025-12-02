/**
 * FuelEntryScreen - Dedicated screen for creating and editing fuel entries
 * Integrates enhanced FuelForm component with navigation handling and form submission
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
import { FuelForm } from '@/components/forms/FuelForm';
import type { FuelEntry, FuelFormData } from '@/types/data';
import { FuelService, VehicleService } from '@/services/index';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export default function FuelEntryScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];

  const { entryId } = useLocalSearchParams<{ entryId?: string }>();
  const isEditing = Boolean(entryId);

  const [fuelEntry, setFuelEntry] = useState<FuelEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadFuelEntry();
  }, [entryId]);

  const loadFuelEntry = async () => {
    if (!isEditing) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const entry = await FuelService.getById(entryId!);
      setFuelEntry(entry);
    } catch (error) {
      console.error('Error loading fuel entry:', error);
      Alert.alert(
        'Error',
        'Failed to load fuel entry. It may have been deleted.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData: FuelFormData) => {
    setSubmitting(true);
    try {
      if (isEditing && fuelEntry) {
        // Update existing entry
        await FuelService.update(fuelEntry.id, formData);
        Alert.alert('Success', 'Fuel entry updated successfully!');
      } else {
        // Create new entry
        const result = await FuelService.create(formData);
        Alert.alert('Success', 'Fuel entry added successfully!');
      }

      // Navigate back after successful submission
      router.back();
    } catch (error) {
      console.error('Error saving fuel entry:', error);
      Alert.alert(
        'Error',
        `Failed to save fuel entry: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
            {isEditing ? 'Loading fuel entry...' : 'Loading...'}
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: isEditing ? 'Edit Fuel Entry' : 'Add Fuel Entry',
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
        <FuelForm
          fuelEntry={fuelEntry}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitButtonText={submitting ? 'Saving...' : (isEditing ? 'Update Entry' : 'Add Entry')}
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