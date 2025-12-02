/**
 * FuelAnalyticsChart - Reusable mobile-friendly chart component for fuel analytics
 * Supports multiple chart types (line, bar) with interactive touch elements and theming
 */

import React from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';

// Using recharts for cross-platform compatibility
import {
  LineChart,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Line,
  Bar,
} from 'recharts';

const { width: screenWidth } = Dimensions.get('window');

export type ChartType = 'line' | 'bar';

export interface ChartData {
  date: string;
  [key: string]: string | number;
}

export interface ChartConfig {
  dataKey: string;
  color: string;
  strokeWidth?: number;
  fill?: string;
}

export interface VehicleData {
  id: string;
  name: string;
  color: string;
}

export interface FuelAnalyticsChartProps {
  title: string;
  type: ChartType;
  data: ChartData[];
  config: ChartConfig[];
  vehicles?: VehicleData[];
  loading?: boolean;
  error?: string | null;
  height?: number;
  onDataPointPress?: (data: ChartData) => void;
  showLegend?: boolean;
  showGrid?: boolean;
  unit?: string;
  subtitle?: string;
}

export function FuelAnalyticsChart({
  title,
  type,
  data,
  config,
  vehicles,
  loading = false,
  error = null,
  height = 220,
  onDataPointPress,
  showLegend = true,
  showGrid = true,
  unit = '',
  subtitle,
}: FuelAnalyticsChartProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  if (loading) {
    return (
      <View style={[styles.container, { minHeight: height + 80 }]}>
        <View style={styles.header}>
          <ThemedText style={[styles.title, { color: colors.text }]}>
            {title}
          </ThemedText>
          {subtitle && (
            <ThemedText style={[styles.subtitle, { color: colors.icon }]}>
              {subtitle}
            </ThemedText>
          )}
        </View>
        <View style={[styles.loadingContainer, { height }]}>
          <ActivityIndicator size="large" color={colors.primary} />
          <ThemedText style={[styles.loadingText, { color: colors.text }]}>
            Loading chart data...
          </ThemedText>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { minHeight: height + 80 }]}>
        <View style={styles.header}>
          <ThemedText style={[styles.title, { color: colors.text }]}>
            {title}
          </ThemedText>
          {subtitle && (
            <ThemedText style={[styles.subtitle, { color: colors.icon }]}>
              {subtitle}
            </ThemedText>
          )}
        </View>
        <View style={[styles.errorContainer, { height, backgroundColor: colors.surface }]}>
          <IconSymbol name="exclamationmark.triangle" size={32} color={colors.error} />
          <ThemedText style={[styles.errorText, { color: colors.text }]}>
            {error}
          </ThemedText>
          <ThemedText style={[styles.errorSubtext, { color: colors.icon }]}>
            Please try refreshing the data or check your filters.
          </ThemedText>
        </View>
      </View>
    );
  }

  if (!data || data.length === 0) {
    return (
      <View style={[styles.container, { minHeight: height + 80 }]}>
        <View style={styles.header}>
          <ThemedText style={[styles.title, { color: colors.text }]}>
            {title}
          </ThemedText>
          {subtitle && (
            <ThemedText style={[styles.subtitle, { color: colors.icon }]}>
              {subtitle}
            </ThemedText>
          )}
        </View>
        <View style={[styles.emptyContainer, { height, backgroundColor: colors.surface }]}>
          <IconSymbol name="chart.bar" size={32} color={colors.icon} />
          <ThemedText style={[styles.emptyText, { color: colors.text }]}>
            No data available
          </ThemedText>
          <ThemedText style={[styles.emptySubtext, { color: colors.icon }]}>
            Try adjusting your date range or filters to see data.
          </ThemedText>
        </View>
      </View>
    );
  }

  const formatYAxis = (value: any) => {
    if (typeof value === 'number') {
      if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}k${unit}`;
      }
      return `${value.toFixed(0)}${unit}`;
    }
    return value;
  };

  const formatTooltipValue = (value: any, name: string) => {
    if (typeof value === 'number') {
      // Find the vehicle name for this data key
      const vehicle = vehicles?.find(v => v.id === name);
      const displayName = vehicle?.name || name;
      return [`${value.toFixed(2)}${unit}`, displayName];
    }
    return [value, name];
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <View
          style={[
            styles.tooltip,
            {
              backgroundColor: colors.tooltip,
              borderColor: colors.border,
              shadowColor: colors.shadow,
            },
          ]}
        >
          <ThemedText style={[styles.tooltipDate, { color: colors.text }]}>
            {label}
          </ThemedText>
          {payload.map((entry: any, index: number) => {
            const vehicle = vehicles?.find(v => v.id === entry.dataKey);
            const displayName = vehicle?.name || entry.dataKey;
            return (
              <View key={index} style={styles.tooltipRow}>
                <View
                  style={[
                    styles.tooltipIndicator,
                    { backgroundColor: entry.color || entry.fill },
                  ]}
                />
                <ThemedText style={[styles.tooltipLabel, { color: colors.text }]}>
                  {displayName}:
                </ThemedText>
                <ThemedText style={[styles.tooltipValue, { color: colors.text }]}>
                  {typeof entry.value === 'number'
                    ? `${entry.value.toFixed(2)}${unit}`
                    : entry.value}
                </ThemedText>
              </View>
            );
          })}
        </View>
      );
    }
    return null;
  };

  const ChartComponent = type === 'line' ? LineChart : BarChart;

  return (
    <View style={[styles.container, { minHeight: height + 80 }]}>
      <View style={styles.header}>
        <ThemedText style={[styles.title, { color: colors.text }]}>
          {title}
        </ThemedText>
        {subtitle && (
          <ThemedText style={[styles.subtitle, { color: colors.icon }]}>
            {subtitle}
          </ThemedText>
        )}
      </View>

      <View style={[styles.chartContainer, { backgroundColor: colors.surface }]}>
        <ResponsiveContainer width="100%" height={height}>
          <ChartComponent data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            {showGrid && (
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={colors.border}
                strokeOpacity={0.3}
              />
            )}
            <XAxis
              dataKey="date"
              stroke={colors.icon}
              fontSize={Typography.sizes.small}
              tickLine={false}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis
              stroke={colors.icon}
              fontSize={Typography.sizes.small}
              tickLine={false}
              tickFormatter={formatYAxis}
              width={60}
            />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && vehicles && vehicles.length > 1 && (
              <Legend
                wrapperStyle={{
                  paddingTop: Spacing.sm,
                  fontSize: Typography.sizes.caption,
                }}
                iconType="line"
                formatter={(value) => {
                  const vehicle = vehicles.find(v => v.id === value);
                  return vehicle?.name || value;
                }}
              />
            )}
            {config.map((item) => {
              if (type === 'line') {
                return (
                  <Line
                    key={item.dataKey}
                    type="monotone"
                    dataKey={item.dataKey}
                    stroke={item.color}
                    strokeWidth={item.strokeWidth || 2}
                    dot={false}
                    activeDot={{
                      r: 6,
                      strokeWidth: 2,
                      stroke: item.color,
                      fill: colors.background,
                    }}
                    animationDuration={1000}
                  />
                );
              } else {
                return (
                  <Bar
                    key={item.dataKey}
                    dataKey={item.dataKey}
                    fill={item.color || item.fill}
                    radius={[4, 4, 0, 0]}
                    animationDuration={1000}
                  />
                );
              }
            })}
          </ChartComponent>
        </ResponsiveContainer>
      </View>

      {onDataPointPress && (
        <TouchableOpacity
          style={[styles.interactiveOverlay, { height }]}
          activeOpacity={1}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.sm,
  },
  header: {
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: Typography.sizes.title,
    fontWeight: Typography.weights.semibold,
  },
  subtitle: {
    fontSize: Typography.sizes.small,
    marginTop: Spacing.xs / 2,
  },
  chartContainer: {
    borderRadius: Spacing.card.borderRadius,
    padding: Spacing.sm,
    shadowOffset: Spacing.card.shadowOffset,
    shadowOpacity: Spacing.card.shadowOpacity,
    shadowRadius: Spacing.card.shadowRadius,
    elevation: 3,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Spacing.card.borderRadius,
  },
  loadingText: {
    marginTop: Spacing.sm,
    fontSize: Typography.sizes.body,
    textAlign: 'center',
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Spacing.card.borderRadius,
    padding: Spacing.lg,
  },
  errorText: {
    fontSize: Typography.sizes.title,
    fontWeight: Typography.weights.semibold,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: Typography.sizes.body,
    marginTop: Spacing.xs,
    textAlign: 'center',
    lineHeight: 22,
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Spacing.card.borderRadius,
    padding: Spacing.lg,
  },
  emptyText: {
    fontSize: Typography.sizes.title,
    fontWeight: Typography.weights.semibold,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: Typography.sizes.body,
    marginTop: Spacing.xs,
    textAlign: 'center',
    lineHeight: 22,
  },
  interactiveOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  tooltip: {
    padding: Spacing.sm,
    borderRadius: Spacing.sm,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    minWidth: 150,
  },
  tooltipDate: {
    fontSize: Typography.sizes.small,
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing.xs / 2,
  },
  tooltipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs / 2,
  },
  tooltipIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Spacing.xs,
  },
  tooltipLabel: {
    fontSize: Typography.sizes.small,
    fontWeight: Typography.weights.medium,
    flex: 1,
  },
  tooltipValue: {
    fontSize: Typography.sizes.small,
    fontWeight: Typography.weights.semibold,
  },
});