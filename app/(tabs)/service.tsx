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
import { ServiceRecord, Vehicle } from '@/types/data';
import { ServiceService, VehicleService } from '@/services/index';
import { ServiceForm } from '@/components/forms/ServiceForm';

export default function ServiceScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [serviceRecords, setServiceRecords] = useState<ServiceRecord[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ServiceRecord | null>(null);
  const [yearlyTotal, setYearlyTotal] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

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
    setModalVisible(true);
  };

  const handleEditRecord = (record: ServiceRecord) => {
    setEditingRecord(record);
    setModalVisible(true);
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

  const handleServiceSubmit = async (formData: any) => {
    try {
      if (editingRecord) {
        // Note: Update functionality would need to be implemented in ServiceService
        Alert.alert('Info', 'Edit functionality coming soon');
      } else {
        await ServiceService.create(formData);
        Alert.alert('Success', 'Service record added successfully');
      }
      setModalVisible(false);
      loadData();
    } catch (error) {
      console.error('Error saving service record:', error);
      throw error; // Let the form handle the error
    }
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
            <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
              Service Records
            </ThemedText>

            {serviceRecords.map((record) => {
              const vehicleName = getVehicleName(record.vehicleId);
              const isRecordUpcoming = isUpcoming(record.date);

              return (
                <TouchableOpacity
                  key={record.id}
                  style={[
                    styles.serviceCard,
                    {
                      backgroundColor: colors.card,
                      borderColor: isRecordUpcoming ? colors.serviceDue : colors.border,
                      shadowColor: colors.shadow,
                      borderWidth: isRecordUpcoming ? 2 : 1,
                    },
                  ]}
                  onLongPress={() => handleDeleteRecord(record)}
                  delayLongPress={500}
                >
                  <View style={styles.serviceHeader}>
                    <View style={styles.serviceInfo}>
                      <View style={styles.serviceTypeRow}>
                        <ThemedText style={[styles.serviceType, { color: colors.text }]}>
                          {record.type}
                        </ThemedText>
                        <View
                          style={[
                            styles.statusBadge,
                            {
                              backgroundColor: isRecordUpcoming ? colors.warning : colors.success,
                            },
                          ]}
                        >
                          <ThemedText style={styles.statusText}>
                            {isRecordUpcoming ? 'Scheduled' : 'Completed'}
                          </ThemedText>
                        </View>
                      </View>
                      <ThemedText style={[styles.serviceVehicle, { color: colors.icon }]}>
                        {vehicleName}
                      </ThemedText>
                      <ThemedText style={[styles.serviceDate, { color: colors.icon }]}>
                        {formatDate(record.date)}
                      </ThemedText>
                    </View>
                    <View style={styles.serviceCost}>
                      <ThemedText style={[styles.cost, { color: colors.primary }]}>
                        ${record.cost.toFixed(2)}
                      </ThemedText>
                    </View>
                  </View>

                  <View style={styles.serviceDetails}>
                    <View style={styles.detailItem}>
                      <IconSymbol name="speedometer" size={14} color={colors.icon} />
                      <ThemedText style={[styles.detailValue, { color: colors.text }]}>
                        {record.mileage.toLocaleString()} mi
                      </ThemedText>
                    </View>
                    {record.description && (
                      <View style={styles.detailItem}>
                        <IconSymbol name="doc.text" size={14} color={colors.icon} />
                        <ThemedText
                          style={[styles.detailValue, { color: colors.text }]}
                          numberOfLines={1}
                        >
                          {record.description}
                        </ThemedText>
                      </View>
                    )}
                    {record.notes && (
                      <View style={styles.detailItem}>
                        <IconSymbol name="note.text" size={14} color={colors.icon} />
                        <ThemedText
                          style={[styles.detailValue, { color: colors.text }]}
                          numberOfLines={1}
                        >
                          Notes
                        </ThemedText>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Add Service Record Button */}
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={handleAddRecord}
        >
          <IconSymbol name="plus" size={24} color="white" />
          <ThemedText style={styles.addButtonText}>Add Service Record</ThemedText>
        </TouchableOpacity>
      </ScrollView>

      {/* TODO: Create dedicated service form screen */}
      {/* <FormModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={editingRecord ? 'Edit Service Record' : 'Add Service Record'}
      >
        <ServiceForm
          serviceRecord={editingRecord}
          onSubmit={handleServiceSubmit}
          onCancel={() => setModalVisible(false)}
          submitButtonText={editingRecord ? 'Update Record' : 'Add Record'}
        />
      </FormModal> */}
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