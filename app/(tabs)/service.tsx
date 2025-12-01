import React from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function ServiceScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  // Placeholder service records
  const serviceRecords = [
    {
      id: 1,
      date: '2024-10-15',
      vehicle: '2022 Tesla Model 3',
      type: 'Annual Inspection',
      cost: 125.00,
      mileage: '24,200',
      provider: 'Tesla Service Center',
      status: 'completed',
      nextDue: '2025-10-15',
    },
    {
      id: 2,
      date: '2024-09-20',
      vehicle: '2021 Honda CR-V',
      type: 'Oil Change',
      cost: 45.99,
      mileage: '42,000',
      provider: 'Quick Lube Express',
      status: 'completed',
      nextDue: '2025-01-20',
    },
    {
      id: 3,
      date: '2024-08-10',
      vehicle: '2021 Honda CR-V',
      type: 'Tire Rotation',
      cost: 25.00,
      mileage: '41,000',
      provider: 'Honda Dealership',
      status: 'completed',
      nextDue: '2024-12-10',
    },
    {
      id: 4,
      date: 'Upcoming',
      vehicle: '2021 Honda CR-V',
      type: 'Tire Rotation',
      cost: 'Est. $25-35',
      mileage: 'Expected: 43,500',
      provider: 'Pending',
      status: 'upcoming',
      nextDue: '2024-12-10',
    },
  ];

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <ThemedText style={[styles.title, { color: colors.text }]}>
            Service & Maintenance
          </ThemedText>
          <ThemedText style={[styles.subtitle, { color: colors.icon }]}>
            Track vehicle service history and schedule
          </ThemedText>
        </View>

        {/* Summary Cards */}
        <View style={styles.summarySection}>
          <View
            style={[
              styles.summaryCard,
              { backgroundColor: colors.warning },
            ]}
          >
            <IconSymbol name="wrench.fill" size={24} color="white" />
            <ThemedText style={styles.summaryValue}>2</ThemedText>
            <ThemedText style={styles.summaryLabel}>Upcoming</ThemedText>
          </View>
          <View
            style={[
              styles.summaryCard,
              { backgroundColor: colors.primary },
            ]}
          >
            <IconSymbol name="dollarsign.circle" size={24} color="white" />
            <ThemedText style={styles.summaryValue}>$195.99</ThemedText>
            <ThemedText style={styles.summaryLabel}>This Year</ThemedText>
          </View>
        </View>

        <View style={styles.serviceList}>
          <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
            Service Records
          </ThemedText>

          {serviceRecords.map((record) => (
            <View
              key={record.id}
              style={[
                styles.serviceCard,
                {
                  backgroundColor: colors.card,
                  borderColor:
                    record.status === 'upcoming'
                      ? colors.serviceDue
                      : colors.border,
                  shadowColor: colors.shadow,
                  borderWidth: record.status === 'upcoming' ? 2 : 1,
                },
              ]}
            >
              <View style={styles.serviceHeader}>
                <View style={styles.serviceInfo}>
                  <View style={styles.serviceTypeRow}>
                    <ThemedText
                      style={[
                        styles.serviceType,
                        { color: colors.text }
                      ]}
                    >
                      {record.type}
                    </ThemedText>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor:
                            record.status === 'completed'
                              ? colors.success
                              : colors.serviceDue,
                        },
                      ]}
                    >
                      <ThemedText style={styles.statusText}>
                        {record.status === 'completed' ? 'Completed' : 'Upcoming'}
                      </ThemedText>
                    </View>
                  </View>
                  <ThemedText style={[styles.serviceVehicle, { color: colors.icon }]}>
                    {record.vehicle}
                  </ThemedText>
                  <ThemedText style={[styles.serviceDate, { color: colors.icon }]}>
                    {record.date}
                  </ThemedText>
                </View>
                <View style={styles.serviceCost}>
                  <ThemedText style={[styles.cost, { color: colors.primary }]}>
                    {record.cost}
                  </ThemedText>
                </View>
              </View>

              <View style={styles.serviceDetails}>
                <View style={styles.detailItem}>
                  <IconSymbol name="location" size={14} color={colors.icon} />
                  <ThemedText style={[styles.detailValue, { color: colors.text }]}>
                    {record.provider}
                  </ThemedText>
                </View>
                <View style={styles.detailItem}>
                  <IconSymbol name="speedometer" size={14} color={colors.icon} />
                  <ThemedText style={[styles.detailValue, { color: colors.text }]}>
                    {record.mileage}
                  </ThemedText>
                </View>
                <View style={styles.detailItem}>
                  <IconSymbol name="calendar" size={14} color={colors.serviceDue} />
                  <ThemedText
                    style={[
                      styles.detailValue,
                      { color: colors.serviceDue }
                    ]}
                  >
                    Due: {record.nextDue}
                  </ThemedText>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Add Service Record Button Placeholder */}
        <View style={[styles.addButton, { backgroundColor: colors.primary }]}>
          <IconSymbol name="plus" size={24} color="white" />
          <ThemedText style={styles.addButtonText}>Add Service Record</ThemedText>
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
  serviceList: {
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  serviceCard: {
    padding: Spacing.card.padding,
    borderRadius: Spacing.card.borderRadius,
    shadowOffset: Spacing.card.shadowOffset,
    shadowOpacity: Spacing.card.shadowOpacity,
    shadowRadius: Spacing.card.shadowRadius,
    elevation: 3,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  serviceType: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.semibold,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs / 2,
    borderRadius: 12,
    marginLeft: Spacing.sm,
  },
  statusText: {
    color: 'white',
    fontSize: Typography.sizes.small,
    fontWeight: Typography.weights.semibold,
  },
  serviceVehicle: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.normal,
    marginBottom: Spacing.xs / 2,
  },
  serviceDate: {
    fontSize: Typography.sizes.small,
    fontWeight: Typography.weights.normal,
  },
  serviceCost: {
    alignItems: 'flex-end',
  },
  cost: {
    fontSize: Typography.sizes.title,
    fontWeight: Typography.weights.bold,
  },
  serviceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs / 2,
    flex: 1,
  },
  detailValue: {
    fontSize: Typography.sizes.small,
    fontWeight: Typography.weights.medium,
    flex: 1,
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