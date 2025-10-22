import { DistanceUnit, FuelUnit, Currency } from './service';

export interface UserProfile {
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

export interface RegionalSettings {
  region: Region;                // US | ID
  currency: Currency;            // USD | IDR
  fuelUnit: FuelUnit;            // gallons | liters
  distanceUnit: DistanceUnit;    // miles | kilometers
  dateFormat: string;            // Date format string
  timeFormat: TimeFormat;        // 12h | 24h
  numberFormat: Intl.NumberFormatOptions;
}

export enum Region {
  UNITED_STATES = 'US',
  INDONESIA = 'ID'
}

export enum TimeFormat {
  H12 = '12h',
  H24 = '24h'
}

export interface NotificationPreferences {
  serviceReminders: boolean;
  fuelReminders: boolean;
  generalNotifications: boolean;
  quietHoursStart?: string;      // HH:mm format
  quietHoursEnd?: string;        // HH:mm format
}

export interface AppPreferences {
  theme: Theme;                  // Light | Dark | System
  autoBackup: boolean;
  dataRetentionDays: number;     // Days to keep data
  showTips: boolean;
}

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
  SYSTEM = 'system'
}

export interface Reminder {
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

export enum ReminderType {
  SERVICE = 'service',
  FUEL = 'fuel',
  CUSTOM = 'custom'
}

export enum TriggerType {
  MILEAGE = 'mileage',
  DATE = 'date',
  BOTH = 'both'
}

export interface NotificationSettings {
  enabled: boolean;
  daysBefore?: number;           // For date-based reminders
  mileageBefore?: number;        // For mileage-based reminders
  frequency: NotificationFrequency;
}

export enum NotificationFrequency {
  ONCE = 'once',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly'
}