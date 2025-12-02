import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Vehicle, VehicleType } from '@/types/data';
import { VehicleService } from '@/services/index';

export default function VehicleScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const vehicleList = await VehicleService.getAll();
      setVehicles(vehicleList);
    } catch (error) {
      console.error('Error loading vehicles:', error);
      Alert.alert('Error', 'Failed to load vehicles');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadVehicles();
  };

  const handleAddVehicle = () => {
    router.push('/vehicle-form');
  };

  const handleEditVehicle = (vehicle: Vehicle) => {
    router.push(`/vehicle-form?vehicleId=${vehicle.id}`);
  };

  const handleDeleteVehicle = (vehicle: Vehicle) => {
    Alert.alert(
      'Delete Vehicle',
      `Are you sure you want to delete "${vehicle.name}"? This will also delete all related fuel entries and service records.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await VehicleService.delete(vehicle.id);
              Alert.alert('Success', 'Vehicle deleted successfully');
              loadVehicles();
            } catch (error) {
              console.error('Error deleting vehicle:', error);
              Alert.alert('Error', 'Failed to delete vehicle');
            }
          },
        },
      ]
    );
  };

  
  const getVehicleIcon = (type: VehicleType) => {
    switch (type) {
      case 'electric':
        return 'bolt.fill';
      case 'hybrid':
        return 'leaf.fill';
      default:
        return 'car.fill';
    }
  };

  const formatMileage = (mileage?: number) => {
    if (!mileage) return 'Unknown';
    return mileage.toLocaleString();
  };

  const getVehicleDisplayName = (vehicle: Vehicle) => {
    return `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
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
            My Vehicles
          </ThemedText>
          <ThemedText style={[styles.subtitle, { color: colors.icon }]}>
            Manage and track your vehicles
          </ThemedText>
        </View>

        {vehicles.length === 0 && !loading ? (
          <View style={styles.emptyState}>
            <IconSymbol
              name="car.fill"
              size={64}
              color={colors.icon}
              style={styles.emptyIcon}
            />
            <ThemedText style={[styles.emptyTitle, { color: colors.text }]}>
              No Vehicles Yet
            </ThemedText>
            <ThemedText style={[styles.emptySubtitle, { color: colors.icon }]}>
              Add your first vehicle to start tracking fuel and service records
            </ThemedText>
          </View>
        ) : (
          <View style={styles.vehicleList}>
            {vehicles.map((vehicle) => (
              <TouchableOpacity
                key={vehicle.id}
                style={[
                  styles.vehicleCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    shadowColor: colors.shadow,
                  },
                ]}
                onLongPress={() => handleEditVehicle(vehicle)}
                delayLongPress={500}
              >
                <View style={styles.vehicleHeader}>
                  <View style={styles.vehicleInfo}>
                    <ThemedText style={[styles.vehicleName, { color: colors.text }]}>
                      {vehicle.name}
                    </ThemedText>
                    <ThemedText style={[styles.vehicleDetails, { color: colors.icon }]}>
                      {getVehicleDisplayName(vehicle)}
                    </ThemedText>
                    <View style={styles.statusRow}>
                      <View
                        style={[
                          styles.statusIndicator,
                          {
                            backgroundColor:
                              vehicle.status === 'active'
                                ? colors.vehicleOnline
                                : colors.vehicleOffline,
                          },
                        ]}
                      />
                      <ThemedText
                        style={[
                          styles.statusText,
                          {
                            color:
                              vehicle.status === 'active'
                                ? colors.vehicleOnline
                                : colors.vehicleOffline,
                          },
                        ]}
                      >
                        {vehicle.status === 'active' ? 'Active' : 'Inactive'}
                      </ThemedText>
                    </View>
                  </View>
                  <View style={styles.vehicleIconContainer}>
                    <IconSymbol
                      name={getVehicleIcon(vehicle.type)}
                      size={32}
                      color={colors.tabIconDefault}
                    />
                  </View>
                </View>

                <View style={styles.vehicleStats}>
                  <View style={styles.statItem}>
                    <IconSymbol name="speedometer" size={16} color={colors.icon} />
                    <ThemedText style={[styles.statText, { color: colors.text }]}>
                      Unknown mi
                    </ThemedText>
                  </View>
                  <View style={styles.statItem}>
                    <IconSymbol name="calendar" size={16} color={colors.icon} />
                    <ThemedText style={[styles.statText, { color: colors.text }]}>
                      Added {new Date(vehicle.createdAt).toLocaleDateString()}
                    </ThemedText>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Add Vehicle Button */}
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={handleAddVehicle}
        >
          <IconSymbol name="plus" size={24} color="white" />
          <ThemedText style={styles.addButtonText}>Add Vehicle</ThemedText>
        </TouchableOpacity>
      </ScrollView>
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
  vehicleList: {
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  vehicleCard: {
    padding: Spacing.card.padding,
    borderRadius: Spacing.card.borderRadius,
    borderWidth: 1,
    shadowOffset: Spacing.card.shadowOffset,
    shadowOpacity: Spacing.card.shadowOpacity,
    shadowRadius: Spacing.card.shadowRadius,
    elevation: 3,
  },
  vehicleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleName: {
    fontSize: Typography.sizes.title,
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing.xs,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.medium,
  },
  vehicleStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statText: {
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
  vehicleDetails: {
    fontSize: Typography.sizes.caption,
    marginTop: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  vehicleIconContainer: {
    backgroundColor: '#f2f2f7',
    padding: Spacing.sm,
    borderRadius: 12,
  },
});