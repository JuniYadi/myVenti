/**
 * ServiceRecordCard component for displaying individual service records
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
import type { ServiceRecord, Vehicle } from '@/types/data';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import * as Haptics from 'expo-haptics';

interface ServiceRecordCardProps {
  serviceRecord: ServiceRecord;
  vehicle: Vehicle;
  onEdit: (serviceRecord: ServiceRecord) => void;
  onDelete: (serviceRecord: ServiceRecord) => void;
  onPress?: (serviceRecord: ServiceRecord) => void;
}

export function ServiceRecordCard({ serviceRecord, vehicle, onEdit, onDelete, onPress }: ServiceRecordCardProps) {
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];

  const translateX = useRef(new Animated.Value(0)).current;
  const lastOffset = useRef(0);
  const swipeThreshold = 80;
  const actionButtonWidth = 60;

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
    // Map service types to appropriate icons
    const lowerType = serviceRecord.type.toLowerCase();
    if (lowerType.includes('oil')) return 'oildrop';
    if (lowerType.includes('tire')) return 'circle';
    if (lowerType.includes('brake')) return 'shield';
    if (lowerType.includes('battery')) return 'battery.100';
    if (lowerType.includes('air filter') || lowerType.includes('filter')) return 'fan';
    if (lowerType.includes('transmission')) return 'gear';
    if (lowerType.includes('coolant')) return 'drop';
    if (lowerType.includes('inspection')) return 'magnifyingglass';
    if (lowerType.includes('electrical')) return 'bolt';
    if (lowerType.includes('engine')) return 'engine';
    return 'wrench';
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
    onEdit(serviceRecord);
  };

  const handleDelete = () => {
    triggerHaptic('warning');
    resetCardPosition();
    onDelete(serviceRecord);
  };

  const handleCardPress = () => {
    if (Math.abs(lastOffset.current) < swipeThreshold / 2) {
      triggerHaptic('light');
      onPress?.(serviceRecord);
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

  const isOverdueService = () => {
    const serviceDate = new Date(serviceRecord.date);
    const today = new Date();
    const daysDiff = Math.floor((today.getTime() - serviceDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff > 365; // Consider services over 1 year old as potentially overdue
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
            {/* Service header with icon and type */}
            <View style={styles.serviceHeader}>
              <View style={styles.serviceInfo}>
                <View style={styles.serviceTypeRow}>
                  <IconSymbol
                    name={getServiceIcon()}
                    size={16}
                    color={getServiceColor()}
                  />
                  <ThemedText style={styles.serviceType}>{serviceRecord.type}</ThemedText>
                  {isOverdueService() && (
                    <View style={[styles.overdueBadge, { backgroundColor: colors.error }]}>
                      <ThemedText style={styles.overdueText}>Overdue</ThemedText>
                    </View>
                  )}
                </View>
                <ThemedText style={styles.serviceDescription}>{serviceRecord.description}</ThemedText>
              </View>
              <View style={styles.costSection}>
                <ThemedText style={styles.cost}>${serviceRecord.cost.toFixed(2)}</ThemedText>
              </View>
            </View>

            {/* Vehicle and date info */}
            <View style={styles.detailsRow}>
              <View style={styles.vehicleInfo}>
                <IconSymbol
                  name={getVehicleIcon()}
                  size={12}
                  color={getVehicleIconColor()}
                />
                <ThemedText style={styles.vehicleName}>{vehicle.name}</ThemedText>
              </View>
              <ThemedText style={styles.date}>{formatDate()}</ThemedText>
              <ThemedText style={styles.mileage}>{serviceRecord.mileage.toLocaleString()} mi</ThemedText>
            </View>

            {/* Notes section if present */}
            {serviceRecord.notes && (
              <View style={styles.notesSection}>
                <ThemedText style={styles.notes}>{serviceRecord.notes}</ThemedText>
              </View>
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
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  serviceInfo: {
    flex: 1,
    marginRight: 12,
  },
  serviceTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  serviceDescription: {
    fontSize: 14,
    opacity: 0.8,
    lineHeight: 18,
  },
  costSection: {
    alignItems: 'flex-end',
  },
  cost: {
    fontSize: 18,
    fontWeight: '700',
    color: '#007AFF',
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  vehicleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  vehicleName: {
    fontSize: 14,
    fontWeight: '500',
  },
  date: {
    fontSize: 13,
    opacity: 0.7,
  },
  mileage: {
    fontSize: 13,
    opacity: 0.7,
    fontWeight: '500',
  },
  notesSection: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f8f8f8',
  },
  notes: {
    fontSize: 12,
    opacity: 0.6,
    fontStyle: 'italic',
    lineHeight: 16,
  },
});