# Bug - SQLite Expo

```bash
Android Bundled 27ms node_modules/expo-sqlite/build/index.js (1 module)
 LOG  === Module Availability Check ===
 LOG  SQLite: ✅ Available
 LOG  AsyncStorage: ✅ Available
 LOG  ================================
 LOG  === Running Module Tests ===
 LOG  Testing SQLite module...
 LOG  SQLite test successful
 LOG  Testing AsyncStorage module...
 LOG  AsyncStorage test successful
 LOG  SQLite: ✅ PASS
 LOG  AsyncStorage: ✅ PASS
 LOG  ============================
 LOG  SafeAsyncStorage not available, continuing without it
 LOG  Initializing database...
 LOG  SQLite module loaded successfully
 LOG  SQLite database opened successfully
 WARN  Falling back to memory storage due to SQL execution error
 ERROR  SQL execution error: [Error: [execAsync] Cannot convert '[object Object]' to a Kotlin type.] 

Code: DatabaseManager.ts
  213 |
  214 |     try {
> 215 |       const result = await this.database.execAsync([{ args: params || [], sql: query }]);
      |                                                   ^
  216 |
  217 |       // Transform the result to match expected format
  218 |       const transformedResult: DatabaseResult = {
Call Stack
  executeSql (services/DatabaseManager.ts:215:51)
  executeSql (services/DatabaseManager.ts:208:19)
  initDatabase (services/DatabaseManager.ts:64:32)
 LOG  Executing fallback SQL: PRAGMA foreign_keys = ON []
 LOG  Foreign keys enabled successfully
 LOG  Executing fallback SQL: CREATE TABLE IF NOT EXISTS vehicles (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        year INTEGER NOT NULL,
        make TEXT NOT NULL,
        model TEXT NOT NULL,
        type TEXT CHECK(type IN ('gas', 'electric', 'hybrid')) NOT NULL,
        status TEXT CHECK(status IN ('active', 'inactive')) DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) []
 LOG  Executing fallback SQL: CREATE TABLE IF NOT EXISTS fuel_entries (
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
      ) []
 LOG  Executing fallback SQL: CREATE TABLE IF NOT EXISTS service_records (
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
      ) []
 LOG  Executing fallback SQL: CREATE TABLE IF NOT EXISTS app_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) []
 LOG  Executing fallback SQL: CREATE TABLE IF NOT EXISTS migration_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        version TEXT NOT NULL,
        applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        success BOOLEAN NOT NULL
      ) []
 LOG  Executing fallback SQL: CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status) []
 LOG  Executing fallback SQL: CREATE INDEX IF NOT EXISTS idx_vehicles_type ON vehicles(type) []
 LOG  Executing fallback SQL: CREATE INDEX IF NOT EXISTS idx_fuel_vehicle_id ON fuel_entries(vehicle_id) []
 LOG  Executing fallback SQL: CREATE INDEX IF NOT EXISTS idx_fuel_date ON fuel_entries(date) []
 LOG  Executing fallback SQL: CREATE INDEX IF NOT EXISTS idx_fuel_vehicle_date ON fuel_entries(vehicle_id, date) []
 LOG  Executing fallback SQL: CREATE INDEX IF NOT EXISTS idx_fuel_mileage ON fuel_entries(mileage) []
 LOG  Executing fallback SQL: CREATE INDEX IF NOT EXISTS idx_fuel_station ON fuel_entries(fuel_station) []
 LOG  Executing fallback SQL: CREATE INDEX IF NOT EXISTS idx_service_vehicle_id ON service_records(vehicle_id) []
 LOG  Executing fallback SQL: CREATE INDEX IF NOT EXISTS idx_service_date ON service_records(date) []
 LOG  Executing fallback SQL: CREATE INDEX IF NOT EXISTS idx_service_vehicle_date ON service_records(vehicle_id, date) []
 LOG  Executing fallback SQL: CREATE INDEX IF NOT EXISTS idx_service_type ON service_records(type) []
 LOG  Executing fallback SQL: INSERT OR IGNORE INTO app_settings (key, value) VALUES (?, ?) ["region", "ID"]
 ERROR  Query: PRAGMA foreign_keys = ON 

Code: DatabaseManager.ts
  233 |     } catch (error) {
  234 |       console.error('SQL execution error:', error);
> 235 |       console.error('Query:', query);
      |                    ^
  236 |       console.error('Params:', params || 'undefined');
  237 |       // If SQL execution fails, fall back to memory storage
  238 |       console.warn('Falling back to memory storage due to SQL execution error');
Call Stack
  executeSql (services/DatabaseManager.ts:235:20)
 LOG  Executing fallback SQL: INSERT OR IGNORE INTO app_settings (key, value) VALUES (?, ?) ["theme_mode", "system"]
 LOG  Database initialized successfully
 LOG  Executing fallback SQL: SELECT 1 FROM migration_log WHERE version = ? AND success = 1 ["1.0.0"]
 LOG  Starting migration from AsyncStorage to SQLite...
 LOG  Executing fallback SQL: SELECT 1 FROM migration_log WHERE version = ? AND success = 1 ["1.0.0"]
 LOG  Creating AsyncStorage backup...
 LOG  Initializing AsyncStorage...
 LOG  AsyncStorage initialized successfully
 ERROR  Params: undefined 

Code: DatabaseManager.ts
  234 |       console.error('SQL execution error:', error);
  235 |       console.error('Query:', query);
> 236 |       console.error('Params:', params || 'undefined');
      |                    ^
  237 |       // If SQL execution fails, fall back to memory storage
  238 |       console.warn('Falling back to memory storage due to SQL execution error');
  239 |       this.isSQLiteAvailable = false;
Call Stack
  executeSql (services/DatabaseManager.ts:236:20)
 LOG  Backup created successfully
 LOG  Migrating 0 vehicles...
 LOG  Migrating 0 fuel entries...
 LOG  Migrating 0 service records...
 LOG  Migrating app settings...
 LOG  Executing fallback SQL: INSERT INTO migration_log (version, success) VALUES (?, ?) ["1.0.0", 1]
 LOG  Verifying migration...
 LOG  Executing fallback SQL: SELECT COUNT(*) as count FROM vehicles []
 LOG  Executing fallback SQL: SELECT COUNT(*) as count FROM fuel_entries []
 LOG  Executing fallback SQL: SELECT COUNT(*) as count FROM service_records []
 LOG  Migration verification successful
 LOG  Migration completed successfully
 LOG  Backup cleared from AsyncStorage
 LOG  Executing fallback SQL: SELECT value FROM app_settings WHERE key = ? ["region"]
 LOG  Auth state changed: No user
 LOG  Executing fallback SQL: SELECT value FROM app_settings WHERE key = ? ["theme_mode"]
 LOG  Executing fallback SQL: SELECT COUNT(*) as total, SUM(CASE WHEN status = "active" THEN 1 ELSE 0 END) as active FROM vehicles []
 LOG  Executing fallback SQL: SELECT COALESCE(SUM(amount), 0) as total FROM fuel_entries WHERE date >= date("now", "start of month") []
 LOG  Executing fallback SQL: SELECT id, amount, created_at
           FROM fuel_entries
           ORDER BY created_at DESC
           LIMIT 5 []
 LOG  Executing fallback SQL: SELECT id, type, cost, created_at
           FROM service_records
           ORDER BY created_at DESC
           LIMIT 5 []
 LOG  Auth initialization timeout - setting loading to false


```