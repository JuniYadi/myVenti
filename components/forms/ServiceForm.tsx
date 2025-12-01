/**
 * ServiceForm component for adding service records
 * Provides form fields for service information with suggestions and validation
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Text,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ServiceRecord, ServiceFormData, Vehicle } from '@/types/data';
import { VehicleService } from '@/services/index';

interface ServiceFormProps {
  serviceRecord?: ServiceRecord | null;
  vehicleId?: string;
  onSubmit: (data: ServiceFormData) => Promise<void>;
  onCancel: () => void;
  submitButtonText?: string;
}

// Common service types with suggestions
const SERVICE_SUGGESTIONS = [
  'Oil Change',
  'Tire Rotation',
  'Brake Inspection',
  'Battery Check',
  'Air Filter Replacement',
  'Transmission Service',
  'Coolant Flush',
  'Wheel Alignment',
  'Spark Plugs',
  'Inspection',
  'Windshield Wipers',
  'Cabin Air Filter',
  'Brake Pads',
  'Rotors',
  'Shocks/Struts',
  'Timing Belt',
  'Serpentine Belt',
  'Coolant Hose',
  'Thermostat',
  'Fuel Filter',
  'Other',
];

export function ServiceForm({
  serviceRecord,
  vehicleId: propVehicleId,
  onSubmit,
  onCancel,
  submitButtonText = 'Add Service Record',
}: ServiceFormProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [showServiceSuggestions, setShowServiceSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [formData, setFormData] = useState<ServiceFormData>({
    vehicleId: serviceRecord?.vehicleId || propVehicleId || '',
    date: serviceRecord?.date || new Date().toISOString().split('T')[0],
    type: serviceRecord?.type || '',
    description: serviceRecord?.description || '',
    cost: serviceRecord?.cost?.toString() || '',
    mileage: serviceRecord?.mileage?.toString() || '',
    notes: serviceRecord?.notes || '',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<ServiceFormData>>({});

  useEffect(() => {
    loadVehicles();
  }, []);

  useEffect(() => {
    if (formData.vehicleId) {
      const vehicle = vehicles.find(v => v.id === formData.vehicleId);
      setSelectedVehicle(vehicle || null);
    }
  }, [formData.vehicleId, vehicles]);

  const loadVehicles = async () => {
    try {
      const vehicleList = await VehicleService.getAll();
      setVehicles(vehicleList.filter(v => v.status === 'active'));

      // If only one vehicle and no vehicle selected, auto-select it
      if (vehicleList.length === 1 && !formData.vehicleId) {
        setFormData(prev => ({ ...prev, vehicleId: vehicleList[0].id }));
      }
    } catch (error) {
      console.error('Error loading vehicles:', error);
      Alert.alert('Error', 'Failed to load vehicles');
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<ServiceFormData> = {};

    if (!formData.vehicleId) {
      newErrors.vehicleId = 'Please select a vehicle';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    if (!formData.type.trim()) {
      newErrors.type = 'Service type is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.cost.trim()) {
      newErrors.cost = 'Cost is required';
    } else if (isNaN(parseFloat(formData.cost)) || parseFloat(formData.cost) < 0) {
      newErrors.cost = 'Cost must be 0 or greater';
    }

    if (!formData.mileage.trim()) {
      newErrors.mileage = 'Mileage is required';
    } else if (isNaN(parseInt(formData.mileage)) || parseInt(formData.mileage) < 0) {
      newErrors.mileage = 'Mileage must be 0 or greater';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      Alert.alert('Error', 'Failed to save service record. Please try again.');
      console.error('Service form submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: keyof ServiceFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }

    // Update service type suggestions when typing in type field
    if (field === 'type') {
      const filtered = SERVICE_SUGGESTIONS.filter(suggestion =>
        suggestion.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      setShowServiceSuggestions(value.length > 0 && filtered.length > 0);
    }
  };

  const selectServiceType = (type: string) => {
    setFormData(prev => ({ ...prev, type }));
    setShowServiceSuggestions(false);
    setErrors(prev => ({ ...prev, type: undefined }));
  };

  const getVehicleDisplayName = (vehicle: Vehicle) => {
    return `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ThemedView style={styles.content}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <ThemedText style={styles.title}>
            {serviceRecord ? 'Edit Service Record' : 'Add Service Record'}
          </ThemedText>

          {/* Vehicle Selection */}
          {vehicles.length > 1 && (
            <View style={styles.fieldGroup}>
              <ThemedText style={styles.label}>Vehicle</ThemedText>
              <View style={styles.vehicleContainer}>
                {vehicles.map((vehicle) => (
                  <TouchableOpacity
                    key={vehicle.id}
                    style={[
                      styles.vehicleOption,
                      formData.vehicleId === vehicle.id && styles.vehicleOptionSelected,
                    ]}
                    onPress={() => updateFormData('vehicleId', vehicle.id)}
                    disabled={loading}
                  >
                    <IconSymbol
                      name="wrench.fill"
                      size={20}
                      color={formData.vehicleId === vehicle.id ? '#fff' : '#007AFF'}
                    />
                    <View style={styles.vehicleInfo}>
                      <ThemedText
                        style={[
                          styles.vehicleLabel,
                          formData.vehicleId === vehicle.id && styles.vehicleLabelSelected,
                        ]}
                      >
                        {vehicle.name}
                      </ThemedText>
                      <ThemedText
                        style={[
                          styles.vehicleSublabel,
                          formData.vehicleId === vehicle.id && styles.vehicleLabelSelected,
                        ]}
                      >
                        {getVehicleDisplayName(vehicle)}
                      </ThemedText>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.vehicleId && (
                <ThemedText style={styles.errorText}>{errors.vehicleId}</ThemedText>
              )}
            </View>
          )}

          {/* Date */}
          <View style={styles.fieldGroup}>
            <ThemedText style={styles.label}>Service Date</ThemedText>
            <TextInput
              style={[styles.input, errors.date && styles.inputError]}
              placeholder="YYYY-MM-DD"
              value={formData.date}
              onChangeText={(value) => updateFormData('date', value)}
              editable={!loading}
            />
            {errors.date && (
              <ThemedText style={styles.errorText}>{errors.date}</ThemedText>
            )}
          </View>

          {/* Mileage */}
          <View style={styles.fieldGroup}>
            <ThemedText style={styles.label}>Mileage</ThemedText>
            <TextInput
              style={[styles.input, errors.mileage && styles.inputError]}
              placeholder="e.g., 45230"
              value={formData.mileage}
              onChangeText={(value) => updateFormData('mileage', value)}
              keyboardType="numeric"
              editable={!loading}
            />
            {errors.mileage && (
              <ThemedText style={styles.errorText}>{errors.mileage}</ThemedText>
            )}
          </View>

          {/* Service Type with Suggestions */}
          <View style={styles.fieldGroup}>
            <ThemedText style={styles.label}>Service Type</ThemedText>
            <View style={styles.suggestionContainer}>
              <TextInput
                style={[styles.input, errors.type && styles.inputError]}
                placeholder="e.g., Oil Change, Brake Inspection"
                value={formData.type}
                onChangeText={(value) => updateFormData('type', value)}
                onFocus={() => setShowServiceSuggestions(formData.type.length > 0)}
                editable={!loading}
              />
              {showServiceSuggestions && (
                <View style={styles.suggestionsList}>
                  {filteredSuggestions.map((suggestion) => (
                    <TouchableOpacity
                      key={suggestion}
                      style={styles.suggestionItem}
                      onPress={() => selectServiceType(suggestion)}
                    >
                      <ThemedText style={styles.suggestionText}>{suggestion}</ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
            {errors.type && (
              <ThemedText style={styles.errorText}>{errors.type}</ThemedText>
            )}
          </View>

          {/* Description */}
          <View style={styles.fieldGroup}>
            <ThemedText style={styles.label}>Description</ThemedText>
            <TextInput
              style={[styles.input, styles.textArea, errors.description && styles.inputError]}
              placeholder="Describe what was done..."
              value={formData.description}
              onChangeText={(value) => updateFormData('description', value)}
              multiline
              numberOfLines={3}
              editable={!loading}
            />
            {errors.description && (
              <ThemedText style={styles.errorText}>{errors.description}</ThemedText>
            )}
          </View>

          {/* Cost */}
          <View style={styles.fieldGroup}>
            <ThemedText style={styles.label}>Cost ($)</ThemedText>
            <TextInput
              style={[styles.input, errors.cost && styles.inputError]}
              placeholder="e.g., 45.99"
              value={formData.cost}
              onChangeText={(value) => updateFormData('cost', value)}
              keyboardType="decimal-pad"
              editable={!loading}
            />
            {errors.cost && (
              <ThemedText style={styles.errorText}>{errors.cost}</ThemedText>
            )}
          </View>

          {/* Notes */}
          <View style={styles.fieldGroup}>
            <ThemedText style={styles.label}>Notes (Optional)</ThemedText>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Additional notes, parts used, etc..."
              value={formData.notes}
              onChangeText={(value) => updateFormData('notes', value)}
              multiline
              numberOfLines={3}
              editable={!loading}
            />
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
              disabled={loading}
            >
              <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.submitButton, loading && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <ThemedText style={styles.submitButtonText}>
                {loading ? 'Saving...' : submitButtonText}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ThemedView>
    </KeyboardAvoidingView>
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
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    marginTop: 4,
  },
  vehicleContainer: {
    gap: 8,
  },
  vehicleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    gap: 12,
  },
  vehicleOptionSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  vehicleSublabel: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 2,
  },
  vehicleLabelSelected: {
    color: '#fff',
  },
  suggestionContainer: {
    position: 'relative',
  },
  suggestionsList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderTopWidth: 0,
    borderRadius: 8,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    zIndex: 1000,
    maxHeight: 200,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  suggestionText: {
    fontSize: 16,
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
  buttonDisabled: {
    opacity: 0.6,
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