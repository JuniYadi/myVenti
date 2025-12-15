
// Type definitions for SQLite to avoid import errors
interface SQLiteRunResult {
  lastInsertRowId: number;
  changes: number;
}

interface SQLiteDatabase {
  closeAsync(): Promise<void>;
  execAsync(sql: string): Promise<void>;
  runAsync(sql: string, params?: any[]): Promise<SQLiteRunResult>;
  getAllAsync<T = any>(sql: string, params?: any[]): Promise<T[]>;
  getFirstAsync<T = any>(sql: string, params?: any[]): Promise<T | null>;
}

interface SQLiteStatic {
  openDatabaseAsync(name: string): Promise<SQLiteDatabase>;
}

export interface DatabaseResult {
  insertId?: number;
  rows?: any[];
  rowsAffected?: number;
}

export class DatabaseManager {
  private static instance: DatabaseManager;
  private database: SQLiteDatabase | null = null;
  private isSQLiteAvailable: boolean = true;
  private fallbackStorage: { [key: string]: any } = {};
  private SQLite: SQLiteStatic | null = null;
  readonly DB_NAME = 'myVenti.db';
  readonly DB_VERSION = '1.0.0';

  static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  async initDatabase(): Promise<void> {
    // Return early if already initialized
    if (this.database || this.isSQLiteAvailable === false) {
      return;
    }

    console.log('Initializing database...');

    // Check if SQLite is available by trying to import it dynamically
    try {
      // Use dynamic import instead of require for better error handling
      const SQLiteModule = await import('expo-sqlite');
      this.SQLite = SQLiteModule.default || SQLiteModule;
      this.isSQLiteAvailable = true;
      console.log('SQLite module loaded successfully');
    } catch (sqliteImportError) {
      console.warn('SQLite module not available, falling back to memory storage:', sqliteImportError);
      this.isSQLiteAvailable = false;
      this.initFallbackStorage();
      return;
    }

    // Try to open database if SQLite is available
    if (this.isSQLiteAvailable && this.SQLite) {
      try {
        this.database = await this.SQLite.openDatabaseAsync(this.DB_NAME);
        console.log('SQLite database opened successfully');

        // Enable foreign keys (optional, continue if it fails)
        try {
          await this.executeSql('PRAGMA foreign_keys = ON');
          console.log('Foreign keys enabled successfully');
        } catch (pragmaError) {
          console.warn('Failed to enable foreign keys (continuing anyway):', pragmaError);
          // Continue without foreign keys - not critical for basic functionality
        }

        // Create tables
        await this.createTables();

        // Insert default settings
        await this.insertDefaultSettings();

        console.log('Database initialized successfully');
      } catch (sqliteError) {
        console.warn('Failed to open SQLite database, falling back to memory storage:', sqliteError);
        this.isSQLiteAvailable = false;
        this.database = null;
        this.initFallbackStorage();
      }
    }
  }

  private initFallbackStorage(): void {
    console.log('Initializing fallback memory storage');
    // Initialize default settings in fallback storage
    this.fallbackStorage['app_settings'] = [
      { key: 'region', value: 'ID' },
      { key: 'theme_mode', value: 'system' }
    ];
    this.fallbackStorage['vehicles'] = [];
    this.fallbackStorage['fuel_entries'] = [];
    this.fallbackStorage['service_records'] = [];
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
    // If SQLite is not available, use fallback storage
    if (!this.isSQLiteAvailable || !this.database || !this.SQLite) {
      return this.executeFallbackSql(query, params);
    }

    try {
      const trimmedQuery = query.trim().toLowerCase();

      // Determine query type and use appropriate method
      if (trimmedQuery.startsWith('select')) {
        // SELECT queries - use getAllAsync
        const rows = await this.database.getAllAsync(query, params || []);
        return {
          rows: rows,
          rowsAffected: rows.length
        };
      } else if (
        trimmedQuery.startsWith('insert') ||
        trimmedQuery.startsWith('update') ||
        trimmedQuery.startsWith('delete')
      ) {
        // INSERT/UPDATE/DELETE - use runAsync
        const result = await this.database.runAsync(query, params || []);
        return {
          insertId: result.lastInsertRowId,
          rowsAffected: result.changes
        };
      } else {
        // DDL statements (CREATE, DROP, PRAGMA, etc.) - use execAsync
        // Note: execAsync doesn't support parameters, so we substitute them manually if needed
        if (params && params.length > 0) {
          // For PRAGMA and other statements that might have params, use runAsync
          const result = await this.database.runAsync(query, params);
          return {
            rowsAffected: result.changes
          };
        } else {
          await this.database.execAsync(query);
          return {
            rowsAffected: 0
          };
        }
      }
    } catch (error) {
      console.error('SQL execution error:', error);
      console.error('Query:', query);
      console.error('Params:', params || 'undefined');
      // If SQL execution fails, fall back to memory storage
      console.warn('Falling back to memory storage due to SQL execution error');
      this.isSQLiteAvailable = false;
      this.database = null;
      return this.executeFallbackSql(query, params);
    }
  }

  private executeFallbackSql(query: string, params?: any[]): DatabaseResult {
    console.log(`Executing fallback SQL: ${query}`, params || []);

    // Convert query to lowercase for easier matching
    const lowerQuery = query.toLowerCase().trim();

    // Simple SQL parser for basic operations
    if (lowerQuery.startsWith('select')) {
      return this.executeFallbackSelect(query, params);
    } else if (lowerQuery.startsWith('insert')) {
      return this.executeFallbackInsert(query, params);
    } else if (lowerQuery.startsWith('update')) {
      return this.executeFallbackUpdate(query, params);
    } else if (lowerQuery.startsWith('delete')) {
      return this.executeFallbackDelete(query, params);
    }

    // For other operations (CREATE, DROP, PRAGMA, etc.), just return success
    return { rowsAffected: 0 };
  }

  private executeFallbackSelect(query: string, params?: any[]): DatabaseResult {
    // Simple SELECT parser - handles basic queries
    const tableMatch = query.match(/FROM\s+(\w+)/i);
    if (!tableMatch) return { rows: [] };

    const tableName = tableMatch[1];
    const rows = this.fallbackStorage[tableName] || [];

    // Apply basic WHERE filtering
    if (params && params.length > 0 && query.includes('WHERE')) {
      // This is a very basic implementation - you may want to enhance it
      const whereMatch = query.match(/WHERE\s+(\w+)\s*=\s*\?/i);
      if (whereMatch) {
        const column = whereMatch[1];
        const value = params[0];
        const filteredRows = rows.filter((row: any) => row[column] === value);
        return { rows: filteredRows };
      }
    }

    return { rows };
  }

  private executeFallbackInsert(query: string, params?: any[]): DatabaseResult {
    const tableMatch = query.match(/INSERT\s+INTO\s+(\w+)/i);
    if (!tableMatch || !params) return { rowsAffected: 0 };

    const tableName = tableMatch[1];
    const columnMatch = query.match(/\(([^)]+)\)/i);

    if (!columnMatch) return { rowsAffected: 0 };

    const columns = columnMatch[1].split(',').map((col: string) => col.trim());
    const rowData: any = {};

    columns.forEach((col: string, index: number) => {
      rowData[col] = params[index];
    });

    // Add ID if not present
    if (!rowData.id) {
      rowData.id = Date.now().toString();
    }

    // Add timestamps
    rowData.created_at = new Date().toISOString();
    rowData.updated_at = new Date().toISOString();

    if (!this.fallbackStorage[tableName]) {
      this.fallbackStorage[tableName] = [];
    }

    this.fallbackStorage[tableName].push(rowData);

    return {
      rowsAffected: 1,
      insertId: parseInt(rowData.id)
    };
  }

  private executeFallbackUpdate(query: string, params?: any[]): DatabaseResult {
    const tableMatch = query.match(/UPDATE\s+(\w+)/i);
    if (!tableMatch || !params) return { rowsAffected: 0 };

    const tableName = tableMatch[1];
    const rows = this.fallbackStorage[tableName] || [];

    // Simple SET clause parsing
    const setMatch = query.match(/SET\s+(.+?)\s+WHERE/i);
    if (!setMatch) return { rowsAffected: 0 };

    const setClause = setMatch[1];
    const assignments = setClause.split(',');

    // Find WHERE condition
    const whereMatch = query.match(/WHERE\s+(.+?)(?:\s+ORDER|$)/i);
    let whereColumn = '';
    let whereValue = '';

    if (whereMatch && params.length > 0) {
      const whereClause = whereMatch[1];
      const whereColumnMatch = whereClause.match(/(\w+)\s*=\s*\?/i);
      if (whereColumnMatch) {
        whereColumn = whereColumnMatch[1];
        whereValue = params[params.length - 1]; // Last param is usually WHERE value
      }
    }

    let rowsAffected = 0;

    for (const row of rows) {
      if (!whereColumn || row[whereColumn] === whereValue) {
        // Apply updates
        assignments.forEach((assignment: string, index: number) => {
          const [column] = assignment.split('=').map((s: string) => s.trim());
          if (index < params.length - 1 || !whereColumn) {
            row[column] = whereColumn ? params[index] : params[index];
          }
        });

        // Update timestamp
        row.updated_at = new Date().toISOString();
        rowsAffected++;
      }
    }

    return { rowsAffected };
  }

  private executeFallbackDelete(query: string, params?: any[]): DatabaseResult {
    const tableMatch = query.match(/DELETE\s+FROM\s+(\w+)/i);
    if (!tableMatch) return { rowsAffected: 0 };

    const tableName = tableMatch[1];
    const rows = this.fallbackStorage[tableName] || [];

    // Check if there's a WHERE clause
    if (!query.includes('WHERE')) {
      // Delete all rows
      const deletedCount = rows.length;
      this.fallbackStorage[tableName] = [];
      return { rowsAffected: deletedCount };
    }

    if (!params) return { rowsAffected: 0 };

    // Find WHERE condition
    const whereMatch = query.match(/WHERE\s+(.+?)(?:\s+ORDER|$)/i);
    if (!whereMatch) return { rowsAffected: 0 };

    const whereClause = whereMatch[1];
    const whereColumnMatch = whereClause.match(/(\w+)\s*=\s*\?/i);

    if (!whereColumnMatch) return { rowsAffected: 0 };

    const whereColumn = whereColumnMatch[1];
    const whereValue = params[0];

    const initialLength = rows.length;
    this.fallbackStorage[tableName] = rows.filter((row: any) => row[whereColumn] !== whereValue);

    return { rowsAffected: initialLength - this.fallbackStorage[tableName].length };
  }

  async transaction<T>(callback: () => Promise<T>): Promise<T> {
    // For fallback storage, just execute the callback
    if (!this.isSQLiteAvailable || !this.database || !this.SQLite) {
      return callback();
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