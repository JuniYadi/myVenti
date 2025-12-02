import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { DashboardService, VehicleService } from '@/services/index';
import { DashboardSummary, RecentActivity, VehicleFormData } from '@/types/data';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

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
  const [refreshing, setRefreshing] = useState(false);
  const [vehicleModalVisible, setVehicleModalVisible] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
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
    if (route === '/vehicle') {
      // Open vehicle form modal directly instead of navigating
      setVehicleModalVisible(true);
    } else {
      router.push(route as any);
    }
  };

  const handleVehicleSubmit = async (formData: VehicleFormData) => {
    try {
      await VehicleService.create(formData);
      Alert.alert('Success', 'Vehicle added successfully');
      setVehicleModalVisible(false);
      // Refresh dashboard data to show new vehicle
      loadDashboardData();
    } catch (error) {
      console.error('Error saving vehicle:', error);
      Alert.alert('Error', 'Failed to save vehicle. Please try again.');
    }
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

        {/* Summary Cards - Compact Grid */}
        <View style={styles.summaryGrid}>
          <View
            style={[
              styles.summaryCard,
              { backgroundColor: colors.primary },
            ]}
          >
            <ThemedText style={styles.summaryValue}>
              {dashboardData.totalVehicles}
            </ThemedText>
            <ThemedText style={styles.summaryLabel}>
              Total Vehicles
            </ThemedText>
          </View>

          <View
            style={[
              styles.summaryCard,
              { backgroundColor: colors.warning },
            ]}
          >
            <ThemedText style={styles.summaryValue}>
              ${dashboardData.monthlyFuelCost.toFixed(0)}
            </ThemedText>
            <ThemedText style={styles.summaryLabel}>
              Fuel Cost
            </ThemedText>
          </View>

          <View
            style={[
              styles.summaryCard,
              { backgroundColor: colors.serviceDue },
            ]}
          >
            <ThemedText style={styles.summaryValue}>
              {dashboardData.upcomingServices}
            </ThemedText>
            <ThemedText style={styles.summaryLabel}>
              Service Due
            </ThemedText>
          </View>

          <View
            style={[
              styles.summaryCard,
              { backgroundColor: colors.success },
            ]}
          >
            <ThemedText style={styles.summaryValue}>
              {dashboardData.totalMileage > 1000
                ? `${(dashboardData.totalMileage / 1000).toFixed(1)}k`
                : dashboardData.totalMileage.toString()
              }
            </ThemedText>
            <ThemedText style={styles.summaryLabel}>
              Mileage
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
          </View>
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

      {/* TODO: Vehicle form now uses dedicated screen */}
      {/* <FormModal
        visible={vehicleModalVisible}
        onClose={() => setVehicleModalVisible(false)}
        title="Add New Vehicle"
      >
        <VehicleForm
          onSubmit={handleVehicleSubmit}
          onCancel={() => setVehicleModalVisible(false)}
          submitButtonText="Add Vehicle"
        />
      </FormModal> */}
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
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  summaryCard: {
    width: '48%', // 2x2 grid layout
    padding: Spacing.sm,
    borderRadius: 8,
    minHeight: 80, // More compact height
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryValue: {
    color: 'white',
    fontSize: 18, // Smaller for compact layout
    fontWeight: Typography.weights.bold,
    marginVertical: 1,
  },
  summaryLabel: {
    color: 'white',
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.medium,
    textAlign: 'center',
    marginTop: 1,
  },
  activeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 2,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  activeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: Typography.weights.normal,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  quickActionCard: {
    width: '48%', // 2x2 grid on larger screens
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
    width: 32, // Slightly smaller for compact layout
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs / 2, // Reduced spacing for compact layout
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
