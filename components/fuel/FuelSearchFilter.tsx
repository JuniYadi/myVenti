/**
 * FuelSearchFilter component for advanced fuel entry filtering
 * Provides search input with debouncing, date range picker, price range slider, and vehicle selection
 */

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRegion } from '@/hooks/use-region';
import type { FuelSearchFilter, Vehicle } from '@/types/data';
import React, { useCallback, useMemo, useState } from 'react';
import {
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

// DateTimePicker will be loaded on demand when needed
let DateTimePicker: any = null;
let DateTimePickerEvent: any = null;
let DateTimePickerLoaded = false;

const loadDateTimePicker = async () => {
  if (DateTimePickerLoaded || Platform.OS === 'web') {
    return DateTimePicker;
  }

  try {
    const pickerModule = await import('@react-native-community/datetimepicker');
    DateTimePicker = pickerModule.default || pickerModule;
    DateTimePickerEvent = pickerModule.DateTimePickerEvent;
    DateTimePickerLoaded = true;
    return DateTimePicker;
  } catch (error) {
    console.warn('DateTimePicker not available on this platform:', error);
    DateTimePickerLoaded = true; // Mark as loaded to avoid repeated attempts
    return null;
  }
};

interface FuelSearchFilterProps {
  filter: FuelSearchFilter;
  onFilterChange: (filter: FuelSearchFilter) => void;
  vehicles: Vehicle[];
}

export function FuelSearchFilter({ filter, onFilterChange, vehicles }: FuelSearchFilterProps) {
  const { regionConfig } = useRegion();
  const [searchTerm, setSearchTerm] = useState(filter.fuelStation || '');
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(
    filter.dateRange?.start ? new Date(filter.dateRange.start) : null
  );
  const [endDate, setEndDate] = useState<Date | null>(
    filter.dateRange?.end ? new Date(filter.dateRange.end) : null
  );
  const [minPrice, setMinPrice] = useState(filter.priceRange?.min?.toString() || '');
  const [maxPrice, setMaxPrice] = useState(filter.priceRange?.max?.toString() || '');

  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme || 'light'];
  const [searchTimeout, setSearchTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

  // Debounced search functionality
  const debouncedSearch = useCallback((text: string) => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      onFilterChange({
        ...filter,
        fuelStation: text || undefined,
      });
    }, 300); // 300ms debounce

    setSearchTimeout(timeout);
  }, [filter, onFilterChange, searchTimeout]);

  const handleSearchChange = (text: string) => {
    setSearchTerm(text);
    debouncedSearch(text);
  };

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);
      const dateStr = selectedDate.toISOString().split('T')[0];
      onFilterChange({
        ...filter,
        dateRange: {
          start: dateStr,
          end: filter.dateRange?.end || new Date().toISOString().split('T')[0],
        },
      });
    }
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      setEndDate(selectedDate);
      const dateStr = selectedDate.toISOString().split('T')[0];
      onFilterChange({
        ...filter,
        dateRange: {
          start: filter.dateRange?.start || new Date().toISOString().split('T')[0],
          end: dateStr,
        },
      });
    }
  };

  const handleWebDateInput = (type: 'start' | 'end') => {
    if (Platform.OS === 'web') {
      const input = document.createElement('input');
      input.type = 'date';
      input.value = type === 'start'
        ? (startDate?.toISOString().split('T')[0] || '')
        : (endDate?.toISOString().split('T')[0] || '');

      input.onchange = (e: any) => {
        const selectedDate = new Date(e.target.value);
        if (type === 'start') {
          setStartDate(selectedDate);
          onFilterChange({
            ...filter,
            dateRange: {
              start: e.target.value,
              end: filter.dateRange?.end || new Date().toISOString().split('T')[0],
            },
          });
        } else {
          setEndDate(selectedDate);
          onFilterChange({
            ...filter,
            dateRange: {
              start: filter.dateRange?.start || new Date().toISOString().split('T')[0],
              end: e.target.value,
            },
          });
        }
      };

      input.click();
    }
  };

  const handleMinPriceChange = (text: string) => {
    setMinPrice(text);
    const min = parseFloat(text) || 0;
    onFilterChange({
      ...filter,
      priceRange: {
        min,
        max: filter.priceRange?.max || 0,
      },
    });
  };

  const handleMaxPriceChange = (text: string) => {
    setMaxPrice(text);
    const max = parseFloat(text) || 0;
    onFilterChange({
      ...filter,
      priceRange: {
        min: filter.priceRange?.min || 0,
        max,
      },
    });
  };

  const handleVehicleSelect = (vehicleId: string) => {
    onFilterChange({
      ...filter,
      vehicleId: vehicleId === filter.vehicleId ? undefined : vehicleId,
    });
  };

  const handleSortChange = (sortBy: FuelSearchFilter['sortBy']) => {
    onFilterChange({
      ...filter,
      sortBy,
      sortOrder: sortBy === filter.sortBy && filter.sortOrder === 'asc' ? 'desc' : 'asc',
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStartDate(null);
    setEndDate(null);
    setMinPrice('');
    setMaxPrice('');
    onFilterChange({
      sortBy: 'date',
      sortOrder: 'desc',
    });
  };

  const hasActiveFilters = useMemo(() => {
    return filter.fuelStation ||
           filter.dateRange ||
           filter.priceRange ||
           filter.vehicleId;
  }, [filter]);

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Search Input */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Search Fuel Station</ThemedText>
          <View style={styles.searchContainer}>
            <IconSymbol
              name="magnifyingglass"
              size={16}
              color={colors.icon}
              style={styles.searchIcon}
            />
            <TextInput
              style={[styles.searchInput, { color: colors.text, borderColor: colors.border }]}
              placeholder="Enter fuel station name..."
              placeholderTextColor={colors.icon}
              value={searchTerm}
              onChangeText={handleSearchChange}
            />
          </View>
        </ThemedView>

        {/* Vehicle Selection */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Vehicle</ThemedText>
          <View style={styles.vehicleContainer}>
            {vehicles.map((vehicle) => (
              <TouchableOpacity
                key={vehicle.id}
                style={[
                  styles.vehicleOption,
                  {
                    backgroundColor: filter.vehicleId === vehicle.id ? colors.primary : colors.surface,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => handleVehicleSelect(vehicle.id)}
              >
                <IconSymbol
                  name={vehicle.type === 'electric' ? 'bolt' : vehicle.type === 'hybrid' ? 'leaf' : 'fuelpump'}
                  size={16}
                  color={filter.vehicleId === vehicle.id ? '#fff' : colors.icon}
                />
                <ThemedText
                  style={[
                    styles.vehicleName,
                    { color: filter.vehicleId === vehicle.id ? '#fff' : colors.text },
                  ]}
                >
                  {vehicle.name}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </ThemedView>

        {/* Date Range */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Date Range</ThemedText>
          <View style={styles.dateContainer}>
            <TouchableOpacity
              style={[styles.dateButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={async () => {
                if (Platform.OS === 'web') {
                  handleWebDateInput('start');
                } else {
                  const Picker = await loadDateTimePicker();
                  if (Picker) {
                    setShowStartDatePicker(true);
                  } else {
                    handleWebDateInput('start');
                  }
                }
              }}
            >
              <IconSymbol name="calendar" size={16} color={colors.icon} />
              <ThemedText style={styles.dateText}>
                Start: {startDate ? startDate.toLocaleDateString() : 'Select date'}
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.dateButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={async () => {
                if (Platform.OS === 'web') {
                  handleWebDateInput('end');
                } else {
                  const Picker = await loadDateTimePicker();
                  if (Picker) {
                    setShowEndDatePicker(true);
                  } else {
                    handleWebDateInput('end');
                  }
                }
              }}
            >
              <IconSymbol name="calendar" size={16} color={colors.icon} />
              <ThemedText style={styles.dateText}>
                End: {endDate ? endDate.toLocaleDateString() : 'Select date'}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </ThemedView>

        {/* Price Range */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Price Range ({regionConfig.currency.symbol})</ThemedText>
          <View style={styles.priceContainer}>
            <View style={styles.priceInputContainer}>
              <ThemedText style={styles.priceLabel}>Min:</ThemedText>
              <TextInput
                style={[styles.priceInput, { color: colors.text, borderColor: colors.border }]}
                placeholder="0.00"
                placeholderTextColor={colors.icon}
                value={minPrice}
                onChangeText={handleMinPriceChange}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.priceInputContainer}>
              <ThemedText style={styles.priceLabel}>Max:</ThemedText>
              <TextInput
                style={[styles.priceInput, { color: colors.text, borderColor: colors.border }]}
                placeholder="999.99"
                placeholderTextColor={colors.icon}
                value={maxPrice}
                onChangeText={handleMaxPriceChange}
                keyboardType="numeric"
              />
            </View>
          </View>
        </ThemedView>

        {/* Sort Options */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Sort By</ThemedText>
          <View style={styles.sortContainer}>
            {[
              { key: 'date' as const, label: 'Date', icon: 'calendar' },
              { key: 'cost' as const, label: 'Cost', icon: 'dollarsign' },
              { key: 'mpg' as const, label: 'MPG', icon: 'speedometer' },
            ].map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.sortOption,
                  {
                    backgroundColor: filter.sortBy === option.key ? colors.primary : colors.surface,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => handleSortChange(option.key)}
              >
                <IconSymbol
                  name={option.icon}
                  size={16}
                  color={filter.sortBy === option.key ? '#fff' : colors.icon}
                />
                <ThemedText
                  style={[
                    styles.sortLabel,
                    { color: filter.sortBy === option.key ? '#fff' : colors.text },
                  ]}
                >
                  {option.label}
                </ThemedText>
                {filter.sortBy === option.key && (
                  <IconSymbol
                    name={filter.sortOrder === 'asc' ? 'arrow.up' : 'arrow.down'}
                    size={12}
                    color="#fff"
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </ThemedView>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <TouchableOpacity
            style={[styles.clearButton, { backgroundColor: colors.error }]}
            onPress={clearFilters}
          >
            <IconSymbol name="xmark" size={16} color="#fff" />
            <ThemedText style={styles.clearButtonText}>Clear All Filters</ThemedText>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Date Pickers - Use async loaded component */}
      {Platform.OS !== 'web' && showStartDatePicker && DateTimePickerLoaded && DateTimePicker && (
        <DateTimePicker
          value={startDate || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleStartDateChange}
        />
      )}
      {Platform.OS !== 'web' && showEndDatePicker && DateTimePickerLoaded && DateTimePicker && (
        <DateTimePicker
          value={endDate || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleEndDateChange}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    borderWidth: 0,
  },
  vehicleContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  vehicleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  vehicleName: {
    fontSize: 14,
    fontWeight: '500',
  },
  dateContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  dateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  dateText: {
    fontSize: 14,
  },
  priceContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  priceInputContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 14,
    marginBottom: 6,
  },
  priceInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  sortContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  sortOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  sortLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
    marginTop: 8,
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});