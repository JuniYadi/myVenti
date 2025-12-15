/**
 * FuelEntryCard component for displaying individual fuel entries
 * Features visible edit/delete buttons with haptic feedback, matching ServiceListItem design
 */

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { convertVolume, formatCurrency, useRegion } from '@/hooks/use-region';
import type { FuelEntry, Vehicle } from '@/types/data';
import * as Haptics from 'expo-haptics';
import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

interface FuelEntryCardProps {
  entry: FuelEntry;
  vehicle: Vehicle;
  onEdit: (entry: FuelEntry) => void;
  onDelete: (entry: FuelEntry) => void;
  onPress?: (entry: FuelEntry) => void;
}

export function FuelEntryCard({ entry, vehicle, onEdit, onDelete, onPress }: FuelEntryCardProps) {
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];
  const { regionConfig } = useRegion();

  // Format helpers
  const formatQuantity = () => {
    let quantity = entry.quantity; // stored in gallons internally
    let unit = 'gal';

    if (vehicle.type !== 'electric') {
      // Convert to user's preferred unit
      if (regionConfig.volume.unit === 'liters') {
        quantity = convertVolume(entry.quantity, 'gallons', 'liters');
        unit = 'L';
      } else {
        unit = regionConfig.volume.abbreviation;
      }
    }

    return vehicle.type === 'electric' ? `${entry.quantity.toFixed(2)} kWh` : `${quantity.toFixed(2)} ${unit}`;
  };

  const formatPricePerUnit = () => {
    if (vehicle.type === 'electric') {
      return formatCurrency(entry.pricePerUnit, regionConfig);
    }

    // Price is stored per gallon, convert to user's preferred unit for display
    let pricePerUnit = entry.pricePerUnit;
    if (regionConfig.volume.unit === 'liters') {
      // Convert price per gallon to price per liter
      pricePerUnit = entry.pricePerUnit / 3.78541;
    }

    return formatCurrency(pricePerUnit, regionConfig);
  };

  const formatDate = () => {
    const date = new Date(entry.date);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getVehicleIcon = () => {
    switch (vehicle.type) {
      case 'electric':
        return 'bolt';
      case 'hybrid':
        return 'leaf';
      default:
        return 'fuelpump';
    }
  };

  const getVehicleIconColor = () => {
    switch (vehicle.type) {
      case 'electric':
        return colors.success;
      case 'hybrid':
        return colors.warning;
      default:
        return colors.primary;
    }
  };

  const handleEdit = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onEdit(entry);
  };

  const handleDelete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    onDelete(entry);
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.(entry);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.item,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            shadowColor: colors.shadow,
          },
        ]}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        {/* Main content row */}
        <View style={styles.mainRow}>
          {/* Fuel entry info */}
          <View style={styles.entryInfo}>
            <View style={styles.entryHeader}>
              <IconSymbol
                name="fuelpump.fill"
                size={20}
                color={colors.primary}
              />
              <ThemedText style={[styles.entryDate, { color: colors.text }]}>
                {formatDate()}
              </ThemedText>
            </View>
            <ThemedText style={[styles.quantityInfo, { color: colors.text }]} numberOfLines={1}>
              {formatQuantity()} • {formatPricePerUnit()}/{vehicle.type === 'electric' ? 'kWh' : regionConfig.volume.abbreviation}
            </ThemedText>

            {/* Vehicle and station row */}
            <View style={styles.metadataRow}>
              <View style={styles.vehicleInfo}>
                <IconSymbol
                  name={getVehicleIcon()}
                  size={12}
                  color={getVehicleIconColor()}
                />
                <ThemedText style={[styles.vehicleName, { color: colors.icon }]}>
                  {vehicle.name}
                </ThemedText>
              </View>
              {entry.fuelStation && (
                <ThemedText style={[styles.station, { color: colors.icon }]} numberOfLines={1}>
                  📍 {entry.fuelStation}
                </ThemedText>
              )}
            </View>
          </View>

          {/* Cost and actions */}
          <View style={styles.rightSection}>
            <ThemedText style={[styles.cost, { color: colors.primary }]}>
              {formatCurrency(entry.amount, regionConfig)}
            </ThemedText>

            {/* Action buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, styles.editButton, { borderColor: colors.border }]}
                onPress={handleEdit}
                activeOpacity={0.7}
              >
                <IconSymbol name="pencil" size={14} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton, { borderColor: colors.border }]}
                onPress={handleDelete}
                activeOpacity={0.7}
              >
                <IconSymbol name="trash" size={14} color={colors.error} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Notes section if present */}
        {entry.notes && (
          <View style={styles.notesSection}>
            <ThemedText style={[styles.notes, { color: colors.icon }]} numberOfLines={2}>
              📝 {entry.notes}
            </ThemedText>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 12,
    marginVertical: 4,
  },
  item: {
    borderRadius: 8,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  mainRow: {
    flexDirection: 'row',
    padding: 12,
  },
  entryInfo: {
    flex: 1,
    marginRight: 12,
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  entryDate: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  quantityInfo: {
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 6,
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  vehicleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  vehicleName: {
    fontSize: 12,
    fontWeight: '500',
  },
  station: {
    fontSize: 12,
    flex: 1,
  },
  rightSection: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    minWidth: 80,
  },
  cost: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    backgroundColor: '#fff',
  },
  editButton: {
    // Style inherited from props
  },
  deleteButton: {
    // Style inherited from props
  },
  notesSection: {
    borderTopWidth: 1,
    borderTopColor: '#f8f8f8',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  notes: {
    fontSize: 12,
    fontStyle: 'italic',
    lineHeight: 16,
  },
});