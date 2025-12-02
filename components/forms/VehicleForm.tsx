/**
 * Simple VehicleForm component using basic React Native components
 */

import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Text,
  ScrollView,
} from 'react-native';
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

  const vehicleTypes: { value: VehicleType; label: string }[] = [
    { value: 'gas', label: 'Gasoline' },
    { value: 'electric', label: 'Electric' },
    { value: 'hybrid', label: 'Hybrid' },
  ];

  const handleSubmit = async () => {
    // Basic validation
    if (!formData.name.trim() || !formData.year.trim() || !formData.make.trim() || !formData.model.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
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
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>

      {/* Vehicle Name */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Vehicle Name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., My Car, Family SUV"
          value={formData.name}
          onChangeText={(value) => updateFormData('name', value)}
        />
      </View>

      {/* Year */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Year</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., 2024"
          value={formData.year}
          onChangeText={(value) => updateFormData('year', value)}
          keyboardType="numeric"
          maxLength={4}
        />
      </View>

      {/* Make */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Make</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Toyota, Honda, Tesla"
          value={formData.make}
          onChangeText={(value) => updateFormData('make', value)}
          autoCapitalize="words"
        />
      </View>

      {/* Model */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Model</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Camry, Model 3, Civic"
          value={formData.model}
          onChangeText={(value) => updateFormData('model', value)}
          autoCapitalize="words"
        />
      </View>

      {/* Vehicle Type */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Vehicle Type</Text>
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
              <Text
                style={[
                  styles.typeLabel,
                  formData.type === type.value && styles.typeLabelSelected,
                ]}
              >
                {type.label}
              </Text>
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
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.submitButton]}
          onPress={handleSubmit}
        >
          <Text style={styles.submitButtonText}>{submitButtonText}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  fieldGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#000',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#000',
    placeholderTextColor: '#666',
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  typeOption: {
    flex: 1,
    padding: 16,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  typeOptionSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
    shadowColor: '#007AFF',
    shadowOpacity: 0.3,
  },
  typeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  typeLabelSelected: {
    color: '#fff',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 40,
    marginBottom: 40,
  },
  button: {
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    minHeight: 56,
  },
  cancelButton: {
    backgroundColor: '#f2f2f7',
    borderWidth: 2,
    borderColor: '#ddd',
  },
  submitButton: {
    backgroundColor: '#007AFF',
  },
  cancelButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
});