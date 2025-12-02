/**
 * FuelEntryCard component for displaying individual fuel entries
 * Features swipe gestures, edit/delete actions with haptic feedback, and vehicle-specific formatting
 */

import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import {
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
  State,
} from 'react-native-gesture-handler';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import type { FuelEntry, Vehicle } from '@/types/data';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import * as Haptics from 'expo-haptics';

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

  const translateX = useRef(new Animated.Value(0)).current;
  const lastOffset = useRef(0);
  const swipeThreshold = 80;
  const actionButtonWidth = 60;

  // Format helpers
  const formatQuantity = () => {
    const quantity = entry.quantity.toFixed(2);
    return vehicle.type === 'electric' ? `${quantity} kWh` : `${quantity} gal`;
  };

  const formatPriceLabel = () => {
    return vehicle.type === 'electric' ? 'Price/kWh' : 'Price/Gal';
  };

  const formatMPG = () => {
    if (vehicle.type === 'electric') {
      return 'N/A (Electric)';
    }
    return entry.mpg ? entry.mpg.toFixed(1) : 'N/A';
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

  // Haptic feedback
  const triggerHaptic = (type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'light') => {
    switch (type) {
      case 'success':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case 'warning':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        break;
      case 'error':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;
      case 'heavy':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
      case 'medium':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      default:
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleEdit = () => {
    triggerHaptic('light');
    resetCardPosition();
    onEdit(entry);
  };

  const handleDelete = () => {
    triggerHaptic('warning');
    resetCardPosition();
    onDelete(entry);
  };

  const handleCardPress = () => {
    if (Math.abs(lastOffset.current) < swipeThreshold / 2) {
      triggerHaptic('light');
      onPress?.(entry);
    }
  };

  const resetCardPosition = () => {
    lastOffset.current = 0;
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
      friction: 8,
      tension: 40,
    }).start();
  };

  // Swipe gesture handling
  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: false }
  );

  const onHandlerStateChange = (event: PanGestureHandlerGestureEvent) => {
    const { nativeEvent } = event;

    if (nativeEvent.state === State.END) {
      const { translationX, velocityX } = nativeEvent;

      // Determine if swipe should snap to action buttons or center
      const shouldSnapToActions =
        (translationX < -swipeThreshold && velocityX < -500) ||
        (translationX < -swipeThreshold * 1.5);

      if (shouldSnapToActions) {
        // Snap to show action buttons
        lastOffset.current = -actionButtonWidth * 2;
        triggerHaptic('medium');
        Animated.spring(translateX, {
          toValue: -actionButtonWidth * 2,
          useNativeDriver: true,
          friction: 8,
          tension: 40,
        }).start();
      } else {
        // Snap back to center
        resetCardPosition();
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Action buttons */}
      <Animated.View
        style={[
          styles.actionButtons,
          {
            transform: [{ translateX: Animated.multiply(translateX, -1) }],
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton, { backgroundColor: colors.primary }]}
          onPress={handleEdit}
          activeOpacity={0.8}
        >
          <IconSymbol name="pencil" size={16} color="white" />
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton, { backgroundColor: colors.error }]}
          onPress={handleDelete}
          activeOpacity={0.8}
        >
          <IconSymbol name="trash" size={16} color="white" />
          <Text style={styles.actionButtonText}>Delete</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Main card */}
      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
      >
        <Animated.View
          style={[
            styles.card,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              shadowColor: colors.shadow,
              transform: [{ translateX }],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.cardContent}
            onPress={handleCardPress}
            activeOpacity={0.9}
          >
            {/* SUPER COMPACT DESIGN */}
            <View style={styles.compactContainer}>
              {/* Single line with date, vehicle, and amount */}
              <View style={styles.compactHeader}>
                <IconSymbol
                  name={getVehicleIcon()}
                  size={12}
                  color={getVehicleIconColor()}
                />
                <Text style={styles.compactDate}>{entry.date}</Text>
                <Text style={styles.compactVehicle}>{vehicle.name}</Text>
                <Text style={styles.compactAmount}>${entry.amount.toFixed(2)}</Text>
              </View>

              {/* Single line with quantity and price */}
              <View style={styles.compactSubHeader}>
                <Text style={styles.compactQuantity}>{formatQuantity()}</Text>
                <Text style={styles.compactPrice}>• ${entry.pricePerUnit.toFixed(2)}/{vehicle.type === 'electric' ? 'kWh' : 'gal'}</Text>
              </View>

              {entry.fuelStation && (
                <Text style={styles.compactStation}>📍 {entry.fuelStation}</Text>
              )}
            </View>

            {/* Compact notes - only if very short */}
            {entry.notes && entry.notes.length < 20 && (
              <Text style={styles.compactNotes}>📝 {entry.notes}</Text>
            )}
          </TouchableOpacity>
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 12,
    marginVertical: 6,
    position: 'relative',
  },
  actionButtons: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    left: 0,
    flexDirection: 'row',
    zIndex: 1,
  },
  actionButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 6,
  },
  editButton: {
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  deleteButton: {
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 3,
  },
  card: {
    borderRadius: 8,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    zIndex: 2,
    backgroundColor: '#fafafa', // Temporary indicator of new design
  },
  cardContent: {
    padding: 6,
  },
  compactContainer: {
    backgroundColor: '#f8f8f8',
    borderRadius: 6,
    padding: 6,
  },
  compactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  compactDate: {
    fontSize: 10,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  compactVehicle: {
    fontSize: 11,
    fontWeight: '500',
    color: '#555',
    flex: 1,
  },
  compactAmount: {
    fontSize: 12,
    fontWeight: '700',
    color: '#007AFF',
  },
  compactSubHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  compactQuantity: {
    fontSize: 10,
    color: '#666',
    fontStyle: 'italic',
  },
  compactPrice: {
    fontSize: 10,
    color: '#666',
  },
  compactStation: {
    fontSize: 9,
    color: '#888',
    fontStyle: 'italic',
    marginTop: 2,
  },
  compactNotes: {
    fontSize: 9,
    color: '#888',
    fontStyle: 'italic',
    marginTop: 3,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  vehicleIcon: {
    marginRight: 4,
  },
  date: {
    fontSize: 14,
    fontWeight: '600',
  },
  vehicleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  vehicleName: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  quantity: {
    fontSize: 11,
    fontStyle: 'italic',
  },
  detailText: {
    fontSize: 11,
    fontStyle: 'italic',
  },
  fuelStation: {
    fontSize: 10,
    fontStyle: 'italic',
    marginTop: 2,
  },
  metricsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.3,
    marginBottom: 1,
  },
  metricValue: {
    fontSize: 12,
    fontWeight: '500',
  },
  notesSection: {
    marginTop: 4,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  notes: {
    fontSize: 10,
    fontStyle: 'italic',
    lineHeight: 14,
  },
  swipeHint: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
    opacity: 0.3,
  },
  hintLine: {
    width: 12,
    height: 1,
    marginHorizontal: 1,
  },
});