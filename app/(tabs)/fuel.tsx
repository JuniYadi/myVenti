import React from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function FuelScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  // Placeholder fuel entries
  const fuelEntries = [
    {
      id: 1,
      date: '2024-11-28',
      vehicle: '2022 Tesla Model 3',
      amount: 45.50,
      gallons: 13.2,
      pricePerGallon: 3.45,
      mileage: '24,350',
      mpg: 'N/A (Electric)',
    },
    {
      id: 2,
      date: '2024-11-20',
      vehicle: '2021 Honda CR-V',
      amount: 52.80,
      gallons: 15.5,
      pricePerGallon: 3.41,
      mileage: '41,850',
      mpg: 28.5,
    },
    {
      id: 3,
      date: '2024-11-12',
      vehicle: '2021 Honda CR-V',
      amount: 48.75,
      gallons: 14.3,
      pricePerGallon: 3.41,
      mileage: '41,450',
      mpg: 27.9,
    },
  ];

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
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
            <ThemedText style={styles.summaryValue}>$146.95</ThemedText>
            <ThemedText style={styles.summaryLabel}>This Month</ThemedText>
          </View>
          <View
            style={[
              styles.summaryCard,
              { backgroundColor: colors.success },
            ]}
          >
            <IconSymbol name="speedometer" size={24} color="white" />
            <ThemedText style={styles.summaryValue}>28.2</ThemedText>
            <ThemedText style={styles.summaryLabel}>Avg MPG</ThemedText>
          </View>
        </View>

        <View style={styles.fuelList}>
          <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
            Recent Fill-ups
          </ThemedText>

          {fuelEntries.map((entry) => (
            <View
              key={entry.id}
              style={[
                styles.fuelCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  shadowColor: colors.shadow,
                },
              ]}
            >
              <View style={styles.fuelHeader}>
                <View style={styles.fuelInfo}>
                  <ThemedText style={[styles.fuelDate, { color: colors.text }]}>
                    {entry.date}
                  </ThemedText>
                  <ThemedText style={[styles.fuelVehicle, { color: colors.icon }]}>
                    {entry.vehicle}
                  </ThemedText>
                </View>
                <View style={styles.fuelAmount}>
                  <ThemedText style={[styles.amount, { color: colors.primary }]}>
                    ${entry.amount.toFixed(2)}
                  </ThemedText>
                  <ThemedText style={[styles.gallons, { color: colors.icon }]}>
                    {entry.gallons} gal
                  </ThemedText>
                </View>
              </View>

              <View style={styles.fuelDetails}>
                <View style={styles.detailItem}>
                  <ThemedText style={[styles.detailLabel, { color: colors.icon }]}>
                    Price/Gal
                  </ThemedText>
                  <ThemedText style={[styles.detailValue, { color: colors.text }]}>
                    ${entry.pricePerGallon}
                  </ThemedText>
                </View>
                <View style={styles.detailItem}>
                  <ThemedText style={[styles.detailLabel, { color: colors.icon }]}>
                    Mileage
                  </ThemedText>
                  <ThemedText style={[styles.detailValue, { color: colors.text }]}>
                    {entry.mileage}
                  </ThemedText>
                </View>
                <View style={styles.detailItem}>
                  <ThemedText style={[styles.detailLabel, { color: colors.icon }]}>
                    MPG
                  </ThemedText>
                  <ThemedText style={[styles.detailValue, { color: colors.text }]}>
                    {entry.mpg}
                  </ThemedText>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Add Fuel Entry Button Placeholder */}
        <View style={[styles.addButton, { backgroundColor: colors.primary }]}>
          <IconSymbol name="plus" size={24} color="white" />
          <ThemedText style={styles.addButtonText}>Add Fuel Entry</ThemedText>
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
});