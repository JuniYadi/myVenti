export const STORAGE_KEYS = {
  USER_PROFILE: '@myventi_user_profile',
  VEHICLES: '@myventi_vehicles',
  SERVICE_RECORDS: '@myventi_service_records',
  FUEL_RECORDS: '@myventi_fuel_records',
  REMINDERS: '@myventi_reminders',
  APP_VERSION: '@myventi_app_version',
  LAST_BACKUP: '@myventi_last_backup',

  // Regional and user preferences
  REGIONAL_SETTINGS: '@myventi_regional_settings',
  NOTIFICATION_PREFERENCES: '@myventi_notification_preferences',
  APP_PREFERENCES: '@myventi_app_preferences'
} as const;

export const STORAGE_LIMITS = {
  MAX_VEHICLES: 5,
  MAX_RECORDS_PER_VEHICLE: 1000,
  MAX_REMINDERS_PER_VEHICLE: 50,
} as const;

export const VALIDATION_LIMITS = {
  VEHICLE_YEAR_MIN: 1900,
  VEHICLE_YEAR_MAX: new Date().getFullYear() + 1,
  LICENSE_PLATE_MIN_LENGTH: 3,
  LICENSE_PLATE_MAX_LENGTH: 20,
  VIN_LENGTH: 17,
  FUEL_AMOUNT_MIN: 0.01,
  FUEL_AMOUNT_MAX: 1000,
  COST_USD_MIN: 0.01,
  COST_USD_MAX: 10000,
  COST_IDR_MIN: 0.01,
  COST_IDR_MAX: 1000000,
  DESCRIPTION_MIN_LENGTH: 5,
  DESCRIPTION_MAX_LENGTH: 500,
  REMINDER_TITLE_MIN_LENGTH: 3,
  REMINDER_TITLE_MAX_LENGTH: 100,
} as const;