/**
 * FuelForm component for adding fuel entries
 * Supports both gas (gallons) and electric (kWh) vehicles with MPG calculation
 */

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { convertVolume, formatCurrency, useRegion } from '@/hooks/use-region';
import { VehicleService } from '@/services/index';
import { FuelEntry, FuelFormData, Vehicle } from '@/types/data';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

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
  const { regionConfig, isLoading: regionLoading } = useRegion();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  // Helper to convert stored gallons to display liters (for editing)
  const getDisplayQuantity = () => {
    if (!fuelEntry?.quantity) return '';
    // Data is stored in gallons, convert to user's unit for display
    if (regionConfig.volume.unit === 'liters') {
      return convertVolume(fuelEntry.quantity, 'gallons', 'liters').toFixed(2);
    }
    return fuelEntry.quantity.toString();
  };

  // Helper to convert stored price per gallon to price per liter (for editing)
  const getDisplayPricePerUnit = () => {
    if (!fuelEntry?.pricePerUnit) return '';
    // Price is stored per gallon, convert to per liter for display
    if (regionConfig.volume.unit === 'liters') {
      // Convert price per gallon to price per liter for display
      const pricePerLiter = fuelEntry.pricePerUnit / 3.78541;
      return pricePerLiter.toFixed(2);
    }
    return fuelEntry.pricePerUnit.toString();
  };

  const [formData, setFormData] = useState<FuelFormData>({
    vehicleId: fuelEntry?.vehicleId || propVehicleId || '',
    date: fuelEntry?.date || new Date().toISOString().split('T')[0],
    amount: fuelEntry?.amount?.toString() || '',
    quantity: getDisplayQuantity(),
    pricePerUnit: fuelEntry?.pricePerUnit?.toString() || '',
    mileage: fuelEntry?.mileage?.toString() || '',
    fuelStation: fuelEntry?.fuelStation || '',
    notes: fuelEntry?.notes || '',
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
    } else {
      // Validate date is not in the future
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(23, 59, 59, 999); // End of today
      if (selectedDate > today) {
        newErrors.date = 'Date cannot be in the future';
      }
    }

    // Auto-calculate amount from quantity × price per unit
    const calculatedAmount = calculateTotalAmount();
    const amountValue = parseFloat(calculatedAmount);

    if (amountValue <= 0) {
      newErrors.quantity = 'Enter valid quantity and price to calculate total amount';
      newErrors.pricePerUnit = 'Enter valid price and quantity to calculate total amount';
    } else if (amountValue > (regionConfig.currency.code === 'IDR' ? 1000000 : 10000)) {
      newErrors.amount = `Calculated total amount seems unusually high (max ${formatCurrency(regionConfig.currency.code === 'IDR' ? 1000000 : 10000, regionConfig)})`;
    }

    if (!formData.quantity.trim()) {
      newErrors.quantity = 'Quantity is required';
    } else if (isNaN(parseFloat(formData.quantity)) || parseFloat(formData.quantity) <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0';
    } else {
      const quantity = parseFloat(formData.quantity);
      const vehicleType = selectedVehicle?.type;
      if (vehicleType === 'electric' && quantity > 500) {
        newErrors.quantity = 'kWh amount seems unusually high (max 500)';
      } else if ((vehicleType === 'gas' || vehicleType === 'hybrid')) {
        const maxQuantity = regionConfig.volume.unit === 'liters' ? 150 : 50;
        if (quantity > maxQuantity) {
          newErrors.quantity = `${regionConfig.volume.label} amount seems unusually high (max ${maxQuantity} ${regionConfig.volume.abbreviation})`;
        }
      }
    }

    if (!formData.pricePerUnit.trim()) {
      newErrors.pricePerUnit = 'Price per unit is required';
    } else if (isNaN(parseFloat(formData.pricePerUnit)) || parseFloat(formData.pricePerUnit) <= 0) {
      newErrors.pricePerUnit = 'Price per unit must be greater than 0';
    } else {
      const price = parseFloat(formData.pricePerUnit);
      const vehicleType = selectedVehicle?.type;
      if (vehicleType === 'electric') {
        const maxPrice = regionConfig.currency.code === 'IDR' ? 5000 : 2;
        if (price > maxPrice) {
          newErrors.pricePerUnit = `kWh price seems unusually high (max ${formatCurrency(maxPrice, regionConfig)})`;
        }
      } else if ((vehicleType === 'gas' || vehicleType === 'hybrid')) {
        const maxPrice = regionConfig.currency.code === 'IDR' ? 25000 : 10;
        if (price > maxPrice) {
          newErrors.pricePerUnit = `${regionConfig.volume.label} price seems unusually high (max ${formatCurrency(maxPrice, regionConfig)})`;
        }
      }
    }

    if (!formData.mileage.trim()) {
      newErrors.mileage = 'Odometer reading is required';
    } else if (isNaN(parseInt(formData.mileage)) || parseInt(formData.mileage) < 0) {
      newErrors.mileage = 'Odometer reading must be 0 or greater';
    } else if (parseInt(formData.mileage) > (regionConfig.distance.unit === 'kilometers' ? 1600000 : 1000000)) {
      newErrors.mileage = 'Odometer reading seems unusually high';
    }

    if (formData.fuelStation && formData.fuelStation.length > 100) {
      newErrors.fuelStation = 'Fuel station name is too long (max 100 characters)';
    }

    if (formData.notes && formData.notes.length > 500) {
      newErrors.notes = 'Notes are too long (max 500 characters)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateTotalAmount = () => {
    return calculateTotalAmountFromData(formData);
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Convert quantity and price from user's unit to gallons for storage (if using liters)
      let quantityInGallons = parseFloat(formData.quantity);
      let pricePerGallon = parseFloat(formData.pricePerUnit);

      if (regionConfig.volume.unit === 'liters' && selectedVehicle?.type !== 'electric') {
        // Convert liters to gallons for storage
        quantityInGallons = quantityInGallons / 3.78541;
        // Convert price per liter to price per gallon for storage
        pricePerGallon = pricePerGallon * 3.78541;
      }

      // Calculate the correct amount based on converted values
      const totalAmount = quantityInGallons * pricePerGallon;

      const submissionData = {
        ...formData,
        quantity: quantityInGallons.toString(),
        pricePerUnit: pricePerGallon.toString(),
        amount: totalAmount.toFixed(2),
      };

      await onSubmit(submissionData);
    } catch (error) {
      Alert.alert('Error', `Failed to save fuel entry: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: keyof FuelFormData, value: string) => {
    const updatedData = { ...formData, [field]: value };

    // Auto-calculate amount when quantity or price changes
    if (field === 'quantity' || field === 'pricePerUnit') {
      const calculatedAmount = calculateTotalAmountFromData(updatedData);
      updatedData.amount = calculatedAmount;
    }

    setFormData(updatedData);

    // Real-time validation for improved UX
    const newErrors = { ...errors };

    // Clear existing error for this field
    delete newErrors[field];

    // Real-time validation for specific fields
    if (value.trim()) {
      switch (field) {
        case 'date':
          const selectedDate = new Date(value);
          const today = new Date();
          today.setHours(23, 59, 59, 999);
          if (selectedDate > today) {
            newErrors.date = 'Date cannot be in the future';
          }
          break;

        case 'quantity':
          const quantity = parseFloat(value);
          const vehicleType = selectedVehicle?.type;
          if (isNaN(quantity) || quantity <= 0) {
            newErrors.quantity = 'Quantity must be greater than 0';
          } else if (vehicleType === 'electric' && quantity > 500) {
            newErrors.quantity = 'kWh amount seems unusually high (max 500)';
          } else if ((vehicleType === 'gas' || vehicleType === 'hybrid')) {
            const maxQuantity = regionConfig.volume.unit === 'liters' ? 150 : 50;
            if (quantity > maxQuantity) {
              newErrors.quantity = `${regionConfig.volume.label} amount seems unusually high (max ${maxQuantity} ${regionConfig.volume.abbreviation})`;
            }
          }
          break;

        case 'pricePerUnit':
          const price = parseFloat(value);
          const vType = selectedVehicle?.type;
          if (isNaN(price) || price <= 0) {
            newErrors.pricePerUnit = 'Price per unit must be greater than 0';
          } else if (vType === 'electric') {
            const maxPrice = regionConfig.currency.code === 'IDR' ? 5000 : 2;
            if (price > maxPrice) {
              newErrors.pricePerUnit = `kWh price seems unusually high (max ${formatCurrency(maxPrice, regionConfig)})`;
            }
          } else if ((vType === 'gas' || vType === 'hybrid')) {
            const maxPrice = regionConfig.currency.code === 'IDR' ? 25000 : 10;
            if (price > maxPrice) {
              newErrors.pricePerUnit = `${regionConfig.volume.label} price seems unusually high (max ${formatCurrency(maxPrice, regionConfig)})`;
            }
          }
          break;

        case 'mileage':
          const mileage = parseInt(value);
          if (isNaN(mileage) || mileage < 0) {
            newErrors.mileage = 'Mileage must be 0 or greater';
          } else if (mileage > (regionConfig.distance.unit === 'kilometers' ? 1600000 : 1000000)) {
            newErrors.mileage = 'Odometer reading seems unusually high';
          }
          break;

        case 'fuelStation':
          if (value.length > 100) {
            newErrors.fuelStation = 'Fuel station name is too long (max 100 characters)';
          }
          break;

        case 'notes':
          if (value.length > 500) {
            newErrors.notes = 'Notes are too long (max 500 characters)';
          }
          break;
      }
    }

    setErrors(newErrors);
  };

  // Helper function to calculate amount from form data
  const calculateTotalAmountFromData = (data: FuelFormData) => {
    const quantity = parseFloat(data.quantity) || 0;
    const pricePerUnit = parseFloat(data.pricePerUnit) || 0;
    return (quantity * pricePerUnit).toFixed(2);
  };

  const getQuantityLabel = () => {
    if (!selectedVehicle) return `Quantity (${regionConfig.volume.label})`;
    switch (selectedVehicle.type) {
      case 'electric':
        return 'Quantity (kWh)';
      case 'gas':
      case 'hybrid':
      default:
        return `Quantity (${regionConfig.volume.label})`;
    }
  };

  const getPriceLabel = () => {
    if (!selectedVehicle) return `Price per ${regionConfig.volume.abbreviation}`;
    switch (selectedVehicle.type) {
      case 'electric':
        return 'Price per kWh';
      case 'gas':
      case 'hybrid':
      default:
        return `Price per ${regionConfig.volume.abbreviation}`;
    }
  };

  const getQuantityPlaceholder = () => {
    if (!selectedVehicle) return regionConfig.volume.unit === 'liters' ? 'e.g., 40' : 'e.g., 10';
    switch (selectedVehicle.type) {
      case 'electric':
        return 'e.g., 50';
      case 'gas':
      case 'hybrid':
      default:
        return regionConfig.volume.unit === 'liters' ? 'e.g., 40' : 'e.g., 12.5';
    }
  };

  const getPricePlaceholder = () => {
    if (!selectedVehicle) return regionConfig.currency.code === 'IDR' ? 'e.g., 15000' : 'e.g., 3.50';
    switch (selectedVehicle.type) {
      case 'electric':
        return regionConfig.currency.code === 'IDR' ? 'e.g., 2000' : 'e.g., 0.15';
      case 'gas':
      case 'hybrid':
      default:
        return regionConfig.currency.code === 'IDR' ? 'e.g., 15000' : 'e.g., 3.45';
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
          {vehicles.length >= 1 && (
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
            <ThemedText style={styles.label}>Odometer Reading ({regionConfig.distance.abbreviation})</ThemedText>
            <TextInput
              style={[styles.input, errors.mileage && styles.inputError]}
              placeholder={`e.g., ${regionConfig.distance.unit === 'kilometers' ? '72500' : '45230'}`}
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
            <ThemedText style={styles.label}>Total Amount ({regionConfig.currency.symbol})</ThemedText>
            <View style={styles.calculatedAmountContainer}>
              <TextInput
                style={[styles.input, styles.calculatedInput, styles.readonlyInput]}
                placeholder="0.00"
                value={formatCurrency(parseFloat(calculateTotalAmount()) || 0, regionConfig)}
                editable={false} // Read-only since it's calculated
              />
              <View style={styles.calculateIconContainer}>
                <IconSymbol name="calculator" size={16} color="#007AFF" />
              </View>
            </View>
            <ThemedText style={styles.helperText}>
              Automatically calculated from quantity × price per unit
              {selectedVehicle && selectedVehicle.type === 'electric'
                ? ` (${formData.quantity || 0} kWh × ${regionConfig.currency.symbol}${formData.pricePerUnit || '0'})`
                : ` (${formData.quantity || 0} ${regionConfig.volume.abbreviation} × ${regionConfig.currency.symbol}${formData.pricePerUnit || '0'})`
              }
            </ThemedText>
          </View>

          {/* Fuel Station */}
          <View style={styles.fieldGroup}>
            <ThemedText style={styles.label}>Fuel Station (Optional)</ThemedText>
            <TextInput
              style={[styles.input, errors.fuelStation && styles.inputError]}
              placeholder="e.g., Shell, Chevron, BP"
              value={formData.fuelStation}
              onChangeText={(value) => updateFormData('fuelStation', value)}
              editable={!loading}
              maxLength={100}
            />
            {errors.fuelStation && (
              <ThemedText style={styles.errorText}>{errors.fuelStation}</ThemedText>
            )}
            <ThemedText style={styles.helperText}>
              Enter the name of the fuel station or charging station
            </ThemedText>
          </View>

          {/* Notes */}
          <View style={styles.fieldGroup}>
            <ThemedText style={styles.label}>Notes (Optional)</ThemedText>
            <TextInput
              style={[styles.input, styles.notesInput, errors.notes && styles.inputError]}
              placeholder="e.g., Premium gasoline, road trip, maintenance visit"
              value={formData.notes}
              onChangeText={(value) => updateFormData('notes', value)}
              editable={!loading}
              maxLength={500}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
            <View style={styles.characterCount}>
              <ThemedText style={styles.helperText}>
                {(formData.notes || '').length}/500 characters
              </ThemedText>
            </View>
            {errors.notes && (
              <ThemedText style={styles.errorText}>{errors.notes}</ThemedText>
            )}
            <ThemedText style={styles.helperText}>
              Add any additional notes about this fuel entry
            </ThemedText>
          </View>

          {/* Efficiency Display for Gas Vehicles */}
          {selectedVehicle && (selectedVehicle.type === 'gas' || selectedVehicle.type === 'hybrid') && (
            <View style={styles.fieldGroup}>
              <ThemedText style={styles.label}>
                {selectedVehicle.type === 'hybrid'
                  ? `Efficiency (${regionConfig.efficiency.label}, gas engine)`
                  : `Efficiency (${regionConfig.efficiency.label})`
                }
              </ThemedText>
              <ThemedText style={styles.mpgText}>
                Will be calculated automatically based on previous entries ({regionConfig.efficiency.formula})
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
  readonlyInput: {
    backgroundColor: '#f8f8f8',
    color: '#333',
  },
  calculateIconContainer: {
    padding: 12,
    backgroundColor: '#f2f2f7',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
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
  notesInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  characterCount: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
});