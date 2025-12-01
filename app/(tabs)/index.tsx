import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { DashboardSummary, RecentActivity } from '@/types/data';
import { VehicleService, FuelService, ServiceService, DashboardService } from '@/services/index';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();

  const [dashboardData, setDashboardData] = useState<DashboardSummary>({
    totalVehicles: 0,
    activeVehicles: 0,
    monthlyFuelCost: 0,
    upcomingServices: 0,
    totalMileage: 0,
  });

  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [summary, activity] = await Promise.all([
        DashboardService.getSummary(),
        DashboardService.getRecentActivity(10),
      ]);

      setDashboardData(summary);
      setRecentActivity(activity);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Silently fail for dashboard - don't show alerts on home screen
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

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
      route: '/explore', // Use explore as reports since it exists
    },
  ];

  const handleQuickAction = (route: string) => {
    router.push(route as any);
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
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
              ${dashboardData.monthlyFuelCost.toFixed(0)}
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
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickActionsGrid}
          >
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
                onPress={() => handleQuickAction(action.route)}
              >
                <View
                  style={[
                    styles.quickActionIcon,
                    { backgroundColor: action.color + '20' },
                  ]}
                >
                  <IconSymbol
                    name={action.icon as any}
                    size={20}
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
          </ScrollView>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
            Recent Activity
          </ThemedText>

          {recentActivity.length === 0 ? (
            <View style={styles.emptyActivityState}>
              <IconSymbol
                name="clock.arrow.circlepath"
                size={48}
                color={colors.icon}
                style={styles.emptyActivityIcon}
              />
              <ThemedText style={[styles.emptyActivityTitle, { color: colors.text }]}>
                No Recent Activity
              </ThemedText>
              <ThemedText style={[styles.emptyActivitySubtitle, { color: colors.icon }]}>
                Start tracking your vehicles to see recent activity here
              </ThemedText>
            </View>
          ) : (
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
          )}
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
    padding: Spacing.cardCompact.padding,
    borderRadius: Spacing.cardCompact.borderRadius,
    minHeight: Spacing.cardCompact.minHeight,
    shadowOffset: Spacing.cardCompact.shadowOffset,
    shadowOpacity: Spacing.cardCompact.shadowOpacity,
    shadowRadius: Spacing.cardCompact.shadowRadius,
    elevation: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryValue: {
    color: 'white',
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    marginVertical: Spacing.xs / 3,
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
    gap: Spacing.sm,
  },
  quickActionCard: {
    width: 80,
    padding: Spacing.quickActionCompact.padding,
    borderRadius: Spacing.quickActionCompact.borderRadius,
    borderWidth: 1,
    shadowOffset: Spacing.quickActionCompact.shadowOffset,
    shadowOpacity: Spacing.quickActionCompact.shadowOpacity,
    shadowRadius: Spacing.quickActionCompact.shadowRadius,
    elevation: 2,
    alignItems: 'center',
    minHeight: Spacing.quickActionCompact.minHeight,
  },
  quickActionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
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
  emptyActivityState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl,
  },
  emptyActivityIcon: {
    marginBottom: Spacing.md,
    opacity: 0.5,
  },
  emptyActivityTitle: {
    fontSize: Typography.sizes.title,
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  emptyActivitySubtitle: {
    fontSize: Typography.sizes.body,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },
});
