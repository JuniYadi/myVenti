/**
 * Migration tests for AsyncStorage to SQLite migration
 */

import { MigrationService } from '@/services/MigrationService';
import { DatabaseManager } from '@/services/DatabaseManager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Vehicle, FuelEntry, ServiceRecord } from '@/types/data';

// Mock DatabaseManager
jest.mock('@/services/DatabaseManager', () => ({
  DatabaseManager: {
    getInstance: jest.fn(() => ({
      initDatabase: jest.fn(),
      executeSql: jest.fn(),
      transaction: jest.fn((callback) => callback()),
    })),
  },
}));

// Mock console methods to avoid noise in test output
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
beforeAll(() => {
  console.log = jest.fn();
  console.error = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
});

describe('MigrationService', () => {
  const mockVehicles: Vehicle[] = [
    {
      id: 'v1',
      name: 'Test Car',
      year: 2020,
      make: 'Toyota',
      model: 'Camry',
      type: 'gas',
      status: 'active',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
  ];

  const mockFuelEntries: FuelEntry[] = [
    {
      id: 'f1',
      vehicleId: 'v1',
      date: '2024-01-01',
      amount: 50.0,
      quantity: 10.0,
      pricePerUnit: 5.0,
      mileage: 1000,
      mpg: 30.0,
      fuelStation: 'Shell',
      notes: 'Test fill-up',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
  ];

  const mockServiceRecords: ServiceRecord[] = [
    {
      id: 's1',
      vehicleId: 'v1',
      date: '2024-01-01',
      type: 'Oil Change',
      description: 'Regular oil change',
      cost: 30.0,
      mileage: 1000,
      notes: 'Test service',
      isCompleted: true,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isMigrated', () => {
    it('should return false if migration log is empty', async () => {
      const mockExecuteSql = jest.fn()
        .mockResolvedValueOnce({ rows: [] }); // No migration log entries

      const mockDb = {
        executeSql: mockExecuteSql,
      };

      (DatabaseManager.getInstance as jest.Mock).mockReturnValue(mockDb);

      const isMigrated = await MigrationService.isMigrated();
      expect(isMigrated).toBe(false);
    });

    it('should return true if migration is logged as successful', async () => {
      const mockExecuteSql = jest.fn()
        .mockResolvedValueOnce({ rows: [{ success: 1 }] }); // Migration successful

      const mockDb = {
        executeSql: mockExecuteSql,
      };

      (DatabaseManager.getInstance as jest.Mock).mockReturnValue(mockDb);

      const isMigrated = await MigrationService.isMigrated();
      expect(isMigrated).toBe(true);
    });
  });

  describe('backupAsyncStorage', () => {
    beforeEach(() => {
      // Clear AsyncStorage before each test
      AsyncStorage.clear();
    });

    it('should create backup of all AsyncStorage data', async () => {
      // Setup test data in AsyncStorage
      await AsyncStorage.setItem('myventi_vehicles', JSON.stringify(mockVehicles));
      await AsyncStorage.setItem('myventi_fuel_entries', JSON.stringify(mockFuelEntries));
      await AsyncStorage.setItem('myventi_service_records', JSON.stringify(mockServiceRecords));
      await AsyncStorage.setItem('myVenti_region', 'US');
      await AsyncStorage.setItem('app_theme_mode', 'dark');

      const backup = await MigrationService.backupAsyncStorage();

      expect(backup).toEqual({
        vehicles: mockVehicles,
        fuelEntries: mockFuelEntries,
        serviceRecords: mockServiceRecords,
        region: 'US',
        themeMode: 'dark',
      });

      // Verify backup is stored in AsyncStorage
      const storedBackup = await AsyncStorage.getItem('myventi_migration_backup');
      expect(JSON.parse(storedBackup!)).toEqual(backup);
    });

    it('should handle empty AsyncStorage gracefully', async () => {
      const backup = await MigrationService.backupAsyncStorage();

      expect(backup).toEqual({
        vehicles: [],
        fuelEntries: [],
        serviceRecords: [],
        region: null,
        themeMode: null,
      });
    });
  });

  describe('validateBackupData', () => {
    it('should validate correct backup data', () => {
      const validBackup = {
        vehicles: mockVehicles,
        fuelEntries: mockFuelEntries,
        serviceRecords: mockServiceRecords,
        region: 'US',
        themeMode: 'dark',
      };

      // Access private method for testing
      const validateFn = (MigrationService as any).validateBackupData.bind(MigrationService);
      expect(validateFn(validBackup)).toBe(true);
    });

    it('should reject invalid vehicle data', () => {
      const invalidBackup = {
        vehicles: [{ ...mockVehicles[0], id: undefined }], // Missing required field
        fuelEntries: mockFuelEntries,
        serviceRecords: mockServiceRecords,
        region: 'US',
        themeMode: 'dark',
      };

      const validateFn = (MigrationService as any).validateBackupData.bind(MigrationService);
      expect(validateFn(invalidBackup)).toBe(false);
    });

    it('should reject invalid fuel entry data', () => {
      const invalidBackup = {
        vehicles: mockVehicles,
        fuelEntries: [{ ...mockFuelEntries[0], amount: -10 }], // Invalid amount
        serviceRecords: mockServiceRecords,
        region: 'US',
        themeMode: 'dark',
      };

      const validateFn = (MigrationService as any).validateBackupData.bind(MigrationService);
      expect(validateFn(invalidBackup)).toBe(false);
    });
  });

  describe('migrateFromAsyncStorage', () => {
    beforeEach(async () => {
      // Clear AsyncStorage and setup test data
      await AsyncStorage.clear();
      await AsyncStorage.setItem('myventi_vehicles', JSON.stringify(mockVehicles));
      await AsyncStorage.setItem('myventi_fuel_entries', JSON.stringify(mockFuelEntries));
      await AsyncStorage.setItem('myventi_service_records', JSON.stringify(mockServiceRecords));
      await AsyncStorage.setItem('myVenti_region', 'US');
      await AsyncStorage.setItem('app_theme_mode', 'dark');
    });

    it('should skip migration if already migrated', async () => {
      // Mock isMigrated to return true
      const isMigratedSpy = jest.spyOn(MigrationService, 'isMigrated');
      isMigratedSpy.mockResolvedValue(true);

      const backupSpy = jest.spyOn(MigrationService, 'backupAsyncStorage');

      await MigrationService.migrateFromAsyncStorage();

      expect(isMigratedSpy).toHaveBeenCalled();
      expect(backupSpy).not.toHaveBeenCalled();
    });

    it('should perform full migration if not migrated', async () => {
      // Mock isMigrated to return false
      const isMigratedSpy = jest.spyOn(MigrationService, 'isMigrated');
      isMigratedSpy.mockResolvedValue(false);

      // Mock database operations
      const mockExecuteSql = jest.fn();
      const mockDb = {
        initDatabase: jest.fn(),
        executeSql: mockExecuteSql,
        transaction: jest.fn((callback) => callback()),
      };

      (DatabaseManager.getInstance as jest.Mock).mockReturnValue(mockDb);

      // Mock successful execution for all SQL queries
      mockExecuteSql.mockResolvedValue({ rowsAffected: 1, rows: [] });

      await MigrationService.migrateFromAsyncStorage();

      // Verify migration steps
      expect(mockDb.initDatabase).toHaveBeenCalled();
      expect(isMigratedSpy).toHaveBeenCalled();
      expect(mockExecuteSql).toHaveBeenCalledWith(
        'INSERT INTO vehicles (id, name, year, make, model, type, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        expect.any(Array)
      );
      expect(mockExecuteSql).toHaveBeenCalledWith(
        'INSERT INTO fuel_entries (id, vehicle_id, date, amount, quantity, price_per_unit, mileage, mpg, fuel_station, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        expect.any(Array)
      );
      expect(mockExecuteSql).toHaveBeenCalledWith(
        'INSERT INTO service_records (id, vehicle_id, date, type, description, cost, mileage, notes, is_completed, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        expect.any(Array)
      );
      expect(mockExecuteSql).toHaveBeenCalledWith(
        'INSERT INTO migration_log (version, success) VALUES (?, ?)',
        ['1.0.0', 1]
      );
    });

    it('should handle migration errors gracefully', async () => {
      // Mock isMigrated to return false
      const isMigratedSpy = jest.spyOn(MigrationService, 'isMigrated');
      isMigratedSpy.mockResolvedValue(false);

      // Mock database to throw an error
      const mockDb = {
        initDatabase: jest.fn(),
        executeSql: jest.fn().mockRejectedValue(new Error('Database error')),
        transaction: jest.fn((callback) => callback()),
      };

      (DatabaseManager.getInstance as jest.Mock).mockReturnValue(mockDb);

      await expect(MigrationService.migrateFromAsyncStorage()).rejects.toThrow('Database error');

      // Verify error is logged
      expect(console.error).toHaveBeenCalledWith('Migration failed:', expect.any(Error));
    });
  });

  describe('restoreFromBackup', () => {
    it('should restore data from backup', async () => {
      // Setup backup
      const backup = {
        vehicles: mockVehicles,
        fuelEntries: mockFuelEntries,
        serviceRecords: mockServiceRecords,
        region: 'US',
        themeMode: 'dark',
      };
      await AsyncStorage.setItem('myventi_migration_backup', JSON.stringify(backup));

      // Clear original data
      await AsyncStorage.multiRemove([
        'myventi_vehicles',
        'myventi_fuel_entries',
        'myventi_service_records',
        'myVenti_region',
        'app_theme_mode',
      ]);

      await MigrationService.restoreFromBackup();

      // Verify data is restored
      expect(await AsyncStorage.getItem('myventi_vehicles')).toBe(JSON.stringify(mockVehicles));
      expect(await AsyncStorage.getItem('myventi_fuel_entries')).toBe(JSON.stringify(mockFuelEntries));
      expect(await AsyncStorage.getItem('myventi_service_records')).toBe(JSON.stringify(mockServiceRecords));
      expect(await AsyncStorage.getItem('myVenti_region')).toBe('US');
      expect(await AsyncStorage.getItem('app_theme_mode')).toBe('dark');
    });

    it('should throw error if no backup exists', async () => {
      await expect(MigrationService.restoreFromBackup()).rejects.toThrow('No backup found');
    });
  });

  describe('rollback', () => {
    it('should rollback migration and restore from backup', async () => {
      // Setup backup
      const backup = {
        vehicles: mockVehicles,
        fuelEntries: mockFuelEntries,
        serviceRecords: mockServiceRecords,
        region: 'US',
        themeMode: 'dark',
      };
      await AsyncStorage.setItem('myventi_migration_backup', JSON.stringify(backup));

      // Mock database close
      const mockDb = {
        closeDatabase: jest.fn(),
      };

      (DatabaseManager.getInstance as jest.Mock).mockReturnValue(mockDb);

      const restoreSpy = jest.spyOn(MigrationService, 'restoreFromBackup');

      await MigrationService.rollback();

      expect(mockDb.closeDatabase).toHaveBeenCalled();
      expect(restoreSpy).toHaveBeenCalled();
    });

    it('should throw error if no backup available for rollback', async () => {
      await expect(MigrationService.rollback()).rejects.toThrow('No backup available for rollback');
    });
  });

  describe('clearBackup', () => {
    it('should clear backup from AsyncStorage', async () => {
      // Setup backup
      const backup = {
        vehicles: mockVehicles,
        fuelEntries: mockFuelEntries,
        serviceRecords: mockServiceRecords,
        region: 'US',
        themeMode: 'dark',
      };
      await AsyncStorage.setItem('myventi_migration_backup', JSON.stringify(backup));

      await MigrationService.clearBackup();

      // Verify backup is cleared
      const storedBackup = await AsyncStorage.getItem('myventi_migration_backup');
      expect(storedBackup).toBeNull();
    });
  });
});