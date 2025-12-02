/**
 * Vehicle Form Screen for adding and editing vehicles
 * A dedicated screen that replaces the modal approach
 */

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { VehicleForm } from '@/components/forms/VehicleForm';
import { Vehicle, VehicleService } from '@/services/index';

export default function VehicleFormScreen() {
  const router = useRouter();
  const { vehicleId } = useLocalSearchParams();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (vehicleId) {
      loadVehicle(vehicleId as string);
    }
  }, [vehicleId]);

  const loadVehicle = async (id: string) => {
    try {
      setLoading(true);
      const vehicleData = await VehicleService.getById(id);
      setVehicle(vehicleData);
    } catch (error) {
      console.error('Error loading vehicle:', error);
      Alert.alert('Error', 'Failed to load vehicle');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData: any) => {
    try {
      if (vehicle) {
        await VehicleService.update(vehicle.id, formData);
        Alert.alert('Success', 'Vehicle updated successfully');
      } else {
        await VehicleService.create(formData);
        Alert.alert('Success', 'Vehicle added successfully');
      }
      router.back();
    } catch (error) {
      console.error('Error saving vehicle:', error);
      Alert.alert('Error', 'Failed to save vehicle. Please try again.');
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const isEditing = !!vehicleId && !!vehicle;

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <ThemedText style={styles.title}>
          {isEditing ? 'Edit Vehicle' : 'Add New Vehicle'}
        </ThemedText>

        {loading ? (
          <ThemedText style={styles.loadingText}>Loading...</ThemedText>
        ) : (
          <VehicleForm
            vehicle={vehicle}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            submitButtonText={isEditing ? 'Update Vehicle' : 'Add Vehicle'}
          />
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 50,
  },
});