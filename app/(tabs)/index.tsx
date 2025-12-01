import React from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  // Dashboard summary data
  const dashboardData = {
    totalVehicles: 2,
    activeVehicles: 1,
    monthlyFuelCost: 146.95,
    upcomingServices: 2,
    totalMileage: 66530,
  };

  const recentActivity = [
    {
      id: 1,
      type: 'fuel',
      title: 'Fuel Fill-up',
      subtitle: 'Tesla Model 3 - $45.50',
      time: '2 hours ago',
      icon: 'fuelpump.fill',
      color: colors.primary,
    },
    {
      id: 2,
      type: 'service',
      title: 'Service Completed',
      subtitle: 'Honda CR-V - Oil Change',
      time: '1 day ago',
      icon: 'wrench.fill',
      color: colors.success,
    },
    {
      id: 3,
      type: 'alert',
      title: 'Service Due',
      subtitle: 'Tesla Model 3 - Annual Inspection',
      time: '3 days ago',
      icon: 'bell.fill',
      color: colors.warning,
    },
  ];

  const quickActions = [
    {
      id: 1,
      title: 'Add Fuel',
      icon: 'fuelpump.fill',
      color: colors.primary,
      route: '/fuel',
    },
    {
      id: 2,
      title: 'Schedule Service',
      icon: 'wrench.fill',
      color: colors.warning,
      route: '/service',
    },
    {
      id: 3,
      title: 'Add Vehicle',
      icon: 'car.fill',
      color: colors.success,
      route: '/vehicle',
    },
    {
      id: 4,
      title: 'View Reports',
      icon: 'chart.bar.fill',
      color: colors.secondary,
      route: '/reports',
    },
  ];

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <ThemedText style={[styles.welcomeText, { color: colors.icon }]}>
            Welcome back
          </ThemedText>
          <ThemedText style={[styles.title, { color: colors.text }]}>
            Vehicle Dashboard
          </ThemedText>
        </View>

        {/* Summary Cards Grid */}
        <View style={styles.summaryGrid}>
          <View
            style={[
              styles.summaryCard,
              { backgroundColor: colors.primary },
            ]}
          >
            <IconSymbol name="car.fill" size={24} color="white" />
            <ThemedText style={styles.summaryValue}>
              {dashboardData.totalVehicles}
            </ThemedText>
            <ThemedText style={styles.summaryLabel}>
              Total Vehicles
            </ThemedText>
            <View style={styles.activeIndicator}>
              <View
                style={[
                  styles.activeDot,
                  { backgroundColor: colors.vehicleOnline },
                ]}
              />
              <ThemedText style={styles.activeText}>
                {dashboardData.activeVehicles} active
              </ThemedText>
            </View>
          </View>

          <View
            style={[
              styles.summaryCard,
              { backgroundColor: colors.warning },
            ]}
          >
            <IconSymbol name="dollarsign.circle" size={24} color="white" />
            <ThemedText style={styles.summaryValue}>
              ${dashboardData.monthlyFuelCost}
            </ThemedText>
            <ThemedText style={styles.summaryLabel}>
              Monthly Fuel Cost
            </ThemedText>
          </View>

          <View
            style={[
              styles.summaryCard,
              { backgroundColor: colors.serviceDue },
            ]}
          >
            <IconSymbol name="wrench.fill" size={24} color="white" />
            <ThemedText style={styles.summaryValue}>
              {dashboardData.upcomingServices}
            </ThemedText>
            <ThemedText style={styles.summaryLabel}>
              Services Due
            </ThemedText>
          </View>

          <View
            style={[
              styles.summaryCard,
              { backgroundColor: colors.success },
            ]}
          >
            <IconSymbol name="speedometer" size={24} color="white" />
            <ThemedText style={styles.summaryValue}>
              {dashboardData.totalMileage.toLocaleString()}
            </ThemedText>
            <ThemedText style={styles.summaryLabel}>
              Total Mileage
            </ThemedText>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
            Quick Actions
          </ThemedText>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={[
                  styles.quickActionCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    shadowColor: colors.shadow,
                  },
                ]}
              >
                <View
                  style={[
                    styles.quickActionIcon,
                    { backgroundColor: action.color + '20' },
                  ]}
                >
                  <IconSymbol
                    name={action.icon as any}
                    size={24}
                    color={action.color}
                  />
                </View>
                <ThemedText
                  style={[styles.quickActionTitle, { color: colors.text }]}
                >
                  {action.title}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
            Recent Activity
          </ThemedText>
          <View style={styles.activityList}>
            {recentActivity.map((activity) => (
              <View
                key={activity.id}
                style={[
                  styles.activityCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    shadowColor: colors.shadow,
                  },
                ]}
              >
                <View
                  style={[
                    styles.activityIcon,
                    { backgroundColor: activity.color + '20' },
                  ]}
                >
                  <IconSymbol
                    name={activity.icon as any}
                    size={20}
                    color={activity.color}
                  />
                </View>
                <View style={styles.activityContent}>
                  <ThemedText
                    style={[styles.activityTitle, { color: colors.text }]}
                  >
                    {activity.title}
                  </ThemedText>
                  <ThemedText
                    style={[styles.activitySubtitle, { color: colors.icon }]}
                  >
                    {activity.subtitle}
                  </ThemedText>
                </View>
                <ThemedText
                  style={[styles.activityTime, { color: colors.icon }]}
                >
                  {activity.time}
                </ThemedText>
              </View>
            ))}
          </View>
        </View>

        {/* Bottom padding to account for navigation */}
        <View style={{ height: Spacing.navigation.tabBarHeight + Spacing.lg }} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
  },
  header: {
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.lg,
    alignItems: 'flex-start',
  },
  welcomeText: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.normal,
    marginBottom: Spacing.xs,
  },
  title: {
    fontSize: Typography.sizes.xxxl,
    fontWeight: Typography.weights.bold,
  },
  section: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.sizes.title,
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing.md,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  summaryCard: {
    width: '48%',
    padding: Spacing.md,
    borderRadius: Spacing.card.borderRadius,
    minHeight: 120,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryValue: {
    color: 'white',
    fontSize: Typography.sizes.xxxl,
    fontWeight: Typography.weights.bold,
    marginVertical: Spacing.xs,
  },
  summaryLabel: {
    color: 'white',
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.medium,
    textAlign: 'center',
  },
  activeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
    gap: Spacing.xs,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  activeText: {
    color: 'white',
    fontSize: Typography.sizes.small,
    fontWeight: Typography.weights.normal,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  quickActionCard: {
    width: '48%',
    padding: Spacing.md,
    borderRadius: Spacing.card.borderRadius,
    borderWidth: 1,
    shadowOffset: Spacing.card.shadowOffset,
    shadowOpacity: Spacing.card.shadowOpacity,
    shadowRadius: Spacing.card.shadowRadius,
    elevation: 2,
    alignItems: 'center',
    minHeight: 90,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  quickActionTitle: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.medium,
    textAlign: 'center',
  },
  activityList: {
    gap: Spacing.sm,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Spacing.card.borderRadius,
    borderWidth: 1,
    shadowOffset: Spacing.card.shadowOffset,
    shadowOpacity: Spacing.card.shadowOpacity,
    shadowRadius: Spacing.card.shadowRadius,
    elevation: 2,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing.xs / 2,
  },
  activitySubtitle: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.normal,
  },
  activityTime: {
    fontSize: Typography.sizes.small,
    fontWeight: Typography.weights.normal,
  },
});
