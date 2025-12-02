/**
 * ServiceListItem component for displaying service records in a compact list format
 * Optimized for list views with efficient space usage and clear information hierarchy
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import type { ServiceRecord, Vehicle } from '@/types/data';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import * as Haptics from 'expo-haptics';

interface ServiceListItemProps {
  serviceRecord: ServiceRecord;
  vehicle: Vehicle;
  onEdit: (serviceRecord: ServiceRecord) => void;
  onDelete: (serviceRecord: ServiceRecord) => void;
  onPress?: (serviceRecord: ServiceRecord) => void;
}

export function ServiceListItem({ serviceRecord, vehicle, onEdit, onDelete, onPress }: ServiceListItemProps) {
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];

  // Format helpers
  const formatDate = () => {
    const date = new Date(serviceRecord.date);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getServiceIcon = () => {
    const lowerType = serviceRecord.type.toLowerCase();
    if (lowerType.includes('oil')) return 'oildrop.fill';
    if (lowerType.includes('tire')) return 'circle.fill';
    if (lowerType.includes('brake')) return 'shield.fill';
    if (lowerType.includes('battery')) return 'battery.100.fill';
    if (lowerType.includes('air filter') || lowerType.includes('filter')) return 'fan.fill';
    if (lowerType.includes('transmission')) return 'gear.fill';
    if (lowerType.includes('coolant')) return 'drop.fill';
    if (lowerType.includes('inspection')) return 'magnifyingglass';
    if (lowerType.includes('electrical')) return 'bolt.fill';
    if (lowerType.includes('engine')) return 'engine.fill';
    return 'wrench.fill';
  };

  const getServiceColor = () => {
    const lowerType = serviceRecord.type.toLowerCase();
    if (lowerType.includes('oil')) return colors.warning;
    if (lowerType.includes('tire')) return colors.info;
    if (lowerType.includes('brake')) return colors.error;
    if (lowerType.includes('battery')) return colors.success;
    if (lowerType.includes('inspection')) return colors.primary;
    return colors.text;
  };

  const getVehicleIcon = () => {
    switch (vehicle.type) {
      case 'electric':
        return 'bolt';
      case 'hybrid':
        return 'leaf';
      default:
        return 'car.fill';
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

  const isOverdueService = () => {
    const serviceDate = new Date(serviceRecord.date);
    const today = new Date();
    const daysDiff = Math.floor((today.getTime() - serviceDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff > 365; // Consider services over 1 year old as potentially overdue
  };

  const handleEdit = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onEdit(serviceRecord);
  };

  const handleDelete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    onDelete(serviceRecord);
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.(serviceRecord);
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
          {/* Service type icon and info */}
          <View style={styles.serviceInfo}>
            <View style={styles.serviceHeader}>
              <IconSymbol
                name={getServiceIcon()}
                size={20}
                color={getServiceColor()}
              />
              <ThemedText style={[styles.serviceType, { color: colors.text }]}>
                {serviceRecord.type}
              </ThemedText>
              {isOverdueService() && (
                <View style={[styles.overdueBadge, { backgroundColor: colors.error }]}>
                  <ThemedText style={styles.overdueText}>Overdue</ThemedText>
                </View>
              )}
            </View>
            <ThemedText style={[styles.description, { color: colors.text }]} numberOfLines={2}>
              {serviceRecord.description}
            </ThemedText>

            {/* Vehicle and date row */}
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
              <ThemedText style={[styles.date, { color: colors.icon }]}>
                {formatDate()}
              </ThemedText>
              <ThemedText style={[styles.mileage, { color: colors.icon }]}>
                {serviceRecord.mileage.toLocaleString()} mi
              </ThemedText>
            </View>
          </View>

          {/* Cost and actions */}
          <View style={styles.rightSection}>
            <ThemedText style={[styles.cost, { color: colors.primary }]}>
              ${serviceRecord.cost.toFixed(2)}
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
        {serviceRecord.notes && (
          <View style={styles.notesSection}>
            <ThemedText style={[styles.notes, { color: colors.icon }]} numberOfLines={2}>
              📝 {serviceRecord.notes}
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
  serviceInfo: {
    flex: 1,
    marginRight: 12,
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  serviceType: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  overdueBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  overdueText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
  },
  description: {
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 6,
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
  date: {
    fontSize: 12,
  },
  mileage: {
    fontSize: 12,
    fontWeight: '500',
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