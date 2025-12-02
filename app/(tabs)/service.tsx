import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ServiceRecord, Vehicle, ServiceFormData } from '@/types/data';
import { ServiceService, VehicleService } from '@/services/index';
import { ServiceForm } from '@/components/forms/ServiceForm';
import { ServiceRecordCard } from '@/components/service/ServiceRecordCard';
import { useFocusEffect } from 'expo-router';

export default function ServiceScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [serviceRecords, setServiceRecords] = useState<ServiceRecord[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ServiceRecord | null>(null);
  const [yearlyTotal, setYearlyTotal] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  // Refresh data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      setLoading(true);
      const [records, vehicleList] = await Promise.all([
        ServiceService.getAll(),
        VehicleService.getAll(),
      ]);

      // Sort records by date (most recent first)
      const sortedRecords = records.sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      setServiceRecords(sortedRecords);
      setVehicles(vehicleList);

      // Calculate yearly total cost
      const currentYear = new Date().getFullYear();
      const yearlyCost = records
        .filter(record => new Date(record.date).getFullYear() === currentYear)
        .reduce((total, record) => total + record.cost, 0);
      setYearlyTotal(yearlyCost);

    } catch (error) {
      console.error('Error loading service data:', error);
      Alert.alert('Error', 'Failed to load service records');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleAddRecord = () => {
    setEditingRecord(null);
    setShowForm(true);
  };

  const handleEditRecord = (record: ServiceRecord) => {
    setEditingRecord(record);
    setShowForm(true);
  };

  const handleDeleteRecord = (record: ServiceRecord) => {
    const vehicle = vehicles.find(v => v.id === record.vehicleId);
    const vehicleName = vehicle ? vehicle.name : 'Unknown Vehicle';

    Alert.alert(
      'Delete Service Record',
      `Are you sure you want to delete the "${record.type}" record for ${vehicleName} on ${record.date}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await ServiceService.delete(record.id);
              Alert.alert('Success', 'Service record deleted successfully');
              loadData();
            } catch (error) {
              console.error('Error deleting service record:', error);
              Alert.alert('Error', 'Failed to delete service record');
            }
          },
        },
      ]
    );
  };

  const handleServiceSubmit = async (formData: ServiceFormData) => {
    try {
      if (editingRecord) {
        await ServiceService.update(editingRecord.id, formData);
        Alert.alert('Success', 'Service record updated successfully!');
      } else {
        await ServiceService.create(formData);
        Alert.alert('Success', 'Service record added successfully!');
      }
      setShowForm(false);
      setEditingRecord(null);
      loadData();
    } catch (error) {
      console.error('Error saving service record:', error);
      throw error; // Let the form handle the error
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingRecord(null);
  };

  const getVehicleName = (vehicleId: string) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    return vehicle ? vehicle.name : 'Unknown Vehicle';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const isUpcoming = (dateString: string) => {
    const serviceDate = new Date(dateString);
    const today = new Date();
    return serviceDate > today;
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
            Service & Maintenance
          </ThemedText>
          <ThemedText style={[styles.subtitle, { color: colors.icon }]}>
            Track vehicle service history and schedule
          </ThemedText>
        </View>

        {/* Show Form or List Content */}
        {showForm ? (
          <View style={styles.formContainer}>
            <View style={styles.formHeader}>
              <ThemedText style={[styles.formTitle, { color: colors.text }]}>
                {editingRecord ? 'Edit Service Record' : 'Add Service Record'}
              </ThemedText>
              <TouchableOpacity
                style={[styles.cancelButton, { backgroundColor: colors.surface }]}
                onPress={handleFormCancel}
              >
                <IconSymbol name="xmark" size={16} color={colors.text} />
                <ThemedText style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</ThemedText>
              </TouchableOpacity>
            </View>
            <ServiceForm
              serviceRecord={editingRecord}
              onSubmit={handleServiceSubmit}
              onCancel={handleFormCancel}
              submitButtonText={editingRecord ? 'Update Service' : 'Add Service'}
            />
          </View>
        ) : (
          <>
            {/* Summary Cards */}
            <View style={styles.summarySection}>
              <View
                style={[
                  styles.summaryCard,
                  { backgroundColor: colors.warning },
                ]}
              >
                <IconSymbol name="wrench.fill" size={24} color="white" />
                <ThemedText style={styles.summaryValue}>
                  {serviceRecords.filter(record => isUpcoming(record.date)).length}
                </ThemedText>
                <ThemedText style={styles.summaryLabel}>Upcoming</ThemedText>
              </View>
              <View
                style={[
                  styles.summaryCard,
                  { backgroundColor: colors.primary },
                ]}
              >
                <IconSymbol name="dollarsign.circle" size={24} color="white" />
                <ThemedText style={styles.summaryValue}>
                  ${yearlyTotal.toFixed(0)}
                </ThemedText>
                <ThemedText style={styles.summaryLabel}>This Year</ThemedText>
              </View>
            </View>

            {serviceRecords.length === 0 && !loading ? (
              <View style={styles.emptyState}>
                <IconSymbol
                  name="wrench.fill"
                  size={64}
                  color={colors.icon}
                  style={styles.emptyIcon}
                />
                <ThemedText style={[styles.emptyTitle, { color: colors.text }]}>
                  No Service Records Yet
                </ThemedText>
                <ThemedText style={[styles.emptySubtitle, { color: colors.icon }]}>
                  Add your first service record to start tracking maintenance history
                </ThemedText>
              </View>
            ) : (
              <View style={styles.serviceList}>
                <View style={styles.recordsHeader}>
                  <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
                    Service Records
                  </ThemedText>
                  <TouchableOpacity
                    style={[styles.addButton, { backgroundColor: colors.primary }]}
                    onPress={handleAddRecord}
                  >
                    <IconSymbol name="plus" size={16} color="white" />
                    <ThemedText style={styles.addButtonText}>Add</ThemedText>
                  </TouchableOpacity>
                </View>

                {serviceRecords.map((record) => {
                  const vehicle = vehicles.find(v => v.id === record.vehicleId);
                  if (!vehicle) return null;

                  return (
                    <ServiceRecordCard
                      key={record.id}
                      serviceRecord={record}
                      vehicle={vehicle}
                      onEdit={handleEditRecord}
                      onDelete={handleDeleteRecord}
                    />
                  );
                })}
              </View>
            )}

            {/* Add Service Record Button - Only show when not empty and form not shown */}
            {serviceRecords.length === 0 && (
              <TouchableOpacity
                style={[styles.addButton, { backgroundColor: colors.primary }]}
                onPress={handleAddRecord}
              >
                <IconSymbol name="plus" size={24} color="white" />
                <ThemedText style={styles.addButtonText}>Add Service Record</ThemedText>
              </TouchableOpacity>
            )}
          </>
        )}
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
  recordsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  formContainer: {
    flex: 1,
    marginBottom: Spacing.lg,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  formTitle: {
    fontSize: Typography.sizes.title,
    fontWeight: Typography.weights.semibold,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Spacing.card.borderRadius,
    borderWidth: 1,
    borderColor: '#ddd',
    gap: Spacing.xs,
  },
  cancelButtonText: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.medium,
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
});