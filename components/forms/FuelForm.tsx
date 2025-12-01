/**
 * FuelForm component for adding fuel entries
 * Supports both gas (gallons) and electric (kWh) vehicles with MPG calculation
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
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { FuelEntry, FuelFormData, Vehicle, VehicleType } from '@/types/data';
import { VehicleService } from '@/services/DataService';

interface FuelFormProps {
  fuelEntry?: FuelEntry | null;
  vehicleId?: string;
  onSubmit: (data: FuelFormData) => Promise<void>;
  onCancel: () => void;
  submitButtonText?: string;
}

export function FuelForm({
  fuelEntry,
  vehicleId: propVehicleId,
  onSubmit,
  onCancel,
  submitButtonText = 'Add Fuel Entry',
}: FuelFormProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [formData, setFormData] = useState<FuelFormData>({
    vehicleId: fuelEntry?.vehicleId || propVehicleId || '',
    date: fuelEntry?.date || new Date().toISOString().split('T')[0],
    amount: fuelEntry?.amount?.toString() || '',
    quantity: fuelEntry?.quantity?.toString() || '',
    pricePerUnit: fuelEntry?.pricePerUnit?.toString() || '',
    mileage: fuelEntry?.mileage?.toString() || '',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<FuelFormData>>({});

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
    const newErrors: Partial<FuelFormData> = {};

    if (!formData.vehicleId) {
      newErrors.vehicleId = 'Please select a vehicle';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    if (!formData.amount.trim()) {
      newErrors.amount = 'Total amount is required';
    } else if (isNaN(parseFloat(formData.amount)) || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (!formData.quantity.trim()) {
      newErrors.quantity = 'Quantity is required';
    } else if (isNaN(parseFloat(formData.quantity)) || parseFloat(formData.quantity) <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0';
    }

    if (!formData.pricePerUnit.trim()) {
      newErrors.pricePerUnit = 'Price per unit is required';
    } else if (isNaN(parseFloat(formData.pricePerUnit)) || parseFloat(formData.pricePerUnit) <= 0) {
      newErrors.pricePerUnit = 'Price per unit must be greater than 0';
    }

    if (!formData.mileage.trim()) {
      newErrors.mileage = 'Mileage is required';
    } else if (isNaN(parseInt(formData.mileage)) || parseInt(formData.mileage) < 0) {
      newErrors.mileage = 'Mileage must be 0 or greater';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateTotalAmount = () => {
    const quantity = parseFloat(formData.quantity) || 0;
    const pricePerUnit = parseFloat(formData.pricePerUnit) || 0;
    return (quantity * pricePerUnit).toFixed(2);
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Update amount with calculated total if it differs
      const calculatedAmount = calculateTotalAmount();
      const submissionData = {
        ...formData,
        amount: parseFloat(calculatedAmount).toString(),
      };

      await onSubmit(submissionData);
    } catch (error) {
      Alert.alert('Error', 'Failed to save fuel entry. Please try again.');
      console.error('Fuel form submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: keyof FuelFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const getQuantityLabel = () => {
    if (!selectedVehicle) return 'Quantity';
    switch (selectedVehicle.type) {
      case 'electric':
        return 'Quantity (kWh)';
      case 'gas':
      case 'hybrid':
      default:
        return 'Quantity (gallons)';
    }
  };

  const getPriceLabel = () => {
    if (!selectedVehicle) return 'Price per Unit';
    switch (selectedVehicle.type) {
      case 'electric':
        return 'Price per kWh ($)';
      case 'gas':
      case 'hybrid':
      default:
        return 'Price per gallon ($)';
    }
  };

  const getQuantityPlaceholder = () => {
    if (!selectedVehicle) return 'e.g., 10';
    switch (selectedVehicle.type) {
      case 'electric':
        return 'e.g., 50';
      case 'gas':
      case 'hybrid':
      default:
        return 'e.g., 12.5';
    }
  };

  const getPricePlaceholder = () => {
    if (!selectedVehicle) return 'e.g., 3.50';
    switch (selectedVehicle.type) {
      case 'electric':
        return 'e.g., 0.15';
      case 'gas':
      case 'hybrid':
      default:
        return 'e.g., 3.45';
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ThemedView style={styles.content}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <ThemedText style={styles.title}>
            {fuelEntry ? 'Edit Fuel Entry' : 'Add Fuel Entry'}
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
                      name={
                        vehicle.type === 'electric'
                          ? 'bolt.fill'
                          : vehicle.type === 'hybrid'
                          ? 'leaf.fill'
                          : 'fuelpump.fill'
                      }
                      size={20}
                      color={formData.vehicleId === vehicle.id ? '#fff' : '#007AFF'}
                    />
                    <ThemedText
                      style={[
                        styles.vehicleLabel,
                        formData.vehicleId === vehicle.id && styles.vehicleLabelSelected,
                      ]}
                    >
                      {vehicle.name}
                    </ThemedText>
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
            <ThemedText style={styles.label}>Date</ThemedText>
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
            <ThemedText style={styles.label}>Odometer Reading</ThemedText>
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

          {/* Quantity */}
          <View style={styles.fieldGroup}>
            <ThemedText style={styles.label}>{getQuantityLabel()}</ThemedText>
            <TextInput
              style={[styles.input, errors.quantity && styles.inputError]}
              placeholder={getQuantityPlaceholder()}
              value={formData.quantity}
              onChangeText={(value) => updateFormData('quantity', value)}
              keyboardType="decimal-pad"
              editable={!loading}
            />
            {errors.quantity && (
              <ThemedText style={styles.errorText}>{errors.quantity}</ThemedText>
            )}
          </View>

          {/* Price per Unit */}
          <View style={styles.fieldGroup}>
            <ThemedText style={styles.label}>{getPriceLabel()}</ThemedText>
            <TextInput
              style={[styles.input, errors.pricePerUnit && styles.inputError]}
              placeholder={getPricePlaceholder()}
              value={formData.pricePerUnit}
              onChangeText={(value) => updateFormData('pricePerUnit', value)}
              keyboardType="decimal-pad"
              editable={!loading}
            />
            {errors.pricePerUnit && (
              <ThemedText style={styles.errorText}>{errors.pricePerUnit}</ThemedText>
            )}
          </View>

          {/* Total Amount (Calculated) */}
          <View style={styles.fieldGroup}>
            <ThemedText style={styles.label}>Total Amount ($)</ThemedText>
            <View style={styles.calculatedAmountContainer}>
              <TextInput
                style={[styles.input, styles.calculatedInput]}
                placeholder="0.00"
                value={calculateTotalAmount()}
                onChangeText={(value) => updateFormData('amount', value)}
                keyboardType="decimal-pad"
                editable={!loading}
              />
              <TouchableOpacity
                style={styles.calculateButton}
                onPress={() => updateFormData('amount', calculateTotalAmount())}
                disabled={loading}
              >
                <IconSymbol name="arrow.clockwise" size={16} color="#007AFF" />
              </TouchableOpacity>
            </View>
            {selectedVehicle && (
              <ThemedText style={styles.helperText}>
                {selectedVehicle.type === 'electric'
                  ? `Calculated: ${formData.quantity || 0} kWh × $${formData.pricePerUnit || '0'}`
                  : `Calculated: ${formData.quantity || 0} gallons × $${formData.pricePerUnit || '0'}`
                }
              </ThemedText>
            )}
          </View>

          {/* MPG Display for Gas Vehicles */}
          {selectedVehicle && (selectedVehicle.type === 'gas' || selectedVehicle.type === 'hybrid') && (
            <View style={styles.fieldGroup}>
              <ThemedText style={styles.label}>
                {selectedVehicle.type === 'hybrid' ? 'MPG (Gas Engine)' : 'MPG'}
              </ThemedText>
              <ThemedText style={styles.mpgText}>
                Will be calculated automatically based on previous entries
              </ThemedText>
            </View>
          )}

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
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    marginTop: 4,
  },
  helperText: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 4,
    opacity: 0.7,
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
  vehicleLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  vehicleLabelSelected: {
    color: '#fff',
  },
  calculatedAmountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  calculatedInput: {
    flex: 1,
  },
  calculateButton: {
    padding: 12,
    backgroundColor: '#f2f2f7',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  mpgText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#666',
    padding: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#ddd',
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