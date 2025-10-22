# API Contracts: MyVenti Vehicle Tracking Application

**Created**: 2025-10-22
**Type**: Internal API contracts for data operations
**Storage**: AsyncStorage-based operations

## Contract Overview

Since this is a local-only application using AsyncStorage, these contracts define the internal data operations that replace traditional API endpoints. All operations return Promises and follow consistent error handling patterns.

## Base Types

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

interface PaginatedResponse<T> extends ApiResponse<{
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}> {}

interface FilterOptions {
  vehicleId?: string;
  startDate?: string;
  endDate?: string;
  type?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface PaginationOptions {
  page?: number;
  limit?: number;
}
```

## Vehicle Management Contracts

### GET /vehicles
```typescript
interface GetVehiclesRequest {
  includeInactive?: boolean;
  pagination?: PaginationOptions;
}

interface GetVehiclesResponse {
  vehicles: Vehicle[];
  total: number;
  activeCount: number;
  inactiveCount: number;
}
```

### GET /vehicles/:id
```typescript
interface GetVehicleRequest {
  id: string;
  includeStatistics?: boolean;
}

interface GetVehicleResponse {
  vehicle: Vehicle;
  statistics?: VehicleStatistics;
}
```

### POST /vehicles
```typescript
interface CreateVehicleRequest {
  make: string;
  model: string;
  year: number;
  vehicleType: VehicleType;
  licensePlate: string;
  color?: string;
  vin?: string;
  currentMileage: number;
  mileageUnit: DistanceUnit;
  imageUrl?: string;
}

interface CreateVehicleResponse {
  vehicle: Vehicle;
  success: boolean;
}
```

### PUT /vehicles/:id
```typescript
interface UpdateVehicleRequest {
  id: string;
  updates: Partial<{
    make: string;
    model: string;
    year: number;
    vehicleType: VehicleType;
    licensePlate: string;
    color: string;
    vin: string;
    currentMileage: number;
    mileageUnit: DistanceUnit;
    imageUrl: string;
  }>;
}

interface UpdateVehicleResponse {
  vehicle: Vehicle;
  success: boolean;
}
```

### DELETE /vehicles/:id
```typescript
interface DeleteVehicleRequest {
  id: string;
  preserveData?: boolean; // Default: true
}

interface DeleteVehicleResponse {
  success: boolean;
  preservedDataCount: {
    serviceRecords: number;
    fuelRecords: number;
    reminders: number;
  };
}
```

## Service Record Contracts

### GET /vehicles/:vehicleId/services
```typescript
interface GetServiceRecordsRequest {
  vehicleId?: string;
  filters?: FilterOptions & {
    serviceType?: ServiceType;
    serviceProvider?: string;
    minCost?: number;
    maxCost?: number;
  };
  pagination?: PaginationOptions;
}

interface GetServiceRecordsResponse {
  serviceRecords: ServiceRecord[];
  total: number;
  statistics: ServiceStatistics;
}
```

### POST /vehicles/:vehicleId/services
```typescript
interface CreateServiceRecordRequest {
  vehicleId: string;
  serviceDate: string;
  serviceType: ServiceType;
  description: string;
  mileageAtService: number;
  mileageUnit: DistanceUnit;
  cost: number;
  currency: Currency;
  serviceProvider: string;
  location?: string;
  notes?: string;
  nextServiceMileage?: number;
  nextServiceDate?: string;
}

interface CreateServiceRecordResponse {
  serviceRecord: ServiceRecord;
  success: boolean;
}
```

### PUT /services/:id
```typescript
interface UpdateServiceRecordRequest {
  id: string;
  updates: Partial<{
    serviceDate: string;
    serviceType: ServiceType;
    description: string;
    mileageAtService: number;
    mileageUnit: DistanceUnit;
    cost: number;
    currency: Currency;
    serviceProvider: string;
    location: string;
    notes: string;
    nextServiceMileage: number;
    nextServiceDate: string;
  }>;
}

interface UpdateServiceRecordResponse {
  serviceRecord: ServiceRecord;
  success: boolean;
}
```

### DELETE /services/:id
```typescript
interface DeleteServiceRecordRequest {
  id: string;
}

interface DeleteServiceRecordResponse {
  success: boolean;
}
```

## Fuel Record Contracts

### GET /vehicles/:vehicleId/fuel
```typescript
interface GetFuelRecordsRequest {
  vehicleId?: string;
  filters?: FilterOptions & {
    fuelType?: FuelType;
    fuelStation?: string;
    minCost?: number;
    maxCost?: number;
    isFullTank?: boolean;
  };
  pagination?: PaginationOptions;
}

interface GetFuelRecordsResponse {
  fuelRecords: FuelRecord[];
  total: number;
  statistics: {
    totalSpent: number;
    totalFuel: number;
    averageCostPerUnit: number;
    averageEfficiency: {
      mpg: number;
      kmpl: number;
      lph: number;
    };
  };
}
```

### POST /vehicles/:vehicleId/fuel
```typescript
interface CreateFuelRecordRequest {
  vehicleId: string;
  fillDate: string;
  odometerReading: number;
  mileageUnit: DistanceUnit;
  fuelAmount: number;
  fuelUnit: FuelUnit;
  costPerUnit: number;
  totalCost: number;
  currency: Currency;
  fuelType: FuelType;
  fuelStation?: string;
  location?: string;
  isFullTank: boolean;
  notes?: string;
}

interface CreateFuelRecordResponse {
  fuelRecord: FuelRecord;
  success: boolean;
  calculatedEfficiency?: {
    mpg: number;
    kmpl: number;
    lph: number;
  };
}
```

### PUT /fuel/:id
```typescript
interface UpdateFuelRecordRequest {
  id: string;
  updates: Partial<{
    fillDate: string;
    odometerReading: number;
    mileageUnit: DistanceUnit;
    fuelAmount: number;
    fuelUnit: FuelUnit;
    costPerUnit: number;
    totalCost: number;
    currency: Currency;
    fuelType: FuelType;
    fuelStation: string;
    location: string;
    isFullTank: boolean;
    notes: string;
  }>;
}

interface UpdateFuelRecordResponse {
  fuelRecord: FuelRecord;
  success: boolean;
}
```

### DELETE /fuel/:id
```typescript
interface DeleteFuelRecordRequest {
  id: string;
}

interface DeleteFuelRecordResponse {
  success: boolean;
}
```

## Reminder Contracts

### GET /reminders
```typescript
interface GetRemindersRequest {
  vehicleId?: string;
  includeCompleted?: boolean;
  filters?: FilterOptions & {
    reminderType?: ReminderType;
    triggerType?: TriggerType;
    isDue?: boolean;
  };
  pagination?: PaginationOptions;
}

interface GetRemindersResponse {
  reminders: Reminder[];
  total: number;
  dueCount: number;
}
```

### POST /reminders
```typescript
interface CreateReminderRequest {
  vehicleId?: string;
  title: string;
  description: string;
  reminderType: ReminderType;
  triggerType: TriggerType;
  targetMileage?: number;
  targetDate?: string;
  notificationSettings: NotificationSettings;
}

interface CreateReminderResponse {
  reminder: Reminder;
  success: boolean;
}
```

### PUT /reminders/:id
```typescript
interface UpdateReminderRequest {
  id: string;
  updates: Partial<{
    title: string;
    description: string;
    reminderType: ReminderType;
    triggerType: TriggerType;
    targetMileage: number;
    targetDate: string;
    isActive: boolean;
    notificationSettings: NotificationSettings;
  }>;
}

interface UpdateReminderResponse {
  reminder: Reminder;
  success: boolean;
}
```

### POST /reminders/:id/complete
```typescript
interface CompleteReminderRequest {
  id: string;
  completionNotes?: string;
}

interface CompleteReminderResponse {
  reminder: Reminder;
  success: boolean;
}
```

### DELETE /reminders/:id
```typescript
interface DeleteReminderRequest {
  id: string;
}

interface DeleteReminderResponse {
  success: boolean;
}
```

## User Profile Contracts

### GET /profile
```typescript
interface GetProfileResponse {
  profile: UserProfile;
  success: boolean;
}
```

### PUT /profile
```typescript
interface UpdateProfileRequest {
  updates: Partial<{
    name: string;
    email: string;
    avatar: string;
    regionalSettings: Partial<RegionalSettings>;
    notificationPreferences: Partial<NotificationPreferences>;
    appPreferences: Partial<AppPreferences>;
  }>;
}

interface UpdateProfileResponse {
  profile: UserProfile;
  success: boolean;
}
```

### PUT /profile/regional-settings
```typescript
interface UpdateRegionalSettingsRequest {
  region: Region;
  currency: Currency;
  fuelUnit: FuelUnit;
  distanceUnit: DistanceUnit;
  dateFormat: string;
  timeFormat: TimeFormat;
}

interface UpdateRegionalSettingsResponse {
  profile: UserProfile;
  success: boolean;
  conversionNotes?: string; // Note about unit conversions
}
```

## Statistics Contracts

### GET /statistics/vehicle/:id
```typescript
interface GetVehicleStatisticsRequest {
  vehicleId: string;
  dateRange?: {
    startDate: string;
    endDate: string;
  };
}

interface GetVehicleStatisticsResponse {
  vehicleId: string;
  statistics: VehicleStatistics;
  serviceStats: ServiceStatistics;
  fuelStats: {
    totalRecords: number;
    totalSpent: number;
    totalFuel: number;
    averageEfficiency: {
      mpg: number;
      kmpl: number;
      lph: number;
    };
    costPerMile: number;
    trends: Array<{
      date: string;
      efficiency: number;
      cost: number;
    }>;
  };
}
```

### GET /statistics/overview
```typescript
interface GetOverviewStatisticsRequest {
  dateRange?: {
    startDate: string;
    endDate: string;
  };
}

interface GetOverviewStatisticsResponse {
  totalVehicles: number;
  activeVehicles: number;
  totalMiles: number;
  totalFuelCost: number;
  totalServiceCost: number;
  averageMpg: number;
  recentServices: ServiceRecord[];
  upcomingReminders: Reminder[];
  fuelTrends: Array<{
    month: string;
    cost: number;
    volume: number;
  }>;
}
```

## Data Export Contracts

### POST /export
```typescript
interface ExportDataRequest {
  format: 'json' | 'csv';
  include?: {
    vehicles?: boolean;
    serviceRecords?: boolean;
    fuelRecords?: boolean;
    reminders?: boolean;
    profile?: boolean;
  };
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  vehicleIds?: string[];
}

interface ExportDataResponse {
  downloadUrl: string; // For local file access
  filename: string;
  format: string;
  size: number;
  recordCounts: {
    vehicles: number;
    serviceRecords: number;
    fuelRecords: number;
    reminders: number;
  };
  success: boolean;
}
```

### GET /export/status/:exportId
```typescript
interface GetExportStatusResponse {
  exportId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  error?: string;
  downloadUrl?: string;
}
```

## Search Contracts

### GET /search
```typescript
interface SearchRequest {
  query: string;
  type?: 'vehicles' | 'services' | 'fuel' | 'all';
  vehicleId?: string;
  filters?: FilterOptions;
  pagination?: PaginationOptions;
}

interface SearchResponse {
  results: {
    vehicles: Vehicle[];
    services: ServiceRecord[];
    fuel: FuelRecord[];
    reminders: Reminder[];
  };
  total: number;
  query: string;
  searchTime: number;
}
```

## Error Response Contracts

```typescript
interface ErrorResponse {
  success: false;
  error: string;
  code: string;
  details?: Record<string, any>;
  timestamp: string;
  path?: string;
}

enum ErrorCodes {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  DUPLICATE_ENTRY = 'DUPLICATE_ENTRY',
  STORAGE_ERROR = 'STORAGE_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  PERMISSION_ERROR = 'PERMISSION_ERROR',
  CONCURRENT_MODIFICATION = 'CONCURRENT_MODIFICATION'
}
```

## Operation Contracts

### Data Sync Operations
```typescript
interface SyncOperation {
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
  entityType: 'vehicle' | 'service' | 'fuel' | 'reminder';
  entityId: string;
  data?: any;
  timestamp: string;
}

interface QueueSyncRequest {
  operations: SyncOperation[];
}

interface QueueSyncResponse {
  queued: number;
  failed: number;
  success: boolean;
}
```

### Batch Operations
```typescript
interface BatchDeleteRequest {
  entityType: 'service' | 'fuel' | 'reminder';
  entityIds: string[];
  confirm?: boolean;
}

interface BatchDeleteResponse {
  deleted: number;
  failed: number;
  success: boolean;
}
```

## Internal Implementation Notes

1. **Error Handling**: All operations should use consistent error responses with appropriate error codes
2. **Validation**: Input validation should be performed before any storage operations
3. **Performance**: Use AsyncStorage's `multiGet` and `multiSet` for batch operations
4. **Atomicity**: Critical operations should be atomic where possible
5. **Caching**: Implement in-memory caching for frequently accessed data
6. **Sync**: Queue operations when offline and sync when connectivity restored

These contracts provide a clear interface for the internal data operations that power the MyVenti application, ensuring consistency and maintainability across the codebase.