# Data Model: MyVenti Vehicle Tracking Application

**Created**: 2025-10-22
**Storage**: AsyncStorage with in-memory state management
**Focus**: UI/UX prototype with dummy data

## Core Entities

### 1. Vehicle

```typescript
interface Vehicle {
  id: string;                    // UUID
  make: string;                  // e.g., "Toyota", "Honda"
  model: string;                 // e.g., "Camry", "Civic"
  year: number;                  // e.g., 2022 (validated: 1900-current year+1)
  vehicleType: VehicleType;      // Motorbike | Car | Truck
  licensePlate: string;          // License plate number
  color: string;                 // Vehicle color
  vin?: string;                  // Vehicle Identification Number (17 chars)
  currentMileage: number;        // Current odometer reading
  mileageUnit: DistanceUnit;     // miles | kilometers
  imageUrl?: string;             // Optional vehicle photo
  isActive: boolean;             // Whether vehicle is in active list
  createdAt: Date;               // When vehicle was added
  updatedAt: Date;               // Last update timestamp
}

enum VehicleType {
  MOTORBIKE = 'motorbike',
  CAR = 'car',
  TRUCK = 'truck'
}

enum DistanceUnit {
  MILES = 'miles',
  KILOMETERS = 'kilometers'
}
```

### 2. Service Record

```typescript
interface ServiceRecord {
  id: string;                    // UUID
  vehicleId: string;             // Foreign key to Vehicle
  serviceDate: Date;             // Date of service
  serviceType: ServiceType;      // Type of service performed
  description: string;           // Detailed description
  mileageAtService: number;      // Odometer reading at service
  mileageUnit: DistanceUnit;     // miles | kilometers
  cost: number;                  // Total cost of service
  currency: Currency;            // USD | IDR
  serviceProvider: string;       // Shop or mechanic name
  location?: string;             // Service location
  notes?: string;                // Additional notes
  nextServiceMileage?: number;   // Recommended next service mileage
  nextServiceDate?: Date;        // Recommended next service date
  createdAt: Date;               // When record was created
  updatedAt: Date;               // Last update timestamp
}

enum ServiceType {
  OIL_CHANGE = 'oil_change',
  TIRE_ROTATION = 'tire_rotation',
  BRAKE_SERVICE = 'brake_service',
  BATTERY_REPLACEMENT = 'battery_replacement',
  TRANSMISSION_SERVICE = 'transmission_service',
  AIR_FILTER = 'air_filter',
  SPARK_PLUGS = 'spark_plugs',
  INSPECTION = 'inspection',
  REPAIR = 'repair',
  MAINTENANCE = 'maintenance',
  OTHER = 'other'
}

enum Currency {
  USD = 'USD',
  IDR = 'IDR'
}
```

### 3. Fuel Record

```typescript
interface FuelRecord {
  id: string;                    // UUID
  vehicleId: string;             // Foreign key to Vehicle
  fillDate: Date;                // Date of fuel purchase
  odometerReading: number;       // Odometer at fill-up
  mileageUnit: DistanceUnit;     // miles | kilometers
  fuelAmount: number;            // Amount of fuel (validated: 0.01-1000)
  fuelUnit: FuelUnit;            // gallons | liters (preserved original)
  costPerUnit: number;           // Price per gallon/liter
  totalCost: number;             // Total cost of fill-up
  currency: Currency;            // USD | IDR (preserved original)
  fuelType: FuelType;            // Type of fuel
  fuelStation?: string;          // Gas station name
  location?: string;             // Location of gas station
  isFullTank: boolean;           // Whether tank was filled completely
  notes?: string;                // Additional notes
  mpg?: number;                  // Calculated miles per gallon
  lph?: number;                  // Calculated liters per 100km
  createdAt: Date;               // When record was created
  updatedAt: Date;               // Last update timestamp
}

enum FuelUnit {
  GALLONS = 'gallons',
  LITERS = 'liters'
}

enum FuelType {
  REGULAR = 'regular',
  PREMIUM = 'premium',
  DIESEL = 'diesel',
  E85 = 'e85',
  ELECTRIC = 'electric',
  OTHER = 'other'
}
```

### 4. Reminder

```typescript
interface Reminder {
  id: string;                    // UUID
  vehicleId: string;             // Foreign key to Vehicle
  title: string;                 // Reminder title
  description: string;           // Detailed description
  reminderType: ReminderType;    // Service | Fuel | Custom
  triggerType: TriggerType;      // Mileage | Date | Both
  targetMileage?: number;        // Target mileage for reminder
  targetDate?: Date;             // Target date for reminder
  isActive: boolean;             // Whether reminder is active
  isCompleted: boolean;          // Whether reminder has been completed
  completedAt?: Date;            // When reminder was completed
  notificationSettings: NotificationSettings;
  createdAt: Date;               // When reminder was created
  updatedAt: Date;               // Last update timestamp
}

enum ReminderType {
  SERVICE = 'service',
  FUEL = 'fuel',
  CUSTOM = 'custom'
}

enum TriggerType {
  MILEAGE = 'mileage',
  DATE = 'date',
  BOTH = 'both'
}

interface NotificationSettings {
  enabled: boolean;
  daysBefore?: number;           // For date-based reminders
  mileageBefore?: number;        // For mileage-based reminders
  frequency: NotificationFrequency;
}

enum NotificationFrequency {
  ONCE = 'once',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly'
}
```

### 5. User Profile

```typescript
interface UserProfile {
  id: string;                    // UUID
  name: string;                  // User's name
  email?: string;                // User's email (optional)
  avatar?: string;               // Profile picture URL
  regionalSettings: RegionalSettings;
  notificationPreferences: NotificationPreferences;
  appPreferences: AppPreferences;
  createdAt: Date;               // When profile was created
  updatedAt: Date;               // Last update timestamp
}

interface RegionalSettings {
  region: Region;                // US | ID
  currency: Currency;            // USD | IDR
  fuelUnit: FuelUnit;            // gallons | liters
  distanceUnit: DistanceUnit;    // miles | kilometers
  dateFormat: string;            // Date format string
  timeFormat: TimeFormat;        // 12h | 24h
  numberFormat: Intl.NumberFormatOptions;
}

enum Region {
  UNITED_STATES = 'US',
  INDONESIA = 'ID'
}

enum TimeFormat {
  H12 = '12h',
  H24 = '24h'
}

interface NotificationPreferences {
  serviceReminders: boolean;
  fuelReminders: boolean;
  generalNotifications: boolean;
  quietHoursStart?: string;      // HH:mm format
  quietHoursEnd?: string;        // HH:mm format
}

interface AppPreferences {
  theme: Theme;                  // Light | Dark | System
  autoBackup: boolean;
  dataRetentionDays: number;     // Days to keep data
  showTips: boolean;
}
```

## Relationships

```
Vehicle (1) ←→ (N) ServiceRecord
Vehicle (1) ←→ (N) FuelRecord
Vehicle (1) ←→ (N) Reminder
UserProfile (1) ←→ (N) Vehicle
```

## Data Validation Rules

### Vehicle Validation
- **make**: Required, min 2 chars, max 50 chars
- **model**: Required, min 2 chars, max 50 chars
- **year**: Required, between 1900 and current year + 1
- **vehicleType**: Required, must be valid enum value
- **licensePlate**: Required, min 3 chars, max 20 chars
- **vin**: Optional, exactly 17 characters if provided
- **currentMileage**: Required, non-negative number

### Service Record Validation
- **serviceDate**: Required, not future date
- **serviceType**: Required, must be valid enum value
- **description**: Required, min 5 chars, max 500 chars
- **mileageAtService**: Required, non-negative number
- **cost**: Required, non-negative number
- **serviceProvider**: Required, min 2 chars, max 100 chars

### Fuel Record Validation
- **fillDate**: Required, not future date
- **odometerReading**: Required, non-negative number
- **fuelAmount**: Required, between 0.01 and 1000
- **costPerUnit**: Required, non-negative number
- **totalCost**: Required, positive number (> 0)
- **fuelType**: Required, must be valid enum value
- **Cost Validation**: USD: 0.01-10000, IDR: 0.01-1000000

### Reminder Validation
- **title**: Required, min 3 chars, max 100 chars
- **description**: Required, min 5 chars, max 500 chars
- **reminderType**: Required, must be valid enum value
- **triggerType**: Required, must be valid enum value
- At least one of targetMileage or targetDate must be provided

## Storage Schema

### AsyncStorage Keys

```typescript
const STORAGE_KEYS = {
  USER_PROFILE: '@myventi_user_profile',
  VEHICLES: '@myventi_vehicles',
  SERVICE_RECORDS: '@myventi_service_records',
  FUEL_RECORDS: '@myventi_fuel_records',
  REMINDERS: '@myventi_reminders',
  APP_VERSION: '@myventi_app_version',
  LAST_BACKUP: '@myventi_last_backup',
} as const;
```

### Data Storage Format

```typescript
interface StorageData {
  [STORAGE_KEYS.USER_PROFILE]: UserProfile;
  [STORAGE_KEYS.VEHICLES]: Vehicle[];
  [STORAGE_KEYS.SERVICE_RECORDS]: ServiceRecord[];
  [STORAGE_KEYS.FUEL_RECORDS]: FuelRecord[];
  [STORAGE_KEYS.REMINDERS]: Reminder[];
  [STORAGE_KEYS.APP_VERSION]: string;
  [STORAGE_KEYS.LAST_BACKUP]: string;
}
```

## Computed Properties

### Fuel Efficiency Calculations

```typescript
interface FuelEfficiency {
  mpg?: number;                  // Miles per gallon
  kmpl?: number;                 // Kilometers per liter
  lph?: number;                  // Liters per 100km
  averageMpg: number;            // Average MPG over time
  averageCostPerMile: number;    // Cost per mile driven
  averageCostPerGallon: number;  // Average cost per gallon
}
```

### Service Statistics

```typescript
interface ServiceStatistics {
  totalServices: number;         // Total number of services
  totalSpent: number;            // Total money spent on services
  averageServiceCost: number;    // Average cost per service
  servicesByType: Record<ServiceType, number>; // Count by type
  lastServiceDate?: Date;        // Most recent service
  nextServiceDue?: Date;         // Next service due date
}
```

### Vehicle Statistics

```typescript
interface VehicleStatistics {
  totalMiles: number;            // Total miles driven
  totalFuelCost: number;         // Total spent on fuel
  totalServiceCost: number;      // Total spent on services
  averageMpg: number;            // Average fuel efficiency
  costPerMile: number;           // Total cost per mile
  ownershipDuration: number;     // Days owned
  servicesPerYear: number;       // Average services per year
}
```

## Migration Strategy

### Version 1.0 Initial Schema
- All core entities defined above
- AsyncStorage with JSON serialization
- Basic validation rules
- Regional support for US and Indonesia
- Single user device model

### Future Migrations (Planned)
- Version 1.1: Add photo attachments for service records
- Version 1.2: Add fuel station details and ratings
- Version 1.3: Add maintenance schedule templates
- Version 2.0: Add cloud sync support

## Data Export Format

```typescript
interface ExportData {
  version: string;
  exportDate: Date;
  userProfile: UserProfile;
  vehicles: Vehicle[];
  serviceRecords: ServiceRecord[];
  fuelRecords: FuelRecord[];
  reminders: Reminder[];
}
```

This data model provides a comprehensive foundation for the MyVenti vehicle tracking application while maintaining simplicity for the UI/UX prototype phase.