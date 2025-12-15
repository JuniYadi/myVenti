import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

export interface DatabaseResult {
  insertId?: number;
  rows?: any[];
  rowsAffected?: number;
}

export class DatabaseManager {
  private static instance: DatabaseManager;
  private database: SQLite.SQLiteDatabase | null = null;
  readonly DB_NAME = 'myVenti.db';
  readonly DB_VERSION = '1.0.0';

  static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  async initDatabase(): Promise<void> {
    try {
      if (this.database) {
        console.log('Database already initialized');
        return;
      }

      console.log('Initializing database...');

      // Open database
      this.database = await SQLite.openDatabaseAsync(this.DB_NAME);

      // Enable foreign keys
      await this.executeSql('PRAGMA foreign_keys = ON');

      // Create tables
      await this.createTables();

      // Insert default settings
      await this.insertDefaultSettings();

      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    const tables = [
      // Vehicles table
      `CREATE TABLE IF NOT EXISTS vehicles (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        year INTEGER NOT NULL,
        make TEXT NOT NULL,
        model TEXT NOT NULL,
        type TEXT CHECK(type IN ('gas', 'electric', 'hybrid')) NOT NULL,
        status TEXT CHECK(status IN ('active', 'inactive')) DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Fuel entries table
      `CREATE TABLE IF NOT EXISTS fuel_entries (
        id TEXT PRIMARY KEY,
        vehicle_id TEXT NOT NULL,
        date DATE NOT NULL,
        amount REAL NOT NULL,
        quantity REAL NOT NULL,
        price_per_unit REAL NOT NULL,
        mileage INTEGER NOT NULL,
        mpg REAL,
        fuel_station TEXT,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
      )`,

      // Service records table
      `CREATE TABLE IF NOT EXISTS service_records (
        id TEXT PRIMARY KEY,
        vehicle_id TEXT NOT NULL,
        date DATE NOT NULL,
        type TEXT NOT NULL,
        description TEXT NOT NULL,
        cost REAL NOT NULL,
        mileage INTEGER NOT NULL,
        notes TEXT,
        is_completed BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
      )`,

      // App settings table
      `CREATE TABLE IF NOT EXISTS app_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Migration log table
      `CREATE TABLE IF NOT EXISTS migration_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        version TEXT NOT NULL,
        applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        success BOOLEAN NOT NULL
      )`
    ];

    const indexes = [
      // Vehicle indexes
      'CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status)',
      'CREATE INDEX IF NOT EXISTS idx_vehicles_type ON vehicles(type)',

      // Fuel entry indexes
      'CREATE INDEX IF NOT EXISTS idx_fuel_vehicle_id ON fuel_entries(vehicle_id)',
      'CREATE INDEX IF NOT EXISTS idx_fuel_date ON fuel_entries(date)',
      'CREATE INDEX IF NOT EXISTS idx_fuel_vehicle_date ON fuel_entries(vehicle_id, date)',
      'CREATE INDEX IF NOT EXISTS idx_fuel_mileage ON fuel_entries(mileage)',
      'CREATE INDEX IF NOT EXISTS idx_fuel_station ON fuel_entries(fuel_station)',

      // Service record indexes
      'CREATE INDEX IF NOT EXISTS idx_service_vehicle_id ON service_records(vehicle_id)',
      'CREATE INDEX IF NOT EXISTS idx_service_date ON service_records(date)',
      'CREATE INDEX IF NOT EXISTS idx_service_vehicle_date ON service_records(vehicle_id, date)',
      'CREATE INDEX IF NOT EXISTS idx_service_type ON service_records(type)'
    ];

    // Create tables
    for (const table of tables) {
      await this.executeSql(table);
    }

    // Create indexes
    for (const index of indexes) {
      await this.executeSql(index);
    }
  }

  private async insertDefaultSettings(): Promise<void> {
    const defaultSettings = [
      ['region', 'ID'],
      ['theme_mode', 'system']
    ];

    for (const [key, value] of defaultSettings) {
      await this.executeSql(
        'INSERT OR IGNORE INTO app_settings (key, value) VALUES (?, ?)',
        [key, value]
      );
    }
  }

  async executeSql(query: string, params?: any[]): Promise<DatabaseResult> {
    if (!this.database) {
      throw new Error('Database not initialized. Call initDatabase() first.');
    }

    try {
      console.log(`Executing SQL: ${query}`, params || []);
      const result = await this.database.execAsync([{ args: params || [], sql: query }]);

      // Transform the result to match expected format
      const transformedResult: DatabaseResult = {
        rowsAffected: 0
      };

      for (const statement of result) {
        if (statement.rows) {
          transformedResult.rows = statement.rows;
          transformedResult.rowsAffected = statement.rowsAffected || 0;
        }
        if (statement.insertId) {
          transformedResult.insertId = statement.insertId;
        }
      }

      return transformedResult;
    } catch (error) {
      console.error('SQL execution error:', error);
      console.error('Query:', query);
      console.error('Params:', params);
      throw error;
    }
  }

  async transaction<T>(callback: () => Promise<T>): Promise<T> {
    if (!this.database) {
      throw new Error('Database not initialized. Call initDatabase() first.');
    }

    try {
      await this.executeSql('BEGIN TRANSACTION');
      const result = await callback();
      await this.executeSql('COMMIT');
      return result;
    } catch (error) {
      await this.executeSql('ROLLBACK');
      throw error;
    }
  }

  async closeDatabase(): Promise<void> {
    if (this.database) {
      await this.database.closeAsync();
      this.database = null;
      console.log('Database closed');
    }
  }

  // Helper method to map database rows to objects
  static mapRowToObject<T>(row: any): T {
    return row as T;
  }

  static mapRowsToArray<T>(rows: any[] | undefined): T[] {
    if (!rows || !Array.isArray(rows)) {
      return [];
    }
    return rows.map(row => row as T);
  }
}