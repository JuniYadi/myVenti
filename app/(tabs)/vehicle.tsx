import React from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function VehicleScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  // Placeholder vehicle data
  const vehicles = [
    {
      id: 1,
      name: '2022 Tesla Model 3',
      status: 'online',
      fuel: 85,
      mileage: '24,350',
      lastService: '2024-10-15',
    },
    {
      id: 2,
      name: '2021 Honda CR-V',
      status: 'offline',
      fuel: 60,
      mileage: '42,180',
      lastService: '2024-09-20',
    },
  ];

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <ThemedText style={[styles.title, { color: colors.text }]}>
            My Vehicles
          </ThemedText>
          <ThemedText style={[styles.subtitle, { color: colors.icon }]}>
            Manage and track your vehicles
          </ThemedText>
        </View>

        <View style={styles.vehicleList}>
          {vehicles.map((vehicle) => (
            <View
              key={vehicle.id}
              style={[
                styles.vehicleCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  shadowColor: colors.shadow,
                },
              ]}
            >
              <View style={styles.vehicleHeader}>
                <View style={styles.vehicleInfo}>
                  <ThemedText style={[styles.vehicleName, { color: colors.text }]}>
                    {vehicle.name}
                  </ThemedText>
                  <View style={styles.statusRow}>
                    <View
                      style={[
                        styles.statusIndicator,
                        {
                          backgroundColor:
                            vehicle.status === 'online'
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
                            vehicle.status === 'online'
                              ? colors.vehicleOnline
                              : colors.vehicleOffline,
                        },
                      ]}
                    >
                      {vehicle.status === 'online' ? 'Active' : 'Offline'}
                    </ThemedText>
                  </View>
                </View>
                <IconSymbol
                  name="car.fill"
                  size={32}
                  color={colors.tabIconDefault}
                />
              </View>

              <View style={styles.vehicleStats}>
                <View style={styles.statItem}>
                  <IconSymbol
                    name="fuelpump.fill"
                    size={16}
                    color={vehicle.fuel < 30 ? colors.fuelLow : colors.icon}
                  />
                  <ThemedText style={[styles.statText, { color: colors.text }]}>
                    {vehicle.fuel}%
                  </ThemedText>
                </View>
                <View style={styles.statItem}>
                  <IconSymbol name="speedometer" size={16} color={colors.icon} />
                  <ThemedText style={[styles.statText, { color: colors.text }]}>
                    {vehicle.mileage} mi
                  </ThemedText>
                </View>
                <View style={styles.statItem}>
                  <IconSymbol name="wrench.fill" size={16} color={colors.icon} />
                  <ThemedText style={[styles.statText, { color: colors.text }]}>
                    {vehicle.lastService}
                  </ThemedText>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Add Vehicle Button Placeholder */}
        <View style={[styles.addButton, { backgroundColor: colors.primary }]}>
          <IconSymbol name="plus" size={24} color="white" />
          <ThemedText style={styles.addButtonText}>Add Vehicle</ThemedText>
        </View>
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
});