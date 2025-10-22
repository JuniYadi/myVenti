export const NAVIGATION_CONFIG = {
  TABS: {
    VEHICLES: 'vehicles',
    SERVICES: 'services',
    FUEL: 'fuel',
    SETTINGS: 'settings',
  },
  SCREENS: {
    VEHICLE_DETAIL: 'vehicle/[id]',
    VEHICLE_ADD: 'vehicle/add',
    VEHICLE_EDIT: 'vehicle/edit/[id]',
    SERVICE_DETAIL: 'service/[id]',
    SERVICE_ADD: 'service/add',
    SERVICE_EDIT: 'service/edit/[id]',
    FUEL_DETAIL: 'fuel/[id]',
    FUEL_ADD: 'fuel/add',
    FUEL_EDIT: 'fuel/edit/[id]',
    FUEL_STATISTICS: 'fuel/statistics',
    SETTINGS_REGIONAL: 'settings/regional',
    SETTINGS_NOTIFICATIONS: 'settings/notifications',
  },
} as const;

export const TAB_ICONS = {
  VEHICLES: {
    focused: 'car',
    unfocused: 'car-outline',
  },
  SERVICES: {
    focused: 'build',
    unfocused: 'build-outline',
  },
  FUEL: {
    focused: 'gas-station',
    unfocused: 'gas-station-outline',
  },
  SETTINGS: {
    focused: 'settings',
    unfocused: 'settings-outline',
  },
} as const;

export const ANIMATION_CONFIG = {
  DURATION: {
    SHORT: 200,
    MEDIUM: 300,
    LONG: 500,
  },
  EASING: {
    EASE_IN: 'easeIn',
    EASE_OUT: 'easeOut',
    EASE_IN_OUT: 'easeInOut',
  },
} as const;