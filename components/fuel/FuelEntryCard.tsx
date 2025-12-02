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
  const actionButtonWidth = 70;

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
          <IconSymbol name="pencil" size={20} color="white" />
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton, { backgroundColor: colors.error }]}
          onPress={handleDelete}
          activeOpacity={0.8}
        >
          <IconSymbol name="trash" size={20} color="white" />
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
            {/* Header with date and vehicle info */}
            <View style={styles.header}>
              <View style={styles.vehicleInfo}>
                <View style={styles.vehicleHeader}>
                  <IconSymbol
                    name={getVehicleIcon()}
                    size={16}
                    color={getVehicleIconColor()}
                    style={styles.vehicleIcon}
                  />
                  <ThemedText style={[styles.date, { color: colors.text }]}>
                    {entry.date}
                  </ThemedText>
                </View>
                <ThemedText style={[styles.vehicleName, { color: colors.icon }]}>
                  {vehicle.name}
                </ThemedText>
                {entry.fuelStation && (
                  <ThemedText style={[styles.fuelStation, { color: colors.icon }]}>
                    {entry.fuelStation}
                  </ThemedText>
                )}
              </View>

              <View style={styles.amountSection}>
                <ThemedText style={[styles.amount, { color: colors.primary }]}>
                  ${entry.amount.toFixed(2)}
                </ThemedText>
                <ThemedText style={[styles.quantity, { color: colors.icon }]}>
                  {formatQuantity()}
                </ThemedText>
              </View>
            </View>

            {/* Details row */}
            <View style={styles.details}>
              <View style={styles.detailItem}>
                <ThemedText style={[styles.detailLabel, { color: colors.icon }]}>
                  {formatPriceLabel()}
                </ThemedText>
                <ThemedText style={[styles.detailValue, { color: colors.text }]}>
                  ${entry.pricePerUnit.toFixed(2)}
                </ThemedText>
              </View>

              <View style={styles.detailItem}>
                <ThemedText style={[styles.detailLabel, { color: colors.icon }]}>
                  Mileage
                </ThemedText>
                <ThemedText style={[styles.detailValue, { color: colors.text }]}>
                  {entry.mileage.toLocaleString()}
                </ThemedText>
              </View>

              <View style={styles.detailItem}>
                <ThemedText style={[styles.detailLabel, { color: colors.icon }]}>
                  {vehicle.type === 'electric' ? 'Efficiency' : 'MPG'}
                </ThemedText>
                <ThemedText style={[styles.detailValue, { color: colors.text }]}>
                  {formatMPG()}
                </ThemedText>
              </View>
            </View>

            {/* Notes section */}
            {entry.notes && (
              <View style={styles.notesSection}>
                <ThemedText style={[styles.notes, { color: colors.icon }]}>
                  {entry.notes}
                </ThemedText>
              </View>
            )}

            {/* Swipe hint indicator */}
            <View style={styles.swipeHint}>
              <View style={[styles.hintLine, { backgroundColor: colors.border }]} />
              <View style={[styles.hintLine, { backgroundColor: colors.border }]} />
              <View style={[styles.hintLine, { backgroundColor: colors.border }]} />
            </View>
          </TouchableOpacity>
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
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
    paddingHorizontal: 8,
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
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 2,
  },
  cardContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  vehicleInfo: {
    flex: 1,
    marginRight: 12,
  },
  vehicleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  vehicleIcon: {
    marginRight: 6,
  },
  date: {
    fontSize: 16,
    fontWeight: '600',
  },
  vehicleName: {
    fontSize: 14,
    marginBottom: 2,
  },
  fuelStation: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  amountSection: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 18,
    fontWeight: '700',
  },
  quantity: {
    fontSize: 13,
    marginTop: 2,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailItem: {
    alignItems: 'center',
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  notesSection: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  notes: {
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  swipeHint: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    opacity: 0.5,
  },
  hintLine: {
    width: 20,
    height: 1,
    marginHorizontal: 2,
  },
});