import { FuelEntryCard } from '@/components/fuel/FuelEntryCard';
import { FuelSearchFilter } from '@/components/fuel/FuelSearchFilter';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatCurrency, useRegion } from '@/hooks/use-region';
import { FuelService, VehicleService } from '@/services/index';
import { FuelEntry, FuelSearchFilter as FuelSearchFilterType, Vehicle } from '@/types/data';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

export default function FuelScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { regionConfig } = useRegion();
  const [fuelEntries, setFuelEntries] = useState<FuelEntry[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [monthlyTotal, setMonthlyTotal] = useState(0);
  const [avgMPG, setAvgMPG] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filter, setFilter] = useState<FuelSearchFilterType>({
    sortBy: 'date',
    sortOrder: 'desc',
  });

  useEffect(() => {
    loadData();
  }, []);

  // Refresh data when screen comes into focus (after adding/editing entries)
  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('Loading fuel data...');
      const [entries, vehicleList, monthlyCost] = await Promise.all([
        FuelService.getAll(),
        VehicleService.getAll(),
        FuelService.getMonthlyTotal(),
      ]);

      console.log('Loaded entries:', entries.length);
      console.log('Loaded vehicles:', vehicleList.length);
      console.log('Monthly cost:', monthlyCost);

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

      console.log('Fuel data loaded successfully');
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
    router.push('/fuel/entry');
  };

  const handleEditEntry = (entry: FuelEntry) => {
    router.push(`/fuel/entry?entryId=${entry.id}`);
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

  const getFilteredAndSortedEntries = () => {
    let filteredEntries = [...fuelEntries];

    // Apply vehicle filter
    if (filter.vehicleId) {
      filteredEntries = filteredEntries.filter(entry => entry.vehicleId === filter.vehicleId);
    }

    // Apply date range filter
    if (filter.dateRange) {
      const startDate = new Date(filter.dateRange.start);
      const endDate = new Date(filter.dateRange.end);
      endDate.setHours(23, 59, 59, 999); // End of day

      filteredEntries = filteredEntries.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= startDate && entryDate <= endDate;
      });
    }

    // Apply price range filter
    if (filter.priceRange) {
      filteredEntries = filteredEntries.filter(entry =>
        (!filter.priceRange.min || entry.pricePerUnit >= filter.priceRange.min) &&
        (!filter.priceRange.max || entry.pricePerUnit <= filter.priceRange.max)
      );
    }

    // Apply fuel station filter
    if (filter.fuelStation) {
      const searchTerm = filter.fuelStation.toLowerCase();
      filteredEntries = filteredEntries.filter(entry =>
        entry.fuelStation?.toLowerCase().includes(searchTerm)
      );
    }

    // Apply sorting
    filteredEntries.sort((a, b) => {
      let comparison = 0;

      switch (filter.sortBy) {
        case 'date':
          comparison = new Date(b.date).getTime() - new Date(a.date).getTime();
          break;
        case 'cost':
          comparison = b.amount - a.amount;
          break;
        case 'mpg':
          const aMPG = a.mpg || 0;
          const bMPG = b.mpg || 0;
          comparison = bMPG - aMPG;
          break;
        default:
          comparison = 0;
      }

      return filter.sortOrder === 'asc' ? -comparison : comparison;
    });

    return filteredEntries;
  };

  const hasActiveFilters = () => {
    return filter.vehicleId || filter.dateRange || filter.priceRange || filter.fuelStation;
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
              {formatCurrency(monthlyTotal, regionConfig)}
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
            <ThemedText style={styles.summaryLabel}>Avg {regionConfig.efficiency.label}</ThemedText>
          </View>
        </View>

        {/* Search and Filter Controls */}
        <View style={styles.filterSection}>
          <View style={styles.filterHeader}>
            <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
              Fuel Entries
            </ThemedText>
            <TouchableOpacity
              style={[styles.filterButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => setShowFilters(!showFilters)}
            >
              <IconSymbol
                name={showFilters ? "line.3.horizontal.decrease.circle.fill" : "line.3.horizontal.decrease.circle"}
                size={20}
                color={hasActiveFilters() ? colors.primary : colors.icon}
              />
              <ThemedText style={[styles.filterButtonText, { color: hasActiveFilters() ? colors.primary : colors.text }]}>
                Filter
                {hasActiveFilters() && ` (${getFilteredAndSortedEntries().length})`}
              </ThemedText>
            </TouchableOpacity>
          </View>

          {showFilters && (
            <FuelSearchFilter
              filter={filter}
              onFilterChange={setFilter}
              vehicles={vehicles}
            />
          )}
        </View>

        {getFilteredAndSortedEntries().length === 0 && !loading ? (
          <View style={styles.emptyState}>
            <IconSymbol
              name={hasActiveFilters() ? "magnifyingglass" : "fuelpump.fill"}
              size={64}
              color={colors.icon}
              style={styles.emptyIcon}
            />
            <ThemedText style={[styles.emptyTitle, { color: colors.text }]}>
              {hasActiveFilters() ? 'No Entries Found' : 'No Fuel Entries Yet'}
            </ThemedText>
            <ThemedText style={[styles.emptySubtitle, { color: colors.icon }]}>
              {hasActiveFilters()
                ? 'Try adjusting your search filters or add new fuel entries'
                : 'Add your first fuel entry to start tracking consumption and expenses'
              }
            </ThemedText>
            {hasActiveFilters() && (
              <TouchableOpacity
                style={[styles.clearFiltersButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => setFilter({ sortBy: 'date', sortOrder: 'desc' })}
              >
                <IconSymbol name="xmark.circle" size={16} color={colors.text} />
                <ThemedText style={[styles.clearFiltersText, { color: colors.text }]}>
                  Clear Filters
                </ThemedText>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.fuelList}>
            {getFilteredAndSortedEntries().map((entry) => {
              const vehicle = vehicles.find(v => v.id === entry.vehicleId);
              if (!vehicle) return null;

              return (
                <FuelEntryCard
                  key={entry.id}
                  entry={entry}
                  vehicle={vehicle}
                  onEdit={handleEditEntry}
                  onDelete={handleDeleteEntry}
                />
              );
            })}
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
    gap: 6,
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
  filterSection: {
    marginBottom: Spacing.md,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Spacing.card.borderRadius,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  filterButtonText: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.medium,
  },
  clearFiltersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Spacing.card.borderRadius,
    borderWidth: 1,
    gap: Spacing.xs,
    marginTop: Spacing.md,
  },
  clearFiltersText: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.medium,
  },
});