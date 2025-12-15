import { DatabaseManager } from './DatabaseManager';
import { Vehicle, FuelEntry, ServiceRecord } from '@/types/data';
import SafeAsyncStorage from '@/utils/asyncStorageWrapper';

interface AsyncStorageBackup {
  vehicles: Vehicle[];
  fuelEntries: FuelEntry[];
  serviceRecords: ServiceRecord[];
  region: string | null;
  themeMode: string | null;
}

export class MigrationService {
  private static readonly MIGRATION_VERSION = '1.0.0';
  private static readonly BACKUP_KEY = 'myventi_migration_backup';

  /**
   * Check if migration has already been completed
   */
  static async isMigrated(): Promise<boolean> {
    try {
      const db = DatabaseManager.getInstance();
      const result = await db.executeSql(
        'SELECT 1 FROM migration_log WHERE version = ? AND success = 1',
        [this.MIGRATION_VERSION]
      );

      return result.rows && result.rows.length > 0;
    } catch (error) {
      // If table doesn't exist, migration hasn't run
      return false;
    }
  }

  /**
   * Create backup of AsyncStorage data
   */
  static async backupAsyncStorage(): Promise<AsyncStorageBackup> {
    console.log('Creating AsyncStorage backup...');

    const storageKeys = {
      VEHICLES: 'myventi_vehicles',
      FUEL_ENTRIES: 'myventi_fuel_entries',
      SERVICE_RECORDS: 'myventi_service_records',
      REGION: 'myVenti_region',
      THEME_MODE: 'app_theme_mode'
    };

    const backup: AsyncStorageBackup = {
      vehicles: [],
      fuelEntries: [],
      serviceRecords: [],
      region: null,
      themeMode: null
    };

    try {
      // Backup vehicles
      const vehiclesData = await SafeAsyncStorage.getItem(storageKeys.VEHICLES);
      if (vehiclesData) {
        backup.vehicles = JSON.parse(vehiclesData);
      }

      // Backup fuel entries
      const fuelEntriesData = await SafeAsyncStorage.getItem(storageKeys.FUEL_ENTRIES);
      if (fuelEntriesData) {
        backup.fuelEntries = JSON.parse(fuelEntriesData);
      }

      // Backup service records
      const serviceRecordsData = await SafeAsyncStorage.getItem(storageKeys.SERVICE_RECORDS);
      if (serviceRecordsData) {
        backup.serviceRecords = JSON.parse(serviceRecordsData);
      }

      // Backup region
      backup.region = await SafeAsyncStorage.getItem(storageKeys.REGION);

      // Backup theme mode
      backup.themeMode = await SafeAsyncStorage.getItem(storageKeys.THEME_MODE);

      // Store backup in AsyncStorage
      await SafeAsyncStorage.setItem(this.BACKUP_KEY, JSON.stringify(backup));

      console.log('Backup created successfully');
      return backup;
    } catch (error) {
      console.error('Failed to create backup:', error);
      throw error;
    }
  }

  /**
   * Restore data from backup
   */
  static async restoreFromBackup(): Promise<void> {
    try {
      console.log('Restoring from backup...');

      const backupData = await SafeAsyncStorage.getItem(this.BACKUP_KEY);
      if (!backupData) {
        throw new Error('No backup found');
      }

      const backup: AsyncStorageBackup = JSON.parse(backupData);
      const storageKeys = {
        VEHICLES: 'myventi_vehicles',
        FUEL_ENTRIES: 'myventi_fuel_entries',
        SERVICE_RECORDS: 'myventi_service_records',
        REGION: 'myVenti_region',
        THEME_MODE: 'app_theme_mode'
      };

      // Restore data to AsyncStorage
      await SafeAsyncStorage.setItem(storageKeys.VEHICLES, JSON.stringify(backup.vehicles));
      await SafeAsyncStorage.setItem(storageKeys.FUEL_ENTRIES, JSON.stringify(backup.fuelEntries));
      await SafeAsyncStorage.setItem(storageKeys.SERVICE_RECORDS, JSON.stringify(backup.serviceRecords));

      if (backup.region) {
        await SafeAsyncStorage.setItem(storageKeys.REGION, backup.region);
      }

      if (backup.themeMode) {
        await SafeAsyncStorage.setItem(storageKeys.THEME_MODE, backup.themeMode);
      }

      console.log('Successfully restored from backup');
    } catch (error) {
      console.error('Failed to restore from backup:', error);
      throw error;
    }
  }

  /**
   * Main migration method
   */
  static async migrateFromAsyncStorage(): Promise<void> {
    try {
      console.log('Starting migration from AsyncStorage to SQLite...');

      // 1. Check if already migrated
      if (await this.isMigrated()) {
        console.log('Migration already completed');
        return;
      }

      // 2. Initialize database
      await DatabaseManager.getInstance().initDatabase();

      // 3. Create backup
      const backup = await this.backupAsyncStorage();

      // 4. Validate backup data
      if (!this.validateBackupData(backup)) {
        throw new Error('Invalid backup data');
      }

      // 5. Perform migration in transaction
      await DatabaseManager.getInstance().transaction(async () => {
        await this.migrateVehicles(backup.vehicles);
        await this.migrateFuelEntries(backup.fuelEntries);
        await this.migrateServiceRecords(backup.serviceRecords);
        await this.migrateSettings(backup.region, backup.themeMode);
      });

      // 6. Mark migration complete
      await this.markMigrationComplete(true);

      // 7. Verify migration
      await this.verifyMigration(backup);

      console.log('Migration completed successfully');
    } catch (error) {
      console.error('Migration failed:', error);

      // Mark migration as failed
      try {
        await this.markMigrationComplete(false);
      } catch (logError) {
        console.error('Failed to log migration failure:', logError);
      }

      throw error;
    }
  }

  /**
   * Migrate vehicles to SQLite
   */
  private static async migrateVehicles(vehicles: Vehicle[]): Promise<void> {
    console.log(`Migrating ${vehicles.length} vehicles...`);

    const db = DatabaseManager.getInstance();

    for (const vehicle of vehicles) {
      await db.executeSql(
        `INSERT INTO vehicles (id, name, year, make, model, type, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          vehicle.id,
          vehicle.name,
          vehicle.year,
          vehicle.make,
          vehicle.model,
          vehicle.type,
          vehicle.status || 'active',
          vehicle.createdAt || new Date().toISOString(),
          vehicle.updatedAt || new Date().toISOString()
        ]
      );
    }
  }

  /**
   * Migrate fuel entries to SQLite
   */
  private static async migrateFuelEntries(fuelEntries: FuelEntry[]): Promise<void> {
    console.log(`Migrating ${fuelEntries.length} fuel entries...`);

    const db = DatabaseManager.getInstance();

    for (const entry of fuelEntries) {
      await db.executeSql(
        `INSERT INTO fuel_entries (id, vehicle_id, date, amount, quantity, price_per_unit, mileage, mpg, fuel_station, notes, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          entry.id,
          entry.vehicleId,
          entry.date,
          entry.amount,
          entry.quantity,
          entry.pricePerUnit,
          entry.mileage,
          entry.mpg || null,
          entry.fuelStation || null,
          entry.notes || null,
          entry.createdAt || new Date().toISOString(),
          entry.updatedAt || new Date().toISOString()
        ]
      );
    }
  }

  /**
   * Migrate service records to SQLite
   */
  private static async migrateServiceRecords(serviceRecords: ServiceRecord[]): Promise<void> {
    console.log(`Migrating ${serviceRecords.length} service records...`);

    const db = DatabaseManager.getInstance();

    for (const record of serviceRecords) {
      await db.executeSql(
        `INSERT INTO service_records (id, vehicle_id, date, type, description, cost, mileage, notes, is_completed, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          record.id,
          record.vehicleId,
          record.date,
          record.type,
          record.description,
          record.cost,
          record.mileage,
          record.notes || null,
          record.isCompleted ? 1 : 0,
          record.createdAt || new Date().toISOString(),
          record.updatedAt || new Date().toISOString()
        ]
      );
    }
  }

  /**
   * Migrate app settings
   */
  private static async migrateSettings(region: string | null, themeMode: string | null): Promise<void> {
    console.log('Migrating app settings...');

    const db = DatabaseManager.getInstance();

    if (region) {
      await db.executeSql(
        'UPDATE app_settings SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE key = ?',
        [region, 'region']
      );
    }

    if (themeMode) {
      await db.executeSql(
        'UPDATE app_settings SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE key = ?',
        [themeMode, 'theme_mode']
      );
    }
  }

  /**
   * Mark migration as complete (or failed)
   */
  private static async markMigrationComplete(success: boolean): Promise<void> {
    const db = DatabaseManager.getInstance();
    await db.executeSql(
      'INSERT INTO migration_log (version, success) VALUES (?, ?)',
      [this.MIGRATION_VERSION, success ? 1 : 0]
    );
  }

  /**
   * Validate backup data integrity
   */
  private static validateBackupData(backup: AsyncStorageBackup): boolean {
    // Check vehicles
    for (const vehicle of backup.vehicles) {
      if (!vehicle.id || !vehicle.name || !vehicle.make || !vehicle.model) {
        console.error('Invalid vehicle data:', vehicle);
        return false;
      }
    }

    // Check fuel entries
    for (const entry of backup.fuelEntries) {
      if (!entry.id || !entry.vehicleId || !entry.date || entry.amount < 0 || entry.quantity < 0) {
        console.error('Invalid fuel entry data:', entry);
        return false;
      }
    }

    // Check service records
    for (const record of backup.serviceRecords) {
      if (!record.id || !record.vehicleId || !record.date || !record.type || !record.description) {
        console.error('Invalid service record data:', record);
        return false;
      }
    }

    return true;
  }

  /**
   * Verify migration was successful
   */
  private static async verifyMigration(backup: AsyncStorageBackup): Promise<void> {
    console.log('Verifying migration...');

    const db = DatabaseManager.getInstance();

    // Verify vehicles count
    const vehicleResult = await db.executeSql('SELECT COUNT(*) as count FROM vehicles');
    const vehicleCount = vehicleResult.rows?.[0]?.count || 0;
    if (vehicleCount !== backup.vehicles.length) {
      throw new Error(`Vehicle count mismatch: expected ${backup.vehicles.length}, got ${vehicleCount}`);
    }

    // Verify fuel entries count
    const fuelResult = await db.executeSql('SELECT COUNT(*) as count FROM fuel_entries');
    const fuelCount = fuelResult.rows?.[0]?.count || 0;
    if (fuelCount !== backup.fuelEntries.length) {
      throw new Error(`Fuel entry count mismatch: expected ${backup.fuelEntries.length}, got ${fuelCount}`);
    }

    // Verify service records count
    const serviceResult = await db.executeSql('SELECT COUNT(*) as count FROM service_records');
    const serviceCount = serviceResult.rows?.[0]?.count || 0;
    if (serviceCount !== backup.serviceRecords.length) {
      throw new Error(`Service record count mismatch: expected ${backup.serviceRecords.length}, got ${serviceCount}`);
    }

    console.log('Migration verification successful');
  }

  /**
   * Clear backup data from AsyncStorage
   */
  static async clearBackup(): Promise<void> {
    try {
      await SafeAsyncStorage.removeItem(this.BACKUP_KEY);
      console.log('Backup cleared from AsyncStorage');
    } catch (error) {
      console.error('Failed to clear backup:', error);
    }
  }

  /**
   * Rollback migration by restoring from backup
   */
  static async rollback(): Promise<void> {
    try {
      console.log('Starting migration rollback...');

      // Check if backup exists
      const backupData = await SafeAsyncStorage.getItem(this.BACKUP_KEY);
      if (!backupData) {
        throw new Error('No backup available for rollback');
      }

      // Close database connection
      await DatabaseManager.getInstance().closeDatabase();

      // Restore from backup
      await this.restoreFromBackup();

      console.log('Rollback completed successfully');
    } catch (error) {
      console.error('Rollback failed:', error);
      throw error;
    }
  }
}