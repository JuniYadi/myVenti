import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { FuelEntry, Vehicle, VehicleType } from '@/types/data';
import { FuelService, VehicleService, DashboardService } from '@/services/index';
import { FuelForm } from '@/components/forms/FuelForm';
import { FormModal } from '@/components/modals/FormModal';

export default function FuelScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [fuelEntries, setFuelEntries] = useState<FuelEntry[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEntry, setEditingEntry] = useState<FuelEntry | null>(null);
  const [monthlyTotal, setMonthlyTotal] = useState(0);
  const [avgMPG, setAvgMPG] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [entries, vehicleList, monthlyCost] = await Promise.all([
        FuelService.getAll(),
        VehicleService.getAll(),
        FuelService.getMonthlyTotal(),
      ]);

      setFuelEntries(entries);
      setVehicles(vehicleList);
      setMonthlyTotal(monthlyCost);

      // Calculate average MPG for gas vehicles only
      const gasEntries = entries.filter(entry => {
        const vehicle = vehicleList.find(v => v.id === entry.vehicleId);
        return vehicle && vehicle.type !== 'electric' && entry.mpg && entry.mpg > 0;
      });

      if (gasEntries.length > 0) {
        const totalMPG = gasEntries.reduce((sum, entry) => sum + (entry.mpg || 0), 0);
        setAvgMPG(Math.round((totalMPG / gasEntries.length) * 10) / 10);
      } else {
        setAvgMPG(null);
      }
    } catch (error) {
      console.error('Error loading fuel data:', error);
      Alert.alert('Error', 'Failed to load fuel data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleAddEntry = () => {
    setEditingEntry(null);
    setModalVisible(true);
  };

  const handleEditEntry = (entry: FuelEntry) => {
    setEditingEntry(entry);
    setModalVisible(true);
  };

  const handleDeleteEntry = (entry: FuelEntry) => {
    const vehicle = vehicles.find(v => v.id === entry.vehicleId);
    const vehicleName = vehicle ? vehicle.name : 'Unknown Vehicle';

    Alert.alert(
      'Delete Fuel Entry',
      `Are you sure you want to delete the fuel entry for ${vehicleName} on ${entry.date}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await FuelService.delete(entry.id);
              Alert.alert('Success', 'Fuel entry deleted successfully');
              loadData();
            } catch (error) {
              console.error('Error deleting fuel entry:', error);
              Alert.alert('Error', 'Failed to delete fuel entry');
            }
          },
        },
      ]
    );
  };

  const handleFuelSubmit = async (formData: any) => {
    try {
      if (editingEntry) {
        // Note: Update functionality would need to be implemented in FuelService
        Alert.alert('Info', 'Edit functionality coming soon');
      } else {
        await FuelService.create(formData);
        Alert.alert('Success', 'Fuel entry added successfully');
      }
      setModalVisible(false);
      loadData();
    } catch (error) {
      console.error('Error saving fuel entry:', error);
      throw error; // Let the form handle the error
    }
  };

  const getVehicleName = (vehicleId: string) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    return vehicle ? vehicle.name : 'Unknown Vehicle';
  };

  const getVehicleType = (vehicleId: string) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    return vehicle ? vehicle.type : 'gas';
  };

  const formatQuantity = (entry: FuelEntry) => {
    const vehicleType = getVehicleType(entry.vehicleId);
    const quantity = entry.quantity.toFixed(2);
    return vehicleType === 'electric' ? `${quantity} kWh` : `${quantity} gal`;
  };

  const formatPriceLabel = (entry: FuelEntry) => {
    const vehicleType = getVehicleType(entry.vehicleId);
    return vehicleType === 'electric' ? 'Price/kWh' : 'Price/Gal';
  };

  const formatMPG = (entry: FuelEntry) => {
    const vehicleType = getVehicleType(entry.vehicleId);
    if (vehicleType === 'electric') {
      return 'N/A (Electric)';
    }
    return entry.mpg ? entry.mpg.toFixed(1) : 'N/A';
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.header}>
          <ThemedText style={[styles.title, { color: colors.text }]}>
            Fuel Tracking
          </ThemedText>
          <ThemedText style={[styles.subtitle, { color: colors.icon }]}>
            Monitor fuel consumption and expenses
          </ThemedText>
        </View>

        {/* Summary Cards */}
        <View style={styles.summarySection}>
          <View
            style={[
              styles.summaryCard,
              { backgroundColor: colors.primary },
            ]}
          >
            <IconSymbol name="fuelpump.fill" size={24} color="white" />
            <ThemedText style={styles.summaryValue}>
              ${monthlyTotal.toFixed(2)}
            </ThemedText>
            <ThemedText style={styles.summaryLabel}>This Month</ThemedText>
          </View>
          <View
            style={[
              styles.summaryCard,
              { backgroundColor: colors.success },
            ]}
          >
            <IconSymbol name="speedometer" size={24} color="white" />
            <ThemedText style={styles.summaryValue}>
              {avgMPG !== null ? avgMPG.toFixed(1) : 'N/A'}
            </ThemedText>
            <ThemedText style={styles.summaryLabel}>Avg MPG</ThemedText>
          </View>
        </View>

        {fuelEntries.length === 0 && !loading ? (
          <View style={styles.emptyState}>
            <IconSymbol
              name="fuelpump.fill"
              size={64}
              color={colors.icon}
              style={styles.emptyIcon}
            />
            <ThemedText style={[styles.emptyTitle, { color: colors.text }]}>
              No Fuel Entries Yet
            </ThemedText>
            <ThemedText style={[styles.emptySubtitle, { color: colors.icon }]}>
              Add your first fuel entry to start tracking consumption and expenses
            </ThemedText>
          </View>
        ) : (
          <View style={styles.fuelList}>
            <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
              Recent Fill-ups
            </ThemedText>

            {fuelEntries.map((entry) => (
              <TouchableOpacity
                key={entry.id}
                style={[
                  styles.fuelCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    shadowColor: colors.shadow,
                  },
                ]}
                onLongPress={() => handleDeleteEntry(entry)}
                delayLongPress={500}
              >
                <View style={styles.fuelHeader}>
                  <View style={styles.fuelInfo}>
                    <ThemedText style={[styles.fuelDate, { color: colors.text }]}>
                      {entry.date}
                    </ThemedText>
                    <ThemedText style={[styles.fuelVehicle, { color: colors.icon }]}>
                      {getVehicleName(entry.vehicleId)}
                    </ThemedText>
                  </View>
                  <View style={styles.fuelAmount}>
                    <ThemedText style={[styles.amount, { color: colors.primary }]}>
                      ${entry.amount.toFixed(2)}
                    </ThemedText>
                    <ThemedText style={[styles.gallons, { color: colors.icon }]}>
                      {formatQuantity(entry)}
                    </ThemedText>
                  </View>
                </View>

                <View style={styles.fuelDetails}>
                  <View style={styles.detailItem}>
                    <ThemedText style={[styles.detailLabel, { color: colors.icon }]}>
                      {formatPriceLabel(entry)}
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
                      MPG
                    </ThemedText>
                    <ThemedText style={[styles.detailValue, { color: colors.text }]}>
                      {formatMPG(entry)}
                    </ThemedText>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Add Fuel Entry Button */}
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={handleAddEntry}
        >
          <IconSymbol name="plus" size={24} color="white" />
          <ThemedText style={styles.addButtonText}>Add Fuel Entry</ThemedText>
        </TouchableOpacity>
      </ScrollView>

      {/* Fuel Form Modal */}
      <FormModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={editingEntry ? 'Edit Fuel Entry' : 'Add Fuel Entry'}
      >
        <FuelForm
          fuelEntry={editingEntry}
          onSubmit={handleFuelSubmit}
          onCancel={() => setModalVisible(false)}
          submitButtonText={editingEntry ? 'Update Entry' : 'Add Entry'}
        />
      </FormModal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: Spacing.navigation.tabBarHeight + Spacing.md,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: Spacing.md,
  },
  header: {
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    alignItems: 'flex-start',
  },
  title: {
    fontSize: Typography.sizes.heading,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.normal,
  },
  summarySection: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  summaryCard: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: Spacing.card.borderRadius,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryValue: {
    color: 'white',
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    marginVertical: Spacing.xs,
  },
  summaryLabel: {
    color: 'white',
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.medium,
  },
  sectionTitle: {
    fontSize: Typography.sizes.title,
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing.md,
  },
  fuelList: {
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  fuelCard: {
    padding: Spacing.card.padding,
    borderRadius: Spacing.card.borderRadius,
    borderWidth: 1,
    shadowOffset: Spacing.card.shadowOffset,
    shadowOpacity: Spacing.card.shadowOpacity,
    shadowRadius: Spacing.card.shadowRadius,
    elevation: 3,
  },
  fuelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  fuelInfo: {
    flex: 1,
  },
  fuelDate: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing.xs,
  },
  fuelVehicle: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.normal,
  },
  fuelAmount: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: Typography.sizes.title,
    fontWeight: Typography.weights.bold,
  },
  gallons: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.medium,
  },
  fuelDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailItem: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: Typography.sizes.small,
    fontWeight: Typography.weights.normal,
    marginBottom: Spacing.xs / 2,
  },
  detailValue: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.medium,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.padding.medium,
    paddingHorizontal: Spacing.padding.large,
    borderRadius: Spacing.card.borderRadius,
    gap: Spacing.sm,
    marginVertical: Spacing.lg,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    color: 'white',
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.semibold,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
    marginTop: Spacing.xxl,
  },
  emptyIcon: {
    marginBottom: Spacing.md,
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: Typography.sizes.title,
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: Typography.sizes.body,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },
});