/**
 * VehicleForm component for adding and editing vehicles
 * Provides form fields for vehicle information with validation
 */

import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Vehicle, VehicleFormData, VehicleType } from '@/types/data';

interface VehicleFormProps {
  vehicle?: Vehicle | null;
  onSubmit: (data: VehicleFormData) => Promise<void>;
  onCancel: () => void;
  submitButtonText?: string;
}

export function VehicleForm({
  vehicle,
  onSubmit,
  onCancel,
  submitButtonText = 'Add Vehicle',
}: VehicleFormProps) {
  const [formData, setFormData] = useState<VehicleFormData>({
    name: vehicle?.name || '',
    year: vehicle?.year?.toString() || '',
    make: vehicle?.make || '',
    model: vehicle?.model || '',
    type: vehicle?.type || 'gas',
  });

  const [errors, setErrors] = useState<Partial<VehicleFormData>>({});

  const vehicleTypes: { value: VehicleType; label: string; icon: string }[] = [
    { value: 'gas', label: 'Gasoline', icon: 'fuelpump.fill' },
    { value: 'electric', label: 'Electric', icon: 'bolt.fill' },
    { value: 'hybrid', label: 'Hybrid', icon: 'leaf.fill' },
  ];

  const validateForm = (): boolean => {
    const newErrors: Partial<VehicleFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Vehicle name is required';
    }

    if (!formData.year.trim()) {
      newErrors.year = 'Year is required';
    } else if (isNaN(parseInt(formData.year))) {
      newErrors.year = 'Year must be a valid number';
    } else if (parseInt(formData.year) < 1900 || parseInt(formData.year) > new Date().getFullYear() + 1) {
      newErrors.year = `Year must be between 1900 and ${new Date().getFullYear() + 1}`;
    }

    if (!formData.make.trim()) {
      newErrors.make = 'Make is required';
    }

    if (!formData.model.trim()) {
      newErrors.model = 'Model is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      Alert.alert('Error', 'Failed to save vehicle. Please try again.');
      console.error('Vehicle form submission error:', error);
    }
  };

  const updateFormData = (field: keyof VehicleFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          style={styles.scrollView}
        >
          <ThemedText style={styles.title}>
            {vehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
          </ThemedText>

          {/* Vehicle Name */}
          <View style={styles.fieldGroup}>
            <ThemedText style={styles.label}>Vehicle Name</ThemedText>
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              placeholder="e.g., My Car, Family SUV"
              value={formData.name}
              onChangeText={(value) => updateFormData('name', value)}
                          />
            {errors.name && (
              <ThemedText style={styles.errorText}>{errors.name}</ThemedText>
            )}
          </View>

          {/* Year */}
          <View style={styles.fieldGroup}>
            <ThemedText style={styles.label}>Year</ThemedText>
            <TextInput
              style={[styles.input, errors.year && styles.inputError]}
              placeholder="e.g., 2024"
              value={formData.year}
              onChangeText={(value) => updateFormData('year', value)}
              keyboardType="numeric"
              maxLength={4}
                          />
            {errors.year && (
              <ThemedText style={styles.errorText}>{errors.year}</ThemedText>
            )}
          </View>

          {/* Make */}
          <View style={styles.fieldGroup}>
            <ThemedText style={styles.label}>Make</ThemedText>
            <TextInput
              style={[styles.input, errors.make && styles.inputError]}
              placeholder="e.g., Toyota, Honda, Tesla"
              value={formData.make}
              onChangeText={(value) => updateFormData('make', value)}
              autoCapitalize="words"
                          />
            {errors.make && (
              <ThemedText style={styles.errorText}>{errors.make}</ThemedText>
            )}
          </View>

          {/* Model */}
          <View style={styles.fieldGroup}>
            <ThemedText style={styles.label}>Model</ThemedText>
            <TextInput
              style={[styles.input, errors.model && styles.inputError]}
              placeholder="e.g., Camry, Model 3, Civic"
              value={formData.model}
              onChangeText={(value) => updateFormData('model', value)}
              autoCapitalize="words"
                          />
            {errors.model && (
              <ThemedText style={styles.errorText}>{errors.model}</ThemedText>
            )}
          </View>

          {/* Vehicle Type */}
          <View style={styles.fieldGroup}>
            <ThemedText style={styles.label}>Vehicle Type</ThemedText>
            <View style={styles.typeContainer}>
              {vehicleTypes.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.typeOption,
                    formData.type === type.value && styles.typeOptionSelected,
                  ]}
                  onPress={() => updateFormData('type', type.value)}
                                  >
                  <IconSymbol
                    name={type.icon}
                    size={20}
                    color={formData.type === type.value ? '#fff' : '#007AFF'}
                  />
                  <ThemedText
                    style={[
                      styles.typeLabel,
                      formData.type === type.value && styles.typeLabelSelected,
                    ]}
                  >
                    {type.label}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
                          >
              <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.submitButton]}
              onPress={handleSubmit}
            >
              <ThemedText style={styles.submitButtonText}>
                {submitButtonText}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  scrollView: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  fieldGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    marginTop: 4,
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  typeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    gap: 8,
  },
  typeOptionSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  typeLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  typeLabelSelected: {
    color: '#fff',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 32,
    marginBottom: 20,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f2f2f7',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  submitButton: {
    backgroundColor: '#007AFF',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});