/**
 * FuelBatchDeletion - Batch operations component for fuel entries
 * Provides batch selection, confirmation dialogs, and statistics recalculation
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { FuelEntry, Vehicle } from '@/types/data';
import { FuelService, VehicleService } from '@/services/index';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Spacing, Typography } from '@/constants/theme';
import * as Haptics from 'expo-haptics';

export interface FuelBatchDeletionProps {
  entries: FuelEntry[];
  vehicles: Vehicle[];
  onDeleteComplete?: (deletedCount: number) => void;
  onCancel?: () => void;
}

export function FuelBatchDeletion({
  entries,
  vehicles,
  onDeleteComplete,
  onCancel,
}: FuelBatchDeletionProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const [selectedEntryIds, setSelectedEntryIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [statistics, setStatistics] = useState<{
    totalCost: number;
    totalFuel: number;
    totalMileage: number;
    vehicleBreakdown: Array<{
      vehicleId: string;
      vehicleName: string;
      count: number;
      cost: number;
    }>;
  } | null>(null);

  useEffect(() => {
    calculateStatistics();
  }, [entries, vehicles]);

  const calculateStatistics = () => {
    const totalCost = entries.reduce((sum, entry) => sum + entry.amount, 0);
    const totalFuel = entries.reduce((sum, entry) => sum + entry.quantity, 0);
    const totalMileage = entries.reduce((sum, entry) => sum + entry.mileage, 0);

    // Break down by vehicle
    const vehicleMap = new Map<string, { count: number; cost: number; }>();

    entries.forEach(entry => {
      if (!vehicleMap.has(entry.vehicleId)) {
        vehicleMap.set(entry.vehicleId, { count: 0, cost: 0 });
      }
      const data = vehicleMap.get(entry.vehicleId)!;
      data.count++;
      data.cost += entry.amount;
    });

    const vehicleBreakdown = Array.from(vehicleMap.entries()).map(([vehicleId, data]) => {
      const vehicle = vehicles.find(v => v.id === vehicleId);
      return {
        vehicleId,
        vehicleName: vehicle?.name || 'Unknown Vehicle',
        count: data.count,
        cost: Math.round(data.cost * 100) / 100,
      };
    }).sort((a, b) => b.cost - a.cost);

    setStatistics({
      totalCost: Math.round(totalCost * 100) / 100,
      totalFuel: Math.round(totalFuel * 100) / 100,
      totalMileage,
      vehicleBreakdown,
    });
  };

  const toggleEntrySelection = (entryId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedEntryIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(entryId)) {
        newSet.delete(entryId);
      } else {
        newSet.add(entryId);
      }
      return newSet;
    });
  };

  const toggleAllSelections = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (selectedEntryIds.size === entries.length) {
      setSelectedEntryIds(new Set());
    } else {
      setSelectedEntryIds(new Set(entries.map(entry => entry.id)));
    }
  };

  const getSelectedStatistics = () => {
    const selectedEntries = entries.filter(entry => selectedEntryIds.has(entry.id));
    const totalCost = selectedEntries.reduce((sum, entry) => sum + entry.amount, 0);
    const totalFuel = selectedEntries.reduce((sum, entry) => sum + entry.quantity, 0);

    return {
      count: selectedEntries.length,
      cost: Math.round(totalCost * 100) / 100,
      fuel: Math.round(totalFuel * 100) / 100,
    };
  };

  const handleDeleteSelected = () => {
    if (selectedEntryIds.size === 0) {
      Alert.alert('No Selection', 'Please select at least one entry to delete.');
      return;
    }

    const selectedStats = getSelectedStatistics();
    const selectedEntries = entries.filter(entry => selectedEntryIds.has(entry.id));

    // Create detailed confirmation message
    const vehicleDetails = selectedEntries.reduce((acc, entry) => {
      const vehicle = vehicles.find(v => v.id === entry.vehicleId);
      const vehicleName = vehicle?.name || 'Unknown Vehicle';
      if (!acc[vehicleName]) {
        acc[vehicleName] = 0;
      }
      acc[vehicleName]++;
      return acc;
    }, {} as Record<string, number>);

    const vehicleBreakdownText = Object.entries(vehicleDetails)
      .map(([name, count]) => `${name}: ${count}`)
      .join('\n');

    Alert.alert(
      'Delete Selected Fuel Entries',
      `You are about to delete ${selectedEntryIds.size} fuel entries with a total cost of $${selectedStats.cost.toFixed(2)}.

Entries by vehicle:
${vehicleBreakdownText}

This action cannot be undone. Are you sure?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: performBatchDeletion,
        },
      ]
    );
  };

  const performBatchDeletion = async () => {
    try {
      setDeleting(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

      const deletedCount = await FuelService.deleteBatch(Array.from(selectedEntryIds));

      if (deletedCount) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(
          'Success',
          `${selectedEntryIds.size} fuel entries have been deleted successfully.`
        );

        if (onDeleteComplete) {
          onDeleteComplete(selectedEntryIds.size);
        }
      } else {
        Alert.alert('Error', 'Failed to delete some entries. Please try again.');
      }
    } catch (error) {
      console.error('Error during batch deletion:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'An unexpected error occurred during deletion.');
    } finally {
      setDeleting(false);
      setSelectedEntryIds(new Set());
    }
  };

  const getVehicleName = (vehicleId: string): string => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    return vehicle?.name || 'Unknown Vehicle';
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <ThemedText style={[styles.loadingText, { color: colors.text }]}>
            Loading fuel entries...
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <ThemedText style={[styles.title, { color: colors.text }]}>
          Batch Delete Fuel Entries
        </ThemedText>
        <TouchableOpacity
          style={[styles.cancelButton, { backgroundColor: colors.surface }]}
          onPress={onCancel}
        >
          <IconSymbol name="xmark" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Statistics Summary */}
      {statistics && (
        <View style={[styles.summarySection, { backgroundColor: colors.surface }]}>
          <ThemedText style={[styles.summaryTitle, { color: colors.text }]}>
            Available Entries ({entries.length})
          </ThemedText>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <IconSymbol name="dollarsign.circle" size={20} color={colors.primary} />
              <ThemedText style={[styles.summaryValue, { color: colors.text }]}>
                ${statistics.totalCost.toFixed(2)}
              </ThemedText>
              <ThemedText style={[styles.summaryLabel, { color: colors.icon }]}>
                Total Cost
              </ThemedText>
            </View>
            <View style={styles.summaryItem}>
              <IconSymbol name="fuelpump.fill" size={20} color={colors.secondary} />
              <ThemedText style={[styles.summaryValue, { color: colors.text }]}>
                {statistics.totalFuel.toFixed(1)}
              </ThemedText>
              <ThemedText style={[styles.summaryLabel, { color: colors.icon }]}>
                Total Fuel
              </ThemedText>
            </View>
            <View style={styles.summaryItem}>
              <IconSymbol name="car.fill" size={20} color={colors.accent} />
              <ThemedText style={[styles.summaryValue, { color: colors.text }]}>
                {statistics.vehicleBreakdown.length}
              </ThemedText>
              <ThemedText style={[styles.summaryLabel, { color: colors.icon }]}>
                Vehicles
              </ThemedText>
            </View>
          </View>
        </View>
      )}

      {/* Selection Controls */}
      <View style={[styles.selectionControls, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[
            styles.selectAllButton,
            {
              backgroundColor: selectedEntryIds.size > 0 ? colors.primary : colors.surface,
              borderColor: selectedEntryIds.size > 0 ? colors.primary : colors.border,
            },
          ]}
          onPress={toggleAllSelections}
        >
          <IconSymbol
            name={selectedEntryIds.size === entries.length ? "checkmark.square.fill" : "square"}
            size={20}
            color={selectedEntryIds.size > 0 ? 'white' : colors.text}
          />
          <ThemedText
            style={[
              styles.selectAllText,
              { color: selectedEntryIds.size > 0 ? 'white' : colors.text },
            ]}
          >
            {selectedEntryIds.size === entries.length ? 'Deselect All' : 'Select All'}
          </ThemedText>
        </TouchableOpacity>

        {selectedEntryIds.size > 0 && (
          <View style={styles.selectedInfo}>
            <ThemedText style={[styles.selectedCount, { color: colors.text }]}>
              {selectedEntryIds.size} selected
            </ThemedText>
            <ThemedText style={[styles.selectedCost, { color: colors.primary }]}>
              (${getSelectedStatistics().cost.toFixed(2)})
            </ThemedText>
          </View>
        )}
      </View>

      {/* Entries List */}
      <ScrollView style={styles.entriesList} showsVerticalScrollIndicator={false}>
        {entries.map((entry) => {
          const vehicleName = getVehicleName(entry.vehicleId);
          const isSelected = selectedEntryIds.has(entry.id);

          return (
            <TouchableOpacity
              key={entry.id}
              style={[
                styles.entryItem,
                {
                  backgroundColor: isSelected ? colors.primary + '20' : colors.surface,
                  borderColor: isSelected ? colors.primary : colors.border,
                },
              ]}
              onPress={() => toggleEntrySelection(entry.id)}
            >
              <View style={styles.entryCheckbox}>
                <IconSymbol
                  name={isSelected ? "checkmark.circle.fill" : "circle"}
                  size={24}
                  color={isSelected ? colors.primary : colors.icon}
                />
              </View>

              <View style={styles.entryContent}>
                <View style={styles.entryHeader}>
                  <ThemedText style={[styles.entryDate, { color: colors.text }]}>
                    {formatDate(entry.date)}
                  </ThemedText>
                  <ThemedText style={[styles.entryCost, { color: colors.primary }]}>
                    ${entry.amount.toFixed(2)}
                  </ThemedText>
                </View>

                <View style={styles.entryDetails}>
                  <ThemedText style={[styles.entryVehicle, { color: colors.text }]}>
                    {vehicleName}
                  </ThemedText>
                  <ThemedText style={[styles.entryQuantity, { color: colors.icon }]}>
                    {entry.quantity.toFixed(1)} units @ ${entry.pricePerUnit.toFixed(2)}/unit
                  </ThemedText>
                </View>

                {entry.fuelStation && (
                  <ThemedText style={[styles.entryStation, { color: colors.icon }]}>
                    {entry.fuelStation}
                  </ThemedText>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Action Buttons */}
      {selectedEntryIds.size > 0 && (
        <View style={[styles.actionButtons, { borderTopColor: colors.border }]}>
          <TouchableOpacity
            style={[
              styles.deleteButton,
              {
                backgroundColor: colors.error,
                opacity: deleting ? 0.6 : 1,
              },
            ]}
            onPress={handleDeleteSelected}
            disabled={deleting}
          >
            {deleting ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <IconSymbol name="trash.fill" size={20} color="white" />
                <ThemedText style={styles.deleteButtonText}>
                  Delete {selectedEntryIds.size} {selectedEntryIds.size === 1 ? 'Entry' : 'Entries'}
                </ThemedText>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: Typography.sizes.body,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: Typography.sizes.title,
    fontWeight: Typography.weights.semibold,
  },
  cancelButton: {
    padding: Spacing.sm,
    borderRadius: Spacing.sm,
  },
  summarySection: {
    padding: Spacing.md,
    margin: Spacing.md,
    borderRadius: Spacing.card.borderRadius,
    shadowOffset: Spacing.card.shadowOffset,
    shadowOpacity: Spacing.card.shadowOpacity,
    shadowRadius: Spacing.card.shadowRadius,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: Typography.sizes.title,
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: Typography.sizes.title,
    fontWeight: Typography.weights.bold,
    marginVertical: Spacing.xs,
  },
  summaryLabel: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.medium,
  },
  selectionControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderBottomWidth: 1,
  },
  selectAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Spacing.card.borderRadius,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  selectAllText: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.medium,
  },
  selectedInfo: {
    alignItems: 'flex-end',
  },
  selectedCount: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.semibold,
  },
  selectedCost: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.medium,
  },
  entriesList: {
    flex: 1,
    padding: Spacing.md,
  },
  entryItem: {
    flexDirection: 'row',
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderRadius: Spacing.card.borderRadius,
    borderWidth: 1,
    shadowOffset: Spacing.card.shadowOffset,
    shadowOpacity: Spacing.card.shadowOpacity,
    shadowRadius: Spacing.card.shadowRadius,
    elevation: 2,
  },
  entryCheckbox: {
    marginRight: Spacing.md,
    justifyContent: 'center',
  },
  entryContent: {
    flex: 1,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },
  entryDate: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.semibold,
  },
  entryCost: {
    fontSize: Typography.sizes.title,
    fontWeight: Typography.weights.bold,
  },
  entryDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  entryVehicle: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.medium,
    flex: 1,
  },
  entryQuantity: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.normal,
  },
  entryStation: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.normal,
    fontStyle: 'italic',
  },
  actionButtons: {
    padding: Spacing.md,
    borderTopWidth: 1,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.padding.medium,
    paddingHorizontal: Spacing.padding.large,
    borderRadius: Spacing.card.borderRadius,
    gap: Spacing.sm,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.semibold,
  },
});