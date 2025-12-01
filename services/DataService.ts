/**
 * Data Service for myVenti vehicle tracking application
 * Provides centralized data management using AsyncStorage for local persistence
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Vehicle,
  FuelEntry,
  ServiceRecord,
  VehicleFormData,
  FuelFormData,
  ServiceFormData,
  DashboardSummary,
  RecentActivity,
} from '@/types/data';

// Storage keys
const STORAGE_KEYS = {
  VEHICLES: 'myventi_vehicles',
  FUEL_ENTRIES: 'myventi_fuel_entries',
  SERVICE_RECORDS: 'myventi_service_records',
} as const;

/**
 * Generate a unique ID for new records
 */
const generateId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

/**
 * Get current timestamp in ISO format
 */
const getCurrentTimestamp = (): string => {
  return new Date().toISOString();
};

/**
 * Generic storage error handler
 */
const handleStorageError = (error: any, operation: string): void => {
  console.error(`DataService ${operation} error:`, error);
  // In a production app, you might want to send this to an error tracking service
};

/**
 * Vehicle CRUD operations
 */
export class VehicleService {
  static async getAll(): Promise<Vehicle[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.VEHICLES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      handleStorageError(error, 'VehicleService.getAll');
      return [];
    }
  }

  static async getById(id: string): Promise<Vehicle | null> {
    try {
      const vehicles = await this.getAll();
      return vehicles.find(vehicle => vehicle.id === id) || null;
    } catch (error) {
      handleStorageError(error, 'VehicleService.getById');
      return null;
    }
  }

  static async create(formData: VehicleFormData): Promise<Vehicle> {
    try {
      const vehicles = await this.getAll();
      const newVehicle: Vehicle = {
        id: generateId(),
        name: formData.name.trim(),
        year: parseInt(formData.year),
        make: formData.make.trim(),
        model: formData.model.trim(),
        type: formData.type,
        status: 'active',
        createdAt: getCurrentTimestamp(),
        updatedAt: getCurrentTimestamp(),
      };

      vehicles.push(newVehicle);
      await AsyncStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(vehicles));
      return newVehicle;
    } catch (error) {
      handleStorageError(error, 'VehicleService.create');
      throw error;
    }
  }

  static async update(id: string, formData: Partial<VehicleFormData>): Promise<Vehicle | null> {
    try {
      const vehicles = await this.getAll();
      const index = vehicles.findIndex(vehicle => vehicle.id === id);

      if (index === -1) {
        return null;
      }

      vehicles[index] = {
        ...vehicles[index],
        ...(formData.name && { name: formData.name.trim() }),
        ...(formData.year && { year: parseInt(formData.year) }),
        ...(formData.make && { make: formData.make.trim() }),
        ...(formData.model && { model: formData.model.trim() }),
        ...(formData.type && { type: formData.type }),
        updatedAt: getCurrentTimestamp(),
      };

      await AsyncStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(vehicles));
      return vehicles[index];
    } catch (error) {
      handleStorageError(error, 'VehicleService.update');
      throw error;
    }
  }

  static async delete(id: string): Promise<boolean> {
    try {
      const vehicles = await this.getAll();
      const filteredVehicles = vehicles.filter(vehicle => vehicle.id !== id);

      if (filteredVehicles.length === vehicles.length) {
        return false; // Vehicle not found
      }

      await AsyncStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(filteredVehicles));

      // Also delete related fuel entries and service records
      await FuelService.deleteByVehicleId(id);
      await ServiceService.deleteByVehicleId(id);

      return true;
    } catch (error) {
      handleStorageError(error, 'VehicleService.delete');
      throw error;
    }
  }
}

/**
 * Fuel Entry CRUD operations
 */
export class FuelService {
  static async getAll(): Promise<FuelEntry[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.FUEL_ENTRIES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      handleStorageError(error, 'FuelService.getAll');
      return [];
    }
  }

  static async getByVehicleId(vehicleId: string): Promise<FuelEntry[]> {
    try {
      const entries = await this.getAll();
      return entries.filter(entry => entry.vehicleId === vehicleId);
    } catch (error) {
      handleStorageError(error, 'FuelService.getByVehicleId');
      return [];
    }
  }

  static async create(formData: FuelFormData): Promise<FuelEntry> {
    try {
      const entries = await this.getAll();

      // Calculate MPG for gas vehicles if we have previous entries for the same vehicle
      let mpg: number | undefined;
      const vehicle = await VehicleService.getById(formData.vehicleId);
      if (vehicle && vehicle.type !== 'electric') {
        const previousEntries = await this.getByVehicleId(formData.vehicleId);
        if (previousEntries.length > 0) {
          const lastEntry = previousEntries[0];
          const currentMileage = parseInt(formData.mileage);
          const lastMileage = lastEntry.mileage;
          const gallonsUsed = parseFloat(formData.quantity);

          if (currentMileage > lastMileage && gallonsUsed > 0) {
            mpg = (currentMileage - lastMileage) / gallonsUsed;
          }
        }
      }

      const newEntry: FuelEntry = {
        id: generateId(),
        vehicleId: formData.vehicleId,
        date: formData.date,
        amount: parseFloat(formData.amount),
        quantity: parseFloat(formData.quantity),
        pricePerUnit: parseFloat(formData.pricePerUnit),
        mileage: parseInt(formData.mileage),
        mpg: mpg,
        createdAt: getCurrentTimestamp(),
        updatedAt: getCurrentTimestamp(),
      };

      entries.push(newEntry);
      await AsyncStorage.setItem(STORAGE_KEYS.FUEL_ENTRIES, JSON.stringify(entries));
      return newEntry;
    } catch (error) {
      handleStorageError(error, 'FuelService.create');
      throw error;
    }
  }

  static async delete(id: string): Promise<boolean> {
    try {
      const entries = await this.getAll();
      const filteredEntries = entries.filter(entry => entry.id !== id);

      if (filteredEntries.length === entries.length) {
        return false; // Entry not found
      }

      await AsyncStorage.setItem(STORAGE_KEYS.FUEL_ENTRIES, JSON.stringify(filteredEntries));
      return true;
    } catch (error) {
      handleStorageError(error, 'FuelService.delete');
      throw error;
    }
  }

  static async deleteByVehicleId(vehicleId: string): Promise<void> {
    try {
      const entries = await this.getAll();
      const filteredEntries = entries.filter(entry => entry.vehicleId !== vehicleId);
      await AsyncStorage.setItem(STORAGE_KEYS.FUEL_ENTRIES, JSON.stringify(filteredEntries));
    } catch (error) {
      handleStorageError(error, 'FuelService.deleteByVehicleId');
      throw error;
    }
  }

  static async getMonthlyTotal(): Promise<number> {
    try {
      const entries = await this.getAll();
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      return entries
        .filter(entry => {
          const entryDate = new Date(entry.date);
          return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
        })
        .reduce((total, entry) => total + entry.amount, 0);
    } catch (error) {
      handleStorageError(error, 'FuelService.getMonthlyTotal');
      return 0;
    }
  }
}

/**
 * Service Record CRUD operations
 */
export class ServiceService {
  static async getAll(): Promise<ServiceRecord[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SERVICE_RECORDS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      handleStorageError(error, 'ServiceService.getAll');
      return [];
    }
  }

  static async getByVehicleId(vehicleId: string): Promise<ServiceRecord[]> {
    try {
      const records = await this.getAll();
      return records.filter(record => record.vehicleId === vehicleId);
    } catch (error) {
      handleStorageError(error, 'ServiceService.getByVehicleId');
      return [];
    }
  }

  static async create(formData: ServiceFormData): Promise<ServiceRecord> {
    try {
      const records = await this.getAll();
      const newRecord: ServiceRecord = {
        id: generateId(),
        vehicleId: formData.vehicleId,
        date: formData.date,
        type: formData.type.trim(),
        description: formData.description.trim(),
        cost: parseFloat(formData.cost),
        mileage: parseInt(formData.mileage),
        notes: formData.notes?.trim(),
        isCompleted: true, // Assume completed when created
        createdAt: getCurrentTimestamp(),
        updatedAt: getCurrentTimestamp(),
      };

      records.push(newRecord);
      await AsyncStorage.setItem(STORAGE_KEYS.SERVICE_RECORDS, JSON.stringify(records));
      return newRecord;
    } catch (error) {
      handleStorageError(error, 'ServiceService.create');
      throw error;
    }
  }

  static async delete(id: string): Promise<boolean> {
    try {
      const records = await this.getAll();
      const filteredRecords = records.filter(record => record.id !== id);

      if (filteredRecords.length === records.length) {
        return false; // Record not found
      }

      await AsyncStorage.setItem(STORAGE_KEYS.SERVICE_RECORDS, JSON.stringify(filteredRecords));
      return true;
    } catch (error) {
      handleStorageError(error, 'ServiceService.delete');
      throw error;
    }
  }

  static async deleteByVehicleId(vehicleId: string): Promise<void> {
    try {
      const records = await this.getAll();
      const filteredRecords = records.filter(record => record.vehicleId !== vehicleId);
      await AsyncStorage.setItem(STORAGE_KEYS.SERVICE_RECORDS, JSON.stringify(filteredRecords));
    } catch (error) {
      handleStorageError(error, 'ServiceService.deleteByVehicleId');
      throw error;
    }
  }
}

/**
 * Dashboard and summary operations
 */
export class DashboardService {
  static async getSummary(): Promise<DashboardSummary> {
    try {
      const vehicles = await VehicleService.getAll();
      const monthlyFuelCost = await FuelService.getMonthlyTotal();

      return {
        totalVehicles: vehicles.length,
        activeVehicles: vehicles.filter(v => v.status === 'active').length,
        monthlyFuelCost: Math.round(monthlyFuelCost * 100) / 100, // Round to 2 decimal places
        upcomingServices: 0, // TODO: Implement service due calculation
        totalMileage: vehicles.reduce((total, vehicle) => {
          // Get the latest fuel entry for each vehicle to determine mileage
          return total; // Simplified for now
        }, 0),
      };
    } catch (error) {
      handleStorageError(error, 'DashboardService.getSummary');
      return {
        totalVehicles: 0,
        activeVehicles: 0,
        monthlyFuelCost: 0,
        upcomingServices: 0,
        totalMileage: 0,
      };
    }
  }

  static async getRecentActivity(limit: number = 10): Promise<RecentActivity[]> {
    try {
      const fuelEntries = await FuelService.getAll();
      const serviceRecords = await ServiceService.getAll();

      const activities: RecentActivity[] = [
        ...fuelEntries.slice(0, 5).map(entry => ({
          id: entry.id,
          type: 'fuel' as const,
          title: 'Fuel Fill-up',
          subtitle: `$${entry.amount.toFixed(2)}`,
          time: this.formatRelativeTime(entry.createdAt),
          icon: 'fuelpump.fill',
          color: '#007AFF', // Using blue as primary color
        })),
        ...serviceRecords.slice(0, 5).map(record => ({
          id: record.id,
          type: 'service' as const,
          title: record.type,
          subtitle: `$${record.cost.toFixed(2)}`,
          time: this.formatRelativeTime(record.createdAt),
          icon: 'wrench.fill',
          color: '#34C759', // Using green as success color
        })),
      ];

      // Sort by creation time (most recent first) and limit
      return activities
        .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
        .slice(0, limit);
    } catch (error) {
      handleStorageError(error, 'DashboardService.getRecentActivity');
      return [];
    }
  }

  private static formatRelativeTime(timestamp: string): string {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      return 'Just now';
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else {
      return time.toLocaleDateString();
    }
  }
}

// Export services through the index file to avoid circular dependencies