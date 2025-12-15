/**
 * FuelAnalyticsScreen - Comprehensive analytics and reporting interface
 * Provides visual charts, trend analysis, and vehicle comparison for fuel management
 */

import { ChartConfig, FuelAnalyticsChart } from '@/components/fuel/FuelAnalyticsChart';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { FuelService, VehicleService } from '@/services/index';
import { FuelEntry, Vehicle } from '@/types/data';
import CustomDateTimePicker, { CustomDateTimePickerRef } from '@/components/ui/CustomDateTimePicker';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

interface AnalyticsData {
  monthlyStats: {
    totalCost: number;
    totalFuel: number;
    averageMPG: number;
    tripsCount: number;
    vehicleCount: number;
  };
  trends: {
    costByMonth: Array<{ month: string; cost: number; fuel: number }>;
    mpgByMonth: Array<{ month: string; mpg: number; vehicleId: string; vehicleName: string }>;
    consumptionByDay: Array<{ day: string; amount: number; vehicleType: string }>;
  };
  vehicleComparison: Array<{
    vehicleId: string;
    vehicleName: string;
    totalCost: number;
    totalFuel: number;
    averageMPG: number;
    tripsCount: number;
  }>;
}

export default function FuelAnalyticsScreen() {
  const router = useRouter();
  const { startDate: startDateParam, endDate: endDateParam } = useLocalSearchParams<{
    startDate?: string;
    endDate?: string;
  }>();

  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];
  const { regionConfig } = useRegion();

  const [loading, setLoading] = useState(true);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [fuelEntries, setFuelEntries] = useState<FuelEntry[]>([]);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);

  const startDateRef = React.useRef<CustomDateTimePickerRef>(null);
  const endDateRef = React.useRef<CustomDateTimePickerRef>(null);
  const [startDate, setStartDate] = useState<Date>(
    startDateParam ? new Date(startDateParam) : new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );
  const [endDate, setEndDate] = useState<Date>(
    endDateParam ? new Date(endDateParam) : new Date()
  );

  const [selectedChart, setSelectedChart] = useState<'overview' | 'trends' | 'comparison'>('overview');
  const [expandedSections, setExpandedSections] = useState({
    overview: true,
    trends: true,
    comparison: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (vehicles.length > 0 && fuelEntries.length > 0) {
      calculateAnalytics();
    }
  }, [vehicles, fuelEntries, startDate, endDate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [vehicleList, entryList] = await Promise.all([
        VehicleService.getAll(),
        FuelService.getAll(),
      ]);

      const activeVehicles = vehicleList.filter(v => v.status === 'active');
      setVehicles(activeVehicles);
      setFuelEntries(entryList);
    } catch (error) {
      console.error('Error loading analytics data:', error);
      Alert.alert('Error', 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = () => {
    const filteredEntries = fuelEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= startDate && entryDate <= endDate;
    });

    // Calculate monthly stats
    const monthlyStats = {
      totalCost: filteredEntries.reduce((sum, entry) => sum + entry.amount, 0),
      totalFuel: filteredEntries.reduce((sum, entry) => sum + entry.quantity, 0),
      averageMPG: 0,
      tripsCount: filteredEntries.length,
      vehicleCount: vehicles.length,
    };

    // Calculate average MPG
    const gasEntries = filteredEntries.filter(entry => {
      const vehicle = vehicles.find(v => v.id === entry.vehicleId);
      return vehicle && vehicle.type !== 'electric' && entry.mpg && entry.mpg > 0;
    });

    if (gasEntries.length > 0) {
      monthlyStats.averageMPG = gasEntries.reduce((sum, entry) => sum + entry.mpg, 0) / gasEntries.length;
    }

    // Calculate trends
    const trends = {
      costByMonth: calculateMonthlyTrends(filteredEntries, 'cost'),
      mpgByMonth: calculateMPGTrends(filteredEntries),
      consumptionByDay: calculateDailyConsumption(filteredEntries),
    };

    // Calculate vehicle comparison
    const vehicleComparison = vehicles.map(vehicle => {
      const vehicleEntries = filteredEntries.filter(entry => entry.vehicleId === vehicle.id);
      const gasEntries = vehicleEntries.filter(entry => entry.mpg && entry.mpg > 0);

      return {
        vehicleId: vehicle.id,
        vehicleName: vehicle.name,
        totalCost: vehicleEntries.reduce((sum, entry) => sum + entry.amount, 0),
        totalFuel: vehicleEntries.reduce((sum, entry) => sum + entry.quantity, 0),
        averageMPG: gasEntries.length > 0 ? gasEntries.reduce((sum, entry) => sum + entry.mpg, 0) / gasEntries.length : 0,
        tripsCount: vehicleEntries.length,
      };
    });

    setAnalyticsData({
      monthlyStats,
      trends,
      vehicleComparison,
    });
  };

  const calculateMonthlyTrends = (entries: FuelEntry[], metric: 'cost' | 'fuel') => {
    const monthlyData = new Map<string, number>();

    entries.forEach(entry => {
      const monthKey = entry.date.substring(0, 7); // YYYY-MM
      const value = metric === 'cost' ? entry.amount : entry.quantity;
      monthlyData.set(monthKey, (monthlyData.get(monthKey) || 0) + value);
    });

    return Array.from(monthlyData.entries()).map(([month, value]) => ({
      month,
      cost: metric === 'cost' ? value : 0,
      fuel: metric === 'fuel' ? value : 0,
      [metric]: value,
    }));
  };

  const calculateMPGTrends = (entries: FuelEntry[]) => {
    const mpgData = new Map<string, { mpg: number; vehicleId: string; vehicleName: string }>();

    entries.forEach(entry => {
      const vehicle = vehicles.find(v => v.id === entry.vehicleId);
      if (!vehicle || vehicle.type === 'electric' || !entry.mpg) return;

      const monthKey = entry.date.substring(0, 7);
      const existing = mpgData.get(monthKey);

      if (!existing || entry.mpg > existing.mpg) {
        mpgData.set(monthKey, {
          mpg: entry.mpg,
          vehicleId: entry.vehicleId,
          vehicleName: vehicle.name,
        });
      }
    });

    return Array.from(mpgData.entries());
  };

  const calculateDailyConsumption = (entries: FuelEntry[]) => {
    const dailyData = new Map<string, { [key: string]: number }>();

    entries.forEach(entry => {
      const dayKey = entry.date.substring(0, 10); // YYYY-MM-DD
      const vehicle = vehicles.find(v => v.id === entry.vehicleId);
      const vehicleType = vehicle ? vehicle.type : 'gas';

      if (!dailyData.has(dayKey)) {
        dailyData.set(dayKey, {});
      }

      const dayData = dailyData.get(dayKey)!;
      dayData[vehicleType] = (dayData[vehicleType] || 0) + entry.quantity;
    });

    return Array.from(dailyData.entries()).map(([day, data]) => ({
      day,
      amount: Object.values(data).reduce((sum, val) => sum + val, 0),
      vehicleType: Object.entries(data).reduce((type, [typeKey]) =>
        parseFloat(typeKey) > data[type] ? typeKey : type, ''
      ),
    }));
  };

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    if (selectedDate && event.type === 'set') {
      setStartDate(selectedDate);
      const dateStr = selectedDate.toISOString().split('T')[0];
      router.replace(`/fuel/analytics?startDate=${dateStr}&endDate=${endDate.toISOString().split('T')[0]}`);
    }
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    if (selectedDate && event.type === 'set') {
      setEndDate(selectedDate);
      const dateStr = selectedDate.toISOString().split('T')[0];
      router.replace(`/fuel/analytics?startDate=${startDate.toISOString().split('T')[0]}&endDate=${dateStr}`);
    }
  };

  const formatCurrency = (value: number) => `$${value.toFixed(2)}`;

  const renderOverviewSection = () => (
    <ThemedView style={styles.section}>
      <TouchableOpacity
        style={[styles.sectionHeader, { borderBottomColor: colors.border }]}
        onPress={() => setExpandedSections(prev => ({ ...prev, overview: !prev.overview }))}
      >
        <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
          Overview
        </ThemedText>
        <IconSymbol
          name={expandedSections.overview ? "chevron.down" : "chevron.right"}
          size={20}
          color={colors.icon}
        />
      </TouchableOpacity>

      {expandedSections.overview && (
        <View style={styles.overviewCards}>
          <View style={[styles.overviewCard, { backgroundColor: colors.primary }]}>
            <IconSymbol name="dollarsign.circle" size={24} color="white" />
            <ThemedText style={styles.overviewValue}>
              {formatCurrency(analyticsData.monthlyStats.totalCost)}
            </ThemedText>
            <ThemedText style={styles.overviewLabel}>Total Cost</ThemedText>
          </View>

          <View style={[styles.overviewCard, { backgroundColor: colors.secondary }]}>
            <IconSymbol name="fuelpump.circle" size={24} color="white" />
            <ThemedText style={styles.overviewValue}>
              {analyticsData.monthlyStats.totalFuel.toFixed(1)}
            </ThemedText>
            <ThemedText style={styles.overviewLabel}>Total Fuel</ThemedText>
          </View>

          <View style={[styles.overviewCard, { backgroundColor: colors.success }]}>
            <IconSymbol name="speedometer" size={24} color="white" />
            <ThemedText style={styles.overviewValue}>
              {analyticsData.monthlyStats.averageMPG.toFixed(1)}
            </ThemedText>
            <ThemedText style={styles.overviewLabel}>Average MPG</ThemedText>
          </View>

          <View style={[styles.overviewCard, { backgroundColor: colors.accent }]}>
            <IconSymbol name="car.circle" size={24} color="white" />
            <ThemedText style={styles.overviewValue}>
              {analyticsData.monthlyStats.tripsCount}
            </ThemedText>
            <ThemedText style={styles.overviewLabel}>Total Trips</ThemedText>
          </View>
        </View>
      )}
    </ThemedView>
  );

  const getChartData = () => {
    if (!analyticsData) return { data: [], config: [], vehicles: [] };

    switch (selectedChart) {
      case 'overview':
        return {
          data: analyticsData.trends.costByMonth.map(item => ({
            ...item,
            month: new Date(item.month + '-01').toLocaleDateString('en-US', {
              month: 'short',
              year: '2-digit'
            }).replace(' ', ''),
          })),
          config: [
            {
              dataKey: 'cost',
              color: colors.primary,
              strokeWidth: 2,
            } as ChartConfig,
          ],
          vehicles: [],
        };
      case 'trends':
        return {
          data: analyticsData.trends.costByMonth.map(item => ({
            ...item,
            month: new Date(item.month + '-01').toLocaleDateString('en-US', {
              month: 'short',
              year: '2-digit'
            }).replace(' ', ''),
          })),
          config: [
            {
              dataKey: 'cost',
              color: colors.primary,
              strokeWidth: 2,
            } as ChartConfig,
            {
              dataKey: 'fuel',
              color: colors.secondary,
              strokeWidth: 2,
            } as ChartConfig,
          ],
          vehicles: [],
        };
      case 'comparison':
        return {
          data: analyticsData.vehicleComparison,
          config: [
            {
              dataKey: 'totalCost',
              color: colors.primary,
              fill: colors.primary,
            } as ChartConfig,
          ],
          vehicles: analyticsData.vehicleComparison.map(vehicle => ({
            id: vehicle.vehicleId,
            name: vehicle.vehicleName,
            color: colors.primary,
          })),
        };
      default:
        return { data: [], config: [], vehicles: [] };
    }
  };

  const renderChartSection = () => {
    const { data, config, vehicles } = getChartData();

    return (
      <ThemedView style={styles.section}>
        <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
          Analytics
        </ThemedText>

        {/* Chart Type Selector */}
        <View style={styles.chartSelector}>
          {[
            { key: 'overview', label: 'Cost Trends', icon: 'chart.line.uptrend.xyaxis' },
            { key: 'trends', label: 'Detailed Trends', icon: 'chart.bar' },
            { key: 'comparison', label: 'Vehicle Comparison', icon: 'car.2' },
          ].map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.chartOption,
                selectedChart === option.key && { backgroundColor: colors.primary, borderColor: colors.primary },
              ]}
              onPress={() => setSelectedChart(option.key as typeof selectedChart)}
            >
              <IconSymbol
                name={option.icon}
                size={16}
                color={selectedChart === option.key ? 'white' : colors.icon}
              />
              <ThemedText
                style={[
                  styles.chartOptionText,
                  { color: selectedChart === option.key ? 'white' : colors.text },
                ]}
              >
                {option.label}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        {/* Chart using FuelAnalyticsChart component */}
        <FuelAnalyticsChart
          title={
            selectedChart === 'overview' ? 'Fuel Cost Trends' :
            selectedChart === 'trends' ? 'Cost & Fuel Trends' :
            'Vehicle Cost Comparison'
          }
          type={selectedChart === 'comparison' ? 'bar' : 'line'}
          data={data}
          config={config}
          vehicles={vehicles}
          unit={selectedChart === 'trends' ? '' : '$'}
          subtitle={
            selectedChart === 'overview' ? 'Monthly fuel expenses over time' :
            selectedChart === 'trends' ? 'Cost and fuel consumption patterns' :
            'Total fuel costs by vehicle'
          }
          showLegend={selectedChart === 'comparison'}
          height={250}
        />
      </ThemedView>
    );
  };

  const renderDateRangeSelector = () => (
    <ThemedView style={styles.dateRangeSection}>
      <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
        Date Range
      </ThemedText>
      <View style={styles.dateRangeButtons}>
        <TouchableOpacity
          style={[styles.dateButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => startDateRef.current?.show()}
        >
          <IconSymbol name="calendar" size={16} color={colors.icon} />
          <ThemedText style={[styles.dateButtonText, { color: colors.text }]}>
            {startDate.toLocaleDateString()}
          </ThemedText>
        </TouchableOpacity>

        <View style={styles.dateSeparator}>
          <ThemedText style={[styles.dateSeparatorText, { color: colors.icon }]}>
            to
          </ThemedText>
        </View>

        <TouchableOpacity
          style={[styles.dateButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => endDateRef.current?.show()}
        >
          <IconSymbol name="calendar" size={16} color={colors.icon} />
          <ThemedText style={[styles.dateButtonText, { color: colors.text }]}>
            {endDate.toLocaleDateString()}
          </ThemedText>
        </TouchableOpacity>
      </View>

      <View style={styles.quickRanges}>
        {[
          { label: 'Last 30 Days', days: 30 },
          { label: 'Last 3 Months', days: 90 },
          { label: 'Last 6 Months', days: 180 },
          { label: 'Last Year', days: 365 },
        ].map((range) => (
          <TouchableOpacity
            key={range.days}
            style={[styles.quickRangeButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => {
              const end = new Date();
              const start = new Date(end);
              start.setDate(start.getDate() - range.days);

              setStartDate(start);
              setEndDate(end);

              const startDateStr = start.toISOString().split('T')[0];
              const endDateStr = end.toISOString().split('T')[0];
              router.replace(`/fuel/analytics?startDate=${startDateStr}&endDate=${endDateStr}`);
            }}
          >
            <ThemedText style={[styles.quickRangeText, { color: colors.text }]}>
              {range.label}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>
    </ThemedView>
  );

  if (loading) {
    return (
      <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <ThemedText style={[styles.loadingText, { color: colors.text }]}>
            Loading analytics...
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (!analyticsData) {
    return (
      <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.emptyContainer}>
          <IconSymbol name="chart.line.uptrend.xyaxis" size={64} color={colors.icon} />
          <ThemedText style={[styles.emptyTitle, { color: colors.text }]}>
            No Data Available
          </ThemedText>
          <ThemedText style={[styles.emptySubtitle, { color: colors.icon }]}>
            Try adjusting the date range or add some fuel entries
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: 'Fuel Analytics',
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      />

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {renderDateRangeSelector()}
        {renderOverviewSection()}
        {renderChartSection()}
      </ScrollView>

      {/* Date Pickers */}
      <CustomDateTimePicker
        ref={startDateRef}
        value={startDate}
        mode="date"
        onChange={handleStartDateChange}
        style={{ position: 'absolute', opacity: 0, height: 0 }}
      />
      <CustomDateTimePicker
        ref={endDateRef}
        value={endDate}
        mode="date"
        onChange={handleEndDateChange}
        style={{ position: 'absolute', opacity: 0, height: 0 }}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
    opacity: 0.7,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  dateRangeSection: {
    marginBottom: 20,
  },
  dateRangeButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  dateButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  dateSeparator: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateSeparatorText: {
    fontSize: 14,
    marginHorizontal: 4,
  },
  quickRanges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickRangeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  quickRangeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  overviewCards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  overviewCard: {
    flex: 1,
    minWidth: 160,
    minHeight: 100,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  overviewValue: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
  },
  overviewLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: 'white',
    textAlign: 'center',
  },
  chartSelector: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  chartOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  chartOptionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  });