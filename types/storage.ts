export interface StorageData {
  [STORAGE_KEYS.USER_PROFILE]: UserProfile;
  [STORAGE_KEYS.VEHICLES]: Vehicle[];
  [STORAGE_KEYS.SERVICE_RECORDS]: ServiceRecord[];
  [STORAGE_KEYS.FUEL_RECORDS]: FuelRecord[];
  [STORAGE_KEYS.REMINDERS]: Reminder[];
  [STORAGE_KEYS.APP_VERSION]: string;
  [STORAGE_KEYS.LAST_BACKUP]: string;
}

export const STORAGE_KEYS = {
  USER_PROFILE: '@myventi_user_profile',
  VEHICLES: '@myventi_vehicles',
  SERVICE_RECORDS: '@myventi_service_records',
  FUEL_RECORDS: '@myventi_fuel_records',
  REMINDERS: '@myventi_reminders',
  APP_VERSION: '@myventi_app_version',
  LAST_BACKUP: '@myventi_last_backup',
} as const;

export interface StorageOperation<T> {
  get(): Promise<T | null>;
  set(data: T): Promise<void>;
  update(data: Partial<T>): Promise<void>;
  remove(): Promise<void>;
  clear(): Promise<void>;
}

export interface VehicleStorage extends StorageOperation<Vehicle[]> {
  getVehicle(id: string): Promise<Vehicle | null>;
  getActiveVehicles(): Promise<Vehicle[]>;
  saveVehicle(vehicle: Vehicle): Promise<void>;
  deleteVehicle(id: string): Promise<void>;
}

export interface ServiceStorage extends StorageOperation<ServiceRecord[]> {
  getServicesForVehicle(vehicleId: string): Promise<ServiceRecord[]>;
  saveServiceRecord(service: ServiceRecord): Promise<void>;
  deleteServiceRecord(id: string): Promise<void>;
}

export interface FuelStorage extends StorageOperation<FuelRecord[]> {
  getFuelRecordsForVehicle(vehicleId: string): Promise<FuelRecord[]>;
  saveFuelRecord(fuel: FuelRecord): Promise<void>;
  deleteFuelRecord(id: string): Promise<void>;
}

export interface ReminderStorage extends StorageOperation<Reminder[]> {
  getRemindersForVehicle(vehicleId: string): Promise<Reminder[]>;
  getActiveReminders(): Promise<Reminder[]>;
  saveReminder(reminder: Reminder): Promise<void>;
  deleteReminder(id: string): Promise<void>;
}

export interface UserProfileStorage extends StorageOperation<UserProfile> {
  updateRegionalSettings(settings: Partial<RegionalSettings>): Promise<void>;
  updateNotificationPreferences(preferences: Partial<NotificationPreferences>): Promise<void>;
  updateAppPreferences(preferences: Partial<AppPreferences>): Promise<void>;
}