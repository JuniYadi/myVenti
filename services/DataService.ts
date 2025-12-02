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
        fuelStation: formData.fuelStation?.trim(),
        notes: formData.notes?.trim(),
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

  static async getById(id: string): Promise<FuelEntry | null> {
    try {
      const entries = await this.getAll();
      return entries.find(entry => entry.id === id) || null;
    } catch (error) {
      handleStorageError(error, 'FuelService.getById');
      return null;
    }
  }

  static async update(id: string, formData: FuelFormData): Promise<FuelEntry | null> {
    try {
      const entries = await this.getAll();
      const index = entries.findIndex(entry => entry.id === id);

      if (index === -1) {
        return null; // Entry not found
      }

      // Recalculate MPG for gas vehicles if mileage or quantity changed
      let mpg: number | undefined = entries[index].mpg;
      const vehicle = await VehicleService.getById(formData.vehicleId);

      if (vehicle && vehicle.type !== 'electric') {
        const previousEntries = entries.filter(e => e.vehicleId === formData.vehicleId && e.id !== id);
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

      entries[index] = {
        ...entries[index],
        vehicleId: formData.vehicleId,
        date: formData.date,
        amount: parseFloat(formData.amount),
        quantity: parseFloat(formData.quantity),
        pricePerUnit: parseFloat(formData.pricePerUnit),
        mileage: parseInt(formData.mileage),
        mpg: mpg,
        fuelStation: formData.fuelStation?.trim(),
        notes: formData.notes?.trim(),
        updatedAt: getCurrentTimestamp(),
      };

      await AsyncStorage.setItem(STORAGE_KEYS.FUEL_ENTRIES, JSON.stringify(entries));
      return entries[index];
    } catch (error) {
      handleStorageError(error, 'FuelService.update');
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

  // ==================== ANALYTICS METHODS ====================

  /**
   * Get fuel entries within a date range
   */
  static async getByDateRange(startDate: Date, endDate: Date): Promise<FuelEntry[]> {
    try {
      const entries = await this.getAll();
      return entries.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= startDate && entryDate <= endDate;
      });
    } catch (error) {
      handleStorageError(error, 'FuelService.getByDateRange');
      return [];
    }
  }

  /**
   * Get analytics summary for a date range
   */
  static async getAnalyticsSummary(startDate: Date, endDate: Date): Promise<{
    totalCost: number;
    totalFuel: number;
    averageMPG: number;
    tripsCount: number;
    averageCostPerTrip: number;
    averageCostPerGallon: number;
  }> {
    try {
      const entries = await this.getByDateRange(startDate, endDate);

      if (entries.length === 0) {
        return {
          totalCost: 0,
          totalFuel: 0,
          averageMPG: 0,
          tripsCount: 0,
          averageCostPerTrip: 0,
          averageCostPerGallon: 0,
        };
      }

      const totalCost = entries.reduce((sum, entry) => sum + entry.amount, 0);
      const totalFuel = entries.reduce((sum, entry) => sum + entry.quantity, 0);

      // Calculate average MPG for gas vehicles only
      const gasEntries = entries.filter(entry => entry.mpg && entry.mpg > 0);
      const averageMPG = gasEntries.length > 0
        ? gasEntries.reduce((sum, entry) => sum + entry.mpg!, 0) / gasEntries.length
        : 0;

      return {
        totalCost,
        totalFuel,
        averageMPG: Math.round(averageMPG * 10) / 10,
        tripsCount: entries.length,
        averageCostPerTrip: totalCost / entries.length,
        averageCostPerGallon: totalFuel > 0 ? totalCost / totalFuel : 0,
      };
    } catch (error) {
      handleStorageError(error, 'FuelService.getAnalyticsSummary');
      return {
        totalCost: 0,
        totalFuel: 0,
        averageMPG: 0,
        tripsCount: 0,
        averageCostPerTrip: 0,
        averageCostPerGallon: 0,
      };
    }
  }

  /**
   * Get monthly trends for analytics charts
   */
  static async getMonthlyTrends(months: number = 12): Promise<Array<{
    month: string;
    cost: number;
    fuel: number;
    trips: number;
    averageMPG: number;
  }>> {
    try {
      const entries = await this.getAll();
      const monthlyData = new Map<string, FuelEntry[]>();

      // Group entries by month
      entries.forEach(entry => {
        const monthKey = entry.date.substring(0, 7); // YYYY-MM
        if (!monthlyData.has(monthKey)) {
          monthlyData.set(monthKey, []);
        }
        monthlyData.get(monthKey)!.push(entry);
      });

      // Get last N months
      const trends = [];
      const now = new Date();

      for (let i = months - 1; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthEntries = monthlyData.get(monthKey) || [];

        const totalCost = monthEntries.reduce((sum, entry) => sum + entry.amount, 0);
        const totalFuel = monthEntries.reduce((sum, entry) => sum + entry.quantity, 0);
        const gasEntries = monthEntries.filter(entry => entry.mpg && entry.mpg > 0);
        const averageMPG = gasEntries.length > 0
          ? gasEntries.reduce((sum, entry) => sum + entry.mpg!, 0) / gasEntries.length
          : 0;

        trends.push({
          month: monthKey,
          cost: totalCost,
          fuel: totalFuel,
          trips: monthEntries.length,
          averageMPG: Math.round(averageMPG * 10) / 10,
        });
      }

      return trends;
    } catch (error) {
      handleStorageError(error, 'FuelService.getMonthlyTrends');
      return [];
    }
  }

  /**
   * Get vehicle comparison data
   */
  static async getVehicleComparison(startDate: Date, endDate: Date): Promise<Array<{
    vehicleId: string;
    vehicleName: string;
    totalCost: number;
    totalFuel: number;
    averageMPG: number;
    tripsCount: number;
    averageCostPerTrip: number;
  }>> {
    try {
      const [entries, vehicles] = await Promise.all([
        this.getByDateRange(startDate, endDate),
        VehicleService.getAll(),
      ]);

      const vehicleData = new Map();

      entries.forEach(entry => {
        if (!vehicleData.has(entry.vehicleId)) {
          vehicleData.set(entry.vehicleId, {
            vehicleId: entry.vehicleId,
            totalCost: 0,
            totalFuel: 0,
            mpgValues: [],
            trips: 0,
          });
        }

        const data = vehicleData.get(entry.vehicleId);
        data.totalCost += entry.amount;
        data.totalFuel += entry.quantity;
        data.trips += 1;

        if (entry.mpg && entry.mpg > 0) {
          data.mpgValues.push(entry.mpg);
        }
      });

      const comparison = [];

      vehicleData.forEach((data, vehicleId) => {
        const vehicle = vehicles.find(v => v.id === vehicleId);
        if (vehicle) {
          const averageMPG = data.mpgValues.length > 0
            ? data.mpgValues.reduce((sum, mpg) => sum + mpg, 0) / data.mpgValues.length
            : 0;

          comparison.push({
            vehicleId,
            vehicleName: vehicle.name,
            totalCost: data.totalCost,
            totalFuel: data.totalFuel,
            averageMPG: Math.round(averageMPG * 10) / 10,
            tripsCount: data.trips,
            averageCostPerTrip: data.totalCost / data.trips,
          });
        }
      });

      return comparison.sort((a, b) => b.totalCost - a.totalCost);
    } catch (error) {
      handleStorageError(error, 'FuelService.getVehicleComparison');
      return [];
    }
  }

  // ==================== ADVANCED FILTERING & SEARCH ====================

  /**
   * Search fuel entries by various criteria
   */
  static async search(filters: {
    vehicleId?: string;
    startDate?: Date;
    endDate?: Date;
    fuelStation?: string;
    minPrice?: number;
    maxPrice?: number;
    minAmount?: number;
    maxAmount?: number;
    searchTerm?: string;
  }): Promise<FuelEntry[]> {
    try {
      const entries = await this.getAll();

      return entries.filter(entry => {
        // Vehicle filter
        if (filters.vehicleId && entry.vehicleId !== filters.vehicleId) {
          return false;
        }

        // Date range filter
        if (filters.startDate || filters.endDate) {
          const entryDate = new Date(entry.date);
          if (filters.startDate && entryDate < filters.startDate) {
            return false;
          }
          if (filters.endDate && entryDate > filters.endDate) {
            return false;
          }
        }

        // Fuel station filter
        if (filters.fuelStation) {
          const searchTerm = filters.fuelStation.toLowerCase();
          if (!entry.fuelStation?.toLowerCase().includes(searchTerm)) {
            return false;
          }
        }

        // Price range filter
        if (filters.minPrice !== undefined && entry.pricePerUnit < filters.minPrice) {
          return false;
        }
        if (filters.maxPrice !== undefined && entry.pricePerUnit > filters.maxPrice) {
          return false;
        }

        // Amount range filter
        if (filters.minAmount !== undefined && entry.amount < filters.minAmount) {
          return false;
        }
        if (filters.maxAmount !== undefined && entry.amount > filters.maxAmount) {
          return false;
        }

        // General search term (notes, fuel station)
        if (filters.searchTerm) {
          const searchTerm = filters.searchTerm.toLowerCase();
          const matchesNotes = entry.notes?.toLowerCase().includes(searchTerm);
          const matchesStation = entry.fuelStation?.toLowerCase().includes(searchTerm);

          if (!matchesNotes && !matchesStation) {
            return false;
          }
        }

        return true;
      });
    } catch (error) {
      handleStorageError(error, 'FuelService.search');
      return [];
    }
  }

  /**
   * Get unique fuel stations from all entries
   */
  static async getUniqueFuelStations(): Promise<string[]> {
    try {
      const entries = await this.getAll();
      const stations = new Set<string>();

      entries.forEach(entry => {
        if (entry.fuelStation && entry.fuelStation.trim()) {
          stations.add(entry.fuelStation.trim());
        }
      });

      return Array.from(stations).sort();
    } catch (error) {
      handleStorageError(error, 'FuelService.getUniqueFuelStations');
      return [];
    }
  }

  // ==================== BATCH OPERATIONS ====================

  /**
   * Create multiple fuel entries in a batch
   */
  static async createBatch(formDataList: FuelFormData[]): Promise<FuelEntry[]> {
    try {
      const entries = await this.getAll();
      const newEntries: FuelEntry[] = [];

      for (const formData of formDataList) {
        // Calculate MPG for gas vehicles
        let mpg: number | undefined;
        const vehicle = await VehicleService.getById(formData.vehicleId);

        if (vehicle && vehicle.type !== 'electric') {
          const vehicleEntries = entries.filter(e => e.vehicleId === formData.vehicleId);
          if (vehicleEntries.length > 0) {
            const lastEntry = vehicleEntries.sort((a, b) =>
              new Date(b.date).getTime() - new Date(a.date).getTime()
            )[0];

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
          fuelStation: formData.fuelStation?.trim(),
          notes: formData.notes?.trim(),
          createdAt: getCurrentTimestamp(),
          updatedAt: getCurrentTimestamp(),
        };

        entries.push(newEntry);
        newEntries.push(newEntry);
      }

      await AsyncStorage.setItem(STORAGE_KEYS.FUEL_ENTRIES, JSON.stringify(entries));
      return newEntries;
    } catch (error) {
      handleStorageError(error, 'FuelService.createBatch');
      throw error;
    }
  }

  /**
   * Delete multiple fuel entries in a batch
   */
  static async deleteBatch(entryIds: string[]): Promise<boolean> {
    try {
      const entries = await this.getAll();
      const filteredEntries = entries.filter(entry => !entryIds.includes(entry.id));

      if (filteredEntries.length === entries.length) {
        return false; // No entries were deleted
      }

      await AsyncStorage.setItem(STORAGE_KEYS.FUEL_ENTRIES, JSON.stringify(filteredEntries));
      return true;
    } catch (error) {
      handleStorageError(error, 'FuelService.deleteBatch');
      throw error;
    }
  }

  /**
   * Update multiple fuel entries in a batch
   */
  static async updateBatch(updates: Array<{ id: string; formData: FuelFormData }>): Promise<FuelEntry[]> {
    try {
      const entries = await this.getAll();
      const updatedEntries: FuelEntry[] = [];

      for (const { id, formData } of updates) {
        const index = entries.findIndex(entry => entry.id === id);
        if (index === -1) continue;

        // Recalculate MPG if needed
        let mpg: number | undefined = entries[index].mpg;
        const vehicle = await VehicleService.getById(formData.vehicleId);

        if (vehicle && vehicle.type !== 'electric') {
          const previousEntries = entries.filter(e =>
            e.vehicleId === formData.vehicleId && e.id !== id
          );

          if (previousEntries.length > 0) {
            const lastEntry = previousEntries.sort((a, b) =>
              new Date(b.date).getTime() - new Date(a.date).getTime()
            )[0];

            const currentMileage = parseInt(formData.mileage);
            const lastMileage = lastEntry.mileage;
            const gallonsUsed = parseFloat(formData.quantity);

            if (currentMileage > lastMileage && gallonsUsed > 0) {
              mpg = (currentMileage - lastMileage) / gallonsUsed;
            }
          }
        }

        entries[index] = {
          ...entries[index],
          vehicleId: formData.vehicleId,
          date: formData.date,
          amount: parseFloat(formData.amount),
          quantity: parseFloat(formData.quantity),
          pricePerUnit: parseFloat(formData.pricePerUnit),
          mileage: parseInt(formData.mileage),
          mpg: mpg,
          fuelStation: formData.fuelStation?.trim(),
          notes: formData.notes?.trim(),
          updatedAt: getCurrentTimestamp(),
        };

        updatedEntries.push(entries[index]);
      }

      await AsyncStorage.setItem(STORAGE_KEYS.FUEL_ENTRIES, JSON.stringify(entries));
      return updatedEntries;
    } catch (error) {
      handleStorageError(error, 'FuelService.updateBatch');
      throw error;
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

  static async getById(id: string): Promise<ServiceRecord | null> {
    try {
      const records = await this.getAll();
      return records.find(record => record.id === id) || null;
    } catch (error) {
      handleStorageError(error, 'ServiceService.getById');
      return null;
    }
  }

  static async update(id: string, formData: ServiceFormData): Promise<ServiceRecord | null> {
    try {
      const records = await this.getAll();
      const index = records.findIndex(record => record.id === id);

      if (index === -1) {
        return null; // Record not found
      }

      records[index] = {
        ...records[index],
        vehicleId: formData.vehicleId,
        date: formData.date,
        type: formData.type.trim(),
        description: formData.description.trim(),
        cost: parseFloat(formData.cost),
        mileage: parseInt(formData.mileage),
        notes: formData.notes?.trim(),
        updatedAt: getCurrentTimestamp(),
      };

      await AsyncStorage.setItem(STORAGE_KEYS.SERVICE_RECORDS, JSON.stringify(records));
      return records[index];
    } catch (error) {
      handleStorageError(error, 'ServiceService.update');
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