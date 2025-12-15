/**
 * Data Service for myVenti vehicle tracking application
 * Provides centralized data management using SQLite for local persistence
 */

import {
    DashboardSummary,
    FuelEntry,
    FuelFormData,
    RecentActivity,
    ServiceFormData,
    ServiceRecord,
    Vehicle,
    VehicleFormData,
} from '@/types/data';
import { DatabaseManager } from './DatabaseManager';

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
      const db = DatabaseManager.getInstance();
      console.log('VehicleService: Attempting to load vehicles from database...');
      const result = await db.executeSql(
        `SELECT id, name, year, make, model, type, status, created_at as createdAt, updated_at as updatedAt
         FROM vehicles
         ORDER BY created_at DESC`
      );
      const vehicles = DatabaseManager.mapRowsToArray<Vehicle>(result.rows);
      console.log('VehicleService: Successfully loaded vehicles:', vehicles.length);
      return vehicles;
    } catch (error) {
      handleStorageError(error, 'VehicleService.getAll');
      console.error('VehicleService: Failed to load vehicles:', error);
      return [];
    }
  }

  static async getById(id: string): Promise<Vehicle | null> {
    try {
      const db = DatabaseManager.getInstance();
      const result = await db.executeSql(
        `SELECT id, name, year, make, model, type, status, created_at as createdAt, updated_at as updatedAt
         FROM vehicles
         WHERE id = ?`,
        [id]
      );
      const vehicles = DatabaseManager.mapRowsToArray<Vehicle>(result.rows);
      return vehicles.length > 0 ? vehicles[0] : null;
    } catch (error) {
      handleStorageError(error, 'VehicleService.getById');
      return null;
    }
  }

  static async create(formData: VehicleFormData): Promise<Vehicle> {
    try {
      const db = DatabaseManager.getInstance();
      const id = generateId();
      const now = getCurrentTimestamp();

      await db.executeSql(
        `INSERT INTO vehicles (id, name, year, make, model, type, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, 'active', ?, ?)`,
        [
          id,
          formData.name.trim(),
          parseInt(formData.year),
          formData.make.trim(),
          formData.model.trim(),
          formData.type,
          now,
          now
        ]
      );

      // Return the created vehicle
      return await this.getById(id) as Vehicle;
    } catch (error) {
      handleStorageError(error, 'VehicleService.create');
      throw error;
    }
  }

  static async update(id: string, formData: Partial<VehicleFormData>): Promise<Vehicle | null> {
    try {
      const db = DatabaseManager.getInstance();
      const now = getCurrentTimestamp();

      // Build dynamic update query
      const updates: string[] = [];
      const values: any[] = [];

      if (formData.name) {
        updates.push('name = ?');
        values.push(formData.name.trim());
      }
      if (formData.year) {
        updates.push('year = ?');
        values.push(parseInt(formData.year));
      }
      if (formData.make) {
        updates.push('make = ?');
        values.push(formData.make.trim());
      }
      if (formData.model) {
        updates.push('model = ?');
        values.push(formData.model.trim());
      }
      if (formData.type) {
        updates.push('type = ?');
        values.push(formData.type);
      }

      if (updates.length === 0) {
        return await this.getById(id);
      }

      updates.push('updated_at = ?');
      values.push(now);
      values.push(id);

      await db.executeSql(
        `UPDATE vehicles SET ${updates.join(', ')} WHERE id = ?`,
        values
      );

      return await this.getById(id);
    } catch (error) {
      handleStorageError(error, 'VehicleService.update');
      throw error;
    }
  }

  static async delete(id: string): Promise<boolean> {
    try {
      const db = DatabaseManager.getInstance();
      const result = await db.executeSql('DELETE FROM vehicles WHERE id = ?', [id]);

      // SQLite will handle cascade delete for related fuel entries and service records
      return result.rowsAffected && result.rowsAffected > 0;
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
      const db = DatabaseManager.getInstance();
      const result = await db.executeSql(
        `SELECT id, vehicle_id as vehicleId, date, amount, quantity, price_per_unit as pricePerUnit,
                mileage, mpg, fuel_station as fuelStation, notes, created_at as createdAt, updated_at as updatedAt
         FROM fuel_entries
         ORDER BY date DESC, created_at DESC`
      );
      return DatabaseManager.mapRowsToArray<FuelEntry>(result.rows);
    } catch (error) {
      handleStorageError(error, 'FuelService.getAll');
      return [];
    }
  }

  static async getByVehicleId(vehicleId: string): Promise<FuelEntry[]> {
    try {
      const db = DatabaseManager.getInstance();
      const result = await db.executeSql(
        `SELECT id, vehicle_id as vehicleId, date, amount, quantity, price_per_unit as pricePerUnit,
                mileage, mpg, fuel_station as fuelStation, notes, created_at as createdAt, updated_at as updatedAt
         FROM fuel_entries
         WHERE vehicle_id = ?
         ORDER BY date DESC, created_at DESC`,
        [vehicleId]
      );
      return DatabaseManager.mapRowsToArray<FuelEntry>(result.rows);
    } catch (error) {
      handleStorageError(error, 'FuelService.getByVehicleId');
      return [];
    }
  }

  static async create(formData: FuelFormData): Promise<FuelEntry> {
    try {
      const db = DatabaseManager.getInstance();

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

      const id = generateId();
      const now = getCurrentTimestamp();

      await db.executeSql(
        `INSERT INTO fuel_entries (id, vehicle_id, date, amount, quantity, price_per_unit, mileage, mpg, fuel_station, notes, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          formData.vehicleId,
          formData.date,
          parseFloat(formData.amount),
          parseFloat(formData.quantity),
          parseFloat(formData.pricePerUnit),
          parseInt(formData.mileage),
          mpg || null,
          formData.fuelStation?.trim() || null,
          formData.notes?.trim() || null,
          now,
          now
        ]
      );

      return await this.getById(id) as FuelEntry;
    } catch (error) {
      handleStorageError(error, 'FuelService.create');
      throw error;
    }
  }

  static async delete(id: string): Promise<boolean> {
    try {
      const db = DatabaseManager.getInstance();
      const result = await db.executeSql('DELETE FROM fuel_entries WHERE id = ?', [id]);
      return result.rowsAffected && result.rowsAffected > 0;
    } catch (error) {
      handleStorageError(error, 'FuelService.delete');
      throw error;
    }
  }

  static async deleteByVehicleId(vehicleId: string): Promise<void> {
    try {
      const db = DatabaseManager.getInstance();
      await db.executeSql('DELETE FROM fuel_entries WHERE vehicle_id = ?', [vehicleId]);
    } catch (error) {
      handleStorageError(error, 'FuelService.deleteByVehicleId');
      throw error;
    }
  }

  static async getById(id: string): Promise<FuelEntry | null> {
    try {
      const db = DatabaseManager.getInstance();
      const result = await db.executeSql(
        `SELECT id, vehicle_id as vehicleId, date, amount, quantity, price_per_unit as pricePerUnit,
                mileage, mpg, fuel_station as fuelStation, notes, created_at as createdAt, updated_at as updatedAt
         FROM fuel_entries
         WHERE id = ?`,
        [id]
      );
      const entries = DatabaseManager.mapRowsToArray<FuelEntry>(result.rows);
      return entries.length > 0 ? entries[0] : null;
    } catch (error) {
      handleStorageError(error, 'FuelService.getById');
      return null;
    }
  }

  static async update(id: string, formData: FuelFormData): Promise<FuelEntry | null> {
    try {
      const db = DatabaseManager.getInstance();

      // Recalculate MPG for gas vehicles if mileage or quantity changed
      let mpg: number | undefined;
      const vehicle = await VehicleService.getById(formData.vehicleId);

      if (vehicle && vehicle.type !== 'electric') {
        const previousEntries = await this.getByVehicleId(formData.vehicleId);
        const filteredEntries = previousEntries.filter(e => e.id !== id);

        if (filteredEntries.length > 0) {
          const lastEntry = filteredEntries[0];
          const currentMileage = parseInt(formData.mileage);
          const lastMileage = lastEntry.mileage;
          const gallonsUsed = parseFloat(formData.quantity);

          if (currentMileage > lastMileage && gallonsUsed > 0) {
            mpg = (currentMileage - lastMileage) / gallonsUsed;
          }
        }
      }

      const now = getCurrentTimestamp();

      await db.executeSql(
        `UPDATE fuel_entries
         SET vehicle_id = ?, date = ?, amount = ?, quantity = ?, price_per_unit = ?,
             mileage = ?, mpg = ?, fuel_station = ?, notes = ?, updated_at = ?
         WHERE id = ?`,
        [
          formData.vehicleId,
          formData.date,
          parseFloat(formData.amount),
          parseFloat(formData.quantity),
          parseFloat(formData.pricePerUnit),
          parseInt(formData.mileage),
          mpg || null,
          formData.fuelStation?.trim() || null,
          formData.notes?.trim() || null,
          now,
          id
        ]
      );

      return await this.getById(id);
    } catch (error) {
      handleStorageError(error, 'FuelService.update');
      throw error;
    }
  }

  static async getMonthlyTotal(): Promise<number> {
    try {
      const db = DatabaseManager.getInstance();
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        .toISOString().split('T')[0];

      const result = await db.executeSql(
        'SELECT SUM(amount) as total FROM fuel_entries WHERE date >= ?',
        [firstDayOfMonth]
      );

      return result.rows?.[0]?.total || 0;
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
      const db = DatabaseManager.getInstance();
      const result = await db.executeSql(
        `SELECT id, vehicle_id as vehicleId, date, amount, quantity, price_per_unit as pricePerUnit,
                mileage, mpg, fuel_station as fuelStation, notes, created_at as createdAt, updated_at as updatedAt
         FROM fuel_entries
         WHERE date BETWEEN ? AND ?
         ORDER BY date DESC`,
        [startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]]
      );
      return DatabaseManager.mapRowsToArray<FuelEntry>(result.rows);
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
      const db = DatabaseManager.getInstance();
      const result = await db.executeSql(
        `SELECT
           COUNT(*) as tripsCount,
           COALESCE(SUM(amount), 0) as totalCost,
           COALESCE(SUM(quantity), 0) as totalFuel,
           COALESCE(AVG(amount), 0) as averageCostPerTrip,
           COALESCE(SUM(amount) / NULLIF(SUM(quantity), 0), 0) as averageCostPerGallon
         FROM fuel_entries
         WHERE date BETWEEN ? AND ?`,
        [startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]]
      );

      const data = result.rows?.[0] || {};
      const totalCost = data.totalCost || 0;
      const totalFuel = data.totalFuel || 0;
      const tripsCount = data.tripsCount || 0;

      // Calculate average MPG for gas vehicles only
      const mpgResult = await db.executeSql(
        `SELECT AVG(mpg) as avgMPG
         FROM fuel_entries
         WHERE date BETWEEN ? AND ? AND mpg IS NOT NULL AND mpg > 0`,
        [startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]]
      );

      const averageMPG = mpgResult.rows?.[0]?.avgMPG || 0;

      return {
        totalCost,
        totalFuel,
        averageMPG: Math.round(averageMPG * 10) / 10,
        tripsCount,
        averageCostPerTrip: data.averageCostPerTrip || 0,
        averageCostPerGallon: data.averageCostPerGallon || 0,
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
      const db = DatabaseManager.getInstance();
      const result = await db.executeSql(
        `SELECT
           strftime('%Y-%m', date) as month,
           COALESCE(SUM(amount), 0) as cost,
           COALESCE(SUM(quantity), 0) as fuel,
           COUNT(*) as trips
         FROM fuel_entries
         WHERE date >= date('now', '-${months} months')
         GROUP BY strftime('%Y-%m', date)
         ORDER BY month ASC`,
        []
      );

      const monthlyData = DatabaseManager.mapRowsToArray<any>(result.rows);
      const trends = [];

      for (const data of monthlyData) {
        // Get average MPG for this month
        const mpgResult = await db.executeSql(
          `SELECT AVG(mpg) as avgMPG
           FROM fuel_entries
           WHERE strftime('%Y-%m', date) = ? AND mpg IS NOT NULL AND mpg > 0`,
          [data.month]
        );

        const averageMPG = mpgResult.rows?.[0]?.avgMPG || 0;

        trends.push({
          month: data.month,
          cost: data.cost,
          fuel: data.fuel,
          trips: data.trips,
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
      const db = DatabaseManager.getInstance();
      const result = await db.executeSql(
        `SELECT
           fe.vehicle_id as vehicleId,
           v.name as vehicleName,
           COALESCE(SUM(fe.amount), 0) as totalCost,
           COALESCE(SUM(fe.quantity), 0) as totalFuel,
           COUNT(*) as tripsCount,
           COALESCE(SUM(fe.amount) / NULLIF(COUNT(*), 0), 0) as averageCostPerTrip
         FROM fuel_entries fe
         INNER JOIN vehicles v ON fe.vehicle_id = v.id
         WHERE fe.date BETWEEN ? AND ?
         GROUP BY fe.vehicle_id, v.name
         ORDER BY totalCost DESC`,
        [startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]]
      );

      const comparisonData = DatabaseManager.mapRowsToArray<any>(result.rows);
      const comparison = [];

      for (const data of comparisonData) {
        // Get average MPG for this vehicle
        const mpgResult = await db.executeSql(
          `SELECT AVG(mpg) as avgMPG
           FROM fuel_entries
           WHERE vehicle_id = ? AND date BETWEEN ? AND ? AND mpg IS NOT NULL AND mpg > 0`,
          [data.vehicleId, startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]]
        );

        const averageMPG = mpgResult.rows?.[0]?.avgMPG || 0;

        comparison.push({
          vehicleId: data.vehicleId,
          vehicleName: data.vehicleName,
          totalCost: data.totalCost,
          totalFuel: data.totalFuel,
          averageMPG: Math.round(averageMPG * 10) / 10,
          tripsCount: data.tripsCount,
          averageCostPerTrip: data.averageCostPerTrip,
        });
      }

      return comparison;
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
      const db = DatabaseManager.getInstance();

      // Build dynamic query
      const conditions: string[] = [];
      const values: any[] = [];

      if (filters.vehicleId) {
        conditions.push('vehicle_id = ?');
        values.push(filters.vehicleId);
      }

      if (filters.startDate || filters.endDate) {
        if (filters.startDate && filters.endDate) {
          conditions.push('date BETWEEN ? AND ?');
          values.push(filters.startDate.toISOString().split('T')[0]);
          values.push(filters.endDate.toISOString().split('T')[0]);
        } else if (filters.startDate) {
          conditions.push('date >= ?');
          values.push(filters.startDate.toISOString().split('T')[0]);
        } else if (filters.endDate) {
          conditions.push('date <= ?');
          values.push(filters.endDate.toISOString().split('T')[0]);
        }
      }

      if (filters.fuelStation) {
        conditions.push('fuel_station LIKE ?');
        values.push(`%${filters.fuelStation}%`);
      }

      if (filters.minPrice !== undefined) {
        conditions.push('price_per_unit >= ?');
        values.push(filters.minPrice);
      }

      if (filters.maxPrice !== undefined) {
        conditions.push('price_per_unit <= ?');
        values.push(filters.maxPrice);
      }

      if (filters.minAmount !== undefined) {
        conditions.push('amount >= ?');
        values.push(filters.minAmount);
      }

      if (filters.maxAmount !== undefined) {
        conditions.push('amount <= ?');
        values.push(filters.maxAmount);
      }

      if (filters.searchTerm) {
        conditions.push('(notes LIKE ? OR fuel_station LIKE ?)');
        const searchPattern = `%${filters.searchTerm}%`;
        values.push(searchPattern, searchPattern);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      const result = await db.executeSql(
        `SELECT id, vehicle_id as vehicleId, date, amount, quantity, price_per_unit as pricePerUnit,
                mileage, mpg, fuel_station as fuelStation, notes, created_at as createdAt, updated_at as updatedAt
         FROM fuel_entries
         ${whereClause}
         ORDER BY date DESC, created_at DESC`,
        values
      );

      return DatabaseManager.mapRowsToArray<FuelEntry>(result.rows);
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
      const db = DatabaseManager.getInstance();
      const result = await db.executeSql(
        'SELECT DISTINCT fuel_station FROM fuel_entries WHERE fuel_station IS NOT NULL AND fuel_station != "" ORDER BY fuel_station',
        []
      );

      const stations = DatabaseManager.mapRowsToArray<any>(result.rows);
      return stations.map(s => s.fuel_station);
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
      const db = DatabaseManager.getInstance();
      const newEntries: FuelEntry[] = [];

      await db.transaction(async () => {
        for (const formData of formDataList) {
          const created = await this.create(formData);
          newEntries.push(created);
        }
      });

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
      const db = DatabaseManager.getInstance();

      if (entryIds.length === 0) {
        return false;
      }

      const placeholders = entryIds.map(() => '?').join(',');
      const result = await db.executeSql(
        `DELETE FROM fuel_entries WHERE id IN (${placeholders})`,
        entryIds
      );

      return result.rowsAffected && result.rowsAffected > 0;
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
      const db = DatabaseManager.getInstance();
      const updatedEntries: FuelEntry[] = [];

      await db.transaction(async () => {
        for (const { id, formData } of updates) {
          const updated = await this.update(id, formData);
          if (updated) {
            updatedEntries.push(updated);
          }
        }
      });

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
      const db = DatabaseManager.getInstance();
      const result = await db.executeSql(
        `SELECT id, vehicle_id as vehicleId, date, type, description, cost, mileage, notes,
                is_completed as isCompleted, created_at as createdAt, updated_at as updatedAt
         FROM service_records
         ORDER BY date DESC, created_at DESC`
      );
      return DatabaseManager.mapRowsToArray<ServiceRecord>(result.rows);
    } catch (error) {
      handleStorageError(error, 'ServiceService.getAll');
      return [];
    }
  }

  static async getByVehicleId(vehicleId: string): Promise<ServiceRecord[]> {
    try {
      const db = DatabaseManager.getInstance();
      const result = await db.executeSql(
        `SELECT id, vehicle_id as vehicleId, date, type, description, cost, mileage, notes,
                is_completed as isCompleted, created_at as createdAt, updated_at as updatedAt
         FROM service_records
         WHERE vehicle_id = ?
         ORDER BY date DESC, created_at DESC`,
        [vehicleId]
      );
      return DatabaseManager.mapRowsToArray<ServiceRecord>(result.rows);
    } catch (error) {
      handleStorageError(error, 'ServiceService.getByVehicleId');
      return [];
    }
  }

  static async create(formData: ServiceFormData): Promise<ServiceRecord> {
    try {
      const db = DatabaseManager.getInstance();
      const id = generateId();
      const now = getCurrentTimestamp();

      await db.executeSql(
        `INSERT INTO service_records (id, vehicle_id, date, type, description, cost, mileage, notes, is_completed, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`,
        [
          id,
          formData.vehicleId,
          formData.date,
          formData.type.trim(),
          formData.description.trim(),
          parseFloat(formData.cost),
          parseInt(formData.mileage),
          formData.notes?.trim() || null,
          now,
          now
        ]
      );

      return await this.getById(id) as ServiceRecord;
    } catch (error) {
      handleStorageError(error, 'ServiceService.create');
      throw error;
    }
  }

  static async delete(id: string): Promise<boolean> {
    try {
      const db = DatabaseManager.getInstance();
      const result = await db.executeSql('DELETE FROM service_records WHERE id = ?', [id]);
      return result.rowsAffected && result.rowsAffected > 0;
    } catch (error) {
      handleStorageError(error, 'ServiceService.delete');
      throw error;
    }
  }

  static async getById(id: string): Promise<ServiceRecord | null> {
    try {
      const db = DatabaseManager.getInstance();
      const result = await db.executeSql(
        `SELECT id, vehicle_id as vehicleId, date, type, description, cost, mileage, notes,
                is_completed as isCompleted, created_at as createdAt, updated_at as updatedAt
         FROM service_records
         WHERE id = ?`,
        [id]
      );
      const records = DatabaseManager.mapRowsToArray<ServiceRecord>(result.rows);
      return records.length > 0 ? records[0] : null;
    } catch (error) {
      handleStorageError(error, 'ServiceService.getById');
      return null;
    }
  }

  static async update(id: string, formData: ServiceFormData): Promise<ServiceRecord | null> {
    try {
      const db = DatabaseManager.getInstance();
      const now = getCurrentTimestamp();

      await db.executeSql(
        `UPDATE service_records
         SET vehicle_id = ?, date = ?, type = ?, description = ?, cost = ?, mileage = ?, notes = ?, updated_at = ?
         WHERE id = ?`,
        [
          formData.vehicleId,
          formData.date,
          formData.type.trim(),
          formData.description.trim(),
          parseFloat(formData.cost),
          parseInt(formData.mileage),
          formData.notes?.trim() || null,
          now,
          id
        ]
      );

      return await this.getById(id);
    } catch (error) {
      handleStorageError(error, 'ServiceService.update');
      throw error;
    }
  }

  static async deleteByVehicleId(vehicleId: string): Promise<void> {
    try {
      const db = DatabaseManager.getInstance();
      await db.executeSql('DELETE FROM service_records WHERE vehicle_id = ?', [vehicleId]);
    } catch (error) {
      handleStorageError(error, 'ServiceService.deleteByVehicleId');
      throw error;
    }
  }
}

/**
 * Data Management operations for clearing data
 */
export class DataService {
  /**
   * Clear all app data - vehicles, fuel entries, and service records
   * This is used when changing regions or for a complete reset
   */
  static async clearAllData(): Promise<void> {
    try {
      console.log('🗑️ Starting to clear all app data...');
      const db = DatabaseManager.getInstance();

      await db.transaction(async () => {
        await db.executeSql('DELETE FROM fuel_entries');
        await db.executeSql('DELETE FROM service_records');
        await db.executeSql('DELETE FROM vehicles');
      });

      console.log('✅ All app data cleared successfully');
    } catch (error) {
      console.error('❌ Error clearing all data:', error);
      handleStorageError(error, 'clearAllData');
      throw error;
    }
  }

  /**
   * Get data statistics for debugging and validation
   */
  static async getDataStats(): Promise<{
    vehiclesCount: number;
    fuelEntriesCount: number;
    serviceRecordsCount: number;
  }> {
    try {
      const db = DatabaseManager.getInstance();
      const [vehicleResult, fuelResult, serviceResult] = await Promise.all([
        db.executeSql('SELECT COUNT(*) as count FROM vehicles'),
        db.executeSql('SELECT COUNT(*) as count FROM fuel_entries'),
        db.executeSql('SELECT COUNT(*) as count FROM service_records')
      ]);

      return {
        vehiclesCount: vehicleResult.rows?.[0]?.count || 0,
        fuelEntriesCount: fuelResult.rows?.[0]?.count || 0,
        serviceRecordsCount: serviceResult.rows?.[0]?.count || 0,
      };
    } catch (error) {
      console.error('❌ Error getting data stats:', error);
      return {
        vehiclesCount: 0,
        fuelEntriesCount: 0,
        serviceRecordsCount: 0,
      };
    }
  }
}

/**
 * Dashboard and summary operations
 */
export class DashboardService {
  static async getSummary(): Promise<DashboardSummary> {
    try {
      const db = DatabaseManager.getInstance();
      const [vehicleResult, monthlyFuelResult] = await Promise.all([
        db.executeSql(
          'SELECT COUNT(*) as total, SUM(CASE WHEN status = "active" THEN 1 ELSE 0 END) as active FROM vehicles'
        ),
        db.executeSql(
          'SELECT COALESCE(SUM(amount), 0) as total FROM fuel_entries WHERE date >= date("now", "start of month")'
        )
      ]);

      const vehicleData = vehicleResult.rows?.[0] || {};
      const monthlyFuelCost = monthlyFuelResult.rows?.[0]?.total || 0;

      return {
        totalVehicles: vehicleData.total || 0,
        activeVehicles: vehicleData.active || 0,
        monthlyFuelCost: Math.round(monthlyFuelCost * 100) / 100, // Round to 2 decimal places
        upcomingServices: 0, // TODO: Implement service due calculation
        totalMileage: 0, // TODO: Calculate total mileage from latest entries
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
      const db = DatabaseManager.getInstance();
      const [fuelResult, serviceResult] = await Promise.all([
        db.executeSql(
          `SELECT id, amount, created_at
           FROM fuel_entries
           ORDER BY created_at DESC
           LIMIT 5`,
          []
        ),
        db.executeSql(
          `SELECT id, type, cost, created_at
           FROM service_records
           ORDER BY created_at DESC
           LIMIT 5`,
          []
        )
      ]);

      const fuelActivities = DatabaseManager.mapRowsToArray<any>(fuelResult.rows).map(entry => ({
        id: entry.id,
        type: 'fuel' as const,
        title: 'Fuel Fill-up',
        subtitle: `Rp ${entry.amount.toLocaleString('id-ID')}`,
        time: this.formatRelativeTime(entry.created_at),
        icon: 'fuelpump.fill',
        color: '#007AFF',
      }));

      const serviceActivities = DatabaseManager.mapRowsToArray<any>(serviceResult.rows).map(record => ({
        id: record.id,
        type: 'service' as const,
        title: record.type,
        subtitle: `Rp ${record.cost.toLocaleString('id-ID')}`,
        time: this.formatRelativeTime(record.created_at),
        icon: 'wrench.fill',
        color: '#34C759',
      }));

      // Sort by creation time (most recent first) and limit
      return [...fuelActivities, ...serviceActivities]
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